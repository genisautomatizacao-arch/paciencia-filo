import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRandomPromise } from '../services/PromiseService';
import ShareWizardModal from '../components/ShareWizardModal';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [dailyPromise, setDailyPromise] = useState({ text: 'Carregando...', ref: '' });
  const [shareVisible, setShareVisible] = useState(false);

  useEffect(() => {
    setDailyPromise(getRandomPromise());
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>
            PACIÊNCIA <Text style={styles.highlight}>FILÓ</Text>
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>MOEDAS</Text>
              <Text style={styles.statValue}>1.250</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>VITÓRIAS</Text>
              <Text style={styles.statValue}>42</Text>
            </View>
          </View>
        </View>

        {/* ── Promise of the Day ── */}
        <View style={styles.promiseBanner}>
          <View style={styles.promiseHeaderRow}>
            <Text style={styles.promiseTitle}>✦  PROMESSA DO DIA  ✦</Text>
          </View>
          <Text style={styles.promiseText}>❝{dailyPromise.text}❞</Text>
          {dailyPromise.ref ? (
            <Text style={styles.promiseRef}>{dailyPromise.ref}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.promiseShareBtn}
            onPress={() => setShareVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.promiseShareBtnText}>📤  Compartilhar</Text>
          </TouchableOpacity>
        </View>

        {/* ── Games Section ── */}
        <Text style={styles.sectionTitle}>Escolha seu Jogo</Text>

        <TouchableOpacity style={styles.gameCard} activeOpacity={0.85}>
          <View style={styles.gameIconBox}>
            <Text style={styles.gameIcon}>🃏</Text>
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>Paciência Clássica</Text>
            <Text style={styles.gameDesc}>O jogo de cartas mais amado do mundo.</Text>
          </View>
          <View style={styles.playBtn}>
            <Text style={styles.playBtnText}>JOGAR</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gameCard} activeOpacity={0.85}>
          <View style={styles.gameIconBox}>
            <Text style={styles.gameIcon}>🁣</Text>
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>Dominó Bíblico</Text>
            <Text style={styles.gameDesc}>Novo: Jogue com peças e física real!</Text>
          </View>
          <View style={styles.playBtn}>
            <Text style={styles.playBtnText}>JOGAR</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gameCard, styles.gameCardDisabled]} activeOpacity={0.7}>
          <View style={[styles.gameIconBox, { opacity: 0.4 }]}>
            <Text style={styles.gameIcon}>🕷️</Text>
          </View>
          <View style={styles.gameInfo}>
            <Text style={[styles.gameName, { opacity: 0.5 }]}>Paciência Spider</Text>
            <Text style={[styles.gameDesc, { opacity: 0.4 }]}>Em breve: O desafio de 2 naipes.</Text>
          </View>
          <View style={[styles.playBtn, styles.playBtnDisabled]}>
            <Text style={[styles.playBtnText, { color: 'rgba(255,255,255,0.3)' }]}>EM BREVE</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* Share Modal */}
      <ShareWizardModal
        visible={shareVisible}
        promise={dailyPromise}
        onClose={() => setShareVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a3d2e' },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Header
  header: { marginBottom: 24, alignItems: 'center' },
  brandTitle: {
    fontSize: 26, fontWeight: '900', color: '#fff',
    letterSpacing: 2, marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  highlight: { color: '#d4af37' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14, paddingVertical: 10, paddingHorizontal: 24,
    gap: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
  },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 9, color: '#d4af37', fontWeight: 'bold', letterSpacing: 1, marginBottom: 3 },
  statValue: { fontSize: 20, color: '#fff', fontWeight: '900' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },

  // Promise Banner
  promiseBanner: {
    backgroundColor: 'rgba(10,50,35,0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.4)',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
  },
  promiseHeaderRow: { marginBottom: 12 },
  promiseTitle: {
    color: '#d4af37', fontWeight: '900',
    fontSize: 10, letterSpacing: 2,
    backgroundColor: 'rgba(212,175,55,0.1)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
  },
  promiseText: {
    color: '#fff', fontSize: 16, fontStyle: 'italic',
    textAlign: 'center', lineHeight: 24, marginBottom: 8,
  },
  promiseRef: { color: 'rgba(212,175,55,0.8)', fontSize: 12, fontWeight: '600', marginBottom: 16 },
  promiseShareBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)',
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 18,
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  promiseShareBtnText: { color: '#d4af37', fontWeight: 'bold', fontSize: 13 },

  // Games
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)', fontSize: 11,
    fontWeight: '900', letterSpacing: 2,
    marginBottom: 14, textTransform: 'uppercase',
  },
  gameCard: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  gameCardDisabled: { opacity: 0.6 },
  gameIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
  },
  gameIcon: { fontSize: 22 },
  gameInfo: { flex: 1, paddingRight: 10 },
  gameName: { color: '#d4af37', fontSize: 15, fontWeight: 'bold', marginBottom: 3 },
  gameDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  playBtn: {
    backgroundColor: '#d4af37', paddingVertical: 8,
    paddingHorizontal: 14, borderRadius: 10,
  },
  playBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  playBtnText: { color: '#000', fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
});
