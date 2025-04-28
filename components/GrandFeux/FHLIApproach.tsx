import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

function FHLIApproach() {
  const [tab, setTab] = useState<'foam'|'structure'>('foam');
  const [surface, setSurface] = useState('');
  const [rateType, setRateType] = useState<'Hydrocarbures'|'Liquides polaires'|'Taux POI'>('Hydrocarbures');
  const [customRate, setCustomRate] = useState('');
  const [conc, setConc] = useState('3');
  const [tempDur, setTempDur] = useState('20');
  const [extDur, setExtDur] = useState('40');
  const [foamDebit, setFoamDebit] = useState<string|null>(null);
  const [tempVolume, setTempVolume] = useState<string|null>(null);
  const [extVolume, setExtVolume] = useState<string|null>(null);
  const [maintVolume, setMaintVolume] = useState<string|null>(null);
  const [totalVolume, setTotalVolume] = useState<string|null>(null);

  const getTauxReflexe = useCallback(() => {
    if (rateType === 'Hydrocarbures') return 5;
    if (rateType === 'Liquides polaires') return 10;
    const val = parseFloat(customRate);
    return isNaN(val) ? 0 : val;
  }, [rateType, customRate]);

  const handleCalculateFoam = useCallback(() => {
    const surf = parseFloat(surface);
    const taux = getTauxReflexe();
    const concentration = parseFloat(conc);
    const dureeTemp = parseFloat(tempDur);
    const dureeExt = parseFloat(extDur);
    if (isNaN(surf) || taux <= 0 || isNaN(concentration) || isNaN(dureeTemp) || isNaN(dureeExt)) return;
    const debit = surf * taux;
    const tempVolCalc = (debit / 2) * dureeTemp * (concentration / 100) / 100;
    const extVolCalc = debit * dureeExt * (concentration / 100) / 100;
    const maintVolCalc = debit * 10 * (concentration / 100) / 100;
    const total = tempVolCalc + extVolCalc + maintVolCalc;
    setFoamDebit(debit.toFixed(2));
    setTempVolume(tempVolCalc.toFixed(3));
    setExtVolume(extVolCalc.toFixed(3));
    setMaintVolume(maintVolCalc.toFixed(3));
    setTotalVolume(total.toFixed(3));
  }, [surface, getTauxReflexe, conc, tempDur, extDur]);

  const handleResetFoam = useCallback(() => {
    setSurface('');
    setRateType('Hydrocarbures');
    setCustomRate('');
    setConc('3');
    setTempDur('20');
    setExtDur('40');
    setFoamDebit(null);
    setTempVolume(null);
    setExtVolume(null);
    setMaintVolume(null);
    setTotalVolume(null);
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
      <Text style={styles.label}>Surface de la cuvette (m2)</Text>
      <TextInput style={styles.input} value={surface} onChangeText={setSurface} keyboardType="numeric" placeholder="Surface de la cuvette" />
      <Text style={styles.label}>Taux d'application</Text>
      <View style={styles.selectRow}>
        {['Hydrocarbures', 'Liquides polaires', 'Taux POI'].map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.button, rateType === opt && styles.selectedButton]}
            onPress={() => setRateType(opt as any)}
          >
            <Text style={[styles.buttonText, rateType === opt && styles.selectedButtonText]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Slider Taux d'application toujours visible */}
      <Text style={styles.label}>Taux d'application (L/min/m2) : {getTauxReflexe()}</Text>
      <Slider
        style={{ width: '100%', height: 40, marginBottom: 12 }}
        minimumValue={0}
        maximumValue={20}
        step={0.1}
        value={getTauxReflexe()}
        minimumTrackTintColor="#D32F2F"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#D32F2F"
        onValueChange={value => {
          setRateType('Taux POI');
          setCustomRate(value.toString());
        }}
      />
      <Text style={styles.label}>Concentration (%) : {conc}</Text>
      <Slider
        style={{ width: '100%', height: 40, marginBottom: 12 }}
        minimumValue={0}
        maximumValue={6}
        step={0.1}
        value={parseFloat(conc)}
        minimumTrackTintColor="#D32F2F"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#D32F2F"
        onValueChange={value => setConc(value.toString())}
      />
      <Text style={styles.label}>Durée temporisation (en min)</Text>
      <TextInput style={styles.input} value={tempDur} onChangeText={setTempDur} keyboardType="numeric" placeholder="20" />
      <Text style={styles.label}>Durée extinction (en min)</Text>
      <TextInput style={styles.input} value={extDur} onChangeText={setExtDur} keyboardType="numeric" placeholder="40" />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={handleResetFoam}>
          <Text style={styles.buttonText}>Réinit.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleCalculateFoam}>
          <Text style={[styles.buttonText, styles.buttonPrimaryText]}>Calculer mousse</Text>
        </TouchableOpacity>
      </View>
      {foamDebit && (
        <View>
          <Text style={styles.resultText}>Temporisation (m3) : {tempVolume}</Text>
          <Text style={styles.resultText}>Extinction (m3) : {extVolume}</Text>
          <Text style={styles.resultText}>Entretien tapis de mousse (m3) : {maintVolume}</Text>
          <Text style={styles.resultText}>Besoin total en émulseur (m3) : {totalVolume}</Text>
        </View>
      )}
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
