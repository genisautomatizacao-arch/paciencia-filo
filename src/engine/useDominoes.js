import { useState, useCallback } from 'react';

export function useDominoes() {
  const [playerHand, setPlayerHand] = useState([]);
  const [aiHand, setAiHand] = useState([]);
  const [boneyard, setBoneyard] = useState([]); // Cemitério/Monte (pedras restantes)
  const [board, setBoard] = useState([]); // Pedras jogadas na mesa

  const dealNewGame = useCallback(() => {
    // 1. Gerar as 28 pedras do Dominó Clássico (0|0 até 6|6)
    let tiles = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        tiles.push({
          id: `${i}-${j}`,
          left: i,
          right: j,
          isPlayed: false,
        });
      }
    }

    // 2. Embaralhar as pedras (Fisher-Yates)
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // 3. Distribuir 7 pedras para cada jogador
    const pHand = tiles.splice(0, 7);
    const aHand = tiles.splice(0, 7);
    
    // O que sobra vai para o monte (boneyard)
    setBoneyard(tiles);
    setPlayerHand(pHand);
    setAiHand(aHand);
    setBoard([]);
  }, []);

  return {
    playerHand,
    aiHand,
    boneyard,
    board,
    dealNewGame,
  };
}
