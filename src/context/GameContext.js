import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GameContext = createContext();

const STORAGE_KEY = '@solitaire_filo_progression';

export const useGameContext = () => useContext(GameContext);

const DEFAULT_MISSIONS = [
  { id: 'm1', type: 'play', game: 'WordSearch', target: 2, current: 0, reward: 50, desc: 'Jogue 2 Caça-Palavras', completed: false },
  { id: 'm2', type: 'win', game: 'DominoesGame', target: 1, current: 0, reward: 100, desc: 'Vença 1 partida de Dominó', completed: false },
  { id: 'm3', type: 'play', game: 'any', target: 5, current: 0, reward: 150, desc: 'Jogue 5 minijogos quaisquer', completed: false }
];

const DEFAULT_ACHIEVEMENTS = [
  { id: 'a1', title: 'Primeiro Foco', desc: 'Jogue um minijogo', icon: '🎯', unlocked: false },
  { id: 'a2', title: 'Mestre das Palavras', desc: 'Vença na Forca 3 vezes', icon: '📖', type: 'win', game: 'HangmanGame', target: 3, current: 0, unlocked: false },
  { id: 'a3', title: 'Rei do Dominó', desc: 'Vença 3 partidas de Dominó', icon: '🁣', type: 'win', game: 'DominoesGame', target: 3, current: 0, unlocked: false },
  { id: 'a4', title: 'Construtor', desc: 'Jogue Block Filó 3 vezes', icon: '🧱', type: 'play', game: 'BlockPuzzle', target: 3, current: 0, unlocked: false },
  { id: 'a5', title: 'Estrategista', desc: 'Jogue Quebra-cabeça 3 vezes', icon: '🧩', type: 'play', game: 'SlidingPuzzle', target: 3, current: 0, unlocked: false },
  { id: 'a6', title: 'Veterano', desc: 'Atinja Nível 5', icon: '⭐', unlocked: false },
  { id: 'a7', title: 'Mente Viva', desc: 'Jogue Memória 3 vezes', icon: '🧠', type: 'play', game: 'MemoryGame', target: 3, current: 0, unlocked: false },
  { id: 'a8', title: 'Em Chamas', desc: 'Vença 10 minijogos no total', icon: '🔥', type: 'win', game: 'any', target: 10, current: 0, unlocked: false },
];

const DEFAULT_SKILLS = {
  attention: { xp: 0, level: 1 },
  memory: { xp: 0, level: 1 },
  language: { xp: 0, level: 1 }
};

