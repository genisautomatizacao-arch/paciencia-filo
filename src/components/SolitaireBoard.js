import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSolitaire } from '../engine/useSolitaire';
import Card from './Card';

export default function SolitaireBoard() {
  const { stock, waste, foundations, tableau, dealNewGame, selectedCard, handleCardTap } = useSolitaire();

  // Deal a new game on mount
  useEffect(() => {
    dealNewGame();
  }, [dealNewGame]);

  // Calculate cumulative top position to fix vertical gaps
  const getCardTop = (col, currentIdx) => {
    let top = 0;
    for (let i = 0; i < currentIdx; i++) {
      top += col[i].isFaceUp ? 22 : 12;
    }
    return top;
  };

  return (
    <View style={styles.board}>
      {/* Top Row: Foundations & Stock/Waste */}
      <View style={styles.topRow}>
        <View style={styles.foundations}>
          {foundations.map((pile, idx) => (
            <View key={`f-${idx}`} style={styles.slot}>
              {pile.length > 0 && <Card card={pile[pile.length - 1]} index={idx} onTap={() => handleCardTap(pile[pile.length - 1], { type: 'foundation', colIdx: idx, cardIdx: pile.length - 1 })} isSelected={selectedCard && selectedCard.card.id === pile[pile.length - 1].id} />}
            </View>
          ))}
        </View>
        <View style={styles.spacer} />
        <View style={styles.waste}>
          <View style={styles.slot}>
            {waste.length > 0 && <Card card={waste[waste.length - 1]} index={4} onTap={() => handleCardTap(waste[waste.length - 1], { type: 'waste', colIdx: 0, cardIdx: waste.length - 1 })} isSelected={selectedCard && selectedCard.card.id === waste[waste.length - 1].id} />}
          </View>
        </View>
        <View style={styles.stock}>
          <TouchableOpacity style={styles.slot} onPress={() => {/* Handle draw */}}>
            {stock.length > 0 && <Card card={{ isFaceUp: false }} index={5} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tableau (7 Columns) */}
      <View style={styles.tableau}>
        {tableau.map((col, colIdx) => (
          <View key={`t-${colIdx}`} style={styles.column}>
            {col.length === 0 && <View style={styles.slot} />}
            {col.map((card, cardIdx) => (
              <View 
                key={card.id} 
                style={[
                  styles.tableauCard, 
                  { top: getCardTop(col, cardIdx) }
                ]}
              >
                <Card 
                  card={card} 
                  index={6 + colIdx * 5 + cardIdx} 
                  onTap={() => handleCardTap(card, { type: 'tableau', colIdx, cardIdx })}
                  isSelected={selectedCard && selectedCard.card.id === card.id}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    padding: 10,
    backgroundColor: '#0a3d2e', // Felt
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 30,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  foundations: {
    flexDirection: 'row',
    gap: 8,
  },
  spacer: {
    flex: 1,
  },
  waste: {
    marginRight: 8,
  },
  stock: {},
  slot: {
    width: 50,
    height: 75,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tableau: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  column: {
    width: 50,
    position: 'relative',
  },
  tableauCard: {
    position: 'absolute',
    left: 0,
    right: 0,
  }
});
