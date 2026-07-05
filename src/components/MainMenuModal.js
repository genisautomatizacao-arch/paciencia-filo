import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { getRandomPromise } from '../services/PromiseService';
import ShareWizardModal from './ShareWizardModal';

export default function MainMenuModal({ visible, onNewGame, onMiniGames, onClose }) {
  const [dailyPromise, setDailyPromise] = useState({ text: 'Carregando...', ref: '' });
  const [isWizardVisible, setIsWizardVisible]   = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      setDailyPromise(getRandomPromise());
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <BlurView intensity={70} tint="dark" style={styles.modalBox}>

        {/* ── Brand ── */}
        <Text style={styles.title}>
          PACIÊNCIA{'\n'}<Text style={styles.highlight}>FILÓ</Text>
        </Text>

        {/* ── Avatar ── */}
        <Image
          source={require('../../assets/filo-avatar.jpg')}
          style={styles.avatar}
          resizeMode="cover"
        />

        {/* ── Buttons ── */}
        <TouchableOpacity style={styles.primaryBtn} onPress={onNewGame}>
          <Text style={styles.primaryBtnText}>🃏  NOVO JOGO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={onMiniGames}>
          <Text style={styles.outlineBtnText}>🌟  MUNDO DA FILÓ</Text>
        </TouchableOpacity>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Promise of the Day ── */}
        <View style={styles.promiseBox}>
          <Text style={styles.promisePill}>✦  PROMESSA DO DIA  ✦</Text>
          <Text style={styles.promiseText}>❝{dailyPromise.text}❞</Text>
          {dailyPromise.ref ? (
            <Text style={styles.promiseRef}>{dailyPromise.ref}</Text>
          ) : null}
        </View>

        {/* ── Share ── */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => setIsWizardVisible(true)}
        >
          <Text style={styles.shareBtnText}>📤  Compartilhar esta Promessa</Text>
        </TouchableOpacity>

        {/* ── Version ── */}
        <Text style={styles.version}>v2.0.0 — Paciência Filó</Text>
      </BlurView>

      <ShareWizardModal
        visible={isWizardVisible}
        promise={dailyPromise}
        onClose={() => setIsWizardVisible(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBox: {
    width: '88%',
    backgroundColor: 'rgba(12, 56, 38, 0.4)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },

  // Brand
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 2,
    marginBottom: 18,
  },
  highlight: {
    color: '#f0e68c',
    fontSize: 44,
    fontFamily: 'OutfitBold',
  },

  // Avatar
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#d4af37',
    marginBottom: 24,
    backgroundColor: '#fff',
  },

  // Buttons
  primaryBtn: {
    width: '100%',
    backgroundColor: '#d4af37',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#d4af37',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#0c3826',
    fontSize: 16,
    fontFamily: 'OutfitBold',
    fontWeight: '700',
  },

  outlineBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d4af37',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  outlineBtnText: {
    color: '#d4af37',
    fontSize: 15,
    fontFamily: 'OutfitBold',
    fontWeight: '600',
  },

  // Divider
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.2)',
    marginVertical: 20,
  },

  // Promise
  promiseBox: { width: '100%', alignItems: 'center', marginBottom: 18 },
  title: {
    color: '#d4af37',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'OutfitBold',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  promisePill: {
    color: '#d4af37',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
    backgroundColor: 'rgba(212,175,55,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  promiseText: {
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  promiseRef: {
    color: 'rgba(212,175,55,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },

  // Share
  shareBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
    borderRadius: 14,
    paddingVertical: 11,
    backgroundColor: 'rgba(212,175,55,0.08)',
    marginBottom: 16,
  },
  shareBtnText: { color: '#d4af37', fontWeight: 'bold', fontSize: 13 },

  version: { color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 0.5 },
});
