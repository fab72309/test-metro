export type FoamApplicationMode = 'gentle' | 'indirect';
export type FoamLiquidType = 'non_water_miscible' | 'water_miscible';

export const FOAM_APPLICATION_RATES_LPM_M2: Record<
  FoamApplicationMode,
  Record<FoamLiquidType, number>
> = {
  gentle: {
    non_water_miscible: 4,
    water_miscible: 4,
  },
  indirect: {
    non_water_miscible: 5,
    water_miscible: 8,
  },
};

export type FoamCalculationInput = {
  surfaceM2: number;
  applicationMode: FoamApplicationMode;
  liquidType: FoamLiquidType;
  concentrationPercent: number;
  temporizationDurationMin: number;
  extinctionDurationMin: number;
  availableFlowLpm?: number;
};

export type FoamCalculationResult = {
  applicationRateLpmM2: number;
  extinctionFlowLpm: number;
  temporizationFlowLpm: number;
  requiredSolutionVolumeL: number;
  requiredWaterVolumeL: number;
  requiredConcentrateVolumeL: number;
  availableFlowLpm: number;
  flowMarginLpm: number;
};

export function calculateFoamRequirements(
  input: FoamCalculationInput
): FoamCalculationResult {
  if (!Number.isFinite(input.surfaceM2) || input.surfaceM2 <= 0) {
    throw new Error('La surface doit être strictement positive.');
  }
  if (
    !Number.isFinite(input.concentrationPercent) ||
    input.concentrationPercent <= 0 ||
    input.concentrationPercent >= 100
  ) {
    throw new Error('La concentration doit être comprise entre 0 et 100 %.');
  }
  if (
    !Number.isFinite(input.temporizationDurationMin) ||
    input.temporizationDurationMin < 0 ||
    !Number.isFinite(input.extinctionDurationMin) ||
    input.extinctionDurationMin <= 0
  ) {
    throw new Error('Les durées de calcul sont invalides.');
  }

  const applicationRateLpmM2 =
    FOAM_APPLICATION_RATES_LPM_M2[input.applicationMode][input.liquidType];
  const extinctionFlowLpm = input.surfaceM2 * applicationRateLpmM2;
  const temporizationFlowLpm = extinctionFlowLpm / 2;
  const requiredSolutionVolumeL =
    temporizationFlowLpm * input.temporizationDurationMin +
    extinctionFlowLpm * input.extinctionDurationMin;
  const requiredConcentrateVolumeL =
    requiredSolutionVolumeL * (input.concentrationPercent / 100);
  const requiredWaterVolumeL =
    requiredSolutionVolumeL - requiredConcentrateVolumeL;
  const availableFlowLpm = Math.max(0, input.availableFlowLpm ?? 0);

  return {
    applicationRateLpmM2,
    extinctionFlowLpm,
    temporizationFlowLpm,
    requiredSolutionVolumeL,
    requiredWaterVolumeL,
    requiredConcentrateVolumeL,
    availableFlowLpm,
    flowMarginLpm: availableFlowLpm - extinctionFlowLpm,
  };
}
