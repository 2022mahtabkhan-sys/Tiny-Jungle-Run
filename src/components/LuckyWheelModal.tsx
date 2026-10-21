import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, X, Play, Coins, Film, CheckCircle, ArrowDown } from 'lucide-react';
import { HatId, LuckyWheelPrize, PowerUpType, UserProgress } from '../types/game';
import { sounds } from '../audio/SoundEffects';

interface LuckyWheelModalProps {
  progress: UserProgress;
  canSpinFree: boolean;
  onClaimPrize: (prize: LuckyWheelPrize) => void;
  onWatchAdForSpin: () => void;
  onSpinWithCoins: (cost: number) => void;
  onClose: () => void;
}

export const WHEEL_PRIZES: LuckyWheelPrize[] = [
  {
    id: 'coins-50',
    label: '50 Coins',
    icon: '🪙',
    color: '#f59e0b',
    type: 'COINS',
    amount: 50,
    description: 'Adds +50 sparkling jungle coins to your bank!',
  },
  {
    id: 'boost-flying',
    label: 'Magic Wings',
    icon: '🪽',
    color: '#06b6d4',
    type: 'BOOST',
    boostType: 'FLYING',
    description: 'Fly high above the jungle & obstacles on your next run!',
  },
  {
    id: 'coins-100',
    label: '100 Coins',
    icon: '💰',
    color: '#10b981',
    type: 'COINS',
    amount: 100,
    description: 'Adds +100 shiny coins directly to your pouch!',
  },
  {
    id: 'hat-safari',
    label: 'Mystery Hat',
    icon: '🎩',
    color: '#8b5cf6',
    type: 'COSMETIC',
    description: 'Unlocks a rare stylish hat (or +150 Coins if all unlocked)!',
  },
  {
    id: 'boost-double',
    label: '2X Points',
    icon: '🔥',
    color: '#f97316',
    type: 'BOOST',
    boostType: 'DOUBLE_POINTS',
    description: 'Doubles all score points during your next run!',
  },
  {
    id: 'coins-250',
    label: '250 Coins!',
    icon: '🏆',
    color: '#eab308',
    type: 'COINS',
    amount: 250,
    description: 'Mega Jackpot! Adds +250 coins to your treasure chest!',
  },
  {
    id: 'boost-magnet',
    label: 'Coin Magnet',
    icon: '🧲',
    color: '#ec4899',
    type: 'BOOST',
    boostType: 'MAGNET',
    description: 'Starts your next run with a 15-second Coin Magnet active!',
  },
  {
    id: 'mystery-gift',
    label: 'Golden Gift',
    icon: '🎁',
    color: '#3b82f6',
    type: 'MYSTERY',
    description: 'Lucky surprise! Grants +150 Coins and instant Star Shield Boost!',
  },
];

