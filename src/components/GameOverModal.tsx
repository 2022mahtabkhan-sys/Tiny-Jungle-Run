import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Sparkles, Trophy, Coins, Footprints, Play, Award, Star } from 'lucide-react';
import { RunStats } from '../types/game';
import { sounds } from '../audio/SoundEffects';

interface GameOverModalProps {
  stats: RunStats;
  highScore: number;
  totalCoins: number;
  hasDoubledCoins?: boolean;
  onDoubleCoinsWithAd: () => void;
  onPlayAgain: () => void;
  onOpenCharacters: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  totalCoins,
  hasDoubledCoins = false,
  onDoubleCoinsWithAd,
  onPlayAgain,
  onOpenCharacters,
  onMainMenu,
}) => {
  const isNewRecord = stats.score > highScore && stats.score > 0;

  useEffect(() => {
    if (isNewRecord) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#ff8c2b', '#38b000', '#00c8ff', '#ff006e'],
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
    }
  }, [isNewRecord]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs font-fredoka overflow-y-auto">
      <div className="w-full max-w-md bg-gradient-to-b from-amber-900 via-amber-950 to-emerald-950 border-4 border-amber-400 rounded-3xl shadow-2xl p-5 sm:p-6 text-white text-center flex flex-col items-center my-auto">
        {/* Banner Title */}
        <div className="text-3xl mb-1">🐯✨</div>
        <h2 className="text-2xl sm:text-4xl font-black text-amber-200">
          {isNewRecord ? 'New Best Score!' : 'Awesome Adventure!'}
        </h2>
        <p className="text-amber-100/80 text-xs sm:text-sm mt-0.5 mb-4 font-sans">
          You ran so well through the wild jungle!
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-3.5">
          {/* Run Score */}
          <div className="bg-amber-950/80 border-2 border-amber-500/70 rounded-2xl p-2.5 flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-300 text-xs uppercase font-bold tracking-wider mb-0.5">
              <Trophy className="w-4 h-4" /> Score
            </div>
            <div className="text-xl sm:text-3xl font-black text-white">{stats.score}</div>
          </div>

          {/* Distance */}
          <div className="bg-emerald-950/80 border-2 border-emerald-500/70 rounded-2xl p-2.5 flex flex-col items-center">
            <div className="flex items-center gap-1 text-emerald-300 text-xs uppercase font-bold tracking-wider mb-0.5">
              <Footprints className="w-4 h-4" /> Distance
            </div>
            <div className="text-xl sm:text-3xl font-black text-white">{stats.distance}m</div>
          </div>

          {/* Coins Collected This Run */}
          <div className="bg-yellow-500/90 border-2 border-yellow-200 rounded-2xl p-2.5 flex flex-col items-center text-amber-950">
            <div className="flex items-center gap-1 text-amber-950 text-xs uppercase font-black tracking-wider mb-0.5">
              <Coins className="w-4 h-4 fill-current" /> Coins Earned
            </div>
            <div className="text-xl sm:text-3xl font-black">
              +{hasDoubledCoins ? stats.coins * 2 : stats.coins}
              {hasDoubledCoins && <span className="text-xs ml-1 text-red-900 font-extrabold">(2X!)</span>}
            </div>
          </div>

          {/* Total Bank */}
          <div className="bg-stone-900/80 border-2 border-amber-500/50 rounded-2xl p-2.5 flex flex-col items-center">
            <div className="text-amber-200/80 text-xs uppercase font-bold tracking-wider mb-0.5">
              Total Bank
            </div>
            <div className="text-xl sm:text-3xl font-black text-amber-300">{totalCoins} 🪙</div>
          </div>
        </div>

        {/* Bonus & Milestones Row */}
        {(stats.bonusPoints > 0 || (stats.milestonesReached && stats.milestonesReached.length > 0)) && (
          <div className="w-full bg-amber-950/50 border border-amber-400/40 rounded-xl p-2 mb-3.5 flex items-center justify-around text-xs">
            {stats.bonusPoints > 0 && (
              <div className="flex items-center gap-1 text-yellow-300 font-bold">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>Bonus: +{stats.bonusPoints} Pts</span>
              </div>
            )}
            {stats.milestonesReached && stats.milestonesReached.length > 0 && (
              <div className="flex items-center gap-1 text-emerald-300 font-bold">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>{stats.milestonesReached.length} Milestone{stats.milestonesReached.length > 1 ? 's' : ''}!</span>
              </div>
            )}
          </div>
        )}

        {/* Double Coins via Rewarded Ad Offer */}
        {stats.coins > 0 && !hasDoubledCoins && (
          <button
            onClick={() => {
              sounds.playClick();
              onDoubleCoinsWithAd();
            }}
            className="w-full py-3 px-4 mb-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-95 text-amber-950 font-black text-sm sm:text-base rounded-2xl shadow-lg border-2 border-white flex items-center justify-center gap-2 cursor-pointer transition-transform"
          >
            <Play className="w-4 h-4 fill-amber-950 stroke-none" />
            <span>Watch Short Ad to Double Coins (+{stats.coins} more 🪙)!</span>
          </button>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-lime-500 via-emerald-500 to-green-600 hover:brightness-110 text-white font-black text-lg sm:text-xl rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-6 h-6 stroke-[3]" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                sounds.playClick();
                onOpenCharacters();
              }}
              className="py-3 px-3 bg-amber-600/90 hover:bg-amber-500 border border-amber-300 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Characters</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onMainMenu();
              }}
              className="py-3 px-3 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-amber-200 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              <Home className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
