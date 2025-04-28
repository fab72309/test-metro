import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

function FHLIApproach() {
  const [tab, setTab] = useState<'foam'|'structure'>('foam');
  const [surface, setSurface] = useState('');
  const [rateType, setRateType] = useState<'Hydrocarbures'|'Liquide polaire'|'Taux POI'>('Hydrocarbures');
  const [customRate, setCustomRate] = useState('');
  const [conc, setConc] = useState('3');
  const [tempDur, setTempDur] = useState('20');
  const [extDur, setExtDur] = useState('40');
  const [maintDur, setMaintDur] = useState<string>('10');
  const [foamDebit, setFoamDebit] = useState<string|null>(null);
  const [tempVolume, setTempVolume] = useState<string|null>(null);
  const [extVolume, setExtVolume] = useState<string|null>(null);
  const [maintVolume, setMaintVolume] = useState<string|null>(null);
  const [totalVolume, setTotalVolume] = useState<string|null>(null);
  // Volumes d'eau
  const [waterTempVolume, setWaterTempVolume] = useState<string|null>(null);
  const [waterExtVolume, setWaterExtVolume] = useState<string|null>(null);
  const [waterMaintVolume, setWaterMaintVolume] = useState<string|null>(null);
  const [waterTotalVolume, setWaterTotalVolume] = useState<string|null>(null);
  // Flux émulseur
  const [emTempFlow, setEmTempFlow] = useState<string|null>(null);
  const [emExtFlow, setEmExtFlow] = useState<string|null>(null);
  const [emMaintFlow, setEmMaintFlow] = useState<string|null>(null);
  const [emTotalFlow, setEmTotalFlow] = useState<string|null>(null);
  // Flux eau
  const [wTempFlow, setWTempFlow] = useState<string|null>(null);
  const [wExtFlow, setWExtFlow] = useState<string|null>(null);
  const [wMaintFlow, setWMaintFlow] = useState<string|null>(null);
  const [wTotalFlow, setWTotalFlow] = useState<string|null>(null);

  const getTauxReflexe = useCallback(() => {
    if (rateType === 'Hydrocarbures') return 5;
    if (rateType === 'Liquide polaire') return 10;
    const val = parseFloat(customRate);
    return isNaN(val) ? 0 : val;
  }, [rateType, customRate]);

  const handleCalculateFoam = useCallback(() => {
    const surf = parseFloat(surface);
    const taux = getTauxReflexe();
    const concentration = parseFloat(conc);
    const dureeTemp = parseFloat(tempDur);
    const dureeExt = parseFloat(extDur);
    const dureeMaint = parseFloat(maintDur);
    if (isNaN(surf) || taux <= 0 || isNaN(concentration) || isNaN(dureeTemp) || isNaN(dureeExt) || isNaN(dureeMaint)) return;
    const debit = surf * taux;
    const tempVolCalc = (debit / 2) * dureeTemp * (concentration / 100) / 100;
    const extVolCalc = debit * dureeExt * (concentration / 100) / 100;
    const maintVolCalc = debit * dureeMaint * (concentration / 100) / 100;
    const total = tempVolCalc + extVolCalc + maintVolCalc;
    // Calcul eau
    const waterTemp = (debit / 2) * dureeTemp / 100;
    const waterExt = debit * dureeExt / 100;
    const waterMaint = debit * dureeMaint / 100;
    const waterTot = waterTemp + waterExt + waterMaint;
    setFoamDebit(debit.toFixed(2));
    setTempVolume(tempVolCalc.toFixed(2));
    setExtVolume(extVolCalc.toFixed(2));
    setMaintVolume(maintVolCalc.toFixed(2));
    setTotalVolume(total.toFixed(2));
    setWaterTempVolume(waterTemp.toFixed(2));
    setWaterExtVolume(waterExt.toFixed(2));
    setWaterMaintVolume(waterMaint.toFixed(2));
    setWaterTotalVolume(waterTot.toFixed(2));
    // Calcul flux émulseur
    const emTempCalc = tempVolCalc / dureeTemp * 60;
    const emExtCalc = extVolCalc / dureeExt * 60;
    const emMaintCalc = maintVolCalc / dureeMaint * 60;
    const emTotalCalc = emTempCalc + emExtCalc + emMaintCalc;
    // Conversion L/min (60 m³/h = 1000 L/min)
    const emTempLpm = emTempCalc * 1000 / 60;
    const emExtLpm = emExtCalc * 1000 / 60;
    const emMaintLpm = emMaintCalc * 1000 / 60;
    const emTotalLpm = emTotalCalc * 1000 / 60;
    setEmTempFlow(`${emTempCalc.toFixed(2)} m³/h (${emTempLpm.toFixed(2)} L/min)`);
    setEmExtFlow(`${emExtCalc.toFixed(2)} m³/h (${emExtLpm.toFixed(2)} L/min)`);
    setEmMaintFlow(`${emMaintCalc.toFixed(2)} m³/h (${emMaintLpm.toFixed(2)} L/min)`);
    setEmTotalFlow(`${emTotalCalc.toFixed(2)} m³/h (${emTotalLpm.toFixed(2)} L/min)`);
    // Calcul flux eau
    const wTempCalc = waterTemp / dureeTemp * 60;
    const wExtCalc = waterExt / dureeExt * 60;
    const wMaintCalc = waterMaint / dureeMaint * 60;
    const wTotalCalc = wTempCalc + wExtCalc + wMaintCalc;
    const wTempLpm = wTempCalc * 1000 / 60;
    const wExtLpm = wExtCalc * 1000 / 60;
    const wMaintLpm = wMaintCalc * 1000 / 60;
    const wTotalLpm = wTotalCalc * 1000 / 60;
    setWTempFlow(`${wTempCalc.toFixed(2)} m³/h (${wTempLpm.toFixed(2)} L/min)`);
    setWExtFlow(`${wExtCalc.toFixed(2)} m³/h (${wExtLpm.toFixed(2)} L/min)`);
    setWMaintFlow(`${wMaintCalc.toFixed(2)} m³/h (${wMaintLpm.toFixed(2)} L/min)`);
    setWTotalFlow(`${wTotalCalc.toFixed(2)} m³/h (${wTotalLpm.toFixed(2)} L/min)`);
  }, [surface, getTauxReflexe, conc, tempDur, extDur, maintDur]);

  const handleResetFoam = useCallback(() => {
    setSurface('');
    setRateType('Hydrocarbures');
    setCustomRate('');
    setConc('3');
    setTempDur('20');
    setExtDur('40');
    setMaintDur('10');
    setFoamDebit(null);
    setTempVolume(null);
    setExtVolume(null);
    setMaintVolume(null);
    setTotalVolume(null);
    // Reset eau
    setWaterTempVolume(null);
    setWaterExtVolume(null);
    setWaterMaintVolume(null);
    setWaterTotalVolume(null);
    setEmTempFlow(null);
    setEmExtFlow(null);
    setEmMaintFlow(null);
    setEmTotalFlow(null);
    setWTempFlow(null);
    setWExtFlow(null);
    setWMaintFlow(null);
    setWTotalFlow(null);
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
        {['Hydrocarbures', 'Liquide polaire', 'Taux POI'].map(opt => (
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
        style={{ marginBottom: 16 }}
        minimumValue={0}
        maximumValue={25}
        step={0.5}
        value={getTauxReflexe()}
        minimumTrackTintColor="#D32F2F"
        maximumTrackTintColor="#eee"
        thumbTintColor="#D32F2F"
        onValueChange={value => {
          setRateType('Taux POI');
          setCustomRate(value.toString());
        }}
      />
      <View style={styles.sliderMarks}>
        <TouchableOpacity style={{ position: 'absolute', left: '20%' }} onPress={() => { setRateType('Taux POI'); setCustomRate('5'); }}>
          <Text style={styles.markText}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ position: 'absolute', left: '40%' }} onPress={() => { setRateType('Taux POI'); setCustomRate('10'); }}>
          <Text style={styles.markText}>10</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Concentration (%) : {conc}</Text>
      <Slider
        style={{ marginBottom: 16 }}
        minimumValue={0}
        maximumValue={9}
        step={0.5}
        value={parseFloat(conc)}
        minimumTrackTintColor="#D32F2F"
        maximumTrackTintColor="#eee"
        thumbTintColor="#D32F2F"
        onValueChange={value => setConc(value.toString())}
      />
      <View style={styles.sliderMarks}>
        <TouchableOpacity style={{ position: 'absolute', left: '33.33%' }} onPress={() => setConc('3')}>
          <Text style={styles.markText}>3%</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ position: 'absolute', left: '66.66%' }} onPress={() => setConc('6')}>
          <Text style={styles.markText}>6%</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Durée temporisation (en min)</Text>
      <TextInput style={styles.input} value={tempDur} onChangeText={setTempDur} keyboardType="numeric" placeholder="20" />
      <Text style={styles.label}>Durée extinction (en min)</Text>
      <TextInput style={styles.input} value={extDur} onChangeText={setExtDur} keyboardType="numeric" placeholder="40" />
      <Text style={styles.label}>Durée entretien tapis de mousse (en min)</Text>
      <TextInput style={styles.input} value={maintDur} onChangeText={setMaintDur} keyboardType="numeric" placeholder="10" />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetFoam}>
          <Text style={styles.resetText}>Réinitialiser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculateFoam}>
          <Text style={styles.calculateText}>Calculer</Text>
        </TouchableOpacity>
      </View>
      {foamDebit && (
        <View>
          <Text style={styles.resultsHeader}>Résultats</Text>
          {/* Émulseur */}
          <View style={[styles.resultSection, styles.emSection]}>
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.resultLabel}>{`Total émulseur (${(parseFloat(tempDur)+parseFloat(extDur)+parseFloat(maintDur)).toFixed(0)} min) :`}</Text>
                <Text style={styles.resultValue}>{emTotalFlow}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.resultLabel}>{`Temporisation émulseur (${tempDur} min) :`}</Text>
                <Text style={styles.resultValue}>{emTempFlow}</Text>
                <Text style={styles.resultLabel}>{`Extinction émulseur (${extDur} min) :`}</Text>
                <Text style={styles.resultValue}>{emExtFlow}</Text>
                <Text style={styles.resultLabel}>{`Entretien émulseur (${maintDur} min) :`}</Text>
                <Text style={styles.resultValue}>{emMaintFlow}</Text>
              </View>
            </View>
          </View>
          {/* Eau */}
          <View style={[styles.resultSection, styles.wSection]}>
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.resultLabel}>{`Total eau (${(parseFloat(tempDur)+parseFloat(extDur)+parseFloat(maintDur)).toFixed(0)} min) :`}</Text>
                <Text style={styles.resultValue}>{wTotalFlow}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.resultLabel}>{`Temporisation eau (${tempDur} min) :`}</Text>
                <Text style={styles.resultValue}>{wTempFlow}</Text>
                <Text style={styles.resultLabel}>{`Extinction eau (${extDur} min) :`}</Text>
                <Text style={styles.resultValue}>{wExtFlow}</Text>
                <Text style={styles.resultLabel}>{`Entretien eau (${maintDur} min) :`}</Text>
                <Text style={styles.resultValue}>{wMaintFlow}</Text>
              </View>
            </View>
          </View>
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
  resetButton: { borderWidth: 2, borderColor: '#D32F2F', backgroundColor: '#fff', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 22 },
  calculateButton: { backgroundColor: '#D32F2F', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 22 },
  resetText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16 },
  calculateText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultSection: { marginTop: 16 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F', textAlign: 'center', marginBottom: 8 },
  resultLabel: { fontWeight: 'bold', color: '#000', fontSize: 14, marginVertical: 2 },
  resultValue: { color: '#000', fontSize: 14, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  column: { flex: 1, marginHorizontal: 4 },
  sliderMarks: { position: 'relative', width: '100%', height: 20, marginBottom: 12 },
  markText: { fontSize: 12, color: '#666' },
  emSection: { backgroundColor: '#FFF9C4', padding: 8, borderRadius: 8, marginVertical: 8 },
  wSection: { backgroundColor: '#E1F5FE', padding: 8, borderRadius: 8, marginVertical: 8 },
  resultsHeader: { fontSize: 16, fontWeight: 'bold', color: '#D32F2F', textAlign: 'center', marginBottom: 8 },
});
