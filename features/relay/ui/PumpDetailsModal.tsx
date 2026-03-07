import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeContext } from '@/context/ThemeContext';
import type {
  RelayEngineModelV2,
  RelayPumpOverrideV2,
  RelayPumpPlanV2,
} from '@/features/relay/engine/types';
import { parseNumber } from '@/features/relay/engine/validate';
import { formatNumber } from '@/utils/format';

type PumpDetailsModalProps = {
  visible: boolean;
  pumps: RelayPumpPlanV2[];
  pumpModel: RelayEngineModelV2;
  onClose: () => void;
  onSave: (overrides: RelayPumpOverrideV2[]) => void;
};

type PumpDraft = {
  index: number;
  flowLpm: string;
  setpointBar: string;
  recommendedFlowLpm: number;
  recommendedSetpointBar: number;
  isCustom: boolean;
};

const keyboardTypeDec = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'decimal-pad';

export function PumpDetailsModal({
  visible,
  pumps,
  pumpModel,
  onClose,
  onSave,
}: PumpDetailsModalProps) {
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const [error, setError] = useState('');
  const [rows, setRows] = useState<PumpDraft[]>([]);

  useEffect(() => {
    if (!visible) return;
    setRows(
      pumps.map((pump) => ({
        index: pump.index,
        flowLpm: String(pump.flowLpm),
        setpointBar: String(pump.setpointBar),
        recommendedFlowLpm: pump.flowLpm,
        recommendedSetpointBar: pump.recommendedBar,
        isCustom: pump.isOverride,
      }))
    );
    setError('');
  }, [pumps, visible]);

  const handleSave = () => {
    const overrides: RelayPumpOverrideV2[] = [];

    for (const row of rows) {
      const flow = parseNumber(row.flowLpm);
      const setpoint = parseNumber(row.setpointBar);

      if (flow === null || flow <= 0 || setpoint === null || setpoint < 0) {
        setError('Valeurs invalides pour une ou plusieurs pompes.');
        return;
      }

      if (setpoint > pumpModel.maxPressureBar) {
        setError(`Consigne > ${pumpModel.maxPressureBar} bar sur une pompe.`);
        return;
      }

      const hasFlowOverride = Math.abs(flow - row.recommendedFlowLpm) > 0.01;
      const hasSetpointOverride = Math.abs(setpoint - row.recommendedSetpointBar) > 0.01;

      if (hasFlowOverride || hasSetpointOverride) {
        overrides.push({
          index: row.index,
          flowLpm: flow,
          setpointBar: setpoint,
        });
      }
    }

    onSave(overrides);
    onClose();
  };

  const rowsView = useMemo(
    () =>
      rows.map((row) => (
        <Card key={`pump-row-${row.index}`} variant="filled" animated={false} style={styles.rowCard}>
          <View style={styles.rowHeader}>
            <Label>Pompe n°{row.index}</Label>
            <Caption style={{ color: row.isCustom ? palette.warning : palette.secondaryText }}>
              {row.isCustom ? 'Personnalisée' : 'Recommandée'}
            </Caption>
          </View>

          <Caption>
            Cible: {formatNumber(row.recommendedFlowLpm)} L/min - {formatNumber(row.recommendedSetpointBar)} bar
          </Caption>

          <View style={styles.rowInputs}>
            <Input
              label="Débit"
              value={row.flowLpm}
              keyboardType={keyboardTypeDec}
              onChangeText={(text) =>
                setRows((prev) =>
                  prev.map((item) => (item.index === row.index ? { ...item, flowLpm: text } : item))
                )
              }
              containerStyle={styles.inputCol}
            />
            <Input
              label="Pression (bar)"
              value={row.setpointBar}
              keyboardType={keyboardTypeDec}
              onChangeText={(text) =>
                setRows((prev) =>
                  prev.map((item) => (item.index === row.index ? { ...item, setpointBar: text } : item))
                )
              }
              containerStyle={styles.inputCol}
            />
          </View>
        </Card>
      )),
    [palette.secondaryText, palette.warning, rows]
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card style={[styles.modalCard, { backgroundColor: palette.card }]}>
          <Title>Modifier caractéristiques des pompes</Title>
          <Body>
            Modèle {pumpModel.label} - nominal {formatNumber(pumpModel.nominalFlowLpm)} L/min - max{' '}
            {formatNumber(pumpModel.maxPressureBar)} bar
          </Body>

          {error ? <Caption style={{ color: palette.link }}>{error}</Caption> : null}

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {rowsView}
          </ScrollView>

          <View style={styles.actionsRow}>
            <Button title="Annuler" variant="outline" onPress={onClose} style={styles.actionBtn} />
            <Button title="Valider" onPress={handleSave} style={styles.actionBtn} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Layout.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalCard: {
    gap: Layout.spacing.md,
    maxHeight: '88%',
  },
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    gap: Layout.spacing.sm,
    paddingBottom: Layout.spacing.xs,
  },
  rowCard: {
    marginVertical: 0,
    gap: Layout.spacing.xs,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  inputCol: {
    flex: 1,
    marginBottom: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