export const GameProvider = ({ children }) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(0);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [achievements, setAchievements] = useState(DEFAULT_ACHIEVEMENTS);
  const [missions, setMissions] = useState(DEFAULT_MISSIONS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgression();
  }, []);

  const loadProgression = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setXp(parsed.xp || 0);
        setLevel(parsed.level || 1);
        setCoins(parsed.coins || 0);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.missions) setMissions(parsed.missions);
      }
    } catch (e) {
      console.error('Failed to load progression', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgression = async (newXp, newLevel, newCoins, newSkills, newAchievements, newMissions) => {
    try {
      const data = { 
        xp: newXp !== undefined ? newXp : xp, 
        level: newLevel !== undefined ? newLevel : level, 
        coins: newCoins !== undefined ? newCoins : coins,
        skills: newSkills || skills,
        achievements: newAchievements || achievements,
        missions: newMissions || missions 
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save progression', e);
    }
  };

  const getXpForNextLevel = (currentLevel) => {
    return currentLevel * 500; // e.g. Lvl 1->2 needs 500. Lvl 2->3 needs 1000.
  };

  const addXp = (amount) => {
    setXp((prevXp) => {
      let currentXp = prevXp + amount;
      let currentLevel = level;
      let threshold = getXpForNextLevel(currentLevel);

      while (currentXp >= threshold) {
        currentXp -= threshold;
        currentLevel++;
        threshold = getXpForNextLevel(currentLevel);
      }

      setLevel(currentLevel);
      saveProgression(currentXp, currentLevel, undefined, undefined, undefined, missions);
      
      // Update Level Achievement
      if (currentLevel >= 5) {
        checkLevelAchievement(currentLevel);
      }
      return currentXp;
    });
  };

  const addCoins = (amount) => {
    setCoins(prev => {
      const newCoins = prev + amount;
      saveProgression(undefined, undefined, newCoins);
      return newCoins;
    });
  };

  const addSkillXp = (skillName, amount) => {
    setSkills(prev => {
      const currentSkill = prev[skillName];
      if (!currentSkill) return prev;
      
      let newXp = currentSkill.xp + amount;
      let newLevel = currentSkill.level;
      let threshold = getXpForNextLevel(newLevel);
      
      while (newXp >= threshold) {
        newXp -= threshold;
        newLevel++;
        threshold = getXpForNextLevel(newLevel);
      }

      const updatedSkills = { ...prev, [skillName]: { xp: newXp, level: newLevel } };
      saveProgression(undefined, undefined, undefined, updatedSkills);
      return updatedSkills;
    });
  };

  const checkLevelAchievement = (currLevel) => {
    setAchievements(prev => {
      let updated = false;
      const next = prev.map(a => {
        if (a.id === 'a6' && !a.unlocked && currLevel >= 5) {
          updated = true;
          return { ...a, unlocked: true };
        }
        return a;
      });
      if (updated) saveProgression(undefined, undefined, undefined, undefined, next);
      return next;
    });
  };

  const trackAction = (actionType, gameName) => {
    // actionType: 'play' | 'win'
    let missionsUpdated = false;
    let earnedXp = 0;

    const newMissions = missions.map(m => {
      if (m.completed) return m;

      let isMatch = false;
      if (m.type === actionType) {
        if (m.game === 'any' || m.game === gameName) {
          isMatch = true;
        }
      }

      if (isMatch) {
        const newCurrent = m.current + 1;
        missionsUpdated = true;
        if (newCurrent >= m.target) {
          earnedXp += m.reward;
          return { ...m, current: m.target, completed: true };
        }
        return { ...m, current: newCurrent };
      }
      return m;
    });

    let achievementsUpdated = false;
    const newAchievements = achievements.map(a => {
      if (a.unlocked) return a;
      
      if (a.id === 'a1') { // First game ever played
        achievementsUpdated = true;
        return { ...a, unlocked: true };
      }

      if (a.type === actionType && (a.game === 'any' || a.game === gameName)) {
        const newCurrent = (a.current || 0) + 1;
        achievementsUpdated = true;
        if (newCurrent >= a.target) {
          return { ...a, current: a.target, unlocked: true };
        }
        return { ...a, current: newCurrent };
      }
      return a;
    });

    // Grant coins per game played (e.g. 10 coins per play, 30 per win)
    const coinsEarned = actionType === 'win' ? 30 : 10;
    
    // Distribute skill points based on game
    if (actionType === 'win') {
      if (['WordSearch', 'HangmanGame'].includes(gameName)) addSkillXp('language', 50);
      if (['MemoryGame', 'SlidingPuzzle'].includes(gameName)) addSkillXp('memory', 50);
      if (['BlockPuzzle', 'TetrisGame', 'DominoesGame'].includes(gameName)) addSkillXp('attention', 50);
    }

    if (missionsUpdated || achievementsUpdated) {
      if (missionsUpdated) setMissions(newMissions);
      if (achievementsUpdated) setAchievements(newAchievements);
      
      setCoins(prev => prev + coinsEarned);
      
      saveProgression(
        xp + earnedXp,
        level,
        coins + coinsEarned,
        undefined,
        achievementsUpdated ? newAchievements : undefined,
        missionsUpdated ? newMissions : undefined
      );

      if (earnedXp > 0) {
        addXp(earnedXp);
      }
    } else {
      addCoins(coinsEarned);
    }
  };

  const xpProgress = xp / getXpForNextLevel(level);

  return (
    <GameContext.Provider value={{
      xp, level, coins, skills, achievements, missions, xpProgress, getXpForNextLevel,
      addXp, addCoins, trackAction, isLoading
    }}>
      {children}
    </GameContext.Provider>
  );
};
