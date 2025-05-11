import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '@/components/ui/Header';
import { useThemeContext } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function Accueil() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const palette = Colors[theme];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: palette.background}]}> 
      {/* Info Icon flottant en haut à droite */}
      <TouchableOpacity
        style={styles.infoIconFloating}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Informations"
      >
        <View style={styles.infoIconCircle}>
          <Text style={styles.infoIconText}>i</Text>
        </View>
      </TouchableOpacity>

      {/* Logo et titres centrés */}
      <View style={styles.logoContainerCentered}>
        <Image
          source={require('../../assets/images/firefighter_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, {color: palette.title}]}>HYDRAULIQUE</Text>
        <Text style={[styles.title, {color: palette.title}]}>OPERATIONNELLE</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, {backgroundColor: palette.button}]} onPress={() => navigation.navigate('CalculPertesDeCharge' as never)}>
          <Text style={[styles.buttonText, {color: palette.buttonText}]}>Pertes de charge</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: palette.button}]} onPress={() => navigation.navigate('CalculEtablissement' as never)}>
          <Text style={[styles.buttonText, {color: palette.buttonText}]}>Etablissement</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: palette.button}]} onPress={() => navigation.navigate('DebitMaxPEI' as never)}>
          <Text style={[styles.buttonText, {color: palette.buttonText}]}>Débit max du PEI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: palette.button}]} onPress={() => navigation.navigate('GrandsFeux' as never)}>
          <Text style={[styles.buttonText, {color: palette.buttonText}]}>Grands feux</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: palette.button}]} onPress={() => navigation.navigate('Parametres' as never)}>
          <Text style={[styles.buttonText, {color: palette.buttonText}]}>Paramètres</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.versionText, { color: palette.text, marginVertical: 12 }]}>v0.1.3-alpha</Text>

      {/* Modal d'avertissement */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🛑 Avertissement – Usage pédagogique uniquement</Text>
            <Text style={styles.modalText}>
L'application Hydraulique Opérationnelle est conçue à des fins pédagogiques et de formation.{"\n"}
Elle ne doit en aucun cas être utilisée dans un contexte opérationnel réel.{"\n\n"}
Les résultats fournis sont basés sur des formules standards et ne remplacent ni l’analyse de terrain, ni l’expertise des intervenants.{"\n"}
Le créateur de l'application décline toute responsabilité en cas d'usage inapproprié, notamment en situation d'urgence ou lors d'une opération de secours.
            </Text>
            <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>J'ai compris !</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    // Couleur dynamique via palette
    marginBottom: 24,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    // Couleur dynamique via palette
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  logoContainer: {
    // Ancien style, non utilisé
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
    // Couleur dynamique via palette
    letterSpacing: 2,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
  },
  button: {
    // Couleur dynamique via palette
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 14,
    alignItems: 'center',
    width: '70%',
    alignSelf: 'center',
  },
  buttonText: {
    // Couleur dynamique via palette
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  versionText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
  },
  infoIconFloating: {
    position: 'absolute',
    top: 75,
    right: 18,
    zIndex: 10,
  },
  infoIconContainer: {
    // Ancien style, non utilisé
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    alignItems: 'center',
    elevation: 5,
    maxWidth: 380,
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
    color: '#222',
    marginBottom: 22,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 26,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
