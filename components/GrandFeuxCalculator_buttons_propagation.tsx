// Bloc boutons pour stratégie 'propagation' à insérer sous la View des valeurs interactives du slider
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';

function PropagationButtons({ onReset, onCalculate }: { onReset: () => void, onCalculate: () => void }) {
  return (
    <View style={styles.container}>
      <Button title="Réinitialiser" onPress={onReset} variant="outline" />
      <Button title="Calculer" onPress={onCalculate} />
    </View>
  );
}

export default memo(PropagationButtons);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
});
