export type PeiCapacityStatus = 'sufficient' | 'insufficient';

export type PeiCapacityResult = {
  measuredAtOneBarLpm: number;
  requiredFlowLpm: number;
  marginLpm: number;
  measuredAtOneBarM3h: number;
  requiredFlowM3h: number;
  coveragePercent: number;
  status: PeiCapacityStatus;
};

export function evaluatePeiCapacity(
  measuredAtOneBarLpm: number,
  requiredFlowLpm: number
): PeiCapacityResult {
  if (!Number.isFinite(measuredAtOneBarLpm) || measuredAtOneBarLpm <= 0) {
    throw new Error('Le débit mesuré à 1 bar doit être strictement positif.');
  }
  if (!Number.isFinite(requiredFlowLpm) || requiredFlowLpm <= 0) {
    throw new Error('Le débit nécessaire doit être strictement positif.');
  }

  const marginLpm = measuredAtOneBarLpm - requiredFlowLpm;

  return {
    measuredAtOneBarLpm,
    requiredFlowLpm,
    marginLpm,
    measuredAtOneBarM3h: measuredAtOneBarLpm * 0.06,
    requiredFlowM3h: requiredFlowLpm * 0.06,
    coveragePercent: (measuredAtOneBarLpm / requiredFlowLpm) * 100,
    status: marginLpm >= 0 ? 'sufficient' : 'insufficient',
  };
}
