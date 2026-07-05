import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useGameContext } from '../context/GameContext';
import SoundManager from '../utils/SoundManager';

// Domino logic
const createDeck = () => {
  let deck = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      deck.push({ id: `${i}-${j}`, values: [i, j] });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

export default function DominoesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { trackAction, addXp } = useGameContext();
  const [playerHand, setPlayerHand] = useState([]);
  const [aiHand, setAiHand] = useState([]);
  const [boneyard, setBoneyard] = useState([]);
  const [board, setBoard] = useState([]); // [{id, values: [a,b]}] in order
  const [turn, setTurn] = useState('player'); // 'player' | 'ai'
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [statusMsg, setStatusMsg] = useState('Sua vez!');

  useEffect(() => {
    startNewGame();
  }, []);

  const handleWin = () => {
    addXp(50);
    trackAction('win', 'DominoesGame');
    trackAction('play', 'any');
  };

  const startNewGame = () => {
    const deck = createDeck();
    setPlayerHand(deck.slice(0, 7));
    setAiHand(deck.slice(7, 14));
    setBoneyard(deck.slice(14));
    setBoard([]);
    setTurn('player');
    setIsGameOver(false);
    setWinner(null);
    setStatusMsg('Sua vez! Jogue qualquer peça para começar.');
  };

  const getPlayableEnds = (currentBoard) => {
    if (currentBoard.length === 0) return null; // Any piece can be played
    return {
      left: currentBoard[0].values[0],
      right: currentBoard[currentBoard.length - 1].values[1]
    };
  };

  const canPlay = (hand, currentBoard) => {
    if (currentBoard.length === 0) return true;
    const ends = getPlayableEnds(currentBoard);
    return hand.some(piece => 
      piece.values.includes(ends.left) || piece.values.includes(ends.right)
    );
  };

  const drawPiece = (currentHand, isPlayer) => {
    if (boneyard.length === 0) {
      return false; // Cannot draw
    }
    const piece = boneyard[0];
    setBoneyard(prev => prev.slice(1));
    if (isPlayer) {
      setPlayerHand(prev => [...prev, piece]);
      SoundManager.playFlip();
    } else {
      setAiHand(prev => [...prev, piece]);
    }
    return true;
  };

  const playPiece = (piece, isPlayer) => {
    if (turn !== (isPlayer ? 'player' : 'ai') || isGameOver) return;

    let newBoard = [...board];
    let played = false;

    if (newBoard.length === 0) {
      newBoard.push(piece);
      played = true;
    } else {
      const ends = getPlayableEnds(newBoard);
      
      if (piece.values.includes(ends.right)) {
        // Play on right
        if (piece.values[0] === ends.right) {
          newBoard.push(piece);
        } else {
          newBoard.push({ ...piece, values: [piece.values[1], piece.values[0]] }); // flip
        }
        played = true;
      } else if (piece.values.includes(ends.left)) {
        // Play on left
        if (piece.values[1] === ends.left) {
          newBoard.unshift(piece);
        } else {
          newBoard.unshift({ ...piece, values: [piece.values[1], piece.values[0]] }); // flip
        }
        played = true;
      }
    }

    if (played) {
      setBoard(newBoard);
      SoundManager.playPlace();
      
      if (isPlayer) {
        const newHand = playerHand.filter(p => p.id !== piece.id);
        setPlayerHand(newHand);
        checkWin(newHand, aiHand);
        if (!isGameOver && newHand.length > 0) {
          setTurn('ai');
          setStatusMsg('Turno da IA...');
        }
      } else {
        const newHand = aiHand.filter(p => p.id !== piece.id);
        setAiHand(newHand);
        checkWin(playerHand, newHand);
        if (!isGameOver && newHand.length > 0) {
          setTurn('player');
          setStatusMsg('Sua vez!');
        }
      }
    }
  };

  const handlePlayerDraw = () => {
    if (turn !== 'player' || isGameOver) return;
    
    if (canPlay(playerHand, board)) {
      setStatusMsg('Você tem peças jogáveis!');
      return;
    }

    if (boneyard.length > 0) {
      drawPiece(playerHand, true);
    } else {
      // Pass turn if boneyard empty
      setStatusMsg('Monte vazio. Você passou a vez.');
      setTurn('ai');
    }
  };

  useEffect(() => {
    if (turn === 'ai' && !isGameOver) {
      const aiTimer = setTimeout(() => {
        playAiTurn();
      }, 1000); // AI thinking delay
      return () => clearTimeout(aiTimer);
    }
  }, [turn, isGameOver]);

  const playAiTurn = () => {
    // 1. Try to play
    for (let piece of aiHand) {
      if (board.length === 0) {
        playPiece(piece, false);
        return;
      }
      const ends = getPlayableEnds(board);
      if (piece.values.includes(ends.left) || piece.values.includes(ends.right)) {
        playPiece(piece, false);
        return;
      }
    }

    // 2. Draw if possible
    if (boneyard.length > 0) {
      setStatusMsg('IA comprou uma peça...');
      drawPiece(aiHand, false);
      // Wait another sec to try again
      setTimeout(() => setTurn('ai_retry'), 500); 
    } else {
      // 3. Pass
      setStatusMsg('IA passou a vez.');
      setTurn('player');
    }
  };

  useEffect(() => {
    if (turn === 'ai_retry' && !isGameOver) {
      setTurn('ai'); // trigger AI effect again
    }
  }, [turn]);

  const checkWin = (pHand, aHand) => {
    if (pHand.length === 0) {
      setWinner('player');
      setIsGameOver(true);
      setStatusMsg('Você bateu!');
      SoundManager.playVictory();
      handleWin();
    } else if (aHand.length === 0) {
      setWinner('ai');
      setIsGameOver(true);
      setStatusMsg('A IA bateu!');
      SoundManager.playError();
      trackAction('play', 'any');
    } else if (boneyard.length === 0 && !canPlay(pHand, board) && !canPlay(aHand, board)) {
      // Game closed
      const pScore = pHand.reduce((acc, p) => acc + p.values[0] + p.values[1], 0);
      const aScore = aHand.reduce((acc, p) => acc + p.values[0] + p.values[1], 0);
      
      setIsGameOver(true);
      if (pScore < aScore) {
        setWinner('player');
        setStatusMsg(`Jogo Fechado! Você venceu (${pScore} vs ${aScore})`);
        SoundManager.playVictory();
        handleWin();
      } else if (aScore < pScore) {
        setWinner('ai');
        setStatusMsg(`Jogo Fechado! A IA venceu (${aScore} vs ${pScore})`);
        SoundManager.playError();
        trackAction('play', 'any');
      } else {
        setWinner('draw');
        setStatusMsg('Empate!');
        trackAction('play', 'any');
      }
    }
  };

  const renderDomino = (piece, isVertical = false) => {
    return (
      <View style={[styles.domino, isVertical && styles.dominoVertical]}>
        <View style={styles.dominoHalf}>
          <Text style={styles.dominoText}>{piece.values[0]}</Text>
        </View>
        <View style={[styles.dominoDivider, isVertical ? styles.dividerHorizontal : styles.dividerVertical]} />
        <View style={styles.dominoHalf}>
          <Text style={styles.dominoText}>{piece.values[1]}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>DOMINÓ</Text>
        <View style={{ width: 36 }} />
      </View>

      {winner === 'player' && (
        <ConfettiCannon 
          count={200} 
          origin={{x: 200, y: 0}} 
          fallSpeed={3000} 
          fadeOut={true} 
        />
      )}

      {/* AI Hand */}
      <View style={styles.aiHandContainer}>
        <Text style={styles.playerLabel}>Robô IA: {aiHand.length} peças</Text>
        <View style={styles.handRow}>
          {aiHand.map((_, i) => (
            <View key={i} style={[styles.dominoBack]} />
          ))}
        </View>
      </View>

      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>{statusMsg}</Text>
      </View>

      {/* Board */}
      <View style={styles.boardWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardScroll}>
          {board.map((piece, i) => (
            <View key={i} style={{ marginHorizontal: 2 }}>
              {renderDomino(piece, piece.values[0] === piece.values[1])}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Controls & Boneyard */}
      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={[styles.drawBtn, boneyard.length === 0 && { opacity: 0.5 }]} 
          onPress={handlePlayerDraw}
          disabled={turn !== 'player' || boneyard.length === 0}
        >
          <Text style={styles.drawBtnText}>COMPRAR ({boneyard.length})</Text>
        </TouchableOpacity>
        
        {turn === 'player' && !canPlay(playerHand, board) && boneyard.length === 0 && (
          <TouchableOpacity style={styles.passBtn} onPress={() => setTurn('ai')}>
          <TouchableOpacity style={styles.passBtn} onPress={() => { SoundManager.playPass(); setTurn('ai'); }}>
            <Text style={styles.passBtnText}>PASSAR</Text>
          </TouchableOpacity>
        )}
      </View>

      {winner === 'player' && <ConfettiCannon count={200} origin={{x: -10, y: 0}} fallSpeed={2500} fadeOut />}

      {/* Player Hand */}
      <View style={styles.playerHandContainer}>
        <Text style={styles.playerLabel}>Sua Mão</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <View style={styles.handRow}>
            {playerHand.map((piece, i) => {
              const playable = turn === 'player' && 
                (board.length === 0 || 
                 piece.values.includes(getPlayableEnds(board)?.left) || 
                 piece.values.includes(getPlayableEnds(board)?.right));
                 
              return (
                <TouchableOpacity 
                  key={i} 
                  onPress={() => playable && playPiece(piece, true)}
                  activeOpacity={0.8}
                  style={[!playable && turn === 'player' && { opacity: 0.5 }, { marginHorizontal: 4 }]}
                >
                  {renderDomino(piece, true)}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {isGameOver && (
        <View style={styles.victoryModal}>
          <Text style={styles.victoryTitle}>
            {winner === 'player' ? 'Você Venceu!' : winner === 'ai' ? 'IA Venceu!' : 'Empate!'}
          </Text>
          <Text style={styles.victoryDesc}>{statusMsg}</Text>
          <TouchableOpacity style={styles.playAgainBtn} onPress={startNewGame}>
            <Text style={styles.playAgainText}>NOVA PARTIDA</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#3b82f6',
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  aiHandContainer: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  playerLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  handRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusBanner: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  statusText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  boardWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  boardScroll: {
    alignItems: 'center',
    paddingHorizontal: 20,
    minWidth: '100%',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
  },
  drawBtn: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  drawBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  passBtn: {
    backgroundColor: '#991b1b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  passBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  playerHandContainer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  domino: {
    width: 60,
    height: 30,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  dominoVertical: {
    width: 30,
    height: 60,
    flexDirection: 'column',
  },
  dominoBack: {
    width: 15,
    height: 30,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    margin: 2,
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  dominoHalf: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dominoDivider: {
    backgroundColor: '#cbd5e1',
  },
  dividerVertical: {
    width: 1,
    height: '100%',
  },
  dividerHorizontal: {
    height: 1,
    width: '100%',
  },
  dominoText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  victoryModal: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#3b82f6',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  victoryTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
  },
  victoryDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  playAgainBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  playAgainText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
