import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { Body, Caption, Label } from '@/components/ui/Typography';
import { Layout } from '@/constants/Layout';
import { formatNumber } from '@/utils/format';

const MARKER_WIDTH = 130;
const TRACK_AREA_HEIGHT = 210;
const TRACK_Y = 96;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function snapToStep(value: number, step: number) {
  if (!Number.isFinite(step) || step <= 0) return value;
  return Math.round(value / step) * step;
}

export type RelayDistributionEngine = {
  instanceId: string;
  label: string;
  nominalFlowLpm: number;
  nominalPressureBar: number;
  positionM: number;
};

type DraggableEngineMarkerProps = {
  engine: RelayDistributionEngine;
  index: number;
  trackWidth: number;
  visualLengthM: number;
  hoseLengthM: 20 | 40;
  workRatePercent: number;
  flowPerLineLpm: number;
  jBarPerHm: number;
  minInletBar: number;
  onChangePositionM: (instanceId: string, positionM: number) => void;
};

function DraggableEngineMarker({
  engine,
  index,
  trackWidth,
  visualLengthM,
  hoseLengthM,
  workRatePercent,
  flowPerLineLpm,
  jBarPerHm,
  minInletBar,
  onChangePositionM,
}: DraggableEngineMarkerProps) {
  const [livePositionM, setLivePositionM] = useState<number | null>(null);
  const dragPositionRef = useRef<number | null>(null);
  const dragStartMRef = useRef(engine.positionM);

  const currentPositionM = livePositionM ?? engine.positionM;
  const effectiveLengthM = Math.max(visualLengthM, hoseLengthM);
  const rawLeft = effectiveLengthM > 0 ? (currentPositionM / effectiveLengthM) * trackWidth : 0;
  const markerLeft = clamp(rawLeft - MARKER_WIDTH / 2, 0, Math.max(0, trackWidth - MARKER_WIDTH));
  const laneTop = index % 2 === 0 ? 6 : 118;

  const appliedRefoulementBar = roundTo((engine.nominalPressureBar * workRatePercent) / 100, 1);
  const capacityFlowAtW = roundTo((engine.nominalFlowLpm * workRatePercent) / 100, 0);
  const isFlowInsufficient = flowPerLineLpm > capacityFlowAtW;
  const transportBar = Math.max(0, appliedRefoulementBar - minInletBar);
  const dMaxM = jBarPerHm > 0 ? roundTo((transportBar / jBarPerHm) * 100, 0) : effectiveLengthM;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStartMRef.current = engine.positionM;
          dragPositionRef.current = engine.positionM;
          setLivePositionM(engine.positionM);
        },
        onPanResponderMove: (_, gestureState) => {
          if (trackWidth <= 0) return;
          const deltaM = (gestureState.dx / trackWidth) * effectiveLengthM;
          const nextM = clamp(dragStartMRef.current + deltaM, 0, effectiveLengthM);
          dragPositionRef.current = nextM;
          setLivePositionM(nextM);
        },
        onPanResponderRelease: () => {
          const rawM = dragPositionRef.current ?? engine.positionM;
          const snappedM = clamp(snapToStep(rawM, hoseLengthM), 0, effectiveLengthM);
          dragPositionRef.current = null;
          setLivePositionM(null);
          onChangePositionM(engine.instanceId, snappedM);
        },
        onPanResponderTerminate: () => {
          const rawM = dragPositionRef.current ?? engine.positionM;
          const snappedM = clamp(snapToStep(rawM, hoseLengthM), 0, effectiveLengthM);
          dragPositionRef.current = null;
          setLivePositionM(null);
          onChangePositionM(engine.instanceId, snappedM);
        },
      }),
    [effectiveLengthM, engine.instanceId, engine.positionM, hoseLengthM, onChangePositionM, trackWidth]
  );

  return (
    <View style={[styles.marker, { left: markerLeft, top: laneTop }]} {...panResponder.panHandlers}>
      <Body style={styles.markerTitle}>{engine.label}</Body>
      <Caption style={styles.markerMeta}>Pr @%W: {formatNumber(appliedRefoulementBar)} bar</Caption>
      <Caption style={styles.markerMeta}>D max: {formatNumber(dMaxM)} m</Caption>
      <Caption style={styles.markerMeta}>Q @%W: {formatNumber(capacityFlowAtW)} L/min</Caption>
      <Caption style={[styles.markerMeta, isFlowInsufficient && styles.markerMetaDanger]}>
        Q ligne: {formatNumber(flowPerLineLpm)} L/min
      </Caption>
    </View>
  );
}

type RelayMeansDistributionBoardProps = {
  totalLengthM: number;
  hoseLengthM: 20 | 40;
  workRatePercent: number;
  flowPerLineLpm: number;
  jLossTotalBar: number;
  minInletBar?: number;
  engines: RelayDistributionEngine[];
  onChangePositionM: (instanceId: string, positionM: number) => void;
};

