import React, { memo, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import {
  calculateFoamRequirements,
  FOAM_APPLICATION_RATES_LPM_M2,
  type FoamApplicationMode,
  type FoamCalculationResult,
  type FoamLiquidType,
} from '@/constants/calculMousse';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { formatNumber } from '@/utils/format';

function parseFrenchNumber(value: string) {
  return Number(value.trim().replace(',', '.'));
}

function FHLIApproach() {
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const [surface, setSurface] = useState('');
  const [applicationMode, setApplicationMode] =
    useState<FoamApplicationMode>('gentle');
  const [liquidType, setLiquidType] =
    useState<FoamLiquidType>('non_water_miscible');
  const [concentration, setConcentration] = useState('3');
  const [temporizationDuration, setTemporizationDuration] = useState('0');
  const [extinctionDuration, setExtinctionDuration] = useState('20');
  const [canon4000, setCanon4000] = useState('0');
  const [canon2000, setCanon2000] = useState('0');
  const [canon1000, setCanon1000] = useState('0');
  const [result, setResult] = useState<FoamCalculationResult | null>(null);
  const [error, setError] = useState('');

  const availableFlow = useMemo(
    () =>
      Math.max(0, Math.floor(parseFrenchNumber(canon4000) || 0)) * 4000 +
      Math.max(0, Math.floor(parseFrenchNumber(canon2000) || 0)) * 2000 +
      Math.max(0, Math.floor(parseFrenchNumber(canon1000) || 0)) * 1000,
    [canon1000, canon2000, canon4000]
  );

  const applicationRate =
    FOAM_APPLICATION_RATES_LPM_M2[applicationMode][liquidType];

  const handleCalculate = () => {
    try {
      setResult(
        calculateFoamRequirements({
          surfaceM2: parseFrenchNumber(surface),
          applicationMode,
          liquidType,
          concentrationPercent: parseFrenchNumber(concentration),
          temporizationDurationMin: parseFrenchNumber(temporizationDuration),
          extinctionDurationMin: parseFrenchNumber(extinctionDuration),
          availableFlowLpm: availableFlow,
        })
      );
      setError('');
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : 'Valeurs invalides.');
    }
  };

  return (
    <View style={styles.container}>
      <Card variant="outlined" style={styles.section}>
        <View style={styles.inline}>
          <Ionicons name="shield-checkmark-outline" size={22} color={palette.primary} />
          <Label style={{ color: palette.primary, marginBottom: 0 }}>
            Périmètre doctrinal vérifié
          </Label>
        </View>
        <Body>
          Taux minimaux issus de l’annexe VI de l’arrêté ICPE applicable à une
          stratégie faisant appel aux services d’incendie et de secours.
          L’application directe est exclue de ce calcul.
        </Body>
        <Button
          title="Consulter les références et limites"
          variant="ghost"
          size="sm"
          onPress={() => router.push('/doctrine' as never)}
        />
      </Card>

      <Card style={styles.section}>
        <Title>Scénario</Title>
        <Input
          label="Surface en feu ou à couvrir (m²)"
          value={surface}
          onChangeText={setSurface}
          keyboardType="numeric"
          placeholder="Ex. 1000"
        />

        <Label>Mode d’application</Label>
        <View style={styles.chips}>
          <Chip
            label="Douce"
            selected={applicationMode === 'gentle'}
            onPress={() => setApplicationMode('gentle')}
          />
          <Chip
            label="Indirecte"
            selected={applicationMode === 'indirect'}
            onPress={() => setApplicationMode('indirect')}
          />
        </View>

        <Label>Nature du liquide</Label>
        <View style={styles.chips}>
          <Chip
            label="Non miscible à l’eau"
            selected={liquidType === 'non_water_miscible'}
            onPress={() => setLiquidType('non_water_miscible')}
          />
          <Chip
            label="Miscible à l’eau"
            selected={liquidType === 'water_miscible'}
            onPress={() => setLiquidType('water_miscible')}
          />
        </View>

        <View style={[styles.rateBox, { backgroundColor: palette.surfaceVariant }]}>
          <Body>Taux minimal retenu</Body>
          <Title style={{ color: palette.primary, marginBottom: 0 }}>
            {formatNumber(applicationRate)} L/min/m²
          </Title>
        </View>
      </Card>

      <Card style={styles.section}>
        <Title>Durées et émulseur</Title>
        <Input
          label="Concentration d’émulseur (%)"
          helperText="À renseigner selon la fiche technique de l’émulseur retenu."
          value={concentration}
          onChangeText={setConcentration}
          keyboardType="numeric"
        />
        <Input
          label="Durée de temporisation (min)"
          helperText="0 si aucune phase de temporisation n’est dimensionnée."
          value={temporizationDuration}
          onChangeText={setTemporizationDuration}
          keyboardType="numeric"
        />
        <Input
          label="Durée d’extinction (min)"
          helperText="20 min par défaut. Vérifier le cas particulier du scénario et du dispositif."
          value={extinctionDuration}
          onChangeText={setExtinctionDuration}
          keyboardType="numeric"
        />
        <Caption>
          Pendant la temporisation, le débit retenu est égal à la moitié du taux
          d’application d’extinction.
        </Caption>
      </Card>

      <Card style={styles.section}>
        <Title>Moyens disponibles</Title>
        <View style={styles.canonGrid}>
          <Input
            label="Canons 4 000 L/min"
            value={canon4000}
            onChangeText={setCanon4000}
            keyboardType="numeric"
            containerStyle={styles.canonInput}
          />
          <Input
            label="Canons 2 000 L/min"
            value={canon2000}
            onChangeText={setCanon2000}
            keyboardType="numeric"
            containerStyle={styles.canonInput}
          />
          <Input
            label="Canons 1 000 L/min"
            value={canon1000}
            onChangeText={setCanon1000}
            keyboardType="numeric"
            containerStyle={styles.canonInput}
          />
        </View>
        <Body>Débit disponible : {formatNumber(availableFlow)} L/min</Body>
        {error ? <Caption style={{ color: palette.error }}>{error}</Caption> : null}
        <Button title="Calculer les besoins" onPress={handleCalculate} />
      </Card>

      {result ? (
        <Card
          variant="filled"
          style={[
            styles.section,
            {
              borderLeftColor:
                result.flowMarginLpm >= 0 ? palette.success : palette.warning,
            },
          ]}
        >
          <Title>Résultats</Title>
          <View style={styles.resultRow}>
            <Body>Débit d’extinction :</Body>
            <Label>{formatNumber(result.extinctionFlowLpm)} L/min</Label>
          </View>
          <View style={styles.resultRow}>
            <Body>Débit de temporisation :</Body>
            <Label>{formatNumber(result.temporizationFlowLpm)} L/min</Label>
          </View>
          <View style={styles.resultRow}>
            <Body>Solution moussante :</Body>
            <Label>{formatNumber(result.requiredSolutionVolumeL / 1000)} m³</Label>
          </View>
          <View style={styles.resultRow}>
            <Body>Eau :</Body>
            <Label>{formatNumber(result.requiredWaterVolumeL / 1000)} m³</Label>
          </View>
          <View style={styles.resultRow}>
            <Body>Émulseur :</Body>
            <Label>{formatNumber(result.requiredConcentrateVolumeL)} L</Label>
          </View>
          <View style={styles.resultRow}>
            <Body>{result.flowMarginLpm >= 0 ? 'Marge des moyens :' : 'Déficit des moyens :'}</Body>
            <Label
              style={{
                color: result.flowMarginLpm >= 0 ? palette.success : palette.warning,
              }}
            >
              {formatNumber(Math.abs(result.flowMarginLpm))} L/min
            </Label>
          </View>
          {result.availableFlowLpm === 0 ? (
            <Caption>
              Aucun moyen n’a été renseigné : le débit nécessaire reste calculé,
              sans évaluation de capacité.
            </Caption>
          ) : null}
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  section: { gap: 10, borderLeftWidth: 4 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  rateBox: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  canonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  canonInput: { flex: 1, minWidth: 150 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 5,
  },
});

export default memo(FHLIApproach);
