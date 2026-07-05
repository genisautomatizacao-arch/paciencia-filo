import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import SoundManager from '../utils/SoundManager';

const GRID_SIZE = 8;
const EMPTY = null;

// Basic shapes (1 = block, 0 = empty)
const SHAPES = [
  [[1]], // 1x1
  [[1,1]], // 2x1
  [[1],[1]], // 1x2
  [[1,1],[1,1]], // 2x2
  [[1,1,1]], // 3x1
  [[1],[1],[1]], // 1x3
  [[1,1,1],[0,1,0]], // T
  [[1,1],[1,0]] // L
];

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

const getRandomShape = () => {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { shape, color, id: Math.random().toString() };
};

export default function BlockPuzzleScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const timersRef = useRef([]);
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(EMPTY)));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0); // streaks of clearing lines
  const [options, setOptions] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null); 

  useEffect(() => {
    startNewGame();
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const startNewGame = () => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(EMPTY)));
    setScore(0);
    setCombo(0);
    setOptions([getRandomShape(), getRandomShape(), getRandomShape()]);
    setIsGameOver(false);
    setSelectedOption(null);
  };

  const refillOptions = (currentOptions) => {
    if (currentOptions.every(o => o === null)) {
      setOptions([getRandomShape(), getRandomShape(), getRandomShape()]);
    } else {
      setOptions(currentOptions);
    }
  };

  const checkLines = (currentGrid) => {
    let linesCleared = 0;
    const newGrid = [...currentGrid.map(row => [...row])];

    // Check rows
    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r].every(cell => cell !== EMPTY)) {
        for (let c = 0; c < GRID_SIZE; c++) newGrid[r][c] = EMPTY;
        linesCleared++;
      }
    }

    // Check cols (naive, doesn't handle overlapping row/col perfectly in one pass without temporary arrays)
    for (let c = 0; c < GRID_SIZE; c++) {
      let full = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (currentGrid[r][c] === EMPTY) full = false;
      }
      if (full) {
        for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = EMPTY;
        linesCleared++;
      }
    }

    if (linesCleared > 0) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const comboMultiplier = 1 + (newCombo * 0.5);
      setScore(s => s + Math.floor(linesCleared * 100 * comboMultiplier));
      setGrid(newGrid);
      SoundManager.playVictory();
    } else {
      setCombo(0);
      SoundManager.playPlace();
    }
  };

  const canPlaceShapeAnywhere = (shape, currentGrid) => {
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;
    for (let r = 0; r <= GRID_SIZE - shapeRows; r++) {
      for (let c = 0; c <= GRID_SIZE - shapeCols; c++) {
        let fits = true;
        for (let i = 0; i < shapeRows; i++) {
          for (let j = 0; j < shapeCols; j++) {
            if (shape[i][j] === 1 && currentGrid[r + i][c + j] !== EMPTY) {
              fits = false;
            }
          }
        }
        if (fits) return true;
      }
    }
    return false;
  };

  const checkGameOver = (currentGrid, currentOptions) => {
    const activeOptions = currentOptions.filter(o => o !== null);
    if (activeOptions.length === 0) return;
    
    const anyFits = activeOptions.some(opt => canPlaceShapeAnywhere(opt.shape, currentGrid));
    if (!anyFits) {
      setIsGameOver(true);
      SoundManager.playError();
    }
  };

  const onCellTap = (r, c) => {
    if (selectedOption === null || options[selectedOption] === null || isGameOver) return;
    
    const { shape, color } = options[selectedOption];
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;

    // Check bounds
    if (r + shapeRows > GRID_SIZE || c + shapeCols > GRID_SIZE) {
      SoundManager.playError();
      return; 
    }

    // Check collisions
    let canPlace = true;
    for (let i = 0; i < shapeRows; i++) {
      for (let j = 0; j < shapeCols; j++) {
        if (shape[i][j] === 1 && grid[r + i][c + j] !== EMPTY) {
          canPlace = false;
        }
      }
    }

    if (!canPlace) {
      SoundManager.playError();
    }

    if (canPlace) {
      // Place
      const newGrid = [...grid.map(row => [...row])];
      for (let i = 0; i < shapeRows; i++) {
        for (let j = 0; j < shapeCols; j++) {
          if (shape[i][j] === 1) {
            newGrid[r + i][c + j] = color;
          }
        }
      }
      setGrid(newGrid);
      setScore(s => s + (shapeRows * shapeCols * 10));
      
      const newOptions = [...options];
      newOptions[selectedOption] = null;
      setSelectedOption(null);
      refillOptions(newOptions);

      // Defere checking lines
      const timer1 = setTimeout(() => {
        checkLines(newGrid);
        const timer2 = setTimeout(() => checkGameOver(newGrid, newOptions), 100);
        timersRef.current.push(timer2);
      }, 50);
      timersRef.current.push(timer1);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Text style={styles.title}>BLOCK FILÓ</Text>
          {combo > 1 && <Text style={{color:'#f59e0b', fontWeight:'bold', marginLeft: 10}}>🔥 {combo}x</Text>}
        </View>
        <Text style={styles.score}>{score}</Text>
      </View>

      {isGameOver && (
        <View style={{backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 10, alignItems: 'center'}}>
          <Text style={{color: '#ef4444', fontWeight: 'bold'}}>FIM DE JOGO!</Text>
          <TouchableOpacity onPress={startNewGame} style={{marginTop: 5, padding: 5, backgroundColor: '#ef4444', borderRadius: 5}}>
            <Text style={{color: '#fff'}}>JOGAR NOVAMENTE</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.boardWrapper}>
        <View style={styles.grid}>
          {grid.map((row, rIdx) => (
            <View key={`row-${rIdx}`} style={styles.row}>
              {row.map((cell, cIdx) => (
                <TouchableOpacity 
                  key={`cell-${rIdx}-${cIdx}`} 
                  style={[styles.cell, cell && { backgroundColor: cell, borderColor: 'rgba(255,255,255,0.2)' }]}
                  onPress={() => onCellTap(rIdx, cIdx)}
                  activeOpacity={0.9}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.instructions}>Selecione uma peça abaixo e toque no grid para colocar.</Text>

      <View style={styles.optionsContainer}>
        {options.map((opt, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={[styles.optionSlot, selectedOption === idx && styles.optionSelected]}
            onPress={() => opt && setSelectedOption(idx)}
          >
            {opt && (
              <View>
                {opt.shape.map((sRow, srIdx) => (
                  <View key={`sr-${srIdx}`} style={{ flexDirection: 'row' }}>
                    {sRow.map((val, scIdx) => (
                      <View 
                        key={`sc-${scIdx}`} 
                        style={[styles.miniCell, val === 1 ? { backgroundColor: opt.color } : { backgroundColor: 'transparent', borderColor: 'transparent' }]} 
                      />
                    ))}
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
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
    color: '#0d9488',
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  score: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  boardWrapper: {
    padding: 20,
    alignItems: 'center',
  },
  grid: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 2,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    margin: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
    borderRadius: 2,
  },
  instructions: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    height: 100,
  },
  optionSlot: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#0d9488',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  miniCell: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    margin: 1,
    borderRadius: 2,
  }
});
