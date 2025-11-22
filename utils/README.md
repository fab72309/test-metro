# Utilitaires de Formatage

## `formatNumber()`

Fonction utilitaire pour formater les nombres de manière cohérente dans toute l'application.

### Utilisation

```typescript
import { formatNumber } from '@/utils/format';

// Exemples
formatNumber(1000);        // "1 000"
formatNumber(300.00);      // "300"
formatNumber(1234.56);     // "1 234,56"
formatNumber(123456.789);  // "123 456,79"
formatNumber(null);        // "-"
formatNumber(undefined);   // "-"
formatNumber('');          // "-"
```

### Caractéristiques

- **Locale française** : Utilise `fr-FR` pour le formatage
- **Séparateurs de milliers** : Espace comme séparateur (norme française)
- **Décimales intelligentes** : 
  - Enlève les `.00` inutiles
  - Maximum 2 décimales
  - Virgule comme séparateur décimal
- **Gestion des erreurs** : Retourne `-` pour les valeurs invalides

### Implémentation

La fonction utilise `Intl.NumberFormat` pour garantir un formatage conforme aux standards internationaux :

```typescript
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  
  if (isNaN(num)) return '-';

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(num);
}
```

### Où est-elle utilisée ?

Cette fonction est appliquée dans tous les écrans affichant des valeurs numériques :

- **GrandFeux** : `SurfaceApproach`, `FHLIApproach`, `PuissanceApproach`
- **Calculs** : `DebitMaxPEI`, `CalculEtablissement`, `CalculPertesDeCharge`
- **Accueil** : Écran principal avec calculateur de pertes de charge

### Pourquoi utiliser cette fonction ?

1. **Cohérence** : Garantit un formatage uniforme dans toute l'application
2. **Lisibilité** : Les séparateurs de milliers facilitent la lecture des grands nombres
3. **Professionnalisme** : Respect des normes françaises de formatage
4. **Maintenabilité** : Un seul point de modification pour changer le format
