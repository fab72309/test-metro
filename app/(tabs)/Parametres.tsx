import React, { useState } from 'react';
import { View, Switch, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';

import { Card } from '@/components/ui/Card';
import { Title, Body } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { RELEASE_NOTES } from '../../constants/ReleaseNotes';

export default function Parametres() {
  const { theme, setTheme } = useThemeContext();
  const palette = Colors[theme];
  const [isFrench, setIsFrench] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    releaseNotes: false,
  });

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

        <Card style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setExpandedSections(prev => ({ ...prev, releaseNotes: !prev.releaseNotes }))}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="newspaper" size={20} color={palette.title} />
              <Title style={{ marginBottom: 0, marginLeft: 8 }}>Notes de version</Title>
            </View>
            <Ionicons name={expandedSections.releaseNotes ? 'chevron-up' : 'chevron-down'} color={palette.primary} size={20} />
          </TouchableOpacity>

          {expandedSections.releaseNotes && (
            <View style={{ gap: 16, paddingTop: 8 }}>
              {RELEASE_NOTES.map((note, index) => (
                <View key={note.version} style={{ borderLeftWidth: 2, borderLeftColor: palette.border, paddingLeft: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Body style={{ fontWeight: 'bold', color: palette.primary }}>{note.version}</Body>
                    <Body style={{ fontSize: 12, color: palette.secondaryText }}>{note.date}</Body>
                  </View>
                  {note.changes.map((change, idx) => (
                    <Body key={idx} style={{ fontSize: 14, marginBottom: 2 }}>• {change}</Body>
                  ))}
                </View>
              ))}
            </View>
          )}
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
