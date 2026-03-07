export interface ReleaseNote {
    version: string;
    date: string;
    changes: string[];
}

export const RELEASE_NOTES: ReleaseNote[] = [
    {
        version: 'v0.4.1-alpha',
        date: '07/03/2026',
        changes: [
            '🚒 Relais: alertes opérationnelles reconnectées au déroulé des phases',
            '📋 Ajout d’un récapitulatif opérationnel des moyens, tuyaux et consignes',
            '📱 Optimisation mobile de la modale de placement des moyens',
        ],
    },
    {
        version: 'v0.3.2-alpha',
        date: '22/11/2025',
        changes: [
            '🎨 Standardisation des boutons et du mode sombre',
            '🐛 Correction écran blanc "Débit Max PEI"',
            '🔧 Refonte écran "Valeurs Personnalisées"',
        ],
    },
    {
        version: 'v0.3.1-alpha',
        date: '22/11/2025',
        changes: [
            '🔢 Formatage uniforme des nombres (1 000, 300, 12,5)',
            '💄 Titres uniformisés sur toutes les pages',
            '🐛 Correction affichage FHLI',
        ],
    },
    {
        version: 'v0.3.0-alpha',
        date: '22/11/2025',
        changes: [
            '🎨 Refonte complète UI/UX (Design System)',
            '✨ Ajout micro-animations et retours haptiques',
            '🌓 Mode sombre optimisé (OLED)',
            '📱 Amélioration responsive (Tablette/Web)',
        ],
    },
    {
        version: 'v0.2.0-alpha',
        date: '22/11/2025',
        changes: [
            '🔧 Refactoring majeur du calculateur Grand Feux',
            '✅ Ajout de tests unitaires',
            '🧹 Nettoyage de code et optimisations',
        ],
    },
];
