import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Dimensions, ActivityIndicator, Animated, Image,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { supabase, BACKGROUNDS_BUCKET } from '../services/supabase';

const { width: W } = Dimensions.get('window');

// ── Temas de fundo (replicando os do app original)
const BG_THEMES = [
  { key: 'default', label: 'Padrão',   bg: '#0e5641', accent: '#d4af37', textColor: '#fff' },
  { key: 'dark',    label: 'Noite',    bg: '#0d1b2a', accent: '#5e9bff', textColor: '#fff' },
  { key: 'gold',    label: 'Ouro',     bg: '#3d2800', accent: '#FFD700', textColor: '#fff' },
  { key: 'wood',    label: 'Madeira',  bg: '#3b1f0a', accent: '#d4af37', textColor: '#f5deb3' },
  { key: 'purple',  label: 'Roxo',     bg: '#1a0a2e', accent: '#c084fc', textColor: '#fff' },
  { key: 'marble',  label: 'Mármore',  bg: '#f5f0eb', accent: '#8B6914', textColor: '#1a1a1a' },
];

// ── Fontes disponíveis
const FONTS = [
  { key: 'modern',  label: 'Moderno',  family: 'System' },
  { key: 'serif',   label: 'Clássico', family: 'Georgia' },
  { key: 'cursive', label: 'Cursivo',  family: 'Courier' },
];

// ── Posições do texto
const TEXT_POSITIONS = [
  { key: 'top',    label: 'Topo' },
  { key: 'center', label: 'Centro' },
  { key: 'bottom', label: 'Baixo' },
];

// ── Cores do texto
const TEXT_COLORS = ['#ffffff', '#FFD700', '#a8edcb', '#ffc0cb', '#d4af37'];

// ── Busca imagens do Supabase Storage (igual ao app original)
async function fetchCloudBackgrounds() {
  try {
    const { data, error } = await supabase.storage.from(BACKGROUNDS_BUCKET).list('');
    if (error || !data || data.length === 0) return [];

    const imageFiles = data
      .filter(f => /\.(jpg|jpeg|png|webp|jfif)$/i.test(f.name))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return imageFiles.map(f => ({
      key: f.name,
      label: f.name.replace(/\.[^.]+$/, '').slice(0, 8),
      url: supabase.storage.from(BACKGROUNDS_BUCKET).getPublicUrl(f.name).data.publicUrl,
      isCloud: true,
    }));
  } catch (e) {
    console.warn('[Share] Erro ao buscar fundos da nuvem:', e);
    return [];
  }
}

function PromiseSticker({ promise, theme, format, font, textPos, textColor, viewShotRef }) {
  const isStory = format === 'story';
  const w = isStory ? 200 : 260;
  const h = isStory ? 356 : 260;

  const justifyContent =
    textPos === 'top'    ? 'flex-start' :
    textPos === 'bottom' ? 'flex-end'   : 'center';

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: 'jpg', quality: 0.95 }}
      style={{ alignSelf: 'center' }}
    >
      <View style={[styles.stickerBase, { width: w, height: h, backgroundColor: theme.bg }]}>

        {/* Imagem de fundo da nuvem */}
        {theme.isCloud && theme.cloudUrl ? (
          <Image
            source={{ uri: theme.cloudUrl }}
            style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
            resizeMode="cover"
          />
        ) : null}

        {/* Overlay escuro para legibilidade (igual ao original) */}
        {theme.isCloud && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.42)', borderRadius: 12 }]} />
        )}
        {/* Corner decorations */}
        <Text style={[styles.corner, styles.cornerTL, { color: theme.accent }]}>✦</Text>
        <Text style={[styles.corner, styles.cornerTR, { color: theme.accent }]}>✦</Text>
        <Text style={[styles.corner, styles.cornerBL, { color: theme.accent }]}>✦</Text>
        <Text style={[styles.corner, styles.cornerBR, { color: theme.accent }]}>✦</Text>

        {/* Header */}
        <View style={styles.stickerHeader}>
          <View style={[styles.stickerLine, { backgroundColor: theme.accent }]} />
          <Text style={[styles.stickerTitle, { color: theme.accent, fontFamily: font.family }]}>
            PROMESSA DO DIA
          </Text>
          <View style={[styles.stickerLine, { backgroundColor: theme.accent }]} />
        </View>

        {/* Promise text */}
        <View style={[styles.stickerBody, { justifyContent }]}>
          <Text style={[styles.stickerQuote, { color: textColor, fontFamily: font.family }]}>
            ❝{promise?.text}❞
          </Text>
          {promise?.ref ? (
            <Text style={[styles.stickerRef, { color: theme.accent, fontFamily: font.family }]}>
              {promise.ref}
            </Text>
          ) : null}
        </View>

        {/* Footer */}
        <View style={[styles.stickerFooter, { borderTopColor: `${theme.accent}44` }]}>
          <Text style={[styles.stickerFooterText, { color: theme.textColor, opacity: 0.7 }]}>
            🃏 Paciência Filó
          </Text>
        </View>
      </View>
    </ViewShot>
  );
}

