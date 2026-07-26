import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import GrandFeuxCalculator from '../../components/GrandFeuxCalculator';
import { useThemeContext } from '../../context/ThemeContext';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants/Colors';

export default function LiquidesInflammables() {
  const { theme } = useThemeContext();
  const palette = Colors[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScreenHeader title="Liquides inflammables" icon="flame" />
      <GrandFeuxCalculator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
