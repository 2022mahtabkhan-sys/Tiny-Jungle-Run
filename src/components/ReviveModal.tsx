import React, { useEffect, useState } from 'react';
import { Heart, Play, Coins, X, Sparkles, Shield } from 'lucide-react';
import { RunStats } from '../types/game';
import { sounds } from '../audio/SoundEffects';

interface ReviveModalProps {
  stats: RunStats;
  totalCoins: number;
  isKidsMode: boolean;
  onReviveWithAd: () => void;
  onReviveWithCoins: () => void;
  onGiveUp: () => void;
}

const REVIVE_COIN_COST = 25;
const COUNTDOWN_SECONDS = 6;

export const ReviveModal: React.FC<ReviveModalProps> = ({
  stats,
  totalCoins,
  isKidsMode,
  onReviveWithAd,
  onReviveWithCoins,
  onGiveUp,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const canAffordCoins = totalCoins >= REVIVE_COIN_COST;

  useEffect(() => {
    if (secondsLeft <= 0) {
      onGiveUp();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, onGiveUp]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs font-fredoka animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-900 via-emerald-950 to-stone-950 border-4 border-amber-400 rounded-3xl p-6 shadow-2xl text-white text-center flex flex-col items-center relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Circular Countdown Progress Badge */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-950 border-4 border-yellow-300 flex items-center justify-center shadow-lg relative">
            <Heart className="w-10 h-10 text-rose-500 fill-rose-500 animate-pulse" />
            <div className="absolute -bottom-2 bg-yellow-400 text-stone-900 font-black px-2.5 py-0.5 rounded-full text-xs shadow-md">
              {secondsLeft}s
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-200 mb-1">
          Keep Running?
        </h2>
        <p className="text-amber-100/90 text-xs sm:text-sm font-sans mb-4">
          Save your run! You have reached <span className="font-bold text-yellow-300">{stats.distance}m</span> with <span className="font-bold text-yellow-300">{stats.coins} coins</span>!
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Watch Ad Free Revive Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onReviveWithAd();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:brightness-110 active:scale-95 border-2 border-emerald-200 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg transition-transform cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <span>Watch Short Ad (Free)</span>
          </button>

          {/* Revive with Coins or Kids Mode Free */}
          {isKidsMode ? (
            <button
              onClick={() => {
                sounds.playClick();
                onReviveWithCoins();
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-110 active:scale-95 border-2 border-pink-200 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-transform cursor-pointer"
            >
              <Shield className="w-5 h-5 text-yellow-200" />
              <span>Kids Mode Free Revive ⭐</span>
            </button>
          ) : (
            <button
              disabled={!canAffordCoins}
              onClick={() => {
                if (canAffordCoins) {
                  sounds.playClick();
                  onReviveWithCoins();
                }
              }}
              className={`w-full py-3 px-4 rounded-2xl border-2 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-transform shadow-md ${
                canAffordCoins
                  ? 'bg-amber-600 hover:bg-amber-500 border-amber-300 text-white active:scale-95 cursor-pointer'
                  : 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed opacity-75'
              }`}
            >
              <Coins className="w-5 h-5 text-yellow-300" />
              <span>Use {REVIVE_COIN_COST} Coins ({totalCoins} available)</span>
            </button>
          )}

          {/* Give up Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onGiveUp();
            }}
            className="w-full py-2.5 px-3 bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
          >
            <X className="w-4 h-4" />
            <span>End Run & View Score</span>
          </button>
        </div>

        {/* Protection promise banner */}
        <div className="mt-3 text-[11px] text-emerald-300/80 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Includes 3.5s shield + obstacle clear!</span>
        </div>
      </div>
    </div>
  );
};
