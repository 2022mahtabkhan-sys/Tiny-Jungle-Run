/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameWorld } from './game/GameWorld';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { MainMenu } from './components/MainMenu';
import { CharacterSelectScreen } from './components/CharacterSelectScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { ReviveModal } from './components/ReviveModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { LuckyWheelModal } from './components/LuckyWheelModal';
import { loadProgress, saveProgress } from './utils/storage';
import {
  BonusNotification,
  CharacterId,
  GameState,
  HatId,
  LuckyWheelPrize,
  PowerUpActive,
  PowerUpType,
  RunStats,
  UserProgress,
} from './types/game';
import { sounds } from './audio/SoundEffects';

interface ActiveAdSession {
  rewardTitle: string;
  rewardIcon: string;
  onReward: () => void;
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const gameWorldRef = useRef<GameWorld | null>(null);
  const bonusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persistent Progress & Settings
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  // Current Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentScore, setCurrentScore] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [currentCoins, setCurrentCoins] = useState(0);
  const [currentBonusPoints, setCurrentBonusPoints] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [activePowerUps, setActivePowerUps] = useState<PowerUpActive[]>([]);
  const [lastRunStats, setLastRunStats] = useState<RunStats | null>(null);
  const [hasDoubledCoins, setHasDoubledCoins] = useState(false);

