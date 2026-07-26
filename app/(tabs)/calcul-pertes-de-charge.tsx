import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
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
import { router } from 'expo-router';

type VisibleResultItem = {
  id: string;
  tone: 'current' | 'saved';
  title: string;
  detail: string;
  value: string;
  removableId?: string;
};

export default function CalculPertesDeCharge() {
  const { width } = useWindowDimensions();
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
  const isCompact = width < 680;
  const deleteActionColor = palette.link;

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

  const visibleResults = useMemo<VisibleResultItem[]>(() => {
    const items: VisibleResultItem[] = [];
    const currentId = `${diametre}-${longueur}-${debit}`;

    if (resultat !== null) {
      items.push({
        id: 'current-result',
        tone: 'current',
        title: canConserve ? 'Calcul courant' : 'Dernier calcul',
        detail: `Ø ${diametre} mm · ${longueur} m · ${debit} L/min`,
        value: `${formatNumber(resultat)} bars`,
      });
    }

    for (const segment of segments) {
      if (items.length >= 2) break;
      if (segment.id === currentId && resultat !== null) continue;

      items.push({
        id: segment.id,
        tone: 'saved',
        title: 'Valeur conservée',
        detail: `Ø ${segment.diametre} mm · ${segment.longueur} m · ${segment.debit} L/min`,
        value: `${formatNumber(segment.perte)} bars`,
        removableId: segment.id,
      });
    }

    return items;
  }, [canConserve, debit, diametre, longueur, resultat, segments]);

  const hasVisibleResults = visibleResults.length > 0;

  const renderDeleteAction = (onDelete: () => void) => (
    <TouchableOpacity
      onPress={onDelete}
      activeOpacity={0.9}
      style={[styles.swipeDeleteAction, { backgroundColor: deleteActionColor }]}
    >
      <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
      <Caption style={styles.swipeDeleteText}>Supprimer</Caption>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          hasVisibleResults && styles.scrollContentWithDock,
          hasVisibleResults && isCompact && styles.scrollContentWithDockCompact,
        ]}
      >
        <ScreenHeader title="Pertes de charge" icon="flame" />

        <Card variant="outlined" style={styles.section}>
          <Label style={{ color: palette.warning }}>Tableau à adapter au matériel</Label>
          <Body>
            Le calcul applique la valeur du tableau à la longueur établie. Les
            valeurs initiales sont pédagogiques : vérifiez-les avec la doctrine
            locale et les caractéristiques de vos tuyaux avant emploi.
          </Body>
          <Button
            title="Voir les références et limites"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/doctrine' as never)}
          />
        </Card>

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
              containerStyle={styles.customInputField}
            />
            <Button
              title="Valider"
              onPress={handleCustomLength}
              disabled={!longueurPerso}
              size="md"
              style={styles.customInputButton}
            />
          </View>
          {erreurLongueur ? <Caption style={{ color: palette.primary }}>{erreurLongueur}</Caption> : null}
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
          segments.length > 0 && (
            <Card style={styles.section}>
              <Title style={{ textAlign: 'center' }}>Historique des valeurs</Title>
              {segments.map((c) => (
                <Swipeable
                  key={c.id}
                  friction={2}
                  rightThreshold={24}
                  overshootRight={false}
                  renderRightActions={() => renderDeleteAction(() => removeSegment(c.id))}
                >
                  <View style={[styles.savedRow, { borderBottomColor: palette.border }]}>
                    <Body style={{ flex: 1 }}>Ø {c.diametre}mm - {c.longueur}m - {c.debit}L/min</Body>
                    <Body style={{ fontWeight: 'bold', color: palette.primary }}>{formatNumber(c.perte)} bars</Body>
                  </View>
                </Swipeable>
              ))}
              <View style={styles.actionButtons}>
                <Button title="Réinitialiser" onPress={handleReset} variant="ghost" />
                <Button title="Calcul établissement" onPress={() => navigation.navigate('calcul-etablissement' as never)} />
              </View>
            </Card>
          )
        }

      </ScrollView>

      {hasVisibleResults ? (
        <View style={[styles.resultsDock, { backgroundColor: palette.background }]}>
          <Card variant="filled" animated={false} style={styles.resultsDockCard}>
            {canConserve ? (
              <View style={styles.resultsDockActions}>
                <Button
                  title="Conserver"
                  onPress={handleConserver}
                  variant="outline"
                  size="sm"
                />
              </View>
            ) : null}

            <View style={styles.visibleResultsList}>
              {visibleResults.map((item) => (
                <View key={item.id} style={styles.visibleResultSlot}>
                  {item.removableId ? (
                    <Swipeable
                      friction={2}
                      rightThreshold={24}
                      overshootRight={false}
                      renderRightActions={() => renderDeleteAction(() => removeSegment(item.removableId!))}
                    >
                      <View
                        style={[
                          styles.visibleResultCard,
                          item.tone === 'current'
                            ? [styles.visibleResultCurrent, { borderColor: palette.primary, backgroundColor: palette.surface }]
                            : [styles.visibleResultSaved, { borderColor: palette.border, backgroundColor: palette.card }],
                        ]}
                      >
                        <View style={styles.visibleResultTopRow}>
                          <Body style={item.tone === 'current' ? styles.visibleResultBadgeCurrent : styles.visibleResultBadgeSaved}>
                            {item.title}
                          </Body>
                        </View>
                        <Title style={styles.visibleResultValue}>{item.value}</Title>
                        <Caption style={styles.visibleResultDetail} numberOfLines={2}>
                          {item.detail}
                        </Caption>
                      </View>
                    </Swipeable>
                  ) : (
                    <View
                      style={[
                        styles.visibleResultCard,
                        item.tone === 'current'
                          ? [styles.visibleResultCurrent, { borderColor: palette.primary, backgroundColor: palette.surface }]
                          : [styles.visibleResultSaved, { borderColor: palette.border, backgroundColor: palette.card }],
                      ]}
                    >
                      <View style={styles.visibleResultTopRow}>
                        <Body style={item.tone === 'current' ? styles.visibleResultBadgeCurrent : styles.visibleResultBadgeSaved}>
                          {item.title}
                        </Body>
                      </View>
                      <Title style={styles.visibleResultValue}>{item.value}</Title>
                      <Caption style={styles.visibleResultDetail} numberOfLines={2}>
                        {item.detail}
                      </Caption>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Card>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  scrollContentWithDock: { paddingBottom: 180 },
  scrollContentWithDockCompact: { paddingBottom: 188 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  section: { gap: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  customInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  customInputField: { flex: 1, marginBottom: 0 },
  customInputButton: { alignSelf: 'center' },
  savedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 8 },
  resultsDock: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 8,
  },
  resultsDockCard: {
    padding: 10,
    marginVertical: 0,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.12)',
  },
  resultsDockActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  visibleResultsList: {
    flexDirection: 'row',
    gap: 8,
  },
  visibleResultSlot: {
    flex: 1,
    minWidth: 0,
  },
  visibleResultCard: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    gap: 2,
    justifyContent: 'space-between',
  },
  visibleResultCurrent: {
    borderWidth: 1.5,
  },
  visibleResultSaved: {
    borderWidth: 1,
  },
  visibleResultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visibleResultBadgeCurrent: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 0,
  },
  visibleResultBadgeSaved: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    opacity: 0.75,
    marginBottom: 0,
  },
  visibleResultDetail: {
    fontSize: 11,
    lineHeight: 14,
    opacity: 0.78,
    marginBottom: 0,
  },
  visibleResultValue: {
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 0,
  },
  swipeDeleteAction: {
    width: 104,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    marginVertical: 2,
  },
  swipeDeleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 0,
  },
});
