import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme, useNavigation, useFocusEffect } from '@react-navigation/native';
import { usePertesDeChargeTable, DEFAULT_PRESSIONS } from '../context/PertesDeChargeTableContext';
import { pertesDeChargeTable as defaultTable, TypeTuyau } from '../constants/pertesDeChargeTable';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useRelayStore } from '@/features/relay/store/relayStore';
import { useEngineCatalogStore } from '@/features/relay/store/engineCatalogStore';
import type { RelayMissionDuration } from '@/features/relay/engine/types';

export default function ValeursPerso() {
  const { colors, dark } = useTheme();
  const navigation = useNavigation();
  const { table: values, setTable: setValues, loading, customPressions, setCustomPressions, resetCustomPressions } = usePertesDeChargeTable();
  const { defaults, updateDefaultSettings } = useRelayStore();
  const { models, addModel, updateModel, removeModel, resetModels } = useEngineCatalogStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pertesDeCharge: false,
    calculEtablissement: false,
    relais: false,
    grandsFeuxAttaqueOffensive: false,
    grandsFeuxLuttePropagation: false,
    grandsFeuxSurface: false,
    grandsFeuxFHLI: false,
  });
  const [defaultTarget, setDefaultTarget] = useState(String(defaults.targetOutletBar));
  const [defaultDuration, setDefaultDuration] = useState<RelayMissionDuration>(defaults.missionDuration);

  // État local pour la saisie temporaire des pressions rapides
  const [editCustomPressions, setEditCustomPressions] = useState(() => customPressions.map(String));
  useEffect(() => {
    setEditCustomPressions(customPressions.map(String));
  }, [customPressions]);
  useEffect(() => {
    setDefaultTarget(String(defaults.targetOutletBar));
    setDefaultDuration(defaults.missionDuration);
  }, [defaults.missionDuration, defaults.targetOutletBar]);
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerBackTitle: 'Retour' });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      // Collapse all sections on screen focus
      setExpandedSections({
        pertesDeCharge: false,
        calculEtablissement: false,
        relais: false,
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
  const tuyauOrder: TypeTuyau[] = ['45x20', '70x20', '70x40', '110x20', '110x40'];

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
    // Le champ affiché doit refléter ce qui est stocké/utilisé.
    // On garde l'état local pour la saisie (virgule, texte temporaire), et on synchronise le stockage
    // dès que la valeur saisie est valide.
    setEditValues(prev => ({ ...prev, [`${diam}-${debit}`]: val }));

    const normalized = val.trim().replace(',', '.');
    if (normalized === '') {
      setValues({
        ...values,
        [diam]: {
          ...(values[diam as TypeTuyau] ?? {}),
          [debit]: null,
        },
      });
      return;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    setValues({
      ...values,
      [diam]: {
        ...(values[diam as TypeTuyau] ?? {}),
        [debit]: parsed,
      },
    });
  };



  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}><Text style={{ color: colors.text }}>Chargement...</Text></View>;

  const themedStyles = StyleSheet.create({
    headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: colors.text, alignSelf: 'center' },
    headerText: { color: '#1976D2', fontWeight: 'bold', marginBottom: 18, textAlign: 'center' },
    subtitle: { color: colors.text + '99', marginBottom: 18, textAlign: 'center' },
    block: { backgroundColor: dark ? '#23272e' : '#f7f8fa', borderRadius: 14, padding: 16, marginBottom: 18 },
    diamTitle: { fontWeight: 'bold', fontSize: 17, marginBottom: 8, color: colors.text },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    label: { width: 100, color: colors.text, fontSize: 15 },
    input: { backgroundColor: dark ? '#1a1d22' : '#f2f3f4', color: colors.text, borderRadius: 8, padding: 6, minWidth: 60, textAlign: 'center', fontSize: 16, borderWidth: 1, borderColor: dark ? '#333' : '#e0e0e0' },
    impossible: { color: colors.text + '77', fontStyle: 'italic', backgroundColor: dark ? '#1a1d22' : '#f2f3f4', borderRadius: 8, padding: 6, minWidth: 60, textAlign: 'center', fontSize: 16 },
    resetBtn: { backgroundColor: '#1976D2', borderRadius: 8, padding: 12, marginTop: 18, alignSelf: 'center' },
    resetBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: dark ? '#23272e' : '#f7f8fa', padding: 12, borderRadius: 8, marginTop: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1976D2' },
    // Ajout styles pour boutons pression personnalisée
    paramBtn: {
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 16,
      backgroundColor: dark ? '#23272e' : '#eee',
      alignItems: 'center',
      marginHorizontal: 2,
      marginVertical: 2,
    },
    paramBtnTxt: {
      color: '#444',
      fontWeight: 'bold',
      fontSize: 16,
    },
    calcBtn: {
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 8,
      backgroundColor: '#eee',
    },
    calcBtnTxt: {
      fontSize: 22,
      color: '#1976D2',
      fontWeight: 'bold',
    },
    paramInput: {
      backgroundColor: dark ? '#1a1d22' : '#f2f3f4',
      color: colors.text,
      borderRadius: 8,
      padding: 6,
      minWidth: 60,
      textAlign: 'center',
      fontSize: 16,
      borderWidth: 1,
      borderColor: dark ? '#333' : '#e0e0e0',
    },
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="always"
    >
      <Text style={themedStyles.headerText}>
        Personnalisez les valeurs utilisées dans des différents calculs de l'application en fonction de votre doctrine, équipements etc.. :
      </Text>
      {/* Section Pertes de charge */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('pertesDeCharge')}>
        <Text style={themedStyles.sectionTitle}>Pertes de charge :</Text>
        <Ionicons name={expandedSections.pertesDeCharge ? 'chevron-up' : 'chevron-down'} color='#1976D2' size={20} />
      </TouchableOpacity>
      {expandedSections.pertesDeCharge && (
        <>
          {tuyauOrder
            .filter((type) => Boolean(values[type]))
            .map((type) => {
              const debits = values[type];
              const [diameter, length] = type.split('x');
              return (
                <View key={type} style={themedStyles.block}>
                  <Text style={themedStyles.diamTitle}>
                    Tuyau {length} m - Diamètre {diameter} mm
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
                          onChangeText={(text) => handleChange(type, debit, text)}
                          selectTextOnFocus={true}
                        />
                      </View>
                    );
                  })}
                  {/* Boutons validation/réinitialisation pour pertes de charge */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 8 }}>
                    <Button
                      title="Réinitialiser"
                      variant="outline"
                      onPress={() => {
                        // Réinitialise ce bloc de diamètre (valeurs par défaut)
                        const defaultBlock = defaultTable[type as TypeTuyau];
                        Object.entries(defaultBlock).forEach(([debit, val]) => {
                          setEditValues(prev => ({ ...prev, [`${type}-${debit}`]: val === null || val === undefined ? '' : val.toString() }));
                        });
                        // Met à jour le contexte pour ce diamètre
                        setValues({
                          ...values,
                          [type]: { ...defaultBlock }
                        });
                      }}
                    />
                    <Button
                      title="Valider"
                      onPress={() => {
                        // Applique toutes les valeurs du bloc d’un coup
                        const newBlock: Record<string, number | null> = {};
                        Object.entries(values[type as TypeTuyau]).forEach(([debit, _]) => {
                          const key = `${type}-${debit}`;
                          const text = editValues[key] ?? '';
                          const num = text === '' ? null : parseFloat(text.replace(',', '.'));
                          newBlock[debit] = isNaN(num as number) ? null : num;
                        });
                        setValues({
                          ...values,
                          [type as TypeTuyau]: newBlock
                        });
                      }}
                    />
                  </View>
                </View>
              );
            })}
        </>
      )}
      {/* Section Calcul établissement */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('calculEtablissement')}>
        <Text style={themedStyles.sectionTitle}>Calcul établissement :</Text>
        <Ionicons name={expandedSections.calculEtablissement ? 'chevron-up' : 'chevron-down'} color='#1976D2' size={20} />
      </TouchableOpacity>
      {expandedSections.calculEtablissement && (
        <View style={{ padding: 16 }}>
          {/* Personnalisation des pressions rapides */}
          {customPressions.map((val, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ flex: 1, color: colors.text }}>Pression rapide {idx + 1}</Text>
              <TextInput
                style={[themedStyles.paramInput, { width: 60, textAlign: 'center' }]}
                keyboardType={keyboardTypeDec}
                value={editCustomPressions[idx]}
                onChangeText={text => {
                  const arr = [...editCustomPressions];
                  arr[idx] = text;
                  setEditCustomPressions(arr);
                }}
              />
              <Text style={{ marginLeft: 4, color: colors.text }}>b</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 8 }}>
            <Button
              title="Réinitialiser"
              variant="outline"
              onPress={() => {
                setEditCustomPressions(DEFAULT_PRESSIONS.map(String));
                resetCustomPressions();
              }}
            />
            <Button
              title="Valider"
              onPress={() => {
                const arr = editCustomPressions.map((text, idx) => {
                  const num = parseFloat(text.replace(',', '.'));
                  if (!isNaN(num)) {
                    return text;
                  } else {
                    return customPressions[idx].toString();
                  }
                });
                const nums = editCustomPressions.map(text => parseFloat(text.replace(',', '.')));
                setCustomPressions(nums);
                setEditCustomPressions(arr);
              }}
            />
          </View>

          <Text style={{ color: colors.text + '99', fontSize: 13, textAlign: 'center', marginBottom: 4, marginTop: 12 }}>
            Cette valeur sera utilisée dans la page « Calcul établissement ».
          </Text>
          <Text style={{ color: colors.text + '77', fontSize: 12, textAlign: 'center', marginBottom: 10 }}>
            Astuce : utilisez un point ou une virgule pour les décimales (ex : 7.5 ou 7,5)
          </Text>
        </View>
      )}
      {/* Section Relais */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('relais')}>
        <Text style={themedStyles.sectionTitle}>Relais :</Text>
        <Ionicons name={expandedSections.relais ? 'chevron-up' : 'chevron-down'} color='#1976D2' size={20} />
      </TouchableOpacity>
      {expandedSections.relais && (
        <View style={{ padding: 16, gap: 14 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>Valeurs par défaut (Relais)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.text, flex: 1 }}>Pression cible par défaut (bar)</Text>
            <TextInput
              style={[themedStyles.paramInput, { width: 70, textAlign: 'center' }]}
              keyboardType={keyboardTypeDec}
              value={defaultTarget}
              onChangeText={setDefaultTarget}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title={defaultDuration === 'h1_2' ? 'Mission 1-2h ✓' : 'Mission 1-2h'}
              variant={defaultDuration === 'h1_2' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setDefaultDuration('h1_2')}
            />
            <Button
              title={defaultDuration === 'h4_6' ? 'Mission 4-6h ✓' : 'Mission 4-6h'}
              variant={defaultDuration === 'h4_6' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setDefaultDuration('h4_6')}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title="Valider défauts relais"
              onPress={() => {
                const target = parseFloat(defaultTarget.replace(',', '.'));
                if (!Number.isNaN(target) && target >= 0) {
                  updateDefaultSettings({
                    targetOutletBar: target,
                    missionDuration: defaultDuration,
                  });
                }
              }}
            />
          </View>

          <Text style={{ color: colors.text, fontWeight: '600', marginTop: 8 }}>
            Catalogue engins (modèles disponibles)
          </Text>

          {models.map((model) => (
            <View key={model.id} style={themedStyles.block}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{model.label}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    title={model.enabled ? 'Actif' : 'Inactif'}
                    size="sm"
                    variant={model.enabled ? 'primary' : 'outline'}
                    onPress={() => updateModel(model.id, { enabled: !model.enabled })}
                  />
                  <Button
                    title="Suppr."
                    size="sm"
                    variant="outline"
                    onPress={() => removeModel(model.id)}
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TextInput
                  style={[themedStyles.paramInput, { flex: 1 }]}
                  value={model.label}
                  onChangeText={(text) => updateModel(model.id, { label: text })}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TextInput
                  style={[themedStyles.paramInput, { flex: 1 }]}
                  keyboardType={keyboardTypeDec}
                  value={String(model.nominalFlowLpm)}
                  onChangeText={(text) => {
                    const parsed = parseFloat(text.replace(',', '.'));
                    if (!Number.isNaN(parsed) && parsed > 0) {
                      updateModel(model.id, { nominalFlowLpm: parsed });
                    }
                  }}
                />
                <TextInput
                  style={[themedStyles.paramInput, { flex: 1 }]}
                  keyboardType={keyboardTypeDec}
                  value={String(model.nominalPressureBar)}
                  onChangeText={(text) => {
                    const parsed = parseFloat(text.replace(',', '.'));
                    if (!Number.isNaN(parsed) && parsed > 0) {
                      updateModel(model.id, { nominalPressureBar: parsed });
                    }
                  }}
                />
                <TextInput
                  style={[themedStyles.paramInput, { flex: 1 }]}
                  keyboardType={keyboardTypeDec}
                  value={String(model.maxPressureBar)}
                  onChangeText={(text) => {
                    const parsed = parseFloat(text.replace(',', '.'));
                    if (!Number.isNaN(parsed) && parsed > 0) {
                      updateModel(model.id, { maxPressureBar: parsed });
                    }
                  }}
                />
              </View>
              <Text style={{ color: colors.text + '99', marginTop: 6, fontSize: 12 }}>
                Colonnes: Débit nominal | Pression nominale | Pression max
              </Text>
            </View>
          ))}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title="Ajouter un engin"
              variant="outline"
              onPress={() =>
                addModel({
                  label: 'Nouveau modèle',
                  nominalFlowLpm: 1500,
                  nominalPressureBar: 15,
                  maxPressureBar: 15,
                  enabled: true,
                })
              }
            />
            <Button title="Réinitialiser catalogue" variant="secondary" onPress={resetModels} />
          </View>
        </View>
      )}
      {/* Section Grands feux / Attaque offensive */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('grandsFeuxAttaqueOffensive')}>
        <Text style={themedStyles.sectionTitle}>Grands feux / Attaque offensive :</Text>
        <Ionicons name={expandedSections.grandsFeuxAttaqueOffensive ? 'chevron-up' : 'chevron-down'} color='#1976D2' size={20} />
      </TouchableOpacity>
      {expandedSections.grandsFeuxAttaqueOffensive && <View style={{ padding: 16 }}><Text style={{ color: colors.text }}>À implémenter…</Text></View>}
      {/* Section Grands feux / Lutte propagation */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('grandsFeuxLuttePropagation')}>
        <Text style={themedStyles.sectionTitle}>Grands feux / Lutte propagation :</Text>
        <Ionicons name={expandedSections.grandsFeuxLuttePropagation ? 'chevron-up' : 'chevron-down'} color='#1976D2' size={20} />
      </TouchableOpacity>
      {expandedSections.grandsFeuxLuttePropagation && <View style={{ padding: 16 }}><Text style={{ color: colors.text }}>À implémenter…</Text></View>}
      {/* Section Grands feux / Surface */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('grandsFeuxSurface')}>
        <Text style={themedStyles.sectionTitle}>Grands feux / Surface :</Text>
        <Ionicons name={expandedSections.grandsFeuxSurface ? 'chevron-up' : 'chevron-down'} color='#1976D2' size={20} />
      </TouchableOpacity>
      {expandedSections.grandsFeuxSurface && <View style={{ padding: 16 }}><Text style={{ color: colors.text }}>À implémenter…</Text></View>}
      {/* Section Grands feux / FHLI */}
      <TouchableOpacity style={themedStyles.sectionHeader} onPress={() => toggleSection('grandsFeuxFHLI')}>
        <Text style={themedStyles.sectionTitle}>Grands feux / FHLI :</Text>
        <Ionicons name={expandedSections.grandsFeuxFHLI ? 'chevron-up' : 'chevron-down'} color='#1976D2' size={20} />
      </TouchableOpacity>
      {expandedSections.grandsFeuxFHLI && <View style={{ padding: 16 }}><Text style={{ color: colors.text }}>À implémenter…</Text></View>}
      <Button
        title="Réinitialiser les valeurs par défaut"
        variant="secondary"
        style={{ marginTop: 18, alignSelf: 'center' }}
        onPress={() => {
          resetCustomPressions();
          setEditCustomPressions(DEFAULT_PRESSIONS.map(String));
        }}
      />
    </ScrollView>
  );
}
