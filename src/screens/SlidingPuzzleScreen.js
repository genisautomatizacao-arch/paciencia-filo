import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useGameContext } from '../context/GameContext';
import SoundManager from '../utils/SoundManager';

// Removed hardcoded GRID_SIZE

export default function SlidingPuzzleScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { trackAction, addXp } = useGameContext();
  
  const [gridSize, setGridSize] = useState(3);
  const numTiles = gridSize * gridSize;
  const emptyIndex = numTiles - 1;

  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isVictory, setIsVictory] = useState(false);

  useEffect(() => {
    startNewGame();
  }, [gridSize]);

  const handleWin = () => {
    SoundManager.playVictory();
    addXp(40);
    trackAction('play', 'SlidingPuzzle');
    trackAction('play', 'any');
  };

  const getInversions = (arr) => {
    let inversions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] !== emptyIndex && arr[j] !== emptyIndex && arr[i] > arr[j]) {
          inversions++;
        }
      }
    }
    return inversions;
  };

  const isSolvable = (arr) => {
    const inversions = getInversions(arr);
    return inversions % 2 === 0;
  };

  const startNewGame = () => {
    let newTiles = Array.from({ length: numTiles }, (_, i) => i);
    
    do {
      for (let i = newTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
      }
    } while (!isSolvable(newTiles) || isSolved(newTiles));

    setTiles(newTiles);
    setMoves(0);
    setIsVictory(false);
  };

  const isSolved = (currentTiles) => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i] !== i) return false;
    }
    return true;
  };

  const moveTile = (index) => {
    const currentEmpty = tiles.indexOf(emptyIndex);
    const tileRow = Math.floor(index / gridSize);
    const tileCol = index % gridSize;
    const emptyRow = Math.floor(currentEmpty / gridSize);
    const emptyCol = currentEmpty % gridSize;

    const isAdjacent = 
      (Math.abs(tileRow - emptyRow) === 1 && tileCol === emptyCol) ||
      (Math.abs(tileCol - emptyCol) === 1 && tileRow === emptyRow);

    if (isAdjacent) {
      SoundManager.playSlide();

      const newTiles = [...tiles];
      newTiles[currentEmpty] = newTiles[index];
      newTiles[index] = emptyIndex;
      
      setTiles(newTiles);
      setMoves(m => m + 1);

      if (isSolved(newTiles)) {
        setIsVictory(true);
        handleWin();
      }
    } else {
      SoundManager.playError();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>QUEBRA-CABEÇA</Text>
        <Text style={styles.moves}>Movimentos: {moves}</Text>
      </View>

      <View style={{flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 15, marginBottom: 5}}>
        {[3,4,5].map(size => (
          <TouchableOpacity 
            key={size}
            style={[styles.diffBtn, gridSize === size && styles.diffBtnActive]}
            onPress={() => setGridSize(size)}
          >
            <Text style={[styles.diffText, gridSize === size && styles.diffTextActive]}>{size}x{size}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isVictory && (
        <ConfettiCannon 
          count={200} 
          origin={{x: 200, y: 0}} 
          fallSpeed={3000} 
          fadeOut={true} 
        />
      )}

      <View style={styles.boardWrapper}>
        <View style={styles.board}>
          {tiles.map((tileValue, index) => {
            const isEmptyTile = tileValue === emptyIndex;
            const row = Math.floor(tileValue / gridSize);
            const col = tileValue % gridSize;
            
            const tileSize = boardSize / gridSize;
            
            return (
              <TouchableOpacity
                key={`tile-${index}`}
                style={[styles.tile, { width: tileSize, height: tileSize }, isEmptyTile && styles.emptyTile]}
                onPress={() => !isVictory && moveTile(index)}
                activeOpacity={isEmptyTile ? 1 : 0.8}
              >
                {!isEmptyTile && (
                  <View style={styles.tileInner}>
                    <Image 
                      source={require('../assets/sliding_puzzle.jpg')} 
                      style={[
                        styles.tileImage, 
                        { transform: [{ translateX: -col * tileSize }, { translateY: -row * tileSize }] }
                      ]} 
                    />
                    <View style={styles.tileOverlay}>
                      <Text style={styles.tileText}>{tileValue + 1}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isVictory && (
        <View style={styles.victoryModal}>
          <Text style={styles.victoryTitle}>Parabéns!</Text>
          <Text style={styles.victoryDesc}>Você montou o quebra-cabeça.</Text>
          <TouchableOpacity style={styles.playAgainBtn} onPress={startNewGame}>
            <Text style={styles.playAgainText}>JOGAR NOVAMENTE</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const windowWidth = Dimensions.get('window').width;
const boardSize = windowWidth - 40;

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
    color: '#d97706',
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d97706',
  },
  moves: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  boardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: boardSize,
    height: boardSize,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tile: {
    padding: 2,
  },
  emptyTile: {
    backgroundColor: 'transparent',
  },
  tileInner: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f59e0b',
    overflow: 'hidden',
  },
  tileImage: {
    position: 'absolute',
    width: boardSize,
    height: boardSize,
  },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  victoryModal: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#d97706',
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
    color: '#fff',
    fontWeight: 'bold',
  },
  diffBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  diffBtnActive: {
    backgroundColor: '#d97706',
  },
  diffText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
  },
  diffTextActive: {
    color: '#fff',
  }
});
