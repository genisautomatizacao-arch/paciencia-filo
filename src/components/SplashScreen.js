import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

export default function SplashScreen({ onFinish }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 100,
      duration: 2500, // 2.5 seconds loading
      useNativeDriver: false,
    }).start(() => {
      if (onFinish) onFinish();
    });
  }, [progress, onFinish]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          PACIÊNCIA{'\n'}
          <Text style={styles.highlight}>FILÓ</Text>
        </Text>
        
        <Image 
          source={require('../../assets/filo-avatar.jpg')} 
          style={styles.avatar} 
          resizeMode="contain"
        />

        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a3d2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 45,
    marginBottom: 40,
  },
  highlight: {
    color: '#d4af37',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#d4af37',
    marginBottom: 50,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    width: '70%',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 10,
  },
  track: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fill: {
    height: '100%',
    backgroundColor: '#d4af37',
    borderRadius: 4,
  }
});
