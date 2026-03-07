# Fire Hydraulics Calculator 🚒

Application mobile et web pour les calculs hydrauliques pompiers, développée avec [Expo](https://expo.dev) et React Native.

## Version

Current release: **v0.4.0-alpha** 🎉  
See `CHANGELOG.md` for full details.

## ✨ Highlights v0.3.0-alpha

### 🎨 Design System Premium
- Composants UI réutilisables (Button, Input, Card, Chip, Typography)
- Micro-animations fluides avec React Native Reanimated
- Retours haptiques (vibrations) sur iOS et Android
- Mode sombre OLED-optimisé avec palette repensée
- Cohérence visuelle cross-platform (mobile + web)

### 🌓 Mode Sombre Optimisé
- Fond noir OLED (#0D0F14) pour économie batterie
- Contrastes WCAG AA respectés
- Synchronisation automatique web/mobile
- Transitions fluides entre thèmes

### 📱 Responsive Design
- Support optimisé tablettes et web
- Layouts adaptatifs (portrait/landscape)
- Scrollbars personnalisées (web)

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

## 🚀 Publier vos changements sur GitHub

Si vos commits locaux n'apparaissent pas sur GitHub, vérifiez que le dépôt distant est configuré et que votre branche est poussée :

1. Confirmez la présence d'un remote (il n'y en a aucun par défaut dans cet environnement) :

   ```bash
   git remote -v
   ```

   Si la commande ne retourne rien, ajoutez votre URL GitHub :

   ```bash
   git remote add origin https://github.com/<votre-org>/<votre-repo>.git
   ```

2. Associez votre branche de travail au dépôt distant puis poussez-la :

   ```bash
   git push -u origin work
   ```

Une fois le remote configuré et la branche poussée, vos modifications seront visibles sur GitHub.

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
- ✅ **Responsive** : Fonctionne sur mobile, tablette et web
- ✅ **Personnalisable** : Valeurs par défaut modifiables
- ✅ **Tests** : Tests unitaires Jest pour les calculs critiques

## Module Relais (pompage en relais)

- **Méthodes** : `math` (fiche p.10), `approximation`, `abaque guidé`.
- **Entrées V2** : tronçons longueur/dénivelé, débit, pression cible, diamètre 70/110, mode source (PI direct / PI+engin / aspiration), catalogue engins.
- **Pertes de charge** : interpolation par loi `Q²` sur `pertesDeChargeTable`, puis calcul des pertes régulières + dénivelé.
- **Doctrine intégrée** : `%W` recommandé selon durée mission (1-2h: 70-80%, 4-6h: 50-60%), arrondi pression demi/unité supérieure, tuyaux arrondis inférieur.
- **Sorties** : nombre de pompes, tableau opérationnel par engin (position m+tuyaux, consigne, débit), alertes bloquantes/non bloquantes, schéma linéaire, abaque.
- **Personnalisation** : catalogue engins persistant (CRUD) dans `Valeurs personnalisées`, presets initiaux `2000/15`, `1000/15`, `2000/10`.
- **Persistance** : `relay.v2.scenario`, `relay.v2.defaults`, `relay.v2.engineCatalog` avec migration automatique depuis `relay.scenario`.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
