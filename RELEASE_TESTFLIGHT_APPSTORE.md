# Release iOS: TestFlight puis App Store

## Etat cible

- Nom public: `Hydraulique Opérationnelle`
- Bundle ID: `com.fabienlopes.testmetro`
- Version courante: `1.1.0`
- Build courant: `4`
- Device scope: `iPhone only`
- Positionnement: application de formation et d'aide au calcul

## Ce que Codex a deja prepare

- Nom public et version release `1.1.0`
- Limitation iPhone only
- Pages publiques `support` et `privacy-policy`
- Suppression de l'ecran template Expo non pertinent
- Guide de texte App Store Connect
- Lint, tests, export web et build iOS release non signe verifies localement

## URLs publiques a publier

- Support: `https://<votre-domaine>/support`
- Politique de confidentialite: `https://<votre-domaine>/privacy-policy`

Le projet exporte deja ces routes avec `npx expo export --platform web --output-dir web-build`.

Avant le deploy web, copie `.env.example` vers `.env.local` et remplace au minimum:

```bash
EXPO_PUBLIC_SITE_URL=https://<votre-site-public>
EXPO_PUBLIC_SUPPORT_EMAIL=<votre-email-support-public>
```

## Ce que tu dois encore faire toi-meme

### Obligatoire avant envoi Apple

- Publier les pages web sur un domaine public
- Choisir le `Team` Apple dans Xcode
- Verifier certificats et provisioning
- Creer ou configurer l'app dans App Store Connect
- Completer les formulaires `App Privacy` et `Export Compliance`
- Uploader l'archive signee via Xcode Organizer

### Informations que tu dois fournir

- Une adresse email de support publique
- Le domaine final des pages support et confidentialite
- Le texte final si tu veux ajuster la description App Store

## Procedure exacte

### 1. Publier les pages support et confidentialite

Le plus simple ici est Netlify, car le projet a deja [netlify.toml](/Users/fabienlopes/Documents/DevApp/test-metro/netlify.toml).

1. Va sur Netlify et connecte le repo GitHub `fab72309/test-metro`.
2. Lors de la creation du site:
   - Build command: `npx expo export --platform web --output-dir web-build`
   - Publish directory: `web-build`
   - Variables d'environnement:
     - `EXPO_PUBLIC_SITE_URL=https://<ton-site>.netlify.app`
     - `EXPO_PUBLIC_SUPPORT_EMAIL=<ton-email-support-public>`
3. Lance le deploy.
4. Verifie ensuite:
   - `https://<ton-site>.netlify.app/support`
   - `https://<ton-site>.netlify.app/privacy-policy`
5. Si tu as un domaine perso, branche-le ensuite et garde les URLs definitives pour App Store Connect.

### 2. Verifier une derniere fois le projet en local

Depuis la racine du repo:

```bash
npm run lint
npm run typecheck
npm run test:ci
npm run export:web
```

Ces commandes ont deja ete verifiees localement sur cette branche.

Tu peux aussi tout verifier d'un coup avec:

```bash
npm run release:check
```

### 3. Configurer Xcode pour l'archive

1. Ouvre `ios/testmetro.xcworkspace` dans Xcode.
2. Clique sur le projet `testmetro`, puis sur la target `testmetro`.
3. Onglet `Signing & Capabilities`:
   - Coche `Automatically manage signing`
   - Selectionne ton `Team`
   - Verifie le `Bundle Identifier`: `com.fabienlopes.testmetro`
4. Onglet `General`:
   - Display Name: `Hydraulique Opérationnelle`
   - Version: `1.1.0`
   - Build: `4` ou une valeur supérieure si ce build a déjà été utilisé
   - Devices: `iPhone`
5. Menu `Product > Scheme > Edit Scheme`:
   - Verifie que `Build configuration` pour `Archive` est `Release`
6. Branche un compte Apple valide dans `Xcode > Settings > Accounts` si necessaire.

### 4. Creer l'app dans App Store Connect

1. Ouvre App Store Connect.
2. Va dans `My Apps`.
3. Clique sur `+` puis `New App`.
4. Renseigne:
   - Platforms: `iOS`
   - Name: `Hydraulique Opérationnelle`
   - Primary language: `French`
   - Bundle ID: `com.fabienlopes.testmetro`
   - SKU: `hydraulique-operationnelle-ios` ou un identifiant interne equivalent
