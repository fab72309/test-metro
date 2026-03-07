# Module Relais V2

## Référentiel
- Document source: *Méthodes de calcul des relais (GFNRBC / ER-MK, 06/09/2014)*.
- Méthodes couvertes:
  - Méthode mathématique (feuille p.10).
  - Méthode par approximation.
  - Vue abaque guidée.

## Formules principales
- `Pref_total = P_point_alim + J_total + Z_total`
- `Z_total = somme(dénivelés m) / 10`
- `J_total = somme(J_hm * L_hm)`
- `J_hm` dérivé du tableau pertes de charge, interpolation en `Q²`.
- `W = P_necessaire_pompes / P_total_nominale`
- `Pref_engin = P_nominale_engin * W`
- `Jmoy = (J_total + Z_total) / L_total_hm`
- `D = Pref_engin / Jmoy * 100`
- `nb_tuyaux = floor(D / 40)`

## Doctrine et arrondis
- `%W` recommandé:
  - Mission 1-2h: 70 à 80%
  - Mission 4-6h: 50 à 60%
- Pression engin: arrondie à la demi/unité supérieure.
- Espacement en tuyaux: arrondi inférieur.

## Source d'eau (V1 guidée)
- Le calcul hydraulique utilise `pressureEffectiveBar`.
- Les champs PI/aspiration déclenchent des alertes de cohérence:
  - PI direct: contrôle `Qmax PI` et `Q à 1 bar`.
  - PI avec engin: `Pstatique` requis.
  - Aspiration: hauteur/réserve contrôlées.

## Limites V1
- Pertes singulières non détaillées (régulières + dénivelé uniquement).
- Abaque guidé: réglage d’espacement global (pas d’édition libre point par point).
- Le verdict "relais nécessaire" est basé sur pression source effective + capacité pompes.
