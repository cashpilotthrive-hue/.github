import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crypto Mining Platform</Text>
      <Text style={styles.subtitle}>Mobile App Coming Soon</Text>
      <Text style={styles.text}>
        The mobile app is under development. Key features will include:
      </Text>
      <Text style={styles.listItem}>• Dashboard with real-time stats</Text>
      <Text style={styles.listItem}>• Wallet management</Text>
      <Text style={styles.listItem}>• Mining contract overview</Text>
      <Text style={styles.listItem}>• Withdrawal requests</Text>
      <Text style={styles.listItem}>• KYC document upload</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#3b82f6',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  listItem: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
});
