import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import PropagationButtons from '../GrandFeuxCalculator_buttons_propagation';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Title, Body, Caption, Label } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SurfaceApproachProps {
  surface: string;
  setSurface: (s: string) => void;
  taux: number;
  setTaux: (n: number) => void;
  resultLmin: string | null;
  resultM3h: string | null;
  handleCalculate: () => void;
  resetAll: () => void;
}

function SurfaceApproach({
  surface, setSurface,
  taux, setTaux,
  resultLmin, resultM3h,
  handleCalculate, resetAll
}: SurfaceApproachProps) {
  const [showDetails, setShowDetails] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  // Info text pour SurfaceApproach
  const infoTextSurface = `Comment est calculé le débit requis ?
Le débit total (Q) en L/min est obtenu par :
Q = Surface en feu (m²) x Taux d'application (L/min/m²).
Ex. Pour 500 m² à 3 L/min/m² → 500×3=1,500 L/min (1,50 m³/h).

Ajustez-le selon le type de combustible et la doctrine locale.`;

  const details = resultLmin ? `${surface} m² × ${taux} L/min/m² = ${resultLmin} L/min` : null;

  return (
    <View style={styles.container}>
      <Title>Approche Surface</Title>

      <Input
        label="Surface (m²)"
        value={surface}
        onChangeText={setSurface}
        keyboardType="numeric"
        placeholder="Ex: 500"
      />

      <Label style={{ marginTop: 12 }}>Taux d'application (L/min/m²)</Label>
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.primary, marginBottom: 8 }}>{taux} L/min/m²</Text>
      <Slider
        minimumValue={1}
        maximumValue={20}
        step={1}
        value={taux}
        onValueChange={setTaux}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        style={{ marginBottom: 16 }}
      />

      <View style={{ alignItems: 'center', marginTop: 14 }}>
        <PropagationButtons onReset={resetAll} onCalculate={handleCalculate} />
      </View>

      {resultLmin && (
        <Card variant="filled" style={styles.resultBlock}>
          <View style={styles.resultHeader}>
            <Title style={{ color: colors.primary, marginBottom: 0, marginRight: 8 }}>Résultat</Title>
            <TouchableOpacity onPress={() => Alert.alert('Comment est calculé le débit requis ?', infoTextSurface)} style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>i</Text>
            </TouchableOpacity>
          </View>

          <Body style={{ fontSize: 16, marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Débit requis : </Text>{resultLmin} L/min ({resultM3h} m³/h)
          </Body>

          <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
            <Text style={[styles.detailsToggle, { color: colors.primary }]}>{showDetails ? 'Masquer détails' : 'Voir détails'}</Text>
          </TouchableOpacity>

          {showDetails && details && <Caption style={{ marginTop: 8, fontStyle: 'italic' }}>{details}</Caption>}
        </Card>
      )}
    </View>
  );
}

export default React.memo(SurfaceApproach);

const styles = StyleSheet.create({
  container: { padding: 4 },
  resultBlock: { marginTop: 24, padding: 16 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoIconContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  infoIcon: { fontStyle: 'italic', color: '#888', fontSize: 12 },
  detailsToggle: { textAlign: 'left', marginVertical: 8, fontWeight: 'bold' },
});

