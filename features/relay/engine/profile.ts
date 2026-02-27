export type RelayProfile = {
  pumpCount: number;
  segmentLengthM: number;
  segmentLengthsM: number[];
};

export function buildRelayProfile(lengthM: number, pumpCount: number): RelayProfile {
  const safePumpCount = Math.max(1, pumpCount);
  const segmentLengthM = lengthM / safePumpCount;
  const segmentLengthsM = Array.from({ length: safePumpCount }, () => segmentLengthM);

  return {
    pumpCount: safePumpCount,
    segmentLengthM,
    segmentLengthsM,
  };
}
