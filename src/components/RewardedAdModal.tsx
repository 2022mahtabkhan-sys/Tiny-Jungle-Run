import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/SoundEffects';

interface RewardedAdModalProps {
  rewardTitle: string; // e.g. "Free Revive", "+100 Coins", "2x Run Coins"
  rewardIcon?: string;
  onRewardEarned: () => void;
  onClose: () => void;
}

const AD_DURATION = 5; // 5 seconds child-friendly duration

const AD_CAMPAIGNS = [
  {
    title: '🍓 Jungle Berry Crunch!',
    subtitle: '100% Wild Fruit Snacks for Explorer Cubs',
    bgGradient: 'from-pink-600 via-rose-500 to-amber-500',
    character: '🐯',
    tagline: 'Bursting with real mango & strawberry energy!',
    badge: 'Kids Approved Snack',
  },
  {
    title: '🎒 Explorer Cub Compass Kit',
    subtitle: 'The Ultimate Safari Gear for Tiny Adventurers',
    bgGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    character: '🐼',
    tagline: 'Always find your way back to the bamboo grove!',
    badge: 'Official Jungle Gear',
  },
  {
    title: '⭐ Super Star Fruit Juice!',
    subtitle: 'Naturally Sweet & Golden Healthy Goodness',
    bgGradient: 'from-amber-500 via-yellow-500 to-orange-600',
    character: '🦊',
    tagline: 'Drink fresh, run faster, leap higher!',
    badge: 'Energy Boost',
  },
];

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  rewardTitle,
  rewardIcon = '🎁',
  onRewardEarned,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(AD_DURATION);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Pick a random campaign once
  const [campaign] = useState(() => {
    const idx = Math.floor(Math.random() * AD_CAMPAIGNS.length);
    return AD_CAMPAIGNS[idx];
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          sounds.playStar();
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.5 },
              colors: ['#ffd700', '#38b000', '#00e5ff'],
            });
          } catch (e) {
            console.warn(e);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(100, ((AD_DURATION - secondsRemaining) / AD_DURATION) * 100);

  const handleClaimReward = () => {
    sounds.playBonus();
    onRewardEarned();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md font-fredoka animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-stone-900 border-4 border-yellow-400 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white relative">
        {/* Ad Header Bar */}
        <div className="bg-stone-950/90 px-4 py-2 flex items-center justify-between text-xs text-stone-300 border-b border-stone-800">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Child-Safe Interactive Ad</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundMuted((v) => !v)}
              className="text-stone-400 hover:text-white transition-colors"
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="bg-yellow-400/20 text-yellow-300 font-bold px-2 py-0.5 rounded-full">
              {isCompleted ? 'Finished!' : `Reward in ${secondsRemaining}s`}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-stone-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-lime-400 transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Animated Creative Ad Body */}
        <div className={`p-6 sm:p-8 bg-gradient-to-b ${campaign.bgGradient} flex flex-col items-center text-center relative min-h-[260px] justify-center`}>
          {/* Badge */}
          <div className="inline-block bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 shadow-sm">
            {campaign.badge}
          </div>

          {/* Animated Mascot */}
          <div className="text-6xl sm:text-7xl mb-3 animate-bounce drop-shadow-lg select-none">
            {campaign.character}
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md mb-1 leading-tight">
            {campaign.title}
          </h3>

          <p className="text-white/90 text-sm font-sans font-medium max-w-xs mb-3">
            {campaign.subtitle}
          </p>

          <div className="bg-white/15 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-yellow-100 flex items-center gap-1.5 shadow-inner">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>{campaign.tagline}</span>
          </div>
        </div>

        {/* Reward Bottom Bar */}
        <div className="bg-stone-950 p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-400 font-sans">Earning Reward:</span>
            <span className="text-yellow-300 font-black flex items-center gap-1.5">
              <span>{rewardIcon}</span>
              <span>{rewardTitle}</span>
            </span>
          </div>

          {isCompleted ? (
            <button
              onClick={handleClaimReward}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-lime-500 via-emerald-500 to-green-600 hover:brightness-110 active:scale-95 text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 border-2 border-lime-200 transition-all cursor-pointer animate-pulse"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>CLAIM {rewardTitle.toUpperCase()}!</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 py-3 px-4 bg-stone-800/80 rounded-2xl text-stone-400 text-center font-bold text-sm">
                Playing Sponsor Video... ({secondsRemaining}s)
              </div>
              <button
                onClick={onClose}
                className="py-3 px-3 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs font-semibold rounded-2xl transition-colors cursor-pointer"
                title="Cancel Video"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
