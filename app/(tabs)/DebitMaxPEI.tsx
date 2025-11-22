import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';

import { Card } from '@/components/ui/Card';
import { Title, Label, Body, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { formatNumber } from '@/utils/format';

const DebitMaxPEI = () => {
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const navigation = useNavigation();

  const [pressionStatique, setPressionStatique] = useState('');
  const [pressionResiduelle, setPressionResiduelle] = useState('');
  const [debitRefoulement, setDebitRefoulement] = useState('');
  const [resultat, setResultat] = useState('-');
  const [resultatArrondi, setResultatArrondi] = useState('-');
  const [resultatM3h, setResultatM3h] = useState('-');
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState({
    ps: '',
    pr: '',
    pUtil: '',
    qUtil: '',
    qMax: '',
    qDispo: '',
  });
  const [infoVisible, setInfoVisible] = useState(false);

  function handleCalcul() {
    const ps = parseFloat(pressionStatique.replace(',', '.'));
    const pr = parseFloat(pressionResiduelle.replace(',', '.'));
    const qUtil = parseFloat(debitRefoulement.replace(',', '.'));
    if (
      isNaN(ps) || isNaN(pr) || isNaN(qUtil) || ps <= pr || ps <= 0 || qUtil <= 0
    ) {
      setResultat('-');
      setResultatArrondi('-');
      setResultatM3h('-');
      setDetails({ ps: '', pr: '', pUtil: '', qUtil: '', qMax: '', qDispo: '' });
      return;
    }
    const pUtil = ps - pr;
    const qMax = qUtil * Math.sqrt(ps / pUtil);
    const qDispo = qMax - qUtil;
    const qDispoArrondi = Math.round(qDispo);
    const qDispoM3h = (qDispoArrondi * 0.06).toFixed(2);
    setResultat(qDispo.toFixed(2));
    setResultatArrondi(qDispoArrondi.toString());
    setResultatM3h(qDispoM3h);
    setDetails({
      ps: ps.toString(),
      pr: pr.toString(),
      pUtil: pUtil.toFixed(2),
      qUtil: qUtil.toString(),
      qMax: qMax.toFixed(2),
      qDispo: qDispo.toFixed(2),
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Débit max du PEI" icon="water" />

        <Card style={styles.card}>
          <Input
            label="Pression statique (bar)"
            placeholder="ex: 6.0"
            value={pressionStatique}
            onChangeText={setPressionStatique}
            keyboardType="numeric"
            leftIcon={<Ionicons name="speedometer" size={20} color={palette.primary} />}
          />
          <Input
            label="Pression résiduelle (bar)"
            placeholder="ex: 2.5"
            value={pressionResiduelle}
            onChangeText={setPressionResiduelle}
            keyboardType="numeric"
            leftIcon={<Ionicons name="water" size={20} color="#2196F3" />}
            containerStyle={{ marginTop: 12 }}
          />
          <Input
            label="Débit de refoulement (L/min)"
            placeholder="ex: 500"
            value={debitRefoulement}
            onChangeText={setDebitRefoulement}
            keyboardType="numeric"
            leftIcon={<Ionicons name="swap-vertical" size={20} color={palette.primary} />}
            containerStyle={{ marginTop: 12 }}
          />

          <Button title="Calculer" onPress={handleCalcul} style={{ marginTop: 24 }} />
        </Card>

        <Card variant="filled" style={styles.card}>
          <View style={styles.resultHeader}>
            <Label style={{ color: palette.primary }}>Débit disponible :</Label>
            <TouchableOpacity onPress={() => setInfoVisible(true)}>
              <Ionicons name="information-circle-outline" size={24} color="#1976D2" />
            </TouchableOpacity>
          </View>
          <View style={styles.resultBox}>
            <Title>{formatNumber(resultatArrondi)} L/min</Title>
            <Caption>({formatNumber(resultatM3h)} m³/h)</Caption>
          </View>
        </Card>

        <TouchableOpacity style={styles.detailsToggle} onPress={() => setShowDetails((v) => !v)}>
          <Ionicons name={showDetails ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#1976D2" />
          <Body style={{ color: '#1976D2', fontWeight: 'bold', marginLeft: 4 }}>
            {showDetails ? "Masquer les détails" : "Voir le détail du calcul"}
          </Body>
        </TouchableOpacity>

        {showDetails && (
          <Card style={styles.detailsBox}>
            <View style={styles.detailRow}><Label>Pression statique :</Label><Body>{formatNumber(details.ps)} bar</Body></View>
            <View style={styles.detailRow}><Label>Pression résiduelle :</Label><Body>{formatNumber(details.pr)} bar</Body></View>
            <View style={styles.detailRow}><Label>Pression utilisée :</Label><Body>{formatNumber(details.pUtil)} bar</Body></View>
            <View style={styles.detailRow}><Label>Débit utilisé :</Label><Body>{formatNumber(details.qUtil)} L/min</Body></View>
            <View style={styles.detailRow}><Label>Q max :</Label><Body>{formatNumber(details.qMax)} L/min</Body></View>
            <View style={styles.detailRow}><Label>Débit disponible :</Label><Body>{formatNumber(details.qDispo)} L/min</Body></View>
          </Card>
        )}

        <Modal visible={infoVisible} transparent animationType="fade" onRequestClose={() => setInfoVisible(false)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalContent}>
              <Title style={{ color: '#1976D2', marginBottom: 10 }}>Débit disponible</Title>
              <Body style={{ textAlign: 'center', marginBottom: 18 }}>
                Cette valeur correspond au débit supplémentaire que l’hydrant peut fournir, en plus du débit actuellement utilisé, dans les conditions de pression mesurées.
              </Body>
              <Button title="Fermer" onPress={() => setInfoVisible(false)} />
            </Card>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  card: { marginBottom: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  resultBox: { alignItems: 'center' },
  detailsToggle: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailsBox: { gap: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { alignItems: 'center' },
});
