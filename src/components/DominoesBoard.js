import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDominoes } from '../engine/useDominoes';
import DominoTile from './DominoTile';

export default function DominoesBoard() {
  const { playerHand, aiHand, dealNewGame } = useDominoes();

  useEffect(() => {
    dealNewGame();
  }, [dealNewGame]);

  return (
    <View style={styles.board}>
      {/* AI Hand (Hidden) */}
      <View style={styles.aiHand}>
        <Text style={styles.label}>Robô Adversário (IA)</Text>
        <View style={styles.handRow}>
          {aiHand.map((tile, i) => (
            <DominoTile key={`ai-${i}`} tile={tile} isHidden={true} />
          ))}
        </View>
      </View>

      {/* Board Area */}
      <View style={styles.playArea}>
        <Text style={styles.playAreaText}>Arraste as pedras para cá</Text>
      </View>

      {/* Player Hand */}
      <View style={styles.playerHand}>
        <Text style={styles.label}>Sua Mão</Text>
        <View style={styles.handRow}>
          {playerHand.map((tile) => (
            <DominoTile key={tile.id} tile={tile} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    backgroundColor: '#3b2f2f', // Dark wood table color
    padding: 10,
    justifyContent: 'space-between',
  },
  label: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  aiHand: {
    alignItems: 'center',
    marginTop: 20,
  },
  playerHand: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playArea: {
    flex: 1,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playAreaText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 16,
    fontStyle: 'italic',
  }
});
