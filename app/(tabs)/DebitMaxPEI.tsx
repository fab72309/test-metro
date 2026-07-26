import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import {
  evaluatePeiCapacity,
  type PeiCapacityResult,
} from '@/constants/calculPei';
import { useThemeContext } from '@/context/ThemeContext';
import { formatNumber } from '@/utils/format';

function parseFrenchNumber(value: string) {
  return Number(value.trim().replace(',', '.'));
}

export default function DebitMaxPEI() {
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const [measuredFlow, setMeasuredFlow] = useState('');
  const [requiredFlow, setRequiredFlow] = useState('');
  const [result, setResult] = useState<PeiCapacityResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    try {
      const next = evaluatePeiCapacity(
        parseFrenchNumber(measuredFlow),
        parseFrenchNumber(requiredFlow)
      );
      setResult(next);
      setError('');
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : 'Valeurs invalides.');
    }
  };

  const statusColor =
    result?.status === 'sufficient' ? palette.success : palette.error;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader title="Capacité du PEI" icon="water" />

        <Card variant="outlined" style={styles.doctrineCard}>
          <View style={styles.inline}>
            <Ionicons name="shield-checkmark-outline" size={22} color={palette.primary} />
            <Label style={{ color: palette.primary, marginBottom: 0 }}>
              Méthode conforme au RDDECI des Yvelines
            </Label>
          </View>
          <Body>
            La capacité est appréciée à partir du débit réellement mesuré sous une
            pression dynamique de 1 bar. L’application n’extrapole plus un débit
            maximal théorique depuis les pressions statique et résiduelle.
          </Body>
          <Button
            title="Consulter les références"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/doctrine' as never)}
          />
        </Card>

        <Card style={styles.card}>
          <Input
            label="Débit mesuré à 1 bar (L/min)"
            helperText="Valeur issue du contrôle ou de la fiche du PEI."
            placeholder="Ex. 1200"
            value={measuredFlow}
            onChangeText={setMeasuredFlow}
            keyboardType="numeric"
            leftIcon={<Ionicons name="speedometer" size={20} color={palette.primary} />}
          />
          <Input
            label="Débit nécessaire pour l’opération (L/min)"
            helperText="Besoin opérationnel déterminé par le dimensionnement retenu."
            placeholder="Ex. 1000"
            value={requiredFlow}
            onChangeText={setRequiredFlow}
            keyboardType="numeric"
            leftIcon={<Ionicons name="water" size={20} color={palette.link} />}
          />
          {error ? <Caption style={{ color: palette.error }}>{error}</Caption> : null}
          <Button title="Évaluer la capacité" onPress={handleCalculate} />
        </Card>

        {result ? (
          <Card variant="filled" style={[styles.card, { borderLeftColor: statusColor }]}>
            <Title style={{ color: statusColor }}>
              {result.status === 'sufficient' ? 'Capacité suffisante' : 'Capacité insuffisante'}
            </Title>
            <View style={styles.resultRow}>
              <Body>Débit mesuré :</Body>
              <Label>{formatNumber(result.measuredAtOneBarLpm)} L/min</Label>
            </View>
            <View style={styles.resultRow}>
              <Body>Besoin retenu :</Body>
              <Label>{formatNumber(result.requiredFlowLpm)} L/min</Label>
            </View>
            <View style={styles.resultRow}>
              <Body>{result.marginLpm >= 0 ? 'Marge :' : 'Déficit :'}</Body>
              <Label style={{ color: statusColor }}>
                {formatNumber(Math.abs(result.marginLpm))} L/min
              </Label>
            </View>
            <View style={styles.resultRow}>
              <Body>Couverture du besoin :</Body>
              <Label>{formatNumber(result.coveragePercent)} %</Label>
            </View>
            <Caption>
              Mesure : {formatNumber(result.measuredAtOneBarM3h)} m³/h · Besoin :{' '}
              {formatNumber(result.requiredFlowM3h)} m³/h
            </Caption>
          </Card>
        ) : null}

        <Caption>
          Aide au dimensionnement uniquement : les données du PEI, les prescriptions
          du règlement départemental et la reconnaissance opérationnelle restent
          prioritaires.
        </Caption>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 16, borderLeftWidth: 4 },
  doctrineCard: { marginBottom: 16, gap: 10 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 5,
  },
});
