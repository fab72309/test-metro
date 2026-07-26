import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import FHLIApproach from './GrandFeux/FHLIApproach';

export interface GrandFeuxCalculatorHandle {
  forceDefaultMode: () => void;
}

function GrandFeuxCalculator() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <FHLIApproach />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 14, paddingBottom: 36 },
});

export default React.memo(GrandFeuxCalculator);
