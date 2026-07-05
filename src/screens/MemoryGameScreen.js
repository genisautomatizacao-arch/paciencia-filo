import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useGameContext } from '../context/GameContext';
import SoundManager from '../utils/SoundManager';

const EMOJIS = ['🦁', '🐑', '🕊️', '👑', '✝️', '⚓'];

export default function MemoryGameScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { trackAction, addXp } = useGameContext();
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isVictory, setIsVictory] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const handleWin = () => {
    SoundManager.playVictory();
    addXp(30);
    trackAction('win', 'MemoryGame');
    trackAction('play', 'any');
  };

  const startNewGame = () => {
    const shuffledEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        animValue: new Animated.Value(0),
      }));
    setCards(shuffledEmojis);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setMoves(0);
    setIsVictory(false);
  };

  const flipCard = (index) => {
    if (flippedIndices.length >= 2 || flippedIndices.includes(index) || matchedIndices.includes(index)) {
      return;
    }

    SoundManager.playFlip();

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Animate flip to front
    Animated.spring(cards[index].animValue, {
      toValue: 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIndex, secondIndex] = newFlipped;
      
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        // Match!
        const newMatched = [...matchedIndices, firstIndex, secondIndex];
        setMatchedIndices(newMatched);
        setFlippedIndices([]);
        
        if (newMatched.length === cards.length) {
          setIsVictory(true);
          handleWin();
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(cards[firstIndex].animValue, {
              toValue: 0,
              friction: 8,
              tension: 10,
              useNativeDriver: true,
            }),
            Animated.spring(cards[secondIndex].animValue, {
              toValue: 0,
              friction: 8,
              tension: 10,
              useNativeDriver: true,
            })
          ]).start();
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>JOGO DA MEMÓRIA</Text>
        <Text style={styles.moves}>Tentativas: {moves}</Text>
      </View>

      {isVictory && (
        <ConfettiCannon 
          count={200} 
          origin={{x: 200, y: 0}} 
          fallSpeed={3000} 
          fadeOut={true} 
        />
      )}

      <View style={styles.board}>
        {cards.map((card, index) => {
          const frontInterpolate = card.animValue.interpolate({
            inputRange: [0, 180],
            outputRange: ['180deg', '360deg'],
          });
          const backInterpolate = card.animValue.interpolate({
            inputRange: [0, 180],
            outputRange: ['0deg', '180deg'],
          });

          const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
          const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

          return (
            <TouchableOpacity 
              key={card.id} 
              style={styles.cardWrapper} 
              onPress={() => flipCard(index)}
              activeOpacity={0.8}
            >
              <View>
                {/* Back of Card (Image) */}
                <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                  <Image source={require('../assets/card_back.jpg')} style={styles.cardImage} />
                </Animated.View>
                
                {/* Front of Card (Emoji) */}
                <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                  <Text style={styles.emoji}>{card.emoji}</Text>
                </Animated.View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {isVictory && (
        <View style={styles.victoryModal}>
          <Text style={styles.victoryTitle}>Você Venceu!</Text>
          <Text style={styles.victoryDesc}>Concluiu em {moves} tentativas.</Text>
          <TouchableOpacity style={styles.playAgainBtn} onPress={startNewGame}>
            <Text style={styles.playAgainText}>JOGAR NOVAMENTE</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const windowWidth = Dimensions.get('window').width;
const cardSize = (windowWidth - 60) / 3; // 3 columns with padding

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
    color: '#10b981',
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  moves: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
    marginTop: 20,
  },
  cardWrapper: {
    width: cardSize,
    height: cardSize * 1.2,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  cardBack: {
    backgroundColor: '#0e5641',
    borderColor: '#10b981',
  },
  cardFront: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  cardBackIcon: {
    fontSize: 32,
    opacity: 0.5,
  },
  emoji: {
    fontSize: 48,
  },
  victoryModal: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#10b981',
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
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
