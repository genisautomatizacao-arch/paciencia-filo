import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function GameHUD({ onMenuPress }) {
  return (
    <View style={styles.hudContainer}>
      <TouchableOpacity style={styles.hudBtn}>
        <Text style={styles.hudIcon}>↺</Text>
        <Text style={styles.hudLabel}>VOLTAR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.hudBtn}>
        <Text style={styles.hudIcon}>💡</Text>
        <Text style={styles.hudLabel}>DICA</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.hudBtn}>
        <Text style={styles.hudIcon}>⚡</Text>
        <Text style={styles.hudLabel}>CORINGA</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.hudBtn} onPress={onMenuPress}>
        <Text style={styles.hudIcon}>≡</Text>
        <Text style={styles.hudLabel}>MENU</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
  },
  hudBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  hudIcon: {
    fontSize: 20,
    color: '#d4af37',
    marginBottom: 2,
  },
  hudLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
  }
});