export function RelayMeansDistributionBoard({
  totalLengthM,
  hoseLengthM,
  workRatePercent,
  flowPerLineLpm,
  jLossTotalBar,
  minInletBar = 1,
  engines,
  onChangePositionM,
}: RelayMeansDistributionBoardProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const effectiveLengthM = Math.max(totalLengthM, hoseLengthM);
  const jBarPerHm = totalLengthM > 0 ? roundTo((jLossTotalBar / totalLengthM) * 100, 2) : 0;

  const sortedEngines = useMemo(
    () => [...engines].sort((a, b) => a.positionM - b.positionM),
    [engines]
  );

  if (engines.length === 0) {
    return (
      <View style={styles.emptyBlock}>
        <Label>Placement des engins</Label>
        <Caption>Sélectionne d’abord un ou plusieurs engins en phase 2.</Caption>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Label>Placement des engins (drag & drop)</Label>
      <Caption>
        Fais glisser les engins sur la ligne. Le positionnement se cale automatiquement par pas de{' '}
        {hoseLengthM} m (1 tuyau).
      </Caption>
      <Caption>
        Base hydraulique: J total {formatNumber(jLossTotalBar)} bar, J/hm {formatNumber(jBarPerHm)} bar/hm,
        pression mini entrée engin suivant {formatNumber(minInletBar)} bar.
      </Caption>

      <View
        style={styles.trackArea}
        onLayout={(event) => {
          setTrackWidth(event.nativeEvent.layout.width);
        }}
      >
        <View style={[styles.trackLine, { top: TRACK_Y }]} />
        <Caption style={[styles.endpointLabel, styles.endpointLeft]}>Point d’eau</Caption>
        <Caption style={[styles.endpointLabel, styles.endpointRight]}>Point à alimenter</Caption>
        {trackWidth > 0 &&
          engines.map((engine, index) => (
            <DraggableEngineMarker
              key={engine.instanceId}
              engine={engine}
              index={index}
              trackWidth={trackWidth}
              visualLengthM={effectiveLengthM}
              hoseLengthM={hoseLengthM}
              workRatePercent={workRatePercent}
              flowPerLineLpm={flowPerLineLpm}
              jBarPerHm={jBarPerHm}
              minInletBar={minInletBar}
              onChangePositionM={onChangePositionM}
            />
          ))}
      </View>

      <View style={styles.positionsBlock}>
        <Label>Répartition retenue</Label>
        {sortedEngines.map((engine, index) => {
          const positionHoses = Math.round(engine.positionM / hoseLengthM);
          const appliedRefoulementBar = roundTo((engine.nominalPressureBar * workRatePercent) / 100, 1);
          const transportBar = Math.max(0, appliedRefoulementBar - minInletBar);
          const dMaxM = jBarPerHm > 0 ? roundTo((transportBar / jBarPerHm) * 100, 0) : effectiveLengthM;
          const nextEngine = sortedEngines[index + 1];
          const gapToNextM = nextEngine ? roundTo(nextEngine.positionM - engine.positionM, 0) : null;
          const isGapOk = gapToNextM === null ? true : gapToNextM <= dMaxM + 0.001;
          return (
            <View key={`position-${engine.instanceId}`} style={styles.positionRow}>
              <Caption>
                • {engine.label} : {formatNumber(engine.positionM)} m ({positionHoses} tuyaux) - Pr appliquée{' '}
                {formatNumber(appliedRefoulementBar)} bar - D max {formatNumber(dMaxM)} m
              </Caption>
              {gapToNextM !== null ? (
                <Caption style={isGapOk ? styles.gapOk : styles.gapKo}>
                  → vers engin suivant: {formatNumber(gapToNextM)} m / max {formatNumber(dMaxM)} m (
                  {isGapOk ? 'OK' : 'dépassement'})
                </Caption>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
  },
  emptyBlock: {
    marginTop: Layout.spacing.sm,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.22)',
    padding: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  trackArea: {
    position: 'relative',
    minHeight: TRACK_AREA_HEIGHT,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.22)',
    paddingHorizontal: Layout.spacing.xs,
    backgroundColor: 'rgba(15, 20, 26, 0.08)',
  },
  trackLine: {
    position: 'absolute',
    left: Layout.spacing.xs,
    right: Layout.spacing.xs,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#42A5F5',
  },
  endpointLabel: {
    position: 'absolute',
    top: TRACK_Y + 10,
    fontWeight: '600',
  },
  endpointLeft: {
    left: Layout.spacing.xs,
  },
  endpointRight: {
    right: Layout.spacing.xs,
    textAlign: 'right',
  },
  marker: {
    position: 'absolute',
    width: MARKER_WIDTH,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(66, 165, 245, 0.6)',
    backgroundColor: 'rgba(16, 24, 34, 0.92)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 1,
  },
  markerTitle: {
    color: '#E3F2FD',
    fontWeight: '700',
    fontSize: 12,
  },
  markerMeta: {
    color: '#CFD8DC',
    fontSize: 11,
    lineHeight: 14,
  },
  markerMetaDanger: {
    color: '#FFCDD2',
  },
  positionsBlock: {
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(120,120,120,0.22)',
    padding: Layout.spacing.sm,
    gap: 2,
  },
  positionRow: {
    gap: 2,
    marginBottom: 2,
  },
  gapOk: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  gapKo: {
    color: '#D32F2F',
    fontWeight: '700',
  },
});
