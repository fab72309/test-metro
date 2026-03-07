import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export function useColorScheme() {
  const nativeColorScheme = useNativeColorScheme();
  const { theme } = useThemeContext();

  return theme ?? nativeColorScheme ?? 'light';
}
