import React, { useRef } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import GrandFeuxCalculator, { GrandFeuxCalculatorHandle } from '../../components/GrandFeuxCalculator';
import { useThemeContext } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function GrandsFeux() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const calculatorRef = useRef<GrandFeuxCalculatorHandle | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (calculatorRef.current && typeof calculatorRef.current.forceDefaultMode === 'function') {
        calculatorRef.current.forceDefaultMode();
      }
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#181A20' : '#fff' }]}>
      <ScreenHeader title="Dimensionnement moyens hydrauliques" icon="flame" />
      <GrandFeuxCalculator ref={calculatorRef} key="grands-feux" hideTitle />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
