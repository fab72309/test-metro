import React, { useImperativeHandle, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors } from '@/constants/Colors';
import PuissanceApproach from './GrandFeux/PuissanceApproach';
import SurfaceApproach from './GrandFeux/SurfaceApproach';
import FHLIApproach from './GrandFeux/FHLIApproach';
import { useGrandFeuxCalculation } from '@/hooks/useGrandFeuxCalculation';

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


  const styles = useMemo(() => StyleSheet.create({
    resultBlock: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 18,
      marginTop: 22,
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: '#f1f1f1',
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
    },
    resultHeader: {
      color: Colors.light.primary,
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 10,
      letterSpacing: 0.2,
    },
    resultLine: {
      fontSize: 17,
      color: '#222',
      fontWeight: 'bold',
      marginBottom: 2,
    },
    resultLabel: {
      color: Colors.light.primary,
      fontWeight: 'bold',
      fontSize: 17,
    },
    resultDetail: {
      fontSize: 15,
      color: '#666',
      fontStyle: 'italic',
      marginTop: 4,
      marginBottom: 2,
    },
    warningBox: {
      backgroundColor: '#ffeaea',
      borderRadius: 8,
      padding: 8,
      marginTop: 10,
      borderWidth: 1,
      borderColor: Colors.light.primary,
    },
    warningText: {
      color: Colors.light.primary,
      fontWeight: 'bold',
      fontSize: 15,
      textAlign: 'left',
    },
    container: { flexGrow: 1, backgroundColor: '#f8fafc', paddingBottom: 30 },
    card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, margin: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    title: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginVertical: 8, color: Colors.light.primary },
    tabContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 6 },
    tab: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 16, marginHorizontal: 4, backgroundColor: '#e5e7eb', borderRadius: 20 },
    tabActive: { backgroundColor: Colors.light.primary },
    tabText: { color: '#111', fontWeight: '500' },
    tabTextActive: { color: '#fff', fontWeight: '500' },
    strategieTitle: { fontWeight: 'bold', color: '#111', fontSize: 16, marginTop: 10, marginBottom: 6 },
    label: { fontWeight: 'bold', color: Colors.light.primary, marginBottom: 4, fontSize: 15 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10, marginBottom: 8, backgroundColor: '#fff', fontSize: 13, fontWeight: '500' },
    selectRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    button: { backgroundColor: '#e5e7eb', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginHorizontal: 4 },
    selectedButton: { backgroundColor: Colors.light.primary },
    buttonText: { color: '#111', fontWeight: '500' }, buttonTextSelected: { color: '#fff', fontWeight: '500' },
    combustibleSliderBox: { marginTop: 14, marginBottom: 10, alignItems: 'center', width: '100%', maxWidth: 400, alignSelf: 'center' },
    combustibleValue: { color: Colors.light.primary, fontWeight: 'bold', fontSize: 20, marginVertical: 2 },
    combustibleSliderLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 2 },
    combustibleSliderLabelTouch: { flex: 1, alignItems: 'center', justifyContent: 'center', minWidth: 60 },
    combustibleSliderLabel: { color: Colors.light.primary, fontSize: 15, textAlign: 'center' },
    combustibleSliderLabelActive: { fontWeight: 'bold', textDecorationLine: 'underline' },
    resultBox: { marginTop: 20, backgroundColor: '#f1f5f9', borderRadius: 10, padding: 16, alignItems: 'center' },
    resultText: { fontSize: 16, color: '#334155' }, resultTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 6 }
  }), []);

  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* Titre */}
            {!hideTitle && (
              <Text style={styles.title} numberOfLines={1}>Dimensionnement des moyens hydrauliques</Text>
            )}
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tab, mode === 'combustible' && styles.tabActive]} onPress={() => setMode('combustible')}>
                <MaterialCommunityIcons name="fire" size={16} color={mode === 'combustible' ? '#fff' : '#111'} style={{ marginRight: 4 }} />
                <Text style={[styles.tabText, mode === 'combustible' && styles.tabTextActive]}>Puissance</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, mode === 'surface' && styles.tabActive]} onPress={() => setMode('surface')}>
                <MaterialCommunityIcons name="vector-square" size={16} color={mode === 'surface' ? '#fff' : '#111'} style={{ marginRight: 4 }} />
                <Text style={[styles.tabText, mode === 'surface' && styles.tabTextActive]}>Surface</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, mode === 'fhli' && styles.tabActive]} onPress={() => setMode('fhli')}>
                <MaterialCommunityIcons name="gas-station" size={16} color={mode === 'fhli' ? '#fff' : '#111'} style={{ marginRight: 4 }} />
                <Text style={[styles.tabText, mode === 'fhli' && styles.tabTextActive]}>FHLI</Text>
              </TouchableOpacity>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

export default React.memo(
  React.forwardRef<GrandFeuxCalculatorHandle, { hideTitle?: boolean }>(GrandFeuxCalculator)
);

