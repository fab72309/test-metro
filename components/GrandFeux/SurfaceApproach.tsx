import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

function SurfaceApproach() {
  const [surface, setSurface] = useState('');
  const [taux, setTaux] = useState(6);
  const [result, setResult] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    const surf = parseFloat(surface);
    if (isNaN(surf) || isNaN(taux)) return;
    const debit = surf * taux;
    const res = debit.toFixed(2);
    setResult(`${res} L/min`);
    setDetails(`${surf} m² × ${taux} L/min/m² = ${res} L/min`);
  }, [surface, taux]);

  const handleReset = useCallback(() => {
    setSurface('');
    setTaux(6);
    setResult(null);
    setDetails(null);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Approche Surface</Text>
      <Text style={{fontWeight:'bold', marginBottom:4}}>Surface (m²)</Text>
      <TextInput
        style={styles.input}
        value={surface}
        onChangeText={setSurface}
        keyboardType="numeric"
        placeholder="m²"
      />
      <Text style={{fontWeight:'bold', marginTop:12, marginBottom:4}}>Taux d'application (L/min/m²)</Text>
      <Text style={{fontWeight:'bold', fontSize:16, color:'#D32F2F'}}>{taux} L/min/m²</Text>
      <Slider
        minimumValue={1}
        maximumValue={20}
        step={1}
        value={taux}
        onValueChange={setTaux}
        minimumTrackTintColor="#D32F2F"
        maximumTrackTintColor="#eee"
        thumbTintColor="#D32F2F"
        style={{marginBottom:16}}
      />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Réinitialiser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleCalculate}>
          <Text style={[styles.buttonText, styles.buttonPrimaryText]}>Calculer</Text>
        </TouchableOpacity>
      </View>
      {result && (
        <View style={styles.resultBlock}>
          <Text style={styles.resultTitle}>Résultat</Text>
          <Text style={styles.resultText}>{result}</Text>
          {details && <Text style={styles.resultDetail}>{details}</Text>}
        </View>
      )}
    </View>
  );
}

export default memo(SurfaceApproach);

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, padding: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { padding: 10, borderRadius: 8, backgroundColor: '#f1f1f1' },
  buttonPrimary: { backgroundColor: '#D32F2F' },
  buttonText: { fontWeight: 'bold', color: '#333' },
  buttonPrimaryText: { color: '#fff' },
  resultBlock: { backgroundColor: '#f1f1f1', padding: 16, borderRadius: 8, marginTop: 16 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  resultText: { fontSize: 24, fontWeight: 'bold', color: '#D32F2F' },
  resultDetail: { fontSize: 14, color: '#666' },
});
