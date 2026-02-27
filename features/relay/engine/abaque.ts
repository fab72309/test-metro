import type { RelayAbaqueData, RelayAbaquePoint, RelayAbaquePumpPoint, RelayPumpPlanV2 } from './types';
import { roundTo } from './rounding';

const SAMPLE_POINTS = 24;

export function buildAbaqueData(
  totalLengthM: number,
  jmoyBarPerHm: number,
  targetOutletBar: number,
  pumps: RelayPumpPlanV2[]
): RelayAbaqueData {
  const safeLength = Math.max(1, totalLengthM);
  const safeJmoy = Number.isFinite(jmoyBarPerHm) ? jmoyBarPerHm : 0;

  const points: RelayAbaquePoint[] = Array.from({ length: SAMPLE_POINTS + 1 }, (_, idx) => {
    const xM = (safeLength * idx) / SAMPLE_POINTS;
    const remainingHm = (safeLength - xM) / 100;
    const requiredBar = roundTo(targetOutletBar + safeJmoy * remainingHm, 2);
    return {
      xM,
      requiredBar,
    };
  });

  const pumpPoints: RelayAbaquePumpPoint[] = pumps.map((pump) => ({
    index: pump.index,
    xM: pump.positionM,
    bar: pump.setpointBar,
  }));

  const maxDataY = Math.max(
    ...points.map((point) => point.requiredBar),
    ...pumpPoints.map((point) => point.bar),
    targetOutletBar,
    1
  );

  return {
    points,
    pumpPoints,
    maxYBar: roundTo(maxDataY * 1.15, 2),
  };
}
