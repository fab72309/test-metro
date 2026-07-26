# Audit complet — Hydraulique Opérationnelle v1.1.0

Date de clôture : 26 juillet 2026

## Conclusion

L’audit a identifié des écrans hérités, des réglages sans effet, deux défauts de
calcul confirmés et plusieurs calculs dont le fondement n’était pas traçable.
Les éléments sans source vérifiable ont été retirés ou clairement qualifiés.
Les calculs PEI et mousse ont été reconstruits à partir de sources françaises
officielles.

L’application reste une aide au dimensionnement et à la formation. Elle ne
remplace ni la reconnaissance, ni les prescriptions du règlement départemental,
ni la doctrine et les caractéristiques des matériels du service.

## État doctrinal des calculs

| Module | État après audit | Fondement et limite |
|---|---|---|
| Capacité PEI | Vérifié dans le périmètre RDDECI 78 | Comparaison du besoin au débit mesuré sous 1 bar de pression dynamique. L’ancienne extrapolation depuis les pressions statique et résiduelle a été supprimée. |
| Liquides inflammables — mousse | Vérifié dans le périmètre de l’annexe VI ICPE | Application douce : 4 L/min/m². Application indirecte : 5 L/min/m² pour un liquide non miscible et 8 L/min/m² pour un liquide miscible. Temporisation à demi-taux. La concentration dépend de l’émulseur. |
| Pertes de charge | Méthode vérifiée, valeurs locales à confirmer | La doctrine de formation prévoit l’emploi d’un tableau et des lois de pertes de charge. La provenance numérique du tableau initial n’était pas incluse : les valeurs restent personnalisables et sont signalées comme pédagogiques. |
| Calcul d’établissement | Principe vérifié | Somme des pertes régulières, du dénivelé à raison de 1 bar pour 10 m et de la pression nécessaire à l’organe hydraulique. Les pertes singulières ne sont pas ajoutées automatiquement. |
| Relais | Aide pédagogique à confirmer localement | Les équations hydrauliques sont explicites et testées. Le document interne cité par l’ancienne version n’était pas présent dans le dépôt et n’a pas été retrouvé ; les plages de travail et le résultat opérationnel doivent être validés par le service. |
| Anciens calculs « puissance » et « surface » | Retirés | Les coefficients 42,5/106 L/min/MW et les valeurs par défaut de propagation n’ont pas été rattachés à une doctrine française officielle vérifiable. |

## Défauts confirmés et corrections

- La modification d’un tronçon conservait l’ancienne perte de charge : la valeur
  est maintenant recalculée avec le tableau actif.
- Le relais affichait un pourcentage de travail choisi sans l’utiliser pour
  déterminer le nombre de pompes : le dimensionnement l’applique désormais.
- Le calcul PEI présentait une extrapolation comme un débit disponible :
  l’écran a été remplacé par une évaluation fondée sur la mesure à 1 bar.
- Le calcul mousse utilisait des taux 5/10 et des durées 20/40/10 sans périmètre
  fiable : il applique désormais les taux officiels et ne crée plus de phase de
  maintien arbitraire.
- Des routes dupliquées provoquaient notamment un écran web cassé. Les routes,
  composants, hooks et tests des anciennes variantes ont été supprimés.
- Le réglage français/anglais ne traduisait rien. Il a été retiré.
- Quatre sections « À implémenter » donnaient l’apparence de fonctions
  disponibles. Elles ont été supprimées.
- Une corruption du stockage local pouvait bloquer le chargement des valeurs
  personnalisées. Le fournisseur rétablit maintenant des valeurs sûres.
- Les libellés de l’onglet mobile ont été raccourcis pour éviter leur troncature.
- Les routes historiques sensibles à la casse ont été normalisées afin que les
  accès directs et les rechargements fonctionnent après la normalisation des URL
  par Netlify.

## Qualité, sécurité et maintenance

- Les calculs PEI et mousse sont isolés dans des fonctions pures et couverts par
  des tests unitaires.
- Les tests relais vérifient maintenant l’effet du pourcentage de travail et le
  comportement sans catalogue d’engins.
- La CI contrôle le lint, les types TypeScript, les tests et l’export web.
- Les dépendances directes inutilisées et la dépendance CLI non maîtrisée ont été
  retirées ; les correctifs compatibles de la chaîne npm ont été appliqués.
- L’audit npm conserve des alertes transitives liées principalement à la chaîne
  de construction Expo SDK 52. Une mise à niveau majeure incrémentale de
  l’environnement natif est à traiter dans une release dédiée : forcer Expo 57
  imposerait React Native 0.86, Node 22 et iOS 16.4, sans permettre une validation
  native fiable dans ce correctif.
- L’application publiée sur Netlify est un export statique, sans serveur métier,
  base de données, authentification ni secret applicatif.

## Sources officielles

1. Direction générale de la sécurité civile et de la gestion des crises,
   *GTO Établissements et techniques d’extinction* :
   https://pnrs.ensosp.fr/content/download/40517/668892/file/GTO-etablissements-techniques-extinction-2018.pdf
2. Préfecture des Yvelines et SDIS 78, *Règlement départemental de défense
   extérieure contre l’incendie* :
   https://www.sdis78.fr/storage/app/media/Conseils-aux-elus-et-exploitants/DECI/20170804-rddeci-78-signe-prefet-1.pdf
3. Légifrance, annexe VI relative aux taux d’application et durées d’extinction
   des feux de liquides inflammables :
   https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000031175764
4. Ministère de l’Intérieur, référentiel national de la défense extérieure contre
   l’incendie :
   https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000031733868

## Vérifications de release

La release doit être considérée comme publiable uniquement si les commandes de
lint, de contrôle TypeScript, de tests et d’export statique réussissent, puis si
les écrans principaux sont contrôlés aux formats mobile et bureau.
