import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RelayScreen from '@/features/relay/ui/RelayScreen';
import type { RelayScenarioV2 } from '@/features/relay/engine/types';

const mockUpdateScenario = jest.fn();
const mockUpdateSource = jest.fn();
const mockSetPumpOverrides = jest.fn();
const mockAddSegment = jest.fn();
const mockRemoveSegment = jest.fn();
const mockUpdateSegment = jest.fn();
const mockResetScenario = jest.fn();

const scenario: RelayScenarioV2 = {
  method: 'abaque',
  missionDuration: 'h1_2',
  diameterMm: 110,
  establishmentLengthM: 1500,
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
  segments: [{ id: 'S1', lengthM: 1500, elevationM: 60 }],
  source: {
    mode: 'aspiration',
    pressureEffectiveBar: 0,
    qMaxPiLpm: null,
    qAt1BarLpm: null,
    pStaticBar: null,
    aspirationHeightM: 0,
    reserveVolumeM3: 50,
    reserveLabel: 'inépuisable',
  },
  pumpOverrides: [],
};

jest.mock('@/context/ThemeContext', () => ({
  useThemeContext: () => ({ theme: 'light' }),
}));

jest.mock('@/context/PertesDeChargeTableContext', () => ({
  usePertesDeChargeTable: () => ({ table: {}, loading: false }),
}));

jest.mock('@/features/relay/store/relayStore', () => ({
  useRelayStore: () => ({
    scenario,
    loading: false,
    defaults: { missionDuration: 'h1_2', targetOutletBar: 6 },
    updateScenario: mockUpdateScenario,
    updateSource: mockUpdateSource,
    setPumpOverrides: mockSetPumpOverrides,
    addSegment: mockAddSegment,
    removeSegment: mockRemoveSegment,
    updateSegment: mockUpdateSegment,
    updateDefaultSettings: jest.fn(),
    setSegments: jest.fn(),
    resetScenario: mockResetScenario,
  }),
}));

jest.mock('@/features/relay/store/engineCatalogStore', () => ({
  useEngineCatalogStore: () => ({
    loading: false,
    models: [
      {
        id: 'fpt-2000-15',
        label: 'FPT',
        nominalFlowLpm: 2000,
        nominalPressureBar: 15,
        maxPressureBar: 15,
        enabled: true,
      },
    ],
  }),
}));

jest.mock('@/components/ui/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const { Text } = jest.requireActual('react-native');
    return <Text>{title}</Text>;
  },
}));

describe('RelayScreen UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('change le diamètre', () => {
    const screen = render(<RelayScreen />);
    fireEvent.press(screen.getByText('70 mm'));

    expect(mockUpdateScenario).toHaveBeenCalledWith({ diameterMm: 70 });
  });

  it('change la longueur de tuyau', () => {
    const screen = render(<RelayScreen />);
    fireEvent.press(screen.getByText('20 m'));

    expect(mockUpdateScenario).toHaveBeenCalledWith({ hoseLengthM: 20 });
  });

  it('incrémente le nombre de lignes', () => {
    const screen = render(<RelayScreen />);
    const plusButtons = screen.getAllByText('+');
    fireEvent.press(plusButtons[0]);

    expect(mockUpdateScenario).toHaveBeenCalledWith({ lineCount: 2 });
  });

  it('ajuste l’espacement abaque', () => {
    const screen = render(<RelayScreen />);
    fireEvent.press(screen.getByText('+ 1 tuyau'));

    expect(mockUpdateScenario).toHaveBeenCalledWith({ spacingAdjustmentHoses: 1 });
  });

  it('sélectionne la durée mission 4-6h et recale %W', () => {
    const screen = render(<RelayScreen />);
    fireEvent.press(screen.getByText('4-6h'));

    expect(mockUpdateScenario).toHaveBeenCalledWith({ missionDuration: 'h4_6', workRatePercent: 55 });
  });

  it('sélectionne une valeur %W doctrinale', () => {
    const screen = render(<RelayScreen />);
    fireEvent.press(screen.getByText('80%'));

    expect(mockUpdateScenario).toHaveBeenCalledWith({ workRatePercent: 80 });
  });

  it('ouvre la popup de placement des moyens depuis la phase 3', () => {
    const screen = render(<RelayScreen />);
    fireEvent.press(screen.getAllByText('Placer un moyen')[0]);

    expect(screen.getByText('Sélectionner un tronçon puis affecter les engins issus de la phase 2.')).toBeTruthy();
  });

  it('ne rend plus les blocs supprimés après les champs de la phase 3', () => {
    const screen = render(<RelayScreen />);

    expect(screen.queryByText('Placement des engins')).toBeNull();
    expect(screen.queryByText('Placement des engins (drag & drop)')).toBeNull();
    expect(screen.queryByText('Engin de référence')).toBeNull();
    expect(screen.queryByText('Tableau opérationnel')).toBeNull();
    expect(screen.queryByText(/Relais recommandé/)).toBeNull();
  });

  it('affiche la synthèse source et le besoin résiduel pour les engins', () => {
    const screen = render(<RelayScreen />);

    expect(screen.getByText('Alimentation source')).toBeTruthy();
    expect(screen.getAllByText('Apport source pris en compte (bar)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Besoin à fournir par les engins (bar)').length).toBeGreaterThan(0);
    expect(screen.getByText('Pression de refoulement nécessaire (bar)')).toBeTruthy();
  });

  it('affiche le récapitulatif opérationnel et les alertes de processus', () => {
    const screen = render(<RelayScreen />);

    expect(screen.getByText('Récapitulatif opérationnel')).toBeTruthy();
    expect(screen.getByText('Moyens à mettre en oeuvre')).toBeTruthy();
    expect(screen.getByText('Alertes opérationnelles')).toBeTruthy();
  });
});
