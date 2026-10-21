import React, { useState } from 'react';
import { ArrowLeft, Lock, Check, Sparkles, Coins, Play } from 'lucide-react';
import { CharacterConfig, CharacterId, HatConfig, HatId } from '../types/game';
import { CharacterPreviewCanvas } from './CharacterPreviewCanvas';
import { sounds } from '../audio/SoundEffects';

interface CharacterSelectScreenProps {
  currentCoins: number;
  selectedCharacter: CharacterId;
  selectedHat: HatId;
  unlockedCharacters: CharacterId[];
  unlockedHats: HatId[];
  onSelectCharacter: (charId: CharacterId) => void;
  onSelectHat: (hatId: HatId) => void;
  onUnlockCharacter: (charId: CharacterId, cost: number) => void;
  onUnlockHat: (hatId: HatId, cost: number) => void;
  onBackToMenu: () => void;
  onStartGame: () => void;
}

const CHARACTERS: CharacterConfig[] = [
  {
    id: 'tiger',
    name: 'Baby Tiger',
    cost: 0,
    description: 'Playful jungle cub with golden striped fur, big curious eyes, and swift paws!',
    primaryColor: '#ff8c2b',
    accentColor: '#ffeedb',
    unlockedByDefault: true,
  },
  {
    id: 'panda',
    name: 'Baby Panda',
    cost: 150,
    description: 'Sweet, fluffy bamboo lover with round black ears and a joyful cartoon bounce!',
    primaryColor: '#333333',
    accentColor: '#fdfdfd',
  },
  {
    id: 'bunny',
    name: 'Baby Bunny',
    cost: 300,
    description: 'Super energetic hopper with tall floppy ears and cheerful high jumps!',
    primaryColor: '#ffb5c5',
    accentColor: '#ffffff',
  },
  {
    id: 'fox',
    name: 'Baby Fox',
    cost: 500,
    description: 'Clever forest adventurer with bright russet coat and a fluffy bushy white-tipped tail!',
    primaryColor: '#e05622',
    accentColor: '#ffffff',
  },
];

const HATS: HatConfig[] = [
  { id: 'none', name: 'No Hat', cost: 0, description: 'Natural cute style', icon: '🐾' },
  { id: 'explorer', name: 'Safari Pith', cost: 50, description: 'Explorer helmet with strap', icon: '🧭' },
  { id: 'crown', name: 'Royal Crown', cost: 120, description: 'Golden crown with ruby gems', icon: '👑' },
  { id: 'party', name: 'Party Cone', cost: 80, description: 'Festive pom-pom cone', icon: '🎉' },
  { id: 'flower', name: 'Flower Wreath', cost: 100, description: 'Tropical blooming flowers', icon: '🌸' },
  { id: 'scarf', name: 'Warm Scarf', cost: 75, description: 'Cozy red scarf with flutter', icon: '🧣' },
];

