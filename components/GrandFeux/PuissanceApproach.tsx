import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import PropagationButtons from '../GrandFeuxCalculator_buttons_propagation';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { Title, Subtitle, Label, Body, Caption } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { formatNumber } from '@/utils/format';
import { useColorScheme } from '@/hooks/useColorScheme';

interface PuissanceApproachProps {
  strategie: 'offensive' | 'propagation';
  setStrategie: (s: 'offensive' | 'propagation') => void;
  surface: string;
  setSurface: (s: string) => void;
  hauteur: string;
  setHauteur: (s: string) => void;
  fraction: number;
  setFraction: (n: number) => void;
  combustible: number;
  setCombustible: (n: number) => void;
  rendement: number;
  setRendement: (n: number) => void;
  surfaceVertical: string;
  setSurfaceVertical: (s: string) => void;
  tauxApplication: number;
  setTauxApplication: (n: number) => void;
  resultOffensive: string | null;
  calcDetailsOffensive: string | null;
  resultPmax: string | null;
  resultFlowLmin: string | null;
  resultFlowM3h: string | null;
  resultPropagation: string | null;
  calcDetailsPropagation: string | null;
  resultPropLmin: string | null;
  resultPropM3h: string | null;
  handleCalculate: () => void;
  resetAll: () => void;
}

