import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// TEMPORARY TEST COMPONENT - Replace App.tsx with this to test if React Native Web works

export default function App() {
  console.log('=== TEST APP LOADED ===');
  console.log('Platform:', Platform.OS);
  console.log('Platform Version:', Platform.Version);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ React Native Web is Working!</Text>
      <Text style={styles.info}>Platform: {Platform.OS}</Text>
      <Text style={styles.info}>If you see this, the basic setup works</Text>
      <View style={styles.box}>
        <Text style={styles.boxText}>Test Box</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00AA00',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  box: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  boxText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
