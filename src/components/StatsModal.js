import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { loadStats } from '../services/StorageManager';

export default function StatsModal({ visible, onClose }) {
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    bestTime: null,
    bestScore: 0
  });

  useEffect(() => {
    if (visible) {
      loadStats().then(s => {
        if (s) setStats(s);
      });
    }
  }, [visible]);

  const formatTime = (secs) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Estatísticas</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Jogos Iniciados:</Text>
            <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Vitórias:</Text>
            <Text style={styles.statValue}>{stats.gamesWon}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Taxa de Vitória:</Text>
            <Text style={styles.statValue}>
              {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Melhor Tempo:</Text>
            <Text style={styles.statValue}>{formatTime(stats.bestTime)}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Recorde de Pontos:</Text>
            <Text style={styles.statValue}>{stats.bestScore}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  statLabel: {
    fontSize: 16,
    color: '#666'
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  button: {
    marginTop: 20,
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
