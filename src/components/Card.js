import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Image } from 'react-native';
import * as Haptics from 'expo-haptics';

const SUIT_SYMBOLS = { 'S': '♠', 'H': '♥', 'D': '♦', 'C': '♣' };
const SUIT_COLORS  = { 'S': '#1a1a2e', 'H': '#c0392b', 'D': '#c0392b', 'C': '#1a1a2e' };
const RED_BG       = { 'H': true, 'D': true };

export default function Card({
  card,
  index = 0,
  isSelected,
  onTap,
  onDragStart,
  onDragRelease,
  disabled  = false,
  isDragging = false,
  stack = [],
  isFoundationSlot = false,
}) {
  const pan      = useRef(new Animated.ValueXY()).current;
  const scale    = useRef(new Animated.Value(1)).current;
  const shakeVal = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Glow pulse when selected/hint
  useEffect(() => {
    if (isSelected) {
      // Wiggle
      Animated.sequence([
        Animated.timing(shakeVal, { toValue:  6, duration: 55, useNativeDriver: false }),
        Animated.timing(shakeVal, { toValue: -6, duration: 55, useNativeDriver: false }),
        Animated.timing(shakeVal, { toValue:  6, duration: 55, useNativeDriver: false }),
        Animated.timing(shakeVal, { toValue:  0, duration: 55, useNativeDriver: false }),
      ]).start();
      // Pulsing glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
        ])
      ).start();
    } else {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [isSelected]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && card && card.isFaceUp,
      onMoveShouldSetPanResponder:  (_, g) =>
        !disabled && card && card.isFaceUp && (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6),

      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        pan.setOffset({ x: 0, y: 0 });
        pan.setValue({ x: 0, y: 0 });
        Animated.spring(scale, { toValue: 1.08, friction: 5, useNativeDriver: false }).start();
        if (onDragStart) onDragStart();
      },

      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),

      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: false }).start();

        if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) {
          pan.setValue({ x: 0, y: 0 });
          if (onTap) onTap();
        } else {
          const wasValid = onDragRelease ? onDragRelease(g.dx, g.dy) : false;
          if (!wasValid) {
            // Spring back + impact shake
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              tension: 45,
              useNativeDriver: false,
            }).start(() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Animated.sequence([
                Animated.timing(shakeVal, { toValue:  10, duration: 35, useNativeDriver: false }),
                Animated.timing(shakeVal, { toValue: -10, duration: 35, useNativeDriver: false }),
                Animated.timing(shakeVal, { toValue:   5, duration: 35, useNativeDriver: false }),
                Animated.timing(shakeVal, { toValue:   0, duration: 35, useNativeDriver: false }),
              ]).start();
            });
          } else {
            pan.setValue({ x: 0, y: 0 });
          }
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start();
        Animated.spring(pan,   { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        if (onDragRelease) onDragRelease(0, 0);
      },
    })
  ).current;

  // 3-D flip animation
  const flipAnim = useRef(
    new Animated.Value(card?.justDrawn ? 0 : card?.isFaceUp ? 1 : 0)
  ).current;

  useEffect(() => {
    if (card) {
      Animated.timing(flipAnim, {
        toValue: card.isFaceUp ? 1 : 0,
        duration: 320,
        useNativeDriver: false,
      }).start();
    }
  }, [card?.isFaceUp]);

  const frontRotateY = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'] });
  const backRotateY  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '180deg'] });

  if (!card) return null;

  const glowBorder = glowAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(212,175,55,0.4)', 'rgba(212,175,55,1)'] });

  const animatedStyle = isDragging ? {} : {
    transform: [
      { translateX: Animated.add(pan.x, shakeVal) },
      { translateY: pan.y },
      { scale },
    ],
    zIndex: (pan.x._value !== 0 || pan.y._value !== 0) ? 1000 : 1,
  };

  const handlers = (isDragging || disabled) ? {} : panResponder.panHandlers;
  const color     = SUIT_COLORS[card.suit] || '#000';
  const isRed     = RED_BG[card.suit];

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]} {...handlers}>

      {/* ─── BACK ─── */}
      <Animated.View style={[
        styles.card, styles.cardBack,
        { transform: [{ rotateY: backRotateY }] },
        { backfaceVisibility: 'hidden', position: 'absolute' },
      ]}>
        <Image source={require('../assets/card_back.jpg')} style={styles.cardImage} />
      </Animated.View>

      {/* ─── FRONT ─── */}
      <Animated.View style={[
        styles.card,
        isSelected && { borderColor: glowBorder, borderWidth: 2.5,
                        shadowColor: '#D4AF37', shadowOpacity: 0.9,
                        shadowRadius: 10, elevation: 12 },
        { transform: [{ rotateY: frontRotateY }] },
        { backfaceVisibility: 'hidden' },
      ]}>
        {/* Top-left rank+suit */}
        <View style={styles.cornerTop}>
          <Text style={[styles.rankText, { color }]}>{card.rank}</Text>
          <Text style={[styles.suitSmall, { color }]}>{SUIT_SYMBOLS[card.suit]}</Text>
        </View>

        {/* Center suit */}
        <View style={styles.suitCenter}>
          <Text style={[styles.suitLarge, { color, opacity: isRed ? 0.12 : 0.08 }]}>
            {SUIT_SYMBOLS[card.suit]}
          </Text>
        </View>

        {/* Bottom-right rank+suit (inverted) */}
        <View style={styles.cornerBottom}>
          <Text style={[styles.rankText, { color, transform: [{ rotate: '180deg' }] }]}>{card.rank}</Text>
          <Text style={[styles.suitSmall, { color, transform: [{ rotate: '180deg' }] }]}>{SUIT_SYMBOLS[card.suit]}</Text>
        </View>
      </Animated.View>

      {/* ─── STACKED cards (during drag) ─── */}
      {stack && stack.length > 1 && stack.slice(1).map((sc, i) => {
        const sc_color = SUIT_COLORS[sc.suit] || '#000';
        return (
          <View key={sc.id} style={[styles.card, styles.stackedCard, { top: (i + 1) * 26, zIndex: i + 1 }]}>
            <View style={styles.cornerTop}>
              <Text style={[styles.rankText, { color: sc_color }]}>{sc.rank}</Text>
              <Text style={[styles.suitSmall, { color: sc_color }]}>{SUIT_SYMBOLS[sc.suit]}</Text>
            </View>
            <View style={styles.suitCenter}>
              <Text style={[styles.suitLarge, { color: sc_color, opacity: 0.1 }]}>{SUIT_SYMBOLS[sc.suit]}</Text>
            </View>
          </View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 48,
    height: 72,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fafafa',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    overflow: 'hidden',
  },
  stackedCard: {
    backgroundColor: '#f5f5f5',
    borderColor: 'rgba(0,0,0,0.12)',
  },
  cardBack: {
    backgroundColor: '#1A2B4C',
    borderColor: '#8899bb',
    borderWidth: 1.5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    resizeMode: 'cover',
  },
  cornerTop: {
    position: 'absolute',
    top: 3,
    left: 4,
    alignItems: 'center',
  },
  cornerBottom: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 14,
  },
  suitSmall: {
    fontSize: 10,
    lineHeight: 11,
  },
  suitCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suitLarge: {
    fontSize: 38,
  },
});
