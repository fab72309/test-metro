import React, { useState, useEffect } from 'react';
import { View, ScrollView, Modal, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMemoSegments } from '../../context/MemoSegmentsContext';
import { usePertesDeChargeTable } from '../../context/PertesDeChargeTableContext';
import { Colors } from '../../constants/Colors';
import { useThemeContext } from '../../context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Title, Label, Body, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { formatNumber } from '@/utils/format';

const deniveaux = [-30, -20, -10, 0, 10, 20, 30];

export default function CalculEtablissement() {
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const { segments, updateSegment, removeSegment } = useMemoSegments();
  const [denivele, setDenivele] = useState(0);
  const { pressionLance, customPressions, setPressionLance } = usePertesDeChargeTable();
  const [pressionActive, setPressionActive] = useState(true);

  useEffect(() => {
    if (customPressions && customPressions.length > 1) {
      setPressionLance(customPressions[1]);
    }
  }, []);

  // Calculs
  const perteDeCharge = segments.reduce((acc, t) => acc + t.perte, 0);
  const perteDenivele = denivele / 10;
  const pression = pressionActive ? pressionLance : 0;
  const total = perteDeCharge + perteDenivele + pression;

  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [edit, setEdit] = useState({ diametre: 45, longueur: 100, debit: 500, perte: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState('');

  const stepDenivele = (delta: number) => {
    setDenivele((current) => Math.max(-30, Math.min(30, +(current + delta).toFixed(2))));
  };

  const openEdit = (idx: number) => {
    setEdit({
      diametre: segments[idx].diametre,
      longueur: segments[idx].longueur,
      debit: segments[idx].debit,
      perte: segments[idx].perte
    });
    setEditIdx(idx);
    setError('');
    setModalVisible(true);
  };

  const handleEditSave = () => {
    if (segments.some((s, i) => i !== editIdx && s.diametre === edit.diametre && s.longueur === edit.longueur && s.debit === edit.debit)) {
      setError('Doublon interdit');
      return;
    }
    if (edit.longueur < 1 || edit.debit < 1 || edit.diametre < 1) {
      setError('Valeur incorrecte');
      return;
    }
    if (editIdx !== null) {
      updateSegment(segments[editIdx].id, edit);
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Calcul établissement" icon="calculator" />

        {/* Tronçons mémorisés */}
        <Card style={styles.section}>
          <Title>Tronçons mémorisés</Title>
          {segments.length === 0 && <Caption style={{ fontStyle: 'italic' }}>Aucun tronçon mémorisé</Caption>}
          {segments.map((t, idx) => (
            <View style={[styles.savedRow, { borderBottomColor: palette.border }]} key={t.id}>
              <Body style={styles.savedDesc}>{`T${idx + 1}: Ø${t.diametre}mm - ${t.longueur}m - ${t.debit}L/min`}</Body>
              <Body style={{ fontWeight: 'bold', color: palette.primary }}>{formatNumber(t.perte)}b</Body>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(idx)} style={{ padding: 4 }}>
                  <Ionicons name="pencil" size={20} color={palette.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeSegment(t.id)} style={{ padding: 4 }}>
                  <Ionicons name="trash" size={20} color={palette.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>

        {/* Dénivelé */}
        <Card style={styles.section}>
          <Label>Dénivelé</Label>
          <View style={styles.chipRow}>
            {deniveaux.map(val => (
              <Chip
                key={val}
                label={`${val > 0 ? '+' : ''}${val}m`}
                selected={denivele === val}
                onPress={() => setDenivele(val)}
                style={{ minWidth: 60, justifyContent: 'center' }}
              />
            ))}
          </View>
          <View style={[styles.deniveleSummary, { backgroundColor: palette.surfaceVariant }]}>
            <Caption style={[styles.deniveleSummaryLabel, { color: palette.secondaryText }]}>Impact sur la pression</Caption>
            <Body style={styles.deniveleSummaryValue}>
              {formatNumber(denivele)}m ({perteDenivele >= 0 ? '+' : ''}{formatNumber(perteDenivele)} bars)
            </Body>
          </View>
          <View style={[styles.stepperShell, { backgroundColor: palette.surfaceVariant, borderColor: palette.border }]}>
            <TouchableOpacity
              onPress={() => stepDenivele(-0.5)}
              activeOpacity={0.85}
              style={[styles.stepperAction, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <Ionicons name="remove" size={18} color={palette.primary} />
            </TouchableOpacity>
            <View style={styles.stepperCenter}>
              <Caption style={[styles.stepperCaption, { color: palette.secondaryText }]}>Ajustement fin</Caption>
              <Body style={styles.stepperValue}>0,5 m</Body>
            </View>
            <TouchableOpacity
              onPress={() => stepDenivele(0.5)}
              activeOpacity={0.9}
              style={[styles.stepperAction, { backgroundColor: palette.primary, borderColor: palette.primary }]}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Pression lance */}
        <Card style={styles.section}>
          <View style={styles.headerRow}>
            <Label style={styles.inlineLabel}>Pression à la lance</Label>
            <Switch
              value={pressionActive}
              onValueChange={setPressionActive}
              trackColor={{ false: palette.border, true: palette.primaryLight }}
              thumbColor={theme === 'dark' ? palette.card : '#FFFFFF'}
              ios_backgroundColor={palette.border}
            />
          </View>
          <View style={styles.chipRow}>
            {customPressions.map(val => (
              <Chip
                key={val}
                label={`${val} b`}
                selected={pressionLance === val}
                onPress={() => { setPressionActive(true); setPressionLance(val); }}
                disabled={!pressionActive}
              />
            ))}
          </View>
        </Card>

        {/* Résumé */}
        <Card variant="filled" style={styles.section}>
          <Title>Résumé</Title>
          <View style={styles.resultRow}>
            <Body>Perte de charge :</Body>
            <Body style={{ fontWeight: 'bold' }}>{formatNumber(perteDeCharge)} bars</Body>
          </View>
          <View style={styles.resultRow}>
            <Body>Perte dénivelé :</Body>
            <Body style={{ fontWeight: 'bold' }}>{perteDenivele >= 0 ? '+' : ''}{formatNumber(perteDenivele)} bars</Body>
          </View>
          <View style={styles.resultRow}>
            <Body>Pression à la lance :</Body>
            <Body style={{ fontWeight: 'bold' }}>{formatNumber(pression)} bars</Body>
          </View>
          <View style={[styles.resultRow, { marginTop: 6, borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 8 }]}>
            <Title>Total :</Title>
            <Title style={{ color: palette.primary }}>{formatNumber(total)} bars</Title>
          </View>
        </Card>

        {/* Modal Edition */}
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalContent}>
              <Title>Modifier le tronçon</Title>
              {error ? <Caption style={{ color: palette.primary, marginBottom: 10 }}>{error}</Caption> : null}

              <Input
                label="Diamètre (mm)"
                value={edit.diametre.toString()}
                onChangeText={t => setEdit({ ...edit, diametre: parseInt(t) || 0 })}
                keyboardType="numeric"
              />
              <Input
                label="Longueur (m)"
                value={edit.longueur.toString()}
                onChangeText={t => setEdit({ ...edit, longueur: parseInt(t) || 0 })}
                keyboardType="numeric"
              />
              <Input
                label="Débit (L/min)"
                value={edit.debit.toString()}
                onChangeText={t => setEdit({ ...edit, debit: parseInt(t) || 0 })}
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <Button title="Annuler" onPress={() => setModalVisible(false)} variant="ghost" />
                <Button title="Enregistrer" onPress={handleEditSave} />
              </View>
            </Card>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 24, gap: 10 },
  section: { gap: 10, marginVertical: 0, padding: 14 },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  savedDesc: { flex: 1, marginRight: 8 },
  actions: { flexDirection: 'row', gap: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  deniveleSummary: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 2,
  },
  deniveleSummaryLabel: {
    marginBottom: 0,
    fontWeight: '600',
  },
  deniveleSummaryValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  stepperShell: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperAction: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  stepperCaption: {
    marginBottom: 0,
    fontWeight: '600',
  },
  stepperValue: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
  },
  inlineLabel: {
    marginBottom: 0,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { gap: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
});
