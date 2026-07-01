import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';

const SUIT_SYMBOLS = { 'S': '♠', 'H': '♥', 'D': '♦', 'C': '♣' };

export default function Card({ card, index = 0, isSelected, onTap }) {
  const pan = useRef(new Animated.ValueXY()).current;
  
  // Single animation value for the complex entrance flip
  const enterVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 3D Flip Entrance (mimics drawFlip CSS from old app)
    Animated.timing(enterVal, {
      toValue: 1,
      duration: 350, // 0.35s from CSS
      delay: index * 60,
      useNativeDriver: false, // MUST BE FALSE to mix with pan.x (which is false)
    }).start();
  }, []);

  // Interpolations
  const entranceX = enterVal.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [800, 400, 0] // Flying from right
  });
  
  const entranceY = enterVal.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 0]
  });

  const enterScale = enterVal.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 1.1, 1]
  });

  const enterRotateY = enterVal.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-180deg', '-90deg', '0deg']
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => card && card.isFaceUp,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 }); // Fixes the drag jump!
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        
        // Detect Tap (if dx and dy are small)
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          if (onTap) onTap();
        }
      }
    })
  ).current;

  if (!card) return null;

  const animatedStyle = {
    transform: [
      { translateX: Animated.add(pan.x, entranceX) }, 
      { translateY: Animated.add(pan.y, entranceY) }, 
      { scale: enterScale },
      { rotateY: enterRotateY }
    ],
    zIndex: pan.x._value !== 0 || pan.y._value !== 0 ? 100 : 1
  };

  if (!card.isFaceUp) {
    return (
      <Animated.View style={[styles.card, styles.cardBack, animatedStyle]}>
        <View style={styles.cardBackInner} />
      </Animated.View>
    );
  }

  const color = card.color === 'red' ? '#e74c3c' : '#2c3e50';

  return (
    <Animated.View 
      style={[
        styles.card, 
        animatedStyle,
        isSelected && styles.selectedCard
      ]}
      {...panResponder.panHandlers}
    >
      <Text style={[styles.rank, { color }]}>{card.rank}</Text>
      <Text style={[styles.suit, { color }]}>{SUIT_SYMBOLS[card.suit]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 50,
    height: 75,
    backgroundColor: '#fff',
    borderRadius: 6, // Slightly rounder
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-between',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cardBack: {
    backgroundColor: '#1A2B4C', // Dark blue from screenshot
    borderColor: '#c0c0c0',     // Silver/White border
    borderWidth: 2,
    padding: 2,
  },
  cardBackInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#3A4B6C',
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  suit: {
    fontSize: 20,
    alignSelf: 'flex-end',
    lineHeight: 20,
  },
  selectedCard: {
    borderColor: '#D4AF37', // Gold glow
    borderWidth: 3,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  }
});
