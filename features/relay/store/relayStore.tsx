import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_RELAY_DEFAULTS_V2,
  DEFAULT_RELAY_SCENARIO_V2,
  type RelayDefaultsV2,
  type RelayPumpOverrideV2,
  type RelayScenarioV2,
  type RelaySegmentInput,
  type RelaySourceInputs,
} from '@/features/relay/engine/types';

const SCENARIO_KEY = 'relay.v2.scenario';
const DEFAULTS_KEY = 'relay.v2.defaults';
const LEGACY_KEY = 'relay.scenario';

type LegacyScenario = {
  inputs?: {
    lengthM?: number;
    elevationM?: number;
    flowLpm?: number;
    targetOutletBar?: number;
    diameterMm?: 70 | 110;
  };
  settings?: {
    pressureMarginBar?: number;
    pumpModelId?: string;
    maxPumps?: number;
  };
  overrides?: Array<{
    index: number;
    flowLpm?: number;
    setpointBar?: number;
  }>;
};

function normalizeSelectedEngineModelId(rawId: unknown): string {
  if (typeof rawId !== 'string' || rawId.trim().length === 0) {
    return DEFAULT_RELAY_SCENARIO_V2.selectedEngineModelId;
  }

  const normalized = rawId.trim();
  const aliases: Record<string, string> = {
    '2000-15': 'fpt-2000-15',
    '1000-15': 'fptl-1500-15',
    '2000-10': 'ccem-4000-10',
    '2000/15': 'fpt-2000-15',
    '1000/15': 'fptl-1500-15',
    '2000/10': 'ccem-4000-10',
  };

  return aliases[normalized] ?? normalized;
}

export type RelayStore = {
  scenario: RelayScenarioV2;
  defaults: RelayDefaultsV2;
  loading: boolean;
  updateScenario: (patch: Partial<RelayScenarioV2>) => void;
  updateSource: (patch: Partial<RelaySourceInputs>) => void;
  setSegments: (segments: RelaySegmentInput[]) => void;
  addSegment: () => void;
  removeSegment: (id: string) => void;
  updateSegment: (id: string, patch: Partial<RelaySegmentInput>) => void;
  setPumpOverrides: (overrides: RelayPumpOverrideV2[]) => void;
  updateDefaultSettings: (patch: Partial<RelayDefaultsV2>) => void;
  resetScenario: () => void;
};

const RelayContext = createContext<RelayStore | undefined>(undefined);

function buildScenarioFromDefaults(defaults: RelayDefaultsV2): RelayScenarioV2 {
  return {
    ...DEFAULT_RELAY_SCENARIO_V2,
    missionDuration: defaults.missionDuration,
    targetOutletBar: defaults.targetOutletBar,
  };
}

function normalizeDefaults(raw: Partial<RelayDefaultsV2> | null): RelayDefaultsV2 {
  return {
    missionDuration:
      raw?.missionDuration === 'h4_6' || raw?.missionDuration === 'h1_2'
        ? raw.missionDuration
        : DEFAULT_RELAY_DEFAULTS_V2.missionDuration,
    targetOutletBar:
      typeof raw?.targetOutletBar === 'number' && Number.isFinite(raw.targetOutletBar) && raw.targetOutletBar >= 0
        ? raw.targetOutletBar
        : DEFAULT_RELAY_DEFAULTS_V2.targetOutletBar,
  };
}

