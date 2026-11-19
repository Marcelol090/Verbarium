import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

export interface SpeakOptions {
  accent?: 'en-US' | 'en-GB';
  slow?: boolean;
  onStart?: () => void;
  onDone?: () => void;
}

export function stopSpeech(): void {
  try {
    Speech.stop();
  } catch {
    // Ignore speech stop failures on restricted runtimes
  }
}

export function speakEnglish(text: string, options: SpeakOptions = {}): void {
  const clean = String(text ?? '').trim();
  if (!clean) return;

  const { accent = 'en-US', slow = false, onStart, onDone } = options;
  try {
    Speech.stop();
    Speech.speak(clean, {
      language: accent,
      rate: slow ? 0.72 : 0.96,
      pitch: 1.0,
      onStart,
      onDone,
      onStopped: onDone,
      onError: onDone
    });
  } catch {
    onDone?.();
  }
}

export async function triggerHaptic(
  kind: 'tap' | 'success' | 'error' | 'celebration',
  enabled = true
): Promise<void> {
  if (!enabled || Platform.OS === 'web') return;
  try {
    if (kind === 'tap') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (kind === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (kind === 'error') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (kind === 'celebration') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch {
    // Haptics gracefully degrade on emulators/unsupported devices
  }
}
