import * as Haptics from 'expo-haptics';

export function playCardMoveSound() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function playCardFlipSound() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function playCardSnapSound() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function playVictorySound() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function playHintSound() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}
