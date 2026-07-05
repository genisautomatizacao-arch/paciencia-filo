import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Platform } from 'react-native';

import GamesScreen from './src/screens/GamesScreen';
import MiniGamesHubScreen from './src/screens/MiniGamesHubScreen';
import DominoesScreen from './src/screens/DominoesScreen';
import HangmanScreen from './src/screens/HangmanScreen';
import MemoryGameScreen from './src/screens/MemoryGameScreen';
import WordSearchScreen from './src/screens/WordSearchScreen';
import BlockPuzzleScreen from './src/screens/BlockPuzzleScreen';
import SlidingPuzzleScreen from './src/screens/SlidingPuzzleScreen';
import TetrisScreen from './src/screens/TetrisScreen';
import SplashScreen from './src/components/SplashScreen';
import { initAdMob, FiloBannerAd } from './src/services/AdMobService';

import { GameProvider } from './src/context/GameContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const [fontsLoaded] = useFonts({
    Outfit: Outfit_400Regular,
    OutfitBold: Outfit_700Bold,
  });

  React.useEffect(() => {
    initAdMob();
  }, []);

  if (isSplashVisible || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0a3d2e" />
        <SplashScreen onFinish={() => setIsSplashVisible(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <GameProvider>
      <SafeAreaProvider style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#0a3d2e" />
        
        {/* App Content with Navigation */}
        <View style={styles.appContainer}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="GamesScreen" component={GamesScreen} />
              <Stack.Screen name="MiniGamesHub" component={MiniGamesHubScreen} />
              <Stack.Screen name="DominoesGame" component={DominoesScreen} />
              <Stack.Screen name="HangmanGame" component={HangmanScreen} />
              <Stack.Screen name="MemoryGame" component={MemoryGameScreen} />
              <Stack.Screen name="WordSearch" component={WordSearchScreen} />
              <Stack.Screen name="BlockPuzzle" component={BlockPuzzleScreen} />
              <Stack.Screen name="SlidingPuzzle" component={SlidingPuzzleScreen} />
              <Stack.Screen name="TetrisGame" component={TetrisScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>

        {/* Global Ad Banner (Extremo Fundo) */}
        <View style={styles.bannerContainer}>
          <FiloBannerAd />
        </View>

      </SafeAreaProvider>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  appContainer: {
    flex: 1,
  },
  bannerContainer: {
    height: 50,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  bannerText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