function normalizeScenario(raw: Partial<RelayScenarioV2> | null, defaults: RelayDefaultsV2): RelayScenarioV2 {
  const base = buildScenarioFromDefaults(defaults);
  const merged: RelayScenarioV2 = {
    ...base,
    ...raw,
    selectedEngineModelId: normalizeSelectedEngineModelId(raw?.selectedEngineModelId),
    source: {
      ...base.source,
      ...(raw?.source ?? {}),
    },
    segments:
      Array.isArray(raw?.segments) && raw.segments.length > 0
        ? raw.segments.map((segment, idx) => ({
            id: segment.id ?? `S${idx + 1}`,
            lengthM:
              typeof segment.lengthM === 'number' && Number.isFinite(segment.lengthM) ? segment.lengthM : 0,
            elevationM:
              typeof segment.elevationM === 'number' && Number.isFinite(segment.elevationM)
                ? segment.elevationM
                : 0,
          }))
        : base.segments,
    pumpOverrides: Array.isArray(raw?.pumpOverrides) ? raw.pumpOverrides : [],
  };

  if (merged.diameterMm !== 70 && merged.diameterMm !== 110) {
    merged.diameterMm = base.diameterMm;
  }

  if (!Number.isFinite(merged.lineCount) || merged.lineCount < 1) {
    merged.lineCount = base.lineCount;
  }

  if (!Number.isFinite(merged.flowPerLineLpm) || merged.flowPerLineLpm <= 0) {
    merged.flowPerLineLpm = base.flowPerLineLpm;
  }

  if (!Number.isFinite(merged.establishmentLengthM) || merged.establishmentLengthM <= 0) {
    const fallbackLength = merged.segments.reduce((sum, segment) => sum + Math.max(0, segment.lengthM), 0);
    merged.establishmentLengthM = fallbackLength > 0 ? fallbackLength : base.establishmentLengthM;
  }

  if (merged.hoseLengthM !== 20 && merged.hoseLengthM !== 40) {
    merged.hoseLengthM = base.hoseLengthM;
  }

  if (typeof merged.useCustomHoseMix !== 'boolean') {
    merged.useCustomHoseMix = base.useCustomHoseMix;
  }

  if (!Number.isFinite(merged.customHoseCount20) || merged.customHoseCount20 < 0) {
    merged.customHoseCount20 = base.customHoseCount20;
  }

  if (!Number.isFinite(merged.customHoseCount40) || merged.customHoseCount40 < 0) {
    merged.customHoseCount40 = base.customHoseCount40;
  }

  if (!Number.isFinite(merged.targetOutletBar) || merged.targetOutletBar < 0) {
    merged.targetOutletBar = defaults.targetOutletBar;
  }

  if (!Number.isFinite(merged.workRatePercent) || merged.workRatePercent <= 0 || merged.workRatePercent > 100) {
    merged.workRatePercent = base.workRatePercent;
  }

  if (!merged.availableEngineCounts || typeof merged.availableEngineCounts !== 'object') {
    merged.availableEngineCounts = {};
  } else {
    const sanitizedCounts: Record<string, number> = {};
    Object.entries(merged.availableEngineCounts).forEach(([id, value]) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return;
      if (parsed < 0) return;
      sanitizedCounts[id] = Math.round(parsed);
    });
    merged.availableEngineCounts = sanitizedCounts;
  }

  if (!Number.isFinite(merged.maxPumps) || merged.maxPumps < 1) {
    merged.maxPumps = base.maxPumps;
  }

  if (!Number.isFinite(merged.pressureMarginBar) || merged.pressureMarginBar < 0) {
    merged.pressureMarginBar = base.pressureMarginBar;
  }

  if (!Number.isFinite(merged.spacingAdjustmentHoses)) {
    merged.spacingAdjustmentHoses = 0;
  }

  if (merged.method !== 'math' && merged.method !== 'approximation' && merged.method !== 'abaque') {
    merged.method = base.method;
  }

  if (merged.missionDuration !== 'h1_2' && merged.missionDuration !== 'h4_6') {
    merged.missionDuration = defaults.missionDuration;
  }

  return merged;
}

function migrateLegacyScenario(raw: LegacyScenario | null, defaults: RelayDefaultsV2): RelayScenarioV2 {
  const base = buildScenarioFromDefaults(defaults);
  if (!raw) return base;

  const lengthM = raw.inputs?.lengthM ?? base.segments[0].lengthM;
  const elevationM = raw.inputs?.elevationM ?? base.segments[0].elevationM;

  return {
    ...base,
    establishmentLengthM:
      typeof lengthM === 'number' && Number.isFinite(lengthM) && lengthM > 0 ? lengthM : base.establishmentLengthM,
    diameterMm: raw.inputs?.diameterMm === 70 || raw.inputs?.diameterMm === 110 ? raw.inputs.diameterMm : base.diameterMm,
    lineCount: 1,
    flowPerLineLpm:
      typeof raw.inputs?.flowLpm === 'number' && Number.isFinite(raw.inputs.flowLpm) && raw.inputs.flowLpm > 0
        ? raw.inputs.flowLpm
        : base.flowPerLineLpm,
    hoseLengthM: 40,
    useCustomHoseMix: false,
    customHoseCount20: 0,
    customHoseCount40: 0,
    workRatePercent: 75,
    availableEngineCounts: {},
    targetOutletBar:
      typeof raw.inputs?.targetOutletBar === 'number' && Number.isFinite(raw.inputs.targetOutletBar)
        ? raw.inputs.targetOutletBar
        : defaults.targetOutletBar,
    selectedEngineModelId: normalizeSelectedEngineModelId(
      raw.settings?.pumpModelId ? String(raw.settings.pumpModelId).replace('/', '-') : base.selectedEngineModelId
    ),
    maxPumps:
      typeof raw.settings?.maxPumps === 'number' && Number.isFinite(raw.settings.maxPumps)
        ? raw.settings.maxPumps
        : base.maxPumps,
    pressureMarginBar:
      typeof raw.settings?.pressureMarginBar === 'number' && Number.isFinite(raw.settings.pressureMarginBar)
        ? raw.settings.pressureMarginBar
        : base.pressureMarginBar,
    segments: [
      {
        id: 'S1',
        lengthM: typeof lengthM === 'number' && Number.isFinite(lengthM) ? lengthM : base.segments[0].lengthM,
        elevationM:
          typeof elevationM === 'number' && Number.isFinite(elevationM) ? elevationM : base.segments[0].elevationM,
      },
    ],
    source: {
      ...base.source,
      mode: 'aspiration',
      pressureEffectiveBar: 0,
      aspirationHeightM: 0,
      reserveLabel: 'Non renseignée',
    },
    pumpOverrides: Array.isArray(raw.overrides)
      ? raw.overrides.map((override) => ({
          index: override.index,
          flowLpm: override.flowLpm,
          setpointBar: override.setpointBar,
        }))
      : [],
  };
}

