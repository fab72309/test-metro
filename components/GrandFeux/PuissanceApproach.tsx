import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import PropagationButtons from '../GrandFeuxCalculator_buttons_propagation';

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
      <Text style={styles.title}>Approche Puissance</Text>
      {/* Strategy Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, strategie === 'offensive' && styles.selectedTab]} onPress={() => setStrategie('offensive')}>
          <Text style={[styles.tabText, strategie === 'offensive' && styles.selectedTabText]}>Attaque offensive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, strategie === 'propagation' && styles.selectedTab]} onPress={() => setStrategie('propagation')}>
          <Text style={[styles.tabText, strategie === 'propagation' && styles.selectedTabText]}>Lutte propagation</Text>
        </TouchableOpacity>
      </View>
      {strategie === 'offensive' && (
        <View style={{ marginVertical: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Puissance par m3 de combustible (MW/m3)</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#D32F2F' }}>{combustible.toFixed(2)}</Text>
          <Slider
            minimumValue={1}
            maximumValue={2.7}
            step={0.01}
            value={combustible}
            onValueChange={setCombustible}
            minimumTrackTintColor="#D32F2F"
            maximumTrackTintColor="#eee"
            thumbTintColor="#D32F2F"
          />
          <View style={styles.sliderLabels}>
            {[1, 2, 2.7].map(val => (
              <TouchableOpacity key={val} onPress={() => setCombustible(val)}>
                <Text style={[styles.sliderLabel, combustible === val && styles.sliderLabelActive]}> {val} </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Surface (m²)</Text>
          <TextInput style={styles.input} value={surface} onChangeText={setSurface} keyboardType="numeric" placeholder="m²" />
          <Text style={{ fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Hauteur (m)</Text>
          <TextInput style={styles.input} value={hauteur} onChangeText={setHauteur} keyboardType="numeric" placeholder="m" />
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Volume en feu (%)</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#D32F2F' }}>{fraction}%</Text>
          <Slider minimumValue={0} maximumValue={100} step={1} value={fraction} onValueChange={setFraction} minimumTrackTintColor="#D32F2F" maximumTrackTintColor="#eee" thumbTintColor="#D32F2F" />
          <View style={styles.sliderLabelsFraction}>
            {[0, 25, 50, 75, 100].map(val => (
              <TouchableOpacity key={val} onPress={() => setFraction(val)}>
                <Text style={[styles.sliderLabelFraction, fraction === val && styles.sliderLabelFractionActive]}> {val}% </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Rendement des lances</Text>
          <View style={styles.effButtons}>
            {[20, 50].map(val => (
              <TouchableOpacity key={val} style={[styles.effButton, rendement * 100 === val && styles.effButtonActive]} onPress={() => setRendement(val / 100)}>
                <Text style={[styles.effButtonText, rendement * 100 === val && styles.effButtonTextActive]}> {val}% </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ alignItems: 'center', marginTop: 14 }}>
            <PropagationButtons onReset={resetAll} onCalculate={handleCalculate} />
          </View>
          {resultOffensive && (
            <View style={styles.resultBlock}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultTitle, styles.fireRedCenter]}>Résultat</Text>
                <TouchableOpacity onPress={() => Alert.alert('Comment ce débit est-il calculé ?', infoText)} style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>i</Text>
                </TouchableOpacity>
              </View>
              {resultPmax && <Text style={styles.resultSubtitle}><Text style={{ fontWeight: 'bold' }}>Puissance max estimée : </Text>{resultPmax} MW</Text>}
              {resultFlowLmin && resultFlowM3h && (
                <Text style={styles.resultSubtitle}><Text style={{ fontWeight: 'bold' }}>Débit requis : </Text>{resultFlowLmin} L/min ({resultFlowM3h} m³/h)</Text>
              )}
              <TouchableOpacity onPress={() => setShowDetailsOffensive(!showDetailsOffensive)}>
                <Text style={styles.detailsToggle}>{showDetailsOffensive ? 'Masquer détails' : 'Voir détails'}</Text>
              </TouchableOpacity>
              {showDetailsOffensive && calcDetailsOffensive && (
                <Text style={styles.resultDetail}>{calcDetailsOffensive}</Text>
              )}
            </View>
          )}
        </View>
      )}
      {strategie === 'propagation' && (
        <View style={{ marginVertical: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Surface verticale à protéger (m²)</Text>
          <TextInput style={styles.input} value={surfaceVertical} onChangeText={setSurfaceVertical} keyboardType="numeric" placeholder="m²" />
          <Text style={{ fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Taux d'application (L/min/m²)</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#D32F2F' }}>{tauxApplication} L/min/m²</Text>
          <Slider minimumValue={1} maximumValue={20} step={1} value={tauxApplication} onValueChange={setTauxApplication} minimumTrackTintColor="#D32F2F" maximumTrackTintColor="#eee" thumbTintColor="#D32F2F" />
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <PropagationButtons onReset={resetAll} onCalculate={handleCalculate} />
          </View>
          {resultPropLmin && (
            <View style={styles.resultBlock}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultTitle, styles.fireRedCenter]}>Résultat</Text>
                <TouchableOpacity onPress={() => Alert.alert('Détails propagation', infoTextPropagation)} style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>i</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.resultSubtitle}><Text style={{ fontWeight: 'bold' }}>Débit requis : </Text>{resultPropLmin} L/min ({resultPropM3h} m³/h)</Text>
              <TouchableOpacity onPress={() => setShowDetailsPropagation(!showDetailsPropagation)}>
                <Text style={styles.detailsToggle}>{showDetailsPropagation ? 'Masquer détails' : 'Voir détails'}</Text>
              </TouchableOpacity>
              {showDetailsPropagation && calcDetailsPropagation && (
                <Text style={styles.resultDetail}>{calcDetailsPropagation.replace(/\nSoit [^\n]+ m³\/h/, '')}</Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default React.memo(PuissanceApproach);

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, padding: 10 },
  resultBlock: { backgroundColor: '#f1f1f1', padding: 16, borderRadius: 8, marginTop: 16 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  resultHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  infoIconContainer: { marginLeft: 4, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2 },
  infoIcon: { fontStyle: 'italic', color: '#888', fontSize: 12 },
  resultText: { fontSize: 24, fontWeight: 'bold', color: '#D32F2F' },
  resultDetail: { fontSize: 14, color: '#666' },
  tabRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#f1f1f1', borderRadius: 8, marginRight: 8 },
  selectedTab: { backgroundColor: '#D32F2F' },
  tabText: { color: '#333' },
  selectedTabText: { color: '#fff', fontWeight: 'bold' },
  button: { padding: 10, borderRadius: 8, backgroundColor: '#f1f1f1' },
  buttonPrimary: { backgroundColor: '#D32F2F' },
  buttonText: { fontWeight: 'bold', color: '#333' },
  buttonPrimaryText: { color: '#fff' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderLabel: { color: '#888', fontSize: 14 },
  sliderLabelActive: { color: '#D32F2F', fontWeight: 'bold' },
  sliderLabelsFraction: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderLabelFraction: { color: '#888', fontSize: 14 },
  sliderLabelFractionActive: { color: '#D32F2F', fontWeight: 'bold' },
  fireRedCenter: { color: '#D32F2F', textAlign: 'center' },
  resultSubtitle: { fontSize: 16, marginVertical: 4, color: '#111' },
  detailsToggle: { color: '#D32F2F', textAlign: 'center', marginVertical: 8, fontWeight: 'bold' },
  effButtons: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  effButton: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D32F2F' },
  effButtonActive: { backgroundColor: '#D32F2F' },
  effButtonText: { color: '#D32F2F', fontWeight: 'bold' },
  effButtonTextActive: { color: '#fff' },
});
