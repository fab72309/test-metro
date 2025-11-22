/**
 * Formate un nombre pour l'affichage :
 * - Utilise l'espace comme séparateur de milliers (ex: 1 000)
 * - Affiche les décimales uniquement si nécessaire (max 2)
 * - Supprime les zéros non significatifs (ex: 300.00 -> 300)
 */
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