export function RelayProvider({ children }: { children: ReactNode }) {
  const [defaults, setDefaults] = useState<RelayDefaultsV2>(DEFAULT_RELAY_DEFAULTS_V2);
  const [scenario, setScenario] = useState<RelayScenarioV2>(
    buildScenarioFromDefaults(DEFAULT_RELAY_DEFAULTS_V2)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const defaultsStored = await AsyncStorage.getItem(DEFAULTS_KEY);
        const defaultsParsed = defaultsStored ? normalizeDefaults(JSON.parse(defaultsStored)) : DEFAULT_RELAY_DEFAULTS_V2;
        setDefaults(defaultsParsed);

        const storedScenario = await AsyncStorage.getItem(SCENARIO_KEY);
        if (storedScenario) {
          const parsedScenario = JSON.parse(storedScenario);
          const normalized = normalizeScenario(parsedScenario, defaultsParsed);
          setScenario(normalized);
        } else {
          const legacyScenario = await AsyncStorage.getItem(LEGACY_KEY);
          if (legacyScenario) {
            const migrated = migrateLegacyScenario(JSON.parse(legacyScenario), defaultsParsed);
            setScenario(migrated);
            await AsyncStorage.setItem(SCENARIO_KEY, JSON.stringify(migrated));
          } else {
            const initial = buildScenarioFromDefaults(defaultsParsed);
            setScenario(initial);
            await AsyncStorage.setItem(SCENARIO_KEY, JSON.stringify(initial));
          }
        }

        if (!defaultsStored) {
          await AsyncStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaultsParsed));
        }
      } catch {
        const fallbackDefaults = DEFAULT_RELAY_DEFAULTS_V2;
        const fallbackScenario = buildScenarioFromDefaults(fallbackDefaults);
        setDefaults(fallbackDefaults);
        setScenario(fallbackScenario);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistScenario = (updater: (prev: RelayScenarioV2) => RelayScenarioV2) => {
    setScenario((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem(SCENARIO_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateScenario = (patch: Partial<RelayScenarioV2>) => {
    persistScenario((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const updateSource = (patch: Partial<RelaySourceInputs>) => {
    persistScenario((prev) => ({
      ...prev,
      source: {
        ...prev.source,
        ...patch,
      },
    }));
  };

  const setSegments = (segments: RelaySegmentInput[]) => {
    persistScenario((prev) => ({
      ...prev,
      segments,
    }));
  };

  const addSegment = () => {
    persistScenario((prev) => {
      const nextIndex = prev.segments.length + 1;
      return {
        ...prev,
        segments: [
          ...prev.segments,
          {
            id: `S${nextIndex}`,
            lengthM: 200,
            elevationM: 0,
          },
        ],
      };
    });
  };

  const removeSegment = (id: string) => {
    persistScenario((prev) => {
      if (prev.segments.length <= 1) return prev;
      return {
        ...prev,
        segments: prev.segments.filter((segment) => segment.id !== id),
      };
    });
  };

  const updateSegment = (id: string, patch: Partial<RelaySegmentInput>) => {
    persistScenario((prev) => ({
      ...prev,
      segments: prev.segments.map((segment) =>
        segment.id === id
          ? {
              ...segment,
              ...patch,
            }
          : segment
      ),
    }));
  };

  const setPumpOverrides = (pumpOverrides: RelayPumpOverrideV2[]) => {
    persistScenario((prev) => ({
      ...prev,
      pumpOverrides,
    }));
  };

  const updateDefaultSettings = (patch: Partial<RelayDefaultsV2>) => {
    setDefaults((prev) => {
      const next = normalizeDefaults({ ...prev, ...patch });
      AsyncStorage.setItem(DEFAULTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetScenario = () => {
    const next = buildScenarioFromDefaults(defaults);
    setScenario(next);
    AsyncStorage.setItem(SCENARIO_KEY, JSON.stringify(next));
  };

  const value = useMemo(
    () => ({
      scenario,
      defaults,
      loading,
      updateScenario,
      updateSource,
      setSegments,
      addSegment,
      removeSegment,
      updateSegment,
      setPumpOverrides,
      updateDefaultSettings,
      resetScenario,
    }),
    [scenario, defaults, loading]
  );

  return <RelayContext.Provider value={value}>{children}</RelayContext.Provider>;
}

export function useRelayStore() {
  const context = useContext(RelayContext);
  if (!context) {
    throw new Error('useRelayStore must be used within a RelayProvider');
  }
  return context;
}
