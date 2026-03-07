import React, { useRef } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import GrandFeuxCalculator, { GrandFeuxCalculatorHandle } from '../../components/GrandFeuxCalculator';
import { useThemeContext } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants/Colors';

export default function GrandsFeux() {
  const { theme } = useThemeContext();
  const palette = Colors[theme];
  const calculatorRef = useRef<GrandFeuxCalculatorHandle | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (calculatorRef.current && typeof calculatorRef.current.forceDefaultMode === 'function') {
        calculatorRef.current.forceDefaultMode();
      }
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScreenHeader title="Dimensionnement hydraulique" icon="flame" />
      <GrandFeuxCalculator ref={calculatorRef} key="grands-feux" hideTitle />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
