import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getRandomPromise } from '../services/PromiseService';
import ShareWizardModal from './ShareWizardModal';

export default function MainMenuModal({ visible, onNewGame, onMiniGames, onClose }) {
  const [dailyPromise, setDailyPromise] = useState({ text: 'Carregando...', ref: '' });
  const [isWizardVisible, setIsWizardVisible] = useState(false);

  // Draw a new promise whenever the modal becomes visible
  useEffect(() => {
    if (visible) {
      setDailyPromise(getRandomPromise());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        {/* Title */}
        <Text style={styles.title}>
          PACIÊNCIA{'\n'}
          <Text style={styles.highlight}>FILÓ</Text>
        </Text>

        {/* Avatar */}
        <Image 
          source={require('../../assets/filo-avatar.jpg')} 
          style={styles.avatar} 
          resizeMode="contain"
        />

        {/* Buttons Row */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={onNewGame}>
            <Text style={styles.btnText}>NOVO JOGO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={onMiniGames}>
            <Text style={styles.btnText}>MUNDO DA FILÓ</Text>
          </TouchableOpacity>
        </View>

        {/* Promessa do Dia */}
        <View style={styles.promiseBox}>
          <Text style={styles.promiseTitle}>Promessa do Dia</Text>
          <Text style={styles.promiseText}>"{dailyPromise.text}"</Text>
          {dailyPromise.ref ? <Text style={styles.promiseRef}>{dailyPromise.ref}</Text> : null}
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareBtn} onPress={() => setIsWizardVisible(true)}>
          <Text style={styles.shareBtnText}>COMPARTILHAR PROMESSA</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>v2.0.0 (Native)</Text>
      </View>

      <ShareWizardModal 
        visible={isWizardVisible} 
        promise={dailyPromise} 
        onClose={() => setIsWizardVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#0a3d2e',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 20,
  },
  highlight: {
    color: '#d4af37',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#d4af37',
    marginBottom: 25,
    backgroundColor: '#fff',
  },
  btnRow: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: 30,
    gap: 15, // Aumentei o gap para espaçar bem os botões verticalmente
  },
  outlineBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingVertical: 14, // Um pouco mais alto para facilitar o toque
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  promiseBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  promiseTitle: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  promiseText: {
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 4,
  },
  promiseRef: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  shareBtn: {
    backgroundColor: '#d4af37',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  shareBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  version: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
  }
});
