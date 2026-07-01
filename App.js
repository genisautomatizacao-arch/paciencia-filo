import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GamesScreen from './src/screens/GamesScreen';
import MiniGamesHubScreen from './src/screens/MiniGamesHubScreen';
import DominoesScreen from './src/screens/DominoesScreen';
import SplashScreen from './src/components/SplashScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  if (isSplashVisible) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0a3d2e" />
        <SplashScreen onFinish={() => setIsSplashVisible(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0a3d2e" />
      
      {/* App Content with Navigation */}
      <View style={styles.appContainer}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GamesScreen" component={GamesScreen} />
            <Stack.Screen name="MiniGamesHub" component={MiniGamesHubScreen} />
            <Stack.Screen name="DominoesGame" component={DominoesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>

      {/* Global Ad Banner (Extremo Fundo) */}
      <View style={styles.bannerContainer}>
        <Text style={styles.bannerText}>ANÚNCIO ADMOB (50px)</Text>
      </View>

    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
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
