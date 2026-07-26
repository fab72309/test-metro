import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Modal, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Title, Body, Caption } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { useThemeContext } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { RELEASE_NOTES } from '../../constants/ReleaseNotes';
import { router } from 'expo-router';

export default function Accueil() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const palette = Colors[theme];
  const currentRelease = RELEASE_NOTES[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Menu flottant en haut à gauche */}
        <TouchableOpacity
          style={styles.menuIconFloating}
          onPress={() => setMenuVisible(true)}
          accessibilityLabel="Menu"
        >
          <View style={styles.menuIconCircle}>
            <Ionicons name="menu" size={18} color={palette.primary} />
          </View>
        </TouchableOpacity>

        {/* Info Icon flottant en haut à droite */}
        <TouchableOpacity
          style={styles.infoIconFloating}
          onPress={() => setModalVisible(true)}
          accessibilityLabel="Informations"
        >
          <View style={styles.infoIconCircle}>
            <Body style={styles.infoIconText}>i</Body>
          </View>
        </TouchableOpacity>

        {/* Logo et titres centrés */}
        <View style={styles.logoContainerCentered}>
          <Image
            source={require('../../assets/images/hydraulique_ops_home_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Title style={[styles.title, { color: palette.title }]}>HYDRAULIQUE</Title>
          <Title style={[styles.title, { color: palette.title }]}>OPERATIONNELLE</Title>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            title="Pertes de charges"
            onPress={() => navigation.navigate('calcul-pertes-de-charge' as never)}
            style={styles.button}
            size="lg"
          />
          <Button
            title="Établissement"
            onPress={() => navigation.navigate('calcul-etablissement' as never)}
            style={styles.button}
            size="lg"
          />
          <Button
            title="Relais"
            onPress={() => navigation.navigate('pompage-relais' as never)}
            style={styles.button}
            size="lg"
          />
          <Button
            title="Capacité du PEI"
            onPress={() => navigation.navigate('capacite-pei' as never)}
            style={styles.button}
            size="lg"
          />
          <Button
            title="Liquides inflammables"
            onPress={() => navigation.navigate('liquides-inflammables' as never)}
            style={styles.button}
            size="lg"
          />
        </View>
        <Caption style={[styles.versionText, { color: palette.text }]}>{currentRelease.version}</Caption>

        {/* Menu rétractable */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <View style={styles.menuOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            />
            <Card style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('reglages' as never);
                }}
              >
                <Ionicons name="settings-outline" size={18} color={palette.text} style={styles.menuItemIcon} />
                <Body>Paramètres</Body>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/valeurs-perso' as never);
                }}
              >
                <Ionicons name="options-outline" size={18} color={palette.text} style={styles.menuItemIcon} />
                <Body>Valeurs personnalisées</Body>
              </TouchableOpacity>
            </Card>
          </View>
        </Modal>

        {/* Modal d'avertissement */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalOverlay,
              { backgroundColor: theme === 'dark' ? 'rgba(4, 7, 14, 0.82)' : 'rgba(0,0,0,0.5)' },
            ]}
          >
            <Card variant="outlined" style={[styles.modalContent, { borderColor: palette.border }]}>
              <View style={[styles.warningBadge, { backgroundColor: theme === 'dark' ? 'rgba(255, 107, 107, 0.14)' : 'rgba(211, 47, 47, 0.08)' }]}>
                <Ionicons name="warning" size={18} color={palette.link} />
                <Body style={[styles.warningBadgeText, { color: palette.link }]}>Usage pédagogique uniquement</Body>
              </View>
              <Title style={[styles.modalTitle, { color: palette.text }]}>Avertissement</Title>
              <Body style={[styles.modalText, { color: palette.text }]}>
                Hydraulique Opérationnelle est une application de formation et d'aide au calcul.{"\n"}
                Elle n'est pas conçue pour piloter une décision opérationnelle critique en intervention réelle.{"\n\n"}
                Les résultats affichés sont fournis à titre indicatif et doivent toujours être confrontés aux procédures, aux consignes locales et à l'analyse de terrain.{"\n"}
                L'éditeur décline toute responsabilité en cas d'usage hors de ce cadre pédagogique.
              </Body>
              <Button
                title="J'ai compris !"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              />
            </Card>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainerCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 30,
    marginBottom: 0,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 0,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
    gap: 14,
  },
  button: {
    width: '80%',
  },
  versionText: {
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
    marginVertical: 12,
  },
  infoIconFloating: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  menuIconFloating: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  infoIconCircle: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
    }),
  },
  menuIconCircle: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
    }),
  },
  infoIconText: {
    color: '#1976D2',
    fontWeight: 'bold',
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    paddingTop: 18,
    paddingBottom: 18,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  menuCard: {
    position: 'absolute',
    top: 52,
    left: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 220,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  menuItemIcon: {
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 22,
    textAlign: 'center',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  warningBadgeText: {
    fontWeight: '700',
    marginBottom: 0,
  },
  modalButton: {
    minWidth: 160,
  },
});
