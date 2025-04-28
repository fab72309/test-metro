import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

function FHLIApproach() {
  const [tab, setTab] = useState<'foam'|'structure'>('foam');
  const [surface, setSurface] = useState('');
  const [rateType, setRateType] = useState<'Hydrocarbures'|'Liquides polaires'|'Taux du POI'>('Hydrocarbures');
  const [customRate, setCustomRate] = useState('');
  const [conc, setConc] = useState('');
  const [tempDur, setTempDur] = useState('');
  const [extDur, setExtDur] = useState('');
  const [maintDur, setMaintDur] = useState('');
  const [foamDebit, setFoamDebit] = useState<string|null>(null);

  const getTauxReflexe = useCallback(() => {
    if (rateType === 'Hydrocarbures') return 10;
    if (rateType === 'Liquides polaires') return 20;
    const val = parseFloat(customRate);
    return isNaN(val) ? 0 : val;
  }, [rateType, customRate]);

  const handleCalculateFoam = useCallback(() => {
    const surf = parseFloat(surface);
    const taux = getTauxReflexe();
    if (isNaN(surf) || taux <= 0) return;
    const debit = surf * taux;
    setFoamDebit(debit.toFixed(2));
  }, [surface, getTauxReflexe]);

  const handleResetFoam = useCallback(() => {
    setSurface('');
    setRateType('Hydrocarbures');
    setCustomRate('');
    setConc('');
    setTempDur('');
    setExtDur('');
    setMaintDur('');
    setFoamDebit(null);
  }, []);

  const renderTabs = () => (
    <View style={styles.tabRow}>
      <TouchableOpacity style={[styles.tab, tab === 'foam' && styles.selectedTab]} onPress={() => setTab('foam')}>
        <Text style={[styles.tabText, tab === 'foam' && styles.selectedTabText]}>Mousse</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.tab, tab === 'structure' && styles.selectedTab]} onPress={() => setTab('structure')}>
        <Text style={[styles.tabText, tab === 'structure' && styles.selectedTabText]}>Structure</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFoam = () => (
    <View>
      <Text style={styles.label}>Surface (m²)</Text>
      <TextInput style={styles.input} value={surface} onChangeText={setSurface} keyboardType="numeric" placeholder="Surface" />
      <Text style={styles.label}>Type de liquide</Text>
      <View style={styles.selectRow}>
        {['Hydrocarbures', 'Liquides polaires', 'Taux du POI'].map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.button, rateType === opt && styles.selectedButton]}
            onPress={() => setRateType(opt as any)}
          >
            <Text style={[styles.buttonText, rateType === opt && styles.selectedButtonText]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {rateType === 'Taux du POI' && (
        <TextInput style={styles.input} value={customRate} onChangeText={setCustomRate} keyboardType="numeric" placeholder="Taux perso (L/min/m²)" />
      )}
      <Text style={styles.label}>Concentration (%)</Text>
      <TextInput style={styles.input} value={conc} onChangeText={setConc} keyboardType="numeric" placeholder="Concentration (%)" />
      <Text style={styles.label}>Durée temporisation (min)</Text>
      <TextInput style={styles.input} value={tempDur} onChangeText={setTempDur} keyboardType="numeric" placeholder="20" />
      <Text style={styles.label}>Durée extinction (min)</Text>
      <TextInput style={styles.input} value={extDur} onChangeText={setExtDur} keyboardType="numeric" placeholder="40" />
      <Text style={styles.label}>Durée maintien (min)</Text>
      <TextInput style={styles.input} value={maintDur} onChangeText={setMaintDur} keyboardType="numeric" placeholder="10" />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={handleResetFoam}>
          <Text style={styles.buttonText}>Réinit.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleCalculateFoam}>
          <Text style={[styles.buttonText, styles.buttonPrimaryText]}>Calculer mousse</Text>
        </TouchableOpacity>
      </View>
      {foamDebit && <Text style={styles.resultText}>Débit instantané: {foamDebit} L/min</Text>}
    </View>
  );

  const renderStructure = () => (
    <View>
      <Text>Calcul structure à venir</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Approche FHLI</Text>
      {renderTabs()}
      {tab === 'foam' ? renderFoam() : renderStructure()}
    </View>
  );
}

export default memo(FHLIApproach);

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  tabRow: { flexDirection: 'row', marginBottom: 12 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#f1f1f1', borderRadius: 8, marginRight: 8 },
  selectedTab: { backgroundColor: '#D32F2F' },
  tabText: { color: '#333' },
  selectedTabText: { color: '#fff', fontWeight: 'bold' },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  button: { padding: 8, borderRadius: 8, backgroundColor: '#f1f1f1', marginRight: 8, marginBottom: 8 },
  selectedButton: { backgroundColor: '#D32F2F' },
  buttonText: { color: '#333' },
  selectedButtonText: { color: '#fff', fontWeight: 'bold' },
  label: { fontWeight: 'bold', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  buttonPrimary: { backgroundColor: '#D32F2F' },
  buttonPrimaryText: { color: '#fff', fontWeight: 'bold' },
  resultText: { fontSize: 17, fontWeight: 'bold', color: '#D32F2F', marginTop: 8 },
});
