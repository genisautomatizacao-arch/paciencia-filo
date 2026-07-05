import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@filo_stats';

export const loadStats = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STATS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesWonSinceAd: 0,
      bestTime: null,
      bestScore: 0
    };
  } catch (e) {
    console.error("Error loading stats", e);
    return null;
  }
};

export const saveStats = async (newStats) => {
  try {
    const jsonValue = JSON.stringify(newStats);
    await AsyncStorage.setItem(STATS_KEY, jsonValue);
  } catch (e) {
    console.error("Error saving stats", e);
  }
};

export const recordWin = async (score, time) => {
  const stats = await loadStats();
  if (!stats) return { showAd: false };
  
  stats.gamesPlayed += 1;
  stats.gamesWon += 1;
  stats.gamesWonSinceAd = (stats.gamesWonSinceAd || 0) + 1;
  
  let showAd = false;
  if (stats.gamesWonSinceAd >= 3) {
    showAd = true;
    stats.gamesWonSinceAd = 0;
  }

  if (!stats.bestTime || time < stats.bestTime) {
    stats.bestTime = time;
  }
  if (score > stats.bestScore) {
    stats.bestScore = score;
  }
  
  await saveStats(stats);
  return { showAd };
};

export const recordLoss = async () => {
  const stats = await loadStats();
  if (!stats) return;
  
  stats.gamesPlayed += 1;
  await saveStats(stats);
};
