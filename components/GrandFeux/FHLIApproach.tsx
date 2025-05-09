import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

function FHLIApproach() {
  const [nbCanon4000, setNbCanon4000] = useState('0');
  const [nbCanon2000, setNbCanon2000] = useState('0');
  const [nbCanon1000, setNbCanon1000] = useState('0');
  // Capacité totale des canons en L/min
  const canonDebit =
    parseInt(nbCanon4000 || '0') * 4000 +
    parseInt(nbCanon2000 || '0') * 2000 +
    parseInt(nbCanon1000 || '0') * 1000;

  const [canonResult, setCanonResult] = useState<number|null>(null);
  const [showCanonDetails, setShowCanonDetails] = useState(false);
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
  const [showEmDetails, setShowEmDetails] = useState(false);
  const [showWDetails, setShowWDetails] = useState(false);
  const [showEmFullDetails, setShowEmFullDetails] = useState(false);
  const [showWFullDetails, setShowWFullDetails] = useState(false);

  const getTauxReflexe = useCallback(() => {
    if (rateType === 'Hydrocarbures') return 5;
    if (rateType === 'Liquide polaire') return 10;
    const val = parseFloat(customRate);
    return isNaN(val) ? 0 : val;
  }, [rateType, customRate]);

  const formatNumber = (num: number | string) => {
  if (typeof num === 'string') num = parseFloat(num);
  if (isNaN(num)) return '';
  return num.toLocaleString('fr-FR');
};

const handleCalculateFoam = useCallback(() => {
  const concentration = parseFloat(conc);
  const dureeTemp = parseFloat(tempDur);
  const dureeExt = parseFloat(extDur);
  const dureeMaint = parseFloat(maintDur);
  if (isNaN(concentration) || canonDebit <= 0) return;
  // Si la durée n'est pas renseignée ou invalide, on met 0 pour la phase
  const emTemp = !isNaN(dureeTemp) && tempDur !== '' ? (canonDebit / 2) * dureeTemp * concentration / 100 : 0; // en L
  const emExt = !isNaN(dureeExt) && extDur !== '' ? canonDebit * dureeExt * concentration / 100 : 0; // en L
  const emMaint = !isNaN(dureeMaint) && maintDur !== '' ? canonDebit * dureeMaint * concentration / 100 : 0; // en L
  const emTotal = emTemp + emExt + emMaint;
  setTempVolume(emTemp.toString());
  setExtVolume(emExt.toString());
  setMaintVolume(emMaint.toString());
  setTotalVolume(emTotal.toString());
  setEmTempFlow(formatNumber(emTemp/1000)); // en m³
  setEmExtFlow(formatNumber(emExt/1000)); // en m³
  setEmMaintFlow(formatNumber(emMaint/1000)); // en m³
  setEmTotalFlow(formatNumber(emTotal/1000)); // en m³
  setFoamDebit(null); // On ne montre plus le débit mousse ici
  setWaterTempVolume(null);
  setWaterExtVolume(null);
  setWaterMaintVolume(null);
  setWaterTotalVolume(null);
  setWTempFlow(null);
  setWExtFlow(null);
  setWMaintFlow(null);
  setWTotalFlow(null);
}, [conc, tempDur, extDur, maintDur, canonDebit]);

  const handleResetFoam = useCallback(() => {
    setSurface('');
    setRateType('Hydrocarbures');
    setCustomRate('');
    setConc('3');
    setTempDur('20');
    setExtDur('40');
    setMaintDur('10');
    setNbCanon4000('0');
    setNbCanon2000('0');
    setNbCanon1000('0');
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

      {/* Champs Nombre de canons */}
      {/* Boutons Réinitialiser et Calculer pour le calcul canon */}
<View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
  <TouchableOpacity style={[styles.resetButton, { marginRight: 8 }]} onPress={() => {
    setCanonResult(null);
    setShowCanonDetails(false);
    setSurface('');
    setRateType('Hydrocarbures');
    setCustomRate('');
  }}>
    <Text style={styles.resetText}>Réinitialiser</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.calculateButton} onPress={() => {
    const surf = parseFloat(surface);
    const taux = getTauxReflexe();
    if (isNaN(surf) || isNaN(taux)) return;
    setCanonResult(surf * taux);
    setShowCanonDetails(false);
  }}>
    <Text style={styles.calculateText}>Calculer</Text>
  </TouchableOpacity>
</View>

{/* Carte résultat canon */}
{canonResult !== null && (
  <View style={[styles.resultSection, { backgroundColor: '#F1F8E9', borderRadius: 8, marginBottom: 12 }]}> 
    <TouchableOpacity style={[styles.row, { alignItems: 'flex-start' }]} onPress={() => setShowCanonDetails(v => !v)}>
  <View style={{ flex: 1 }}>
    <Text style={[styles.resultTitle, { textAlign: 'center' }]}>Débit d'extinction nécessaire</Text>
    <Text style={{ fontSize: 13, fontWeight: 'normal', color: '#388E3C', marginTop: -4, marginBottom: 0, textAlign: 'center' }}>(débit de solution moussante)</Text>
  </View>
  <Ionicons name={showCanonDetails ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#388E3C" style={{ marginLeft: 8, marginTop: 2 }} />
</TouchableOpacity>
    <Text style={styles.resultValue}>
  {formatNumber(canonResult)} L/min ({formatNumber((canonResult/1000)*60)} m³/h)
</Text>
    {showCanonDetails && (
      <View style={{ marginTop: 8 }}>
        <Text style={styles.resultLabel}>{`Débit d'extinction nécessaire = Surface × Taux d'application`}</Text>
        <Text style={styles.resultLabel}>{`= ${formatNumber(surface)} × ${formatNumber(getTauxReflexe())} = ${formatNumber(canonResult)} L/min`}</Text>
      </View>
    )}
  </View>
)}

<Text style={styles.label}>Nombre de canons :</Text>
<View style={{ flexDirection: 'row', marginBottom: 12 }}>
  <View style={{ flex: 1, marginHorizontal: 3, alignItems: 'center' }}>
  <Text style={[styles.label, { textAlign: 'center' }]}>4 000L/min</Text>
  <TextInput
      style={[styles.input, { color: '#1976D2', fontWeight: 'bold' }]}
      value={typeof nbCanon4000 === 'undefined' ? '0' : nbCanon4000}
      onChangeText={setNbCanon4000}
      keyboardType="numeric"
      placeholder="0"
    />
</View>
  <View style={{ flex: 1, marginHorizontal: 3, alignItems: 'center' }}>
  <Text style={[styles.label, { textAlign: 'center' }]}>2 000L/min</Text>
  <TextInput
      style={[styles.input, { color: '#1976D2', fontWeight: 'bold' }]}
      value={typeof nbCanon2000 === 'undefined' ? '0' : nbCanon2000}
      onChangeText={setNbCanon2000}
      keyboardType="numeric"
      placeholder="0"
    />
</View>
  <View style={{ flex: 1, marginHorizontal: 3, alignItems: 'center' }}>
  <Text style={[styles.label, { textAlign: 'center' }]}>1 000L/min</Text>
  <TextInput
      style={[styles.input, { color: '#1976D2', fontWeight: 'bold' }]}
      value={typeof nbCanon1000 === 'undefined' ? '0' : nbCanon1000}
      onChangeText={setNbCanon1000}
      keyboardType="numeric"
      placeholder="0"
    />
</View>
</View>

{/* Capacité des canons */}
<View style={{ marginBottom: 12 }}>
  <Text style={styles.label}>Capacité des canons :</Text>
  <Text style={[styles.resultValue, { fontSize: 18 }]}> 
    {formatNumber((parseInt(nbCanon4000||'0')*4000 + parseInt(nbCanon2000||'0')*2000 + parseInt(nbCanon1000||'0')*1000))} L/min ({formatNumber(((parseInt(nbCanon4000||'0')*4000 + parseInt(nbCanon2000||'0')*2000 + parseInt(nbCanon1000||'0')*1000)/1000)*60)} m³/h)
  </Text>
</View>

      <Text style={styles.label}>Durée temporisation (en min)</Text>
      <TextInput style={styles.input} value={tempDur} onChangeText={setTempDur} keyboardType="numeric" placeholder="20" />
      <Text style={styles.label}>Durée extinction (en min)</Text>
      <TextInput style={styles.input} value={extDur} onChangeText={setExtDur} keyboardType="numeric" placeholder="40" />
      <Text style={styles.label}>Durée entretien tapis de mousse (en min)</Text>
      <TextInput style={styles.input} value={maintDur} onChangeText={setMaintDur} keyboardType="numeric" placeholder="10" />
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.resetButton, { marginRight: 8 }]} onPress={handleResetFoam}>
          <Text style={styles.resetText}>Réinitialiser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculateFoam}>
          <Text style={styles.calculateText}>Calculer</Text>
        </TouchableOpacity>
      </View>
      {(emTotalFlow || waterTotalVolume) && (
        <View>
          <Text style={styles.resultsHeader}>Résultats</Text>
          {/* Eau */}
          <View style={[styles.resultSection, styles.wSection]}>
            <TouchableOpacity style={styles.row} onPress={() => setShowWDetails(v => !v)}>
              <Text style={styles.resultTitle}>Besoins en eau</Text>
              <Ionicons name={showWDetails ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#1976D2" />
            </TouchableOpacity>
            {!showWDetails && (
  <View style={styles.row}>
    <View style={styles.column}>
      <Text style={styles.resultLabel}>Débit d'extinction pratique :</Text>
      <Text style={styles.resultValue}>{formatNumber(canonDebit)} L/min ({formatNumber(canonDebit * 0.06)} m³/h)</Text>
      <Text style={styles.resultLabel}>Volume total eau :</Text>
      <Text style={styles.resultValue}>{formatNumber((canonDebit/2)*parseFloat(tempDur) + canonDebit*parseFloat(extDur) + canonDebit*parseFloat(maintDur))} L ({formatNumber(((canonDebit/2)*parseFloat(tempDur) + canonDebit*parseFloat(extDur) + canonDebit*parseFloat(maintDur))/1000)} m³)</Text>
    </View>
  </View>
)}
{showWDetails && (
  <View style={styles.row}>
    <View style={styles.column}>
      <Text style={styles.resultLabel}>Débit d'extinction pratique :</Text>
      <Text style={styles.resultValue}>{formatNumber(canonDebit)} L/min ({formatNumber(canonDebit * 0.06)} m³/h)</Text>
      <Text style={[styles.resultLabel, {fontWeight:'bold'}]}>Volume temporisation :</Text>
      <Text style={styles.resultValue}>{formatNumber((canonDebit/2)*parseFloat(tempDur))} L ({formatNumber(((canonDebit/2)*parseFloat(tempDur))/1000)} m³)</Text>
      <Text style={[styles.resultLabel, {fontSize:12, color:'#333'}]}>Formule : ({formatNumber(canonDebit)}/2) × {tempDur} = {formatNumber(canonDebit/2)} × {tempDur} = {formatNumber((canonDebit/2)*parseFloat(tempDur))} L</Text>
      <Text style={[styles.resultLabel, {fontWeight:'bold'}]}>Volume extinction :</Text>
      <Text style={styles.resultValue}>{formatNumber(canonDebit*parseFloat(extDur))} L ({formatNumber((canonDebit*parseFloat(extDur))/1000)} m³)</Text>
      <Text style={[styles.resultLabel, {fontSize:12, color:'#333'}]}>Formule : {formatNumber(canonDebit)} × {extDur} = {formatNumber(canonDebit*parseFloat(extDur))} L</Text>
      <Text style={[styles.resultLabel, {fontWeight:'bold'}]}>Volume entretien :</Text>
      <Text style={styles.resultValue}>{formatNumber(canonDebit*parseFloat(maintDur))} L ({formatNumber((canonDebit*parseFloat(maintDur))/1000)} m³)</Text>
      <Text style={[styles.resultLabel, {fontSize:12, color:'#333'}]}>Formule : {formatNumber(canonDebit)} × {maintDur} = {formatNumber(canonDebit*parseFloat(maintDur))} L</Text>
      <Text style={[styles.resultLabel, {fontWeight:'bold'}]}>Volume total eau :</Text>
      <Text style={styles.resultValue}>{formatNumber((canonDebit/2)*parseFloat(tempDur) + canonDebit*parseFloat(extDur) + canonDebit*parseFloat(maintDur))} L ({formatNumber(((canonDebit/2)*parseFloat(tempDur) + canonDebit*parseFloat(extDur) + canonDebit*parseFloat(maintDur))/1000)} m³)</Text>
      <Text style={[styles.resultLabel, {fontSize:12, color:'#333'}]}>Formule : {formatNumber(canonDebit/2)} × {tempDur} + {formatNumber(canonDebit)} × {extDur} + {formatNumber(canonDebit)} × {maintDur} = {formatNumber((canonDebit/2)*parseFloat(tempDur))} + {formatNumber(canonDebit*parseFloat(extDur))} + {formatNumber(canonDebit*parseFloat(maintDur))} = {formatNumber((canonDebit/2)*parseFloat(tempDur) + canonDebit*parseFloat(extDur) + canonDebit*parseFloat(maintDur))} L</Text>
    </View>
  </View>
)}
            {showWDetails && (
              <>
                {/* Rien ici, les résultats détaillés sont déjà dans le bloc principal */}

                <TouchableOpacity style={[styles.row, { marginTop: 8 }]} onPress={() => setShowWFullDetails(v => !v)}>
                  <Text style={styles.resultLabel}>Voir calculs</Text>
                  <Ionicons name={showWFullDetails ? "chevron-up-outline" : "chevron-down-outline"} size={16} color="#1976D2" />
                </TouchableOpacity>
                {showWFullDetails && (
  <View style={{ backgroundColor: '#E1F5FE', padding: 8, borderRadius: 8, marginTop: 4 }}>
    <Text style={[styles.resultLabel, {fontWeight:'bold'}]}>Besoin en eau total :</Text>
<Text style={styles.resultValue}>{formatNumber(canonDebit)} L/min ({formatNumber(canonDebit * 0.06)} m³/h)</Text>
<Text style={[styles.resultLabel, {fontSize:12, color:'#333'}]}>Formule : {`${nbCanon4000}×4000 + ${nbCanon2000}×2000 + ${nbCanon1000}×1000 = ${formatNumber(canonDebit)} L/min`}</Text>
<Text style={[styles.resultLabel, {fontWeight:'bold'}]}>Volume temporisation :</Text>
<Text style={styles.resultValue}>{formatNumber((canonDebit/2)*parseFloat(tempDur))} L ({formatNumber(((canonDebit/2)*parseFloat(tempDur))/1000)} m³)</Text>
<Text style={[styles.resultLabel, {fontSize:12, color:'#333'}]}>Formule : ({formatNumber(canonDebit)}/2) × {tempDur} = {formatNumber(canonDebit/2)} × {tempDur} = {formatNumber((canonDebit/2)*parseFloat(tempDur))} L</Text>
<Text style={[styles.resultLabel, {fontWeight:'bold'}]}>Volume extinction :</Text>
<Text style={styles.resultValue}>{formatNumber(canonDebit*parseFloat(extDur))} L ({formatNumber((canonDebit*parseFloat(extDur))/1000)} m³)</Text>
<Text style={[styles.resultLabel, {fontSize:12, color:'#333'}]}>Formule : {formatNumber(canonDebit)} × {extDur} = {formatNumber(canonDebit*parseFloat(extDur))} L</Text>
<Text style={[styles.resultLabel, {fontWeight:'bold'}]}>Volume entretien :</Text>
<Text style={styles.resultValue}>{formatNumber(canonDebit*parseFloat(maintDur))} L ({formatNumber((canonDebit*parseFloat(maintDur))/1000)} m³)</Text>
<Text style={[styles.resultLabel, {fontSize:12, color:'#333'}]}>Formule : {formatNumber(canonDebit)} × {maintDur} = {formatNumber(canonDebit*parseFloat(maintDur))} L</Text>
<Text style={[styles.resultLabel, {fontWeight:'bold'}]}>Volume total eau :</Text>
<Text style={styles.resultValue}>{formatNumber((canonDebit/2)*parseFloat(tempDur) + canonDebit*parseFloat(extDur) + canonDebit*parseFloat(maintDur))} L ({formatNumber(((canonDebit/2)*parseFloat(tempDur) + canonDebit*parseFloat(extDur) + canonDebit*parseFloat(maintDur))/1000)} m³)</Text>
<Text style={[styles.resultLabel, {fontSize:12, color:'#333'}]}>Formule : {formatNumber(canonDebit/2)} × {tempDur} + {formatNumber(canonDebit)} × {extDur} + {formatNumber(canonDebit)} × {maintDur} = {formatNumber((canonDebit/2)*parseFloat(tempDur))} + {formatNumber(canonDebit*parseFloat(extDur))} + {formatNumber(canonDebit*parseFloat(maintDur))} = {formatNumber((canonDebit/2)*parseFloat(tempDur) + canonDebit*parseFloat(extDur) + canonDebit*parseFloat(maintDur))} L</Text>
  </View>
)}
              </>
            )}
          </View>
          {/* Émulseur */}
          <View style={[styles.resultSection, styles.emSection]}>
            <TouchableOpacity style={styles.row} onPress={() => setShowEmDetails(v => !v)}>
              <Text style={styles.resultTitle}>Besoins en émulseur</Text>
              <Ionicons name={showEmDetails ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#D32F2F" />
            </TouchableOpacity>
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.resultLabel}>Quantité totale d'émulseur :</Text>
<Text style={styles.resultValue}>{formatNumber(totalVolume ? parseFloat(totalVolume) : 0)} L ({formatNumber(totalVolume ? parseFloat(totalVolume)/1000 : 0)} m³)</Text>
              </View>
            </View>
            {showEmDetails && (
              <>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.resultLabel}>Temporisation :</Text>
<Text style={styles.resultValue}>{formatNumber(tempVolume ? parseFloat(tempVolume) : 0)} L ({formatNumber(tempVolume ? parseFloat(tempVolume)/1000 : 0)} m³)</Text>
<Text style={styles.resultLabel}>Extinction :</Text>
<Text style={styles.resultValue}>{formatNumber(extVolume ? parseFloat(extVolume) : 0)} L ({formatNumber(extVolume ? parseFloat(extVolume)/1000 : 0)} m³)</Text>
<Text style={styles.resultLabel}>Entretien :</Text>
<Text style={styles.resultValue}>{formatNumber(maintVolume ? parseFloat(maintVolume) : 0)} L ({formatNumber(maintVolume ? parseFloat(maintVolume)/1000 : 0)} m³)</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.row, { marginTop: 8 }]} onPress={() => setShowEmFullDetails(v => !v)}>
                  <Text style={styles.resultLabel}>Voir calculs</Text>
                  <Ionicons name={showEmFullDetails ? "chevron-up-outline" : "chevron-down-outline"} size={16} color="#D32F2F" />
                </TouchableOpacity>
                {showEmFullDetails && (
  <View style={{ backgroundColor: '#FFF9C4', padding: 8, borderRadius: 8, marginTop: 4 }}>
    <Text style={styles.resultLabel}>{`Quantité émulseur (temporisation) = (Capacité des canons/2) × Durée temporisation × Concentration = (${formatNumber(canonDebit)}/2) × ${tempDur} × ${conc}% = ${formatNumber((canonDebit/2)*parseFloat(tempDur)*parseFloat(conc)/100)} L (${formatNumber((canonDebit/2)*parseFloat(tempDur)*parseFloat(conc)/100/1000)} m³)`}</Text>
    <Text style={styles.resultLabel}>{`Quantité émulseur (extinction) = Capacité des canons × Durée extinction × Concentration = ${formatNumber(canonDebit)} × ${extDur} × ${conc}% = ${formatNumber(canonDebit*parseFloat(extDur)*parseFloat(conc)/100)} L (${formatNumber(canonDebit*parseFloat(extDur)*parseFloat(conc)/100/1000)} m³)`}</Text>
    <Text style={styles.resultLabel}>{`Quantité émulseur (entretien) = Capacité des canons × Durée entretien × Concentration = ${formatNumber(canonDebit)} × ${maintDur} × ${conc}% = ${formatNumber(canonDebit*parseFloat(maintDur)*parseFloat(conc)/100)} L (${formatNumber(canonDebit*parseFloat(maintDur)*parseFloat(conc)/100/1000)} m³)`}</Text>
    <Text style={styles.resultLabel}>{`Quantité totale émulseur = ${formatNumber((canonDebit/2)*parseFloat(tempDur)*parseFloat(conc)/100 + canonDebit*parseFloat(extDur)*parseFloat(conc)/100 + canonDebit*parseFloat(maintDur)*parseFloat(conc)/100)} L (${formatNumber((canonDebit/2)*parseFloat(tempDur)*parseFloat(conc)/100/1000 + canonDebit*parseFloat(extDur)*parseFloat(conc)/100/1000 + canonDebit*parseFloat(maintDur)*parseFloat(conc)/100/1000)} m³)`}</Text>
  </View>
)}
              </>
            )}
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
  buttons: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
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
