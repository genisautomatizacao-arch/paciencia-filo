import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SoundManager from '../utils/SoundManager';
import ConfettiCannon from 'react-native-confetti-cannon';

const WORD_CATEGORIES = {
  'Cartas e Jogos': [
    { word: 'PACIENCIA', hint: 'Nosso jogo principal' },
    { word: 'BARALHO', hint: 'Conjunto de cartas' },
    { word: 'CORINGA', hint: 'A carta especial' },
    { word: 'ESPADAS', hint: 'Um dos naipes pretos' },
    { word: 'COPAS', hint: 'Um dos naipes vermelhos' },
    { word: 'OUROS', hint: 'Naipe valioso' },
    { word: 'PAUS', hint: 'Naipe de árvore' },
    { word: 'CASSINO', hint: 'Lugar de apostas' },
    { word: 'TETRIS', hint: 'Jogo de blocos caindo' },
    { word: 'DOMINO', hint: 'Peças com pontos' },
    { word: 'MEMORIA', hint: 'Jogo de encontrar pares' }
  ],
  'Tecnologia': [
    { word: 'NAVEGADOR', hint: 'Onde você acessa a internet' },
    { word: 'CELULAR', hint: 'Dispositivo móvel' },
    { word: 'APLICATIVO', hint: 'Programa de celular' },
    { word: 'LOJA', hint: 'Onde se baixa apps' }
  ],
  'Conquistas': [
    { word: 'VITORIA', hint: 'Quando você ganha' },
    { word: 'RECORDE', hint: 'Sua melhor pontuação' },
    { word: 'PREMIO', hint: 'O que se ganha ao vencer' },
    { word: 'SUCESSO', hint: 'Alcançar um objetivo' },
    { word: 'MOEDAS', hint: 'Dinheiro virtual' },
    { word: 'PONTOS', hint: 'O que você acumula jogando' },
    { word: 'NIVEL', hint: 'Indica sua progressão' },
    { word: 'DESAFIO', hint: 'Uma tarefa difícil' }
  ],
  'Habilidades': [
    { word: 'INTELIGENCIA', hint: 'Capacidade de pensar' },
    { word: 'ESTRATEGIA', hint: 'Plano de ação' },
    { word: 'ATENCAO', hint: 'Foco no que faz' },
    { word: 'RACIOCINIO', hint: 'Processo lógico' },
    { word: 'DIVERSAO', hint: 'O objetivo de um jogo' }
  ]
};

export default function HangmanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const [currentWordObj, setCurrentWordObj] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('');
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);
  const maxMistakes = 6;

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const categories = Object.keys(WORD_CATEGORIES);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const words = WORD_CATEGORIES[category];
    const randomObj = words[Math.floor(Math.random() * words.length)];
    
    setCurrentCategory(category);
    setCurrentWordObj(randomObj);
    setGuessedLetters(new Set());
    setMistakes(0);
  };

  const handleGuess = (letter) => {
    if (guessedLetters.has(letter) || isGameOver || isGameWon) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!currentWordObj.word.includes(letter)) {
      setMistakes(m => m + 1);
      SoundManager.playError();
    } else {
      SoundManager.playFlip();
    }
  };

  if (!currentWordObj) return null;

  const wordLetters = currentWordObj.word.split('');
  const isGameOver = mistakes >= maxMistakes;
  const isGameWon = wordLetters.every(letter => guessedLetters.has(letter));

  useEffect(() => {
    if (isGameWon) SoundManager.playVictory();
  }, [isGameWon]);

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>FORCA BÍBLICA</Text>
        <TouchableOpacity style={styles.restartBtn} onPress={startNewGame}>
          <Text style={styles.restartIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameArea}>
        {/* Boneco da Forca */}
        <View style={styles.hangmanContainer}>
          <Text style={styles.mistakesText}>Erros: {mistakes} / {maxMistakes}</Text>
          <View style={styles.gallows}>
             <Text style={styles.gallowsArt}>
               {mistakes === 0 && `\n\n\n\n`}
               {mistakes === 1 && ` O \n\n\n\n`}
               {mistakes === 2 && ` O \n | \n\n\n`}
               {mistakes === 3 && ` O \n/| \n\n\n`}
               {mistakes === 4 && ` O \n/|\\\n\n\n`}
               {mistakes === 5 && ` O \n/|\\\n/  \n\n`}
               {mistakes === 6 && ` O \n/|\\\n/ \\\n\n`}
             </Text>
           </View>
        </View>

        {/* Categoria */}
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 'bold' }}>TEMA: {currentCategory}</Text>
        </View>

        {/* Dica */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintLabel}>DICA:</Text>
          <Text style={styles.hintText}>{currentWordObj.hint}</Text>
        </View>

        {/* Palavra */}
        <View style={styles.wordContainer}>
          {wordLetters.map((letter, index) => {
            const isRevealed = guessedLetters.has(letter) || isGameOver;
            const isMissing = isGameOver && !guessedLetters.has(letter);
            return (
              <View key={index} style={styles.letterBox}>
                <Text style={[styles.letterText, isMissing && { color: '#ef4444' }]}>
                  {isRevealed ? letter : ''}
                </Text>
              </View>
            );
          })}
        </View>
        
        {/* Status */}
        <View style={styles.statusContainer}>
          {isGameWon && <Text style={styles.winText}>🎉 VOCÊ VENCEU! 🎉</Text>}
          {isGameOver && !isGameWon && <Text style={styles.loseText}>❌ VOCÊ PERDEU! ❌</Text>}
        </View>
      </View>

      {/* Teclado */}
      <View style={[styles.keyboardContainer, { paddingBottom: insets.bottom + 20 }]}>
        {keyboardRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {row.map(letter => {
              const isGuessed = guessedLetters.has(letter);
              const isCorrect = isGuessed && currentWordObj.word.includes(letter);
              const isWrong = isGuessed && !currentWordObj.word.includes(letter);
              
              return (
                <TouchableOpacity
                  key={letter}
                  style={[
                    styles.keyButton,
                    isCorrect && styles.keyCorrect,
                    isWrong && styles.keyWrong
                  ]}
                  onPress={() => handleGuess(letter)}
                  disabled={isGuessed || isGameOver || isGameWon}
                >
                  <Text style={[styles.keyText, isGuessed && styles.keyTextGuessed]}>{letter}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {isGameWon && <ConfettiCannon count={200} origin={{x: -10, y: 0}} fallSpeed={2500} fadeOut />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#831843', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  restartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restartIcon: {
    color: '#fff',
    fontSize: 24,
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  hangmanContainer: {
    alignItems: 'center',
    marginBottom: 20,
    height: 180,
    justifyContent: 'center',
  },
  mistakesText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gallowsArt: {
    fontFamily: 'monospace',
    fontSize: 24,
    color: '#fff',
    lineHeight: 24,
    textAlign: 'center',
  },
  hintContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  hintLabel: {
    color: '#fbcfe8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hintText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  wordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  letterBox: {
    width: 36,
    height: 46,
    borderBottomWidth: 3,
    borderBottomColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  letterText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusContainer: {
    height: 40,
    justifyContent: 'center',
  },
  winText: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: '900',
  },
  loseText: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: '900',
  },
  keyboardContainer: {
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 6,
  },
  keyButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    minWidth: 32,
    alignItems: 'center',
    elevation: 2,
  },
  keyCorrect: {
    backgroundColor: '#10b981',
  },
  keyWrong: {
    backgroundColor: '#4c1d95',
    opacity: 0.5,
  },
  keyText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keyTextGuessed: {
    color: '#fff',
  }
});
