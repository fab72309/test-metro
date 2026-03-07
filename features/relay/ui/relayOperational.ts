import { roundTo } from '@/features/relay/engine/rounding';
import type { RelaySegmentInput } from '@/features/relay/engine/types';

const EPSILON = 0.001;

export const RELAY_MIN_INLET_BAR = 1;

export type RelayAssignedMeanSummary = {
  instanceId: string;
  label: string;
  nominalFlowLpm: number;
  nominalPressureBar: number;
  appliedPressureBar: number;
};

export type RelaySegmentOperationalMean = RelayAssignedMeanSummary & {
  flowCompatible: boolean;
  maxReachM: number;
};

export type RelaySegmentOperationalSummary = {
  segmentId: string;
  label: string;
  isLastSegment: boolean;
  lengthM: number;
  elevationM: number;
  hoseCount: number;
  lineLossBar: number;
  elevationLossBar: number;
  downstreamTargetBar: number;
  requiredPressureBar: number;
  availablePressureBar: number;
  deltaBar: number;
  isCovered: boolean;
  assignedMeans: RelaySegmentOperationalMean[];
};

type BuildRelaySegmentOperationalSummariesParams = {
  segments: RelaySegmentInput[];
  assignedMeansBySegment: Record<string, RelayAssignedMeanSummary[]>;
  hoseLengthM: number;
  jBarPerHm: number;
  targetOutletBar: number;
  demandFlowLpm: number;
  minInletBar?: number;
};

export function buildRelaySegmentOperationalSummaries({
  segments,
  assignedMeansBySegment,
  hoseLengthM,
  jBarPerHm,
  targetOutletBar,
  demandFlowLpm,
  minInletBar = RELAY_MIN_INLET_BAR,
}: BuildRelaySegmentOperationalSummariesParams): RelaySegmentOperationalSummary[] {
  return segments.map((segment, index) => {
    const isLastSegment = index === segments.length - 1;
    const downstreamTargetBar = isLastSegment ? Math.max(0, targetOutletBar) : Math.max(0, minInletBar);
    const safeLengthM = Math.max(0, segment.lengthM);
    const lineLossBar = roundTo(Math.max(0, jBarPerHm) * (safeLengthM / 100), 2);
    const elevationLossBar = roundTo(segment.elevationM / 10, 2);
    const requiredPressureBar = roundTo(
      Math.max(0, lineLossBar + elevationLossBar + downstreamTargetBar),
      2
    );
    const hoseCount =
      Number.isFinite(hoseLengthM) && hoseLengthM > 0 ? Math.ceil(safeLengthM / hoseLengthM) : 0;
    const assignedMeans = (assignedMeansBySegment[segment.id] ?? []).map((mean) => ({
      ...mean,
      flowCompatible: mean.nominalFlowLpm + EPSILON >= demandFlowLpm,
      maxReachM:
        jBarPerHm > EPSILON
          ? roundTo((Math.max(0, mean.appliedPressureBar - downstreamTargetBar) / jBarPerHm) * 100, 0)
          : safeLengthM,
    }));
    const availablePressureBar = roundTo(
      assignedMeans.reduce((sum, mean) => sum + mean.appliedPressureBar, 0),
      2
    );
    const deltaBar = roundTo(availablePressureBar - requiredPressureBar, 2);

    return {
      segmentId: segment.id,
      label: `Tronçon ${index + 1}`,
      isLastSegment,
      lengthM: safeLengthM,
      elevationM: segment.elevationM,
      hoseCount,
      lineLossBar,
      elevationLossBar,
      downstreamTargetBar,
      requiredPressureBar,
      availablePressureBar,
      deltaBar,
      isCovered: assignedMeans.length > 0 && deltaBar >= -EPSILON,
      assignedMeans,
    };
  });
}
