import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeContext } from '@/context/ThemeContext';
import { formatNumber } from '@/utils/format';
import type { RelayAbaqueData } from '@/features/relay/engine/types';

type RelayAbaqueCardProps = {
  abaque: RelayAbaqueData;
  totalLengthM: number;
  spacingAdjustmentHoses: number;
  onAdjustSpacingHoses: (delta: number) => void;
  visible: boolean;
};

type Dot = {
  left: number;
  top: number;
};

const GRAPH_HEIGHT = 190;

function toGraphDot(
  xM: number,
  bar: number,
  width: number,
  lengthM: number,
  maxYBar: number
): Dot {
  const safeLength = Math.max(1, lengthM);
  const safeMaxY = Math.max(1, maxYBar);
  const xRatio = Math.min(1, Math.max(0, xM / safeLength));
  const yRatio = Math.min(1, Math.max(0, bar / safeMaxY));
  return {
    left: xRatio * width,
    top: GRAPH_HEIGHT - yRatio * GRAPH_HEIGHT,
  };
}

export function RelayAbaqueCard({
  abaque,
  totalLengthM,
  spacingAdjustmentHoses,
  onAdjustSpacingHoses,
  visible,
}: RelayAbaqueCardProps) {
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const [graphWidth, setGraphWidth] = useState(0);

  const onGraphLayout = (event: LayoutChangeEvent) => {
    setGraphWidth(event.nativeEvent.layout.width);
  };

  const requiredDots = useMemo(
    () =>
      abaque.points.map((point) =>
        toGraphDot(point.xM, point.requiredBar, graphWidth, totalLengthM, abaque.maxYBar)
      ),
    [abaque.maxYBar, abaque.points, graphWidth, totalLengthM]
  );

  const pumpDots = useMemo(
    () =>
      abaque.pumpPoints.map((point) =>
        toGraphDot(point.xM, point.bar, graphWidth, totalLengthM, abaque.maxYBar)
      ),
    [abaque.maxYBar, abaque.pumpPoints, graphWidth, totalLengthM]
  );

  if (!visible) return null;

  return (
    <Card style={styles.container}>
      <View style={styles.titleRow}>
        <Title>Abaque guidé</Title>
        <Body style={{ color: palette.secondaryText }}>
          Ajustement: {spacingAdjustmentHoses > 0 ? '+' : ''}
          {spacingAdjustmentHoses} tuyau(x)
        </Body>
      </View>
      <Caption>
        Courbe bleue: pression requise le long de l’établissement. Points rouges: position/consigne des pompes.
      </Caption>

      <View style={styles.actionsRow}>
        <Button title="- 1 tuyau" variant="outline" size="sm" onPress={() => onAdjustSpacingHoses(-1)} />
        <Button title="+ 1 tuyau" size="sm" onPress={() => onAdjustSpacingHoses(1)} />
      </View>

      <View style={[styles.graph, { borderColor: palette.border }]} onLayout={onGraphLayout}>
        <View style={[styles.gridHorizontal, { top: GRAPH_HEIGHT * 0.25, borderColor: palette.border }]} />
        <View style={[styles.gridHorizontal, { top: GRAPH_HEIGHT * 0.5, borderColor: palette.border }]} />
        <View style={[styles.gridHorizontal, { top: GRAPH_HEIGHT * 0.75, borderColor: palette.border }]} />

        {requiredDots.map((dot, idx) => (
          <View
            key={`required-${idx}`}
            style={[
              styles.requiredDot,
              {
                left: dot.left - 2,
                top: dot.top - 2,
                backgroundColor: '#4FC3F7',
              },
            ]}
          />
        ))}

        {requiredDots.slice(1).map((dot, idx) => {
          const prev = requiredDots[idx];
          const dx = dot.left - prev.left;
          const dy = dot.top - prev.top;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View
              key={`line-${idx}`}
              style={[
                styles.requiredLine,
                {
                  left: prev.left,
                  top: prev.top,
                  width: distance,
                  transform: [{ rotate: `${angle}deg` }],
                  backgroundColor: '#4FC3F7',
                },
              ]}
            />
          );
        })}

        {pumpDots.map((dot, idx) => (
          <View
            key={`pump-${idx}`}
            style={[
              styles.pumpDot,
              {
                left: dot.left - 4,
                top: dot.top - 4,
                backgroundColor: palette.link,
              },
            ]}
          />
        ))}
      </View>

      <Label>
        {formatNumber(totalLengthM)} m - Pmax abaque: {formatNumber(abaque.maxYBar)} bar
      </Label>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Layout.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Layout.spacing.sm,
  },
  graph: {
    height: GRAPH_HEIGHT,
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    position: 'relative',
    overflow: 'hidden',
  },
  gridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    opacity: 0.4,
  },
  requiredDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  pumpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  requiredLine: {
    height: 2,
    position: 'absolute',
  },
});
