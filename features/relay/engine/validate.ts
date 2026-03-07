import type {
  RelayEngineModelV2,
  RelayScenarioV2,
  RelaySupplyMode,
  RelayWarning,
} from './types';

export function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.trim().replace(',', '.');
  if (normalized.length === 0) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export type RelayScenarioErrors = Record<string, string>;

export function validateEngineCatalog(catalog: RelayEngineModelV2[]): {
  isValid: boolean;
  errors: RelayScenarioErrors;
} {
  const errors: RelayScenarioErrors = {};

  if (!Array.isArray(catalog) || catalog.length === 0) {
    errors.catalog = 'Le catalogue d’engins est vide.';
    return { isValid: false, errors };
  }

  const enabled = catalog.filter((item) => item.enabled);
  if (enabled.length === 0) {
    errors.catalogEnabled = 'Au moins un engin actif est requis.';
  }

  catalog.forEach((model, idx) => {
    const base = `catalog.${idx}`;
    if (!model.label || model.label.trim().length === 0) {
      errors[`${base}.label`] = 'Nom requis';
    }
    if (!Number.isFinite(model.nominalFlowLpm) || model.nominalFlowLpm <= 0) {
      errors[`${base}.nominalFlowLpm`] = 'Débit nominal > 0 requis';
    }
    if (!Number.isFinite(model.nominalPressureBar) || model.nominalPressureBar <= 0) {
      errors[`${base}.nominalPressureBar`] = 'Pression nominale > 0 requise';
    }
    if (!Number.isFinite(model.maxPressureBar) || model.maxPressureBar <= 0) {
      errors[`${base}.maxPressureBar`] = 'Pression max > 0 requise';
    }
    if (model.maxPressureBar + 0.001 < model.nominalPressureBar) {
      errors[`${base}.maxVsNominal`] = 'Pression max < pression nominale';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

function validateSupplyModeRequirements(
  mode: RelaySupplyMode,
  scenario: RelayScenarioV2,
  errors: RelayScenarioErrors,
  warnings: RelayWarning[]
) {
  const { source } = scenario;
  const demandFlowLpm = Math.max(0, scenario.lineCount) * Math.max(0, scenario.flowPerLineLpm);

  if (source.pressureEffectiveBar < 0) {
    errors['source.pressureEffectiveBar'] = 'Pression source >= 0 requise';
  }

  if (mode === 'pi_direct') {
    if (source.qMaxPiLpm === null || source.qMaxPiLpm === undefined || source.qMaxPiLpm <= 0) {
      errors['source.qMaxPiLpm'] = 'Qmax PI requis';
    }
    if (source.qAt1BarLpm === null || source.qAt1BarLpm === undefined || source.qAt1BarLpm <= 0) {
      errors['source.qAt1BarLpm'] = 'Q PI à 1 bar requis';
    }
    if (source.qMaxPiLpm && source.qMaxPiLpm < demandFlowLpm) {
      warnings.push({
        code: 'pi_qmax_low',
        message: 'Qmax PI inférieur au débit demandé.',
        level: 'blocking',
      });
    }
  }

  if (mode === 'pi_with_engine') {
    if (source.pStaticBar === null || source.pStaticBar === undefined) {
      errors['source.pStaticBar'] = 'Pstatique requise';
    }
  }

  if (mode === 'aspiration') {
    if (source.aspirationHeightM === null || source.aspirationHeightM === undefined) {
      errors['source.aspirationHeightM'] = 'Hauteur d’aspiration requise';
    }
    const hasReserve =
      (source.reserveVolumeM3 !== null && source.reserveVolumeM3 !== undefined && source.reserveVolumeM3 > 0) ||
      (source.reserveLabel && source.reserveLabel.trim().length > 0);
    if (!hasReserve) {
      warnings.push({
        code: 'aspiration_reserve_missing',
        message: 'Réserve d’eau non renseignée en aspiration.',
        level: 'warning',
      });
    }
  }
}

export function validateRelayScenario(
  scenario: RelayScenarioV2,
  engineCatalog: RelayEngineModelV2[]
): {
  isValid: boolean;
  errors: RelayScenarioErrors;
  warnings: RelayWarning[];
} {
  const errors: RelayScenarioErrors = {};
  const warnings: RelayWarning[] = [];

  if (!Array.isArray(scenario.segments) || scenario.segments.length === 0) {
    errors.segments = 'Au moins un tronçon est requis';
  } else {
    scenario.segments.forEach((segment, idx) => {
      if (!Number.isFinite(segment.lengthM) || segment.lengthM <= 0) {
        errors[`segments.${idx}.lengthM`] = 'Longueur > 0 requise';
      }
      if (!Number.isFinite(segment.elevationM)) {
        errors[`segments.${idx}.elevationM`] = 'Dénivelé invalide';
      }
    });
  }

  if (!Number.isFinite(scenario.lineCount) || scenario.lineCount < 1) {
    errors.lineCount = 'Nombre de lignes >= 1 requis';
  }

  if (!Number.isFinite(scenario.flowPerLineLpm) || scenario.flowPerLineLpm <= 0) {
    errors.flowPerLineLpm = 'Q par ligne > 0 requis';
  }

  if (scenario.hoseLengthM !== 20 && scenario.hoseLengthM !== 40) {
    errors.hoseLengthM = 'Longueur de tuyau invalide (20 ou 40m)';
  }

  if (!Number.isFinite(scenario.customHoseCount20) || scenario.customHoseCount20 < 0) {
    errors.customHoseCount20 = 'Nombre de tuyaux 20m invalide';
  }

  if (!Number.isFinite(scenario.customHoseCount40) || scenario.customHoseCount40 < 0) {
    errors.customHoseCount40 = 'Nombre de tuyaux 40m invalide';
  }

  if (scenario.useCustomHoseMix) {
    const totalCustom = Math.round(scenario.customHoseCount20) + Math.round(scenario.customHoseCount40);
    if (totalCustom <= 0) {
      errors.customHoseMix = 'Au moins un tuyau (20m ou 40m) est requis en mode personnalisé';
    }
  }

  if (!Number.isFinite(scenario.targetOutletBar) || scenario.targetOutletBar < 0) {
    errors.targetOutletBar = 'Pression cible >= 0 requise';
  }

  if (!Number.isFinite(scenario.workRatePercent) || scenario.workRatePercent <= 0 || scenario.workRatePercent > 100) {
    errors.workRatePercent = '%W doit être compris entre 1 et 100';
  } else {
    const isMissionShort = scenario.missionDuration === 'h1_2';
    const minRecommended = isMissionShort ? 70 : 50;
    const maxRecommended = isMissionShort ? 80 : 60;
    if (scenario.workRatePercent < minRecommended || scenario.workRatePercent > maxRecommended) {
      warnings.push({
        code: 'work_rate_out_of_recommended_range',
        message: `%W hors plage recommandée (${minRecommended}-${maxRecommended}%) pour la durée de mission.`,
        level: 'warning',
      });
    }
  }

  if (scenario.diameterMm !== 70 && scenario.diameterMm !== 110) {
    errors.diameterMm = 'Diamètre invalide';
  }

  if (!Number.isFinite(scenario.maxPumps) || scenario.maxPumps < 1) {
    errors.maxPumps = 'Max pompes >= 1 requis';
  }

  if (!Number.isFinite(scenario.spacingAdjustmentHoses)) {
    errors.spacingAdjustmentHoses = 'Ajustement d’espacement invalide';
  }

  if (!Number.isFinite(scenario.pressureMarginBar) || scenario.pressureMarginBar < 0) {
    errors.pressureMarginBar = 'Marge de pression >= 0 requise';
  }

  const selected = engineCatalog.find((model) => model.id === scenario.selectedEngineModelId && model.enabled);
  if (!selected) {
    errors.selectedEngineModelId = 'Engin de référence invalide';
  }

  validateSupplyModeRequirements(scenario.source.mode, scenario, errors, warnings);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}
