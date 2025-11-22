# 📘 Migration Guide v0.2.0 → v0.3.0

Ce guide vous aide à migrer votre code si vous avez développé sur une branche basée sur v0.2.0.

## 🎯 Changements Majeurs

### 1. Design System

**Avant (v0.2.0)** :
```tsx
import { TouchableOpacity, Text } from 'react-native';

<TouchableOpacity 
  style={{ 
    backgroundColor: '#D32F2F', 
    padding: 10, 
    borderRadius: 8 
  }}
  onPress={handlePress}
>
  <Text style={{ color: '#fff' }}>Calculer</Text>
</TouchableOpacity>
```

**Après (v0.3.0)** :
```tsx
import { Button } from '@/components/ui/Button';

<Button 
  title="Calculer" 
  onPress={handlePress} 
  variant="primary"
/>
```

### 2. Couleurs

**Avant (v0.2.0)** :
```tsx
style={{ 
  backgroundColor: '#fff',
  borderColor: '#E0E0E0'
}}
```

**Après (v0.3.0)** :
```tsx
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const theme = useColorScheme() ?? 'light';
const colors = Colors[theme];

style={{ 
  backgroundColor: colors.card,
  borderColor: colors.border
}}
```

### 3. Inputs

**Avant (v0.2.0)** :
```tsx
<View>
  <Text style={{ fontWeight: 'bold' }}>Longueur (m)</Text>
  <TextInput 
    value={longueur}
    onChangeText={setLongueur}
    style={{ borderWidth: 1, padding: 8 }}
  />
</View>
```

**Après (v0.3.0)** :
```tsx
import { Input } from '@/components/ui/Input';

<Input 
  label="Longueur (m)"
  value={longueur}
  onChangeText={setLongueur}
  helperText="Entre 1 et 300m"
/>
```

### 4. Cartes

**Avant (v0.2.0)** :
```tsx
<View style={{
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  elevation: 3
}}>
  {children}
</View>
```

**Après (v0.3.0)** :
```tsx
import { Card } from '@/components/ui/Card';

<Card variant="elevated">
  {children}
</Card>
```

### 5. Sélection (Chips)

**Avant (v0.2.0)** :
```tsx
{[45, 70, 110].map(val => (
  <TouchableOpacity 
    key={val}
    style={[
      styles.chip,
      diametre === val && styles.chipSelected
    ]}
    onPress={() => setDiametre(val)}
  >
    <Text>{val} mm</Text>
  </TouchableOpacity>
))}
```

**Après (v0.3.0)** :
```tsx
import { Chip } from '@/components/ui/Chip';

{[45, 70, 110].map(val => (
  <Chip 
    key={val}
    label={`${val} mm`}
    selected={diametre === val}
    onPress={() => setDiametre(val)}
  />
))}
```

## 🌈 Nouvelles Couleurs Disponibles

```typescript
// États (nouveaux)
colors.success      // #2E7D32 (light) / #66BB6A (dark)
colors.warning      // #F57C00 (light) / #FFA726 (dark)

// Inputs (nouveaux)
colors.inputBackground
colors.inputBorder
colors.inputBorderFocus

// Variations primary (nouveaux)
colors.primaryLight
colors.primaryDark

// Surfaces (nouveaux)
colors.surface
colors.surfaceVariant
```

## 📦 Nouveaux Composants

### Button

```tsx
import { Button } from '@/components/ui/Button';

// Variants
<Button title="Primary" variant="primary" />
<Button title="Secondary" variant="secondary" />
<Button title="Outline" variant="outline" />
<Button title="Ghost" variant="ghost" />

// Tailles
<Button title="Small" size="sm" />
<Button title="Medium" size="md" />
<Button title="Large" size="lg" />

// Avec icône
<Button 
  title="Save" 
  icon="content-save" 
  onPress={handleSave}
/>

// Loading
<Button title="Loading..." loading={isLoading} />
```

### Input

```tsx
import { Input } from '@/components/ui/Input';

// Basique
<Input 
  label="Débit (L/min)"
  value={debit}
  onChangeText={setDebit}
/>

// Avec erreur
<Input 
  label="Débit"
  value={debit}
  onChangeText={setDebit}
  error="Valeur hors limites"
/>

// Avec helper text
<Input 
  label="Longueur"
  value={longueur}
  onChangeText={setLongueur}
  helperText="Entre 1 et 300m"
/>

// Avec icônes
<Input 
  label="Rechercher"
  value={search}
  onChangeText={setSearch}
  leftIcon={<Icon name="magnify" />}
  rightIcon={<Icon name="close" onPress={clearSearch} />}
/>
```

