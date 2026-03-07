import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { ExternalLink } from '@/components/ExternalLink';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

const REPOSITORY_URL = 'https://github.com/fab72309/test-metro';
const ISSUES_URL = 'https://github.com/fab72309/test-metro/issues';

export default function SupportScreen() {
  const { theme } = useThemeContext();
  const palette = Colors[theme];

  return (
    <>
      <Stack.Screen options={{ title: 'Support' }} />
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title="Support" icon="help-circle-outline" />

          <Card animated={false}>
            <Title>Hydraulique Opérationnelle</Title>
            <Body>
              Application d'aide au calcul destinée à la formation et à la préparation opérationnelle.
            </Body>
            <Body style={styles.topSpacing}>
              Cette version n'intègre ni compte utilisateur ni centre de support embarqué.
            </Body>
          </Card>

          <Card animated={false}>
            <Title>Obtenir de l'aide</Title>
            <View style={styles.linkRow}>
              <Ionicons name="logo-github" size={18} color={palette.primary} />
              <ExternalLink href={ISSUES_URL}>
                <Body style={[styles.linkText, { color: palette.primary }]}>Ouvrir une demande sur GitHub Issues</Body>
              </ExternalLink>
            </View>
            <View style={styles.linkRow}>
              <Ionicons name="link-outline" size={18} color={palette.primary} />
              <ExternalLink href={REPOSITORY_URL}>
                <Body style={[styles.linkText, { color: palette.primary }]}>Consulter le dépôt du projet</Body>
              </ExternalLink>
            </View>
          </Card>

          <Card animated={false} variant="outlined">
            <Title>Cadre d'utilisation</Title>
            <Body>
              Hydraulique Opérationnelle est fournie comme outil pédagogique et d'aide au calcul.
            </Body>
            <Body style={styles.topSpacing}>
              Elle ne doit pas être utilisée comme unique source de décision dans une situation
              opérationnelle critique.
            </Body>
          </Card>

          <Caption style={[styles.updatedAt, { color: palette.secondaryText }]}>
            Dernière mise à jour: 7 mars 2026
          </Caption>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  linkText: {
    marginBottom: 0,
  },
  topSpacing: {
    marginTop: 10,
  },
  updatedAt: {
    textAlign: 'center',
    marginBottom: 12,
  },
});
