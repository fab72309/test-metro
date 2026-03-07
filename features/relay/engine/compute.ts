import {
  type TypeTuyau,
  pertesDeChargeTable,
} from '@/constants/pertesDeChargeTable';
import { buildAbaqueData } from './abaque';
import { clampMin, floorHoses, roundPressureDoctrine, roundTo } from './rounding';
import type {
  PertesDeChargeTableType,
  RelayComputationV2,
  RelayEngineModelV2,
  RelayPumpOverrideV2,
  RelayPumpPlanV2,
  RelayScenarioV2,
  RelayWarning,
} from './types';

const EPSILON = 0.0001;

type LossEntry = {
  flow: number;
  loss20m: number;
};

const WORK_RATE_TARGETS = {
  h1_2: { min: 0.7, max: 0.8, target: 0.75 },
  h4_6: { min: 0.5, max: 0.6, target: 0.55 },
};

const DEFAULT_APPROX_SPACING_M = 480;

function pushWarning(warnings: RelayWarning[], warning: RelayWarning) {
  if (warnings.some((item) => item.code === warning.code && item.message === warning.message)) return;
  warnings.push(warning);
}

function getLossEntries(table: Record<number, number | null | undefined>): LossEntry[] {
  return Object.entries(table)
    .map(([flow, loss]) => ({ flow: Number(flow), loss20m: loss }))
    .filter((entry): entry is LossEntry => Number.isFinite(entry.flow) && typeof entry.loss20m === 'number')
    .sort((a, b) => a.flow - b.flow);
}

function lossByQ2(base: LossEntry, flowLpm: number): number {
  const coef = base.loss20m / (base.flow * base.flow);
  return coef * flowLpm * flowLpm;
}

function interpolateLoss(lower: LossEntry, upper: LossEntry, flowLpm: number): number {
  const lowerCoef = lower.loss20m / (lower.flow * lower.flow);
  const upperCoef = upper.loss20m / (upper.flow * upper.flow);
  const ratio = (flowLpm - lower.flow) / (upper.flow - lower.flow);
  const coef = lowerCoef + ratio * (upperCoef - lowerCoef);
  return coef * flowLpm * flowLpm;
}

function resolveHoseType(
  diameterMm: number,
  hoseLengthM: 20 | 40,
  tableSource: PertesDeChargeTableType
): TypeTuyau | null {
  const direct = `${diameterMm}x${hoseLengthM}` as TypeTuyau;
  if (tableSource[direct]) return direct;

  const fallback20 = `${diameterMm}x20` as TypeTuyau;
  if (tableSource[fallback20]) return fallback20;

  return null;
}

function getLossPerHose(
  flowLpm: number,
  diameterMm: number,
  hoseLengthM: 20 | 40,
  tableOverride?: PertesDeChargeTableType
): number {
  const tableSource = tableOverride ?? pertesDeChargeTable;
  const hoseType = resolveHoseType(diameterMm, hoseLengthM, tableSource);
  if (!hoseType) return 0;
  const table = tableSource[hoseType];
  if (!table) return 0;

  const entries = getLossEntries(table);
  if (entries.length === 0) return 0;

  const exact = entries.find((entry) => entry.flow === flowLpm);
  if (exact) return exact.loss20m;

  if (flowLpm <= entries[0].flow) return lossByQ2(entries[0], flowLpm);

  const last = entries[entries.length - 1];
  if (flowLpm >= last.flow) return lossByQ2(last, flowLpm);

  for (let idx = 0; idx < entries.length - 1; idx += 1) {
    const lower = entries[idx];
    const upper = entries[idx + 1];
    if (flowLpm > lower.flow && flowLpm < upper.flow) {
      return interpolateLoss(lower, upper, flowLpm);
    }
  }

  return lossByQ2(last, flowLpm);
}

function getEnabledEngineModel(
  selectedId: string,
  engineCatalog: RelayEngineModelV2[]
): RelayEngineModelV2 {
  const enabled = engineCatalog.filter((model) => model.enabled);
  const fallback = enabled[0] ?? engineCatalog[0];
  return enabled.find((model) => model.id === selectedId) ?? fallback;
}

