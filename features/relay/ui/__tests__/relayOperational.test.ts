import { buildRelaySegmentOperationalSummaries, RELAY_MIN_INLET_BAR } from '@/features/relay/ui/relayOperational';

describe('relayOperational', () => {
  it('applique la pression cible sur le dernier tronçon et la marge mini sur les tronçons intermédiaires', () => {
    const summaries = buildRelaySegmentOperationalSummaries({
      segments: [
        { id: 'S1', lengthM: 500, elevationM: 0 },
        { id: 'S2', lengthM: 500, elevationM: 0 },
      ],
      assignedMeansBySegment: {
        S1: [
          {
            instanceId: 'fpt-1',
            label: 'FPT #1',
            nominalFlowLpm: 2000,
            nominalPressureBar: 15,
            appliedPressureBar: 10,
          },
        ],
        S2: [
          {
            instanceId: 'fpt-2',
            label: 'FPT #2',
            nominalFlowLpm: 2000,
            nominalPressureBar: 15,
            appliedPressureBar: 10,
          },
        ],
      },
      hoseLengthM: 40,
      jBarPerHm: 0.5,
      targetOutletBar: 6,
      demandFlowLpm: 1500,
      minInletBar: RELAY_MIN_INLET_BAR,
    });

    expect(summaries[0].requiredPressureBar).toBe(3.5);
    expect(summaries[0].assignedMeans[0].maxReachM).toBe(1800);
    expect(summaries[1].requiredPressureBar).toBe(8.5);
    expect(summaries[1].assignedMeans[0].maxReachM).toBe(800);
  });

  it('cumule la capacité des moyens affectés sur un même tronçon', () => {
    const summaries = buildRelaySegmentOperationalSummaries({
      segments: [{ id: 'S1', lengthM: 400, elevationM: 10 }],
      assignedMeansBySegment: {
        S1: [
          {
            instanceId: 'm1',
            label: 'FPT #1',
            nominalFlowLpm: 2000,
            nominalPressureBar: 15,
            appliedPressureBar: 7.5,
          },
          {
            instanceId: 'm2',
            label: 'FPT #2',
            nominalFlowLpm: 2000,
            nominalPressureBar: 15,
            appliedPressureBar: 7.5,
          },
        ],
      },
      hoseLengthM: 40,
      jBarPerHm: 0.6,
      targetOutletBar: 6,
      demandFlowLpm: 1500,
    });

    expect(summaries[0].requiredPressureBar).toBe(9.4);
    expect(summaries[0].availablePressureBar).toBe(15);
    expect(summaries[0].deltaBar).toBe(5.6);
    expect(summaries[0].isCovered).toBe(true);
  });
});
