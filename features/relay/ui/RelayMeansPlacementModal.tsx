import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeContext } from '@/context/ThemeContext';
import type { RelaySegmentInput } from '@/features/relay/engine/types';
import type { RelayDistributionEngine } from '@/features/relay/ui/RelayMeansDistributionBoard';
import { formatNumber } from '@/utils/format';

type RelayMeansPlacementModalProps = {
  visible: boolean;
  onClose: () => void;
  targetSegmentId: string | null;
  segments: RelaySegmentInput[];
  engines: RelayDistributionEngine[];
  workRatePercent: number;
  jBarPerHm: number;
  totalLengthM: number;
  minInletBar?: number;
  assignments: Record<string, string[]>;
  onAssign: (segmentId: string, instanceId: string) => void;
  onRemove: (segmentId: string, instanceId: string) => void;
};

export function RelayMeansPlacementModal({
  visible,
  onClose,
  targetSegmentId,
  segments,
  engines,
  workRatePercent,
  jBarPerHm,
  totalLengthM,
  minInletBar = 1,
  assignments,
  onAssign,
  onRemove,
}: RelayMeansPlacementModalProps) {
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(targetSegmentId);

  useEffect(() => {
    if (!visible) return;
    if (segments.length === 0) {
      setActiveSegmentId(null);
      return;
    }
    if (targetSegmentId && segments.some((segment) => segment.id === targetSegmentId)) {
      setActiveSegmentId(targetSegmentId);
      return;
    }
    if (!activeSegmentId || !segments.some((segment) => segment.id === activeSegmentId)) {
      setActiveSegmentId(segments[0].id ?? null);
    }
  }, [activeSegmentId, segments, targetSegmentId, visible]);

  const activeId = activeSegmentId ?? segments[0]?.id ?? null;
  const activeSegmentLabel = useMemo(() => {
    const idx = segments.findIndex((segment) => segment.id === activeId);
    return idx >= 0 ? `Tronçon ${idx + 1}` : 'Tronçon';
  }, [activeId, segments]);

  const engineById = useMemo(() => {
    const next: Record<string, RelayDistributionEngine> = {};
    engines.forEach((engine) => {
      next[engine.instanceId] = engine;
    });
    return next;
  }, [engines]);

  const activeAssignments = activeId ? assignments[activeId] ?? [] : [];

  const activeSegmentIndex = useMemo(
    () => segments.findIndex((segment) => segment.id === activeId),
    [activeId, segments]
  );

  const assignedUpstream = useMemo(() => {
    const used = new Set<string>();
    if (activeSegmentIndex < 0) return used;
    segments.forEach((segment, index) => {
      if (index >= activeSegmentIndex) return;
      const instanceIds = assignments[segment.id] ?? [];
      instanceIds.forEach((instanceId) => used.add(instanceId));
    });
    return used;
  }, [activeSegmentIndex, assignments, segments]);

  const activeAssignedEngines = useMemo(
    () =>
      activeAssignments
        .map((instanceId) => engineById[instanceId])
        .filter((engine): engine is RelayDistributionEngine => Boolean(engine)),
    [activeAssignments, engineById]
  );

  const availableEngines = useMemo(
    () =>
      engines.filter(
        (engine) =>
          !assignedUpstream.has(engine.instanceId) &&
          !activeAssignments.includes(engine.instanceId)
      ),
    [activeAssignments, assignedUpstream, engines]
  );

  const describeCapacity = (engine: RelayDistributionEngine) => {
    const appliedRefoulementBar = (engine.nominalPressureBar * workRatePercent) / 100;
    const transportBar = Math.max(0, appliedRefoulementBar - minInletBar);
    const dMaxM = jBarPerHm > 0 ? (transportBar / jBarPerHm) * 100 : totalLengthM;
    return {
      appliedRefoulementBar,
      dMaxM,
    };
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card style={[styles.modalCard, { backgroundColor: palette.card }]}>
          <Title>Placer un moyen</Title>
          <Body>Sélectionner un tronçon puis affecter les engins issus de la phase 2.</Body>
          <Caption>
            Un moyen affecté en amont n’est plus affiché comme disponible sur les tronçons suivants.
          </Caption>

          {segments.length === 0 ? (
            <Caption>Aucun tronçon disponible.</Caption>
          ) : (
            <>
              <Label>Tronçon cible: {activeSegmentLabel}</Label>

              <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.block}>
                  <Label>Moyens affectés</Label>
                  {activeAssignedEngines.length === 0 ? (
                    <Caption>Aucun moyen affecté sur ce tronçon.</Caption>
                  ) : (
                    activeAssignedEngines.map((engine) => {
                      const capacity = describeCapacity(engine);
                      return (
                        <View key={`assigned-${engine.instanceId}`} style={styles.engineRow}>
                          <View style={styles.engineMeta}>
                            <Body style={styles.engineTitle}>{engine.label}</Body>
                            <Caption>
                              Pression dispo: {formatNumber(capacity.appliedRefoulementBar)} bar - Distance possible:{' '}
                              {formatNumber(capacity.dMaxM)} m
                            </Caption>
                          </View>
                          {activeId ? (
                            <Button
                              title="Retirer"
                              size="sm"
                              variant="outline"
                              onPress={() => onRemove(activeId, engine.instanceId)}
                            />
                          ) : null}
                        </View>
                      );
                    })
                  )}
                </View>

                <View style={styles.block}>
                  <Label>Moyens disponibles</Label>
                  {availableEngines.length === 0 ? (
                    <Caption>Aucun moyen disponible pour ce tronçon.</Caption>
                  ) : (
                    availableEngines.map((engine) => {
                      const capacity = describeCapacity(engine);
                      return (
                        <View key={`available-${engine.instanceId}`} style={styles.engineRow}>
                          <View style={styles.engineMeta}>
                            <Body style={styles.engineTitle}>{engine.label}</Body>
                            <Caption>
                              Pression dispo: {formatNumber(capacity.appliedRefoulementBar)} bar - Distance possible:{' '}
                              {formatNumber(capacity.dMaxM)} m
                            </Caption>
                          </View>
                          {activeId ? (
                            <Button
                              title="Affecter"
                              size="sm"
                              onPress={() => onAssign(activeId, engine.instanceId)}
                            />
                          ) : null}
                        </View>
                      );
                    })
                  )}
                </View>
              </ScrollView>
            </>
          )}

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
    gap: Layout.spacing.sm,
    maxHeight: '88%',
  },
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    gap: Layout.spacing.sm,
    paddingBottom: Layout.spacing.xs,
  },
  block: {
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
    padding: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Layout.spacing.sm,
  },
  engineMeta: {
    flex: 1,
    gap: 2,
  },
  engineTitle: {
    fontWeight: '700',
  },
  actionsRow: {
    alignItems: 'flex-end',
  },
});
