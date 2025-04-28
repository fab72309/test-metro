// Bloc boutons pour stratégie 'propagation' à insérer sous la View des valeurs interactives du slider
import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

function PropagationButtons({ onReset, onCalculate }: { onReset: () => void, onCalculate: () => void }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetText}>Réinitialiser</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.calculateButton} onPress={onCalculate}>
        <Text style={styles.calculateText}>Calculer</Text>
      </TouchableOpacity>
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
  resetButton: {
    borderWidth: 2,
    borderColor: '#D32F2F',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
  calculateButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
  resetText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  calculateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
