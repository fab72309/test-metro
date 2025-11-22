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
    title: '#C62828',          // Rouge pompier légèrement assombri

    // Boutons
    button: '#D32F2F',         // Rouge pompier original
    buttonText: '#FFFFFF',

    // Bordures et séparateurs
    border: '#E1E4E8',         // Gris plus visible

    // États
    error: '#C62828',          // Rouge cohérent avec title
    success: '#2E7D32',        // Vert pour feedback positif
    warning: '#F57C00',        // Orange pour avertissements

    // Icônes
    icon: '#5E656E',
    tabIconDefault: '#8A9099',
    tabIconSelected: '#D32F2F',

    // Inputs
    inputBackground: '#F8F9FA', // Gris très clair pour inputs
    inputBorder: '#D1D5DB',     // Bordure input au repos
    inputBorderFocus: '#D32F2F', // Bordure input en focus

    // Couleurs principales
    primary: '#D32F2F',        // Rouge pompier
    primaryLight: '#EF5350',   // Rouge clair pour hover
    primaryDark: '#B71C1C',    // Rouge foncé pour pressed
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
    secondaryText: '#9AA0A6',  // Gris clair optimisé
    title: '#FF6B6B',          // Rouge corail lumineux

    // Boutons
    button: '#EF5350',         // Rouge plus clair pour dark mode
    buttonText: '#FFFFFF',

    // Bordures et séparateurs
    border: '#2D3139',         // Bordure subtile mais visible

    // États
    error: '#FF6B6B',
    success: '#66BB6A',        // Vert lumineux
    warning: '#FFA726',        // Orange lumineux

    // Icônes
    icon: '#9AA0A6',
    tabIconDefault: '#72787F',
    tabIconSelected: '#FF6B6B',

    // Inputs
    inputBackground: '#16181E', // Noir plus profond pour inputs
    inputBorder: '#2D3139',
    inputBorderFocus: '#FF6B6B',

    // Couleurs principales
    primary: '#FF6B6B',        // Rouge corail pour dark
    primaryLight: '#FF8A80',   // Rouge très clair
    primaryDark: '#EF5350',    // Rouge moyen
    accent: '#FFD54F',         // Jaune doux

    // Headers & surfaces
    header: '#1A1D24',
    surface: '#1A1D24',
    surfaceVariant: '#24272F',
  },
};
