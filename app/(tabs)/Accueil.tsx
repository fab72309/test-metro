import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Title, Body, Caption } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { useThemeContext } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function Accueil() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const palette = Colors[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            source={require('../../assets/images/firefighter_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Title style={[styles.title, { color: palette.title }]}>HYDRAULIQUE</Title>
          <Title style={[styles.title, { color: palette.title }]}>OPERATIONNELLE</Title>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            title="Pertes de charge"
            onPress={() => navigation.navigate('CalculPertesDeCharge' as never)}
            style={styles.button}
            size="lg"
          />
          <Button
            title="Etablissement"
            onPress={() => navigation.navigate('CalculEtablissement' as never)}
            style={styles.button}
            size="lg"
          />
          <Button
            title="Débit max du PEI"
            onPress={() => navigation.navigate('DebitMaxPEI' as never)}
            style={styles.button}
            size="lg"
          />
          <Button
            title="Grands feux"
            onPress={() => navigation.navigate('GrandsFeux' as never)}
            style={styles.button}
            size="lg"
          />
          <Button
            title="Paramètres"
            onPress={() => navigation.navigate('Parametres' as never)}
            style={styles.button}
            size="lg"
          />
        </View>
        <Caption style={[styles.versionText, { color: palette.text }]}>v0.2.0-alpha</Caption>

        {/* Modal d'avertissement */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.modalContent}>
              <Title style={styles.modalTitle}>🛑 Avertissement – Usage pédagogique uniquement</Title>
              <Body style={styles.modalText}>
                L'application Hydraulique Opérationnelle est conçue à des fins pédagogiques et de formation.{"\n"}
                Elle ne doit en aucun cas être utilisée dans un contexte opérationnel réel.{"\n\n"}
                Les résultats fournis sont basés sur des formules standards et ne remplacent ni l’analyse de terrain, ni l’expertise des intervenants.{"\n"}
                Le créateur de l'application décline toute responsabilité en cas d'usage inapproprié, notamment en situation d'urgence ou lors d'une opération de secours.
              </Body>
              <Button title="J'ai compris !" onPress={() => setModalVisible(false)} />
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
  infoIconCircle: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  infoIconText: {
    color: '#D32F2F',
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
    backgroundColor: '#fff',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#c0392b',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    marginBottom: 22,
    textAlign: 'center',
  },
});

