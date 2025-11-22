import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '../../context/ThemeContext';
import { useMemoSegments } from '../../context/MemoSegmentsContext';
import { usePertesDeChargeTable } from '../../context/PertesDeChargeTableContext';
import { calculerPerteDeCharge } from '../../constants/calculPerteDeCharge';
import { Colors } from '../../constants/Colors';
import { Debit, Diametre } from '../../constants/pertesDeChargeTable';

import { Card } from '@/components/ui/Card';
import { Title, Label, Body, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { formatNumber } from '@/utils/format';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function CalculPertesDeCharge() {
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const navigation = useNavigation();
  const { table: pertesDeChargeTable } = usePertesDeChargeTable();
  const { segments, addSegment, clearSegments, removeSegment } = useMemoSegments();

  const [diametre, setDiametre] = useState<Diametre>(45);
  const [longueur, setLongueur] = useState(20);
  const [longueurPerso, setLongueurPerso] = useState('');
  const [erreurLongueur, setErreurLongueur] = useState('');
  const [debit, setDebit] = useState<Debit>(250);
  const [resultat, setResultat] = useState<number | null>(null);
  const [canConserve, setCanConserve] = useState(false);

  const handleCalcul = () => {
    const res = calculerPerteDeCharge(longueur, debit, diametre, pertesDeChargeTable);
    if (res.perteDeCharge !== null) {
      setResultat(res.perteDeCharge);
      setCanConserve(true);
    } else {
      setResultat(null);
      setCanConserve(false);
      alert(res.message || 'Erreur de calcul');
    }
  };

  const handleConserver = () => {
    if (resultat !== null && canConserve) {
      addSegment({ diametre, longueur, debit, perte: resultat });
      setCanConserve(false);
    }
  };

  const handleReset = () => {
    clearSegments();
  };

  const handleCustomLength = () => {
    const val = parseInt(longueurPerso, 10);
    if (!val || val < 1 || val > 300) {
      setErreurLongueur('Valeur entre 1 et 300');
      return;
    }
    setLongueur(val);
    setErreurLongueur('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Calcul de pertes de charge" icon="flame" />

        <Card style={styles.section}>
          <Label>Diamètre du tuyau (mm)</Label>
          <View style={styles.chipRow}>
            {[45, 70, 110].map(val => (
              <Chip
                key={val}
                label={`${val} mm`}
                selected={diametre === val}
                onPress={() => setDiametre(val as Diametre)}
              />
            ))}
          </View>

          <Label>Longueur du tuyau (m)</Label>
          <View style={styles.chipRow}>
            {[20, 40, 60, 80, 100].map(val => (
              <Chip
                key={val}
                label={`${val} m`}
                selected={longueur === val}
                onPress={() => {
                  setLongueur(val);
                  setLongueurPerso('');
                  setErreurLongueur('');
                }}
              />
            ))}
          </View>

          <View style={styles.customInputRow}>
            <Input
              placeholder="Autre (m)"
              value={longueurPerso}
              onChangeText={(t) => {
                setLongueurPerso(t.replace(/[^0-9]/g, ''));
                setErreurLongueur('');
              }}
              keyboardType="numeric"
              containerStyle={{ flex: 1 }}
            />
            <Button
              title="Valider"
              onPress={handleCustomLength}
              disabled={!longueurPerso}
              size="md"
            />
          </View>
          {erreurLongueur ? <Caption style={{ color: 'red' }}>{erreurLongueur}</Caption> : null}
          {longueurPerso && !erreurLongueur && longueur === parseInt(longueurPerso) && (
            <Caption style={{ color: palette.primary }}>Longueur sélectionnée : {longueur} m</Caption>
          )}

          <Label>Débit (L/min)</Label>
          <View style={styles.chipRow}>
            {[250, 500, 1000, 1500, 2000].map(val => (
              <Chip
                key={val}
                label={`${val}`}
                selected={debit === val}
                onPress={() => setDebit(val as Debit)}
              />
            ))}
          </View>

          <Button title="Calculer" onPress={handleCalcul} style={{ marginTop: 16 }} />
        </Card>

        {
          resultat !== null && (
            <Card variant="filled" style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Label>Perte de charge</Label>
                  <Title>{formatNumber(resultat)} bars</Title>
                </View>
                <Button
                  title="Conserver"
                  onPress={handleConserver}
                  disabled={!canConserve}
                  variant="outline"
                  size="sm"
                />
              </View>
            </Card>
          )
        }

        {
          segments.length > 0 && (
            <Card style={styles.section}>
              <Title style={{ textAlign: 'center' }}>Résultats conservés</Title>
              {segments.map((c) => (
                <View key={c.id} style={styles.savedRow}>
                  <Body style={{ flex: 1 }}>Ø {c.diametre}mm - {c.longueur}m - {c.debit}L/min</Body>
                  <Body style={{ fontWeight: 'bold', color: palette.primary }}>{formatNumber(c.perte)} bars</Body>
                  <TouchableOpacity onPress={() => removeSegment(c.id)} style={{ marginLeft: 8 }}>
                    <Ionicons name="trash-outline" size={20} color={palette.primary} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.actionButtons}>
                <Button title="Réinitialiser" onPress={handleReset} variant="ghost" />
                <Button title="Calcul établissement" onPress={() => navigation.navigate('CalculEtablissement' as never)} />
              </View>
            </Card>
          )
        }
      </ScrollView >
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  section: { gap: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  customInputRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  resultCard: { padding: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 8 },
});
