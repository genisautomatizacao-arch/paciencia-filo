import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export default function ShareWizardModal({ visible, promise, onClose }) {
  const [step, setStep] = useState(1);
  const [bgStyle, setBgStyle] = useState('dark');
  const [format, setFormat] = useState('square');
  
  const viewShotRef = useRef();

  if (!visible) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleShare();
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            dialogTitle: 'Compartilhar Promessa',
            mimeType: 'image/jpeg',
          });
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // UI Renderers for the actual sticker image to be captured
  const renderSticker = () => {
    const isStory = format === 'story';
    const bgColors = {
      dark: '#111827',
      gold: '#D4AF37',
      emerald: '#064e3b'
    };

    return (
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
        <View style={[styles.stickerContainer, isStory ? styles.storySize : styles.squareSize, { backgroundColor: bgColors[bgStyle] }]}>
          <Text style={styles.stickerHeader}>PROMESSA DO DIA</Text>
          <View style={styles.stickerContent}>
            <Text style={styles.stickerText}>{promise.text}</Text>
            {promise.ref ? <Text style={styles.stickerRef}>{promise.ref}</Text> : null}
          </View>
          <View style={styles.stickerFooter}>
            <Text style={styles.stickerFooterText}>Paciência Filó 🃏</Text>
          </View>
        </View>
      </ViewShot>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Gerador de Figurinhas</Text>
          <Text style={styles.subtitle}>Passo {step} de 3</Text>

          <View style={styles.previewArea}>
            {renderSticker()}
          </View>

          <View style={styles.controlsArea}>
            {step === 1 && (
              <View>
                <Text style={styles.label}>Escolha o Fundo:</Text>
                <View style={styles.row}>
                  {['dark', 'gold', 'emerald'].map(bg => (
                    <TouchableOpacity key={bg} style={[styles.btn, bgStyle === bg && styles.btnActive]} onPress={() => setBgStyle(bg)}>
                      <Text style={styles.btnText}>{bg}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.label}>Escolha o Formato:</Text>
                <View style={styles.row}>
                  <TouchableOpacity style={[styles.btn, format === 'square' && styles.btnActive]} onPress={() => setFormat('square')}>
                    <Text style={styles.btnText}>Quadrado (Feed)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, format === 'story' && styles.btnActive]} onPress={() => setFormat('story')}>
                    <Text style={styles.btnText}>Story</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={styles.label}>Tudo pronto!</Text>
                <Text style={styles.labelSub}>Sua figurinha será gerada agora.</Text>
              </View>
            )}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnActionSecondary} onPress={() => step > 1 ? setStep(step - 1) : onClose()}>
              <Text style={styles.btnTextAction}>{step > 1 ? 'Voltar' : 'Cancelar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnActionPrimary} onPress={handleNext}>
              <Text style={styles.btnTextAction}>{step === 3 ? 'GERAR E COMPARTILHAR' : 'Avançar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '95%', backgroundColor: '#1F2937', borderRadius: 12, padding: 20 },
  title: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#aaa', textAlign: 'center', marginBottom: 20 },
  previewArea: { alignItems: 'center', marginBottom: 20, transform: [{ scale: 0.4 }], height: 300, overflow: 'visible' },
  stickerContainer: { justifyContent: 'space-between', padding: 40, alignItems: 'center' },
  squareSize: { width: 1080, height: 1080 },
  storySize: { width: 1080, height: 1920 },
  stickerHeader: { color: '#D4AF37', fontSize: 45, fontWeight: '900', letterSpacing: 4 },
  stickerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stickerText: { color: '#fff', fontSize: 60, textAlign: 'center', fontWeight: 'bold' },
  stickerRef: { color: '#D4AF37', fontSize: 45, marginTop: 40, fontWeight: '600' },
  stickerFooter: { backgroundColor: 'rgba(0,0,0,0.4)', width: '100%', padding: 40, alignItems: 'center' },
  stickerFooterText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  controlsArea: { height: 120, justifyContent: 'center' },
  label: { color: '#fff', fontSize: 16, marginBottom: 10, textAlign: 'center' },
  labelSub: { color: '#aaa', fontSize: 14, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  btn: { padding: 10, backgroundColor: '#374151', borderRadius: 6, minWidth: 80, alignItems: 'center' },
  btnActive: { backgroundColor: '#D4AF37' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btnActionSecondary: { padding: 15, flex: 1, marginRight: 10, backgroundColor: '#4B5563', borderRadius: 8, alignItems: 'center' },
  btnActionPrimary: { padding: 15, flex: 1, backgroundColor: '#D4AF37', borderRadius: 8, alignItems: 'center' },
  btnTextAction: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
