import { useState, useCallback } from 'react';

const SUITS = ['S', 'H', 'D', 'C'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function useSolitaire() {
  const [stock, setStock] = useState([]);
  const [waste, setWaste] = useState([]);
  const [foundations, setFoundations] = useState([[], [], [], []]);
  const [tableau, setTableau] = useState([[], [], [], [], [], [], []]);

  const dealNewGame = useCallback(() => {
    // 1. Create Deck
    let deck = [];
    SUITS.forEach(suit => {
      RANKS.forEach((rank, index) => {
        const color = (suit === 'H' || suit === 'D') ? 'red' : 'black';
        deck.push({
          id: `${rank}-${suit}`,
          suit,
          rank,
          color,
          value: index + 1,
          isFaceUp: false,
        });
      });
    });

    // 2. Shuffle (Fisher-Yates)
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // 3. Deal Tableau (7 columns)
    const newTableau = [[], [], [], [], [], [], []];
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = deck.pop();
        if (row === col) card.isFaceUp = true; // Top card is face up
        newTableau[col].push(card);
      }
    }

    setTableau(newTableau);
    setStock(deck);
    setWaste([]);
    setFoundations([[], [], [], []]);
    setSelectedCard(null);
  }, []);

  // --- TAP TO MOVE & SELECTION LOGIC ---
  const [selectedCard, setSelectedCard] = useState(null);

  const canMoveToFoundation = (card, fPile) => {
    if (fPile.length === 0) return card.value === 1; // Ace
    const topCard = fPile[fPile.length - 1];
    return topCard.suit === card.suit && topCard.value === card.value - 1;
  };

  const canMoveToTableau = (card, col) => {
    if (col.length === 0) return card.value === 13; // King
    const topCard = col[col.length - 1];
    return topCard.color !== card.color && topCard.value === card.value + 1;
  };

  // Auto-move a tapped card if possible
  const handleCardTap = useCallback((card, source) => {
    if (!card.isFaceUp) return;

    // 1. Try to move to Foundation
    for (let i = 0; i < 4; i++) {
      if (canMoveToFoundation(card, foundations[i])) {
        const newFoundations = [...foundations];
        newFoundations[i] = [...newFoundations[i], card];
        
        // Remove from source
        if (source.type === 'tableau') {
          const newTableau = [...tableau];
          newTableau[source.colIdx] = newTableau[source.colIdx].slice(0, -1);
          if (newTableau[source.colIdx].length > 0) {
            newTableau[source.colIdx][newTableau[source.colIdx].length - 1].isFaceUp = true;
          }
          setTableau(newTableau);
        } else if (source.type === 'waste') {
          setWaste(w => w.slice(0, -1));
        }
        setFoundations(newFoundations);
        setSelectedCard(null);
        return;
      }
    }

    // 2. Try to move to Tableau
    for (let i = 0; i < 7; i++) {
      if (canMoveToTableau(card, tableau[i])) {
        const newTableau = [...tableau];
        
        if (source.type === 'tableau') {
          // Move the stack
          const stack = newTableau[source.colIdx].slice(source.cardIdx);
          newTableau[i] = [...newTableau[i], ...stack];
          newTableau[source.colIdx] = newTableau[source.colIdx].slice(0, source.cardIdx);
          if (newTableau[source.colIdx].length > 0) {
            newTableau[source.colIdx][newTableau[source.colIdx].length - 1].isFaceUp = true;
          }
        } else if (source.type === 'waste') {
          newTableau[i] = [...newTableau[i], card];
          setWaste(w => w.slice(0, -1));
        }
        
        setTableau(newTableau);
        setSelectedCard(null);
        return;
      }
    }

    // 3. If cannot move automatically, toggle selection (Glow effect)
    setSelectedCard(prev => prev && prev.card.id === card.id ? null : { card, source });
  }, [foundations, tableau]);

  return {
    stock,
    waste,
    foundations,
    tableau,
    dealNewGame,
    selectedCard,
    handleCardTap
  };
}
