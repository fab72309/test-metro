import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Body } from '@/components/ui/Typography';
import { Layout } from '@/constants/Layout';
import type { RelaySegmentInput } from '@/features/relay/engine/types';
import type {
  RelayAssignedMeanSummary,
  RelaySegmentOperationalSummary,
} from '@/features/relay/ui/relayOperational';
import { parseNumber } from '@/features/relay/engine/validate';
import { formatNumber } from '@/utils/format';

type RelaySegmentsEditorProps = {
  segments: RelaySegmentInput[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<RelaySegmentInput>) => void;
  onRemove: (id: string) => void;
  onOpenPlacement: (segmentId: string) => void;
  workRatePercent: number;
  assignedMeansBySegment: Record<string, RelayAssignedMeanSummary[]>;
  segmentOperationalById: Record<string, RelaySegmentOperationalSummary>;
};

export function RelaySegmentsEditor({
  segments,
  onAdd,
  onUpdate,
  onRemove,
  onOpenPlacement,
  workRatePercent,
  assignedMeansBySegment,
  segmentOperationalById,
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

      {segments.map((segment, index) => {
        const summary = segmentOperationalById[segment.id];
        const assigned = summary?.assignedMeans ?? assignedMeansBySegment[segment.id] ?? [];

        return (
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
              {assigned.length === 0 ? (
                <Body style={styles.assignedEmpty}>Aucun moyen affecté.</Body>
              ) : (
                assigned.map((mean) => (
                  <Body key={`assigned-${segment.id}-${mean.instanceId}`} style={styles.assignedRow}>
                    • {mean.label} - Consigne indicative @{formatNumber(workRatePercent)}%W{' '}
                    {formatNumber(mean.appliedPressureBar)} bar - Débit nominal {formatNumber(mean.nominalFlowLpm)} L/min
                    {'maxReachM' in mean ? ` - Portée théorique ${formatNumber(mean.maxReachM)} m` : ''}
                  </Body>
                ))
              )}
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
                  {assigned.length === 0 || !summary ? (
                    <>
                      <Body style={styles.pressureTitle}>Pression tronçon</Body>
                      <Body style={styles.pressurePending}>Affecter un moyen</Body>
                    </>
                  ) : (
                    <>
                      <Body style={styles.pressureTitle}>Pression requise tronçon</Body>
                      <Body style={styles.pressureValue}>{formatNumber(summary.requiredPressureBar)} bar</Body>
                      <Body style={styles.pressureMeta}>
                        J {formatNumber(summary.lineLossBar)} + Z {formatNumber(summary.elevationLossBar)} + aval{' '}
                        {formatNumber(summary.downstreamTargetBar)} = {formatNumber(summary.requiredPressureBar)}
                      </Body>
                      <Body style={styles.pressureMeta}>
                        Capacité affectée: {formatNumber(summary.availablePressureBar)} bar ({assigned.length} moyen(x))
                      </Body>
                      {!summary.assignedMeans.every((mean) => mean.flowCompatible) ? (
                        <Body style={styles.pressureAlert}>
                          Débit nominal d’au moins un engin inférieur au débit relais demandé.
                        </Body>
                      ) : null}
                      <View style={styles.capacityStatusRow}>
                        <View style={[styles.capacityDot, summary.isCovered ? styles.capacityDotOk : styles.capacityDotKo]} />
                        <Body style={summary.isCovered ? styles.capacityStatusOk : styles.capacityStatusKo}>
                          {summary.isCovered
                            ? `Compatible (+${formatNumber(summary.deltaBar)} bar)`
                            : `Insuffisant (${formatNumber(summary.deltaBar)} bar)`}
                        </Body>
                      </View>
                    </>
                  )}
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
        );
      })}
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
    alignItems: 'flex-start',
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
    marginTop: 22,
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
    minHeight: 108,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.2)',
    padding: Layout.spacing.xs,
    gap: 2,
  },
  pressureTitle: {
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 0,
  },
  pressureValue: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 0,
  },
  pressurePending: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.75,
    marginBottom: 0,
  },
  pressureAlert: {
    fontSize: 11,
    lineHeight: 14,
    color: '#D32F2F',
    fontWeight: '700',
    marginBottom: 0,
  },
  pressureMeta: {
    fontSize: 11,
    lineHeight: 14,
    opacity: 0.82,
    marginBottom: 0,
  },
  capacityStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  capacityDot: {
    width: 8,
    height: 8,
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
    fontSize: 12,
    lineHeight: 15,
    marginBottom: 0,
  },
  capacityStatusKo: {
    color: '#D32F2F',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 15,
    marginBottom: 0,
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