function PuissanceApproach({
  strategie, setStrategie,
  surface, setSurface,
  hauteur, setHauteur,
  fraction, setFraction,
  combustible, setCombustible,
  rendement, setRendement,
  surfaceVertical, setSurfaceVertical,
  tauxApplication, setTauxApplication,
  resultOffensive, calcDetailsOffensive,
  resultPmax, resultFlowLmin, resultFlowM3h,
  resultPropagation, calcDetailsPropagation,
  resultPropLmin, resultPropM3h,
  handleCalculate, resetAll
}: PuissanceApproachProps) {
  const [showDetailsOffensive, setShowDetailsOffensive] = useState(false);
  const [showDetailsPropagation, setShowDetailsPropagation] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  // Texte pour l'info bulle
  const infoText = `Comment ce débit est-il calculé ?
1. On estime la puissance P du feu (en MW) par :
P_max = S(m²) × H(m) × P/m3 de combustible (MW/m³) × (%volume en feu /100).
où P₍vol₎ vaut 1 MW/m³ pour le bois, 2 MW/m³ pour un stockage mixte, 2,7 MW/m³ pour du plastique.

2. On déduit le débit d’eau Q (en L/min) nécessaire pour absorber cette puissance, en tenant compte du rendement des lances :
Q = P_max × 42,5 (pour 50 % de rendement des lances)
Q = P_max × 106 (pour 20 % de rendement des lances)

3. Pour obtenir Q en m³/h, on multiplie par 0,06 :
Q(m³/h) = Q (L/min) × 0,06

Si Q dépasse 12 000 L/min (720 m³/h), la limite réglementaire ou opérationnelle est atteinte.`;

  // Texte info pour propagation
  const infoTextPropagation = `• Calcul du débit total :
Q = Surface à protéger (m²) x Taux d'application (L/min/m²).
Ex. 120 m² × 6 L/min/m² = 720 L/min (43,2 m³/h).

• Ajustement du taux
• 1–3 L/min/m² pour des risques légers ou très ventilés.
• 10–20 L/min/m² pour des parois très exposées ou proches de liquides inflammables.
• Sélectionnez un taux adapté à votre situation opérationnelle.

• Objectif
Gagner du temps pour :
1. Stabiliser la façade / le mur coupe-feu,
2. Prévenir la propagation vers d’autres cellules ou bâtiments,
3. Attendre le renfort ou l’arrivée de moyens d’attaque offensifs.`;

  return (
    <View style={styles.container}>
      <Title>Approche Puissance</Title>

      {/* Strategy Tabs */}
      <View style={styles.tabRow}>
        <Chip
          label="Attaque offensive"
          selected={strategie === 'offensive'}
          onPress={() => setStrategie('offensive')}
        />
        <Chip
          label="Lutte propagation"
          selected={strategie === 'propagation'}
          onPress={() => setStrategie('propagation')}
        />
      </View>

      {strategie === 'offensive' && (
        <View style={{ marginVertical: 16 }}>
          <Label>Puissance par m3 de combustible (MW/m3)</Label>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.primary, marginBottom: 8 }}>{formatNumber(combustible)}</Text>
          <Slider
            minimumValue={1}
            maximumValue={2.7}
            step={0.01}
            value={combustible}
            onValueChange={setCombustible}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.sliderLabels}>
            {[1, 2, 2.7].map(val => (
              <TouchableOpacity key={val} onPress={() => setCombustible(val)}>
                <Caption style={[combustible === val && { color: colors.primary, fontWeight: 'bold' }]}> {val} </Caption>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Surface (m²)"
            value={surface}
            onChangeText={setSurface}
            keyboardType="numeric"
            placeholder="Ex: 500"
            containerStyle={{ marginTop: 16 }}
          />

          <Input
            label="Hauteur (m)"
            value={hauteur}
            onChangeText={setHauteur}
            keyboardType="numeric"
            placeholder="Ex: 10"
          />

          <Label style={{ marginTop: 12 }}>Volume en feu (%)</Label>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.primary, marginBottom: 8 }}>{fraction}%</Text>
          <Slider
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={fraction}
            onValueChange={setFraction}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.sliderLabelsFraction}>
            {[0, 25, 50, 75, 100].map(val => (
              <TouchableOpacity key={val} onPress={() => setFraction(val)}>
                <Caption style={[fraction === val && { color: colors.primary, fontWeight: 'bold' }]}> {val}% </Caption>
              </TouchableOpacity>
            ))}
          </View>

          <Label style={{ marginTop: 16, marginBottom: 8 }}>Rendement des lances</Label>
          <View style={styles.effButtons}>
            {[20, 50].map(val => (
              <Chip
                key={val}
                label={`${val}%`}
                selected={rendement * 100 === val}
                onPress={() => setRendement(val / 100)}
              />
            ))}
          </View>

          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <PropagationButtons onReset={resetAll} onCalculate={handleCalculate} />
          </View>

          {resultOffensive && (
            <Card variant="filled" style={styles.resultBlock}>
              <View style={styles.resultHeader}>
                <Title style={{ color: colors.primary, marginBottom: 0, marginRight: 8 }}>Résultat</Title>
                <TouchableOpacity onPress={() => Alert.alert('Comment ce débit est-il calculé ?', infoText)} style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>i</Text>
                </TouchableOpacity>
              </View>

              {resultPmax && (
                <Body style={{ fontSize: 16, marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>Puissance max estimée : </Text>{formatNumber(resultPmax)} MW
                </Body>
              )}

              {resultFlowLmin && resultFlowM3h && (
                <Body style={{ fontSize: 16, marginBottom: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>Débit requis : </Text>{formatNumber(resultFlowLmin)} L/min ({formatNumber(resultFlowM3h)} m³/h)
                </Body>
              )}

              <TouchableOpacity onPress={() => setShowDetailsOffensive(!showDetailsOffensive)}>
                <Text style={[styles.detailsToggle, { color: colors.primary }]}>{showDetailsOffensive ? 'Masquer détails' : 'Voir détails'}</Text>
              </TouchableOpacity>

              {showDetailsOffensive && calcDetailsOffensive && (
                <Caption style={{ marginTop: 8, fontStyle: 'italic' }}>{calcDetailsOffensive}</Caption>
              )}
            </Card>
          )}
        </View>
      )}

      {strategie === 'propagation' && (
        <View style={{ marginVertical: 16 }}>
          <Input
            label="Surface verticale à protéger (m²)"
            value={surfaceVertical}
            onChangeText={setSurfaceVertical}
            keyboardType="numeric"
            placeholder="Ex: 200"
          />

          <Label style={{ marginTop: 12 }}>Taux d'application (L/min/m²)</Label>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.primary, marginBottom: 8 }}>{tauxApplication} L/min/m²</Text>
          <Slider
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={tauxApplication}
            onValueChange={setTauxApplication}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />

          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <PropagationButtons onReset={resetAll} onCalculate={handleCalculate} />
          </View>

          {resultPropLmin && (
            <Card variant="filled" style={styles.resultBlock}>
              <View style={styles.resultHeader}>
                <Title style={{ color: colors.primary, marginBottom: 0, marginRight: 8 }}>Résultat</Title>
                <TouchableOpacity onPress={() => Alert.alert('Détails propagation', infoTextPropagation)} style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>i</Text>
                </TouchableOpacity>
              </View>

              <Body style={{ fontSize: 16, marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>Débit requis : </Text>{formatNumber(resultPropLmin)} L/min ({formatNumber(resultPropM3h)} m³/h)
              </Body>

              <TouchableOpacity onPress={() => setShowDetailsPropagation(!showDetailsPropagation)}>
                <Text style={[styles.detailsToggle, { color: colors.primary }]}>{showDetailsPropagation ? 'Masquer détails' : 'Voir détails'}</Text>
              </TouchableOpacity>

              {showDetailsPropagation && calcDetailsPropagation && (
                <Caption style={{ marginTop: 8, fontStyle: 'italic' }}>{calcDetailsPropagation.replace(/\nSoit [^\n]+ m³\/h/, '')}</Caption>
              )}
            </Card>
          )}
        </View>
      )
      }
    </View >
  );
}

export default React.memo(PuissanceApproach);

const styles = StyleSheet.create({
  container: { padding: 4 },
  resultBlock: { marginTop: 24, padding: 16 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoIconContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  infoIcon: { fontStyle: 'italic', color: '#888', fontSize: 12 },
  tabRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 12, flexWrap: 'wrap' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderLabelsFraction: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  detailsToggle: { textAlign: 'left', marginVertical: 8, fontWeight: 'bold' },
  effButtons: { flexDirection: 'row', justifyContent: 'flex-start', gap: 8 },
});

