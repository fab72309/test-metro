import {
  DEFAULT_ENGINE_MODELS,
  type RelayScenarioV2,
} from '@/features/relay/engine/types';
import { parseNumber, validateEngineCatalog, validateRelayScenario } from '@/features/relay/engine/validate';

function makeScenario(patch: Partial<RelayScenarioV2> = {}): RelayScenarioV2 {
  return {
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
    source: {
      mode: 'aspiration',
      pressureEffectiveBar: 0,
      aspirationHeightM: 0,
      reserveVolumeM3: 50,
      reserveLabel: '',
      pStaticBar: null,
      qMaxPiLpm: null,
      qAt1BarLpm: null,
    },
    pumpOverrides: [],
    ...patch,
  };
}

describe('relay validation v2', () => {
  it('parse les virgules', () => {
    expect(parseNumber('7,5')).toBeCloseTo(7.5, 2);
  });

  it('valide le catalogue', () => {
    const result = validateEngineCatalog(DEFAULT_ENGINE_MODELS);
    expect(result.isValid).toBe(true);
  });

  it('rejette un tronçon invalide', () => {
    const result = validateRelayScenario(
      makeScenario({ segments: [{ id: 'S1', lengthM: 0, elevationM: 0 }] }),
      DEFAULT_ENGINE_MODELS
    );

    expect(result.isValid).toBe(false);
    expect(result.errors['segments.0.lengthM']).toBeDefined();
  });

  it('impose les champs PI direct', () => {
    const result = validateRelayScenario(
      makeScenario({
        source: {
          mode: 'pi_direct',
          pressureEffectiveBar: 2,
          qMaxPiLpm: null,
          qAt1BarLpm: null,
          pStaticBar: null,
          aspirationHeightM: null,
          reserveVolumeM3: null,
          reserveLabel: '',
        },
      }),
      DEFAULT_ENGINE_MODELS
    );

    expect(result.isValid).toBe(false);
    expect(result.errors['source.qMaxPiLpm']).toBeDefined();
    expect(result.errors['source.qAt1BarLpm']).toBeDefined();
  });

  it('impose les champs aspiration', () => {
    const result = validateRelayScenario(
      makeScenario({
        source: {
          mode: 'aspiration',
          pressureEffectiveBar: 0,
          qMaxPiLpm: null,
          qAt1BarLpm: null,
          pStaticBar: null,
          aspirationHeightM: null,
          reserveVolumeM3: null,
          reserveLabel: '',
        },
      }),
      DEFAULT_ENGINE_MODELS
    );

    expect(result.isValid).toBe(false);
    expect(result.errors['source.aspirationHeightM']).toBeDefined();
  });

  it('rejette un engin de référence absent', () => {
    const result = validateRelayScenario(
      makeScenario({ selectedEngineModelId: 'unknown' }),
      DEFAULT_ENGINE_MODELS
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.selectedEngineModelId).toBeDefined();
  });
});
