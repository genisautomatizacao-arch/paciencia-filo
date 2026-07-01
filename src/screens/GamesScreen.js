import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SolitaireBoard from '../components/SolitaireBoard';
import GameHUD from '../components/GameHUD';
import MainMenuModal from '../components/MainMenuModal';

export default function GamesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [gameId, setGameId] = useState(1); // Used to force board remount and re-trigger animation

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Game Board */}
      <View style={styles.boardArea}>
        <SolitaireBoard key={gameId} />
      </View>

      {/* Game HUD (Bottom Bar) */}
      <GameHUD onMenuPress={() => setIsMenuVisible(true)} />

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

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a3d2e', // Default felt
  },
  boardArea: {
    flex: 1,
  }
});
