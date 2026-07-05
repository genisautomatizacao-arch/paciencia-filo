import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useGameContext } from '../context/GameContext';

export default function MiniGamesHubScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { xp, level, xpProgress, missions, coins, skills, achievements, isLoading } = useGameContext();

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#1e1b4b', '#0f172a', '#020617']} style={styles.container}>
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: 'transparent' }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={styles.purpleDot} />
          <Text style={styles.title}>MUNDO FILÓ</Text>
        </View>
        <View style={styles.headerBadges}>
          <View style={[styles.fireBadge, { backgroundColor: '#f59e0b', marginRight: 5 }]}><Text style={styles.badgeText}>🧠 {coins}</Text></View>
          <View style={styles.fireBadge}><Text style={styles.badgeText}>🔥 Lvl {level}</Text></View>
          <View style={styles.starBadge}><Text style={styles.badgeText}>⭐ {xp}</Text></View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        
        {/* Nível Atual */}
        <Text style={styles.sectionTitle}>NÍVEL ATUAL</Text>
        <BlurView intensity={40} tint="dark" style={styles.levelCard}>
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Nível {level}</Text>
            <Text style={styles.levelPercent}>{Math.floor(xpProgress * 100)}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, xpProgress * 100))}%` }]} />
          </View>
        </BlurView>

        {/* Missões Diárias */}
        <Text style={styles.sectionTitle}>📋 MISSÕES DIÁRIAS</Text>
        <BlurView intensity={40} tint="dark" style={styles.missionsContainer}>
          {missions.map((mission, index) => {
            const progress = (mission.current / mission.target) * 100;
            return (
              <React.Fragment key={mission.id}>
                <View style={[styles.missionRow, mission.completed && { opacity: 0.5 }]}>
                  <View style={{flex: 1}}>
                    <Text style={[styles.missionText, mission.completed && { textDecorationLine: 'line-through' }]}>
                      {mission.desc}
                    </Text>
                    <View style={styles.missionTrack}>
                      <View style={[styles.missionFill, { width: `${Math.min(100, Math.max(0, progress))}%` }, mission.completed && { backgroundColor: '#10b981' }]} />
                    </View>
                  </View>
                  <Text style={[styles.xpText, mission.completed && { color: '#10b981' }]}>
                    {mission.completed ? 'CONCLUÍDA' : `+${mission.reward} XP`}
                  </Text>
                </View>
                {index < missions.length - 1 && <View style={styles.missionDivider} />}
              </React.Fragment>
            );
          })}
        </BlurView>

        {/* Habilidades */}
        <Text style={styles.sectionTitle}>🧠 HABILIDADES</Text>
        <BlurView intensity={40} tint="dark" style={styles.skillsContainer}>
          <View style={styles.skillRow}>
            <View style={styles.skillIcon}><Text>🎯</Text></View>
            <View style={{flex: 1, marginLeft: 10}}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>Atenção</Text>
                <Text style={styles.skillLevel}>Nível {skills.attention.level}</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, (skills.attention.xp / (skills.attention.level * 500)) * 100))}%`, backgroundColor: '#3b82f6' }]} />
              </View>
            </View>
          </View>
          <View style={styles.missionDivider} />
          <View style={styles.skillRow}>
            <View style={styles.skillIcon}><Text>🧠</Text></View>
            <View style={{flex: 1, marginLeft: 10}}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>Memória</Text>
                <Text style={styles.skillLevel}>Nível {skills.memory.level}</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, (skills.memory.xp / (skills.memory.level * 500)) * 100))}%`, backgroundColor: '#10b981' }]} />
              </View>
            </View>
          </View>
          <View style={styles.missionDivider} />
          <View style={styles.skillRow}>
            <View style={styles.skillIcon}><Text>📖</Text></View>
            <View style={{flex: 1, marginLeft: 10}}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>Linguagem</Text>
                <Text style={styles.skillLevel}>Nível {skills.language.level}</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, (skills.language.xp / (skills.language.level * 500)) * 100))}%`, backgroundColor: '#a855f7' }]} />
              </View>
            </View>
          </View>
        </BlurView>

        {/* Conquistas */}
        <Text style={styles.sectionTitle}>🏆 CONQUISTAS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {achievements.map((ach) => (
              <BlurView intensity={40} tint="dark" key={ach.id} style={[styles.achBadge, !ach.unlocked && { opacity: 0.4 }]}>
                <View style={styles.achIconWrapper}>
                <Text style={styles.achIcon}>{ach.icon}</Text>
                {ach.unlocked && <View style={styles.achUnlockedCheck}><Text style={styles.achCheckText}>✓</Text></View>}
              </View>
              <Text style={styles.achTitle}>{ach.title}</Text>
                  <Text style={styles.achDesc}>{ach.desc}</Text>
              </BlurView>
            ))}
          </ScrollView>

        {/* Escolha seu Jogo */}
        <Text style={styles.sectionTitle}>🎮 ESCOLHA SEU JOGO</Text>
        
        <View style={styles.grid}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            <TouchableOpacity 
              style={styles.cardWrapper}
              onPress={() => navigation.navigate('MemoryGame')}
            >
              <LinearGradient colors={['#064e3b', '#047857']} style={styles.card}>
                <Text style={styles.cardIcon}>🎯</Text>
                <Text style={styles.cardTitle}>ATENÇÃO</Text>
                <Text style={styles.cardDesc}>Memória visual</Text>
                <View style={[styles.playBtn, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
                  <Text style={styles.playBtnText}>JOGAR</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cardWrapper}
              onPress={() => navigation.navigate('WordSearch')}
            >
              <LinearGradient colors={['#4c1d95', '#6d28d9']} style={styles.card}>
                <Text style={styles.cardIcon}>📖</Text>
                <Text style={styles.cardTitle}>PALAVRAS</Text>
                <Text style={styles.cardDesc}>Bíblico & Mais</Text>
                <View style={[styles.playBtn, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
                  <Text style={styles.playBtnText}>JOGAR</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.gridRow}>
            <TouchableOpacity 
              style={styles.cardWrapper}
              onPress={() => navigation.navigate('SlidingPuzzle')}
            >
              <LinearGradient colors={['#78350f', '#b45309']} style={styles.card}>
                <Text style={styles.cardIcon}>🧩</Text>
                <Text style={styles.cardTitle}>RACIOCÍNIO</Text>
                <Text style={styles.cardDesc}>Quebra-cabeça</Text>
                <View style={[styles.playBtn, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
                  <Text style={styles.playBtnText}>JOGAR</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cardWrapper}
              onPress={() => navigation.navigate('DominoesGame')}
            >
              <LinearGradient colors={['#1e3a8a', '#1d4ed8']} style={styles.card}>
                <Text style={styles.cardIcon}>🁣</Text>
                <Text style={styles.cardTitle}>DOMINÓ</Text>
                <Text style={styles.cardDesc}>vs IA</Text>
                <View style={[styles.playBtn, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
                  <Text style={styles.playBtnText}>JOGAR</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Row 3 */}
          <View style={styles.gridRow}>
            <TouchableOpacity 
              style={styles.cardWrapper}
              onPress={() => navigation.navigate('HangmanGame')}
            >
              <LinearGradient colors={['#831843', '#be185d']} style={styles.card}>
                <Text style={styles.cardIcon}>🪢</Text>
                <Text style={styles.cardTitle}>FORCA</Text>
                <Text style={styles.cardDesc}>Forca Bíblica</Text>
                <View style={[styles.playBtn, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
                  <Text style={styles.playBtnText}>JOGAR</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cardWrapper}
              onPress={() => navigation.navigate('BlockPuzzle')}
            >
              <LinearGradient colors={['#134e4a', '#0f766e']} style={styles.card}>
                <Text style={styles.cardIcon}>🧱</Text>
                <Text style={styles.cardTitle}>BLOCK FILÓ</Text>
                <Text style={styles.cardDesc}>Puzzle Geométrico</Text>
                <View style={[styles.playBtn, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
                  <Text style={styles.playBtnText}>JOGAR</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Row 4 */}
          <View style={styles.gridRow}>
            <TouchableOpacity 
              style={[styles.cardWrapper, { flex: 0.48 }]}
              onPress={() => navigation.navigate('TetrisGame')}
            >
              <LinearGradient colors={['#312e81', '#4338ca']} style={styles.card}>
                <Text style={styles.cardIcon}>👾</Text>
                <Text style={styles.cardTitle}>TETRIS FILÓ</Text>
                <Text style={styles.cardDesc}>O Clássico!</Text>
                <View style={[styles.playBtn, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
                  <Text style={styles.playBtnText}>JOGAR</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ flex: 0.48 }} />
          </View>

        </View>

      </ScrollView>
    </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#a78bfa',
    fontSize: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purpleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#a78bfa',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a78bfa',
    letterSpacing: 1,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  fireBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  starBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollArea: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
    letterSpacing: 1,
  },
  levelCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelText: {
    color: '#a78bfa',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelPercent: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 3,
  },
  missionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  missionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  missionTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    width: '80%',
  },
  missionFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  xpText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  missionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 15,
  },
  grid: {
    gap: 15,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 15,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  card: {
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  cardIcon: {
    fontSize: 36,
    marginTop: 10,
    marginBottom: 5,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 15,
  },
  playBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  playBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  skillsContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  skillName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  skillLevel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  achievementsScroll: {
    marginBottom: 30,
  },
  achBadge: {
    width: 140,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
  },
  achIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achIcon: {
    fontSize: 24,
  },
  achUnlockedCheck: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#10b981',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achCheckText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  achTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  achDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    textAlign: 'center',
  }
});
