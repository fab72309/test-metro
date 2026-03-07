export interface ReleaseNote {
    version: string;
    date: string;
    changes: string[];
}

export const RELEASE_NOTES: ReleaseNote[] = [
    {
        version: 'v1.0.0',
        date: '07/03/2026',
        changes: [
            'Application préparée pour une première diffusion iPhone via TestFlight.',
            'Positionnement pédagogique clarifié pour l’aide au calcul et la formation.',
            'Ajout des pages publiques de support et de confidentialité pour la publication.',
        ],
    },
    {
        version: 'v0.3.2',
        date: '22/11/2025',
        changes: [
            '🎨 Standardisation des boutons et du mode sombre',
            '🐛 Correction écran blanc "Débit Max PEI"',
            '🔧 Refonte écran "Valeurs Personnalisées"',
        ],
    },
    {
        version: 'v0.3.1',
        date: '22/11/2025',
        changes: [
            '🔢 Formatage uniforme des nombres (1 000, 300, 12,5)',
            '💄 Titres uniformisés sur toutes les pages',
            '🐛 Correction affichage FHLI',
        ],
    },
    {
        version: 'v0.3.0',
        date: '22/11/2025',
        changes: [
            '🎨 Refonte complète UI/UX (Design System)',
            '✨ Ajout micro-animations et retours haptiques',
            '🌓 Mode sombre optimisé (OLED)',
            '📱 Amélioration responsive (Tablette/Web)',
        ],
    },
    {
        version: 'v0.2.0',
        date: '22/11/2025',
        changes: [
            '🔧 Refactoring majeur du calculateur Grand Feux',
            '✅ Ajout de tests unitaires',
            '🧹 Nettoyage de code et optimisations',
        ],
    },
];
