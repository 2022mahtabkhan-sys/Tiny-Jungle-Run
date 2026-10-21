export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'CHARACTERS' | 'REVIVE';

export type CharacterId = 'tiger' | 'panda' | 'bunny' | 'fox';

export type HatId = 'none' | 'explorer' | 'crown' | 'party' | 'flower' | 'scarf';

export type PowerUpType = 'MAGNET' | 'SHIELD' | 'BOOST' | 'DOUBLE_POINTS' | 'DOUBLE_COIN' | 'FLYING';

export type BonusItemType = 'COIN_BONUS' | 'SUPER_COIN' | 'STAR_BONUS' | 'GIFT_BOX';

export interface PowerUpActive {
  type: PowerUpType;
  duration: number; // in seconds
  timeLeft: number;
}

export interface BonusNotification {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color?: string;
}

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  cost: number;
  description: string;
  primaryColor: string;
  accentColor: string;
  unlockedByDefault?: boolean;
}

export interface HatConfig {
  id: HatId;
  name: string;
  cost: number;
  description: string;
  icon: string;
}

export interface LuckyWheelPrize {
  id: string;
  label: string;
  icon: string;
  color: string;
  textColor?: string;
  type: 'COINS' | 'BOOST' | 'COSMETIC' | 'MYSTERY';
  amount?: number;
  boostType?: PowerUpType;
  hatId?: HatId;
  description: string;
}

export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH';

export type BiomeType = 'JUNGLE' | 'RUINS' | 'WATERFALL' | 'MOUNTAIN' | 'SKY';

export interface UserProgress {
  highScore: number;
  totalCoins: number;
  selectedCharacter: CharacterId;
  selectedHat: HatId;
  unlockedCharacters: CharacterId[];
  unlockedHats: HatId[];
  kidsMode: boolean;
  graphicsQuality: GraphicsQuality;
  soundEnabled: boolean;
  musicEnabled: boolean;
  showOnScreenControls: boolean;
  lastDailyRewardDate?: string;
  lastWheelSpinDate?: string;
  activeStartingBoost?: PowerUpType | null;
  totalAdsWatched?: number;
}

export interface RunStats {
  score: number;
  distance: number;
  coins: number;
  bonusPoints: number;
  powerupsCollected: number;
  milestonesReached: number[];
  reviveCount: number;
  isNewHighScore: boolean;
  currentBiome?: BiomeType;
}

export type Lane = -1 | 0 | 1;

export type ObstacleType = 
  | 'LOG'            // low - jump
  | 'ROCK'           // low - jump
  | 'MUSHROOM'       // low - jump
  | 'HIGH_VINE'      // high - slide
  | 'BAMBOO_GATE'    // high - slide
  | 'TOTEM_POLE'     // full lane block - change lane
  | 'PALM_STUMP';    // full lane block - change lane