function computeRecommendedPumpCount(
  scenario: RelayScenarioV2,
  demandFlowLpm: number,
  pressureNeededFromPumpsBar: number,
  totalLengthM: number,
  model: RelayEngineModelV2,
  warnings: RelayWarning[]
): { count: number; workRate: number } {
  if (pressureNeededFromPumpsBar <= EPSILON) {
    return { count: 0, workRate: 0 };
  }

  if (demandFlowLpm > model.nominalFlowLpm + EPSILON) {
    pushWarning(warnings, {
      code: 'flow_above_nominal',
      message: `Débit demandé supérieur au nominal du modèle (${model.nominalFlowLpm} L/min).`,
      level: 'blocking',
    });
  }

  if (scenario.method === 'approximation') {
    const count = Math.max(1, Math.ceil(totalLengthM / DEFAULT_APPROX_SPACING_M));
    const workRate = pressureNeededFromPumpsBar / (count * model.nominalPressureBar);
    return { count, workRate };
  }

  const maxPumps = Math.max(1, Math.round(scenario.maxPumps));

  for (let count = 1; count <= maxPumps; count += 1) {
    const workRate = pressureNeededFromPumpsBar / (count * model.nominalPressureBar);
    if (workRate <= 1 + EPSILON) {
      return { count, workRate };
    }
  }

  const maxedWorkRate = pressureNeededFromPumpsBar / (maxPumps * model.nominalPressureBar);
  pushWarning(warnings, {
    code: 'max_pumps_reached',
    message: `Le maximum de ${maxPumps} pompes ne suffit pas pour respecter le %W recommandé.`,
    level: 'blocking',
  });

  return { count: maxPumps, workRate: maxedWorkRate };
}

function sourceChecks(scenario: RelayScenarioV2, demandFlowLpm: number, warnings: RelayWarning[]) {
  const { source } = scenario;

  if (source.pressureEffectiveBar < -EPSILON) {
    pushWarning(warnings, {
      code: 'source_pressure_negative',
      message: 'La pression source effective doit être >= 0 bar.',
      level: 'blocking',
    });
  }

  if (source.mode === 'pi_direct') {
    if (!source.qMaxPiLpm || source.qMaxPiLpm <= 0) {
      pushWarning(warnings, {
        code: 'pi_qmax_missing',
        message: 'Qmax PI requis en mode alimentation directe.',
        level: 'blocking',
      });
    } else if (source.qMaxPiLpm + EPSILON < demandFlowLpm) {
      pushWarning(warnings, {
        code: 'pi_qmax_insufficient',
        message: `Qmax PI (${source.qMaxPiLpm} L/min) inférieur au débit demandé.`,
        level: 'blocking',
      });
    }

    if (source.qAt1BarLpm !== null && source.qAt1BarLpm !== undefined && source.qAt1BarLpm > 0) {
      if (source.qAt1BarLpm + EPSILON < demandFlowLpm) {
        pushWarning(warnings, {
          code: 'pi_q1bar_low',
          message: `Q PI à 1 bar (${source.qAt1BarLpm} L/min) inférieur au débit demandé.`,
          level: 'warning',
        });
      }
    }
  }

  if (source.mode === 'pi_with_engine') {
    if (source.pStaticBar === null || source.pStaticBar === undefined) {
      pushWarning(warnings, {
        code: 'pstatic_missing',
        message: 'Pstatique requise en mode alimentation avec engin sur PI.',
        level: 'blocking',
      });
    }
  }

  if (source.mode === 'aspiration') {
    if (source.aspirationHeightM === null || source.aspirationHeightM === undefined) {
      pushWarning(warnings, {
        code: 'aspiration_height_missing',
        message: 'Hauteur d’aspiration requise.',
        level: 'blocking',
      });
    } else if (source.aspirationHeightM > 7) {
      pushWarning(warnings, {
        code: 'aspiration_height_high',
        message: 'Hauteur d’aspiration élevée (> 7 m).',
        level: 'warning',
      });
    }

    const hasReserveVolume = Number.isFinite(source.reserveVolumeM3 as number) && (source.reserveVolumeM3 as number) > 0;
    const hasReserveLabel = Boolean(source.reserveLabel && source.reserveLabel.trim().length > 0);

    if (!hasReserveVolume && !hasReserveLabel) {
      pushWarning(warnings, {
        code: 'reserve_missing',
        message: 'Volume/réserve d’eau à préciser en aspiration.',
        level: 'warning',
      });
    }
  }
}

