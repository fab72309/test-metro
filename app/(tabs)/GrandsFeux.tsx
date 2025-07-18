import React, { useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { Header } from '../../components/ui/Header';
import GrandFeuxCalculator, { GrandFeuxCalculatorHandle } from '../../components/GrandFeuxCalculator';
import { useThemeContext } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

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
      <View style={{zIndex:10, backgroundColor: isDark ? '#181A20' : '#fff', paddingHorizontal:0, paddingVertical:16, alignSelf: 'center'}}>
        <View style={{alignItems:'center', marginBottom:0, marginTop:10}}>
          <Text style={{color: isDark ? '#FF7043' : '#D32F2F', fontSize: 17, fontWeight: 'bold', marginVertical: 0, textAlign: 'center', letterSpacing: 0.2}}>Dimensionnement moyens hydrauliques</Text>
        </View>
      </View>
      <GrandFeuxCalculator ref={calculatorRef} key="grands-feux" hideTitle />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
