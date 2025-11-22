import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { ThemeProviderCustom, useThemeContext } from '../context/ThemeContext';
import { PertesDeChargeTableProvider } from '../context/PertesDeChargeTableContext';
import { useThemeSync } from '../hooks/useThemeSync';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function InnerRootLayout() {
  const { theme } = useThemeContext();
  const [loaded] = useFonts({});

  // Synchronise le thème avec le DOM (web uniquement)
  useThemeSync();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <PertesDeChargeTableProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="ValeursPerso" options={{ title: 'Valeurs personnalisées' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </PertesDeChargeTableProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <InnerRootLayout />
    </ThemeProviderCustom>
  );
}
