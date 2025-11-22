# Guide de Contribution 🤝

Merci de votre intérêt pour contribuer à Fire Hydraulics Calculator ! Ce guide vous aidera à démarrer.

## 📋 Prérequis

- Node.js 18+ et npm
- Expo CLI (`npm install -g expo-cli`)
- Pour iOS : macOS avec Xcode installé
- Pour Android : Android Studio avec émulateur configuré

## 🚀 Setup Local

1. **Forker** le repository
2. **Cloner** votre fork :
   ```bash
   git clone https://github.com/VOTRE-USERNAME/test-metro.git
   cd test-metro
   ```
3. **Installer** les dépendances :
   ```bash
   npm install
   ```
4. **Lancer** l'application :
   ```bash
   npm start
   ```

## 🎨 Standards de Code

### Design System

Utilisez toujours les composants du design system (`components/ui/`) :

```tsx
// ✅ Bon
import { Button } from '@/components/ui/Button';
<Button title="Calculer" onPress={handleCalcul} variant="primary" />

// ❌ Éviter
<TouchableOpacity style={{ backgroundColor: '#D32F2F' }}>
  <Text>Calculer</Text>
</TouchableOpacity>
```

### Couleurs

Utilisez la palette définie dans `constants/Colors.ts` :

```tsx
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const theme = useColorScheme() ?? 'light';
const colors = Colors[theme];

// ✅ Bon
style={{ backgroundColor: colors.card }}

// ❌ Éviter
style={{ backgroundColor: '#FFFFFF' }}
```

### TypeScript

- **Typage strict** : Pas de `any` sauf exception justifiée
- **Props typées** : Définir les interfaces pour tous les composants
- **Hooks typés** : Typer les retours de `useState`, `useEffect`, etc.

### Linting

Avant de commit, assurez-vous que :

```bash
npm run lint  # ✅ Pas d'erreur
npm test      # ✅ Tous les tests passent
```

## 📝 Workflow Git

### Branches

- `main` : Code stable en production
- `develop` : Développement actif
- `feature/nom-feature` : Nouvelle fonctionnalité
- `fix/nom-bug` : Correction de bug

### Commits

Utilisez des messages de commit clairs :

```bash
# ✅ Bon
feat: add haptic feedback to Button component
fix: resolve dark mode contrast issue in Card
docs: update README with v0.3.0 changes
refactor: extract theme logic into useThemeSync hook

# ❌ Éviter
fix stuff
WIP
blabla
```

Préfixes recommandés :
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage (pas de changement de code)
- `refactor:` Refactoring sans changement fonctionnel
- `test:` Ajout/modification de tests
- `chore:` Maintenance (dépendances, config, etc.)

### Pull Requests

1. **Créer une branche** depuis `develop` :
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/mon-feature
   ```

2. **Développer** votre fonctionnalité

3. **Tester** :
   ```bash
   npm run lint
   npm test
   ```

4. **Commit** et **Push** :
   ```bash
   git add .
   git commit -m "feat: description claire"
   git push origin feature/mon-feature
   ```

5. **Ouvrir une PR** vers `develop` avec :
   - Titre clair
   - Description des changements
   - Screenshots si pertinent (UI)
   - Tests effectués

## 🧪 Tests

### Ajouter des Tests

Pour les calculs critiques, ajoutez des tests unitaires :

```tsx
// hooks/__tests__/useMonHook.test.ts
import { renderHook } from '@testing-library/react-native';
import { useMonHook } from '../useMonHook';

describe('useMonHook', () => {
  it('should calculate correctly', () => {
    const { result } = renderHook(() => useMonHook());
    expect(result.current.value).toBe(42);
  });
});
```

### Lancer les Tests

```bash
npm test                    # Mode watch
npm test -- --coverage      # Avec coverage
```

## 🎨 UI/UX Guidelines

### Composants

- **Réutilisables** : Créer dans `components/ui/`
- **Variants** : Prévoir plusieurs variantes (primary, secondary, etc.)
- **Responsive** : Tester sur mobile, tablette, web
- **Dark mode** : Toujours utiliser `Colors[theme]`

### Animations

- **Subtiles** : Durée < 500ms
- **Spring** : Préférer `withSpring()` pour naturel
- **Performance** : Utiliser `react-native-reanimated`

### Haptics

Utiliser `utils/haptics.ts` pour cross-platform :

```tsx
import { triggerHaptic } from '@/utils/haptics';
import * as Haptics from 'expo-haptics';

const handlePress = () => {
  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  // ...
};
```

## 📚 Documentation

Si vous ajoutez une fonctionnalité majeure :

1. **README.md** : Mettre à jour la section Features
2. **CHANGELOG.md** : Ajouter une entrée
3. **Code** : Ajouter des JSDoc pour les fonctions complexes

```tsx
/**
 * Calcule la perte de charge dans un tuyau
 * @param diametre Diamètre du tuyau en mm
 * @param longueur Longueur du tuyau en m
 * @param debit Débit en L/min
 * @returns Perte de charge en bar
 */
export function calculerPerteDeCharge(...) { }
```

## 🐛 Signaler un Bug

Ouvrez une issue avec :
- **Titre clair** : "Bug: Mode sombre ne s'applique pas sur web"
- **Description** : Étapes pour reproduire
- **Environnement** : OS, version app, device
- **Screenshots** : Si pertinent

## 💡 Proposer une Fonctionnalité

Ouvrez une issue "Feature Request" avec :
- **Cas d'usage** : Pourquoi cette feature ?
- **Solution proposée** : Comment l'implémenter ?
- **Alternatives** : Autres approches envisagées ?

## 🏗️ Architecture

```
Design System
  └─ components/ui/Button.tsx
      ├─ Variants (primary, secondary, outline, ghost)
      ├─ Haptics (iOS/Android/Web)
      └─ Animations (Reanimated)

Theme Management
  └─ context/ThemeContext.tsx
      ├─ Light/Dark modes
      └─ hooks/useThemeSync.ts (Web sync)

Screens
  └─ app/(tabs)/
      ├─ File-based routing (Expo Router)
      └─ Utilise Design System
```

## ✅ Checklist PR

Avant de soumettre une PR, vérifier :

- [ ] Code lint sans erreur (`npm run lint`)
- [ ] Tests passent (`npm test`)
- [ ] Typage TypeScript correct (pas de `any`)
- [ ] Utilise les composants UI (pas de styles hardcodés)
- [ ] Testé sur iOS/Android/Web
- [ ] Dark mode fonctionne
- [ ] Documentation ajoutée si pertinent
- [ ] CHANGELOG.md mis à jour

## 📞 Contact

Questions ? Ouvrez une issue ou contactez les mainteneurs.

Merci de contribuer ! 🚒🔥
