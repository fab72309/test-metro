import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import PropagationButtons from '../GrandFeuxCalculator_buttons_propagation';

function SurfaceApproach() {
  const [surface, setSurface] = useState('');
  const [taux, setTaux] = useState(6);
  const [result, setResult] = useState<string | null>(null);
  const [resultLmin, setResultLmin] = useState<string | null>(null);
  const [resultM3h, setResultM3h] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Info text pour SurfaceApproach
  const infoTextSurface = `Comment est calculé le débit requis ?
Le débit total (Q) en L/min est obtenu par :
Q = Surface en feu (m²) x Taux d'application (L/min/m²).
Ex. Pour 500 m² à 3 L/min/m² → 500×3=1,500 L/min (1,50 m³/h).

Ajustez-le selon le type de combustible et la doctrine locale.`;

  const handleCalculate = useCallback(() => {
    const surf = parseFloat(surface);
    if (isNaN(surf) || isNaN(taux)) return;
    const debit = surf * taux;
    const res = debit.toFixed(2);
    const m3h = (debit / 16.67).toFixed(2);
    setResultLmin(res);
    setResultM3h(m3h);
    setShowDetails(false);
    setResult(`${res} L/min`);
    setDetails(`${surf} m² × ${taux} L/min/m² = ${res} L/min`);
  }, [surface, taux]);

  const handleReset = useCallback(() => {
    setSurface('');
    setTaux(6);
    setResult(null);
    setResultLmin(null);
    setResultM3h(null);
    setDetails(null);
    setShowDetails(false);
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
      <View style={{alignItems:'center', marginTop:14}}>
        <PropagationButtons onReset={handleReset} onCalculate={handleCalculate} />
      </View>
      {resultLmin && (
        <View style={styles.resultBlock}>
          <View style={styles.resultHeader}>
            <Text style={[styles.resultTitle, styles.fireRedCenter]}>Résultat</Text>
            <TouchableOpacity onPress={() => Alert.alert('Comment est calculé le débit requis ?', infoTextSurface)} style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>i</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.resultSubtitle}><Text style={{fontWeight:'bold'}}>Débit requis : </Text>{resultLmin} L/min ({resultM3h} m³/h)</Text>
          <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
            <Text style={styles.detailsToggle}>{showDetails ? 'Masquer détails' : 'Voir détails'}</Text>
          </TouchableOpacity>
          {showDetails && details && <Text style={styles.resultDetail}>{details}</Text>}
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
  resultBlock: { backgroundColor: '#f1f1f1', padding: 16, borderRadius: 8, marginTop: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  infoIconContainer: { marginLeft: 4, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2 },
  infoIcon: { fontStyle: 'italic', color: '#888', fontSize: 12 },
  fireRedCenter: { color: '#D32F2F', textAlign: 'center' },
  resultSubtitle: { fontSize: 16, marginVertical: 4, color: '#111' },
  detailsToggle: { color: '#D32F2F', textAlign: 'center', marginVertical: 8, fontWeight: 'bold' },
  resultTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  resultDetail: { fontSize: 14, color: '#666' },
});
