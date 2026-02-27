import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
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
import { PumpDetailsModal } from '@/features/relay/ui/PumpDetailsModal';
import { RelayAbaqueCard } from '@/features/relay/ui/RelayAbaqueCard';
import { RelayDiagramModal } from '@/features/relay/ui/RelayDiagramModal';
import {
  RelayMeansDistributionBoard,
  type RelayDistributionEngine,
} from '@/features/relay/ui/RelayMeansDistributionBoard';
import { RelayMeansPlacementModal } from '@/features/relay/ui/RelayMeansPlacementModal';
import { RelaySegmentsEditor } from '@/features/relay/ui/RelaySegmentsEditor';
import { formatNumber } from '@/utils/format';

const keyboardTypeDec = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'decimal-pad';

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
  const [diagramVisible, setDiagramVisible] = useState(false);
  const [pumpDetailsVisible, setPumpDetailsVisible] = useState(false);
  const [phase3PlacementVisible, setPhase3PlacementVisible] = useState(false);
  const [placementSegmentId, setPlacementSegmentId] = useState<string | null>(null);
  const [engineListExpanded, setEngineListExpanded] = useState(true);
  const [phase1CalcExpanded, setPhase1CalcExpanded] = useState(false);
  const [phase2CalcExpanded, setPhase2CalcExpanded] = useState(false);
  const [phase3CalcExpanded, setPhase3CalcExpanded] = useState(false);
  const [enginePlacementMeters, setEnginePlacementMeters] = useState<Record<string, number>>({});
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
    setPumpOverrides,
    setSegments,
    addSegment,
    removeSegment,
    updateSegment,
    resetScenario,
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
    () => totalAvailablePressureBar - requiredRefoulementBar,
    [requiredRefoulementBar, totalAvailablePressureBar]
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
    const next: Record<
      string,
      Array<{ instanceId: string; label: string; appliedPressureBar: number; dMaxM: number }>
    > = {};
    scenario.segments.forEach((segment) => {
      const assignedIds = segmentEngineAssignments[segment.id] ?? [];
      next[segment.id] = assignedIds
        .map((instanceId) => {
          const engine = selectedEngineById[instanceId];
          if (!engine) return null;
          const appliedPressureBar = engine.nominalPressureBar * workRateRatio;
          const transportBar = Math.max(0, appliedPressureBar - 1);
          const dMaxM = jBarPerHmForPlacement > 0 ? (transportBar / jBarPerHmForPlacement) * 100 : totalLengthM;
          return {
            instanceId,
            label: engine.label,
            appliedPressureBar,
            dMaxM,
          };
        })
        .filter(
          (
            item
          ): item is { instanceId: string; label: string; appliedPressureBar: number; dMaxM: number } =>
            Boolean(item)
        );
    });
    return next;
  }, [jBarPerHmForPlacement, scenario.segments, segmentEngineAssignments, selectedEngineById, totalLengthM, workRateRatio]);
  const selectedEnginePlacements = useMemo<RelayDistributionEngine[]>(
    () =>
      selectedEngineInstances.map((engine) => ({
        ...engine,
        positionM: enginePlacementMeters[engine.instanceId] ?? 0,
      })),
    [enginePlacementMeters, selectedEngineInstances]
  );
  const sortedSelectedEnginePlacements = useMemo(
    () => [...selectedEnginePlacements].sort((a, b) => a.positionM - b.positionM),
    [selectedEnginePlacements]
  );

  useEffect(() => {
    setEnginePlacementMeters((prev) => {
      const placementLengthM = Math.max(totalLengthM, scenario.hoseLengthM);
      const jBarPerHm =
        placementLengthM > 0 ? ((computation?.lineLossBar ?? 0) / placementLengthM) * 100 : 0;
      const count = selectedEngineInstances.length;
      const next: Record<string, number> = {};

      selectedEngineInstances.forEach((engine, index) => {
        const existing = prev[engine.instanceId];
        if (Number.isFinite(existing)) {
          next[engine.instanceId] = Math.max(0, Math.min(existing, placementLengthM));
          return;
        }

        let suggestedM = 0;
        if (index > 0) {
          const previousEngine = selectedEngineInstances[index - 1];
          const previousPosition = next[previousEngine.instanceId] ?? 0;
          const previousRefoulementBar =
            (previousEngine.nominalPressureBar * scenario.workRatePercent) / 100;
          const transportBar = Math.max(0, previousRefoulementBar - 1);
          const dMaxM = jBarPerHm > 0 ? (transportBar / jBarPerHm) * 100 : placementLengthM;
          suggestedM = previousPosition + dMaxM;
        }
        const fallbackEvenM = count > 0 ? ((index + 1) / (count + 1)) * placementLengthM : 0;
        const baseM = Number.isFinite(suggestedM) && suggestedM > 0 ? suggestedM : fallbackEvenM;
        const snappedM = Math.round(baseM / scenario.hoseLengthM) * scenario.hoseLengthM;
        next[engine.instanceId] = Math.max(0, Math.min(snappedM, placementLengthM));
      });

      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      const unchanged =
        prevKeys.length === nextKeys.length &&
        nextKeys.every((key) => prev[key] === next[key]);

      return unchanged ? prev : next;
    });
  }, [
    computation?.lineLossBar,
    scenario.hoseLengthM,
    scenario.workRatePercent,
    selectedEngineInstances,
    totalLengthM,
  ]);

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

  const updateEnginePlacement = (instanceId: string, positionM: number) => {
    setEnginePlacementMeters((prev) => {
      if (prev[instanceId] === positionM) return prev;
      return {
        ...prev,
        [instanceId]: positionM,
      };
    });
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

  const openPlacementForSegment = (segmentId: string) => {
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

  const derivedWarnings = computation?.warnings ?? [];
  const formWarnings = validation.warnings;
  const effectiveJTotalBar = computation?.lineLossBar ?? 0;
  const effectiveJhmBar = jBarPerHmForPlacement;
  const effectiveZTotalBar = computation?.elevationLossBar ?? totalElevationM / 10;
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
      totalLengthM,
      totalElevationM,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Relais" icon="swap-horizontal" />

        <Card style={styles.section}>
          <Title>Phase 1 - Débit total / Pression de refoulement nécessaire</Title>
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
              value={phase1Display ? formatNumber(phase1Display.requiredRefoulementBar) : ''}
              editable={false}
              autoFilled
              labelMinHeight={42}
              containerStyle={styles.inputCol}
              style={phase1CalcIsCurrent ? styles.phase1CalculatedResultText : undefined}
            />
          </View>
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
                <Caption style={styles.calcDetailsFinal}>
                  Pression de refoulement nécessaire = P point à alimenter + J total + Z total ={' '}
                  {formatNumber(phase1Display.targetOutletBar)} + {formatNumber(phase1Display.jTotalBar)} +{' '}
                  {formatNumber(phase1Display.zTotalBar)} = {formatNumber(phase1Display.requiredRefoulementBar)} bar
                </Caption>
              </>
            )}
          </CollapsibleCalcDetails>
        </Card>

        <Card style={styles.section}>
          <Title>Phase 2 - Engins disponibles</Title>
          <Caption>
            Sélectionne les engins réellement disponibles, puis applique un profil mission et un %W
            doctrinal pour calculer la pression totale disponible.
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
              label="Pression de refoulement nécessaire (bar)"
              value={formatNumber(requiredRefoulementBar)}
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
              Pression totale disponible = {formatNumber(totalAvailablePressureBar)} bar | Besoin ={' '}
              {formatNumber(requiredRefoulementBar)} bar | Écart = {availablePressureDeltaBar >= 0 ? '+' : ''}
              {formatNumber(availablePressureDeltaBar)} bar
            </Caption>
          </CollapsibleCalcDetails>
        </Card>

        <Card style={styles.section}>
          <Title>Phase 3 - Répartition des moyens</Title>
          <RelaySegmentsEditor
            segments={scenario.segments}
            onAdd={addSegment}
            onRemove={removeSegment}
            onUpdate={updateSegment}
            onOpenPlacement={openPlacementForSegment}
            jBarPerHm={effectiveJhmBar}
            assignedMeansBySegment={assignedMeansBySegment}
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

          <RelayMeansDistributionBoard
            totalLengthM={totalLengthM}
            hoseLengthM={scenario.hoseLengthM}
            workRatePercent={scenario.workRatePercent}
            flowPerLineLpm={scenario.flowPerLineLpm}
            jLossTotalBar={computation?.lineLossBar ?? 0}
            engines={selectedEnginePlacements}
            onChangePositionM={updateEnginePlacement}
          />

          <CollapsibleCalcDetails
            title="détail du calcul (phase 3)"
            expanded={phase3CalcExpanded}
            onToggle={() => setPhase3CalcExpanded((prev) => !prev)}
          >
            <Caption>
              Base: J/hm = {formatNumber(effectiveJhmBar)} bar/hm | P mini entrée engin suivant = 1 bar
            </Caption>
            {sortedSelectedEnginePlacements.length === 0 ? (
              <Caption>Aucun engin à répartir.</Caption>
            ) : (
              sortedSelectedEnginePlacements.map((engine, index) => {
                const pRefApplied = engine.nominalPressureBar * workRateRatio;
                const pTransport = Math.max(0, pRefApplied - 1);
                const dMaxM = effectiveJhmBar > 0 ? (pTransport / effectiveJhmBar) * 100 : totalLengthM;
                const next = sortedSelectedEnginePlacements[index + 1];
                const gapM = next ? next.positionM - engine.positionM : null;
                return (
                  <View key={`phase3-detail-${engine.instanceId}`} style={styles.calcDetailRow}>
                    <Caption>
                      {engine.label}: Pr = {formatNumber(engine.nominalPressureBar)} x {formatNumber(workRateRatio)} ={' '}
                      {formatNumber(pRefApplied)} bar
                    </Caption>
                    <Caption>
                      P transport = {formatNumber(pRefApplied)} - 1 = {formatNumber(pTransport)} bar
                    </Caption>
                    <Caption>
                      D max = ({formatNumber(pTransport)} / {formatNumber(effectiveJhmBar)}) x 100 = {formatNumber(dMaxM)} m
                    </Caption>
                    {gapM !== null ? (
                      <Caption style={gapM <= dMaxM + 0.001 ? styles.calcDetailsOk : styles.calcDetailsKo}>
                        Écart vers suivant = {formatNumber(gapM)} m ({gapM <= dMaxM + 0.001 ? 'OK' : 'dépassement'})
                      </Caption>
                    ) : null}
                  </View>
                );
              })
            )}
          </CollapsibleCalcDetails>
        </Card>

        <Card style={styles.section}>
          <Label>Engin de référence</Label>
          <View style={styles.chipRow}>
            {engineCatalog
              .filter((model) => model.enabled)
              .map((model) => (
                <Chip
                  key={model.id}
                  label={model.label}
                  selected={scenario.selectedEngineModelId === model.id}
                  onPress={() => updateScenario({ selectedEngineModelId: model.id })}
                />
              ))}
          </View>

          <Input
            label="Marge de consigne (bar)"
            value={getDraftValue('pressureMarginBar', String(scenario.pressureMarginBar))}
            keyboardType={keyboardTypeDec}
            onChangeText={(text) =>
              handleRequiredDraftInput('pressureMarginBar', text, (num) => updateScenario({ pressureMarginBar: num }), {
                min: 0,
              })
            }
            onBlur={() =>
              commitRequiredDraft('pressureMarginBar', (num) => updateScenario({ pressureMarginBar: num }), {
                min: 0,
              })
            }
            error={validation.errors.pressureMarginBar}
          />

          <Button title="Réinitialiser scénario" variant="outline" onPress={resetScenario} />
        </Card>

        {computation && (
          <>
            <View style={styles.resultGrid}>
              <Card variant="filled" animated={false} style={styles.resultCard}>
                <Caption>Perte de charge totale</Caption>
                <Title>{formatNumber(computation.lineLossBar)} bar</Title>
              </Card>
              <Card variant="filled" animated={false} style={styles.resultCard}>
                <Caption>Perte due à la déclivité</Caption>
                <Title>{formatNumber(computation.elevationLossBar)} bar</Title>
              </Card>
              <Card variant="filled" animated={false} style={styles.resultCard}>
                <Caption>Pression totale requise</Caption>
                <Title>{formatNumber(computation.prefTotalBar)} bar</Title>
              </Card>
              <Card variant="filled" animated={false} style={styles.resultCard}>
                <Caption>Pression à la sortie</Caption>
                <Title>{formatNumber(computation.outputPressureBar)} bar</Title>
              </Card>
              <Card variant="filled" animated={false} style={styles.resultCard}>
                <Caption>Débit à la sortie</Caption>
                <Title>{formatNumber(computation.outputFlowLpm)} L/min</Title>
              </Card>
              <Card variant="filled" animated={false} style={styles.resultCard}>
                <Caption>Nombre de pompes</Caption>
                <Title>{computation.pumpCount}</Title>
              </Card>
            </View>

            <Card style={[styles.recommendationCard, { backgroundColor: '#C62828' }]}> 
              <Title style={{ color: '#fff' }}>
                {computation.relayNeeded
                  ? `Relais recommandé : ${computation.pumpCount} pompe(s) ${computation.pumpModel.label}`
                  : 'Relais non nécessaire (source suffisante)'}
              </Title>
              <Body style={{ color: '#fff' }}>
                Espacement conseillé : {formatNumber(computation.recommendedSpacingM)} m
              </Body>
              <Body style={{ color: '#fff' }}>
                Longueur totale : {formatNumber(totalLengthM)} m (
                {scenario.useCustomHoseMix
                  ? `${customHoseTotalCount} tuyaux personnalisés`
                  : `${Math.ceil(totalLengthM / scenario.hoseLengthM)} tuyaux de ${scenario.hoseLengthM} m`}
                )
              </Body>

              <View style={styles.recommendationActions}>
                <Button title="Voir schéma" variant="secondary" onPress={() => setDiagramVisible(true)} />
                <Button
                  title="Voir / Modifier détails des pompes"
                  variant="secondary"
                  onPress={() => setPumpDetailsVisible(true)}
                />
              </View>
            </Card>

            <Card style={styles.section}>
              <Title>Tableau opérationnel</Title>
              {computation.pumps.map((pump) => (
                <View key={pump.index} style={styles.tableRow}>
                  <Body style={styles.tableCol}>P{pump.index}</Body>
                  <Body style={styles.tableCol}>{formatNumber(pump.positionM)} m</Body>
                  <Body style={styles.tableCol}>{pump.positionHoses} tuyaux</Body>
                  <Body style={styles.tableCol}>{formatNumber(pump.setpointBar)} bar</Body>
                  <Body style={styles.tableCol}>{formatNumber(pump.flowLpm)} L/min</Body>
                </View>
              ))}
              <Caption>Colonnes: Pompe | Position | Tuyaux | Consigne | Débit</Caption>
              <Caption>
                %W: {formatNumber(computation.workRate * 100)}% - Jmoy: {formatNumber(computation.jmoyBarPerHm)} bar/hm
              </Caption>
            </Card>

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
        <WarningList title="Alertes de calcul" warnings={derivedWarnings} />
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
        assignments={segmentEngineAssignments}
        onAssign={assignEngineToSegment}
        onRemove={removeEngineFromSegment}
      />

      {computation && (
        <>
          <RelayDiagramModal
            visible={diagramVisible}
            onClose={() => setDiagramVisible(false)}
            schema={computation.schema}
            totalLengthM={totalLengthM}
            hoseLengthM={scenario.hoseLengthM}
          />
          <PumpDetailsModal
            visible={pumpDetailsVisible}
            onClose={() => setPumpDetailsVisible(false)}
            pumps={computation.pumps}
            pumpModel={computation.pumpModel}
            onSave={setPumpOverrides}
          />
        </>
      )}
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
  phase3LengthProgress: {
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.22)',
    padding: Layout.spacing.sm,
    gap: 2,
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
  calcDetailRow: {
    gap: 2,
    marginBottom: 4,
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
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  resultCard: {
    width: '48%',
    gap: Layout.spacing.xs,
    marginVertical: 0,
  },
  recommendationCard: {
    gap: Layout.spacing.sm,
    marginVertical: 0,
  },
  recommendationActions: {
    gap: Layout.spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,120,120,0.25)',
    paddingVertical: Layout.spacing.xs,
    gap: Layout.spacing.xs,
  },
  tableCol: {
    flex: 1,
    fontSize: 13,
  },
});
