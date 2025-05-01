import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { usePertesDeChargeTable } from '../context/PertesDeChargeTableContext';
import type { TypeTuyau, Debit } from '../constants/pertesDeChargeTable';

export default function ValeursPerso() {
  const { colors, dark } = useTheme();
  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerBackTitle: 'Retour' });
  }, [navigation]);
  const { table: values, setTable: setValues, resetTable, loading } = usePertesDeChargeTable();
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
    subtitle: { color: colors.text + '99', marginBottom: 18, textAlign:'center' },
    block: { backgroundColor: dark ? '#23272e' : '#f7f8fa', borderRadius:14, padding:16, marginBottom:18 },
    diamTitle: { fontWeight:'bold', fontSize:17, marginBottom:8, color: colors.text },
    row: { flexDirection:'row', alignItems:'center', marginBottom:10 },
    label: { width:100, color: colors.text, fontSize:15 },
    input: { backgroundColor: dark ? '#1a1d22' : '#f2f3f4', color: colors.text, borderRadius:8, padding:6, minWidth:60, textAlign:'center', fontSize:16, borderWidth:1, borderColor: dark ? '#333' : '#e0e0e0' },
    impossible: { color: colors.text + '77', fontStyle:'italic', backgroundColor: dark ? '#1a1d22' : '#f2f3f4', borderRadius:8, padding:6, minWidth:60, textAlign:'center', fontSize:16 },
    resetBtn: { backgroundColor: colors.primary ?? '#D32F2F', borderRadius:8, padding:12, marginTop:18, alignSelf:'center' },
    resetBtnTxt: { color:'#fff', fontWeight:'bold', fontSize:16, textAlign:'center' },
  });

  return (
    <ScrollView
      style={{flex:1, backgroundColor:colors.background}}
      contentContainerStyle={{padding:16}}
      keyboardShouldPersistTaps="always"
    >
      <Text style={themedStyles.headerTitle}>Valeurs personnalisées</Text>
      <Text style={themedStyles.subtitle}>Personnalisez les valeurs de pertes de charge pour les tuyaux de 20m. Les valeurs sont en bars.</Text>
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
      <TouchableOpacity style={themedStyles.resetBtn} onPress={resetDefaults}>
        <Text style={themedStyles.resetBtnTxt}>Réinitialiser les valeurs par défaut</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