export function computeRelay(
  scenario: RelayScenarioV2,
  engineCatalog: RelayEngineModelV2[],
  tableOverride?: PertesDeChargeTableType,
  overrides: RelayPumpOverrideV2[] = scenario.pumpOverrides
): RelayComputationV2 {
  const warnings: RelayWarning[] = [];
  const model = getEnabledEngineModel(scenario.selectedEngineModelId, engineCatalog);
  const demandFlowLpm = roundTo(
    Math.max(0, scenario.lineCount) * Math.max(0, scenario.flowPerLineLpm),
    2
  );
  const lineFlowLpm = roundTo(Math.max(0, scenario.flowPerLineLpm), 2);

  const totalLengthFromSegmentsM = scenario.segments.reduce((sum, segment) => sum + Math.max(0, segment.lengthM), 0);
  const totalLengthM = Math.max(
    0,
    Number.isFinite(scenario.establishmentLengthM) ? scenario.establishmentLengthM : totalLengthFromSegmentsM
  );
  const totalElevationM = scenario.segments.reduce((sum, segment) => sum + segment.elevationM, 0);
  const totalLengthHm = totalLengthM / 100;

  const lossPer20mHoseBar = getLossPerHose(lineFlowLpm, scenario.diameterMm, 20, tableOverride);
  const lossPer40mHoseBar = getLossPerHose(lineFlowLpm, scenario.diameterMm, 40, tableOverride);
  const selectedLossPerHoseBar = scenario.hoseLengthM === 20 ? lossPer20mHoseBar : lossPer40mHoseBar;

  let lineLossBarRaw = 0;
  if (scenario.useCustomHoseMix) {
    const customHoseCount20 = Math.max(0, Math.round(scenario.customHoseCount20));
    const customHoseCount40 = Math.max(0, Math.round(scenario.customHoseCount40));
    lineLossBarRaw = customHoseCount20 * lossPer20mHoseBar + customHoseCount40 * lossPer40mHoseBar;

    const coveredLengthM = customHoseCount20 * 20 + customHoseCount40 * 40;
    if (coveredLengthM + EPSILON < totalLengthM) {
      pushWarning(warnings, {
        code: 'custom_hose_length_insufficient',
        message: `Longueur couverte (${roundTo(coveredLengthM, 1)} m) inférieure à l’établissement (${roundTo(totalLengthM, 1)} m).`,
        level: 'warning',
      });
    }
  } else {
    const hoseCount = totalLengthM <= EPSILON ? 0 : Math.ceil(totalLengthM / scenario.hoseLengthM);
    lineLossBarRaw = hoseCount * selectedLossPerHoseBar;
  }

  const lineLossBar = roundTo(lineLossBarRaw, 2);
  const jLossBarPerHm = totalLengthHm > EPSILON ? roundTo(lineLossBarRaw / totalLengthHm, 2) : 0;
  const elevationLossBar = roundTo(totalElevationM / 10, 2);
  const totalLossBar = roundTo(lineLossBar + elevationLossBar, 2);
  const prefTotalBar = roundTo(scenario.targetOutletBar + totalLossBar, 2);

  sourceChecks(scenario, demandFlowLpm, warnings);

  const pressureSourceBar = clampMin(scenario.source.pressureEffectiveBar, 0);
  const pressureNeededFromPumpsBar = roundTo(Math.max(0, prefTotalBar - pressureSourceBar), 2);

  const relayNeeded = pressureNeededFromPumpsBar > EPSILON;

  const { count: pumpCount, workRate: rawWorkRate } = computeRecommendedPumpCount(
    scenario,
    demandFlowLpm,
    pressureNeededFromPumpsBar,
    totalLengthM,
    model,
    warnings
  );

  const workRate = roundTo(rawWorkRate, 4);
  const workTarget = WORK_RATE_TARGETS[scenario.missionDuration];

  if (pumpCount > 0 && workRate > workTarget.max + EPSILON) {
    pushWarning(warnings, {
      code: 'work_rate_above_target',
      message: `Le %W (${roundTo(workRate * 100, 1)}%) dépasse la plage recommandée.`,
      level: 'warning',
    });
  }

  if (pumpCount > 0 && workRate < workTarget.min - EPSILON) {
    pushWarning(warnings, {
      code: 'work_rate_below_target',
      message: `Le %W (${roundTo(workRate * 100, 1)}%) est sous la plage recommandée (marge élevée).`,
      level: 'info',
    });
  }

  const recommendedBarRaw = pumpCount > 0
    ? model.nominalPressureBar * workRate + scenario.pressureMarginBar
    : 0;
  const recommendedBar = roundPressureDoctrine(clampMin(recommendedBarRaw, 0));

  if (recommendedBar > model.maxPressureBar + EPSILON) {
    pushWarning(warnings, {
      code: 'recommended_pressure_above_max',
      message: `Consigne recommandée (${recommendedBar} bar) > pression max modèle (${model.maxPressureBar} bar).`,
      level: 'blocking',
    });
  }

  const jmoyBarPerHm = totalLengthHm > EPSILON ? roundTo(totalLossBar / totalLengthHm, 4) : 0;

  let baseSpacingM = DEFAULT_APPROX_SPACING_M;
  if (scenario.method !== 'approximation') {
    if (jmoyBarPerHm > EPSILON) {
      baseSpacingM = (recommendedBar / jmoyBarPerHm) * 100;
    } else {
      baseSpacingM = totalLengthM > EPSILON ? totalLengthM : DEFAULT_APPROX_SPACING_M;
    }
  }

  const spacingAdjustmentM = scenario.spacingAdjustmentHoses * scenario.hoseLengthM;
  const adjustedSpacingM = Math.max(scenario.hoseLengthM, roundTo(baseSpacingM + spacingAdjustmentM, 2));

  const overrideMap = new Map<number, RelayPumpOverrideV2>(
    overrides.map((override) => [override.index, override])
  );

  const pumps: RelayPumpPlanV2[] = [];
  const positionsM: number[] = [];

  for (let idx = 0; idx < pumpCount; idx += 1) {
    const positionM = Math.min(roundTo(idx * adjustedSpacingM, 2), totalLengthM);
    positionsM.push(positionM);
  }

  let pressureAtCurrentPoint = pressureSourceBar;

  for (let idx = 0; idx < pumpCount; idx += 1) {
    const index = idx + 1;
    const override = overrideMap.get(index);
    const setpointBar = clampMin(override?.setpointBar ?? recommendedBar, 0);
    const flowLpm = clampMin(override?.flowLpm ?? demandFlowLpm, 0);

    if (setpointBar > model.maxPressureBar + EPSILON) {
      pushWarning(warnings, {
        code: `pump_${index}_setpoint_above_max`,
        message: `Pompe ${index}: consigne ${setpointBar} bar > max ${model.maxPressureBar} bar.`,
        level: 'blocking',
      });
    }

    if (flowLpm > model.nominalFlowLpm + EPSILON) {
      pushWarning(warnings, {
        code: `pump_${index}_flow_above_nominal`,
        message: `Pompe ${index}: débit ${flowLpm} L/min > nominal ${model.nominalFlowLpm} L/min.`,
        level: 'warning',
      });
    }

    const inletBar = roundTo(pressureAtCurrentPoint, 2);
    const outletBar = roundTo(Math.max(setpointBar, inletBar), 2);

    pumps.push({
      index,
      engineModelId: override?.engineModelId ?? model.id,
      setpointBar,
      recommendedBar,
      flowLpm,
      inletBar,
      outletBar,
      positionM: positionsM[idx],
      positionHoses: floorHoses(positionsM[idx], scenario.hoseLengthM),
      isOverride: Boolean(override),
    });

    const nextPositionM = idx < positionsM.length - 1 ? positionsM[idx + 1] : totalLengthM;
    const segmentHm = Math.max(0, nextPositionM - positionsM[idx]) / 100;
    const segmentLossBar = jmoyBarPerHm * segmentHm;
    pressureAtCurrentPoint = outletBar - segmentLossBar;
  }

  let outputPressureBar: number;

  if (pumpCount === 0) {
    outputPressureBar = roundTo(pressureSourceBar - totalLossBar, 2);
  } else {
    const lastPump = pumps[pumps.length - 1];
    const remainingHm = Math.max(0, totalLengthM - lastPump.positionM) / 100;
    outputPressureBar = roundTo(lastPump.outletBar - jmoyBarPerHm * remainingHm, 2);
  }

  if (outputPressureBar + EPSILON < scenario.targetOutletBar) {
    pushWarning(warnings, {
      code: 'output_below_target',
      message: 'Pression de sortie calculée sous la cible.',
      level: 'warning',
    });
  }

  const outputFlowLpm = pumps.length > 0
    ? Math.min(demandFlowLpm, ...pumps.map((pump) => pump.flowLpm))
    : demandFlowLpm;

  const schema = [
    {
      id: 'source',
      label: 'Source',
      positionM: 0,
      distanceFromPrevM: 0,
    },
    ...pumps.map((pump, idx) => ({
      id: `pump-${pump.index}`,
      label: `P${pump.index}`,
      positionM: pump.positionM,
      distanceFromPrevM: idx === 0 ? pump.positionM : roundTo(pump.positionM - pumps[idx - 1].positionM, 2),
    })),
    {
      id: 'target',
      label: 'Pt à alim',
      positionM: totalLengthM,
      distanceFromPrevM:
        pumps.length > 0
          ? roundTo(totalLengthM - pumps[pumps.length - 1].positionM, 2)
          : totalLengthM,
    },
  ];

  const abaque = buildAbaqueData(totalLengthM, jmoyBarPerHm, scenario.targetOutletBar, pumps);

  return {
    demandFlowLpm,
    lineLossBar,
    jLossBarPerHm,
    elevationLossBar,
    totalLossBar,
    prefTotalBar,
    pressureNeededFromPumpsBar,
    pressureSourceBar,
    jmoyBarPerHm,
    workRate,
    pumpCount,
    relayNeeded,
    outputPressureBar,
    outputFlowLpm,
    pumpModel: model,
    pumps,
    warnings,
    schema,
    abaque,
    recommendedSpacingM: adjustedSpacingM,
  };
}
