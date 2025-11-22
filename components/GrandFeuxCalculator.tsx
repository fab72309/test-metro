import React, { useImperativeHandle, useMemo } from 'react';
import { View, StyleSheet, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useGrandFeuxCalculation } from '@/hooks/useGrandFeuxCalculation';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Title } from '@/components/ui/Typography';
import PuissanceApproach from './GrandFeux/PuissanceApproach';
import SurfaceApproach from './GrandFeux/SurfaceApproach';
import FHLIApproach from './GrandFeux/FHLIApproach';

export interface GrandFeuxCalculatorHandle {
  forceDefaultMode: () => void;
}

function GrandFeuxCalculator({ hideTitle = false }: { hideTitle?: boolean }, ref: any) {

  const {
    mode, setMode,
    strategie, setStrategie,
    surface, setSurface,
    hauteur, setHauteur,
    fraction, setFraction,
    combustible, setCombustible,
    rendement, setRendement,
    surfaceVertical, setSurfaceVertical,
    tauxApplication, setTauxApplication,
    surfaceApprocheSurface, setSurfaceApprocheSurface,
    resultOffensive,
    calcDetailsOffensive,
    resultPropagation,
    calcDetailsPropagation,
    handleCalculate,
    resetAll,
    resultPmax,
    resultFlowLmin,
    resultFlowM3h,
    resultPropLmin,
    resultPropM3h,
    resultSurfaceLmin,
    resultSurfaceM3h,
  } = useGrandFeuxCalculation();

  // Permet au parent de forcer le mode et la stratégie
  useImperativeHandle(ref, () => ({
    forceDefaultMode: () => {
      setMode('combustible');
      setStrategie('offensive');
    }
  }), [setMode, setStrategie]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          {/* Titre */}
          {!hideTitle && (
            <Title style={{ textAlign: 'center' }}>Dimensionnement des moyens hydrauliques</Title>
          )}

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <Chip
              label="Puissance"
              icon="fire"
              selected={mode === 'combustible'}
              onPress={() => setMode('combustible')}
            />
            <Chip
              label="Surface"
              icon="vector-square"
              selected={mode === 'surface'}
              onPress={() => setMode('surface')}
            />
            <Chip
              label="FHLI"
              icon="gas-station"
              selected={mode === 'fhli'}
              onPress={() => setMode('fhli')}
            />
          </View>

          <View>
            {/* Combustible */}
            {mode === 'combustible' && (
              <PuissanceApproach
                strategie={strategie}
                setStrategie={setStrategie}
                surface={surface}
                setSurface={setSurface}
                hauteur={hauteur}
                setHauteur={setHauteur}
                fraction={fraction}
                setFraction={setFraction}
                combustible={combustible}
                setCombustible={setCombustible}
                rendement={rendement}
                setRendement={setRendement}
                surfaceVertical={surfaceVertical}
                setSurfaceVertical={setSurfaceVertical}
                tauxApplication={tauxApplication}
                setTauxApplication={setTauxApplication}
                resultOffensive={resultOffensive}
                calcDetailsOffensive={calcDetailsOffensive}
                resultPmax={resultPmax}
                resultFlowLmin={resultFlowLmin}
                resultFlowM3h={resultFlowM3h}
                resultPropagation={resultPropagation}
                calcDetailsPropagation={calcDetailsPropagation}
                resultPropLmin={resultPropLmin}
                resultPropM3h={resultPropM3h}
                handleCalculate={handleCalculate}
                resetAll={resetAll}
              />
            )}

            {/* Surface */}
            {mode === 'surface' && (
              <SurfaceApproach
                surface={surfaceApprocheSurface}
                setSurface={setSurfaceApprocheSurface}
                taux={tauxApplication}
                setTaux={setTauxApplication}
                resultLmin={resultSurfaceLmin}
                resultM3h={resultSurfaceM3h}
                handleCalculate={handleCalculate}
                resetAll={resetAll}
              />
            )}

            {/* FHLI */}
            {mode === 'fhli' && <FHLIApproach />}
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default React.memo(
  React.forwardRef<GrandFeuxCalculatorHandle, { hideTitle?: boolean }>(GrandFeuxCalculator)
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 30, paddingHorizontal: 10 },
  card: { padding: 16, marginTop: 10 },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginVertical: 12 },
});