const EXTRA_SPIN_COIN_COST = 35;
const SEGMENT_COUNT = WHEEL_PRIZES.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT; // 45 degrees

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  progress,
  canSpinFree,
  onClaimPrize,
  onWatchAdForSpin,
  onSpinWithCoins,
  onClose,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [wonPrize, setWonPrize] = useState<LuckyWheelPrize | null>(null);
  const [cosmeticUnlockName, setCosmeticUnlockName] = useState<string | null>(null);

  const lastTickSegmentRef = useRef<number>(-1);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const startRotationRef = useRef<number>(0);
  const targetRotationRef = useRef<number>(0);
  const spinDurationRef = useRef<number>(4500);

  const canAffordCoins = progress.totalCoins >= EXTRA_SPIN_COIN_COST;

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const startSpinSequence = (targetPrizeIndex: number, onComplete: () => void) => {
    setIsSpinning(true);
    setWonPrize(null);
    setCosmeticUnlockName(null);

    // Target prize calculation:
    // Segment 0 is centered at 0 deg (12 o'clock).
    // Segment i is centered at i * 45 deg clockwise.
    // To land on index i under top pointer:
    // Final wheel rotation R such that (-R mod 360) = i * 45 deg.
    // R = 360 * N - i * 45 + random offset within [-14, +14] degrees.
    const fullTurns = 6 + Math.floor(Math.random() * 3); // 6 to 8 full revolutions
    const sliceJitter = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.65); // stay comfortably within wedge
    const finalRot = rotationDegrees + (fullTurns * 360) - (targetPrizeIndex * SEGMENT_ANGLE) + sliceJitter;

    startRotationRef.current = rotationDegrees;
    targetRotationRef.current = finalRot;
    startTimeRef.current = performance.now();
    spinDurationRef.current = 4200 + Math.random() * 400; // 4.2 - 4.6 seconds

    // Ease-out cubic with smooth settling
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progressRatio = Math.min(1, elapsed / spinDurationRef.current);

      // Decelerating quintic ease-out: 1 - pow(1 - p, 5)
      const ease = 1 - Math.pow(1 - progressRatio, 4.5);
      const currentRot = startRotationRef.current + (targetRotationRef.current - startRotationRef.current) * ease;
      setRotationDegrees(currentRot);

      // Ticking sound calculation
      // Normalized angle modulo 360
      const currentAngleNorm = ((currentRot % 360) + 360) % 360;
      const currentSegment = Math.floor(currentAngleNorm / SEGMENT_ANGLE);
      if (currentSegment !== lastTickSegmentRef.current) {
        lastTickSegmentRef.current = currentSegment;
        sounds.playWheelTick();
      }

      if (progressRatio < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished!
        setIsSpinning(false);
        sounds.playWheelWin();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.5 },
            colors: ['#ffd700', '#ff006e', '#00f5d4', '#7b2cbf', '#ff9f1c'],
          });
        } catch (e) {
          console.warn(e);
        }
        onComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const executeSpin = (consumeFree: boolean, consumeCoins = false) => {
    if (isSpinning) return;

    if (consumeCoins) {
      onSpinWithCoins(EXTRA_SPIN_COIN_COST);
    }

    // Pick winning prize
    // Weighted selection: high chance for coins, boosts, mystery gifts, and hats
    const targetIdx = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const prize = WHEEL_PRIZES[targetIdx];

    startSpinSequence(targetIdx, () => {
      setWonPrize(prize);

      // Check cosmetic details
      if (prize.type === 'COSMETIC') {
        const lockedHats: HatId[] = (['explorer', 'crown', 'party', 'flower', 'scarf'] as HatId[]).filter(
          (h) => !progress.unlockedHats.includes(h)
        );
        if (lockedHats.length > 0) {
          setCosmeticUnlockName(lockedHats[0].toUpperCase());
        }
      }
    });
  };

  const handleClaim = () => {
    if (!wonPrize) return;
    sounds.playBonus();
    onClaimPrize(wonPrize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-fredoka animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg bg-gradient-to-b from-amber-900 via-emerald-950 to-stone-950 border-4 border-amber-400 rounded-3xl shadow-2xl p-5 sm:p-6 text-white text-center flex flex-col items-center relative overflow-hidden my-auto">
        {/* Glow behind wheel */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          disabled={isSpinning}
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-600 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
          <h2 className="text-2xl sm:text-3xl font-black text-amber-200 uppercase tracking-wide">
            Jungle Lucky Wheel
          </h2>
          <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
        </div>
        <p className="text-xs sm:text-sm text-amber-100/90 font-sans mb-3">
          Spin every day to win free coins, wild cosmetic hats, and powerful boosts!
        </p>

        {/* --- The Wheel Container --- */}
        <div className="relative my-2 flex items-center justify-center">
          {/* Top Pointer Indicator Arrow */}
          <div className="absolute -top-3 z-30 flex flex-col items-center drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
            <div className="w-8 h-8 bg-gradient-to-b from-yellow-300 to-amber-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-bounce">
              <ArrowDown className="w-5 h-5 text-amber-950 stroke-[3]" />
            </div>
          </div>

          {/* Golden Outer Decorative Bezel with Jungle Screws/Bulbs */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full p-2.5 bg-gradient-to-b from-yellow-300 via-amber-600 to-amber-900 border-4 border-yellow-200 shadow-2xl flex items-center justify-center relative">
            {/* Spinning Wheel Graphic SVG */}
            <div
              className="w-full h-full rounded-full overflow-hidden shadow-inner relative"
              style={{
                transform: `rotate(${rotationDegrees}deg)`,
                transition: isSpinning ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  {WHEEL_PRIZES.map((prize, idx) => (
                    <clipPath id={`slice-${idx}`} key={idx}>
                      <path d="M 200 200 L 400 200 A 200 200 0 0 1 341.42 341.42 Z" />
                    </clipPath>
                  ))}
                </defs>

                {/* 8 Slices */}
                {WHEEL_PRIZES.map((prize, idx) => {
                  // Angle for slice center: idx * 45 deg.
                  // Slice path starts at -22.5 deg to +22.5 deg around 0 deg (12 o'clock)
                  const startAngle = (idx * SEGMENT_ANGLE - 22.5) * (Math.PI / 180);
                  const endAngle = (idx * SEGMENT_ANGLE + 22.5) * (Math.PI / 180);
                  const x1 = 200 + 196 * Math.sin(startAngle);
                  const y1 = 200 - 196 * Math.cos(startAngle);
                  const x2 = 200 + 196 * Math.sin(endAngle);
                  const y2 = 200 - 196 * Math.cos(endAngle);

                  const pathD = `M 200 200 L ${x1} ${y1} A 196 196 0 0 1 ${x2} ${y2} Z`;

                  // Text & Icon Angle: center of the wedge
                  const centerAngleDeg = idx * SEGMENT_ANGLE;
                  const rad = centerAngleDeg * (Math.PI / 180);
                  // Text position at radius ~132
                  const textX = 200 + 130 * Math.sin(rad);
                  const textY = 200 - 130 * Math.cos(rad);
                  const iconX = 200 + 72 * Math.sin(rad);
                  const iconY = 200 - 72 * Math.cos(rad);

                  return (
                    <g key={prize.id}>
                      {/* Wedge Slice */}
                      <path
                        d={pathD}
                        fill={prize.color}
                        stroke="#ffffff"
                        strokeWidth="3.5"
                      />

                      {/* Icon */}
                      <text
                        x={iconX}
                        y={iconY}
                        fontSize="22"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${centerAngleDeg}, ${iconX}, ${iconY})`}
                      >
                        {prize.icon}
                      </text>

                      {/* Label */}
                      <text
                        x={textX}
                        y={textY}
                        fontSize="13"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#ffffff"
                        stroke="#000000"
                        strokeWidth="2.5"
                        paintOrder="stroke fill"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${centerAngleDeg}, ${textX}, ${textY})`}
                      >
                        {prize.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Wooden/Gold Hub & Mascot Paw */}
            <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 border-4 border-yellow-200 shadow-2xl flex items-center justify-center z-20 pointer-events-none">
              <span className="text-2xl sm:text-3xl select-none">🐾</span>
            </div>
          </div>
        </div>

        {/* --- Prize Reveal Card (When Won) --- */}
        {wonPrize ? (
          <div className="w-full bg-amber-950/90 border-3 border-yellow-400 rounded-2xl p-4 my-2.5 flex flex-col items-center animate-in zoom-in-95 duration-200 shadow-xl">
            <div className="text-3xl mb-1">{wonPrize.icon}</div>
            <div className="text-xs uppercase text-amber-300 font-bold tracking-wider">
              You Won!
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-fredoka">
              {wonPrize.label}
            </div>
            <div className="text-xs text-amber-100/90 font-sans max-w-xs mt-0.5 mb-3">
              {wonPrize.type === 'COSMETIC' && cosmeticUnlockName
                ? `Unlocked special ${cosmeticUnlockName} Hat!`
                : wonPrize.description}
            </div>

            <button
              onClick={handleClaim}
              className="py-3 px-8 bg-gradient-to-r from-lime-500 via-emerald-500 to-green-600 hover:brightness-110 active:scale-95 text-white font-black text-lg rounded-2xl shadow-lg border-2 border-white flex items-center gap-2 cursor-pointer transition-transform"
            >
              <CheckCircle className="w-5 h-5" />
              <span>COLLECT REWARD!</span>
            </button>
          </div>
        ) : (
          /* --- Action Buttons: Free Spin / Watch Ad / Coins --- */
          <div className="w-full flex flex-col gap-2.5 mt-3">
            {canSpinFree ? (
              <button
                disabled={isSpinning}
                onClick={() => executeSpin(true)}
                className="w-full py-4 bg-gradient-to-r from-lime-400 via-emerald-500 to-green-600 hover:brightness-110 active:scale-95 text-white font-black text-xl rounded-2xl shadow-xl border-2 border-yellow-200 flex items-center justify-center gap-2 transition-transform cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-6 h-6 text-yellow-200" />
                <span>{isSpinning ? 'SPINNING...' : 'FREE DAILY SPIN!'}</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="bg-stone-900/80 border border-stone-700 rounded-xl py-1.5 px-3 text-xs text-amber-200/90">
                  Daily Free Spin used for today! Try an extra spin:
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Watch Ad for Spin */}
                  <button
                    disabled={isSpinning}
                    onClick={onWatchAdForSpin}
                    className="py-3 px-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 active:scale-95 border-2 border-emerald-300 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-transform cursor-pointer disabled:opacity-50"
                  >
                    <Film className="w-4 h-4 text-emerald-200" />
                    <span>Watch Ad for Spin 🎥</span>
                  </button>

                  {/* Spin with Coins */}
                  <button
                    disabled={isSpinning || !canAffordCoins}
                    onClick={() => executeSpin(false, true)}
                    className={`py-3 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-transform ${
                      canAffordCoins && !isSpinning
                        ? 'bg-amber-600 hover:bg-amber-500 border-amber-300 text-white active:scale-95 cursor-pointer'
                        : 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-yellow-300" />
                    <span>Spin for {EXTRA_SPIN_COIN_COST} 🪙</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
