import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { usePertesDeChargeTable } from '@/context/PertesDeChargeTableContext';
import { useThemeContext } from '@/context/ThemeContext';
import { computeRelay } from '@/features/relay/engine/compute';
import type { RelayMissionDuration, RelaySupplyMode, RelayWarning } from '@/features/relay/engine/types';
import { parseNumber, validateRelayScenario } from '@/features/relay/engine/validate';
import { useEngineCatalogStore } from '@/features/relay/store/engineCatalogStore';
import { useRelayStore } from '@/features/relay/store/relayStore';
import { RelayAbaqueCard } from '@/features/relay/ui/RelayAbaqueCard';
import { RelayMeansPlacementModal } from '@/features/relay/ui/RelayMeansPlacementModal';
import { RelaySegmentsEditor } from '@/features/relay/ui/RelaySegmentsEditor';
import type { RelayDistributionEngine } from '@/features/relay/ui/RelayMeansDistributionBoard';
import {
  buildRelaySegmentOperationalSummaries,
  RELAY_MIN_INLET_BAR,
  type RelayAssignedMeanSummary,
  type RelaySegmentOperationalSummary,
} from '@/features/relay/ui/relayOperational';
import { formatNumber } from '@/utils/format';

const keyboardTypeDec = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'decimal-pad';

function truncateLabels(labels: string[], limit = 3) {
  if (labels.length <= limit) return labels.join(', ');
  return `${labels.slice(0, limit).join(', ')} +${labels.length - limit}`;
}

function WarningList({ title, warnings }: { title: string; warnings: RelayWarning[] }) {
  if (warnings.length === 0) return null;

  return (
    <Card style={styles.section}>
      <Title>{title}</Title>
      {warnings.map((warning, idx) => (
        <Caption
          key={`${warning.code}-${idx}`}
          style={{
            color: warning.level === 'blocking' ? '#D32F2F' : warning.level === 'warning' ? '#F57C00' : '#1976D2',
          }}
        >
          • {warning.message}
        </Caption>
      ))}
    </Card>
  );
}

function CollapsibleCalcDetails({
  title,
  expanded,
  onToggle,
  leadingAction,
  compact,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  leadingAction?: React.ReactNode;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.calcDetailsWrap, compact && styles.calcDetailsWrapCompact]}>
      <View style={[styles.calcDetailsHeaderRow, compact && styles.calcDetailsHeaderRowCompact]}>
        {leadingAction ? <View style={styles.calcDetailsLeadingAction}>{leadingAction}</View> : null}
        <Button
          title={expanded ? `Masquer ${title}` : `Voir ${title}`}
          variant="outline"
          size="sm"
          style={compact ? { ...styles.calcDetailsToggle, ...styles.calcDetailsToggleCompact } : styles.calcDetailsToggle}
          onPress={onToggle}
        />
      </View>
      {expanded ? <View style={styles.calcDetailsBody}>{children}</View> : null}
    </View>
  );
}

