import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Body } from '@/components/ui/Typography';
import { Layout } from '@/constants/Layout';
import type { RelaySegmentInput } from '@/features/relay/engine/types';
import { parseNumber } from '@/features/relay/engine/validate';
import { formatNumber } from '@/utils/format';

type RelaySegmentsEditorProps = {
  segments: RelaySegmentInput[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<RelaySegmentInput>) => void;
  onRemove: (id: string) => void;
  onOpenPlacement: (segmentId: string) => void;
  jBarPerHm: number;
  assignedMeansBySegment: Record<string, Array<{ instanceId: string; label: string; appliedPressureBar: number; dMaxM: number }>>;
};

export function RelaySegmentsEditor({
  segments,
  onAdd,
  onUpdate,
  onRemove,
  onOpenPlacement,
  jBarPerHm,
  assignedMeansBySegment,
}: RelaySegmentsEditorProps) {
  const stepLength = (segmentId: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    onUpdate(segmentId, { lengthM: next });
  };

  const stepElevation = (segmentId: string, current: number, delta: number) => {
    onUpdate(segmentId, { elevationM: current + delta });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Button title="+ Tronçon" size="sm" onPress={onAdd} />
      </View>

      {segments.map((segment, index) => (
        <Card key={segment.id} variant="filled" animated={false} style={styles.segmentCard}>
          <View style={styles.segmentHeaderRow}>
            <Body style={styles.segmentTitle}>Tronçon {index + 1}</Body>
            <Button
              title="Placer un moyen"
              size="sm"
              onPress={() => onOpenPlacement(segment.id)}
              style={styles.placeMeansBtn}
            />
          </View>

          <View style={styles.assignedBlock}>
            {(() => {
              const assigned = assignedMeansBySegment[segment.id] ?? [];
              if (assigned.length === 0) {
                return <Body style={styles.assignedEmpty}>Aucun moyen affecté.</Body>;
              }
              return assigned.map((mean) => (
                <Body key={`assigned-${segment.id}-${mean.instanceId}`} style={styles.assignedRow}>
                  • {mean.label} - Pr dispo {mean.appliedPressureBar.toFixed(2)} bar - D max {Math.round(mean.dMaxM)} m
                </Body>
              ));
            })()}
          </View>

          <View style={styles.fieldsStack}>
            <View style={styles.inputsAndPressureRow}>
              <View style={styles.fieldsColumn}>
                <View style={styles.fieldRow}>
                  <Input
                    label="Longueur (m)"
                    value={String(segment.lengthM)}
                    onChangeText={(text) => {
                      const parsed = parseNumber(text);
                      if (parsed !== null) onUpdate(segment.id, { lengthM: parsed });
                    }}
                    keyboardType="decimal-pad"
                    containerStyle={styles.fieldInput}
                    helperText=" "
                  />
                  <View style={styles.stepperInline}>
                    <Button
                      title="+"
                      size="sm"
                      style={styles.stepperBtn}
                      onPress={() => stepLength(segment.id, segment.lengthM, 10)}
                    />
                    <Button
                      title="-"
                      size="sm"
                      variant="outline"
                      style={styles.stepperBtn}
                      onPress={() => stepLength(segment.id, segment.lengthM, -10)}
                    />
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <Input
                    label="Dénivelé (m)"
                    value={String(segment.elevationM)}
                    onChangeText={(text) => {
                      const parsed = parseNumber(text);
                      if (parsed !== null) onUpdate(segment.id, { elevationM: parsed });
                    }}
                    keyboardType="decimal-pad"
                    containerStyle={styles.fieldInput}
                    helperText="Montée + / Descente -"
                  />
                  <View style={styles.stepperInline}>
                    <Button
                      title="+"
                      size="sm"
                      style={styles.stepperBtn}
                      onPress={() => stepElevation(segment.id, segment.elevationM, 1)}
                    />
                    <Button
                      title="-"
                      size="sm"
                      variant="outline"
                      style={styles.stepperBtn}
                      onPress={() => stepElevation(segment.id, segment.elevationM, -1)}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.pressureBlock}>
                {(() => {
                  const assigned = assignedMeansBySegment[segment.id] ?? [];
                  if (assigned.length === 0) {
                    return (
                      <>
                        <Body style={styles.pressureTitle}>Pression tronçon</Body>
                        <Body style={styles.pressurePending}>Affecter un moyen</Body>
                      </>
                    );
                  }
                  const selected = assigned[0];
                  const lineLossBar = Math.max(0, jBarPerHm) * (Math.max(0, segment.lengthM) / 100);
                  const elevationBar = segment.elevationM / 10;
                  const requiredPressureBar = lineLossBar + elevationBar;
                  const isWithinCapacity = requiredPressureBar <= selected.appliedPressureBar + 0.001;

                  return (
                    <>
                      <Body style={styles.pressureTitle}>Pression nécessaire tronçon</Body>
                      <Body style={styles.pressureValue}>{formatNumber(requiredPressureBar)} bar</Body>
                      <Body style={styles.pressureMeta}>{selected.label}</Body>
                      <Body style={styles.pressureMeta}>
                        J {formatNumber(lineLossBar)} + Z {formatNumber(elevationBar)} = {formatNumber(requiredPressureBar)}
                      </Body>
                      <Body style={styles.pressureMeta}>Capacité engin: {formatNumber(selected.appliedPressureBar)} bar</Body>
                      <View style={styles.capacityStatusRow}>
                        <View style={[styles.capacityDot, isWithinCapacity ? styles.capacityDotOk : styles.capacityDotKo]} />
                        <Body style={isWithinCapacity ? styles.capacityStatusOk : styles.capacityStatusKo}>
                          {isWithinCapacity ? 'Compatible avec la capacité' : 'Supérieur à la capacité'}
                        </Body>
                      </View>
                    </>
                  );
                })()}
              </View>
            </View>
          </View>

          <View style={styles.segmentActions}>
            <Button
              title="Retirer"
              variant="outline"
              size="sm"
              onPress={() => onRemove(segment.id)}
            />
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Layout.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  segmentCard: {
    marginVertical: 0,
    gap: Layout.spacing.sm,
  },
  segmentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    flexWrap: 'wrap',
  },
  segmentTitle: {
    fontWeight: '700',
  },
  placeMeansBtn: {
    alignSelf: 'flex-start',
  },
  fieldsStack: {
    gap: Layout.spacing.sm,
  },
  inputsAndPressureRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    alignItems: 'flex-start',
  },
  fieldsColumn: {
    flex: 1,
    gap: Layout.spacing.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    alignItems: 'flex-end',
  },
  fieldInput: {
    width: '34%',
    minWidth: 130,
    maxWidth: 220,
    marginBottom: 0,
  },
  stepperInline: {
    flexDirection: 'row',
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.lg,
    alignItems: 'center',
  },
  stepperBtn: {
    minWidth: Layout.sizes.controlHeight,
    minHeight: Layout.sizes.controlHeight,
    height: Layout.sizes.controlHeight,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  pressureBlock: {
    flex: 1,
    minHeight: 132,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
    padding: Layout.spacing.sm,
    gap: 4,
  },
  pressureTitle: {
    fontWeight: '700',
  },
  pressureValue: {
    fontWeight: '700',
    fontSize: 18,
  },
  pressurePending: {
    opacity: 0.75,
  },
  pressureMeta: {
    fontSize: 12,
    opacity: 0.82,
  },
  capacityStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  capacityDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  capacityDotOk: {
    backgroundColor: '#2E7D32',
  },
  capacityDotKo: {
    backgroundColor: '#D32F2F',
  },
  capacityStatusOk: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  capacityStatusKo: {
    color: '#D32F2F',
    fontWeight: '700',
  },
  assignedBlock: {
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
    padding: Layout.spacing.sm,
    gap: 4,
  },
  assignedEmpty: {
    opacity: 0.75,
  },
  assignedRow: {
    fontSize: 13,
  },
  segmentActions: {
    alignItems: 'flex-start',
  },
});
