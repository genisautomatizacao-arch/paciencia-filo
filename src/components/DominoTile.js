import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';

export default function DominoTile({ tile, isHidden = false }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isHidden,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        Animated.spring(scale, { toValue: 1.1, useNativeDriver: false }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
    })
  ).current;

  if (!tile) return null;

  if (isHidden) {
    return (
      <View style={[styles.tile, styles.tileBack]}>
        <View style={styles.tileBackInner} />
      </View>
    );
  }

  // Render dots helper
  const renderDots = (count) => {
    return (
      <View style={styles.dotContainer}>
        <Text style={styles.dotText}>{count}</Text>
      </View>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.tile, 
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }] },
        { zIndex: pan.x._value !== 0 || pan.y._value !== 0 ? 100 : 1 }
      ]}
      {...panResponder.panHandlers}
    >
      {renderDots(tile.left)}
      <View style={styles.divider} />
      {renderDots(tile.right)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 40,
    height: 80,
    backgroundColor: '#fffff0', // Ivory white
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    marginHorizontal: 2,
  },
  tileBack: {
    backgroundColor: '#0a3d2e',
    borderColor: '#d4af37',
    borderWidth: 2,
  },
  tileBackInner: {
    flex: 1,
    width: '90%',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  divider: {
    width: '80%',
    height: 2,
    backgroundColor: '#333',
  },
  dotContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  }
});
