import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * Hook pour synchroniser le thème avec le DOM (web uniquement)
 * Garantit que le fond de page web correspond au thème de l'app
 */
export function useThemeSync() {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    useEffect(() => {
        if (Platform.OS === 'web') {
            // Applique le fond et la couleur de texte au body HTML
            const body = document.body;
            if (body) {
                body.style.backgroundColor = colors.background;
                body.style.color = colors.text;
                body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

                // Ajoute/retire la classe dark-mode pour les styles CSS
                if (theme === 'dark') {
                    body.classList.add('dark-mode');
                } else {
                    body.classList.remove('dark-mode');
                }

                // Nettoie au démontage
                return () => {
                    body.style.backgroundColor = '';
                    body.style.color = '';
                    body.classList.remove('dark-mode');
                };
            }
        }
    }, [theme, colors.background, colors.text]);

    return theme;
}
