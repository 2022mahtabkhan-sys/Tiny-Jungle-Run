import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  kidsMode: boolean;
  onToggleKidsMode: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  soundEnabled,
  onToggleSound,
  kidsMode,
  onToggleKidsMode,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-fredoka">
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-900 to-emerald-950 border-4 border-amber-400 rounded-3xl shadow-2xl p-6 text-white text-center">
        <h2 className="text-3xl font-black text-amber-200 mb-1">Game Paused</h2>
        <p className="text-amber-100/80 text-xs mb-5">Take a quick breather, little explorer!</p>

        {/* Buttons List */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onResume();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Resume Run</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Restart Run</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onMainMenu();
            }}
            className="w-full py-3 bg-stone-800/90 hover:bg-stone-700 border border-stone-600 text-amber-100 font-bold text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>Main Menu</span>
          </button>
        </div>

        {/* Toggles */}
        <div className="mt-5 pt-4 border-t border-amber-600/40 flex items-center justify-around">
          <button
            onClick={onToggleSound}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-200 hover:text-white cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={onToggleKidsMode}
            className="flex items-center gap-1.5 text-xs font-bold text-pink-300 hover:text-white cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kids: {kidsMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
