import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              The app encountered an error. Please check the details below:
            </Text>

            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Error:</Text>
              <Text style={styles.errorText}>
                {this.state.error?.toString()}
              </Text>
            </View>

            {this.state.errorInfo && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Stack Trace:</Text>
                <Text style={styles.errorText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
