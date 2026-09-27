import React from 'react';
import { ControllerKeys } from '../game/types';

interface TouchControllerProps {
  onKeyChange: (key: keyof ControllerKeys, pressed: boolean) => void;
  onShootPress: () => void;
  onJumpPress: () => void;
  onStartPress: () => void;
  onSelectPress: () => void;
}

export const TouchController: React.FC<TouchControllerProps> = ({
  onKeyChange,
  onShootPress,
  onJumpPress,
  onStartPress,
  onSelectPress,
}) => {
  const handleTouch = (key: keyof ControllerKeys, pressed: boolean, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onKeyChange(key, pressed);
    if (pressed) {
      if (key === 'shoot') onShootPress();
      if (key === 'jump') onJumpPress();
      if (key === 'start') onStartPress();
      if (key === 'select') onSelectPress();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 select-none touch-none bg-stone-900/90 border-t-2 border-stone-800 rounded-b-xl shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        {/* D-PAD (Directional Pad) */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* D-Pad Cross Background */}
          <div className="absolute w-28 h-10 bg-stone-950 border-2 border-stone-700 rounded-md shadow-inner" />
          <div className="absolute w-10 h-28 bg-stone-950 border-2 border-stone-700 rounded-md shadow-inner" />

          {/* Up */}
          <button
            aria-label="Up"
            className="absolute top-1 left-13 w-10 h-11 bg-stone-800 hover:bg-stone-700 active:bg-red-700 text-stone-300 active:text-white rounded-t-md flex items-center justify-center font-bold text-sm shadow-md transition-colors"
            onTouchStart={(e) => handleTouch('up', true, e)}
            onTouchEnd={(e) => handleTouch('up', false, e)}
            onMouseDown={(e) => handleTouch('up', true, e)}
            onMouseUp={(e) => handleTouch('up', false, e)}
          >
            ▲
          </button>

          {/* Down */}
          <button
            aria-label="Down"
            className="absolute bottom-1 left-13 w-10 h-11 bg-stone-800 hover:bg-stone-700 active:bg-red-700 text-stone-300 active:text-white rounded-b-md flex items-center justify-center font-bold text-sm shadow-md transition-colors"
            onTouchStart={(e) => handleTouch('down', true, e)}
            onTouchEnd={(e) => handleTouch('down', false, e)}
            onMouseDown={(e) => handleTouch('down', true, e)}
            onMouseUp={(e) => handleTouch('down', false, e)}
          >
            ▼
          </button>

          {/* Left */}
          <button
            aria-label="Left"
            className="absolute left-1 top-13 w-11 h-10 bg-stone-800 hover:bg-stone-700 active:bg-red-700 text-stone-300 active:text-white rounded-l-md flex items-center justify-center font-bold text-sm shadow-md transition-colors"
            onTouchStart={(e) => handleTouch('left', true, e)}
            onTouchEnd={(e) => handleTouch('left', false, e)}
            onMouseDown={(e) => handleTouch('left', true, e)}
            onMouseUp={(e) => handleTouch('left', false, e)}
          >
            ◀
          </button>

          {/* Right */}
          <button
            aria-label="Right"
            className="absolute right-1 top-13 w-11 h-10 bg-stone-800 hover:bg-stone-700 active:bg-red-700 text-stone-300 active:text-white rounded-r-md flex items-center justify-center font-bold text-sm shadow-md transition-colors"
            onTouchStart={(e) => handleTouch('right', true, e)}
            onTouchEnd={(e) => handleTouch('right', false, e)}
            onMouseDown={(e) => handleTouch('right', true, e)}
            onMouseUp={(e) => handleTouch('right', false, e)}
          >
            ▶
          </button>

          {/* Center Pivot */}
          <div className="absolute w-6 h-6 bg-stone-900 rounded-full border border-stone-800 pointer-events-none" />
        </div>

        {/* SELECT / START BUTTONS (NES Style Pill Buttons) */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-4">
            {/* SELECT */}
            <div className="flex flex-col items-center">
              <button
                className="w-12 h-5 bg-stone-700 hover:bg-stone-600 active:bg-stone-400 rounded-full shadow-inner border border-stone-900 transition-colors"
                onTouchStart={(e) => handleTouch('select', true, e)}
                onTouchEnd={(e) => handleTouch('select', false, e)}
                onMouseDown={(e) => handleTouch('select', true, e)}
                onMouseUp={(e) => handleTouch('select', false, e)}
              />
              <span className="text-[9px] font-mono tracking-wider text-red-500 font-bold mt-1">
                SELECT
              </span>
            </div>

            {/* START */}
            <div className="flex flex-col items-center">
              <button
                className="w-12 h-5 bg-stone-700 hover:bg-stone-600 active:bg-stone-400 rounded-full shadow-inner border border-stone-900 transition-colors"
                onTouchStart={(e) => handleTouch('start', true, e)}
                onTouchEnd={(e) => handleTouch('start', false, e)}
                onMouseDown={(e) => handleTouch('start', true, e)}
                onMouseUp={(e) => handleTouch('start', false, e)}
              />
              <span className="text-[9px] font-mono tracking-wider text-red-500 font-bold mt-1">
                START
              </span>
            </div>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">1986 FAMICOM</span>
        </div>

        {/* B & A ACTION BUTTONS */}
        <div className="flex items-center gap-4 pr-2">
          {/* B Button (空氣砲 / 攻擊) */}
          <div className="flex flex-col items-center">
            <button
              className="w-14 h-14 bg-red-700 hover:bg-red-600 active:bg-red-400 text-white rounded-full font-bold text-lg shadow-lg border-2 border-red-950 flex flex-col items-center justify-center active:scale-95 transition-transform"
              onTouchStart={(e) => handleTouch('shoot', true, e)}
              onTouchEnd={(e) => handleTouch('shoot', false, e)}
              onMouseDown={(e) => handleTouch('shoot', true, e)}
              onMouseUp={(e) => handleTouch('shoot', false, e)}
            >
              <span>B</span>
              <span className="text-[9px] font-normal leading-none opacity-90">空氣砲</span>
            </button>
            <span className="text-[10px] text-red-400 font-mono font-bold mt-1">B (J/空)</span>
          </div>

          {/* A Button (跳躍 / 水中上浮) */}
          <div className="flex flex-col items-center">
            <button
              className="w-14 h-14 bg-red-700 hover:bg-red-600 active:bg-red-400 text-white rounded-full font-bold text-lg shadow-lg border-2 border-red-950 flex flex-col items-center justify-center active:scale-95 transition-transform"
              onTouchStart={(e) => handleTouch('jump', true, e)}
              onTouchEnd={(e) => handleTouch('jump', false, e)}
              onMouseDown={(e) => handleTouch('jump', true, e)}
              onMouseUp={(e) => handleTouch('jump', false, e)}
            >
              <span>A</span>
              <span className="text-[9px] font-normal leading-none opacity-90">跳躍</span>
            </button>
            <span className="text-[10px] text-red-400 font-mono font-bold mt-1">A (K/Z)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
