import { useThemeContext } from '@/context/ThemeContext';

/**
 * Le thème web doit suivre la préférence de l'application,
 * pas uniquement la préférence système du navigateur.
 */
export function useColorScheme() {
  const { theme } = useThemeContext();
  return theme ?? 'light';
}
