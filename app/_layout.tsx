import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProviderCustom, useThemeContext } from '../context/ThemeContext';
import { PertesDeChargeTableProvider } from '../context/PertesDeChargeTableContext';
import { RelayProvider } from '../features/relay/store/relayStore';
import { EngineCatalogProvider } from '../features/relay/store/engineCatalogStore';
import { useThemeSync } from '../hooks/useThemeSync';
import { Colors } from '../constants/Colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function InnerRootLayout() {
  const { theme } = useThemeContext();
  const { width } = useWindowDimensions();
  const [loaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });
  const isWeb = Platform.OS === 'web';

  const horizontalPadding = isWeb ? 16 : 0;
  const availableWidth = Math.max(320, width - horizontalPadding * 2);
  const desktopTargetWidth = Math.round(width / 3);
  const frameWidth =
    isWeb && width >= 1024
      ? Math.min(availableWidth, Math.max(420, desktopTargetWidth))
      : availableWidth;

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
    <GestureHandlerRootView style={styles.gestureRoot}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <PertesDeChargeTableProvider>
          <EngineCatalogProvider>
            <RelayProvider>
              <View
                style={[
                  styles.shell,
                  { backgroundColor: Colors[theme].background },
                  isWeb && styles.shellWeb,
                ]}
              >
                <View style={[styles.frame, isWeb && { width: frameWidth }]}>
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="ValeursPerso" options={{ title: 'Valeurs personnalisées' }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </View>
              </View>
            </RelayProvider>
          </EngineCatalogProvider>
        </PertesDeChargeTableProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <InnerRootLayout />
    </ThemeProviderCustom>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  shell: {
    flex: 1,
  },
  shellWeb: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
  },
});
