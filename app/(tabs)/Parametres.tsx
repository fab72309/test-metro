import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';

import { Card } from '@/components/ui/Card';
import { Title, Body } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function Parametres() {
  const { theme, setTheme } = useThemeContext();
  const palette = Colors[theme];
  const [isFrench, setIsFrench] = useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Paramètres" icon="settings" />

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language" size={20} color={palette.title} />
            <Title style={{ marginBottom: 0, marginLeft: 8 }}>Langue</Title>
          </View>
          <View style={styles.rowBetween}>
            <Body>Français</Body>
            <Switch value={isFrench} onValueChange={setIsFrench} />
          </View>
          <View style={styles.rowBetween}>
            <Body>English</Body>
            <Switch value={!isFrench} onValueChange={(v) => setIsFrench(!v)} />
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="moon" size={20} color={palette.title} />
            <Title style={{ marginBottom: 0, marginLeft: 8 }}>Apparence</Title>
          </View>
          <View style={styles.rowBetween}>
            <Body>Mode sombre</Body>
            <Switch value={theme === 'dark'} onValueChange={(v) => setTheme(v ? 'dark' : 'light')} />
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calculator" size={20} color={palette.title} />
            <Title style={{ marginBottom: 0, marginLeft: 8 }}>Calculs</Title>
          </View>
          <Button
            title="Valeurs personnalisées"
            onPress={() => router.push('/ValeursPerso')}
            style={{ marginTop: 12 }}
          />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
});

