import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Title, Subtitle, Label, Body, Caption } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

function FHLIApproach() {
  const [nbCanon4000, setNbCanon4000] = useState('0');
  const [nbCanon2000, setNbCanon2000] = useState('0');
  const [nbCanon1000, setNbCanon1000] = useState('0');
  // Capacité totale des canons en L/min
  const canonDebit =
    parseInt(nbCanon4000 || '0') * 4000 +
    parseInt(nbCanon2000 || '0') * 2000 +
    parseInt(nbCanon1000 || '0') * 1000;

  const [canonResult, setCanonResult] = useState<number | null>(null);
  const [showCanonDetails, setShowCanonDetails] = useState(false);
  const [tab, setTab] = useState<'foam' | 'structure'>('foam');
  const [surface, setSurface] = useState('');
  const [rateType, setRateType] = useState<'Hydrocarbures' | 'Liquide polaire' | 'Taux POI'>('Hydrocarbures');
  const [customRate, setCustomRate] = useState('');
  const [conc, setConc] = useState('3');
  const [tempDur, setTempDur] = useState('20');
  const [extDur, setExtDur] = useState('40');
  const [maintDur, setMaintDur] = useState<string>('10');
  const [tempVolume, setTempVolume] = useState<string | null>(null);
  const [extVolume, setExtVolume] = useState<string | null>(null);
  const [maintVolume, setMaintVolume] = useState<string | null>(null);
  const [totalVolume, setTotalVolume] = useState<string | null>(null);
  // Volumes d'eau
  const [waterTotalVolume, setWaterTotalVolume] = useState<string | null>(null);
  // Flux émulseur
  const [emTotalFlow, setEmTotalFlow] = useState<string | null>(null);
  // Flux eau
  const [showEmDetails, setShowEmDetails] = useState(false);
  const [showWDetails, setShowWDetails] = useState(false);
  const [showEmFullDetails, setShowEmFullDetails] = useState(false);
  const [showWFullDetails, setShowWFullDetails] = useState(false);

  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

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
    setEmTotalFlow(formatNumber(emTotal / 1000)); // en m³

    // Calcul eau
    const wTemp = !isNaN(dureeTemp) && tempDur !== '' ? (canonDebit / 2) * dureeTemp : 0;
    const wExt = !isNaN(dureeExt) && extDur !== '' ? canonDebit * dureeExt : 0;
    const wMaint = !isNaN(dureeMaint) && maintDur !== '' ? canonDebit * dureeMaint : 0;
    const wTotal = wTemp + wExt + wMaint;
    setWaterTotalVolume(wTotal.toString());
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
    setWaterTotalVolume(null);
    setEmTotalFlow(null);
    setTotalVolume(null);
  }, []);

  const renderTabs = () => (
    <View style={styles.tabRow}>
      <Chip
        label="Mousse"
        selected={tab === 'foam'}
        onPress={() => setTab('foam')}
      />
      <Chip
        label="Structure"
        selected={tab === 'structure'}
        onPress={() => setTab('structure')}
      />
    </View>
  );

  const renderFoam = () => (
    <View>
      <Input
        label="Surface de la cuvette (m²)"
        value={surface}
        onChangeText={setSurface}
        keyboardType="numeric"
        placeholder="Ex: 1000"
      />

      <Label style={{ marginTop: 12 }}>Taux d'application</Label>
      <View style={styles.selectRow}>
        {['Hydrocarbures', 'Liquide polaire', 'Taux POI'].map(opt => (
          <Chip
            key={opt}
            label={opt}
            selected={rateType === opt}
            onPress={() => setRateType(opt as any)}
            style={{ marginBottom: 8 }}
          />
        ))}
      </View>

      <Label style={{ marginTop: 8 }}>Taux d'application (L/min/m²) : {getTauxReflexe()}</Label>
      <Slider
        style={{ marginBottom: 16 }}
        minimumValue={0}
        maximumValue={25}
        step={0.5}
        value={getTauxReflexe()}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        onValueChange={value => {
          setRateType('Taux POI');
          setCustomRate(value.toString());
        }}
      />
      <View style={styles.sliderMarks}>
        <TouchableOpacity style={{ position: 'absolute', left: '20%' }} onPress={() => { setRateType('Taux POI'); setCustomRate('5'); }}>
          <Caption>5</Caption>
        </TouchableOpacity>
        <TouchableOpacity style={{ position: 'absolute', left: '40%' }} onPress={() => { setRateType('Taux POI'); setCustomRate('10'); }}>
          <Caption>10</Caption>
        </TouchableOpacity>
      </View>

      <Label>Concentration (%) : {conc}</Label>
      <Slider
        style={{ marginBottom: 16 }}
        minimumValue={0}
        maximumValue={9}
        step={0.5}
        value={parseFloat(conc)}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        onValueChange={value => setConc(value.toString())}
      />
      <View style={styles.sliderMarks}>
        <TouchableOpacity style={{ position: 'absolute', left: '33.33%' }} onPress={() => setConc('3')}>
          <Caption>3%</Caption>
        </TouchableOpacity>
        <TouchableOpacity style={{ position: 'absolute', left: '66.66%' }} onPress={() => setConc('6')}>
          <Caption>6%</Caption>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16, gap: 12 }}>
        <Button
          title="Réinitialiser"
          variant="outline"
          onPress={() => {
            setCanonResult(null);
            setShowCanonDetails(false);
            setSurface('');
            setRateType('Hydrocarbures');
            setCustomRate('');
          }}
        />
        <Button
          title="Calculer"
          onPress={() => {
            const surf = parseFloat(surface);
            const taux = getTauxReflexe();
            if (isNaN(surf) || isNaN(taux)) return;
            setCanonResult(surf * taux);
            setShowCanonDetails(false);
          }}
        />
      </View>

      {canonResult !== null && (
        <Card variant="filled" style={{ backgroundColor: '#F1F8E9', borderColor: '#C5E1A5' }}>
          <TouchableOpacity style={[styles.row, { alignItems: 'flex-start' }]} onPress={() => setShowCanonDetails(v => !v)}>
            <View style={{ flex: 1 }}>
              <Title style={{ textAlign: 'center', color: '#33691E', fontSize: 18 }}>Débit d'extinction nécessaire</Title>
              <Caption style={{ textAlign: 'center', color: '#558B2F' }}>(débit de solution moussante)</Caption>
            </View>
            <Ionicons name={showCanonDetails ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#33691E" style={{ marginLeft: 8, marginTop: 2 }} />
          </TouchableOpacity>

          <Text style={[styles.resultValue, { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#33691E' }]}>
            {formatNumber(canonResult)} L/min ({formatNumber((canonResult / 1000) * 60)} m³/h)
          </Text>

          {showCanonDetails && (
            <View style={{ marginTop: 8 }}>
              <Body>{`Débit d'extinction nécessaire = Surface × Taux d'application`}</Body>
              <Body>{`= ${formatNumber(surface)} × ${formatNumber(getTauxReflexe())} = ${formatNumber(canonResult)} L/min`}</Body>
            </View>
          )}
        </Card>
      )}

      <Label style={{ marginTop: 24, marginBottom: 12 }}>Nombre de canons :</Label>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <View style={{ flex: 1, marginHorizontal: 4 }}>
          <Label style={{ textAlign: 'center', fontSize: 12, marginBottom: 4 }}>4 000L/min</Label>
          <Input
            containerStyle={{ marginBottom: 0 }}
            style={{ color: '#1976D2', fontWeight: 'bold', textAlign: 'center' }}
            value={typeof nbCanon4000 === 'undefined' ? '0' : nbCanon4000}
            onChangeText={setNbCanon4000}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={{ flex: 1, marginHorizontal: 4 }}>
          <Label style={{ textAlign: 'center', fontSize: 12, marginBottom: 4 }}>2 000L/min</Label>
          <Input
            containerStyle={{ marginBottom: 0 }}
            style={{ color: '#1976D2', fontWeight: 'bold', textAlign: 'center' }}
            value={typeof nbCanon2000 === 'undefined' ? '0' : nbCanon2000}
            onChangeText={setNbCanon2000}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={{ flex: 1, marginHorizontal: 4 }}>
          <Label style={{ textAlign: 'center', fontSize: 12, marginBottom: 4 }}>1 000L/min</Label>
          <Input
            containerStyle={{ marginBottom: 0 }}
            style={{ color: '#1976D2', fontWeight: 'bold', textAlign: 'center' }}
            value={typeof nbCanon1000 === 'undefined' ? '0' : nbCanon1000}
            onChangeText={setNbCanon1000}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Label>Capacité des canons :</Label>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
          {formatNumber(canonDebit)} L/min ({formatNumber((canonDebit / 1000) * 60)} m³/h)
        </Text>
      </View>

      <Input label="Durée temporisation (min)" value={tempDur} onChangeText={setTempDur} keyboardType="numeric" placeholder="20" />
      <Input label="Durée extinction (min)" value={extDur} onChangeText={setExtDur} keyboardType="numeric" placeholder="40" />
      <Input label="Durée entretien tapis de mousse (min)" value={maintDur} onChangeText={setMaintDur} keyboardType="numeric" placeholder="10" />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 16, gap: 12 }}>
        <Button title="Réinitialiser" variant="outline" onPress={handleResetFoam} />
        <Button title="Calculer" onPress={handleCalculateFoam} />
      </View>

      {(emTotalFlow || waterTotalVolume) && (
        <View>
          <Title style={{ textAlign: 'center', color: colors.primary }}>Résultats</Title>

          {/* Eau */}
          <Card variant="filled" style={{ backgroundColor: '#E1F5FE', borderColor: '#81D4FA' }}>
            <TouchableOpacity style={styles.row} onPress={() => setShowWDetails(v => !v)}>
              <Title style={{ fontSize: 18, color: '#0277BD', marginBottom: 0 }}>Besoins en eau</Title>
              <Ionicons name={showWDetails ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#0277BD" />
            </TouchableOpacity>

            {!showWDetails && (
              <View style={{ marginTop: 8 }}>
                <Body><Text style={{ fontWeight: 'bold' }}>Débit pratique : </Text>{formatNumber(canonDebit)} L/min</Body>
                <Body><Text style={{ fontWeight: 'bold' }}>Volume total eau : </Text>{formatNumber(waterTotalVolume || 0)} L ({formatNumber(parseFloat(waterTotalVolume || '0') / 1000)} m³)</Body>
              </View>
            )}

            {showWDetails && (
              <View style={{ marginTop: 8 }}>
                <Body><Text style={{ fontWeight: 'bold' }}>Débit pratique : </Text>{formatNumber(canonDebit)} L/min</Body>

                <View style={{ marginVertical: 8 }}>
                  <Body><Text style={{ fontWeight: 'bold' }}>Volume temporisation : </Text>{formatNumber((canonDebit / 2) * parseFloat(tempDur))} L</Body>
                  <Caption>Formule : ({formatNumber(canonDebit)}/2) × {tempDur}</Caption>
                </View>

                <View style={{ marginVertical: 8 }}>
                  <Body><Text style={{ fontWeight: 'bold' }}>Volume extinction : </Text>{formatNumber(canonDebit * parseFloat(extDur))} L</Body>
                  <Caption>Formule : {formatNumber(canonDebit)} × {extDur}</Caption>
                </View>

                <View style={{ marginVertical: 8 }}>
                  <Body><Text style={{ fontWeight: 'bold' }}>Volume entretien : </Text>{formatNumber(canonDebit * parseFloat(maintDur))} L</Body>
                  <Caption>Formule : {formatNumber(canonDebit)} × {maintDur}</Caption>
                </View>

                <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: '#B3E5FC', paddingTop: 8 }}>
                  <Body style={{ fontSize: 16, fontWeight: 'bold', color: '#01579B' }}>Volume total eau : {formatNumber(waterTotalVolume || 0)} L</Body>
                </View>
              </View>
            )}
          </Card>

          {/* Émulseur */}
          <Card variant="filled" style={{ backgroundColor: '#FFF9C4', borderColor: '#FFF59D', marginTop: 12 }}>
            <TouchableOpacity style={styles.row} onPress={() => setShowEmDetails(v => !v)}>
              <Title style={{ fontSize: 18, color: '#F57F17', marginBottom: 0 }}>Besoins en émulseur</Title>
              <Ionicons name={showEmDetails ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#F57F17" />
            </TouchableOpacity>

            <View style={{ marginTop: 8 }}>
              <Body style={{ fontSize: 16, fontWeight: 'bold', color: '#E65100' }}>Quantité totale : {formatNumber(totalVolume || 0)} L</Body>
              <Body>({formatNumber(parseFloat(totalVolume || '0') / 1000)} m³)</Body>
            </View>

            {showEmDetails && (
              <View style={{ marginTop: 12 }}>
                <Body><Text style={{ fontWeight: 'bold' }}>Temporisation : </Text>{formatNumber(tempVolume || 0)} L</Body>
                <Body><Text style={{ fontWeight: 'bold' }}>Extinction : </Text>{formatNumber(extVolume || 0)} L</Body>
                <Body><Text style={{ fontWeight: 'bold' }}>Entretien : </Text>{formatNumber(maintVolume || 0)} L</Body>

                <TouchableOpacity style={[styles.row, { marginTop: 12 }]} onPress={() => setShowEmFullDetails(v => !v)}>
                  <Label style={{ color: '#E65100' }}>Voir formules détaillées</Label>
                  <Ionicons name={showEmFullDetails ? "chevron-up-outline" : "chevron-down-outline"} size={16} color="#E65100" />
                </TouchableOpacity>

                {showEmFullDetails && (
                  <View style={{ backgroundColor: '#FFFDE7', padding: 8, borderRadius: 8, marginTop: 4 }}>
                    <Caption style={{ marginBottom: 4 }}>Q. émul (temp) = (Capacité/2) × Durée × Conc</Caption>
                    <Caption style={{ marginBottom: 4 }}>Q. émul (ext) = Capacité × Durée × Conc</Caption>
                    <Caption>Q. émul (entr) = Capacité × Durée × Conc</Caption>
                  </View>
                )}
              </View>
            )}
          </Card>
        </View>
      )}
    </View>
  );

  const renderStructure = () => (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Body>Calcul structure à venir</Body>
    </View>
  );

  return (
    <View style={styles.container}>
      <Title>Approche FHLI</Title>
      {renderTabs()}
      {tab === 'foam' ? renderFoam() : renderStructure()}
    </View>
  );
}

export default memo(FHLIApproach);

const styles = StyleSheet.create({
  container: { padding: 4 },
  tabRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8 },
  sliderMarks: { position: 'relative', width: '100%', height: 20, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultValue: { color: '#000', fontSize: 14, marginBottom: 4 },
});