export default function RelayScreen() {
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const { width } = useWindowDimensions();
  const isCompactLayout = width < 680;
  const [phase3PlacementVisible, setPhase3PlacementVisible] = useState(false);
  const [placementSegmentId, setPlacementSegmentId] = useState<string | null>(null);
  const [engineListExpanded, setEngineListExpanded] = useState(true);
  const [phase1CalcExpanded, setPhase1CalcExpanded] = useState(false);
  const [phase2CalcExpanded, setPhase2CalcExpanded] = useState(false);
  const [segmentEngineAssignments, setSegmentEngineAssignments] = useState<Record<string, string[]>>({});
  const [phase1CalculatedSnapshot, setPhase1CalculatedSnapshot] = useState<{
    key: string;
    demandFlowLpm: number;
    lineCount: number;
    flowPerLineLpm: number;
    hoseSummary: string;
    jTotalBar: number;
    jhmBar: number;
    zTotalBar: number;
    targetOutletBar: number;
    requiredRefoulementBar: number;
    sourceContributionBar: number;
    residualPressureNeedBar: number;
    totalLengthM: number;
    totalElevationM: number;
  } | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const { table: pertesDeChargeTable, loading: pertesLoading } = usePertesDeChargeTable();

  const {
    scenario,
    loading,
    updateScenario,
    updateSource,
    setSegments,
    addSegment,
    removeSegment,
    updateSegment,
  } = useRelayStore();

  const { models: engineCatalog, loading: engineCatalogLoading } = useEngineCatalogStore();

  const validation = useMemo(
    () => validateRelayScenario(scenario, engineCatalog),
    [scenario, engineCatalog]
  );

  const computation = useMemo(() => {
    if (engineCatalogLoading || pertesLoading) return null;
    return computeRelay(scenario, engineCatalog, pertesDeChargeTable);
  }, [engineCatalog, engineCatalogLoading, pertesDeChargeTable, pertesLoading, scenario]);

  const segmentsTotalLengthM = useMemo(
    () => scenario.segments.reduce((sum, segment) => sum + Math.max(0, segment.lengthM), 0),
    [scenario.segments]
  );
  const totalLengthM = useMemo(
    () =>
      Number.isFinite(scenario.establishmentLengthM) && scenario.establishmentLengthM > 0
        ? scenario.establishmentLengthM
        : segmentsTotalLengthM,
    [scenario.establishmentLengthM, segmentsTotalLengthM]
  );
  const totalElevationM = useMemo(
    () => scenario.segments.reduce((sum, segment) => sum + segment.elevationM, 0),
    [scenario.segments]
  );
  const remainingLengthM = useMemo(
    () => Math.round((totalLengthM - segmentsTotalLengthM) * 100) / 100,
    [segmentsTotalLengthM, totalLengthM]
  );
  const lineFlowM3h = useMemo(() => scenario.flowPerLineLpm * 0.06, [scenario.flowPerLineLpm]);
  const demandFlowLpm = useMemo(
    () => scenario.lineCount * scenario.flowPerLineLpm,
    [scenario.flowPerLineLpm, scenario.lineCount]
  );
  const autoHoseCount = useMemo(
    () => (scenario.hoseLengthM > 0 && totalLengthM > 0 ? Math.ceil(totalLengthM / scenario.hoseLengthM) : 0),
    [scenario.hoseLengthM, totalLengthM]
  );
  const customHoseCount20 = useMemo(
    () => Math.max(0, Math.round(scenario.customHoseCount20)),
    [scenario.customHoseCount20]
  );
  const customHoseCount40 = useMemo(
    () => Math.max(0, Math.round(scenario.customHoseCount40)),
    [scenario.customHoseCount40]
  );
  const customHoseTotalCount = useMemo(
    () => customHoseCount20 + customHoseCount40,
    [customHoseCount20, customHoseCount40]
  );
  const customCoveredLengthM = useMemo(
    () => customHoseCount20 * 20 + customHoseCount40 * 40,
    [customHoseCount20, customHoseCount40]
  );
  const slopePercent = useMemo(
    () => (totalLengthM > 0 ? (totalElevationM / totalLengthM) * 100 : 0),
    [totalElevationM, totalLengthM]
  );
  const pressureTotalNoElevation = useMemo(() => {
    const lineLoss = computation?.lineLossBar ?? 0;
    return lineLoss + scenario.targetOutletBar;
  }, [computation?.lineLossBar, scenario.targetOutletBar]);
  const requiredRefoulementBar = useMemo(
    () => computation?.prefTotalBar ?? pressureTotalNoElevation,
    [computation?.prefTotalBar, pressureTotalNoElevation]
  );
  const sourceContributionBar = useMemo(
    () => computation?.pressureSourceBar ?? Math.max(0, scenario.source.pressureEffectiveBar),
    [computation?.pressureSourceBar, scenario.source.pressureEffectiveBar]
  );
  const residualPressureNeedBar = useMemo(
    () => computation?.pressureNeededFromPumpsBar ?? Math.max(0, requiredRefoulementBar - sourceContributionBar),
    [computation?.pressureNeededFromPumpsBar, requiredRefoulementBar, sourceContributionBar]
  );
  const missionWorkRateRange = useMemo(
    () => (scenario.missionDuration === 'h1_2' ? { min: 70, max: 80 } : { min: 50, max: 60 }),
    [scenario.missionDuration]
  );
  const missionWorkRateOptions = useMemo(
    () => (scenario.missionDuration === 'h1_2' ? [70, 75, 80] : [50, 55, 60]),
    [scenario.missionDuration]
  );
  const availableEngineModels = useMemo(
    () => engineCatalog.filter((model) => model.enabled),
    [engineCatalog]
  );
  const totalAvailableEngineCount = useMemo(
    () =>
      availableEngineModels.reduce(
        (sum, model) => sum + Math.max(0, Math.round(scenario.availableEngineCounts[model.id] ?? 0)),
        0
      ),
    [availableEngineModels, scenario.availableEngineCounts]
  );
  const totalAvailablePressureBar = useMemo(
    () =>
      availableEngineModels.reduce((sum, model) => {
        const count = Math.max(0, Math.round(scenario.availableEngineCounts[model.id] ?? 0));
        return sum + count * model.nominalPressureBar * (scenario.workRatePercent / 100);
      }, 0),
    [availableEngineModels, scenario.availableEngineCounts, scenario.workRatePercent]
  );
  const availablePressureDeltaBar = useMemo(
    () => totalAvailablePressureBar - residualPressureNeedBar,
    [residualPressureNeedBar, totalAvailablePressureBar]
  );
  const isAvailablePressureSufficient = availablePressureDeltaBar >= -0.01;
  const workRateRatio = scenario.workRatePercent / 100;
  const selectedEngines = useMemo(
    () =>
      availableEngineModels
        .map((model) => ({
          model,
          count: Math.max(0, Math.round(scenario.availableEngineCounts[model.id] ?? 0)),
        }))
        .filter((entry) => entry.count > 0),
    [availableEngineModels, scenario.availableEngineCounts]
  );
  const selectedEngineInstances = useMemo<RelayDistributionEngine[]>(() => {
    const instances: RelayDistributionEngine[] = [];
    availableEngineModels.forEach((model) => {
      const count = Math.max(0, Math.round(scenario.availableEngineCounts[model.id] ?? 0));
      for (let index = 0; index < count; index += 1) {
        instances.push({
          instanceId: `${model.id}__${index + 1}`,
          label: count > 1 ? `${model.label} #${index + 1}` : model.label,
          nominalFlowLpm: model.nominalFlowLpm,
          nominalPressureBar: model.nominalPressureBar,
          positionM: 0,
        });
      }
    });
    return instances;
  }, [availableEngineModels, scenario.availableEngineCounts]);
  const selectedEngineById = useMemo(() => {
    const next: Record<string, RelayDistributionEngine> = {};
    selectedEngineInstances.forEach((engine) => {
      next[engine.instanceId] = engine;
    });
    return next;
  }, [selectedEngineInstances]);
  const jBarPerHmForPlacement = useMemo(
    () => computation?.jLossBarPerHm ?? (totalLengthM > 0 ? ((computation?.lineLossBar ?? 0) / totalLengthM) * 100 : 0),
    [computation?.jLossBarPerHm, computation?.lineLossBar, totalLengthM]
  );
  const assignedMeansBySegment = useMemo(() => {
    const next: Record<string, RelayAssignedMeanSummary[]> = {};
    scenario.segments.forEach((segment) => {
      const assignedIds = segmentEngineAssignments[segment.id] ?? [];
      next[segment.id] = assignedIds
        .map((instanceId) => {
          const engine = selectedEngineById[instanceId];
          if (!engine) return null;
          const appliedPressureBar = engine.nominalPressureBar * workRateRatio;
          return {
            instanceId,
            label: engine.label,
            nominalFlowLpm: engine.nominalFlowLpm,
            nominalPressureBar: engine.nominalPressureBar,
            appliedPressureBar,
          };
        })
        .filter((item): item is RelayAssignedMeanSummary => Boolean(item));
    });
    return next;
  }, [scenario.segments, segmentEngineAssignments, selectedEngineById, workRateRatio]);
  const segmentOperationalSummaries = useMemo(
    () =>
      buildRelaySegmentOperationalSummaries({
        segments: scenario.segments,
        assignedMeansBySegment,
        hoseLengthM: scenario.hoseLengthM,
        jBarPerHm: jBarPerHmForPlacement,
        targetOutletBar: scenario.targetOutletBar,
        demandFlowLpm,
        minInletBar: RELAY_MIN_INLET_BAR,
      }),
    [
      assignedMeansBySegment,
      demandFlowLpm,
      jBarPerHmForPlacement,
      scenario.hoseLengthM,
      scenario.segments,
      scenario.targetOutletBar,
    ]
  );
  const segmentOperationalById = useMemo(() => {
    const next: Record<string, RelaySegmentOperationalSummary> = {};
    segmentOperationalSummaries.forEach((summary) => {
      next[summary.segmentId] = summary;
    });
    return next;
  }, [segmentOperationalSummaries]);
  const assignedEngineIds = useMemo(() => {
    const used = new Set<string>();
    Object.values(segmentEngineAssignments).forEach((instanceIds) => {
      instanceIds.forEach((instanceId) => used.add(instanceId));
    });
    return used;
  }, [segmentEngineAssignments]);
  const reserveEngineInstances = useMemo(
    () => selectedEngineInstances.filter((engine) => !assignedEngineIds.has(engine.instanceId)),
    [assignedEngineIds, selectedEngineInstances]
  );

  useEffect(() => {
    setSegmentEngineAssignments((prev) => {
      const validSegmentIds = new Set(scenario.segments.map((segment) => segment.id));
      const validEngineIds = new Set(selectedEngineInstances.map((engine) => engine.instanceId));
      const usedEngines = new Set<string>();
      const next: Record<string, string[]> = {};

      scenario.segments.forEach((segment) => {
        const current = prev[segment.id] ?? [];
        const kept: string[] = [];
        current.forEach((instanceId) => {
          if (!validEngineIds.has(instanceId) || usedEngines.has(instanceId)) return;
          kept.push(instanceId);
          usedEngines.add(instanceId);
        });
        if (kept.length > 0) {
          next[segment.id] = kept;
        }
      });

      const prevKeys = Object.keys(prev).filter(
        (segmentId) => validSegmentIds.has(segmentId) && (prev[segmentId]?.length ?? 0) > 0
      );
      const nextKeys = Object.keys(next);
      const unchanged =
        prevKeys.length === nextKeys.length &&
        nextKeys.every((segmentId) => {
          const prevList = prev[segmentId] ?? [];
          const nextList = next[segmentId] ?? [];
          return (
            prevList.length === nextList.length &&
            nextList.every((instanceId, index) => prevList[index] === instanceId)
          );
        });

      return unchanged ? prev : next;
    });
  }, [scenario.segments, selectedEngineInstances]);

  const setMissionDuration = (duration: RelayMissionDuration) => {
    const options = duration === 'h1_2' ? [70, 75, 80] : [50, 55, 60];
    const roundedCurrent = Math.round(scenario.workRatePercent);
    const nextWorkRate = options.includes(roundedCurrent) ? roundedCurrent : options[1];
    updateScenario({ missionDuration: duration, workRatePercent: nextWorkRate });
  };

  const getDraftValue = (key: string, fallback: string) =>
    Object.prototype.hasOwnProperty.call(draftValues, key) ? draftValues[key] : fallback;

  const setDraftValue = (key: string, value: string) => {
    setDraftValues((prev) => ({ ...prev, [key]: value }));
  };

  const clearDraftValue = (key: string) => {
    setDraftValues((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, key)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleRequiredDraftInput = (
    key: string,
    raw: string,
    updater: (num: number) => void,
    opts: { min?: number } = {}
  ) => {
    setDraftValue(key, raw);
    const parsed = parseNumber(raw);
    if (parsed === null) return;
    if (opts.min !== undefined && parsed < opts.min) return;
    updater(parsed);
  };

  const handleOptionalDraftInput = (
    key: string,
    raw: string,
    updater: (num: number | null) => void,
    opts: { min?: number } = {}
  ) => {
    setDraftValue(key, raw);
    if (raw.trim() === '') {
      updater(null);
      return;
    }
    const parsed = parseNumber(raw);
    if (parsed === null) return;
    if (opts.min !== undefined && parsed < opts.min) return;
    updater(parsed);
  };

  const commitRequiredDraft = (
    key: string,
    updater: (num: number) => void,
    opts: { min?: number } = {}
  ) => {
    if (!Object.prototype.hasOwnProperty.call(draftValues, key)) return;
    const raw = draftValues[key];
    const parsed = parseNumber(raw);
    if (parsed === null) {
      clearDraftValue(key);
      return;
    }
    if (opts.min !== undefined && parsed < opts.min) {
      clearDraftValue(key);
      return;
    }
    updater(parsed);
    clearDraftValue(key);
  };

  const commitOptionalDraft = (
    key: string,
    updater: (num: number | null) => void,
    opts: { min?: number } = {}
  ) => {
    if (!Object.prototype.hasOwnProperty.call(draftValues, key)) return;
    const raw = draftValues[key];
    if (raw.trim() === '') {
      updater(null);
      clearDraftValue(key);
      return;
    }
    const parsed = parseNumber(raw);
    if (parsed === null) {
      clearDraftValue(key);
      return;
    }
    if (opts.min !== undefined && parsed < opts.min) {
      clearDraftValue(key);
      return;
    }
    updater(parsed);
    clearDraftValue(key);
  };

  const setAvailableEngineCount = (engineModelId: string, nextCount: number) => {
    const sanitized = Math.max(0, Math.round(nextCount));
    const nextMap = { ...(scenario.availableEngineCounts ?? {}) };
    if (sanitized <= 0) {
      delete nextMap[engineModelId];
    } else {
      nextMap[engineModelId] = sanitized;
    }
    updateScenario({ availableEngineCounts: nextMap });
  };

  const assignEngineToSegment = (segmentId: string, instanceId: string) => {
    setSegmentEngineAssignments((prev) => {
      const next: Record<string, string[]> = {};
      let changed = false;

      Object.entries(prev).forEach(([currentSegmentId, instanceIds]) => {
        const filtered = instanceIds.filter((id) => id !== instanceId);
        if (filtered.length > 0) {
          next[currentSegmentId] = filtered;
        }
        if (filtered.length !== instanceIds.length) {
          changed = true;
        }
      });

      const currentTarget = next[segmentId] ?? [];
      if (!currentTarget.includes(instanceId)) {
        next[segmentId] = [...currentTarget, instanceId];
        changed = true;
      }

      return changed ? next : prev;
    });
  };

  const removeEngineFromSegment = (segmentId: string, instanceId: string) => {
    setSegmentEngineAssignments((prev) => {
      const current = prev[segmentId] ?? [];
      if (!current.includes(instanceId)) return prev;
      const nextSegmentList = current.filter((id) => id !== instanceId);
      const next = { ...prev };
      if (nextSegmentList.length === 0) {
        delete next[segmentId];
      } else {
        next[segmentId] = nextSegmentList;
      }
      return next;
    });
  };

  const openPlacementForSegment = (segmentId: string | null = null) => {
    setPlacementSegmentId(segmentId);
    setPhase3PlacementVisible(true);
  };

  const stepField = (
    current: number,
    step: number,
    updater: (num: number) => void,
    opts: { min?: number } = {}
  ) => {
    const next = current + step;
    if (opts.min !== undefined && next < opts.min) {
      updater(opts.min);
      return;
    }
    updater(next);
  };

  const roundTwo = (value: number) => Math.round(value * 100) / 100;

  const updateSegmentTotal = (field: 'lengthM' | 'elevationM', rawTotal: number) => {
    if (scenario.segments.length === 0) return;
    const total = field === 'lengthM' ? Math.max(0, rawTotal) : rawTotal;
    const weights = scenario.segments.map((segment) => Math.max(0, segment.lengthM));
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    const useEqualSplit = weightSum <= 0;
    let assigned = 0;

    const updatedSegments = scenario.segments.map((segment, index) => {
      const isLast = index === scenario.segments.length - 1;
      let value: number;

      if (isLast) {
        value = roundTwo(total - assigned);
      } else if (useEqualSplit) {
        value = roundTwo(total / scenario.segments.length);
      } else {
        value = roundTwo(total * (weights[index] / weightSum));
      }

      assigned += value;
      return {
        ...segment,
        [field]: value,
      };
    });

    setSegments(updatedSegments);
  };

  if (loading || engineCatalogLoading || pertesLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
        <Body style={{ textAlign: 'center', color: palette.secondaryText }}>Chargement...</Body>
      </SafeAreaView>
    );
  }

  const sourceModeLabels: Record<RelaySupplyMode, string> = {
    pi_direct: 'PI direct',
    pi_with_engine: 'Engin sur PI',
    aspiration: 'Aspiration',
  };

  const formWarnings = validation.warnings;
  const effectiveJTotalBar = computation?.lineLossBar ?? 0;
  const effectiveJhmBar = jBarPerHmForPlacement;
  const effectiveZTotalBar = computation?.elevationLossBar ?? totalElevationM / 10;
  const relayNeeded = computation?.relayNeeded ?? residualPressureNeedBar > 0.01;
  const phase1HoseSummary = scenario.useCustomHoseMix
    ? `${customHoseCount40} x 40 m + ${customHoseCount20} x 20 m`
    : `${autoHoseCount} x ${scenario.hoseLengthM} m (arrondi sup.)`;
  const phase1CalcKey = JSON.stringify({
    lineCount: scenario.lineCount,
    flowPerLineLpm: scenario.flowPerLineLpm,
    hoseLengthM: scenario.hoseLengthM,
    useCustomHoseMix: scenario.useCustomHoseMix,
    customHoseCount20,
    customHoseCount40,
    totalLengthM: roundTwo(totalLengthM),
    totalElevationM: roundTwo(totalElevationM),
    diameterMm: scenario.diameterMm,
    targetOutletBar: scenario.targetOutletBar,
    jTotalBar: roundTwo(effectiveJTotalBar),
    jhmBar: roundTwo(effectiveJhmBar),
    zTotalBar: roundTwo(effectiveZTotalBar),
    requiredRefoulementBar: roundTwo(requiredRefoulementBar),
    sourceContributionBar: roundTwo(sourceContributionBar),
    residualPressureNeedBar: roundTwo(residualPressureNeedBar),
  });
  const phase1CalcIsCurrent = phase1CalculatedSnapshot?.key === phase1CalcKey;
  const phase1Display = phase1CalculatedSnapshot;

  const runPhase1Calculation = () => {
    setPhase1CalculatedSnapshot({
      key: phase1CalcKey,
      demandFlowLpm,
      lineCount: scenario.lineCount,
      flowPerLineLpm: scenario.flowPerLineLpm,
      hoseSummary: phase1HoseSummary,
      jTotalBar: effectiveJTotalBar,
      jhmBar: effectiveJhmBar,
      zTotalBar: effectiveZTotalBar,
      targetOutletBar: scenario.targetOutletBar,
      requiredRefoulementBar,
      sourceContributionBar,
      residualPressureNeedBar,
      totalLengthM,
      totalElevationM,
    });
  };
  const processWarnings = (() => {
    const warnings: RelayWarning[] = [];
    const pushWarning = (code: string, message: string, level: RelayWarning['level']) => {
      if (warnings.some((warning) => warning.code === code && warning.message === message)) return;
      warnings.push({ code, message, level });
    };

    if (!phase1Display) {
      pushWarning(
        'phase1_pending',
        'Phase 1 non figée: appuyer sur "Calculer" pour valider le besoin hydraulique.',
        'info'
      );
    } else if (!phase1CalcIsCurrent) {
      pushWarning(
        'phase1_stale',
        'Les données ont changé depuis le dernier calcul de phase 1. Recalcul requis avant engagement.',
        'warning'
      );
    }

    if (
      scenario.source.mode === 'pi_direct' &&
      scenario.source.qAt1BarLpm !== null &&
      scenario.source.qAt1BarLpm !== undefined &&
      scenario.source.qAt1BarLpm > 0 &&
      scenario.source.qAt1BarLpm < demandFlowLpm
    ) {
      pushWarning(
        'pi_q1bar_low_process',
        `Q PI à 1 bar (${formatNumber(scenario.source.qAt1BarLpm)} L/min) inférieur au débit relais demandé.`,
        'warning'
      );
    }

    if ((scenario.source.aspirationHeightM ?? 0) > 7) {
      pushWarning(
        'aspiration_height_high_process',
        `Hauteur d’aspiration élevée (${formatNumber(scenario.source.aspirationHeightM ?? 0)} m).`,
        'warning'
      );
    }

    if (relayNeeded) {
      if (totalAvailableEngineCount <= 0) {
        pushWarning(
          'phase2_no_engines',
          'Aucun engin sélectionné en phase 2 pour couvrir le besoin résiduel.',
          'blocking'
        );
      } else if (!isAvailablePressureSufficient) {
        pushWarning(
          'phase2_pressure_insufficient',
          `Phase 2 insuffisante: ${formatNumber(totalAvailablePressureBar)} bar disponibles pour ${formatNumber(residualPressureNeedBar)} bar requis.`,
          'blocking'
        );
      }
    } else {
      pushWarning(
        'relay_not_required',
        `L’apport source couvre le besoin hydraulique (${formatNumber(sourceContributionBar)} bar pris en compte).`,
        'info'
      );
    }

    if (remainingLengthM > 0.01) {
      pushWarning(
        'phase3_length_remaining',
        `Répartition incomplète: ${formatNumber(remainingLengthM)} m restent à ventiler en tronçons.`,
        'warning'
      );
    } else if (remainingLengthM < -0.01) {
      pushWarning(
        'phase3_length_excess',
        `Longueur de tronçons supérieure de ${formatNumber(Math.abs(remainingLengthM))} m à la longueur à traiter.`,
        'warning'
      );
    }

    const unassignedSegments = segmentOperationalSummaries
      .filter((summary) => summary.assignedMeans.length === 0)
      .map((summary) => summary.label);

    if (relayNeeded && unassignedSegments.length > 0) {
      pushWarning(
        'phase3_unassigned_segments',
        `Moyens non affectés sur: ${truncateLabels(unassignedSegments)}.`,
        'warning'
      );
    }

    const overloadedSegments = segmentOperationalSummaries.filter(
      (summary) => summary.assignedMeans.length > 0 && !summary.isCovered
    );

    if (overloadedSegments.length > 0) {
      if (overloadedSegments.length === 1) {
        const summary = overloadedSegments[0];
        pushWarning(
          'phase3_segment_underpowered',
          `${summary.label}: ${formatNumber(summary.availablePressureBar)} bar affectés pour ${formatNumber(summary.requiredPressureBar)} bar requis.`,
          'blocking'
        );
      } else {
        pushWarning(
          'phase3_segments_underpowered',
          `${overloadedSegments.length} tronçons insuffisamment couverts: ${truncateLabels(
            overloadedSegments.map((summary) => summary.label)
          )}.`,
          'blocking'
        );
      }
    }

    const assignedFlowIncompatibles = segmentOperationalSummaries.flatMap((summary) =>
      summary.assignedMeans.filter((mean) => !mean.flowCompatible).map((mean) => mean.label)
    );

    if (assignedFlowIncompatibles.length > 0) {
      pushWarning(
        'phase3_flow_incompatible',
        `Débit nominal insuffisant pour: ${truncateLabels(assignedFlowIncompatibles)}. Débit relais demandé: ${formatNumber(demandFlowLpm)} L/min.`,
        'blocking'
      );
    }

    return warnings;
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Relais" icon="swap-horizontal" />

        <Card style={styles.section}>
          <Title style={isCompactLayout ? styles.sectionTitleCompact : undefined}>Phase 1 - Besoin hydraulique</Title>
          <View style={styles.stepperRow}>
            <Input
              label="Nombre de lignes à établir"
              value={getDraftValue('lineCount', String(scenario.lineCount))}
              keyboardType={keyboardTypeDec}
              onChangeText={(text) =>
                handleRequiredDraftInput('lineCount', text, (num) => updateScenario({ lineCount: Math.max(1, Math.round(num)) }), {
                  min: 1,
                })
              }
              onBlur={() =>
                commitRequiredDraft('lineCount', (num) => updateScenario({ lineCount: Math.max(1, Math.round(num)) }), {
                  min: 1,
                })
              }
              containerStyle={styles.stepperInputLineCount}
              error={validation.errors.lineCount}
            />
            <View style={[styles.stepperBtns, styles.stepperBtnsLineCount]}>
              <Button
                title="-"
                size="md"
                variant="outline"
                style={styles.stepperBtn}
                onPress={() => {
                  clearDraftValue('lineCount');
                  stepField(
                    scenario.lineCount,
                    -1,
                    (num) => updateScenario({ lineCount: Math.max(1, Math.round(num)) }),
                    { min: 1 }
                  );
                }}
              />
              <Button
                title="+"
                size="md"
                style={styles.stepperBtn}
                onPress={() => {
                  clearDraftValue('lineCount');
                  stepField(
                    scenario.lineCount,
                    1,
                    (num) => updateScenario({ lineCount: Math.max(1, Math.round(num)) }),
                    { min: 1 }
                  );
                }}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <Input
              label="Q dans une ligne (L/min)"
              value={getDraftValue('flowPerLineLpm', String(scenario.flowPerLineLpm))}
              keyboardType={keyboardTypeDec}
              onChangeText={(text) =>
                handleRequiredDraftInput('flowPerLineLpm', text, (num) => updateScenario({ flowPerLineLpm: num }), {
                  min: 1,
                })
              }
              onBlur={() =>
                commitRequiredDraft('flowPerLineLpm', (num) => updateScenario({ flowPerLineLpm: num }), {
                  min: 1,
                })
              }
              containerStyle={styles.inputCol}
              error={validation.errors.flowPerLineLpm}
            />
            <Input
              label="Conversion (m3/h)"
              value={formatNumber(lineFlowM3h)}
              editable={false}
              autoFilled
              containerStyle={styles.inputCol}
            />
          </View>

          <Input
            label="Longueur établissement (m)"
            value={getDraftValue('lengthM', String(totalLengthM))}
            keyboardType={keyboardTypeDec}
            onChangeText={(text) =>
              handleRequiredDraftInput('lengthM', text, (num) => updateScenario({ establishmentLengthM: num }), { min: 1 })
            }
            onBlur={() => commitRequiredDraft('lengthM', (num) => updateScenario({ establishmentLengthM: num }), { min: 1 })}
          />

          <View style={styles.selectorsRow}>
            <View style={styles.selectorGroup}>
              <Label>Longueur des tuyaux</Label>
              <View style={styles.chipRow}>
                {[40, 20].map((hoseLength) => (
                  <Chip
                    key={hoseLength}
                    label={`${hoseLength} m`}
                    selected={scenario.hoseLengthM === hoseLength}
                    onPress={() => updateScenario({ hoseLengthM: hoseLength as 20 | 40 })}
                  />
                ))}
              </View>
            </View>
            <View style={styles.selectorGroup}>
              <Label>Diamètre tuyau</Label>
              <View style={styles.chipRow}>
                {[110, 70].map((diameter) => (
                  <Chip
                    key={diameter}
                    label={`${diameter} mm`}
                    selected={scenario.diameterMm === diameter}
                    onPress={() => updateScenario({ diameterMm: diameter as 70 | 110 })}
                  />
                ))}
              </View>
            </View>
          </View>
          <Label>Tuyaux utilisés</Label>
          <View style={styles.chipRow}>
            <Chip
              label="Auto"
              selected={!scenario.useCustomHoseMix}
              onPress={() => updateScenario({ useCustomHoseMix: false })}
            />
            <Chip
              label="Personnalisé"
              selected={scenario.useCustomHoseMix}
              onPress={() => {
                if (scenario.useCustomHoseMix) return;
                updateScenario({
                  useCustomHoseMix: true,
                  customHoseCount20: scenario.hoseLengthM === 20 ? autoHoseCount : 0,
                  customHoseCount40: scenario.hoseLengthM === 40 ? autoHoseCount : 0,
                });
              }}
            />
          </View>
          {scenario.useCustomHoseMix && (
            <View style={styles.inputRow}>
              <Input
                label="Nb tuyaux 40m"
                value={getDraftValue('customHoseCount40', String(customHoseCount40))}
                keyboardType={keyboardTypeDec}
                onChangeText={(text) =>
                  handleRequiredDraftInput(
                    'customHoseCount40',
                    text,
                    (num) => updateScenario({ customHoseCount40: Math.max(0, Math.round(num)) }),
                    { min: 0 }
                  )
                }
                onBlur={() =>
                  commitRequiredDraft(
                    'customHoseCount40',
                    (num) => updateScenario({ customHoseCount40: Math.max(0, Math.round(num)) }),
                    { min: 0 }
                  )
                }
                containerStyle={styles.inputCol}
                error={validation.errors.customHoseCount40}
              />
              <Input
                label="Nb tuyaux 20m"
                value={getDraftValue('customHoseCount20', String(customHoseCount20))}
                keyboardType={keyboardTypeDec}
                onChangeText={(text) =>
                  handleRequiredDraftInput(
                    'customHoseCount20',
                    text,
                    (num) => updateScenario({ customHoseCount20: Math.max(0, Math.round(num)) }),
                    { min: 0 }
                  )
                }
                onBlur={() =>
                  commitRequiredDraft(
                    'customHoseCount20',
                    (num) => updateScenario({ customHoseCount20: Math.max(0, Math.round(num)) }),
                    { min: 0 }
                  )
                }
                containerStyle={styles.inputCol}
                error={validation.errors.customHoseCount20 || validation.errors.customHoseMix}
              />
            </View>
          )}
          <Caption>
            {scenario.useCustomHoseMix
              ? `Nombre de tuyaux (personnalisé): ${customHoseTotalCount} (${customHoseCount40} x 40m + ${customHoseCount20} x 20m = ${formatNumber(customCoveredLengthM)} m)`
              : `Nombre de tuyaux (auto): ${autoHoseCount} (${formatNumber(totalLengthM)} / ${scenario.hoseLengthM})`}
          </Caption>

          <View style={styles.inputRow}>
            <Input
              label="Dénivelé total (m)"
              value={getDraftValue('elevationM', String(totalElevationM))}
              keyboardType={keyboardTypeDec}
              onChangeText={(text) =>
                handleRequiredDraftInput('elevationM', text, (num) => updateSegmentTotal('elevationM', num))
              }
              onBlur={() => commitRequiredDraft('elevationM', (num) => updateSegmentTotal('elevationM', num))}
              containerStyle={styles.inputCol}
            />
            <Input
              label="% pente (auto)"
              value={formatNumber(slopePercent)}
              editable={false}
              autoFilled
              containerStyle={styles.inputCol}
            />
          </View>

          <View style={styles.inputRow}>
            <Input
              label="Pertes de charge J total (bar)"
              value={formatNumber(computation?.lineLossBar ?? 0)}
              editable={false}
              autoFilled
              labelMinHeight={36}
              containerStyle={styles.inputCol}
            />
            <Input
              label="J/hm (b)"
              value={formatNumber(computation?.jLossBarPerHm ?? 0)}
              editable={false}
              autoFilled
              labelMinHeight={36}
              containerStyle={styles.inputCol}
            />
          </View>

          <View style={styles.inputRow}>
            <Input
              label="Pression nécessaire au point à alimenter (bar)"
              value={getDraftValue('targetOutletBar', String(scenario.targetOutletBar))}
              keyboardType={keyboardTypeDec}
              onChangeText={(text) =>
                handleRequiredDraftInput('targetOutletBar', text, (num) => updateScenario({ targetOutletBar: num }), {
                  min: 0,
                })
              }
              onBlur={() =>
                commitRequiredDraft('targetOutletBar', (num) => updateScenario({ targetOutletBar: num }), {
                  min: 0,
                })
              }
              labelMinHeight={36}
              containerStyle={styles.inputCol}
              error={validation.errors.targetOutletBar}
            />
          </View>

          <View style={styles.sourceSection}>
            <Label>Alimentation source</Label>
            <Caption>L’apport source est déduit du besoin brut calculé en phase 1.</Caption>

            <View style={styles.chipRow}>
              {(Object.keys(sourceModeLabels) as RelaySupplyMode[]).map((mode) => (
                <Chip
                  key={mode}
                  label={sourceModeLabels[mode]}
                  selected={scenario.source.mode === mode}
                  onPress={() => updateSource({ mode })}
                />
              ))}
            </View>

            <Input
              label="Pression source effective (bar)"
              value={getDraftValue('source.pressureEffectiveBar', String(scenario.source.pressureEffectiveBar))}
              keyboardType={keyboardTypeDec}
              onChangeText={(text) =>
                handleRequiredDraftInput('source.pressureEffectiveBar', text, (num) => updateSource({ pressureEffectiveBar: num }), {
                  min: 0,
                })
              }
              onBlur={() =>
                commitRequiredDraft('source.pressureEffectiveBar', (num) => updateSource({ pressureEffectiveBar: num }), {
                  min: 0,
                })
              }
              error={validation.errors['source.pressureEffectiveBar']}
            />

            {scenario.source.mode === 'pi_direct' && (
              <View style={styles.inputRow}>
                <Input
                  label="Qmax PI (L/min)"
                  value={getDraftValue('source.qMaxPiLpm', String(scenario.source.qMaxPiLpm ?? ''))}
                  keyboardType={keyboardTypeDec}
                  onChangeText={(text) =>
                    handleOptionalDraftInput('source.qMaxPiLpm', text, (num) => updateSource({ qMaxPiLpm: num }), {
                      min: 0,
                    })
                  }
                  onBlur={() =>
                    commitOptionalDraft('source.qMaxPiLpm', (num) => updateSource({ qMaxPiLpm: num }), {
                      min: 0,
                    })
                  }
                  error={validation.errors['source.qMaxPiLpm']}
                  containerStyle={styles.inputCol}
                />
                <Input
                  label="Q PI à 1 bar (L/min)"
                  value={getDraftValue('source.qAt1BarLpm', String(scenario.source.qAt1BarLpm ?? ''))}
                  keyboardType={keyboardTypeDec}
                  onChangeText={(text) =>
                    handleOptionalDraftInput('source.qAt1BarLpm', text, (num) => updateSource({ qAt1BarLpm: num }), {
                      min: 0,
                    })
                  }
                  onBlur={() =>
                    commitOptionalDraft('source.qAt1BarLpm', (num) => updateSource({ qAt1BarLpm: num }), {
                      min: 0,
                    })
                  }
                  error={validation.errors['source.qAt1BarLpm']}
                  containerStyle={styles.inputCol}
                />
              </View>
            )}

            {scenario.source.mode === 'pi_with_engine' && (
              <Input
                label="Pstatique PI (bar)"
                value={getDraftValue('source.pStaticBar', String(scenario.source.pStaticBar ?? ''))}
                keyboardType={keyboardTypeDec}
                onChangeText={(text) =>
                  handleOptionalDraftInput('source.pStaticBar', text, (num) => updateSource({ pStaticBar: num }), {
                    min: 0,
                  })
                }
                onBlur={() =>
                  commitOptionalDraft('source.pStaticBar', (num) => updateSource({ pStaticBar: num }), {
                    min: 0,
                  })
                }
                error={validation.errors['source.pStaticBar']}
              />
            )}

            {scenario.source.mode === 'aspiration' && (
              <>
                <Input
                  label="Hauteur aspiration (m)"
                  value={getDraftValue(
                    'source.aspirationHeightM',
                    String(scenario.source.aspirationHeightM ?? '')
                  )}
                  keyboardType={keyboardTypeDec}
                  onChangeText={(text) =>
                    handleOptionalDraftInput(
                      'source.aspirationHeightM',
                      text,
                      (num) => updateSource({ aspirationHeightM: num }),
                      { min: 0 }
                    )
                  }
                  onBlur={() =>
                    commitOptionalDraft('source.aspirationHeightM', (num) => updateSource({ aspirationHeightM: num }), {
                      min: 0,
                    })
                  }
                  error={validation.errors['source.aspirationHeightM']}
                />
                <View style={styles.inputRow}>
                  <Input
                    label="Volume réserve (m3)"
                    value={getDraftValue('source.reserveVolumeM3', String(scenario.source.reserveVolumeM3 ?? ''))}
                    keyboardType={keyboardTypeDec}
                    onChangeText={(text) =>
                      handleOptionalDraftInput(
                        'source.reserveVolumeM3',
                        text,
                        (num) => updateSource({ reserveVolumeM3: num }),
                        { min: 0 }
                      )
                    }
                    onBlur={() =>
                      commitOptionalDraft('source.reserveVolumeM3', (num) => updateSource({ reserveVolumeM3: num }), {
                        min: 0,
                      })
                    }
                    containerStyle={styles.inputCol}
                  />
                  <Input
                    label="Réserve (texte)"
                    value={scenario.source.reserveLabel ?? ''}
                    onChangeText={(text) => updateSource({ reserveLabel: text })}
                    containerStyle={styles.inputCol}
                  />
                </View>
              </>
            )}

          </View>

          <Caption>
            Débit total auto: {formatNumber(demandFlowLpm)} L/min ({scenario.lineCount} ligne(s) x{' '}
            {formatNumber(scenario.flowPerLineLpm)} L/min)
          </Caption>

          <View style={[styles.inputRow, { alignItems: 'flex-start' }]}>
            <Input
              label="Débit total (L/min)"
              value={formatNumber(phase1Display?.demandFlowLpm ?? demandFlowLpm)}
              editable={false}
              autoFilled
              labelMinHeight={42}
              containerStyle={styles.inputCol}
            />
            <Input
              label="Pression de refoulement nécessaire (bar)"
              value={phase1Display ? formatNumber(phase1Display.residualPressureNeedBar) : ''}
              editable={false}
              autoFilled
              labelMinHeight={42}
              containerStyle={styles.inputCol}
              style={phase1CalcIsCurrent ? styles.phase1CalculatedResultText : undefined}
            />
          </View>
          <Input
            label="Apport source pris en compte (bar)"
            value={phase1Display ? formatNumber(phase1Display.sourceContributionBar) : ''}
            editable={false}
            autoFilled
            labelMinHeight={42}
            containerStyle={styles.inputCol}
          />
          <Caption style={phase1Display && phase1CalcIsCurrent ? styles.calcDetailsOk : undefined}>
            {phase1Display ? (phase1CalcIsCurrent ? 'Calcul validé' : 'Recalcul requis') : 'Appuyer sur Calculer'}
          </Caption>

          <CollapsibleCalcDetails
            title="détail du calcul (phase 1)"
            expanded={phase1CalcExpanded}
            onToggle={() => setPhase1CalcExpanded((prev) => !prev)}
            compact
            leadingAction={
              <Button
                title="Calculer"
                size="sm"
                onPress={runPhase1Calculation}
                variant={phase1CalcIsCurrent ? 'secondary' : 'primary'}
                style={styles.phase1CalcButton}
              />
            }
          >
            {!phase1Display ? (
              <Caption>Appuyer sur “Calculer” pour figer et afficher le détail de la phase 1.</Caption>
            ) : (
              <>
                {!phase1CalcIsCurrent ? (
                  <Caption style={styles.calcDetailsKo}>
                    Les entrées ont changé depuis le dernier calcul. Appuyer sur “Calculer”.
                  </Caption>
                ) : null}
                <Caption>
                  Q total = {phase1Display.lineCount} x {formatNumber(phase1Display.flowPerLineLpm)} ={' '}
                  {formatNumber(phase1Display.demandFlowLpm)} L/min
                </Caption>
                <Caption>Tuyaux utilisés = {phase1Display.hoseSummary}</Caption>
                <Caption>J total = {formatNumber(phase1Display.jTotalBar)} bar</Caption>
                <Caption>
                  J/hm = (J total / L) x 100 = ({formatNumber(phase1Display.jTotalBar)} /{' '}
                  {formatNumber(phase1Display.totalLengthM)}) x 100 = {formatNumber(phase1Display.jhmBar)} bar/hm
                </Caption>
                <Caption>
                  Z total = {formatNumber(phase1Display.totalElevationM)} / 10 = {formatNumber(phase1Display.zTotalBar)} bar
                </Caption>
                <Caption>
                  Besoin brut = P point à alimenter + J total + Z total ={' '}
                  {formatNumber(phase1Display.targetOutletBar)} + {formatNumber(phase1Display.jTotalBar)} +{' '}
                  {formatNumber(phase1Display.zTotalBar)} = {formatNumber(phase1Display.requiredRefoulementBar)} bar
                </Caption>
                <Caption>Apport source pris en compte = {formatNumber(phase1Display.sourceContributionBar)} bar</Caption>
                <Caption style={styles.calcDetailsFinal}>
                  Pression de refoulement nécessaire = {formatNumber(phase1Display.requiredRefoulementBar)} -{' '}
                  {formatNumber(phase1Display.sourceContributionBar)} = {formatNumber(phase1Display.residualPressureNeedBar)} bar
                </Caption>
              </>
            )}
          </CollapsibleCalcDetails>
        </Card>

        <Card style={styles.section}>
          <Title style={isCompactLayout ? styles.sectionTitleCompact : undefined}>Phase 2 - Engins disponibles</Title>
          <Caption>
            Sélectionne les engins réellement disponibles, puis applique un profil mission et un %W
            doctrinal pour calculer la pression totale disponible.
          </Caption>
          <Caption>
            Besoin brut: {formatNumber(requiredRefoulementBar)} bar | Apport source: {formatNumber(sourceContributionBar)} bar |
            Besoin engins: {formatNumber(residualPressureNeedBar)} bar
          </Caption>
          <Label>Durée mission</Label>
          <View style={styles.chipRow}>
            <Chip
              label="1-2h"
              selected={scenario.missionDuration === 'h1_2'}
              onPress={() => setMissionDuration('h1_2')}
            />
            <Chip
              label="4-6h"
              selected={scenario.missionDuration === 'h4_6'}
              onPress={() => setMissionDuration('h4_6')}
            />
          </View>
          <Label>%W appliqué</Label>
          <View style={styles.chipRow}>
            {missionWorkRateOptions.map((option) => (
              <Chip
                key={option}
                label={`${option}%`}
                selected={Math.round(scenario.workRatePercent) === option}
                onPress={() => updateScenario({ workRatePercent: option })}
              />
            ))}
          </View>
          <Caption>
            Plage recommandée: {missionWorkRateRange.min}% - {missionWorkRateRange.max}% (
            {scenario.missionDuration === 'h1_2' ? 'mission 1-2h' : 'mission 4-6h'})
          </Caption>
          {validation.errors.workRatePercent ? (
            <Caption style={{ color: '#D32F2F' }}>{validation.errors.workRatePercent}</Caption>
          ) : null}

          <Button
            title={engineListExpanded ? 'Masquer la liste des engins' : 'Afficher la liste des engins'}
            variant="outline"
            size="sm"
            style={styles.engineListToggle}
            onPress={() => setEngineListExpanded((prev) => !prev)}
          />

          {engineListExpanded
            ? availableEngineModels.map((model) => {
                const count = Math.max(0, Math.round(scenario.availableEngineCounts[model.id] ?? 0));
                return (
                  <View key={model.id} style={styles.engineRow}>
                    <View style={styles.engineMeta}>
                      <Body style={styles.engineName}>{model.label}</Body>
                      <Caption>
                        {formatNumber(model.nominalFlowLpm)} L/min - {formatNumber(model.nominalPressureBar)} bar
                      </Caption>
                    </View>
                    <View style={styles.engineStepper}>
                      <Button
                        title="-"
                        size="sm"
                        variant="outline"
                        style={styles.engineStepperBtn}
                        onPress={() => setAvailableEngineCount(model.id, count - 1)}
                      />
                      <View style={styles.engineCountBadge}>
                        <Body>{count}</Body>
                      </View>
                      <Button
                        title="+"
                        size="sm"
                        style={styles.engineStepperBtn}
                        onPress={() => setAvailableEngineCount(model.id, count + 1)}
                      />
                    </View>
                  </View>
                );
              })
            : null}

          <View style={styles.inputRow}>
            <View style={styles.selectedEnginesBlock}>
              <Label>Engins choisis</Label>
              {selectedEngines.length === 0 ? (
                <Caption>Aucun engin sélectionné.</Caption>
              ) : (
                selectedEngines.map(({ model, count }) => (
                  <Caption key={`selected-${model.id}`}>
                    • {count} x {model.label} ({formatNumber(model.nominalFlowLpm)} L/min -{' '}
                    {formatNumber(model.nominalPressureBar)} bar)
                  </Caption>
                ))
              )}
            </View>
          </View>

          <View style={[styles.inputRow, styles.inputRowAlignEnd]}>
            <Input
              label="Pression totale disponible (bar)"
              value={formatNumber(totalAvailablePressureBar)}
              editable={false}
              autoFilled
              containerStyle={styles.inputCol}
            />
            <Input
              label="Besoin à fournir par les engins (bar)"
              value={formatNumber(residualPressureNeedBar)}
              editable={false}
              autoFilled
              containerStyle={styles.inputCol}
            />
          </View>

          <Caption>
            Engins disponibles sélectionnés: {totalAvailableEngineCount}
          </Caption>
          <Caption style={styles.capacityReportLabel}>
            Rapport capacité dispo / nécessaire:
          </Caption>
          <Caption
            style={{
              color: isAvailablePressureSufficient ? '#2E7D32' : '#D32F2F',
              fontWeight: '700',
            }}
          >
            {isAvailablePressureSufficient ? 'OK' : 'Insuffisant'} - Écart pression:{' '}
            {availablePressureDeltaBar >= 0 ? '+' : ''}
            {formatNumber(availablePressureDeltaBar)} bar
          </Caption>

          <CollapsibleCalcDetails
            title="détail du calcul (phase 2)"
            expanded={phase2CalcExpanded}
            onToggle={() => setPhase2CalcExpanded((prev) => !prev)}
          >
            <Caption>
              %W appliqué = {formatNumber(scenario.workRatePercent)}% (soit {formatNumber(workRateRatio)})
            </Caption>
            {selectedEngines.length === 0 ? (
              <Caption>Aucun engin sélectionné.</Caption>
            ) : (
              selectedEngines.map(({ model, count }) => {
                const unitAvailableBar = model.nominalPressureBar * workRateRatio;
                const totalModelAvailableBar = count * unitAvailableBar;
                return (
                  <Caption key={`phase2-detail-${model.id}`}>
                    {count} x {model.label}: {count} x {formatNumber(model.nominalPressureBar)} x {formatNumber(workRateRatio)} ={' '}
                    {formatNumber(totalModelAvailableBar)} bar
                  </Caption>
                );
              })
            )}
            <Caption style={styles.calcDetailsFinal}>
              Pression totale disponible = {formatNumber(totalAvailablePressureBar)} bar | Besoin résiduel ={' '}
              {formatNumber(residualPressureNeedBar)} bar | Écart = {availablePressureDeltaBar >= 0 ? '+' : ''}
              {formatNumber(availablePressureDeltaBar)} bar
            </Caption>
          </CollapsibleCalcDetails>
        </Card>

        <Card style={styles.section}>
          <Title style={isCompactLayout ? styles.sectionTitleCompact : undefined}>Phase 3 - Répartition des moyens</Title>
          <View style={[styles.phase3ActionsRow, isCompactLayout && styles.phase3ActionsRowCompact]}>
            <Button
              title="Placer un moyen"
              size="sm"
              onPress={() => openPlacementForSegment()}
              disabled={scenario.segments.length === 0}
              style={isCompactLayout ? styles.phase3PrimaryActionCompact : undefined}
            />
          </View>
          <RelaySegmentsEditor
            segments={scenario.segments}
            onAdd={addSegment}
            onRemove={removeSegment}
            onUpdate={updateSegment}
            onOpenPlacement={openPlacementForSegment}
            workRatePercent={scenario.workRatePercent}
            assignedMeansBySegment={assignedMeansBySegment}
            segmentOperationalById={segmentOperationalById}
          />

          <View style={styles.phase3LengthProgress}>
            <Caption>
              Longueur à traiter: {formatNumber(totalLengthM)} m | Traité: {formatNumber(segmentsTotalLengthM)} m | Restant:{' '}
              {formatNumber(remainingLengthM)} m
            </Caption>
            <Caption style={remainingLengthM === 0 ? styles.calcDetailsOk : styles.calcDetailsKo}>
              {remainingLengthM > 0
                ? 'Reste de la longueur à répartir'
                : remainingLengthM < 0
                  ? 'Longueur des tronçons supérieure à la longueur à traiter'
                  : 'Longueur couverte par les tronçons'}
            </Caption>
          </View>

        </Card>

        <Card style={styles.section}>
          <Title style={isCompactLayout ? styles.sectionTitleCompact : undefined}>Récapitulatif opérationnel</Title>
          <Caption>
            Consigne indicative = pression disponible au %W retenu sur chaque engin engagé.
          </Caption>

          <View style={styles.operationalOverview}>
            <View style={styles.operationalOverviewItem}>
              <Label>Débit relais</Label>
              <Body style={styles.operationalMetricValue}>{formatNumber(demandFlowLpm)} L/min</Body>
            </View>
            <View style={styles.operationalOverviewItem}>
              <Label>Longueur / tuyaux</Label>
              <Body style={styles.operationalMetricValue}>{formatNumber(totalLengthM)} m</Body>
              <Caption>{phase1HoseSummary}</Caption>
            </View>
            <View style={styles.operationalOverviewItem}>
              <Label>Source / cible</Label>
              <Body style={styles.operationalMetricValue}>
                {formatNumber(sourceContributionBar)} bar / {formatNumber(scenario.targetOutletBar)} bar
              </Body>
            </View>
            <View style={styles.operationalOverviewItem}>
              <Label>Engagés / réserve</Label>
              <Body style={styles.operationalMetricValue}>
                {selectedEngineInstances.length - reserveEngineInstances.length} / {reserveEngineInstances.length}
              </Body>
            </View>
          </View>

          <View style={styles.operationalBlock}>
            <Label>Moyens à mettre en oeuvre</Label>
            {segmentOperationalSummaries.map((summary) => (
              <View key={`operational-${summary.segmentId}`} style={styles.operationalSegmentCard}>
                <View style={styles.operationalSegmentHeader}>
                  <Body style={styles.operationalSegmentTitle}>{summary.label}</Body>
                  <Caption style={summary.isCovered ? styles.calcDetailsOk : styles.calcDetailsKo}>
                    {summary.assignedMeans.length === 0
                      ? 'Affectation requise'
                      : summary.isCovered
                        ? 'Couvert'
                        : 'Insuffisant'}
                  </Caption>
                </View>
                <Caption>
                  {formatNumber(summary.lengthM)} m | {summary.hoseCount} tuyaux de {scenario.hoseLengthM} m |
                  dénivelé {formatNumber(summary.elevationM)} m
                </Caption>
                <Caption>
                  Besoin tronçon = J {formatNumber(summary.lineLossBar)} + Z {formatNumber(summary.elevationLossBar)} +{' '}
                  {summary.isLastSegment ? 'cible' : 'aval'} {formatNumber(summary.downstreamTargetBar)} ={' '}
                  {formatNumber(summary.requiredPressureBar)} bar
                </Caption>
                {summary.assignedMeans.length === 0 ? (
                  <Caption>Aucun moyen affecté.</Caption>
                ) : (
                  summary.assignedMeans.map((mean) => (
                    <Caption key={`operational-mean-${summary.segmentId}-${mean.instanceId}`}>
                      • {mean.label}: consigne indicative {formatNumber(mean.appliedPressureBar)} bar, débit nominal{' '}
                      {formatNumber(mean.nominalFlowLpm)} L/min, portée théorique {formatNumber(mean.maxReachM)} m
                    </Caption>
                  ))
                )}
                {summary.assignedMeans.length > 0 ? (
                  <Caption style={summary.isCovered ? styles.calcDetailsOk : styles.calcDetailsKo}>
                    Capacité affectée {formatNumber(summary.availablePressureBar)} bar | Écart{' '}
                    {summary.deltaBar >= 0 ? '+' : ''}
                    {formatNumber(summary.deltaBar)} bar
                  </Caption>
                ) : null}
              </View>
            ))}
          </View>

          <View style={styles.operationalBlock}>
            <Label>Engins en réserve</Label>
            {reserveEngineInstances.length === 0 ? (
              <Caption>Aucun engin en réserve.</Caption>
            ) : (
              reserveEngineInstances.map((engine) => (
                <Caption key={`reserve-${engine.instanceId}`}>
                  • {engine.label} - {formatNumber(engine.nominalFlowLpm)} L/min - consigne indicative{' '}
                  {formatNumber(engine.nominalPressureBar * workRateRatio)} bar
                </Caption>
              ))
            )}
          </View>
        </Card>

        {computation && (
          <>
            <RelayAbaqueCard
              visible={scenario.method === 'abaque'}
              abaque={computation.abaque}
              totalLengthM={totalLengthM}
              spacingAdjustmentHoses={scenario.spacingAdjustmentHoses}
              onAdjustSpacingHoses={(delta) =>
                updateScenario({ spacingAdjustmentHoses: scenario.spacingAdjustmentHoses + delta })
              }
            />
          </>
        )}

        <WarningList title="Contrôles de saisie" warnings={formWarnings} />
        <WarningList title="Alertes opérationnelles" warnings={processWarnings} />
      </ScrollView>

      <RelayMeansPlacementModal
        visible={phase3PlacementVisible}
        onClose={() => {
          setPhase3PlacementVisible(false);
          setPlacementSegmentId(null);
        }}
        targetSegmentId={placementSegmentId}
        segments={scenario.segments}
        engines={selectedEngineInstances}
        workRatePercent={scenario.workRatePercent}
        jBarPerHm={effectiveJhmBar}
        totalLengthM={Math.max(totalLengthM, scenario.hoseLengthM)}
        targetOutletBar={scenario.targetOutletBar}
        assignments={segmentEngineAssignments}
        onAssign={assignEngineToSegment}
        onRemove={removeEngineFromSegment}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.lg,
    gap: Layout.spacing.lg,
  },
  section: {
    gap: Layout.spacing.sm,
  },
  sectionTitleCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectorsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    alignItems: 'flex-start',
  },
  selectorGroup: {
    flex: 1,
    gap: Layout.spacing.xs,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    alignItems: 'flex-end',
  },
  stepperInput: {
    flex: 1,
    marginBottom: 0,
  },
  stepperInputLineCount: {
    flexBasis: '70%',
    maxWidth: '70%',
    marginBottom: 0,
  },
  stepperBtns: {
    flexDirection: 'row',
    gap: Layout.spacing.xs,
    marginBottom: 2,
  },
  stepperBtnsLineCount: {
    marginBottom: 0,
  },
  stepperBtn: {
    height: Layout.sizes.controlHeight,
    minHeight: Layout.sizes.controlHeight,
    minWidth: Layout.sizes.controlHeight,
    paddingVertical: 0,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  inputRowAlignEnd: {
    alignItems: 'flex-end',
  },
  inputCol: {
    flex: 1,
    marginBottom: 0,
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,120,120,0.2)',
  },
  engineMeta: {
    flex: 1,
    gap: 2,
  },
  engineName: {
    fontWeight: '700',
  },
  engineStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  engineStepperBtn: {
    minWidth: 40,
    minHeight: 40,
    height: 40,
    paddingVertical: 0,
  },
  engineCountBadge: {
    minWidth: 44,
    height: 40,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  engineListToggle: {
    alignSelf: 'flex-start',
  },
  selectedEnginesBlock: {
    flex: 1,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.22)',
    padding: Layout.spacing.sm,
    gap: 2,
  },
  operationalOverview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  operationalOverviewItem: {
    flexGrow: 1,
    flexBasis: 150,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.22)',
    padding: Layout.spacing.sm,
    gap: 2,
  },
  operationalMetricValue: {
    fontWeight: '700',
  },
  operationalBlock: {
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.22)',
    padding: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  operationalSegmentCard: {
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.16)',
    padding: Layout.spacing.sm,
    gap: 4,
    backgroundColor: 'rgba(15,20,26,0.04)',
  },
  operationalSegmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    flexWrap: 'wrap',
  },
  operationalSegmentTitle: {
    fontWeight: '700',
  },
  sourceSection: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(120,120,120,0.18)',
    gap: Layout.spacing.sm,
  },
  phase3LengthProgress: {
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.22)',
    padding: Layout.spacing.sm,
    gap: 2,
  },
  phase3ActionsRow: {
    alignItems: 'flex-start',
  },
  phase3ActionsRowCompact: {
    alignItems: 'stretch',
  },
  phase3PrimaryActionCompact: {
    width: '100%',
  },
  capacityReportLabel: {
    marginTop: 2,
  },
  calcDetailsWrap: {
    marginTop: Layout.spacing.xs,
    gap: Layout.spacing.xs,
  },
  calcDetailsWrapCompact: {
    marginTop: 6,
    gap: 4,
  },
  calcDetailsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    flexWrap: 'wrap',
  },
  calcDetailsHeaderRowCompact: {
    marginTop: 4,
  },
  calcDetailsLeadingAction: {
    alignSelf: 'flex-start',
  },
  calcDetailsToggle: {
    alignSelf: 'flex-start',
  },
  calcDetailsToggleCompact: {
    marginTop: 4,
  },
  calcDetailsBody: {
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
    padding: Layout.spacing.sm,
    gap: 4,
    backgroundColor: 'rgba(15,20,26,0.04)',
  },
  calcDetailsFinal: {
    fontWeight: '700',
    marginTop: 2,
  },
  calcDetailsOk: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  calcDetailsKo: {
    color: '#D32F2F',
    fontWeight: '700',
  },
  phase1CalculatedResultText: {
    color: '#C62828',
    fontWeight: '700',
  },
  phase1CalcButton: {
    marginTop: 4,
  },
});
