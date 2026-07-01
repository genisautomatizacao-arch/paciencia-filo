import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DominoesBoard from '../components/DominoesBoard';

export default function DominoesScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom Header for Game */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Dominó Bíblico</Text>
        <View style={{ width: 80 }} /> {/* Spacer to balance */}
      </View>

      <DominoesBoard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b2f2f', // Wood color for Dominoes background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backBtn: {
    padding: 10,
  },
  backIcon: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
