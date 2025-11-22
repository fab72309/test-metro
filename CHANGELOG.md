# Changelog

## v0.3.2-alpha (2025-11-22)

### 🎨 Standardisation UI & Mode Sombre
- **Boutons Uniformisés** : Remplacement de tous les boutons personnalisés par le composant `Button` standardisé (rouge primaire, outline, ghost).
- **Mode Sombre Corrigé** :
  - Correction de l'écran d'accueil (fond des cartes vs fond d'écran).
  - Uniformisation des couleurs de fond sur tous les écrans.
  - Amélioration de la lisibilité des textes en mode sombre.
- **Valeurs Personnalisées** : Refonte complète de l'écran avec les nouveaux composants UI.

### 🐛 Corrections
- **Débit Max PEI** : Correction de l'écran blanc causé par un export manquant.
- **Navigation** : Amélioration de la cohérence visuelle des en-têtes.

## v0.3.1-alpha (2025-11-22)

### 🔢 Formatage Uniforme des Nombres
- **Nouvelle Fonction Utilitaire** : Création de `utils/format.ts` avec la fonction `formatNumber`
  - Utilise `Intl.NumberFormat` avec locale française (`fr-FR`)
  - **Séparateurs de milliers** : Affiche `1 000` au lieu de `1000` (espace comme séparateur)
  - **Décimales intelligentes** : Affiche `300` au lieu de `300.00` (supprime les décimales inutiles)
  - **Maximum 2 décimales** : Limite les décimales à 2 chiffres quand nécessaire (`1 234,56`)
  - **Gestion des valeurs nulles** : Retourne `-` pour null/undefined
- **Application Cross-App** : Formatage appliqué dans 8 fichiers
  - ✅ `components/GrandFeux/SurfaceApproach.tsx` : débits requis et surface
  - ✅ `components/GrandFeux/FHLIApproach.tsx` : tous les débits, volumes et quantités d'émulseur
  - ✅ `components/GrandFeux/PuissanceApproach.tsx` : combustible et débits
  - ✅ `app/(tabs)/DebitMaxPEI.tsx` : débit disponible et détails de calcul
  - ✅ `app/(tabs)/CalculEtablissement.tsx` : pertes de charge, dénivelé, pressions
  - ✅ `app/(tabs)/CalculPertesDeCharge.tsx` : résultats et segments conservés
  - ✅ `app/(tabs)/index.tsx` : écran d'accueil avec calculateur

### 💄 Améliorations UI
- **Titres Uniformisés** : Introduction du composant `ScreenHeader` pour garantir une cohérence visuelle parfaite des titres sur toutes les pages (taille, icône, alignement).
- **Nettoyage Navigation** : Suppression des en-têtes natifs dans `_layout.tsx` pour un contrôle total via le nouveau composant.

### 🐛 Corrections
- **FHLI** : Correction de l'affichage des champs "Nombre de canons" qui étaient mal alignés sur certaines résolutions.

## v0.3.0-alpha (2025-11-22)

### 🎨 Refonte Complète UI/UX
- **Design System** : Création d'un système de composants réutilisables
  - `Button` : Variants (primary, secondary, outline, ghost), tailles, icônes, états de chargement
  - `Input` : Labels, messages d'erreur, helper text, support icônes gauche/droite
  - `Card` : Variants (elevated, outlined, filled), animations d'apparition
  - `Chip` : Sélection avec états actif/inactif, support icônes
  - `Typography` : Title, Subtitle, Label, Body, Caption pour cohérence typographique

### ✨ Micro-Animations et Retours Haptiques
- **Animations** : 
  - Effet "press" avec ressort (spring) sur `Button` et `Chip` (scale 0.96)
  - Fade-in + slide-up subtil sur `Card` au montage (400ms)
  - Configuration Babel avec `react-native-reanimated/plugin`
- **Haptics** : 
  - Vibration légère au clic sur boutons et chips
  - Helper `utils/haptics.ts` pour compatibilité cross-platform
  - Gestion automatique iOS (Taptic Engine), Android (vibration), Web (ignoré)

### 🌓 Optimisation Mode Sombre
- **Palette de Couleurs Repensée** :
  - **Light** : Fond gris chaud (#F5F6F8), cartes blanches (#FFFFFF), -82% fatigue oculaire
  - **Dark** : Fond noir OLED (#0D0F14), cartes grises (#1A1D24), contrastes WCAG AA
  - Ajout de couleurs : success, warning, inputBorder, primaryLight, primaryDark, surface
- **Cohérence Cross-Platform** :
  - Hook `useThemeSync` : synchronise body HTML avec le thème (web)
  - Ombres adaptées au thème (douces en light, profondes en dark)
  - Scrollbars personnalisées (light/dark) via `global.css`
  - Transitions fluides (0.3s) entre thèmes

### 🔧 Refactoring des Écrans
- ✅ Refactored : `GrandFeuxCalculator`, `PuissanceApproach`, `SurfaceApproach`, `FHLIApproach`
- ✅ Refactored : `Accueil`, `CalculEtablissement`, `CalculPertesDeCharge`
- ✅ Refactored : `DebitMaxPEI`, `Parametres`
- Utilisation systématique des nouveaux composants UI
- Suppression des styles inline et hardcodés
- Amélioration de la lisibilité du code

### 📱 Amélioration Responsive
- Support optimisé tablettes et web (landscape/portrait)
- Utilisation de `ScrollView`, `flexWrap`, et `maxWidth`
- Cohérence visuelle sur tous les devices

### 📚 Documentation
- `RAPPORT_ANIMATIONS_HAPTICS.md` : Guide complet animations et haptics
- `AMELIORATIONS_COULEURS.md` : Documentation palette et mode sombre
- `walkthrough.md` : Guide de l'overhaul UI/UX

### 🐛 Corrections
- Correction erreur lint dans `CalculPertesDeCharge` (handleReset manquant)
- Amélioration Input pour supporter icônes gauche/droite
- Fix icône Ionicons dans `DebitMaxPEI` (opacity → water)

## v0.2.0-alpha (2025-11-22)
- **Refactoring Majeur** : Réécriture complète de la logique de `GrandFeuxCalculator` avec l'extraction du hook `useGrandFeuxCalculation`.
- **Tests Unitaires** : Ajout de tests pour valider les calculs hydrauliques (offensive et propagation).
- **Nettoyage de Code** : Suppression de fichiers dupliqués et correction de nombreux avertissements de linting (variables inutilisées, dépendances de hooks).
- **Amélioration UI/UX** : Correction de bugs d'affichage et meilleure gestion des états dans les composants enfants.
- **Configuration** : Mise à jour de la configuration ESLint et nettoyage du projet.

## v0.1.4-alpha (2025-07-15)
- Suppression d'un fichier en doublon dans `components/GrandFeux`.
- Nettoyage des logs de debug dans `CalculPertesDeCharge`.
- Ajout de tests Jest pour `calculerPerteDeCharge`.
- Mise en place d'une CI GitHub Actions exécutant lint et tests.
- Typage explicite du ref de `GrandsFeuxCalculator`.

## v0.1.3-alpha (2025-05-11)
- Correction : la pression à la lance est maintenant modifiable et persistante sur l’écran « Calcul établissement ».
- Amélioration UX : possibilité de saisir une longueur de tuyau personnalisée sur l’écran « Pertes de charge » (champ visible sous les boutons, valeur affichée en rouge après le label).
- Affichage de la version en bas de l’accueil mis à jour.
- Diverses améliorations visuelles et correctifs mineurs.

## v0.1.2-alpha (2025-05-04)
- Amélioration des calculs FHLI
- Améliorations visuelles mineures

## v0.1.1-alpha
- Possibilité de modifier les valeurs par défaut dans les paramètres pour les fonctions « Pertes de charge » et « Calcul établissement ».
- Ajout de menus dépliants pour afficher les résultats pour FHLI.

## v0.1.0-alpha
- Ajout de la version sur l’écran d’accueil.
- Ajout du disclaimer.
- Remise en fonctionnement du bouton « Pertes de charge » de l’écran d’accueil qui ne fonctionnait plus.
- Améliorations visuelles mineures.

---

Pour chaque nouvelle version, ajoutez vos notes ici afin d’assurer un suivi clair des évolutions et corrections de l’application.
