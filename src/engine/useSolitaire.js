import { useState, useCallback, useEffect, useMemo } from 'react';
import SoundManager from '../utils/SoundManager';

const SUITS = ['S', 'H', 'D', 'C'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function useSolitaire() {
  const [stock, setStock] = useState([]);
  const [waste, setWaste] = useState([]);
  const [foundations, setFoundations] = useState([[], [], [], []]);
  const [tableau, setTableau] = useState([[], [], [], [], [], [], []]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const dealNewGame = useCallback(() => {
    // ... logic remains the same
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

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const newTableau = [[], [], [], [], [], [], []];
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = deck.pop();
        if (row === col) card.isFaceUp = true;
        newTableau[col].push(card);
      }
    }

    setTableau(newTableau);
    setStock(deck);
    setWaste([]);
    setFoundations([[], [], [], []]);
    setSelectedCard(null);
    setHistory([]);
    setScore(0);
    setTimer(0);
    setIsPlaying(true);
  }, []);

  const canMoveToFoundation = (card, fPile) => {
    if (fPile.length === 0) return card.value === 1;
    const topCard = fPile[fPile.length - 1];
    return topCard.suit === card.suit && topCard.value === card.value - 1;
  };

  const canMoveToTableau = (card, col) => {
    if (col.length === 0) return card.value === 13;
    const topCard = col[col.length - 1];
    return topCard.color !== card.color && topCard.value === card.value + 1;
  };

  const recordMove = () => {
    setHistory(prev => {
      const newState = {
        foundations: JSON.parse(JSON.stringify(foundations)),
        tableau: JSON.parse(JSON.stringify(tableau)),
        waste: JSON.parse(JSON.stringify(waste)),
        stock: JSON.parse(JSON.stringify(stock))
      };
      const newHistory = [...prev, newState];
      if (newHistory.length > 15) return newHistory.slice(-15);
      return newHistory;
    });
  };

  const undoMove = useCallback(() => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setFoundations(lastState.foundations);
    setTableau(lastState.tableau);
    setWaste(lastState.waste);
    setStock(lastState.stock);
    setHistory(prev => prev.slice(0, -1));
    setSelectedCard(null);
  }, [history]);

  const handleCardTap = useCallback((card, source) => {
    if (source.type === 'stock') {
      recordMove();
      if (stock.length > 0) {
        const nextCard = { ...stock[stock.length - 1], isFaceUp: true, justDrawn: true };
        setWaste([...waste, nextCard]);
        setStock(stock.slice(0, -1));
      } else {
        // Recycle waste to stock
        const recycled = waste.map(c => ({ ...c, isFaceUp: false })).reverse();
        setStock(recycled);
        setWaste([]);
      }
      SoundManager.playFlip();
      return;
    }

    if (!card.isFaceUp) return;

    for (let i = 0; i < 4; i++) {
      if (canMoveToFoundation(card, foundations[i])) {
        const newFoundations = [...foundations];
        newFoundations[i] = [...newFoundations[i], card];
        const newTableau = [...tableau];
        let newWaste = [...waste];
        
        if (source.type === 'tableau') {
          newTableau[source.colIdx] = newTableau[source.colIdx].slice(0, -1);
          if (newTableau[source.colIdx].length > 0) {
            newTableau[source.colIdx][newTableau[source.colIdx].length - 1].isFaceUp = true;
          }
        } else if (source.type === 'waste') {
          newWaste = newWaste.slice(0, -1);
        }
        
        recordMove(); // Record before applying
        setFoundations(newFoundations);
        setTableau(newTableau);
        setWaste(newWaste);
        setSelectedCard(null);
        SoundManager.playSlide();
        return;
      }
    }

    for (let i = 0; i < 7; i++) {
      if (canMoveToTableau(card, tableau[i])) {
        const newTableau = [...tableau];
        let newWaste = [...waste];
        
        if (source.type === 'tableau') {
          const stack = newTableau[source.colIdx].slice(source.cardIdx);
          newTableau[i] = [...newTableau[i], ...stack];
          newTableau[source.colIdx] = newTableau[source.colIdx].slice(0, source.cardIdx);
          if (newTableau[source.colIdx].length > 0) {
            newTableau[source.colIdx][newTableau[source.colIdx].length - 1].isFaceUp = true;
          }
        } else if (source.type === 'waste') {
          newTableau[i] = [...newTableau[i], card];
          newWaste = newWaste.slice(0, -1);
        }
        
        recordMove(); // Record before applying
        setTableau(newTableau);
        setWaste(newWaste);
        setSelectedCard(null);
        SoundManager.playSlide();
        return;
      }
    }

    setSelectedCard(prev => prev && prev.card.id === card.id ? null : { card, source });
  }, [foundations, tableau, waste, stock]);

  const isVictory = foundations.every(pile => pile.length === 13);

  useEffect(() => {
    if (isVictory) {
      SoundManager.playVictory();
    }
  }, [isVictory]);

  const [hintCard, setHintCard] = useState(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPlaying && !isVictory) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
        if (timer > 0 && timer % 10 === 0) {
          setScore(s => Math.max(0, s - 2)); // -2 points every 10 seconds
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isVictory, timer]);

  const showHint = useCallback(() => {
    // Basic hint: check if any top card in tableau can move to foundation
    for (let col = 0; col < 7; col++) {
      if (tableau[col].length > 0) {
        const card = tableau[col][tableau[col].length - 1];
        if (card.isFaceUp) {
          for (let f = 0; f < 4; f++) {
            if (canMoveToFoundation(card, foundations[f])) {
              setHintCard(card.id);
              setTimeout(() => setHintCard(null), 2000);
              return;
            }
          }
        }
      }
    }
    // Check if waste can move to foundation
    if (waste.length > 0) {
      const card = waste[waste.length - 1];
      for (let f = 0; f < 4; f++) {
        if (canMoveToFoundation(card, foundations[f])) {
          setHintCard(card.id);
          setTimeout(() => setHintCard(null), 2000);
          return;
        }
      }
    }
    // Basic hint: check if any top card in tableau can move to another tableau
    for (let col = 0; col < 7; col++) {
      if (tableau[col].length > 0) {
        const card = tableau[col][tableau[col].length - 1];
        if (card.isFaceUp) {
          for (let t = 0; t < 7; t++) {
            if (t !== col && canMoveToTableau(card, tableau[t])) {
              setHintCard(card.id);
              setTimeout(() => setHintCard(null), 2000);
              return;
            }
          }
        }
      }
    }
    // Otherwise no hint found easily (could expand logic)
  }, [tableau, waste, foundations]);

  const canAutoFinish = useMemo(() => {
    if (stock.length > 0 || waste.length > 0) return false;
    return tableau.every(col => col.every(card => card.isFaceUp));
  }, [stock, waste, tableau]);

  const autoFinish = useCallback(() => {
    // Advanced: An interval that repeatedly moves cards to foundations
    // Since we don't have a complex state machine yet, let's just cheat and move all to foundations directly
    if (!canAutoFinish) return;
    
    // For now, let's just trigger a win immediately to simulate it
    // In a real app we'd animate this
    const newFoundations = [[], [], [], []];
    // This is a fake fast-forward
    SUITS.forEach((suit, i) => {
      RANKS.forEach((rank, v) => {
        newFoundations[i].push({ id: `${rank}-${suit}`, suit, rank, value: v + 1, isFaceUp: true });
      });
    });
    setTableau([[], [], [], [], [], [], []]);
    setFoundations(newFoundations);
  }, [canAutoFinish]);

  const handleDragDrop = useCallback((draggingState, target) => {
    const { card, source } = draggingState;
    
    if (target.type === 'auto_foundation' || target.type === 'foundation') {
      for (let i = 0; i < 4; i++) {
        // If specific target provided, try only that one, otherwise try all
        if (target.type === 'foundation' && target.colIdx !== undefined && target.colIdx !== i) continue;
        
        if (canMoveToFoundation(card, foundations[i])) {
          // If trying to move multiple cards to foundation, reject (can only move 1)
          if (draggingState.cards && draggingState.cards.length > 1) return false;

          const newFoundations = [...foundations];
          newFoundations[i] = [...newFoundations[i], card];
          const newTableau = [...tableau];
          let newWaste = [...waste];
          
          if (source.type === 'tableau') {
            newTableau[source.colIdx] = newTableau[source.colIdx].slice(0, -1);
            if (newTableau[source.colIdx].length > 0) {
              newTableau[source.colIdx][newTableau[source.colIdx].length - 1].isFaceUp = true;
            }
          } else if (source.type === 'waste') {
            newWaste = newWaste.slice(0, -1);
          }
          
          recordMove();
          setTableau(newTableau);
          setWaste(newWaste);
          setFoundations(newFoundations);
          SoundManager.playSlide();
          return true;
        }
      }
    } else if (target.type === 'tableau') {
      const i = target.colIdx;
      if (canMoveToTableau(card, tableau[i])) {
        const newTableau = [...tableau];
        let newWaste = [...waste];
        
        if (source.type === 'tableau') {
          const stack = newTableau[source.colIdx].slice(source.cardIdx);
          newTableau[i] = [...newTableau[i], ...stack];
          newTableau[source.colIdx] = newTableau[source.colIdx].slice(0, source.cardIdx);
          if (newTableau[source.colIdx].length > 0) {
            newTableau[source.colIdx][newTableau[source.colIdx].length - 1].isFaceUp = true;
          }
        } else if (source.type === 'waste') {
          newTableau[i] = [...newTableau[i], card];
          newWaste = newWaste.slice(0, -1);
        }
        
        recordMove();
        setTableau(newTableau);
        setWaste(newWaste);
        SoundManager.playSlide();
        return true;
      }
    }
    
    // Se chegou até aqui, a jogada não foi válida
    SoundManager.playError();
    return false;
  }, [foundations, tableau, waste, stock]);

  return {
    stock,
    waste,
    foundations,
    tableau,
    dealNewGame,
    selectedCard,
    handleCardTap,
    handleDragDrop,
    isVictory,
    undoMove,
    canUndo: history.length > 0,
    moves: history.length,
    hintCard,
    showHint,
    score,
    timer,
    isPlaying,
    setIsPlaying,
    canAutoFinish,
    autoFinish
  };
}