### Card

```tsx
import { Card } from '@/components/ui/Card';

// Elevated (par défaut)
<Card variant="elevated">
  <Title>Résultats</Title>
  <Body>Contenu...</Body>
</Card>

// Outlined
<Card variant="outlined">
  <Body>Contenu...</Body>
</Card>

// Filled
<Card variant="filled">
  <Body>Contenu...</Body>
</Card>

// Sans animation
<Card animated={false}>
  <Body>Contenu...</Body>
</Card>
```

### Chip

```tsx
import { Chip } from '@/components/ui/Chip';

// Basique
<Chip 
  label="45 mm"
  selected={diametre === 45}
  onPress={() => setDiametre(45)}
/>

// Avec icône
<Chip 
  label="Favori"
  icon="star"
  selected={isFavorite}
  onPress={toggleFavorite}
/>
```

### Typography

```tsx
import { Title, Subtitle, Label, Body, Caption } from '@/components/ui/Typography';

<Title>Titre Principal</Title>
<Subtitle>Sous-titre</Subtitle>
<Label>Label de champ</Label>
<Body>Paragraphe de texte normal</Body>
<Caption>Texte de légende en petit</Caption>
```

## 🎨 Animations & Haptics

### Haptics

```tsx
import { triggerHaptic } from '@/utils/haptics';
import * as Haptics from 'expo-haptics';

const handlePress = () => {
  // Vibration légère
  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  
  // Fonction métier
  calculate();
};
```

### Animations

Les composants `Button`, `Chip`, et `Card` incluent déjà des animations. Pas besoin de les ajouter manuellement.

## 🔧 Configuration Babel

**Nouveau** : Ajout du plugin Reanimated

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // ← NOUVEAU
  };
};
```

⚠️ **Important** : Redémarrez Metro après avoir créé/modifié `babel.config.js` :
```bash
npm start -- --reset-cache
```

## 🌐 Web Support

### Synchronisation Thème

Le hook `useThemeSync` est déjà intégré dans `app/_layout.tsx`. Rien à faire de votre côté.

### Styles CSS Globaux

Le fichier `global.css` gère :
- Scrollbars personnalisées
- Font-smoothing
- Focus accessible

## 📱 SafeAreaView

**Avant (v0.2.0)** :
```tsx
import { SafeAreaView } from 'react-native';
```

**Après (v0.3.0)** :
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
```

Plus moderne et meilleures marges sur iOS.

## 🐛 Breaking Changes

### 1. Couleurs Renommées

```typescript
// SUPPRIMÉ
colors.title      → Utiliser colors.primary
colors.button     → Utiliser colors.primary
colors.buttonText → Utiliser '#FFFFFF'

// MODIFIÉ
colors.background: '#fff' → '#F5F6F8' (light)
colors.background: '#181A20' → '#0D0F14' (dark)
```

### 2. Imports

```tsx
// AVANT
import { useColorScheme } from 'react-native';

// APRÈS
import { useColorScheme } from '@/hooks/useColorScheme';
```

## ✅ Checklist Migration

- [ ] Remplacer `TouchableOpacity` par `Button` où pertinent
- [ ] Remplacer `TextInput` par `Input`
- [ ] Wrapper le contenu dans `Card` au lieu de `View` stylisé
- [ ] Utiliser `Chip` pour sélections multiples
- [ ] Utiliser composants `Typography` au lieu de `Text` stylisé
- [ ] Remplacer couleurs hardcodées par `Colors[theme]`
- [ ] Vérifier `babel.config.js` et redémarrer Metro
- [ ] Tester mode sombre
- [ ] Vérifier animations (doivent être automatiques)

## 🚀 Avantages de la Migration

✅ **Cohérence** : UI uniforme sur toute l'app  
✅ **Maintenabilité** : Code plus lisible, moins de duplication  
✅ **Performance** : Animations optimisées avec Reanimated  
✅ **UX** : Haptics et animations améliorent l'expérience  
✅ **Dark Mode** : Gestion automatique et optimisée  
✅ **Cross-platform** : Comportement identique mobile/web  

## 📞 Besoin d'Aide ?

Consultez :
- `CONTRIBUTING.md` pour les standards
- `AMELIORATIONS_COULEURS.md` pour la palette
- `RAPPORT_ANIMATIONS_HAPTICS.md` pour animations/haptics
- Ouvrez une issue sur GitHub

Bonne migration ! 🚀
