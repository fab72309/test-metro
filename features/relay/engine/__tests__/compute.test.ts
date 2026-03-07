import { computeRelay } from '@/features/relay/engine/compute';
import {
  DEFAULT_ENGINE_MODELS,
  type RelayScenarioV2,
} from '@/features/relay/engine/types';

const baseSource = {
  mode: 'aspiration' as const,
  pressureEffectiveBar: 0,
  qMaxPiLpm: null,
  qAt1BarLpm: null,
  pStaticBar: null,
  aspirationHeightM: 0,
  reserveVolumeM3: null,
  reserveLabel: 'inépuisable',
};

function makeScenario(patch: Partial<RelayScenarioV2>): RelayScenarioV2 {
  const next: RelayScenarioV2 = {
    method: 'math',
    missionDuration: 'h1_2',
    diameterMm: 110,
    establishmentLengthM: 1000,
    lineCount: 1,
    flowPerLineLpm: 1500,
    hoseLengthM: 40,
    useCustomHoseMix: false,
    customHoseCount20: 0,
    customHoseCount40: 0,
    workRatePercent: 75,
    availableEngineCounts: {},
    targetOutletBar: 6,
    maxPumps: 12,
    pressureMarginBar: 0,
    spacingAdjustmentHoses: 0,
    selectedEngineModelId: 'fpt-2000-15',
    segments: [{ id: 'S1', lengthM: 1000, elevationM: 0 }],
    source: baseSource,
    pumpOverrides: [],
    ...patch,
  };

  if (patch.establishmentLengthM === undefined) {
    next.establishmentLengthM = next.segments.reduce((sum, segment) => sum + Math.max(0, segment.lengthM), 0);
  }

  return next;
}

