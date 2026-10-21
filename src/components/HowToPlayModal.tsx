import React from 'react';
import { X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shield, Magnet, Zap } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs font-fredoka">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-emerald-900 to-amber-950 border-4 border-amber-400 rounded-3xl shadow-2xl p-5 text-white flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-emerald-500/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌴</span>
            <h2 className="text-xl sm:text-2xl font-black text-amber-200">How to Play</h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-emerald-800 border-2 border-emerald-300 flex items-center justify-center hover:bg-emerald-700 active:scale-90 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5 text-emerald-100" />
          </button>
        </div>

        {/* Instructions Cards */}
        <div className="space-y-3 text-sm">
          {/* Movement */}
          <div className="bg-emerald-950/70 border-2 border-emerald-600/70 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="flex gap-1 bg-amber-500 text-amber-950 p-2 rounded-xl shrink-0 font-black">
              <ArrowLeft className="w-5 h-5" />
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-300 text-base">Switch Lanes</div>
              <div className="text-emerald-100/90 text-xs sm:text-sm font-sans mt-0.5">
                Swipe <b>Left</b> or <b>Right</b>, or press <b>A/D</b> or <b>Left/Right Arrow keys</b> to dodge obstacles and gather shiny coins!
              </div>
            </div>
          </div>

          {/* Jump */}
          <div className="bg-emerald-950/70 border-2 border-emerald-600/70 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="bg-sky-500 text-sky-950 p-2 rounded-xl shrink-0 font-black">
              <ArrowUp className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sky-300 text-base">Jump Over Hurdles</div>
              <div className="text-emerald-100/90 text-xs sm:text-sm font-sans mt-0.5">
                Swipe <b>Up</b> or press <b>Up Arrow / Space</b> to hop over mossy logs, friendly smiling rocks, and bouncy mushrooms!
              </div>
            </div>
          </div>

          {/* Slide */}
          <div className="bg-emerald-950/70 border-2 border-emerald-600/70 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="bg-lime-500 text-lime-950 p-2 rounded-xl shrink-0 font-black">
              <ArrowDown className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lime-300 text-base">Slide Under Barriers</div>
              <div className="text-emerald-100/90 text-xs sm:text-sm font-sans mt-0.5">
                Swipe <b>Down</b> or press <b>Down Arrow</b> to duck down low and slide safely underneath hanging vines and bridges!
              </div>
            </div>
          </div>

          {/* Power-ups */}
          <div className="bg-amber-950/70 border-2 border-amber-600/70 rounded-2xl p-3.5">
            <div className="font-bold text-yellow-300 text-base mb-2">Magical Jungle Power-ups</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-amber-900/60 p-2 rounded-xl border border-amber-700 flex flex-col items-center">
                <Magnet className="w-5 h-5 text-rose-400 mb-1" />
                <span className="font-bold text-white">Rainbow Magnet</span>
                <span className="text-[10px] text-amber-200 mt-0.5">Pulls nearby coins!</span>
              </div>
              <div className="bg-amber-900/60 p-2 rounded-xl border border-amber-700 flex flex-col items-center">
                <Shield className="w-5 h-5 text-cyan-300 mb-1" />
                <span className="font-bold text-white">Star Shield</span>
                <span className="text-[10px] text-amber-200 mt-0.5">Protects from 1 bump!</span>
              </div>
              <div className="bg-amber-900/60 p-2 rounded-xl border border-amber-700 flex flex-col items-center">
                <Zap className="w-5 h-5 text-yellow-300 mb-1" />
                <span className="font-bold text-white">Banana Boost</span>
                <span className="text-[10px] text-amber-200 mt-0.5">Super speedy dash!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Got it button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="mt-4 w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-base rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          Let's Run! 🐾
        </button>
      </div>
    </div>
  );
};
