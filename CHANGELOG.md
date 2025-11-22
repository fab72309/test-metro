# Changelog

## v0.2.0 (2025-11-22)
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