export default function ShareWizardModal({ visible, promise, onClose }) {
  const [step,          setStep]        = useState(1);
  const [theme,         setTheme]       = useState(BG_THEMES[0]);
  const [cloudBgs,      setCloudBgs]    = useState([]);
  const [loadingCloud,  setLoadingCloud]= useState(false);
  const [format,        setFormat]      = useState('square');
  const [font,          setFont]        = useState(FONTS[0]);
  const [textPos,       setTextPos]     = useState('center');
  const [textColor,     setTextColor]   = useState('#ffffff');
  const [sharing,       setSharing]     = useState(false);

  const viewShotRef = useRef();
  const slideAnim   = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      setStep(1);
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: false }).start();
      // Busca imagens da nuvem ao abrir (igual ao original)
      setLoadingCloud(true);
      fetchCloudBackgrounds().then(imgs => {
        setCloudBgs(imgs);
        setLoadingCloud(false);
      });
    } else {
      slideAnim.setValue(500);
    }
  }, [visible]);

  // Todas as opções de fundo = padrões locais + nuvem
  const allBgOptions = [
    ...BG_THEMES,
    ...cloudBgs.map(c => ({
      key:        c.key,
      label:      c.label,
      bg:         '#111',      // fallback enquanto imagem carrega
      accent:     '#d4af37',
      textColor:  '#fff',
      cloudUrl:   c.url,
      isCloud:    true,
    }))
  ];

  if (!visible) return null;

  const TOTAL_STEPS = 3;

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      Haptics.selectionAsync();
      setStep(step + 1);
    } else {
      handleShare();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      Haptics.selectionAsync();
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSharing(true);
    try {
      const uri = await viewShotRef.current.capture();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Compartilhar Promessa',
          mimeType: 'image/jpeg',
        });
      }
      onClose();
    } catch (e) {
      console.warn('Erro ao compartilhar:', e);
    } finally {
      setSharing(false);
    }
  };

  const stepTitles = [
    'Passo 1 de 3: Escolha o Fundo',
    'Passo 2 de 3: Escolha o Formato',
    'Passo 3 de 3: Ajuste o Estilo',
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>

          {/* ── Header ── */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Gerador de Figurinhas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Step indicator ── */}
          <View style={styles.dotsRow}>
            {[1, 2, 3].map(s => (
              <View
                key={s}
                style={[styles.dot, step === s && styles.dotActive]}
              />
            ))}
          </View>
          <Text style={styles.stepTitle}>{stepTitles[step - 1]}</Text>

          {/* ── Preview ── */}
          <View style={styles.previewArea}>
            <PromiseSticker
              promise={promise}
              theme={theme}
              format={format}
              font={font}
              textPos={textPos}
              textColor={textColor}
              viewShotRef={viewShotRef}
            />
          </View>

          {/* ── Controls per step ── */}
          <View style={styles.controls}>
            {/* STEP 1: Background */}
            {step === 1 && (
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatchRow}>
                  {allBgOptions.map(t => (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => { setTheme(t); Haptics.selectionAsync(); }}
                      style={[
                        styles.bgSwatch,
                        { backgroundColor: t.bg },
                        theme.key === t.key && styles.swatchActive,
                      ]}
                    >
                      {/* Cloud image preview */}
                      {t.isCloud && t.cloudUrl ? (
                        <Image
                          source={{ uri: t.cloudUrl }}
                          style={StyleSheet.absoluteFill}
                          borderRadius={10}
                        />
                      ) : null}
                      <Text style={[styles.swatchCheck, theme.key === t.key ? { opacity: 1 } : { opacity: 0 }]}>✓</Text>
                      <Text style={[styles.swatchLabel, { color: t.isCloud ? '#fff' : t.accent }]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                  {loadingCloud && (
                    <View style={styles.loadingBgSwatch}>
                      <ActivityIndicator color="#d4af37" size="small" />
                      <Text style={styles.loadingBgText}>Nuvem...</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            {/* STEP 2: Format */}
            {step === 2 && (
              <View style={styles.formatRow}>
                <TouchableOpacity
                  style={[styles.formatCard, format === 'square' && styles.formatCardActive]}
                  onPress={() => { setFormat('square'); Haptics.selectionAsync(); }}
                >
                  <View style={styles.formatIconSquare} />
                  <Text style={styles.formatLabel}>Quadrado</Text>
                  <Text style={styles.formatSub}>Feed (1:1)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.formatCard, format === 'story' && styles.formatCardActive]}
                  onPress={() => { setFormat('story'); Haptics.selectionAsync(); }}
                >
                  <View style={styles.formatIconStory} />
                  <Text style={styles.formatLabel}>Story</Text>
                  <Text style={styles.formatSub}>Vertical (9:16)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: Style */}
            {step === 3 && (
              <View style={styles.styleControls}>
                {/* Fonte */}
                <Text style={styles.controlLabel}>Fonte</Text>
                <View style={styles.chipRow}>
                  {FONTS.map(f => (
                    <TouchableOpacity
                      key={f.key}
                      style={[styles.chip, font.key === f.key && styles.chipActive]}
                      onPress={() => { setFont(f); Haptics.selectionAsync(); }}
                    >
                      <Text style={[styles.chipText, font.key === f.key && styles.chipTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Posição */}
                <Text style={styles.controlLabel}>Posição do Texto</Text>
                <View style={styles.chipRow}>
                  {TEXT_POSITIONS.map(p => (
                    <TouchableOpacity
                      key={p.key}
                      style={[styles.chip, textPos === p.key && styles.chipActive]}
                      onPress={() => { setTextPos(p.key); Haptics.selectionAsync(); }}
                    >
                      <Text style={[styles.chipText, textPos === p.key && styles.chipTextActive]}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Cor do texto */}
                <Text style={styles.controlLabel}>Cor do Texto</Text>
                <View style={styles.colorRow}>
                  {TEXT_COLORS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorDot, { backgroundColor: c }, textColor === c && styles.colorDotActive]}
                      onPress={() => { setTextColor(c); Haptics.selectionAsync(); }}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* ── Action Buttons ── */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnSecondary} onPress={handleBack}>
              <Text style={styles.btnSecondaryText}>{step > 1 ? 'Voltar' : 'Cancelar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleNext}
              disabled={sharing}
            >
              {sharing
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.btnPrimaryText}>
                    {step === TOTAL_STEPS ? 'GERAR E COMPARTILHAR' : 'Avançar →'}
                  </Text>
              }
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111d16',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    maxHeight: '90%',
  },

  // Header
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: '#d4af37', fontSize: 18, fontWeight: '900' },
  closeBtn: {
    width: 28, height: 28, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  closeIcon: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  // Dots
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { backgroundColor: '#d4af37', width: 20 },
  stepTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', marginBottom: 14, letterSpacing: 0.5 },

  // Preview
  previewArea: { alignItems: 'center', marginBottom: 16 },

  // Sticker
  stickerBase: {
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  corner: { position: 'absolute', fontSize: 12 },
  cornerTL: { top: 8, left: 8 },
  cornerTR: { top: 8, right: 8 },
  cornerBL: { bottom: 28, left: 8 },
  cornerBR: { bottom: 28, right: 8 },
  stickerHeader: { alignItems: 'center', gap: 5, marginBottom: 8 },
  stickerLine: { width: '70%', height: 1, opacity: 0.5 },
  stickerTitle: { fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  stickerBody: { flex: 1, paddingHorizontal: 4 },
  stickerQuote: { fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 18 },
  stickerRef: { fontSize: 9, fontStyle: 'italic', textAlign: 'center', marginTop: 6 },
  stickerFooter: {
    borderTopWidth: 1, paddingTop: 6,
    alignItems: 'center',
  },
  stickerFooterText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },

  // Controls
  controls: { minHeight: 100, marginBottom: 16 },

  // Step 1: BG swatches
  swatchRow: { gap: 10, paddingHorizontal: 4 },
  bgSwatch: {
    width: 80, height: 70, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  swatchActive: { borderColor: '#d4af37', borderWidth: 2.5 },
  swatchCheck: { fontSize: 18, color: '#fff', fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 3 },
  swatchLabel: { fontSize: 10, fontWeight: '900', marginTop: 4, textShadowColor: '#000', textShadowRadius: 2 },
  loadingBgSwatch: {
    width: 80, height: 70, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  loadingBgText: { color: 'rgba(255,255,255,0.4)', fontSize: 9 },

  // Step 2: Format
  formatRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', paddingTop: 8 },
  formatCard: {
    alignItems: 'center', padding: 16, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)', gap: 8,
  },
  formatCardActive: { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.08)' },
  formatIconSquare: { width: 60, height: 60, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  formatIconStory:  { width: 40, height: 60, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  formatLabel: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  formatSub:   { color: 'rgba(255,255,255,0.4)', fontSize: 11 },

  // Step 3: Style
  styleControls: { gap: 10 },
  controlLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  chipActive: { backgroundColor: '#d4af37', borderColor: '#d4af37' },
  chipText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 'bold' },
  chipTextActive: { color: '#000' },
  colorRow: { flexDirection: 'row', gap: 10 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: '#fff', transform: [{ scale: 1.2 }] },

  // Action buttons
  actionRow: { flexDirection: 'row', gap: 12 },
  btnSecondary: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  btnSecondaryText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnPrimary: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#d4af37', alignItems: 'center',
    shadowColor: '#d4af37', shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
  },
  btnPrimaryText: { color: '#000', fontWeight: '900', fontSize: 14 },
});
