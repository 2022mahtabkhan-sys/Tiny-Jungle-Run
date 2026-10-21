import React from 'react';
import { BonusNotification, PowerUpActive } from '../types/game';
import { Pause, Volume2, VolumeX, Shield, Magnet, Zap, Sparkles, Gamepad2, Flame } from 'lucide-react';

interface HUDProps {
  score: number;
  distance: number;
  coins: number;
  bonusPoints?: number;
  multiplier?: number;
  biome?: string;
  powerUps: PowerUpActive[];
  bonusNotification?: BonusNotification | null;
  isKidsMode: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  showOnScreenControls: boolean;
  onToggleControls: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  distance,
  coins,
  multiplier = 1,
  biome = 'JUNGLE',
  powerUps,
  bonusNotification,
  isKidsMode,
  soundEnabled,
  onToggleSound,
  onPause,
  showOnScreenControls,
  onToggleControls,
}) => {
  const biomeLabels: Record<string, { label: string; icon: string; color: string }> = {
    JUNGLE: { label: 'Jungle Canopy', icon: '🌴', color: 'bg-emerald-900/80 border-emerald-400 text-emerald-200' },
    RUINS: { label: 'Ancient Ruins', icon: '🏛️', color: 'bg-amber-900/80 border-amber-300 text-amber-200' },
    WATERFALL: { label: 'Waterfall Canyon', icon: '🌊', color: 'bg-cyan-900/80 border-cyan-300 text-cyan-200' },
    MOUNTAIN: { label: 'Highland Forest', icon: '🌲', color: 'bg-slate-900/80 border-slate-400 text-slate-200' },
    SKY: { label: 'Sky Flight', icon: '🪽', color: 'bg-sky-600/90 border-yellow-300 text-white animate-pulse' },
  };

  const currentBiomeInfo = biomeLabels[biome] || biomeLabels.JUNGLE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 z-20">
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Distance & Score & Multiplier */}
        <div className="flex flex-col gap-1.5">
          <div className="bg-amber-950/85 border-2 border-amber-400/90 rounded-2xl px-4 py-1.5 shadow-lg flex items-center gap-2 backdrop-blur-xs">
            <span className="text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider">Score</span>
            <span className="text-white text-lg sm:text-2xl font-black font-fredoka">{score}</span>
            {multiplier > 1 && (
              <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg shadow-md animate-bounce flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {multiplier}X
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-emerald-950/80 border border-emerald-400/80 rounded-xl px-3 py-1 text-xs sm:text-sm text-emerald-200 font-bold shadow-md">
              🏃 {distance}m
            </div>
            <div className={`border rounded-xl px-2.5 py-1 text-xs font-bold shadow-md flex items-center gap-1 ${currentBiomeInfo.color}`}>
              <span>{currentBiomeInfo.icon}</span>
              <span className="hidden sm:inline">{currentBiomeInfo.label}</span>
            </div>
            {isKidsMode && (
              <div className="bg-pink-600/90 border border-pink-300 rounded-xl px-2.5 py-1 text-xs font-bold text-white shadow-md flex items-center gap-1">
                ⭐ Kids Safe
              </div>
            )}
          </div>
        </div>

        {/* Center: Active Power-up Timers */}
        <div className="flex flex-wrap gap-2 justify-center max-w-[40%]">
          {powerUps.map((pu) => {
            const pct = Math.max(0, (pu.timeLeft / pu.duration) * 100);
            return (
              <div
                key={pu.type}
                className="bg-slate-900/90 border-2 border-yellow-400 rounded-2xl px-2.5 py-1.5 shadow-xl flex items-center gap-1.5 animate-pulse"
              >
                {pu.type === 'FLYING' && <span className="text-base select-none">🪽</span>}
                {pu.type === 'SHIELD' && <Shield className="w-5 h-5 text-cyan-300" />}
                {pu.type === 'MAGNET' && <Magnet className="w-5 h-5 text-rose-400" />}
                {pu.type === 'BOOST' && <Zap className="w-5 h-5 text-amber-300" />}
                {pu.type === 'DOUBLE_POINTS' && <Flame className="w-5 h-5 text-orange-400" />}
                {pu.type === 'DOUBLE_COIN' && <Sparkles className="w-5 h-5 text-purple-400" />}
                <div className="w-12 h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${
                      pu.type === 'FLYING'
                        ? 'bg-gradient-to-r from-cyan-400 to-sky-300'
                        : 'bg-gradient-to-r from-yellow-400 to-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Coins Counter & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Coins Badge */}
          <div className="bg-amber-500/90 border-2 border-yellow-200 rounded-2xl px-3 sm:px-4 py-1.5 shadow-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-300 border-2 border-yellow-600 flex items-center justify-center text-xs font-black text-amber-900 shadow-inner animate-bounce">
              🪙
            </div>
            <span className="text-white text-lg sm:text-2xl font-black font-fredoka drop-shadow-md">
              {coins}
            </span>
          </div>

          {/* Controls toggle */}
          <button
            onClick={onToggleControls}
            className={`pointer-events-auto w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-transform active:scale-90 shadow-md ${
              showOnScreenControls
                ? 'bg-amber-600/90 border-amber-300 text-white'
                : 'bg-stone-800/80 border-stone-600 text-stone-300'
            }`}
            title="Toggle On-Screen Buttons"
          >
            <Gamepad2 className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="pointer-events-auto w-10 h-10 rounded-2xl bg-amber-950/80 border-2 border-amber-400/80 text-amber-300 flex items-center justify-center transition-transform active:scale-90 shadow-md"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="pointer-events-auto w-10 h-10 rounded-2xl bg-amber-500 border-2 border-yellow-200 text-amber-950 flex items-center justify-center font-black transition-transform active:scale-90 shadow-md"
            title="Pause Game"
          >
            <Pause className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      {/* Floating Animated Bonus Toast Notification */}
      {bonusNotification && (
        <div className="self-center mb-auto mt-6 pointer-events-none transition-all duration-300 transform scale-105 animate-bounce">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-3 border-white rounded-3xl px-5 py-2.5 shadow-2xl flex items-center gap-3 text-amber-950 font-fredoka">
            <span className="text-2xl drop-shadow-sm">{bonusNotification.icon}</span>
            <div className="flex flex-col text-left">
              <span className="font-black text-base sm:text-lg leading-tight tracking-wide drop-shadow-xs">
                {bonusNotification.title}
              </span>
              {bonusNotification.subtitle && (
                <span className="text-xs font-bold text-amber-900/90 font-sans">
                  {bonusNotification.subtitle}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
