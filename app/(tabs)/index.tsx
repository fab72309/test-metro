import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { pertesDeChargeTable as pertesDeChargeTableDefault, Debit, Diametre } from '../../constants/pertesDeChargeTable';
import { usePertesDeChargeTable } from '../../context/PertesDeChargeTableContext';
import { calculerPerteDeCharge } from '../../constants/calculPerteDeCharge';

import { Colors } from '../../constants/Colors';

import { Ionicons } from '@expo/vector-icons';
import { useMemoSegments } from '../../context/MemoSegmentsContext';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '../../context/ThemeContext';
import { formatNumber } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { RELEASE_NOTES } from '../../constants/ReleaseNotes';
import { Title, Body } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';

export default function HomeScreen() {
  const { table: pertesDeChargeTable } = usePertesDeChargeTable();
  const { segments, addSegment, removeSegment, clearSegments } = useMemoSegments();
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const styles = getStyles(palette);

  const [diametre, setDiametre] = useState<Diametre>(45);
  const [longueur, setLongueur] = useState(20);
  const [debit, setDebit] = useState<Debit>(250);
  const [resultat, setResultat] = useState<number | null>(null);
  const [canConserve, setCanConserve] = useState(false);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const currentRelease = RELEASE_NOTES[0]; // v0.3.2-alpha

  // Calcul et affichage du résultat
  const handleCalcul = () => {
    const res = calculerPerteDeCharge(longueur, debit, diametre);
    if (res.perteDeCharge !== null) {
      setResultat(res.perteDeCharge);
      setCanConserve(true);
    } else {
      setResultat(null);
      setCanConserve(false);
      alert(res.message || 'Erreur de calcul');
    }
  };

  // Conserver le résultat
  const handleConserver = () => {
    if (resultat !== null && canConserve) {
      addSegment({ diametre, longueur, debit, perte: resultat });
      setCanConserve(false);
    }
  };

  // Supprimer un segment mémorisé
  const handleDelete = (id: string) => {
    removeSegment(id);
  };

  // Réinitialiser tous les résultats conservés
  const handleReset = () => {
    clearSegments();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ zIndex: 10, backgroundColor: palette.background, paddingHorizontal: 0, paddingVertical: 16, alignSelf: 'center' }}>
        <View style={styles.headerRow}>
          <Ionicons name="flame" size={26} color={palette.primary} style={{ marginRight: 6 }} />
          <Text style={styles.title}>Calcul de pertes de charge</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1, paddingTop: 0 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.labelSection}>Diamètre du tuyau (mm) :</Text>
          <View style={styles.rowWrap}>
            {[45, 70, 110].map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.paramBtn, diametre === val && styles.paramBtnSelected]}
                onPress={() => setDiametre(val as Diametre)}>
                <Text style={diametre === val ? styles.paramBtnSelectedTxt : styles.paramBtnTxt}>{val} mm</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.labelSection}>Longueur du tuyau (m) :</Text>
          <View style={styles.rowWrap}>
            {[20, 40, 60, 80, 100].map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.paramBtn, longueur === val && styles.paramBtnSelected]}
                onPress={() => setLongueur(val)}>
                <Text style={longueur === val ? styles.paramBtnSelectedTxt : styles.paramBtnTxt}>{val} m</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.labelSection}>Débit (L/min) :</Text>
          <View style={styles.rowWrap}>
            {[250, 500, 1000, 1500, 2000].map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.paramBtn, debit === val && styles.paramBtnSelected]}
                onPress={() => setDebit(val as Debit)}>
                <Text style={debit === val ? styles.paramBtnSelectedTxt : styles.paramBtnTxt}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Calculer" onPress={handleCalcul} style={{ marginTop: 18 }} />
        </View>
        {resultat !== null && (
          <View style={styles.resultCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.resultLabel}>Perte de charge</Text>
                <Text style={styles.resultValue}>{formatNumber(resultat)} <Text style={{ fontWeight: 'normal' }}>bars</Text></Text>
              </View>
              <Button title="Conserver" onPress={handleConserver} disabled={!canConserve} variant="outline" size="sm" />
            </View>
          </View>
        )}
        {
          segments.length > 0 && (
            <View style={styles.savedSection}>
              <Text style={styles.savedTitle}>Résultats conservés</Text>
              {segments.map((c, idx) => (
                <View key={c.id} style={styles.savedRow}>
                  <Text style={styles.savedDesc}>Ø {c.diametre}mm - {c.longueur}m - {c.debit}L/min</Text>
                  <Text style={styles.savedVal}>{formatNumber(c.perte)} bars</Text>
                  <TouchableOpacity onPress={() => handleDelete(c.id)}>
                    <Ionicons name="trash-outline" size={20} color={palette.primary} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 }}>
                <Button title="Réinitialiser" onPress={handleReset} variant="ghost" style={{ flex: 1 }} />
                <Button title="Calcul établissement" onPress={() => navigation.navigate('CalculEtablissement' as never)} style={{ flex: 1 }} />
              </View>
            </View>
          )
        }

        {/* Notes de version (v0.3.2-alpha) */}
        <Card style={{ marginTop: 18, padding: 16 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            onPress={() => setShowReleaseNotes(!showReleaseNotes)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sparkles" size={20} color={palette.primary} style={{ marginRight: 8 }} />
              <Title style={{ marginBottom: 0, fontSize: 18 }}>Nouveautés {currentRelease.version}</Title>
            </View>
            <Ionicons name={showReleaseNotes ? 'chevron-up' : 'chevron-down'} size={20} color={palette.primary} />
          </TouchableOpacity>

          {showReleaseNotes && (
            <View style={{ marginTop: 12 }}>
              <Body style={{ fontSize: 12, color: palette.secondaryText, marginBottom: 8 }}>{currentRelease.date}</Body>
              {currentRelease.changes.map((change, idx) => (
                <View key={idx} style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <Text style={{ color: palette.primary, marginRight: 6 }}>•</Text>
                  <Body style={{ flex: 1 }}>{change}</Body>
                </View>
              ))}
              <Button
                title="Voir tout l'historique"
                variant="ghost"
                size="sm"
                style={{ marginTop: 8, alignSelf: 'flex-start' }}
                onPress={() => navigation.navigate('Parametres' as never)}
              />
            </View>
          )}
        </Card>
      </ScrollView >
      <View style={{ padding: 10, alignItems: 'center' }}>
        <Text style={{ color: palette.secondaryText, fontSize: 12 }}>v0.3.2-alpha</Text>
      </View>
    </SafeAreaView >
  );
}

const getStyles = (palette: typeof Colors.light) => StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 10,
  },
  section: {
    backgroundColor: palette.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    shadowColor: palette.accent,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  labelSection: {
    fontWeight: 'bold',
    fontSize: 16,
    color: palette.text,
    marginBottom: 6,
    marginTop: 10,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4
  },
  paramBtn: {
    backgroundColor: palette.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 64,
    alignItems: 'center',
  },
  paramBtnSelected: {
    backgroundColor: palette.primary,
  },
  paramBtnTxt: {
    color: palette.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  paramBtnSelectedTxt: {
    color: palette.buttonText,
    fontWeight: 'bold',
    fontSize: 15,
  },
  resultCard: {
    backgroundColor: palette.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: palette.accent,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  resultLabel: {
    fontSize: 15,
    color: palette.secondaryText,
    marginBottom: 2,
  },
  resultValue: {
    color: palette.primary,
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 0,
  },
  savedSection: {
    backgroundColor: palette.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    shadowColor: palette.accent,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  savedTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: palette.primary,
    marginBottom: 10,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
    paddingVertical: 8,
    gap: 10,
  },
  savedDesc: {
    color: palette.text,
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
  savedVal: {
    color: palette.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 10,
  },
  title: {
    color: palette.primary,
    fontSize: 23,
    fontWeight: 'bold',
    marginVertical: 0,
    textAlign: 'left',
    letterSpacing: 0.2,
  },
  container: {
    backgroundColor: palette.background,
    padding: 16,
  },
});
