import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import SoundManager from '../utils/SoundManager';
import { useGameContext } from '../context/GameContext';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = Math.floor((Dimensions.get('window').width - 40) / COLS);

const TETROMINOES = {
  0: { shape: [[0]], color: 'transparent' },
  I: { shape: [[1, 1, 1, 1]], color: '#38bdf8' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' },
  O: { shape: [[1, 1], [1, 1]], color: '#eab308' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' },
};

const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const rand = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOES[rand];
};

export default function TetrisScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { trackAction, addXp } = useGameContext();
  
  const [grid, setGrid] = useState(createEmptyGrid());
  const [player, setPlayer] = useState({ pos: { x: 0, y: 0 }, tetromino: TETROMINOES[0].shape, color: 'transparent' });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const dropTime = useRef(1000);
  const dropInterval = useRef(null);

  useEffect(() => {
    startNewGame();
    return () => clearInterval(dropInterval.current);
  }, []);

  function createEmptyGrid() {
    return Array.from(Array(ROWS), () => new Array(COLS).fill(0));
  }

  const startNewGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setGameOver(false);
    dropTime.current = 1000;
    resetPlayer();
    SoundManager.playFlip();
  };

  const resetPlayer = () => {
    const nextTetromino = randomTetromino();
    setPlayer({
      pos: { x: Math.floor(COLS / 2) - Math.floor(nextTetromino.shape[0].length / 2), y: 0 },
      tetromino: nextTetromino.shape,
      color: nextTetromino.color,
    });
  };

  // Collision detection
  const checkCollision = (tempPlayer, tempGrid) => {
    for (let y = 0; y < tempPlayer.tetromino.length; y += 1) {
      for (let x = 0; x < tempPlayer.tetromino[y].length; x += 1) {
        if (tempPlayer.tetromino[y][x] !== 0) {
          if (
            !tempGrid[y + tempPlayer.pos.y] ||
            tempGrid[y + tempPlayer.pos.y][x + tempPlayer.pos.x] === undefined ||
            tempGrid[y + tempPlayer.pos.y][x + tempPlayer.pos.x] !== 0
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const sweepRows = (currentGrid) => {
    let rowsCleared = 0;
    const newGrid = currentGrid.reduce((acc, row) => {
      if (row.findIndex(cell => cell === 0) === -1) {
        rowsCleared += 1;
        acc.unshift(new Array(COLS).fill(0));
      } else {
        acc.push(row);
      }
      return acc;
    }, []);

    if (rowsCleared > 0) {
      setScore(prev => prev + (rowsCleared * 100));
      SoundManager.playVictory();
    }
    return newGrid;
  };

  const drop = () => {
    if (gameOver) return;
    const nextPlayer = { ...player, pos: { ...player.pos, y: player.pos.y + 1 } };
    
    if (!checkCollision(nextPlayer, grid)) {
      setPlayer(nextPlayer);
    } else {
      if (player.pos.y < 1) {
        setGameOver(true);
        SoundManager.playError();
        return;
      }
      // Merge into grid
      const newGrid = [...grid.map(row => [...row])];
      for (let y = 0; y < player.tetromino.length; y++) {
        for (let x = 0; x < player.tetromino[y].length; x++) {
          if (player.tetromino[y][x] !== 0) {
            newGrid[y + player.pos.y][x + player.pos.x] = player.color;
          }
        }
      }
      SoundManager.playPlace();
      setGrid(sweepRows(newGrid));
      resetPlayer();
    }
  };

  useEffect(() => {
    if (!gameOver) {
      dropInterval.current = setInterval(drop, dropTime.current);
    }
    return () => clearInterval(dropInterval.current);
  }, [player, gameOver]);

  // Controls
  const moveHorizontal = (dir) => {
    if (gameOver) return;
    const nextPlayer = { ...player, pos: { ...player.pos, x: player.pos.x + dir } };
    if (!checkCollision(nextPlayer, grid)) {
      setPlayer(nextPlayer);
    }
  };

  const rotate = () => {
    if (gameOver) return;
    const rotatedTetromino = player.tetromino[0].map((_, index) =>
      player.tetromino.map(col => col[index]).reverse()
    );
    const nextPlayer = { ...player, tetromino: rotatedTetromino };
    if (!checkCollision(nextPlayer, grid)) {
      setPlayer(nextPlayer);
    }
  };

  const dropHard = () => {
    if (gameOver) return;
    let nextY = player.pos.y;
    while (!checkCollision({ ...player, pos: { ...player.pos, y: nextY + 1 } }, grid)) {
      nextY++;
    }
    setPlayer(prev => ({ ...prev, pos: { ...prev.pos, y: nextY } }));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderEnd: (e, gestureState) => {
      const { dx, dy } = gestureState;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20) moveHorizontal(1);
        else if (dx < -20) moveHorizontal(-1);
      } else {
        if (dy > 20) dropHard();
        else if (dy < -20) rotate();
      }
    }
  });

  // Render combined grid
  const displayGrid = grid.map(row => [...row]);
  for (let y = 0; y < player.tetromino.length; y++) {
    for (let x = 0; x < player.tetromino[y].length; x++) {
      if (player.tetromino[y][x] !== 0 && displayGrid[y + player.pos.y]) {
        displayGrid[y + player.pos.y][x + player.pos.x] = player.color;
      }
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>TETRIS FILÓ</Text>
        <Text style={styles.score}>{score}</Text>
      </View>

      <View style={styles.gameArea} {...panResponder.panHandlers}>
        <View style={styles.gridContainer}>
          {displayGrid.map((row, y) => (
            <View key={`row-${y}`} style={styles.row}>
              {row.map((cell, x) => (
                <View 
                  key={`cell-${y}-${x}`} 
                  style={[
                    styles.cell, 
                    cell !== 0 ? { backgroundColor: cell, borderColor: 'rgba(255,255,255,0.2)' } : {}
                  ]} 
                />
              ))}
            </View>
          ))}
        </View>

        {gameOver && (
          <View style={styles.gameOverOverlay}>
            <Text style={styles.gameOverText}>FIM DE JOGO!</Text>
            <TouchableOpacity style={styles.restartBtn} onPress={startNewGame}>
              <Text style={styles.restartText}>JOGAR NOVAMENTE</Text>
            </TouchableOpacity>
            <ConfettiCannon count={100} origin={{x: 200, y: 0}} fallSpeed={2000} fadeOut />
          </View>
        )}
      </View>

      <View style={styles.controlsHelp}>
        <Text style={styles.helpText}>Deslize ↔ para mover</Text>
        <Text style={styles.helpText}>Deslize ↑ para girar</Text>
        <Text style={styles.helpText}>Deslize ↓ para queda rápida</Text>
      </View>
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
    color: '#38bdf8',
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    color: '#ef4444',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restartBtn: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  restartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  controlsHelp: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  helpText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginVertical: 2,
  }
});
