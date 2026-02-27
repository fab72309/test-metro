import React from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeContext } from '@/context/ThemeContext';
import type { RelaySchemaNode } from '@/features/relay/engine/types';
import { formatNumber } from '@/utils/format';

type RelayDiagramModalProps = {
  visible: boolean;
  onClose: () => void;
  schema: RelaySchemaNode[];
  totalLengthM: number;
  hoseLengthM: 20 | 40;
};

export function RelayDiagramModal({
  visible,
  onClose,
  schema,
  totalLengthM,
  hoseLengthM,
}: RelayDiagramModalProps) {
  const { theme } = useThemeContext();
  const palette = Colors[theme];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card style={[styles.modalCard, { backgroundColor: palette.card }]}>
          <Title>Schéma du relais</Title>
          <Body>Longueur totale: {formatNumber(totalLengthM)} m</Body>

          <ScrollView horizontal contentContainerStyle={styles.diagramScroll} showsHorizontalScrollIndicator={false}>
            <View style={styles.diagramRow}>
              {schema.map((node, idx) => (
                <View key={node.id} style={styles.nodeWrap}>
                  <View style={[styles.nodeCircle, { borderColor: palette.primary }]}> 
                    <Caption style={{ color: palette.text }}>{node.label}</Caption>
                  </View>
                  {idx > 0 ? (
                    <Caption style={{ color: palette.secondaryText }}>
                      +{formatNumber(node.distanceFromPrevM)} m /{' '}
                      {Math.floor(node.distanceFromPrevM / hoseLengthM)} tuyaux
                    </Caption>
                  ) : (
                    <Caption style={{ color: palette.secondaryText }}>Départ</Caption>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.actionsRow}>
            <Button title="Fermer" variant="outline" onPress={onClose} />
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
    maxHeight: '80%',
  },
  diagramScroll: {
    paddingVertical: Layout.spacing.sm,
  },
  diagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  nodeWrap: {
    alignItems: 'center',
    gap: Layout.spacing.xs,
    minWidth: 108,
  },
  nodeCircle: {
    minWidth: 90,
    minHeight: 42,
    borderWidth: 2,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.sm,
  },
  actionsRow: {
    alignItems: 'flex-end',
  },
});
