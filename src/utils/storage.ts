import { UserProgress } from '../types/game';

const STORAGE_KEY = 'tiny_jungle_run_save_v1';

const DEFAULT_PROGRESS: UserProgress = {
  highScore: 0,
  totalCoins: 25, // start with a small reward bonus for kids!
  selectedCharacter: 'tiger',
  selectedHat: 'none',
  unlockedCharacters: ['tiger'],
  unlockedHats: ['none'],
  kidsMode: false,
  graphicsQuality: 'HIGH',
  soundEnabled: true,
  musicEnabled: true,
  showOnScreenControls: true,
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      graphicsQuality: parsed.graphicsQuality || 'HIGH',
      unlockedCharacters: Array.isArray(parsed.unlockedCharacters)
        ? Array.from(new Set(['tiger', ...parsed.unlockedCharacters]))
        : ['tiger'],
      unlockedHats: Array.isArray(parsed.unlockedHats)
        ? Array.from(new Set(['none', ...parsed.unlockedHats]))
        : ['none'],
    };
  } catch (e) {
    console.warn('LocalStorage unavailable, using default progress', e);
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}
