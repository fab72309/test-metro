/**
 * Palette de couleurs optimisée pour l'application.
 * - Mode Light : Fond gris chaud, cartes blanches, contrastes optimisés
 * - Mode Dark : OLED-friendly, contrastes WCAG AA, cohérence cross-platform
 */

export const Colors = {
  light: {
    // Fond principal : Gris très clair chaud pour réduire la fatigue oculaire
    background: '#F5F6F8',

    // Cartes : Blanc pur pour contraster avec le fond
    card: '#FFFFFF',

    // Textes
    text: '#1A1D23',           // Noir profond (meilleur contraste que #11181C)
    secondaryText: '#5E656E',  // Gris moyen (meilleur lisibilité)
    title: '#1565C0',          // Bleu principal légèrement assombri

    // Boutons
    button: '#1976D2',         // Bleu principal
    buttonText: '#FFFFFF',

    // Bordures et séparateurs
    border: '#E1E4E8',         // Gris plus visible

    // États
    error: '#C62828',          // Rouge accessible pour les erreurs
    success: '#2E7D32',        // Vert pour feedback positif
    warning: '#F57C00',        // Orange pour avertissements

    // Icônes
    icon: '#5E656E',
    tabIconDefault: '#8A9099',
    tabIconSelected: '#1976D2',
    link: '#D32F2F',

    // Inputs
    inputBackground: '#F8F9FA', // Gris très clair pour inputs
    inputBorder: '#D1D5DB',     // Bordure input au repos
    inputBorderFocus: '#1976D2', // Bordure input en focus

    // Couleurs principales
    primary: '#1976D2',        // Bleu principal
    primaryLight: '#42A5F5',   // Bleu clair pour hover
    primaryDark: '#0D47A1',    // Bleu foncé pour pressed
    accent: '#FFB300',         // Jaune doré (moins agressif que #FFD600)

    // Headers & surfaces
    header: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F8F9FA',
  },

  dark: {
    // Fond principal : Noir profond OLED-friendly
    background: '#0D0F14',

    // Cartes : Gris très sombre avec élévation visuelle
    card: '#1A1D24',

    // Textes (contrastes WCAG AA optimisés)
    text: '#E8EAED',           // Blanc cassé (meilleur que #ECEDEE)
    secondaryText: '#B1B8C2',  // Gris clair optimisé
    title: '#64B5F6',          // Bleu lumineux

    // Boutons
    button: '#64B5F6',         // Bleu plus clair pour dark mode
    buttonText: '#FFFFFF',

    // Bordures et séparateurs
    border: '#343C49',         // Bordure subtile mais visible

    // États
    error: '#EF9A9A',
    success: '#66BB6A',        // Vert lumineux
    warning: '#FFA726',        // Orange lumineux

    // Icônes
    icon: '#9AA0A6',
    tabIconDefault: '#72787F',
    tabIconSelected: '#64B5F6',
    link: '#FF6B6B',

    // Inputs
    inputBackground: '#202733', // Surface plus lisible sur fond sombre
    inputBorder: '#4A5A71',
    inputBorderFocus: '#90CAF9',

    // Couleurs principales
    primary: '#64B5F6',        // Bleu clair pour dark
    primaryLight: '#90CAF9',   // Bleu très clair
    primaryDark: '#42A5F5',    // Bleu moyen
    accent: '#FFD54F',         // Jaune doux

    // Headers & surfaces
    header: '#1A1D24',
    surface: '#1A1D24',
    surfaceVariant: '#242C37',
  },
};
