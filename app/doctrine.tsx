import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { DOCTRINE_REFERENCES } from '@/constants/DoctrineReferences';
import { useThemeContext } from '@/context/ThemeContext';

const MODULES = [
  {
    title: 'Capacité d’un PEI',
    status: 'Vérifié',
    detail:
      'Comparaison du besoin au débit mesuré sous 1 bar de pression dynamique, sans extrapolation d’un débit maximal théorique.',
  },
  {
    title: 'Liquides inflammables – mousse',
    status: 'Vérifié dans le périmètre indiqué',
    detail:
      'Taux minimaux de 4, 5 ou 8 L/min/m² et temporisation à demi-taux selon l’annexe VI. La concentration dépend de l’émulseur retenu.',
  },
  {
    title: 'Pertes de charge et établissement',
    status: 'Méthode vérifiée, valeurs configurables',
    detail:
      'La loi de calcul et la prise en compte du dénivelé sont conformes aux principes de formation. Les valeurs du tableau doivent rester alignées sur les matériels et la doctrine locale.',
  },
  {
    title: 'Relais de pompes',
    status: 'Aide pédagogique à confirmer',
    detail:
      'Le modèle applique les pertes, le dénivelé, la pression cible et les capacités des engins. La référence interne citée par l’ancienne version n’est pas fournie dans le dépôt : validation opérationnelle locale indispensable.',
  },
];

export default function DoctrineScreen() {
  const { theme } = useThemeContext();
  const palette = Colors[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Ionicons name="shield-checkmark-outline" size={28} color={palette.primary} />
          <Title style={styles.title}>Doctrine et limites</Title>
        </View>
        <Body>
          Cette page distingue les calculs appuyés par une doctrine française
          identifiée des aides qui nécessitent encore une validation locale. Les
          prescriptions opérationnelles et les caractéristiques réelles du matériel
          priment toujours sur l’application.
        </Body>

        <Title style={styles.sectionTitle}>État des modules</Title>
        {MODULES.map((module) => (
          <Card key={module.title} variant="outlined" style={styles.card}>
            <Label style={{ color: palette.primary }}>{module.title}</Label>
            <Caption style={{ color: palette.success }}>{module.status}</Caption>
            <Body>{module.detail}</Body>
          </Card>
        ))}

        <Title style={styles.sectionTitle}>Références officielles</Title>
        {DOCTRINE_REFERENCES.map((reference) => (
          <Card key={reference.id} style={styles.card}>
            <Label>{reference.title}</Label>
            <Caption>{reference.issuer}</Caption>
            <Body>{reference.scope}</Body>
            <Button
              title="Ouvrir la source officielle"
              variant="outline"
              size="sm"
              onPress={() => void Linking.openURL(reference.url)}
            />
          </Card>
        ))}

        <Caption>
          Vérification documentaire effectuée le 26 juillet 2026. Une évolution
          réglementaire ou doctrinale peut nécessiter une mise à jour de
          l’application.
        </Caption>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 36, gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { marginBottom: 0 },
  sectionTitle: { marginTop: 14 },
  card: { gap: 8 },
});
