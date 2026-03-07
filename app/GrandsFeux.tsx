import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GrandFeuxCalculator from '../components/GrandFeuxCalculator';
import { useThemeContext } from '../context/ThemeContext';

export default function GrandsFeux() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#181A20' : '#fff' }]}>
      {/* 🚩 DEBUG : GrandsFeux screen loaded */}
      <Text style={{ color: 'blue', textAlign: 'center', marginVertical: 8 }}>
        🚩 DEBUG : GrandsFeux loaded
      </Text>
      <View style={{ zIndex: 10, backgroundColor: isDark ? '#181A20' : '#fff', paddingHorizontal: 0, paddingVertical: 16, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, marginTop: 10 }}>
          <Ionicons name="flame" size={26} color={isDark ? '#64B5F6' : '#1976D2'} style={{ marginRight: 6 }} />
          <Text style={{ color: isDark ? '#64B5F6' : '#1976D2', fontSize: 23, fontWeight: 'bold', marginVertical: 0, textAlign: 'left', letterSpacing: 0.2 }}>Grands feux</Text>
        </View>
      </View>
      <GrandFeuxCalculator key="grands-feux" hideTitle />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
