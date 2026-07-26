import {
  calculateFoamRequirements,
  FOAM_APPLICATION_RATES_LPM_M2,
} from '../calculMousse';

describe('calculateFoamRequirements', () => {
  it('applique 4 L/min/m² en application douce sur liquide non miscible', () => {
    const result = calculateFoamRequirements({
      surfaceM2: 1000,
      applicationMode: 'gentle',
      liquidType: 'non_water_miscible',
      concentrationPercent: 3,
      temporizationDurationMin: 10,
      extinctionDurationMin: 20,
      availableFlowLpm: 5000,
    });

    expect(result.applicationRateLpmM2).toBe(4);
    expect(result.extinctionFlowLpm).toBe(4000);
    expect(result.temporizationFlowLpm).toBe(2000);
    expect(result.requiredSolutionVolumeL).toBe(100000);
    expect(result.requiredConcentrateVolumeL).toBe(3000);
    expect(result.requiredWaterVolumeL).toBe(97000);
    expect(result.flowMarginLpm).toBe(1000);
  });

  it('applique 8 L/min/m² en application indirecte sur liquide miscible', () => {
    const result = calculateFoamRequirements({
      surfaceM2: 250,
      applicationMode: 'indirect',
      liquidType: 'water_miscible',
      concentrationPercent: 6,
      temporizationDurationMin: 0,
      extinctionDurationMin: 20,
    });

    expect(result.applicationRateLpmM2).toBe(8);
    expect(result.extinctionFlowLpm).toBe(2000);
    expect(result.requiredSolutionVolumeL).toBe(40000);
    expect(result.requiredConcentrateVolumeL).toBe(2400);
  });

  it('reproduit les quatre taux minimaux de l’annexe VI', () => {
    expect(FOAM_APPLICATION_RATES_LPM_M2).toEqual({
      gentle: { non_water_miscible: 4, water_miscible: 4 },
      indirect: { non_water_miscible: 5, water_miscible: 8 },
    });
  });
});
