import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useGameContext } from '../context/GameContext';

const GRID_SIZE = 10;
const WORDS_TO_FIND = ['AMOR', 'PAZ', 'FE', 'DEUS', 'LUZ'];

// Helper to fill grid with random letters
const getRandomLetter = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[Math.floor(Math.random() * letters.length)];
};

export default function WordSearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { trackAction, addXp } = useGameContext();
  const [grid, setGrid] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isVictory, setIsVictory] = useState(false);
  const gridLayout = useRef({ x: 0, y: 0, width: 0, height: 0 }).current;
  const cellSize = useRef(0);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    
    // Naive horizontal placement for simplicity in this quick implementation
    // In a real app, we'd use a robust algorithm for multi-directional placement
    let placements = [];
    
    WORDS_TO_FIND.forEach(word => {
      let placed = false;
      while (!placed) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * (GRID_SIZE - word.length + 1));
        
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          if (newGrid[row][col + i] !== '' && newGrid[row][col + i] !== word[i]) {
            canPlace = false;
            break;
          }
        }
        
        if (canPlace) {
          let cellCoords = [];
          for (let i = 0; i < word.length; i++) {
            newGrid[row][col + i] = word[i];
            cellCoords.push(`${row},${col + i}`);
          }
          placements.push({ word, coords: cellCoords });
          placed = true;
        }
      }
    });

    // Fill the rest
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = getRandomLetter();
        }
      }
    }

    setGrid(newGrid);
    setFoundWords([]);
    setSelectedCells([]);
    setIsVictory(false);
    // Note: We don't save placements strictly for checking, we check selected word string
  };

  const getCellFromCoordinates = (x, y) => {
    if (!cellSize.current) return null;
    const col = Math.floor((x - gridLayout.x) / cellSize.current);
    const row = Math.floor((y - gridLayout.y) / cellSize.current);
    
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return { row, col };
    }
    return null;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const cell = getCellFromCoordinates(e.nativeEvent.pageX, e.nativeEvent.pageY);
        if (cell) {
          setSelectedCells([`${cell.row},${cell.col}`]);
        }
      },
      onPanResponderMove: (e) => {
        const cell = getCellFromCoordinates(e.nativeEvent.pageX, e.nativeEvent.pageY);
        if (cell) {
          const coord = `${cell.row},${cell.col}`;
          // Only add if it's a neighbor to form a straight line
          // For simplicity in this naive port, just allow any continuous selection
          setSelectedCells(prev => {
            if (!prev.includes(coord)) {
              return [...prev, coord];
            }
            return prev;
          });
        }
      },
      onPanResponderRelease: () => {
        // Validate selection
        setSelectedCells(currentSelection => {
          if (currentSelection.length > 0) {
            const selectedWord = currentSelection.map(c => {
              const [r, col] = c.split(',').map(Number);
              return grid[r][col];
            }).join('');
            
            const reversedWord = selectedWord.split('').reverse().join('');

            let wordFound = false;
            let newFoundList = [...foundWords];

            if (WORDS_TO_FIND.includes(selectedWord) && !foundWords.includes(selectedWord)) {
              newFoundList = [...foundWords, selectedWord];
              wordFound = true;
            } else if (WORDS_TO_FIND.includes(reversedWord) && !foundWords.includes(reversedWord)) {
              newFoundList = [...foundWords, reversedWord];
              wordFound = true;
            }

            if (wordFound) {
              setFoundWords(newFoundList);
              if (newFoundList.length === WORDS_TO_FIND.length) {
                setIsVictory(true);
                addXp(20);
                trackAction('play', 'WordSearch');
                trackAction('play', 'any');
              }
            }
          }
          return []; // Clear selection after release
        });
      },
    })
  ).current;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CAÇA-PALAVRAS</Text>
        <View style={{ width: 36 }} />
      </View>

      {isVictory && (
        <ConfettiCannon 
          count={200} 
          origin={{x: 200, y: 0}} 
          fallSpeed={3000} 
          fadeOut={true} 
        />
      )}

      <View style={styles.wordsContainer}>
        {WORDS_TO_FIND.map(word => (
          <Text 
            key={word} 
            style={[styles.wordBadge, foundWords.includes(word) && styles.wordBadgeFound]}
          >
            {word}
          </Text>
        ))}
      </View>

      <View style={styles.gridWrapper}>
        <View 
          style={styles.grid}
          onLayout={(e) => {
            e.target.measure((x, y, width, height, pageX, pageY) => {
              gridLayout.x = pageX;
              gridLayout.y = pageY;
              gridLayout.width = width;
              gridLayout.height = height;
              cellSize.current = width / GRID_SIZE;
            });
          }}
          {...panResponder.panHandlers}
        >
          {grid.map((row, rIdx) => (
            <View key={`row-${rIdx}`} style={styles.row}>
              {row.map((letter, cIdx) => {
                const isSelected = selectedCells.includes(`${rIdx},${cIdx}`);
                // Simple visualization: we don't track which cells belong to which found word
                // in this basic port, we just highlight them if they are selected.
                return (
                  <View 
                    key={`cell-${rIdx}-${cIdx}`} 
                    style={[styles.cell, isSelected && styles.cellSelected]}
                  >
                    <Text style={[styles.letter, isSelected && styles.letterSelected]}>
                      {letter}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {isVictory && (
        <View style={styles.victoryModal}>
          <Text style={styles.victoryTitle}>Aleluia!</Text>
          <Text style={styles.victoryDesc}>Você encontrou todas as palavras.</Text>
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
    color: '#7c3aed',
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  wordBadge: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  wordBadgeFound: {
    color: '#fff',
    backgroundColor: '#7c3aed',
  },
  gridWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  grid: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.4)',
  },
  letter: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  letterSelected: {
    color: '#fff',
  },
  victoryModal: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#7c3aed',
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
    color: '#7c3aed',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
