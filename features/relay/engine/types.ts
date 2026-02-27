import { pertesDeChargeTable } from '@/constants/pertesDeChargeTable';

export type RelayMethod = 'math' | 'approximation' | 'abaque';

export type RelayMissionDuration = 'h1_2' | 'h4_6';

export type RelaySupplyMode = 'pi_direct' | 'pi_with_engine' | 'aspiration';

export type RelayWarningLevel = 'info' | 'warning' | 'blocking';

export type RelayWarning = {
  code: string;
  message: string;
  level: RelayWarningLevel;
};

export type RelaySegmentInput = {
  id: string;
  lengthM: number;
  elevationM: number;
};

export type RelaySourceInputs = {
  mode: RelaySupplyMode;
  pressureEffectiveBar: number;
  qMaxPiLpm?: number | null;
  qAt1BarLpm?: number | null;
  pStaticBar?: number | null;
  aspirationHeightM?: number | null;
  reserveVolumeM3?: number | null;
  reserveLabel?: string;
};

export type RelayEngineModelV2 = {
  id: string;
  label: string;
  nominalFlowLpm: number;
  nominalPressureBar: number;
  maxPressureBar: number;
  enabled: boolean;
};

export type RelayPumpOverrideV2 = {
  index: number;
  flowLpm?: number;
  setpointBar?: number;
  engineModelId?: string;
};

export type RelayPumpPlanV2 = {
  index: number;
  engineModelId: string;
  setpointBar: number;
  recommendedBar: number;
  flowLpm: number;
  inletBar: number;
  outletBar: number;
  positionM: number;
  positionHoses: number;
  isOverride: boolean;
};

export type RelaySchemaNode = {
  id: string;
  label: string;
  positionM: number;
  distanceFromPrevM: number;
};

export type RelayAbaquePoint = {
  xM: number;
  requiredBar: number;
};

export type RelayAbaquePumpPoint = {
  index: number;
  xM: number;
  bar: number;
};

export type RelayAbaqueData = {
  points: RelayAbaquePoint[];
  pumpPoints: RelayAbaquePumpPoint[];
  maxYBar: number;
};

export type RelayComputationV2 = {
  demandFlowLpm: number;
  lineLossBar: number;
  jLossBarPerHm: number;
  elevationLossBar: number;
  totalLossBar: number;
  prefTotalBar: number;
  pressureNeededFromPumpsBar: number;
  pressureSourceBar: number;
  jmoyBarPerHm: number;
  workRate: number;
  pumpCount: number;
  relayNeeded: boolean;
  outputPressureBar: number;
  outputFlowLpm: number;
  pumpModel: RelayEngineModelV2;
  pumps: RelayPumpPlanV2[];
  warnings: RelayWarning[];
  schema: RelaySchemaNode[];
  abaque: RelayAbaqueData;
  recommendedSpacingM: number;
};

export type RelayScenarioV2 = {
  method: RelayMethod;
  missionDuration: RelayMissionDuration;
  diameterMm: 70 | 110;
  establishmentLengthM: number;
  lineCount: number;
  flowPerLineLpm: number;
  hoseLengthM: 20 | 40;
  useCustomHoseMix: boolean;
  customHoseCount20: number;
  customHoseCount40: number;
  workRatePercent: number;
  availableEngineCounts: Record<string, number>;
  targetOutletBar: number;
  maxPumps: number;
  pressureMarginBar: number;
  spacingAdjustmentHoses: number;
  selectedEngineModelId: string;
  segments: RelaySegmentInput[];
  source: RelaySourceInputs;
  pumpOverrides: RelayPumpOverrideV2[];
};

export type RelayDefaultsV2 = {
  missionDuration: RelayMissionDuration;
  targetOutletBar: number;
};

export type PertesDeChargeTableType = typeof pertesDeChargeTable;

export const DEFAULT_ENGINE_MODELS: RelayEngineModelV2[] = [
  {
    id: 'fpt-2000-15',
    label: 'FPT',
    nominalFlowLpm: 2000,
    nominalPressureBar: 15,
    maxPressureBar: 15,
    enabled: true,
  },
  {
    id: 'fptl-1500-15',
    label: 'FPTL',
    nominalFlowLpm: 1500,
    nominalPressureBar: 15,
    maxPressureBar: 15,
    enabled: true,
  },
  {
    id: 'mpr-2000-15',
    label: 'MPR',
    nominalFlowLpm: 2000,
    nominalPressureBar: 15,
    maxPressureBar: 15,
    enabled: true,
  },
  {
    id: 'ccr-2000-15',
    label: 'CCR',
    nominalFlowLpm: 2000,
    nominalPressureBar: 15,
    maxPressureBar: 15,
    enabled: true,
  },
  {
    id: 'ccfu-2000-15',
    label: 'CCFU',
    nominalFlowLpm: 2000,
    nominalPressureBar: 15,
    maxPressureBar: 15,
    enabled: true,
  },
  {
    id: 'ccf-1500-15',
    label: 'CCF',
    nominalFlowLpm: 1500,
    nominalPressureBar: 15,
    maxPressureBar: 15,
    enabled: true,
  },
  {
    id: 'ccem-3000-15',
    label: 'CCEM (3000/15)',
    nominalFlowLpm: 3000,
    nominalPressureBar: 15,
    maxPressureBar: 15,
    enabled: true,
  },
  {
    id: 'ccem-4000-10',
    label: 'CCEM (4000/10)',
    nominalFlowLpm: 4000,
    nominalPressureBar: 10,
    maxPressureBar: 10,
    enabled: true,
  },
  {
    id: 'ccems-6000-15',
    label: 'CCEMS (6000/15)',
    nominalFlowLpm: 6000,
    nominalPressureBar: 15,
    maxPressureBar: 15,
    enabled: true,
  },
  {
    id: 'ccems-8000-10',
    label: 'CCEMS (8000/10)',
    nominalFlowLpm: 8000,
    nominalPressureBar: 10,
    maxPressureBar: 10,
    enabled: true,
  },
];

export const DEFAULT_RELAY_DEFAULTS_V2: RelayDefaultsV2 = {
  missionDuration: 'h1_2',
  targetOutletBar: 6,
};

export const DEFAULT_RELAY_SCENARIO_V2: RelayScenarioV2 = {
  method: 'math',
  missionDuration: DEFAULT_RELAY_DEFAULTS_V2.missionDuration,
  diameterMm: 110,
  establishmentLengthM: 1500,
  lineCount: 1,
  flowPerLineLpm: 1000,
  hoseLengthM: 40,
  useCustomHoseMix: false,
  customHoseCount20: 0,
  customHoseCount40: 0,
  workRatePercent: 75,
  availableEngineCounts: {},
  targetOutletBar: DEFAULT_RELAY_DEFAULTS_V2.targetOutletBar,
  maxPumps: 12,
  pressureMarginBar: 0,
  spacingAdjustmentHoses: 0,
  selectedEngineModelId: 'fpt-2000-15',
  segments: [
    {
      id: 'S1',
      lengthM: 1500,
      elevationM: 0,
    },
  ],
  source: {
    mode: 'aspiration',
    pressureEffectiveBar: 0,
    qMaxPiLpm: null,
    qAt1BarLpm: null,
    pStaticBar: null,
    aspirationHeightM: 0,
    reserveVolumeM3: null,
    reserveLabel: '',
  },
  pumpOverrides: [],
};
