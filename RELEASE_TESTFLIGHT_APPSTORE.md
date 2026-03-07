# Release iOS: TestFlight puis App Store

## Etat cible

- Nom public: `Hydraulique Opérationnelle`
- Bundle ID: `com.fabienlopes.testmetro`
- Version initiale: `1.0.0`
- Build initial: `1`
- Device scope: `iPhone only`
- Positionnement: application de formation et d'aide au calcul

## URLs publiques a publier

- Support: `https://<votre-domaine>/support`
- Politique de confidentialite: `https://<votre-domaine>/privacy-policy`

Le projet exporte deja ces routes avec `npx expo export --platform web --output-dir web-build`.

## Texte recommande pour App Store Connect

### Sous-titre

Calculs hydrauliques pour la formation

### Description

Hydraulique Opérationnelle est une application d'aide au calcul conçue pour la formation et la préparation opérationnelle.

Elle regroupe plusieurs modules utiles pour travailler les calculs hydrauliques:
- pertes de charge
- établissement
- relais
- débit maximal du PEI
- grands feux

L'application permet également de conserver localement certains paramètres et scénarios de calcul afin de reprendre rapidement votre travail.

Hydraulique Opérationnelle est fournie dans un cadre pédagogique. Elle ne doit pas être utilisée comme unique source de décision lors d'une intervention réelle.

### What’s New

Première version iPhone préparée pour TestFlight. Positionnement pédagogique clarifié et ajout des pages publiques de support et de confidentialité.

### Notes pour la review

L'application est destinée à la formation et à l'aide au calcul. Elle n'embarque ni compte utilisateur, ni publicité, ni achat intégré, ni suivi publicitaire.

## Checklist locale

- `npm run lint`
- `npx jest --runInBand --watchAll=false`
- `npx expo export --platform web --output-dir web-build`
- Build iOS Release dans Xcode

## Actions utilisateur obligatoires

### Apple

- Connecter le bon team de signature dans Xcode
- Vérifier certificats et provisioning
- Créer l'app dans App Store Connect si elle n'existe pas
- Renseigner:
  - categorie
  - age rating
  - keywords
  - support URL
  - privacy policy URL
  - contact review
  - export compliance
  - app privacy
- Archiver et uploader la build via Xcode Organizer
- Activer les testeurs TestFlight

### Contenu / legal

- Fournir une adresse email de support publique avant soumission App Store
- Publier les pages web sur le domaine final
- Valider les textes App Store Connect avant envoi
