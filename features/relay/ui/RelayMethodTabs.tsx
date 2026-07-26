import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { Caption, Label } from '@/components/ui/Typography';
import { Layout } from '@/constants/Layout';
import type { RelayMethod } from '@/features/relay/engine/types';

type RelayMethodTabsProps = {
  value: RelayMethod;
  onChange: (value: RelayMethod) => void;
};

const methodLabel: Record<RelayMethod, string> = {
  math: 'Calcul détaillé',
  approximation: 'Approximation',
  abaque: 'Abaque guidé',
};

export function RelayMethodTabs({ value, onChange }: RelayMethodTabsProps) {
  return (
    <View style={styles.container}>
      <Label>Méthode</Label>
      <View style={styles.row}>
        {(Object.keys(methodLabel) as RelayMethod[]).map((method) => (
          <Chip
            key={method}
            label={methodLabel[method]}
            selected={value === method}
            onPress={() => onChange(method)}
          />
        ))}
      </View>
      <Caption>
        Le calcul détaillé explicite les pertes et le dénivelé. L’abaque ajoute
        un réglage graphique de l’espacement.
      </Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Layout.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
