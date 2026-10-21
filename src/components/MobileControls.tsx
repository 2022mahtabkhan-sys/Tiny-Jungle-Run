import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface MobileControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-6 sm:bottom-8 px-4 sm:px-8 flex justify-between pointer-events-none z-30 select-none">
      {/* Left / Right Steering Buttons */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onLeft();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-200 text-amber-950 shadow-xl flex items-center justify-center active:scale-90 active:from-amber-500 active:to-amber-700 transition-transform cursor-pointer"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onRight();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-200 text-amber-950 shadow-xl flex items-center justify-center active:scale-90 active:from-amber-500 active:to-amber-700 transition-transform cursor-pointer"
          aria-label="Move Right"
        >
          <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
        </button>
      </div>

      {/* Jump / Slide Action Buttons */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onSlide();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 border-4 border-emerald-200 text-emerald-950 shadow-xl flex flex-col items-center justify-center active:scale-90 active:from-emerald-500 active:to-emerald-700 transition-transform cursor-pointer"
          aria-label="Slide"
        >
          <ArrowDown className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
          <span className="text-[10px] font-black uppercase tracking-wider">Slide</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 border-4 border-sky-200 text-blue-950 shadow-xl flex flex-col items-center justify-center active:scale-90 active:from-blue-500 active:to-blue-700 transition-transform cursor-pointer"
          aria-label="Jump"
        >
          <ArrowUp className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
          <span className="text-[10px] font-black uppercase tracking-wider">Jump</span>
        </button>
      </div>
    </div>
  );
};
