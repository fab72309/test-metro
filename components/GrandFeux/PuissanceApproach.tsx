import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import PropagationButtons from '../GrandFeuxCalculator_buttons_propagation';

function PuissanceApproach() {
  const [surface, setSurface] = useState('');
  const [hauteur, setHauteur] = useState('');
  const [fraction, setFraction] = useState(0);
  const [combustible, setCombustible] = useState(2);
  // Propagation states
  const [surfaceVertical, setSurfaceVertical] = useState('');
  const [tauxApplication, setTauxApplication] = useState(6);
  const [resultPropagation, setResultPropagation] = useState<string|null>(null);
  const [calcDetailsPropagation, setCalcDetailsPropagation] = useState<string|null>(null);
  // Offensive states
  const [rendement, setRendement] = useState(0.2);
  const [resultOffensive, setResultOffensive] = useState<string|null>(null);
  const [calcDetailsOffensive, setCalcDetailsOffensive] = useState<string|null>(null);
  // Strategy
  const [strategie, setStrategie] = useState<'offensive'|'propagation'>('propagation');

  const handleCalculate = useCallback(() => {
    // Attaque offensive calculation
    const surf = parseFloat(surface);
    const haut = parseFloat(hauteur);
    if (isNaN(surf) || isNaN(haut)) return;
    const pmax = surf * haut * combustible * (fraction/100);
    const multiplier = rendement === 0.5 ? 42.5 : 106;
    const qLmin = pmax * multiplier;
    const resLmin = qLmin.toFixed(0);
    const resM3h = (qLmin / 16.67).toFixed(2);
    setResultOffensive(`${resLmin} L/min (${resM3h} m³/h)`);
    setCalcDetailsOffensive(`Pmax = ${surf} m² × ${haut} m × ${combustible} MW/m³ × (${fraction}/100) = ${pmax.toFixed(2)} MW\nDébit requis : ${pmax.toFixed(2)} MW × ${multiplier} L/min/MW = ${resLmin} L/min\nSoit ${resM3h} m³/h`);
  }, [surface, hauteur, fraction, combustible, rendement]);

  const handleAttackReset = useCallback(() => {
    setSurface('');
    setHauteur('');
    setFraction(0);
    setCombustible(2);
    setRendement(0.2);
    setResultOffensive(null);
    setCalcDetailsOffensive(null);
  }, []);

  const handlePropReset = useCallback(() => {
    setSurfaceVertical('');
    setTauxApplication(6);
    setResultPropagation(null);
    setCalcDetailsPropagation(null);
  }, []);

  const handlePropCalculate = useCallback(() => {
    const surf = parseFloat(surfaceVertical);
    const taux = parseFloat(String(tauxApplication));
    if (isNaN(surf) || isNaN(taux)) return;
    const debit = surf * taux;
    const res = debit.toFixed(2);
    setResultPropagation(res);
    setCalcDetailsPropagation(`${surf} m² × ${taux} L/min/m² = ${res} L/min`);
  }, [surfaceVertical, tauxApplication]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Approche Puissance</Text>
      {/* Strategy Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, strategie === 'offensive' && styles.selectedTab]} onPress={() => setStrategie('offensive')}>
          <Text style={[styles.tabText, strategie === 'offensive' && styles.selectedTabText]}>Attaque offensive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, strategie === 'propagation' && styles.selectedTab]} onPress={() => setStrategie('propagation')}>
          <Text style={[styles.tabText, strategie === 'propagation' && styles.selectedTabText]}>Lutte propagation</Text>
        </TouchableOpacity>
      </View>
      {strategie === 'offensive' && (
        <View style={{marginVertical:16}}>
          <Text style={{fontWeight:'bold', marginBottom:4}}>Surface (m²)</Text>
          <TextInput style={styles.input} value={surface} onChangeText={setSurface} keyboardType="numeric" placeholder="m²" />
          <Text style={{fontWeight:'bold', marginTop:12, marginBottom:4}}>Hauteur (m)</Text>
          <TextInput style={styles.input} value={hauteur} onChangeText={setHauteur} keyboardType="numeric" placeholder="m" />
          <Text style={{fontWeight:'bold', marginTop:12}}>Puissance (MW/m³)</Text>
          <Text style={{fontWeight:'bold', fontSize:16, color:'#D32F2F'}}>{combustible.toFixed(2)}</Text>
          <Slider minimumValue={1} maximumValue={2.7} step={0.01} value={combustible} onValueChange={setCombustible} minimumTrackTintColor="#D32F2F" maximumTrackTintColor="#eee" thumbTintColor="#D32F2F" />
          <Text style={{fontWeight:'bold', marginTop:12}}>Fraction (%)</Text>
          <Text style={{fontWeight:'bold', fontSize:16, color:'#D32F2F'}}>{fraction}%</Text>
          <Slider minimumValue={0} maximumValue={100} step={1} value={fraction} onValueChange={setFraction} minimumTrackTintColor="#D32F2F" maximumTrackTintColor="#eee" thumbTintColor="#D32F2F" />
          <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:16}}>
            <TouchableOpacity style={styles.button} onPress={handleAttackReset}><Text style={styles.buttonText}>Réinitialiser</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleCalculate}><Text style={[styles.buttonText, styles.buttonPrimaryText]}>Calculer</Text></TouchableOpacity>
          </View>
          {resultOffensive && (
            <View style={styles.resultBlock}>
              <Text style={styles.resultTitle}>Résultat</Text>
              <Text style={styles.resultText}>{resultOffensive}</Text>
              {calcDetailsOffensive && <Text style={styles.resultDetail}>{calcDetailsOffensive}</Text>}
            </View>
          )}
        </View>
      )}
      {strategie === 'propagation' && (
        <View style={{marginVertical:16}}>
          <Text style={{fontWeight:'bold', marginBottom:4}}>Surface verticale à protéger (m²)</Text>
          <TextInput style={styles.input} value={surfaceVertical} onChangeText={setSurfaceVertical} keyboardType="numeric" placeholder="m²" />
          <Text style={{fontWeight:'bold', marginTop:12, marginBottom:4}}>Taux d'application (L/min/m²)</Text>
          <Text style={{fontWeight:'bold', fontSize:16, color:'#D32F2F'}}>{tauxApplication} L/min/m²</Text>
          <Slider minimumValue={1} maximumValue={20} step={1} value={tauxApplication} onValueChange={setTauxApplication} minimumTrackTintColor="#D32F2F" maximumTrackTintColor="#eee" thumbTintColor="#D32F2F" />
          <View style={{alignItems:'center', marginTop:12}}>
            <PropagationButtons onReset={handlePropReset} onCalculate={handlePropCalculate} />
          </View>
          {resultPropagation && (
            <View style={styles.resultBlock}>
              <Text style={styles.resultTitle}>Résultat</Text>
              <Text style={styles.resultText}>{resultPropagation} L/min</Text>
              {calcDetailsPropagation && <Text style={styles.resultDetail}>{calcDetailsPropagation}</Text>}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default memo(PuissanceApproach);

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, padding: 10 },
  resultBlock: { backgroundColor: '#f1f1f1', padding: 16, borderRadius: 8, marginTop: 16 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  resultText: { fontSize: 24, fontWeight: 'bold', color: '#D32F2F' },
  resultDetail: { fontSize: 14, color: '#666' },
  tabRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#f1f1f1', borderRadius: 8, marginRight: 8 },
  selectedTab: { backgroundColor: '#D32F2F' },
  tabText: { color: '#333' },
  selectedTabText: { color: '#fff', fontWeight: 'bold' },
  button: { padding: 10, borderRadius: 8, backgroundColor: '#f1f1f1' },
  buttonPrimary: { backgroundColor: '#D32F2F' },
  buttonText: { fontWeight: 'bold', color: '#333' },
  buttonPrimaryText: { color: '#fff' },
});
