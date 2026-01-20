import React from 'react';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

console.log('App.tsx loaded - Platform:', Platform.OS);

function App(): React.JSX.Element {
  console.log('App component rendering');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <View style={styles.container}>
          {Platform.OS !== 'web' && <StatusBar barStyle="dark-content" />}
          <RootNavigator />
        </View>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