  // Modals & Notifications
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showLuckyWheelModal, setShowLuckyWheelModal] = useState(false);
  const [bonusNotification, setBonusNotification] = useState<BonusNotification | null>(null);
  const [revivePromptStats, setRevivePromptStats] = useState<RunStats | null>(null);
  const [activeAdSession, setActiveAdSession] = useState<ActiveAdSession | null>(null);

  // Sync sound settings with audio engine
  useEffect(() => {
    sounds.setSoundEnabled(progress.soundEnabled);
    sounds.setMusicEnabled(progress.musicEnabled);
  }, [progress.soundEnabled, progress.musicEnabled]);

  // Save progress helper
  const updateProgress = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  // Daily Checks
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const canClaimDailyReward = progress.lastDailyRewardDate !== todayDateStr;
  const canSpinLuckyWheel = progress.lastWheelSpinDate !== todayDateStr;

  // Initialize GameWorld
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const gw = new GameWorld(canvasMountRef.current, {
      characterId: progress.selectedCharacter,
      hatId: progress.selectedHat,
      kidsMode: progress.kidsMode,
      onStatsUpdate: ({ score, distance, coins, bonusPoints, multiplier }) => {
        setCurrentScore(score);
        setCurrentDistance(distance);
        setCurrentCoins(coins);
        setCurrentBonusPoints(bonusPoints);
        setCurrentMultiplier(multiplier);
      },
      onPowerUpsUpdate: (powerups) => {
        setActivePowerUps(powerups);
      },
      onBonusNotification: (notification) => {
        if (bonusTimerRef.current) {
          clearTimeout(bonusTimerRef.current);
        }
        setBonusNotification(notification);
        bonusTimerRef.current = setTimeout(() => {
          setBonusNotification(null);
          bonusTimerRef.current = null;
        }, 2600);
      },
      onTriggerRevivePrompt: (stats) => {
        setGameState('REVIVE');
        setRevivePromptStats(stats);
      },
      onGameOver: (stats) => {
        setGameState('GAMEOVER');
        setLastRunStats(stats);
        setHasDoubledCoins(false);
        setRevivePromptStats(null);

        // Update High Score and Total Coins
        updateProgress((prev) => {
          const newHigh = Math.max(prev.highScore, stats.score);
          const newTotalCoins = prev.totalCoins + stats.coins;
          return {
            ...prev,
            highScore: newHigh,
            totalCoins: newTotalCoins,
          };
        });
      },
    });

    gameWorldRef.current = gw;

    return () => {
      if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);
      gw.dispose();
      gameWorldRef.current = null;
    };
  }, []);

  // Update Character / Hat on change
  useEffect(() => {
    if (gameWorldRef.current) {
      gameWorldRef.current.setCharacter(progress.selectedCharacter, progress.selectedHat);
    }
  }, [progress.selectedCharacter, progress.selectedHat]);

  // Update Kids Mode on change
  useEffect(() => {
    if (gameWorldRef.current) {
      gameWorldRef.current.setKidsMode(progress.kidsMode);
    }
  }, [progress.kidsMode]);

  // --- Keyboard Controls ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') {
        if (e.key === 'Escape' && gameState === 'PAUSED') {
          handleResume();
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        gameWorldRef.current?.moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        gameWorldRef.current?.moveRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        gameWorldRef.current?.jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        gameWorldRef.current?.slide();
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // --- Touch & Swipe Gesture Handling ---
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (gameState !== 'PLAYING') return;
      if (e.touches.length > 0) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = performance.now();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState !== 'PLAYING') return;
      if (e.changedTouches.length > 0) {
        const deltaX = e.changedTouches[0].clientX - startX;
        const deltaY = e.changedTouches[0].clientY - startY;
        const elapsed = performance.now() - startTime;

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        const minSwipeDistance = 30;

        if (elapsed < 600 && (absX > minSwipeDistance || absY > minSwipeDistance)) {
          if (absX > absY) {
            // Horizontal swipe
            if (deltaX > 0) {
              gameWorldRef.current?.moveRight();
            } else {
              gameWorldRef.current?.moveLeft();
            }
          } else {
            // Vertical swipe
            if (deltaY < 0) {
              gameWorldRef.current?.jump();
            } else {
              gameWorldRef.current?.slide();
            }
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState]);

  // --- Flow Actions ---
  const handleStartGame = () => {
    sounds.playClick();
    if (progress.musicEnabled) {
      sounds.startMusic();
    }
    setGameState('PLAYING');
    setCurrentScore(0);
    setCurrentDistance(0);
    setCurrentCoins(0);
    setCurrentBonusPoints(0);
    setCurrentMultiplier(1);
    setActivePowerUps([]);
    setBonusNotification(null);
    setRevivePromptStats(null);

    // Consume starting boost if earned from the Lucky Wheel
    const boostToApply = progress.activeStartingBoost;
    if (boostToApply) {
      updateProgress((prev) => ({ ...prev, activeStartingBoost: null }));
    }
    gameWorldRef.current?.start(boostToApply || undefined);
  };

  const handlePause = () => {
    sounds.playClick();
    setGameState('PAUSED');
    gameWorldRef.current?.pause();
  };

  const handleResume = () => {
    sounds.playClick();
    setGameState('PLAYING');
    gameWorldRef.current?.resume();
  };

  const handleRestart = () => {
    sounds.playClick();
    setGameState('PLAYING');
    setCurrentScore(0);
    setCurrentDistance(0);
    setCurrentCoins(0);
    setCurrentBonusPoints(0);
    setCurrentMultiplier(1);
    setActivePowerUps([]);
    setBonusNotification(null);
    setRevivePromptStats(null);
    gameWorldRef.current?.start();
  };

  const handleMainMenu = () => {
    sounds.playClick();
    setGameState('MENU');
    setRevivePromptStats(null);
    gameWorldRef.current?.pause();
  };

  // --- Revive Logic ---
  const handleReviveWithAd = () => {
    setActiveAdSession({
      rewardTitle: 'Free Run Revive',
      rewardIcon: '❤️',
      onReward: () => {
        setActiveAdSession(null);
        setGameState('PLAYING');
        setRevivePromptStats(null);
        gameWorldRef.current?.reviveRun();
        updateProgress((prev) => ({
          ...prev,
          totalAdsWatched: (prev.totalAdsWatched || 0) + 1,
        }));
      },
    });
  };

  const handleReviveWithCoins = () => {
    if (!progress.kidsMode) {
      updateProgress((prev) => ({
        ...prev,
        totalCoins: Math.max(0, prev.totalCoins - 25),
      }));
    }
    setGameState('PLAYING');
    setRevivePromptStats(null);
    gameWorldRef.current?.reviveRun();
  };

  const handleGiveUpRevive = () => {
    setRevivePromptStats(null);
    gameWorldRef.current?.skipReviveAndGameOver();
  };

  // --- Rewarded Ad for Doubling Run Coins ---
  const handleDoubleCoinsWithAd = () => {
    if (!lastRunStats || lastRunStats.coins <= 0) return;
    const bonusToAward = lastRunStats.coins;

    setActiveAdSession({
      rewardTitle: `2X Run Coins (+${bonusToAward} 🪙)`,
      rewardIcon: '🪙',
      onReward: () => {
        setActiveAdSession(null);
        setHasDoubledCoins(true);
        updateProgress((prev) => ({
          ...prev,
          totalCoins: prev.totalCoins + bonusToAward,
          totalAdsWatched: (prev.totalAdsWatched || 0) + 1,
        }));
      },
    });
  };

  // --- Main Menu Rewards: Daily Gift & Ad Coins ---
  const handleClaimDailyReward = () => {
    if (!canClaimDailyReward) return;
    sounds.playStar();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#ff9f1c', '#2ec4b6'],
      });
    } catch (e) {
      console.warn(e);
    }

    updateProgress((prev) => ({
      ...prev,
      totalCoins: prev.totalCoins + 50,
      lastDailyRewardDate: todayDateStr,
    }));
  };

  const handleWatchAdForCoins = () => {
    setActiveAdSession({
      rewardTitle: '+100 Jungle Coins',
      rewardIcon: '🪙',
      onReward: () => {
        setActiveAdSession(null);
        updateProgress((prev) => ({
          ...prev,
          totalCoins: prev.totalCoins + 100,
          totalAdsWatched: (prev.totalAdsWatched || 0) + 1,
        }));
      },
    });
  };

  // --- Lucky Wheel Handlers ---
  const handleClaimWheelPrize = (prize: LuckyWheelPrize) => {
    updateProgress((prev) => {
      let newTotalCoins = prev.totalCoins;
      let newStartingBoost = prev.activeStartingBoost;
      let newUnlockedHats = [...prev.unlockedHats];
      let newSelectedHat = prev.selectedHat;

      if (prize.type === 'COINS') {
        newTotalCoins += prize.amount || 50;
      } else if (prize.type === 'BOOST' && prize.boostType) {
        newStartingBoost = prize.boostType;
      } else if (prize.type === 'COSMETIC') {
        const allPossibleHats: HatId[] = ['explorer', 'crown', 'party', 'flower', 'scarf'];
        const locked = allPossibleHats.filter((h) => !prev.unlockedHats.includes(h));
        if (locked.length > 0) {
          const unlockedHat = locked[0];
          newUnlockedHats.push(unlockedHat);
          newSelectedHat = unlockedHat;
        } else {
          // If all hats unlocked, grant 150 coins
          newTotalCoins += 150;
        }
      } else if (prize.type === 'MYSTERY') {
        newTotalCoins += 150;
        newStartingBoost = 'FLYING';
      }

      return {
        ...prev,
        totalCoins: newTotalCoins,
        activeStartingBoost: newStartingBoost,
        unlockedHats: newUnlockedHats,
        selectedHat: newSelectedHat,
        lastWheelSpinDate: todayDateStr,
      };
    });
  };

  const handleWatchAdForWheelSpin = () => {
    setShowLuckyWheelModal(false);
    setActiveAdSession({
      rewardTitle: 'Extra Lucky Wheel Spin',
      rewardIcon: '🎡',
      onReward: () => {
        setActiveAdSession(null);
        setShowLuckyWheelModal(true);
        updateProgress((prev) => ({
          ...prev,
          // Clear spin date so free spin becomes immediately available for this extra spin
          lastWheelSpinDate: undefined,
          totalAdsWatched: (prev.totalAdsWatched || 0) + 1,
        }));
      },
    });
  };

  const handleSpinWithCoins = (cost: number) => {
    updateProgress((prev) => ({
      ...prev,
      totalCoins: Math.max(0, prev.totalCoins - cost),
    }));
  };

  // --- Character & Hat Purchases ---
  const handleUnlockCharacter = (charId: CharacterId, cost: number) => {
    if (progress.totalCoins >= cost && !progress.unlockedCharacters.includes(charId)) {
      sounds.playPowerUp();
      updateProgress((prev) => ({
        ...prev,
        totalCoins: Math.max(0, prev.totalCoins - cost),
        unlockedCharacters: prev.unlockedCharacters.includes(charId)
          ? prev.unlockedCharacters
          : [...prev.unlockedCharacters, charId],
        selectedCharacter: charId,
      }));
    }
  };

  const handleUnlockHat = (hatId: HatId, cost: number) => {
    if (progress.totalCoins >= cost && !progress.unlockedHats.includes(hatId)) {
      sounds.playPowerUp();
      updateProgress((prev) => ({
        ...prev,
        totalCoins: Math.max(0, prev.totalCoins - cost),
        unlockedHats: prev.unlockedHats.includes(hatId)
          ? prev.unlockedHats
          : [...prev.unlockedHats, hatId],
        selectedHat: hatId,
      }));
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-stone-900 font-fredoka">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Main Menu Screen */}
      {gameState === 'MENU' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenCharacters={() => {
            sounds.playClick();
            setGameState('CHARACTERS');
          }}
          onOpenHowToPlay={() => setShowHowToPlayModal(true)}
          onClaimDailyReward={handleClaimDailyReward}
          onWatchAdForCoins={handleWatchAdForCoins}
          onOpenLuckyWheel={() => setShowLuckyWheelModal(true)}
          canClaimDailyReward={canClaimDailyReward}
          canSpinLuckyWheel={canSpinLuckyWheel}
          activeStartingBoost={progress.activeStartingBoost}
          highScore={progress.highScore}
          totalCoins={progress.totalCoins}
          selectedCharacter={progress.selectedCharacter}
          selectedHat={progress.selectedHat}
          kidsMode={progress.kidsMode}
          onToggleKidsMode={() =>
            updateProgress((prev) => ({ ...prev, kidsMode: !prev.kidsMode }))
          }
          soundEnabled={progress.soundEnabled}
          onToggleSound={() =>
            updateProgress((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
          }
          musicEnabled={progress.musicEnabled}
          onToggleMusic={() =>
            updateProgress((prev) => ({ ...prev, musicEnabled: !prev.musicEnabled }))
          }
        />
      )}

      {/* Dedicated Character Selection Screen */}
      {gameState === 'CHARACTERS' && (
        <CharacterSelectScreen
          currentCoins={progress.totalCoins}
          selectedCharacter={progress.selectedCharacter}
          selectedHat={progress.selectedHat}
          unlockedCharacters={progress.unlockedCharacters}
          unlockedHats={progress.unlockedHats}
          onSelectCharacter={(charId) =>
            updateProgress((prev) => ({ ...prev, selectedCharacter: charId }))
          }
          onSelectHat={(hatId) =>
            updateProgress((prev) => ({ ...prev, selectedHat: hatId }))
          }
          onUnlockCharacter={handleUnlockCharacter}
          onUnlockHat={handleUnlockHat}
          onBackToMenu={() => {
            sounds.playClick();
            setGameState('MENU');
          }}
          onStartGame={handleStartGame}
        />
      )}

      {/* In-Game HUD */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            score={currentScore}
            distance={currentDistance}
            coins={currentCoins}
            bonusPoints={currentBonusPoints}
            multiplier={currentMultiplier}
            powerUps={activePowerUps}
            bonusNotification={bonusNotification}
            isKidsMode={progress.kidsMode}
            soundEnabled={progress.soundEnabled}
            onToggleSound={() =>
              updateProgress((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
            }
            onPause={handlePause}
            showOnScreenControls={progress.showOnScreenControls}
            onToggleControls={() =>
              updateProgress((prev) => ({
                ...prev,
                showOnScreenControls: !prev.showOnScreenControls,
              }))
            }
          />

          {/* On-Screen Mobile Buttons (Togglable & accessible) */}
          {progress.showOnScreenControls && (
            <MobileControls
              onLeft={() => gameWorldRef.current?.moveLeft()}
              onRight={() => gameWorldRef.current?.moveRight()}
              onJump={() => gameWorldRef.current?.jump()}
              onSlide={() => gameWorldRef.current?.slide()}
            />
          )}
        </>
      )}

      {/* Lucky Wheel Modal */}
      {showLuckyWheelModal && (
        <LuckyWheelModal
          progress={progress}
          canSpinFree={canSpinLuckyWheel}
          onClaimPrize={handleClaimWheelPrize}
          onWatchAdForSpin={handleWatchAdForWheelSpin}
          onSpinWithCoins={handleSpinWithCoins}
          onClose={() => setShowLuckyWheelModal(false)}
        />
      )}

      {/* Revive Modal (Prompted after collision before game over) */}
      {gameState === 'REVIVE' && revivePromptStats && (
        <ReviveModal
          stats={revivePromptStats}
          totalCoins={progress.totalCoins}
          isKidsMode={progress.kidsMode}
          onReviveWithAd={handleReviveWithAd}
          onReviveWithCoins={handleReviveWithCoins}
          onGiveUp={handleGiveUpRevive}
        />
      )}

      {/* Rewarded Ad Simulated Player Modal */}
      {activeAdSession && (
        <RewardedAdModal
          rewardTitle={activeAdSession.rewardTitle}
          rewardIcon={activeAdSession.rewardIcon}
          onRewardEarned={activeAdSession.onReward}
          onClose={() => setActiveAdSession(null)}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
          soundEnabled={progress.soundEnabled}
          onToggleSound={() =>
            updateProgress((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
          }
          kidsMode={progress.kidsMode}
          onToggleKidsMode={() =>
            updateProgress((prev) => ({ ...prev, kidsMode: !prev.kidsMode }))
          }
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAMEOVER' && lastRunStats && (
        <GameOverModal
          stats={lastRunStats}
          highScore={progress.highScore}
          totalCoins={progress.totalCoins}
          hasDoubledCoins={hasDoubledCoins}
          onDoubleCoinsWithAd={handleDoubleCoinsWithAd}
          onPlayAgain={handleRestart}
          onOpenCharacters={() => {
            sounds.playClick();
            setGameState('CHARACTERS');
          }}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* How To Play Modal */}
      {showHowToPlayModal && (
        <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />
      )}
    </div>
  );
}
