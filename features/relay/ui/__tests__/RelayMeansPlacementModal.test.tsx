import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { RelayMeansPlacementModal } from '@/features/relay/ui/RelayMeansPlacementModal';
import type { RelaySegmentInput } from '@/features/relay/engine/types';
import type { RelayDistributionEngine } from '@/features/relay/ui/RelayMeansDistributionBoard';

jest.mock('@/context/ThemeContext', () => ({
  useThemeContext: () => ({ theme: 'light' }),
}));

describe('RelayMeansPlacementModal', () => {
  const segments: RelaySegmentInput[] = [
    { id: 'S1', lengthM: 800, elevationM: 0 },
    { id: 'S2', lengthM: 700, elevationM: 0 },
  ];

  const engines: RelayDistributionEngine[] = [
    {
      instanceId: 'fpt__1',
      label: 'FPT #1',
      nominalFlowLpm: 2000,
      nominalPressureBar: 15,
      positionM: 0,
    },
    {
      instanceId: 'fpt__2',
      label: 'FPT #2',
      nominalFlowLpm: 2000,
      nominalPressureBar: 15,
      positionM: 0,
    },
  ];

  it('n’affiche pas sur un tronçon suivant un moyen déjà affecté en amont', () => {
    const onAssign = jest.fn();
    const onRemove = jest.fn();
    const screen = render(
      <RelayMeansPlacementModal
        visible
        onClose={jest.fn()}
        targetSegmentId="S2"
        segments={segments}
        engines={engines}
        workRatePercent={75}
        jBarPerHm={1.2}
        totalLengthM={1500}
        assignments={{ S1: ['fpt__1'] }}
        onAssign={onAssign}
        onRemove={onRemove}
      />
    );

    expect(screen.queryByText('FPT #1')).toBeNull();
    expect(screen.getByText('FPT #2')).toBeTruthy();

    fireEvent.press(screen.getByText('Affecter'));
    expect(onAssign).toHaveBeenCalledWith('S2', 'fpt__2');
  });
});
