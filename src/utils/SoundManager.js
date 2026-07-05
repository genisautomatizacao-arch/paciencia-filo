import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class SoundManager {
  constructor() {
    this.sounds = {};
  }

  async init() {
    // We only load audio if we want it. On Web, Audio requires user interaction first,
    // so we just load them when needed or ignore if it fails.
  }

  async playSound(url) {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      // We don't strictly need to store it if we just want a fire-and-forget,
      // but unloading it after playing is good practice.
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound', error);
    }
  }

  // --- SPECIFIC ACTIONS ---

  async playFlip() {
    // Haptic feedback for the physical feel
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Very short click/flip sound (public domain)
    this.playSound('https://actions.google.com/sounds/v1/ui/button_click.ogg');
  }

  async playSlide() {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    this.playSound('https://actions.google.com/sounds/v1/ui/slide_click.ogg');
  }

  async playVictory() {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // Cheerful chime
    this.playSound('https://actions.google.com/sounds/v1/cartoon/cartoon_success_fanfare.ogg');
  }

  async playError() {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    this.playSound('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
  }
}

export default new SoundManager();
