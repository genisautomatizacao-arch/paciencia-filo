import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import SolitaireBoard from '../components/SolitaireBoard';
import MainMenuModal from '../components/MainMenuModal';

export default function GamesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [gameId, setGameId] = useState(1); // Used to force board remount and re-trigger animation

  return (
    <LinearGradient colors={['#064e3b', '#022c22', '#000000']} style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Game Board (handles its own HUD now) */}
      <View style={styles.boardArea}>
        <SolitaireBoard key={gameId} onMenuPress={() => setIsMenuVisible(true)} />
      </View>

      {/* Main Menu Modal Overlay */}
      <MainMenuModal 
        visible={isMenuVisible} 
        onNewGame={() => {
          setGameId(prev => prev + 1); // Triggers re-render and re-deals cards with animation
          setIsMenuVisible(false);
        }}
        onMiniGames={() => {
          setIsMenuVisible(false);
          navigation.navigate('MiniGamesHub');
        }}
        onClose={() => setIsMenuVisible(false)}
      />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boardArea: {
    flex: 1,
  }
});
