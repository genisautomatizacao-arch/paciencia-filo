import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import { useSolitaire } from '../engine/useSolitaire';
import Card from './Card';
import ConfettiCannon from 'react-native-confetti-cannon';
import { recordWin } from '../services/StorageManager';
import { showInterstitial } from '../services/AdMobService';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W    = 48;
const CARD_H    = 72;
const PADDING   = 8;
const GAP       = Math.floor((SCREEN_W - PADDING * 2 - CARD_W * 7) / 6);

// Icon per suit for foundation slots
const F_ICONS = ['♠', '♥', '♦', '♣'];
const F_COLORS = ['#4a9eff', '#e74c3c', '#e74c3c', '#4a9eff'];

export default function SolitaireBoard({ onMenuPress }) {
  const {
    stock, waste, foundations, tableau,
    dealNewGame, selectedCard, handleCardTap,
    isVictory, undoMove, canUndo, hintCard, showHint,
    score, timer, setIsPlaying, canAutoFinish, autoFinish,
    moves, handleDragDrop,
  } = useSolitaire();

  const [draggingState, setDraggingState] = useState(null);
  const victoryScale = useRef(new Animated.Value(0)).current;

  useEffect(() => { dealNewGame(); }, []);

  useEffect(() => {
    if (isVictory) {
      Animated.spring(victoryScale, { toValue: 1, friction: 4, useNativeDriver: false }).start();
      
      recordWin(score, timer).then((res) => {
        if (res && res.showAd) {
          showInterstitial();
        }
      });
    }
  }, [isVictory]);

  const getCardTop = (col, idx) => {
    let top = 0;
    for (let i = 0; i < idx; i++) top += col[i].isFaceUp ? 26 : 13;
    return top;
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const onDragStart = (card, source) => {
    let draggedCards = [card];
    if (source.type === 'tableau') {
      draggedCards = tableau[source.colIdx].slice(source.cardIdx);
    }
    setDraggingState({ source, cards: draggedCards });
  };

  const onDragRelease = (dx, dy) => {
    if (!draggingState) return false;

    let success = false;

    if (dy < -90) {
      // Swipe up → auto foundation
      if (handleDragDrop) success = handleDragDrop(draggingState, { type: 'auto_foundation' });
    } else {
      const colsMoved = Math.round(dx / (CARD_W + GAP));

      if (draggingState.source.type === 'tableau') {
        const newCol = draggingState.source.colIdx + colsMoved;
        if (newCol >= 0 && newCol < 7 && newCol !== draggingState.source.colIdx) {
          if (handleDragDrop) success = handleDragDrop(draggingState, { type: 'tableau', colIdx: newCol });
        }
      } else if (draggingState.source.type === 'waste') {
        // waste is at far right; columns go 0-6 left to right
        const newCol = Math.max(0, Math.min(6, 6 + colsMoved));
        if (handleDragDrop) success = handleDragDrop(draggingState, { type: 'tableau', colIdx: newCol });
      }
    }

    setDraggingState(null);
    return success;
  };

  return (
    <View style={styles.boardWrapper}>

      {/* ───── BOARD ───── */}
      <View style={styles.board}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleText}>PACIÊNCIA FILÓ</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>PONTOS</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>MOVES</Text>
              <Text style={styles.statValue}>{moves}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TEMPO</Text>
              <Text style={styles.statValue}>{formatTime(timer)}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.headerDivider} />

        {/* Victory confetti */}
        {isVictory && (
          <ConfettiCannon count={250} origin={{ x: SCREEN_W / 2, y: 0 }} fallSpeed={2800} fadeOut />
        )}

        {/* ── TOP ROW: Foundations (left) + Waste + Stock (right) ── */}
        <View style={styles.topRow}>

          {/* FOUNDATIONS */}
          <View style={styles.foundationsRow}>
            {foundations.map((pile, idx) => (
              <View key={`f-${idx}`} style={styles.slotWrapper}>
                {/* Empty slot indicator */}
                <View style={[styles.slot, styles.foundationSlot]}>
                  <Text style={[styles.foundationIcon, { color: F_COLORS[idx] }]}>{F_ICONS[idx]}</Text>
                </View>
                {pile.length > 0 && (
                  <View style={StyleSheet.absoluteFill}>
                    <Card
                      card={pile[pile.length - 1]}
                      index={idx}
                      onTap={() => handleCardTap(pile[pile.length - 1], { type: 'foundation', colIdx: idx, cardIdx: pile.length - 1 })}
                      isSelected={(selectedCard?.card?.id === pile[pile.length - 1].id) || hintCard === pile[pile.length - 1].id}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* WASTE + STOCK */}
          <View style={styles.stockWasteRow}>

            {/* WASTE */}
            <View style={styles.slotWrapper}>
              <View style={styles.slot} />
              {waste.length > 0 && (
                <View style={StyleSheet.absoluteFill}>
                  <Card
                    card={waste[waste.length - 1]}
                    index={1}
                    onTap={() => handleCardTap(waste[waste.length - 1], { type: 'waste', colIdx: 0, cardIdx: waste.length - 1 })}
                    isSelected={(selectedCard?.card?.id === waste[waste.length - 1].id) || hintCard === waste[waste.length - 1].id}
                    onDragStart={() => onDragStart(waste[waste.length - 1], { type: 'waste', colIdx: 0, cardIdx: waste.length - 1 })}
                    onDragRelease={onDragRelease}
                  />
                </View>
              )}
            </View>

            {/* STOCK */}
            <TouchableOpacity
              style={styles.slotWrapper}
              onPress={() => handleCardTap({ isStock: true }, { type: 'stock' })}
              activeOpacity={0.85}
            >
              {stock.length > 0 ? (
                <>
                  {/* Shadow cards for depth illusion */}
                  {stock.length > 2 && <View style={[styles.stockShadow, { top: -4, left: -3 }]} />}
                  {stock.length > 1 && <View style={[styles.stockShadow, { top: -2, left: -1.5 }]} />}
                  <Card card={{ isFaceUp: false }} index={0} disabled />
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockBadgeText}>{stock.length}</Text>
                  </View>
                </>
              ) : (
                <View style={[styles.slot, styles.emptyStock]}>
                  <Text style={styles.recycleIcon}>↺</Text>
                </View>
              )}
            </TouchableOpacity>

          </View>
        </View>

        {/* ── TABLEAU ── */}
        <View style={styles.tableau}>
          {tableau.map((col, colIdx) => (
            <View key={`t-${colIdx}`} style={styles.column}>
              {/* Empty column slot */}
              <View style={styles.slot} />

              {col.map((card, cardIdx) => {
                const isDragged =
                  draggingState?.source.type === 'tableau' &&
                  draggingState?.source.colIdx === colIdx &&
                  cardIdx > draggingState?.source.cardIdx;
                if (isDragged) return null;

                const isLeader =
                  draggingState?.source.type === 'tableau' &&
                  draggingState?.source.colIdx === colIdx &&
                  cardIdx === draggingState?.source.cardIdx;

                const stack = isLeader ? draggingState.cards : [];

                return (
                  <View
                    key={card.id}
                    style={[
                      styles.tableauCard,
                      { top: getCardTop(col, cardIdx) },
                      { zIndex: isLeader ? 999 : cardIdx },
                    ]}
                  >
                    <Card
                      card={card}
                      index={6 + colIdx * 5 + cardIdx}
                      onTap={() => handleCardTap(card, { type: 'tableau', colIdx, cardIdx })}
                      isSelected={(selectedCard?.card?.id === card.id) || hintCard === card.id}
                      onDragStart={() => onDragStart(card, { type: 'tableau', colIdx, cardIdx })}
                      onDragRelease={onDragRelease}
                      stack={stack}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* ── HUD BOTTOM ── */}
      <View style={styles.hudContainer}>
        <TouchableOpacity style={styles.hudBtn} onPress={undoMove} disabled={!canUndo}>
          <Text style={[styles.hudIcon, !canUndo && styles.hudDisabled]}>↺</Text>
          <Text style={[styles.hudLabel, !canUndo && styles.hudDisabled]}>VOLTAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.hudBtn} onPress={showHint}>
          <Text style={styles.hudIcon}>💡</Text>
          <Text style={styles.hudLabel}>DICA</Text>
        </TouchableOpacity>

        {canAutoFinish && !isVictory ? (
          <TouchableOpacity style={[styles.hudBtn, styles.hudBtnHighlight]} onPress={autoFinish}>
            <Text style={styles.hudIcon}>✨</Text>
            <Text style={[styles.hudLabel, styles.hudLabelGold]}>AUTO</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.hudBtn} onPress={dealNewGame}>
            <Text style={styles.hudIcon}>⚡</Text>
            <Text style={styles.hudLabel}>NOVO JOGO</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.hudBtn} onPress={onMenuPress}>
          <Text style={styles.hudIcon}>≡</Text>
          <Text style={styles.hudLabel}>MENU</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardWrapper: { flex: 1 },

  board: {
    flex: 1,
    paddingHorizontal: PADDING,
    paddingBottom: 4,
    backgroundColor: '#0d4a31',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 10,
  },
  titleText: {
    color: '#d4af37',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
  },
  statBox: { alignItems: 'center', minWidth: 44 },
  statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 8, fontWeight: 'bold', letterSpacing: 0.5 },
  statValue: { color: '#fff', fontSize: 15, fontWeight: '900' },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.15)' },

  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.25)',
    marginBottom: 10,
  },

  // ── Top Row ──
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foundationsRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  stockWasteRow: {
    flexDirection: 'row',
    gap: GAP,
  },

  // ── Slots ──
  slotWrapper: {
    width: CARD_W,
    height: CARD_H,
    position: 'relative',
  },
  slot: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  foundationSlot: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  foundationIcon: {
    fontSize: 26,
    opacity: 0.35,
  },
  emptyStock: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  recycleIcon: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.4)',
  },

  // ── Stock depth illusion ──
  stockShadow: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: 7,
    backgroundColor: '#1a3a5c',
    borderWidth: 1,
    borderColor: '#8899bb',
  },
  stockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#d4af37',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  stockBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
  },

  // ── Tableau ──
  tableau: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  column: {
    width: CARD_W,
    position: 'relative',
  },
  tableauCard: {
    position: 'absolute',
    left: 0,
    right: 0,
  },

  // ── HUD ──
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#081a10',
    paddingVertical: 10,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(212,175,55,0.35)',
  },
  hudBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  hudBtnHighlight: {
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 10,
    marginHorizontal: 4,
  },
  hudIcon: {
    fontSize: 22,
    color: '#d4af37',
    marginBottom: 3,
  },
  hudLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  hudLabelGold: {
    color: '#d4af37',
  },
  hudDisabled: {
    opacity: 0.3,
  },
});
