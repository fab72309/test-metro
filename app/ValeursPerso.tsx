import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme, useNavigation, useFocusEffect } from '@react-navigation/native';
import { usePertesDeChargeTable } from '../context/PertesDeChargeTableContext';
import { Ionicons } from '@expo/vector-icons';
import type { TypeTuyau, Debit } from '../constants/pertesDeChargeTable';

export default function ValeursPerso() {
  const { colors, dark } = useTheme();
  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerBackTitle: 'Retour' });
  }, [navigation]);
  const { table: values, setTable: setValues, resetTable, loading } = usePertesDeChargeTable();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pertesDeCharge: false,
    calculEtablissement: false,
    grandsFeuxAttaqueOffensive: false,
    grandsFeuxLuttePropagation: false,
    grandsFeuxSurface: false,
    grandsFeuxFHLI: false,
  });
  useFocusEffect(
    useCallback(() => {
      // Collapse all sections on screen focus
      setExpandedSections({
        pertesDeCharge: false,
        calculEtablissement: false,
        grandsFeuxAttaqueOffensive: false,
        grandsFeuxLuttePropagation: false,
        grandsFeuxSurface: false,
        grandsFeuxFHLI: false,
      });
    }, [])
  );
  const toggleSection = (key: string) => setExpandedSections((prev: any) => ({ ...prev, [key]: !prev[key] }));
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const keyboardTypeDec = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'decimal-pad';

  useEffect(() => {
    if (!loading) {
      const flat: Record<string, string> = {};
      Object.entries(values).forEach(([type, debits]) => {
        Object.entries(debits).forEach(([debit, val]) => {
          const key = `${type}-${debit}`;
          flat[key] = val === null ? '' : val.toString();
        });
      });
      setEditValues(flat);
    }
  }, [loading, values]);

  const handleChange = (diam: string, debit: string, val: string) => {
    const diameterKey = diam as TypeTuyau;
    const debitKey = parseInt(debit, 10) as Debit;
    const valNormalized = val.replace(/,/g, '.');
    const numericVal = valNormalized === '' || isNaN(Number(valNormalized)) ? null : Number(valNormalized);
    const updatedTable = {
      ...values,
      [diameterKey]: {
        ...values[diameterKey],
        [debitKey]: numericVal,
      },
    };
    setValues(updatedTable);
  };

  const resetDefaults = () => {
    resetTable();
    navigation.goBack();
    Alert.alert('Réinitialisé', 'Les valeurs par défaut ont été restaurées.');
  };

  if (loading) return <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:colors.background}}><Text style={{color:colors.text}}>Chargement...</Text></View>;

  const themedStyles = StyleSheet.create({
    headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: colors.text, alignSelf:'center' },
    headerText: { color: '#D32F2F', fontWeight: 'bold', marginBottom: 18, textAlign: 'center' },
    subtitle: { color: colors.text + '99', marginBottom: 18, textAlign:'center' },
    block: { backgroundColor: dark ? '#23272e' : '#f7f8fa', borderRadius:14, padding:16, marginBottom:18 },
    diamTitle: { fontWeight:'bold', fontSize:17, marginBottom:8, color: colors.text },
    row: { flexDirection:'row', alignItems:'center', marginBottom:10 },
    label: { width:100, color: colors.text, fontSize:15 },
    input: { backgroundColor: dark ? '#1a1d22' : '#f2f3f4', color: colors.text, borderRadius:8, padding:6, minWidth:60, textAlign:'center', fontSize:16, borderWidth:1, borderColor: dark ? '#333' : '#e0e0e0' },
    impossible: { color: colors.text + '77', fontStyle:'italic', backgroundColor: dark ? '#1a1d22' : '#f2f3f4', borderRadius:8, padding:6, minWidth:60, textAlign:'center', fontSize:16 },
    resetBtn: { backgroundColor: '#D32F2F', borderRadius:8, padding:12, marginTop:18, alignSelf:'center' },
    resetBtnTxt: { color:'#fff', fontWeight:'bold', fontSize:16, textAlign:'center' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: dark ? '#23272e' : '#f7f8fa', padding: 12, borderRadius: 8, marginTop: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F' },
  });

  return (
    <ScrollView
      style={{flex:1, backgroundColor:colors.background}}
      contentContainerStyle={{padding:16}}
      keyboardShouldPersistTaps="always"
    >
      <Text style={themedStyles.headerText}>
        Personnalisez les valeurs utilisées dans des différents calculs de l'application en fonction de votre doctrine, équipements etc.. :
      </Text>
      {/* Section Pertes de charge */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('pertesDeCharge')}>
        <Text style={themedStyles.sectionTitle}>Pertes de charge :</Text>
        <Ionicons name={expandedSections.pertesDeCharge ? 'chevron-up' : 'chevron-down'} color='#D32F2F' size={20} />
      </TouchableOpacity>
      {expandedSections.pertesDeCharge && (
        <>
        {Object.entries(values)
          .filter(([type]) => type.endsWith('x20'))
          .map(([type, debits]) => (
            <View key={type} style={themedStyles.block}>
              <Text style={themedStyles.diamTitle}>
                Diamètre {type.replace('x20','')} mm
              </Text>
              {Object.entries(debits).map(([debit, val]) => {
                const key = `${type}-${debit}`;
                return (
                  <View key={debit} style={themedStyles.row}>
                    <Text style={themedStyles.label}>{debit} L/min</Text>
                    <TextInput
                      keyboardType={keyboardTypeDec}
                      style={themedStyles.input}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={val === null ? 'Impossible' : ''}
                      placeholderTextColor={dark ? '#888' : '#aaa'}
                      value={editValues[key] ?? ''}
                      onChangeText={(text) => setEditValues(prev => ({ ...prev, [key]: text }))}
                      onBlur={() => handleChange(type, debit, editValues[key] ?? '')}
                      onSubmitEditing={() => handleChange(type, debit, editValues[key] ?? '')}
                      selectTextOnFocus={true}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </>
      )}
      {/* Section Calcul établissement */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('calculEtablissement')}>
        <Text style={themedStyles.sectionTitle}>Calcul établissement :</Text>
        <Ionicons name={expandedSections.calculEtablissement ? 'chevron-up' : 'chevron-down'} color='#D32F2F' size={20} />
      </TouchableOpacity>
      {expandedSections.calculEtablissement && <View style={{ padding: 16 }}><Text style={{ color: colors.text }}>À implémenter…</Text></View>}
      {/* Section Grands feux / Attaque offensive */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('grandsFeuxAttaqueOffensive')}>
        <Text style={themedStyles.sectionTitle}>Grands feux / Attaque offensive :</Text>
        <Ionicons name={expandedSections.grandsFeuxAttaqueOffensive ? 'chevron-up' : 'chevron-down'} color='#D32F2F' size={20} />
      </TouchableOpacity>
      {expandedSections.grandsFeuxAttaqueOffensive && <View style={{ padding: 16 }}><Text style={{ color: colors.text }}>À implémenter…</Text></View>}
      {/* Section Grands feux / Lutte propagation */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('grandsFeuxLuttePropagation')}>
        <Text style={themedStyles.sectionTitle}>Grands feux / Lutte propagation :</Text>
        <Ionicons name={expandedSections.grandsFeuxLuttePropagation ? 'chevron-up' : 'chevron-down'} color='#D32F2F' size={20} />
      </TouchableOpacity>
      {expandedSections.grandsFeuxLuttePropagation && <View style={{ padding: 16 }}><Text style={{ color: colors.text }}>À implémenter…</Text></View>}
      {/* Section Grands feux / Surface */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('grandsFeuxSurface')}>
        <Text style={themedStyles.sectionTitle}>Grands feux / Surface :</Text>
        <Ionicons name={expandedSections.grandsFeuxSurface ? 'chevron-up' : 'chevron-down'} color='#D32F2F' size={20} />
      </TouchableOpacity>
      {expandedSections.grandsFeuxSurface && <View style={{ padding: 16 }}><Text style={{ color: colors.text }}>À implémenter…</Text></View>}
      {/* Section Grands feux / FHLI */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('grandsFeuxFHLI')}>
        <Text style={themedStyles.sectionTitle}>Grands feux / FHLI :</Text>
        <Ionicons name={expandedSections.grandsFeuxFHLI ? 'chevron-up' : 'chevron-down'} color='#D32F2F' size={20} />
      </TouchableOpacity>
      {expandedSections.grandsFeuxFHLI && <View style={{ padding: 16 }}><Text style={{ color: colors.text }}>À implémenter…</Text></View>}
      <TouchableOpacity style={themedStyles.resetBtn} onPress={resetDefaults}>
        <Text style={themedStyles.resetBtnTxt}>Réinitialiser les valeurs par défaut</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
