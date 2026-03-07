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
import { PUBLIC_APP_CONFIG } from '@/constants/PublicAppConfig';
import { useThemeContext } from '@/context/ThemeContext';

export default function PrivacyPolicyScreen() {
  const { theme } = useThemeContext();
  const palette = Colors[theme];

  return (
    <>
      <Stack.Screen options={{ title: 'Politique de confidentialité' }} />
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title="Politique de confidentialité" icon="shield-checkmark-outline" />

          <Card animated={false}>
            <Title>Données personnelles</Title>
            <Body>
              Hydraulique Opérationnelle ne requiert pas la création d'un compte et ne collecte pas
              intentionnellement de données personnelles dans sa version actuelle.
            </Body>
          </Card>

          <Card animated={false}>
            <Title>Stockage local</Title>
            <Body>
              Les préférences d'affichage, les valeurs personnalisées et les scénarios de calcul sont
              stockés localement sur votre appareil afin de restaurer votre configuration.
            </Body>
            <Body style={styles.topSpacing}>
              Ces informations ne sont pas transmises à un serveur applicatif par l'application.
            </Body>
          </Card>

          <Card animated={false}>
            <Title>Services tiers</Title>
            <Body>
              Cette version n'intègre ni publicité, ni suivi publicitaire, ni analytics produit, ni
              authentification tierce.
            </Body>
          </Card>

          <Card animated={false} variant="outlined">
            <Title>Nous contacter</Title>
            {PUBLIC_APP_CONFIG.supportEmailUrl ? (
              <View style={[styles.linkRow, styles.topSpacing]}>
                <Ionicons name="mail-outline" size={18} color={palette.primary} />
                <ExternalLink href={PUBLIC_APP_CONFIG.supportEmailUrl}>
                  <Body style={[styles.linkText, { color: palette.primary }]}>
                    {PUBLIC_APP_CONFIG.supportEmail}
                  </Body>
                </ExternalLink>
              </View>
            ) : null}
            <View style={styles.linkRow}>
              <Ionicons name="logo-github" size={18} color={palette.primary} />
              <ExternalLink href={PUBLIC_APP_CONFIG.issuesUrl}>
                <Body style={[styles.linkText, { color: palette.primary }]}>
                  Contacter l'éditeur via GitHub Issues
                </Body>
              </ExternalLink>
            </View>
            {PUBLIC_APP_CONFIG.privacyPolicyPageUrl ? (
              <View style={styles.linkRow}>
                <Ionicons name="shield-checkmark-outline" size={18} color={palette.primary} />
                <ExternalLink href={PUBLIC_APP_CONFIG.privacyPolicyPageUrl}>
                  <Body style={[styles.linkText, { color: palette.primary }]}>
                    URL publique de cette politique
                  </Body>
                </ExternalLink>
              </View>
            ) : null}
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
