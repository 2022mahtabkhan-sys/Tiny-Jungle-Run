import React from 'react';
import { Play, Sparkles, HelpCircle, Volume2, VolumeX, Music, ShieldCheck, Trophy, Coins, Gift, Film } from 'lucide-react';
import { CharacterId, GraphicsQuality, HatId, PowerUpType } from '../types/game';
import { sounds } from '../audio/SoundEffects';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenCharacters: () => void;
  onOpenHowToPlay: () => void;
  onOpenDownloadApk: () => void;
  onClaimDailyReward: () => void;
  onWatchAdForCoins: () => void;
  onOpenLuckyWheel: () => void;
  canClaimDailyReward: boolean;
  canSpinLuckyWheel: boolean;
  activeStartingBoost?: PowerUpType | null;
  highScore: number;
  totalCoins: number;
  selectedCharacter: CharacterId;
  selectedHat: HatId;
  kidsMode: boolean;
  onToggleKidsMode: () => void;
  graphicsQuality: GraphicsQuality;
  onToggleGraphicsQuality: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenCharacters,
  onOpenHowToPlay,
  onOpenDownloadApk,
  onClaimDailyReward,
  onWatchAdForCoins,
  onOpenLuckyWheel,
  canClaimDailyReward,
  canSpinLuckyWheel,
  activeStartingBoost,
  highScore,
  totalCoins,
  selectedCharacter,
  selectedHat,
  kidsMode,
  onToggleKidsMode,
  graphicsQuality,
  onToggleGraphicsQuality,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
}) => {
  const characterEmoji = {
    tiger: '🐯',
    panda: '🐼',
    bunny: '🐰',
    fox: '🦊',
  }[selectedCharacter];

  const hatEmoji = {
    none: '',
    explorer: '🧭',
    crown: '👑',
    party: '🎉',
    flower: '🌸',
    scarf: '🧣',
  }[selectedHat];

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-emerald-950/70 via-transparent to-amber-950/80 pointer-events-auto overflow-y-auto font-fredoka">
      {/* Top Header Stats & Settings */}
      <div className="w-full max-w-xl flex items-center justify-between gap-3">
        {/* High Score Badge */}
        <div className="bg-amber-900/85 border-2 border-amber-400 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <div>
            <div className="text-[10px] text-amber-200 uppercase font-bold tracking-wider">Best Score</div>
            <div className="text-white text-base sm:text-lg font-black font-fredoka">{highScore}</div>
          </div>
        </div>

        {/* Coins Badge */}
        <div className="bg-yellow-500/90 border-2 border-yellow-200 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-950" />
          <div>
            <div className="text-[10px] text-amber-950 uppercase font-black tracking-wider">Coins</div>
            <div className="text-white text-base sm:text-lg font-black font-fredoka drop-shadow-sm">{totalCoins}</div>
          </div>
        </div>

        {/* Audio & Graphics Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Graphics Quality Toggle */}
          <button
            onClick={onToggleGraphicsQuality}
            className="h-10 px-2 sm:px-2.5 rounded-2xl bg-stone-900/85 border-2 border-emerald-400/80 text-emerald-300 text-[11px] sm:text-xs font-black flex items-center gap-1 shadow-md hover:bg-stone-800 transition-all cursor-pointer"
            title="Toggle 3D Graphics Quality (Low / Medium / High)"
          >
            <span className="text-[10px] text-stone-400 font-bold">3D:</span>
            <span>{graphicsQuality}</span>
          </button>

          <button
            onClick={onToggleMusic}
            className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-transform active:scale-90 shadow-md cursor-pointer ${
              musicEnabled
                ? 'bg-amber-600/90 border-amber-300 text-white'
                : 'bg-stone-800/80 border-stone-600 text-stone-400'
            }`}
            title="Toggle Music"
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleSound}
            className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-transform active:scale-90 shadow-md cursor-pointer ${
              soundEnabled
                ? 'bg-amber-600/90 border-amber-300 text-white'
                : 'bg-stone-800/80 border-stone-600 text-stone-400'
            }`}
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Center Title & Mascot */}
      <div className="flex flex-col items-center my-auto text-center py-2">
        {/* Game Title with Cartoon Wooden Jungle Board Styling */}
        <div className="relative mb-2 sm:mb-4">
          <div className="inline-block bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 border-4 sm:border-6 border-amber-200 rounded-3xl px-6 sm:px-10 py-3 sm:py-5 shadow-2xl transform -rotate-1">
            <div className="text-amber-200 text-xs sm:text-sm font-black tracking-widest uppercase mb-0.5">
              🌿 Endless 3D Adventure 🌿
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-fredoka tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
              Tiny Jungle Run
            </h1>
          </div>
          {/* Cute Paw Stamp */}
          <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 bg-amber-400 rounded-full border-3 border-amber-100 flex items-center justify-center text-xl sm:text-2xl shadow-lg rotate-12">
            🐾
          </div>
        </div>

        {/* Selected Mascot Badge */}
        <div className="flex items-center gap-2 bg-emerald-900/80 border-2 border-emerald-400/80 rounded-full px-4 py-1.5 shadow-md mb-3 text-emerald-200 text-sm font-bold">
          <span className="text-2xl">{characterEmoji}</span>
          <span>Runner Ready {hatEmoji && <span>with {hatEmoji}</span>}</span>
        </div>

        {/* Starting Boost Active Indicator Badge (if won from wheel) */}
        {activeStartingBoost && (
          <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-2 border-white rounded-full px-4 py-1 text-xs sm:text-sm font-black text-stone-900 mb-3 shadow-lg flex items-center gap-1.5 animate-bounce">
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>Next Run Boost Ready: </span>
            <span>
              {activeStartingBoost === 'FLYING' && '🪽 Magic Flying Wings (14s)!'}
              {activeStartingBoost === 'SHIELD' && '🛡️ Star Shield (15s)!'}
              {activeStartingBoost === 'MAGNET' && '🧲 Mega Magnet (15s)!'}
              {activeStartingBoost === 'DOUBLE_POINTS' && '🔥 2X Points (15s)!'}
              {activeStartingBoost === 'BOOST' && '🍌 Banana Boost (6s)!'}
            </span>
          </div>
        )}

        {/* Big Juicy PLAY Button */}
        <button
          onClick={onStartGame}
          className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-full bg-gradient-to-b from-lime-400 via-emerald-500 to-green-600 border-4 border-yellow-200 text-white font-black text-2xl sm:text-3xl font-fredoka shadow-2xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-current stroke-emerald-900 stroke-[2] drop-shadow-sm" />
          <span>PLAY NOW</span>
        </button>

        {/* Reward Quick-Actions Row (Lucky Wheel + Daily Gift + Free Ad Coins) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-lg">
          {/* Lucky Wheel Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLuckyWheel();
            }}
            className={`py-2 px-3.5 rounded-2xl border-2 flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer ${
              canSpinLuckyWheel
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 border-yellow-200 text-white animate-pulse active:scale-95'
                : 'bg-stone-900/80 border-stone-700 text-stone-300 hover:text-white'
            }`}
          >
            <span className="text-base select-none">🎡</span>
            <span>{canSpinLuckyWheel ? 'Lucky Wheel (Free Spin!)' : 'Lucky Wheel'}</span>
          </button>

          {/* Daily Gift Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClaimDailyReward();
            }}
            className={`py-2 px-3.5 rounded-2xl border-2 flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer ${
              canClaimDailyReward
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 border-white text-stone-900 animate-pulse active:scale-95'
                : 'bg-stone-900/80 border-stone-700 text-stone-400 opacity-80'
            }`}
          >
            <Gift className={`w-4 h-4 ${canClaimDailyReward ? 'text-amber-950 animate-bounce' : 'text-stone-500'}`} />
            <span>{canClaimDailyReward ? 'Daily Gift (+50 🪙)!' : 'Daily Gift Claimed'}</span>
          </button>

          {/* Watch Ad for +100 Coins */}
          <button
            onClick={() => {
              sounds.playClick();
              onWatchAdForCoins();
            }}
            className="py-2 px-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 border-2 border-emerald-300 text-white flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Film className="w-4 h-4 text-emerald-200" />
            <span>Watch Short Ad (+100 🪙)</span>
          </button>
        </div>
      </div>

      {/* Bottom Menu Navigation & Kids Mode Bar */}
      <div className="w-full max-w-xl flex flex-col gap-2.5 pb-2">
        {/* Kids Mode Toggle Banner */}
        <button
          onClick={onToggleKidsMode}
          className={`w-full py-2.5 px-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer shadow-md ${
            kidsMode
              ? 'bg-gradient-to-r from-pink-500/90 to-rose-600/90 border-pink-200 text-white shadow-pink-900/40'
              : 'bg-stone-900/80 border-stone-600 text-stone-300'
          }`}
        >
          <div className="flex items-center gap-2.5 text-left">
            <ShieldCheck className={`w-6 h-6 ${kidsMode ? 'text-pink-200' : 'text-stone-400'}`} />
            <div>
              <div className="text-sm font-black font-fredoka">Kids Mode {kidsMode ? 'ON' : 'OFF'}</div>
              <div className="text-xs opacity-90">Gentle speed, wider lanes & extra shields</div>
            </div>
          </div>
          <div
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              kidsMode ? 'bg-pink-300' : 'bg-stone-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                kidsMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </button>

        {/* Download Android APK Banner */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenDownloadApk();
          }}
          className="w-full py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 hover:brightness-110 border-2 border-green-300 text-white flex items-center justify-between shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-left">
            <span className="text-2xl sm:text-3xl select-none">🤖</span>
            <div>
              <div className="text-xs sm:text-sm font-black font-fredoka flex items-center gap-1.5 sm:gap-2">
                <span>Download Android APK</span>
                <span className="bg-emerald-950/80 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded-md border border-emerald-400/60">
                  v1.2.0 • 18MB
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-100/90 font-sans">
                Native 60 FPS 3D runner for Android phones & tablets
              </div>
            </div>
          </div>
          <span className="text-xs bg-white text-emerald-950 font-black px-2.5 py-1 rounded-xl shadow-xs shrink-0">
            GET APK
          </span>
        </button>

        {/* Secondary Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenCharacters}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-600/90 border-2 border-amber-300 text-white font-bold text-sm sm:text-base font-fredoka shadow-md hover:bg-amber-500 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span>Character Selection</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-sky-700/90 border-2 border-sky-300 text-white font-bold text-sm sm:text-base font-fredoka shadow-md hover:bg-sky-600 active:scale-95 transition-all cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-sky-200" />
            <span>How to Play</span>
          </button>
        </div>
      </div>
    </div>
  );
};