describe('relay compute v2', () => {
  it('calcule correctement avec la table par défaut (3500m, 2000 l/min, 7 bar)', () => {
    const scenario = makeScenario({
      method: 'math',
      missionDuration: 'h1_2',
      lineCount: 1,
      flowPerLineLpm: 2000,
      targetOutletBar: 7,
      segments: [{ id: 'S1', lengthM: 3500, elevationM: 0 }],
    });

    const result = computeRelay(scenario, DEFAULT_ENGINE_MODELS);

    expect(result.lineLossBar).toBeCloseTo(52.8, 1);
    expect(result.elevationLossBar).toBeCloseTo(0, 2);
    expect(result.prefTotalBar).toBeCloseTo(59.8, 1);
    expect(result.pumpCount).toBe(4);
    expect(result.workRate).toBeCloseTo(0.9967, 3);
  });

  it('calcule correctement avec déclivité (+60m) sur table par défaut', () => {
    const scenario = makeScenario({
      method: 'math',
      missionDuration: 'h4_6',
      lineCount: 1,
      flowPerLineLpm: 1500,
      targetOutletBar: 0,
      segments: [{ id: 'S1', lengthM: 1500, elevationM: 60 }],
    });

    const result = computeRelay(scenario, DEFAULT_ENGINE_MODELS);

    expect(result.lineLossBar).toBeCloseTo(7.6, 1);
    expect(result.elevationLossBar).toBeCloseTo(6, 1);
    expect(result.prefTotalBar).toBeCloseTo(13.6, 1);
    expect(result.pumpCount).toBe(1);
    expect(result.workRate).toBeCloseTo(0.9067, 2);
  });

  it('monotonicité: débit up => pertes up', () => {
    const low = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 1000,
        segments: [{ id: 'S1', lengthM: 1000, elevationM: 0 }],
      }),
      DEFAULT_ENGINE_MODELS
    );
    const high = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 1500,
        segments: [{ id: 'S1', lengthM: 1000, elevationM: 0 }],
      }),
      DEFAULT_ENGINE_MODELS
    );

    expect(high.lineLossBar).toBeGreaterThan(low.lineLossBar);
  });

  it('calcule les pertes de charge sur Q par ligne (et non sur le débit total)', () => {
    const oneLine = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 2000,
        hoseLengthM: 40,
        diameterMm: 110,
        segments: [{ id: 'S1', lengthM: 1000, elevationM: 0 }],
      }),
      DEFAULT_ENGINE_MODELS
    );
    const twoLines = computeRelay(
      makeScenario({
        lineCount: 2,
        flowPerLineLpm: 2000,
        hoseLengthM: 40,
        diameterMm: 110,
        segments: [{ id: 'S1', lengthM: 1000, elevationM: 0 }],
      }),
      DEFAULT_ENGINE_MODELS
    );

    expect(twoLines.lineLossBar).toBeCloseTo(oneLine.lineLossBar, 2);
    expect(twoLines.demandFlowLpm).toBe(4000);
  });

  it('calcule J sur le nombre de tuyaux posé (arrondi supérieur)', () => {
    const customTable = {
      '45x20': { 250: 0.3, 500: 1.3, 1000: 5, 1500: null, 2000: null },
      '70x20': { 250: 0.05, 500: 0.2, 1000: 0.5, 1500: 1.5, 2000: 2 },
      '70x40': { 250: 0.1, 500: 0.4, 1000: 1, 1500: 2.5, 2000: 4 },
      '110x20': { 250: null, 500: null, 1000: 0.05, 1500: 0.1, 2000: 0.3 },
      '110x40': { 250: null, 500: null, 1000: 0.1, 1500: 0.2, 2000: 0.5 },
    } as const;

    const result = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 2000,
        hoseLengthM: 40,
        diameterMm: 110,
        targetOutletBar: 6,
        segments: [{ id: 'S1', lengthM: 100, elevationM: 0 }],
      }),
      DEFAULT_ENGINE_MODELS,
      customTable
    );

    expect(result.lineLossBar).toBeCloseTo(1.5, 2);
    expect(result.jLossBarPerHm).toBeCloseTo(1.5, 1);
    expect(result.prefTotalBar).toBeCloseTo(7.5, 2);
  });

  it('calcule J sur un mix personnalisé de tuyaux 20m/40m', () => {
    const customTable = {
      '45x20': { 250: 0.3, 500: 1.3, 1000: 5, 1500: null, 2000: null },
      '70x20': { 250: 0.05, 500: 0.2, 1000: 0.5, 1500: 1.5, 2000: 2 },
      '70x40': { 250: 0.1, 500: 0.4, 1000: 1, 1500: 2.5, 2000: 4 },
      '110x20': { 250: null, 500: null, 1000: 0.05, 1500: 0.1, 2000: 0.3 },
      '110x40': { 250: null, 500: null, 1000: 0.1, 1500: 0.2, 2000: 0.5 },
    } as const;

    const result = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 2000,
        hoseLengthM: 40,
        diameterMm: 110,
        useCustomHoseMix: true,
        customHoseCount40: 2,
        customHoseCount20: 1,
        targetOutletBar: 6,
        segments: [{ id: 'S1', lengthM: 100, elevationM: 0 }],
      }),
      DEFAULT_ENGINE_MODELS,
      customTable
    );

    expect(result.lineLossBar).toBeCloseTo(1.3, 2);
    expect(result.prefTotalBar).toBeCloseTo(7.3, 2);
  });

  it('monotonicité: longueur up => pertes up', () => {
    const short = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 1500,
        segments: [{ id: 'S1', lengthM: 500, elevationM: 0 }],
      }),
      DEFAULT_ENGINE_MODELS
    );
    const long = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 1500,
        segments: [{ id: 'S1', lengthM: 1500, elevationM: 0 }],
      }),
      DEFAULT_ENGINE_MODELS
    );

    expect(long.lineLossBar).toBeGreaterThan(short.lineLossBar);
  });

  it('diamètre up => pertes down', () => {
    const d70 = computeRelay(makeScenario({ diameterMm: 70 }), DEFAULT_ENGINE_MODELS);
    const d110 = computeRelay(makeScenario({ diameterMm: 110 }), DEFAULT_ENGINE_MODELS);

    expect(d110.lineLossBar).toBeLessThan(d70.lineLossBar);
  });

  it('arrondi doctrine pression et tuyaux', () => {
    const result = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 1500,
        targetOutletBar: 0,
        segments: [{ id: 'S1', lengthM: 1500, elevationM: 60 }],
      }),
      DEFAULT_ENGINE_MODELS
    );

    expect(result.pumps[0].recommendedBar).toBe(14);
    expect(Number.isInteger(result.pumps[0].positionHoses)).toBe(true);
  });

  it('détecte un dépassement de capacité bloquant', () => {
    const result = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 2000,
        targetOutletBar: 12,
        segments: [{ id: 'S1', lengthM: 8000, elevationM: 0 }],
        maxPumps: 2,
      }),
      DEFAULT_ENGINE_MODELS
    );

    expect(result.warnings.some((warning) => warning.level === 'blocking')).toBe(true);
  });

  it('déduit la pression source du besoin à fournir par les engins', () => {
    const noSource = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 1500,
        targetOutletBar: 6,
        segments: [{ id: 'S1', lengthM: 1500, elevationM: 60 }],
        source: {
          ...baseSource,
          pressureEffectiveBar: 0,
        },
      }),
      DEFAULT_ENGINE_MODELS
    );

    const withSource = computeRelay(
      makeScenario({
        lineCount: 1,
        flowPerLineLpm: 1500,
        targetOutletBar: 6,
        segments: [{ id: 'S1', lengthM: 1500, elevationM: 60 }],
        source: {
          ...baseSource,
          pressureEffectiveBar: 5,
        },
      }),
      DEFAULT_ENGINE_MODELS
    );

    expect(withSource.prefTotalBar).toBeCloseTo(noSource.prefTotalBar, 2);
    expect(withSource.pressureSourceBar).toBe(5);
    expect(withSource.pressureNeededFromPumpsBar).toBeCloseTo(noSource.prefTotalBar - 5, 2);
    expect(withSource.pressureNeededFromPumpsBar).toBeLessThan(noSource.pressureNeededFromPumpsBar);
  });
});