5. Cree l'app.

### 5. Remplir la fiche App Store Connect

Dans l'onglet de l'application, renseigne au minimum:

- Subtitle: `Calculs hydrauliques pour la formation`
- Category recommandee: `Utilities`
- Description: utilise le bloc ci-dessous
- Keywords suggerees: `hydraulique,pompiers,calcul,formation,pertes de charge,relais`
- Support URL: URL publique `/support`
- Privacy Policy URL: URL publique `/privacy-policy`

#### Description recommandee

Hydraulique Opérationnelle est une application d'aide au calcul conçue pour la formation et la préparation opérationnelle.

Elle regroupe plusieurs modules utiles pour travailler les calculs hydrauliques:
- pertes de charge
- établissement
- relais
- débit maximal du PEI
- grands feux

L'application permet également de conserver localement certains paramètres et scénarios de calcul afin de reprendre rapidement votre travail.

Hydraulique Opérationnelle est fournie dans un cadre pédagogique. Elle ne doit pas être utilisée comme unique source de décision lors d'une intervention réelle.

#### What’s New

Première version iPhone préparée pour TestFlight. Positionnement pédagogique clarifié et ajout des pages publiques de support et de confidentialité.

#### App Review Information

- Contact email: ton email de support public
- Contact phone: ton numero si Apple le demande
- Review notes:

```text
L'application est destinée à la formation et à l'aide au calcul. Elle n'embarque ni compte utilisateur, ni publicité, ni achat intégré, ni suivi publicitaire.
```

### 6. Completer App Privacy et Export Compliance

#### App Privacy

Etat recommande pour cette version, a confirmer par toi avant validation:

- Donnees collectees: `No`
- Tracking: `No`

Motif: l'application stocke des preferences et scenarios localement sur l'appareil, sans backend applicatif ni compte utilisateur.

#### Export Compliance

Reponds avec prudence dans App Store Connect. Pour cette app:

- pas de messagerie securisee maison
- pas de chiffrement metier specifique declare dans le produit

Mais tu dois confirmer toi-meme les reponses finales avant soumission.

### 7. Faire l'archive et l'upload depuis Xcode

1. Dans Xcode, choisis `Any iOS Device (arm64)` ou un device generique compatible archive.
2. Menu `Product > Archive`.
3. Attends l'ouverture de `Organizer`.
4. Dans `Organizer`, selectionne l'archive.
5. Clique `Distribute App`.
6. Choisis:
   - `App Store Connect`
   - puis `Upload`
7. Laisse les options par defaut recommandees par Xcode sauf besoin specifique.
8. Lance l'upload.

Si Apple refuse l'upload pour la signature ou le provisioning, le probleme est cote compte Apple/Xcode, pas cote code du repo.

### 8. Activer TestFlight interne

1. Reviens dans App Store Connect.
2. Ouvre l'onglet `TestFlight`.
3. Attends que la build apparaisse et termine son traitement.
4. Complete si demande:
   - `Beta App Description`
   - `Beta App Feedback Email`
5. Ajoute les testeurs internes de ton equipe.
6. Active la build pour le groupe interne.

### 9. Avant d'envoyer a des testeurs

Verifie sur iPhone reel ou TestFlight:

- lancement de l'app
- nom affiche
- icone
- navigation entre les modules
- pages support et confidentialite publiees
- disclaimer pedagogique visible et coherent
- persistance locale des valeurs personnalisees

### 10. Quand tu voudras passer a l'App Store public

Tu repartiras de la meme build ou d'une build suivante, puis:

1. Ajouter les screenshots iPhone finals
2. Finaliser age rating et category si tu ajustes
3. Verifier toutes les URLs publiques
4. Soumettre la version pour review

## Checklist courte de blocage

Si tu es bloque, verifie d'abord ces points:

- le `Team` Xcode est bien selectionne
- le bundle ID de l'app App Store Connect correspond exactement a celui du projet
- la version/build dans Xcode est coherente
- les URLs support/confidentialite sont publiques et accessibles sans login
- la build apparait bien dans `TestFlight` apres traitement

## Commandes utiles

```bash
npm run lint
npx jest --runInBand --watchAll=false
npx expo export --platform web --output-dir web-build
xcodebuild -workspace ios/testmetro.xcworkspace -scheme testmetro -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' build CODE_SIGNING_ALLOWED=NO
```
