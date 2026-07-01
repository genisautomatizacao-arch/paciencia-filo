import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Premium */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>PACIÊNCIA <Text style={styles.highlight}>FILÓ</Text></Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>MOEDAS</Text>
              <Text style={styles.statValue}>1.250</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>VITORIAS</Text>
              <Text style={styles.statValue}>42</Text>
            </View>
          </View>
        </View>

        {/* Banner do Dia */}
        <View style={styles.dailyBanner}>
          <Text style={styles.dailyTitle}>Promessa do Dia</Text>
          <Text style={styles.dailyText}>"O Senhor é o meu pastor, nada me faltará."</Text>
          <Text style={styles.dailyRef}>Salmos 23:1</Text>
        </View>

        {/* Lista de Jogos */}
        <Text style={styles.sectionTitle}>Escolha seu Jogo</Text>
        
        <TouchableOpacity style={styles.gameCard}>
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>Paciência Clássica</Text>
            <Text style={styles.gameDesc}>O jogo de cartas mais amado do mundo.</Text>
          </View>
          <View style={styles.playBtn}><Text style={styles.playBtnText}>JOGAR</Text></View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gameCard}>
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>Dominó Bíblico</Text>
            <Text style={styles.gameDesc}>Novo: Jogue com peças e física real!</Text>
          </View>
          <View style={styles.playBtn}><Text style={styles.playBtnText}>JOGAR</Text></View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gameCard}>
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>Paciência Spider</Text>
            <Text style={styles.gameDesc}>Em breve: O desafio de 2 naipes.</Text>
          </View>
          <View style={[styles.playBtn, {backgroundColor: 'rgba(255,255,255,0.1)'}]}>
            <Text style={[styles.playBtnText, {color: 'gray'}]}>EM BREVE</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a3d2e', // Felt green
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 15,
  },
  highlight: {
    color: '#d4af37', // Gold
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  statBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#d4af37',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  dailyBanner: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#d4af37',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  dailyTitle: {
    color: '#d4af37',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  dailyText: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  dailyRef: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  gameCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gameInfo: {
    flex: 1,
    paddingRight: 10,
  },
  gameName: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  playBtn: {
    backgroundColor: '#d4af37',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  playBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  }
});