export const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({
  currentCoins,
  selectedCharacter,
  selectedHat,
  unlockedCharacters,
  unlockedHats,
  onSelectCharacter,
  onSelectHat,
  onUnlockCharacter,
  onUnlockHat,
  onBackToMenu,
  onStartGame,
}) => {
  // Currently inspected character on the 3D stage
  const [inspectedChar, setInspectedChar] = useState<CharacterId>(selectedCharacter);
  const [inspectedHat, setInspectedHat] = useState<HatId>(selectedHat);
  const [activeTab, setActiveTab] = useState<'CHARACTERS' | 'HATS'>('CHARACTERS');

  const charEmojis: Record<CharacterId, string> = {
    tiger: '🐯',
    panda: '🐼',
    bunny: '🐰',
    fox: '🦊',
  };

  const currentCharData = CHARACTERS.find((c) => c.id === inspectedChar) || CHARACTERS[0];
  const isInspectedUnlocked = unlockedCharacters.includes(inspectedChar);
  const isInspectedSelected = selectedCharacter === inspectedChar;
  const canAffordInspected = currentCoins >= currentCharData.cost;

  const handleCardClick = (charId: CharacterId) => {
    sounds.playClick();
    setInspectedChar(charId);
  };

  const handleSelectActive = () => {
    sounds.playClick();
    onSelectCharacter(inspectedChar);
  };

  const handleUnlockClick = () => {
    if (canAffordInspected && !isInspectedUnlocked) {
      onUnlockCharacter(inspectedChar, currentCharData.cost);
      onSelectCharacter(inspectedChar);
    }
  };

  const handlePlayWithThisChar = () => {
    sounds.playClick();
    if (isInspectedUnlocked) {
      onSelectCharacter(inspectedChar);
    }
    onStartGame();
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-gradient-to-b from-emerald-950 via-amber-950/95 to-slate-950 text-white font-fredoka overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-amber-500/40 bg-amber-950/80 shadow-md">
        {/* Back to Main Menu Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onBackToMenu();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-800/90 border-2 border-amber-300 text-amber-100 hover:bg-amber-700 active:scale-95 transition-all cursor-pointer shadow-md text-sm sm:text-base font-bold"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Back to Menu</span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300 hidden sm:block" />
          <h1 className="text-xl sm:text-3xl font-black text-amber-200 tracking-wide drop-shadow-md">
            Character Selection
          </h1>
        </div>

        {/* Coin Bank */}
        <div className="flex items-center gap-2 bg-yellow-500 border-2 border-yellow-200 rounded-2xl px-3.5 py-1.5 shadow-lg text-amber-950 font-black">
          <Coins className="w-5 h-5 fill-current" />
          <span className="text-base sm:text-lg">{currentCoins}</span>
        </div>
      </div>

      {/* Main Content Area: Split View for Desktop & Tablet, Stacked for Mobile */}
      <div className="flex-1 flex flex-col lg:flex-row p-3 sm:p-5 gap-4 overflow-hidden">
        {/* Left Column: 3D Stage & Character Info */}
        <div className="flex-1 lg:max-w-md xl:max-w-lg flex flex-col items-center bg-emerald-950/50 border-3 border-emerald-500/50 rounded-3xl p-4 shadow-xl backdrop-blur-xs justify-between min-h-[300px]">
          {/* 3D Stage Container */}
          <div className="relative w-full flex-1 max-h-[320px] sm:max-h-[380px] rounded-2xl overflow-hidden flex items-center justify-center">
            <CharacterPreviewCanvas characterId={inspectedChar} hatId={inspectedHat} />
            <div className="absolute top-2 left-2 bg-slate-900/70 border border-emerald-400/60 rounded-xl px-2.5 py-1 text-[11px] text-emerald-200 pointer-events-none">
              👆 Drag to spin 3D view
            </div>
            {isInspectedSelected && (
              <div className="absolute top-2 right-2 bg-emerald-500 text-emerald-950 border border-emerald-200 rounded-xl px-3 py-1 text-xs font-black shadow-lg flex items-center gap-1 pointer-events-none">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Runner
              </div>
            )}
          </div>

          {/* Character Name & Lore */}
          <div className="w-full text-center mt-2 px-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{charEmojis[inspectedChar]}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-200">
                {currentCharData.name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-sans mt-1 max-w-sm mx-auto leading-relaxed">
              {currentCharData.description}
            </p>
          </div>

          {/* Action Button for Inspected Character */}
          <div className="w-full mt-3 flex flex-col gap-2">
            {isInspectedUnlocked ? (
              isInspectedSelected ? (
                <button
                  onClick={handlePlayWithThisChar}
                  className="w-full py-3.5 bg-gradient-to-r from-lime-400 via-emerald-500 to-green-600 border-2 border-yellow-200 text-white font-black text-lg sm:text-xl rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-current stroke-[2]" />
                  <span>Play with {currentCharData.name}</span>
                </button>
              ) : (
                <button
                  onClick={handleSelectActive}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 border-2 border-amber-200 text-amber-950 font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Select {currentCharData.name}</span>
                </button>
              )
            ) : (
              <button
                disabled={!canAffordInspected}
                onClick={handleUnlockClick}
                className={`w-full py-3.5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl transition-all ${
                  canAffordInspected
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-amber-950 border-2 border-yellow-100 active:scale-95 cursor-pointer animate-pulse'
                    : 'bg-stone-800 text-stone-400 border border-stone-700 cursor-not-allowed'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span>
                  {canAffordInspected
                    ? `Unlock for ${currentCharData.cost} Coins 🪙`
                    : `Need ${currentCharData.cost - currentCoins} More Coins 🪙`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Character List & Accessories Tabs */}
        <div className="flex-1 flex flex-col bg-amber-950/40 border-3 border-amber-500/40 rounded-3xl p-4 shadow-xl overflow-hidden">
          {/* Subtabs: Characters vs Hats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('CHARACTERS');
              }}
              className={`py-2.5 rounded-xl text-center font-bold text-sm sm:text-base transition-colors cursor-pointer ${
                activeTab === 'CHARACTERS'
                  ? 'bg-amber-500 text-amber-950 shadow-md font-black'
                  : 'bg-amber-900/40 text-amber-200 hover:bg-amber-900/70'
              }`}
            >
              🐾 4 Cute Animal Runners
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('HATS');
              }}
              className={`py-2.5 rounded-xl text-center font-bold text-sm sm:text-base transition-colors cursor-pointer ${
                activeTab === 'HATS'
                  ? 'bg-amber-500 text-amber-950 shadow-md font-black'
                  : 'bg-amber-900/40 text-amber-200 hover:bg-amber-900/70'
              }`}
            >
              👑 Outfits & Hats
            </button>
          </div>

          {/* Cards Scrollable Area */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {activeTab === 'CHARACTERS' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHARACTERS.map((char) => {
                  const isUnlocked = unlockedCharacters.includes(char.id);
                  const isSelected = selectedCharacter === char.id;
                  const isInspected = inspectedChar === char.id;
                  const canAfford = currentCoins >= char.cost;

                  return (
                    <div
                      key={char.id}
                      onClick={() => handleCardClick(char.id)}
                      className={`relative rounded-2xl p-4 border-3 transition-all cursor-pointer flex flex-col justify-between ${
                        isInspected
                          ? 'border-yellow-300 ring-4 ring-yellow-400/40 shadow-xl bg-amber-900/90'
                          : isSelected
                          ? 'border-emerald-400 bg-emerald-950/80 shadow-md'
                          : isUnlocked
                          ? 'border-amber-600/70 bg-amber-950/60 hover:border-amber-400'
                          : 'border-stone-700 bg-stone-900/80 opacity-90'
                      }`}
                    >
                      {/* Top Row: Emoji & Status */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-3xl">{charEmojis[char.id]}</span>
                            <div>
                              <div className="font-black text-lg text-amber-100">{char.name}</div>
                              <div className="text-[11px] text-amber-300">
                                {isUnlocked ? (isSelected ? '⭐ Active' : 'Ready') : `Locked (${char.cost} 🪙)`}
                              </div>
                            </div>
                          </div>

                          {isSelected ? (
                            <span className="bg-emerald-500 text-emerald-950 text-xs px-2.5 py-1 rounded-full font-black flex items-center gap-1 shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" /> Active
                            </span>
                          ) : !isUnlocked ? (
                            <span className="bg-amber-800 text-amber-200 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" /> {char.cost}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs text-amber-200/90 font-sans leading-relaxed mb-3">
                          {char.description}
                        </p>
                      </div>

                      {/* Card Button */}
                      <div className="mt-1">
                        {isSelected ? (
                          <div className="w-full py-2 bg-emerald-700/80 rounded-xl text-center text-xs font-black text-emerald-100">
                            Currently Selected
                          </div>
                        ) : isUnlocked ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              setInspectedChar(char.id);
                              onSelectCharacter(char.id);
                            }}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl text-xs transition-transform active:scale-95 cursor-pointer shadow-md"
                          >
                            Select Runner
                          </button>
                        ) : (
                          <button
                            disabled={!canAfford}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canAfford) {
                                onUnlockCharacter(char.id, char.cost);
                                setInspectedChar(char.id);
                                onSelectCharacter(char.id);
                              }
                            }}
                            className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-transform active:scale-95 shadow-md ${
                              canAfford
                                ? 'bg-yellow-400 hover:bg-yellow-300 text-amber-950 cursor-pointer'
                                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Unlock ({char.cost} 🪙)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HATS.map((hat) => {
                  const isUnlocked = unlockedHats.includes(hat.id);
                  const isSelected = selectedHat === hat.id;
                  const isInspected = inspectedHat === hat.id;
                  const canAfford = currentCoins >= hat.cost;

                  return (
                    <div
                      key={hat.id}
                      onClick={() => {
                        sounds.playClick();
                        setInspectedHat(hat.id);
                      }}
                      className={`rounded-2xl p-3 border-2 transition-all flex flex-col justify-between text-center cursor-pointer ${
                        isInspected
                          ? 'border-yellow-300 ring-3 ring-yellow-400/40 bg-amber-900/90 shadow-lg'
                          : isSelected
                          ? 'border-emerald-400 bg-emerald-950/80 shadow-md'
                          : isUnlocked
                          ? 'border-amber-600/70 bg-amber-950/60 hover:border-amber-400'
                          : 'border-stone-700 bg-stone-900/70 opacity-90'
                      }`}
                    >
                      <div>
                        <div className="text-3xl mb-1">{hat.icon}</div>
                        <div className="font-bold text-sm text-amber-100">{hat.name}</div>
                        <div className="text-[11px] text-amber-200/80 mb-2">{hat.description}</div>
                      </div>

                      <div>
                        {isSelected ? (
                          <div className="py-1.5 bg-emerald-700/80 rounded-lg text-xs font-bold text-emerald-100 flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Equipped
                          </div>
                        ) : isUnlocked ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              setInspectedHat(hat.id);
                              onSelectHat(hat.id);
                            }}
                            className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-lg text-xs transition-transform active:scale-95 cursor-pointer"
                          >
                            Wear
                          </button>
                        ) : (
                          <button
                            disabled={!canAfford}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canAfford) {
                                onUnlockHat(hat.id, hat.cost);
                                setInspectedHat(hat.id);
                                onSelectHat(hat.id);
                              }
                            }}
                            className={`w-full py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-transform active:scale-95 ${
                              canAfford
                                ? 'bg-yellow-400 hover:bg-yellow-300 text-amber-950 cursor-pointer'
                                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>{hat.cost} 🪙</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
