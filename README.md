# Hydraulique Opérationnelle

Application mobile et web d'aide au calcul hydraulique pour la formation et la préparation opérationnelle, développée avec [Expo](https://expo.dev) et React Native.

## Version

Current release: **v1.0.0**  
See `CHANGELOG.md` for full details.

## Highlights v1.0.0

- Préparation de la première release iPhone pour TestFlight et App Store.
- Positionnement pédagogique explicite pour la formation et l'aide au calcul.
- Pages publiques de support et de confidentialité prêtes pour un hébergement statique.

## Get started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**

   ```bash
   # Development mode
   npm start

   # Specific platforms
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web browser
   ```

3. **Run tests**

   ```bash
   npm test
   ```

4. **Lint code**

   ```bash
   npm run lint
   ```

## Release setup

Copie `.env.example` vers `.env.local` avant d'exporter le site public, puis renseigne:

```bash
EXPO_PUBLIC_SITE_URL=https://ton-site.netlify.app
EXPO_PUBLIC_SUPPORT_EMAIL=ton-email-support@domaine.fr
```

Commandes utiles pour la release:

```bash
npm run test:ci
npm run export:web
npm run release:check
```

## 📁 Project Structure

```
├── app/                    # Screens (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout with theme provider
├── components/            # Reusable components
│   ├── ui/               # Design system components
│   └── GrandFeux/        # Fire calculation components
├── constants/            # Colors, configs
├── hooks/                # Custom hooks (useThemeSync, etc.)
├── utils/                # Utilities (haptics, etc.)
└── context/              # React Context providers
```

## 🎯 Features

- ✅ **Calculs Hydrauliques** : Pertes de charge, grands feux, débit max PEI
- ✅ **Mode Sombre** : OLED-optimisé avec synchronisation cross-platform
- ✅ **Animations** : Micro-animations fluides (haptics + spring)
- ✅ **Responsive** : Fonctionne sur mobile et web
- ✅ **Personnalisable** : Valeurs par défaut modifiables
- ✅ **Tests** : Tests unitaires Jest pour les calculs critiques
- ✅ **Publication iOS** : Préparation TestFlight/App Store pour iPhone

## Module Relais (pompage en relais)

- **Méthodes** : `math` (fiche p.10), `approximation`, `abaque guidé`.
- **Entrées V2** : tronçons longueur/dénivelé, débit, pression cible, diamètre 70/110, mode source (PI direct / PI+engin / aspiration), catalogue engins.
- **Pertes de charge** : interpolation par loi `Q²` sur `pertesDeChargeTable`, puis calcul des pertes régulières + dénivelé.
- **Doctrine intégrée** : `%W` recommandé selon durée mission (1-2h: 70-80%, 4-6h: 50-60%), arrondi pression demi/unité supérieure, tuyaux arrondis inférieur.
- **Sorties** : nombre de pompes, tableau opérationnel par engin (position m+tuyaux, consigne, débit), alertes bloquantes/non bloquantes, schéma linéaire, abaque.
- **Personnalisation** : catalogue engins persistant (CRUD) dans `Valeurs personnalisées`, presets initiaux `2000/15`, `1000/15`, `2000/10`.
- **Persistance** : `relay.v2.scenario`, `relay.v2.defaults`, `relay.v2.engineCatalog` avec migration automatique depuis `relay.scenario`.

## Publication iOS

- Support public: route `/support` après export web
- Politique de confidentialité: route `/privacy-policy` après export web
- Variables publiques optionnelles: `.env.local` avec `EXPO_PUBLIC_SITE_URL` et `EXPO_PUBLIC_SUPPORT_EMAIL`
- Guide de préparation: `RELEASE_TESTFLIGHT_APPSTORE.md`
