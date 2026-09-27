import React from 'react';
import { Volume2, VolumeX, Music, Monitor, Maximize2, RotateCcw, BookOpen, Layers } from 'lucide-react';
import { StageId } from '../game/types';

interface ConsoleBezelProps {
  children: React.ReactNode;
  score: number;
  stage: StageId;
  crtFilter: boolean;
  onToggleCrt: () => void;
  bgmMuted: boolean;
  onToggleBgm: () => void;
  sfxMuted: boolean;
  onToggleSfx: () => void;
  onReset: () => void;
  onOpenManual: () => void;
  onOpenStageSelect: () => void;
  onToggleFullscreen: () => void;
}

export const ConsoleBezel: React.FC<ConsoleBezelProps> = ({
  children,
  score,
  stage,
  crtFilter,
  onToggleCrt,
  bgmMuted,
  onToggleBgm,
  sfxMuted,
  onToggleSfx,
  onReset,
  onOpenManual,
  onOpenStageSelect,
  onToggleFullscreen,
}) => {
  const stageNames: Record<StageId, string> = {
    1: '開拓篇 (PIONEER)',
    2: '魔境篇 (RUINS)',
    3: '海底篇 (OCEAN)',
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Console Housing (Classic Famicom Ivory & Dark Red Cabinet) */}
      <div className="w-full bg-[#e8e4d9] text-stone-900 border-4 border-[#8b181b] rounded-2xl shadow-2xl p-3 sm:p-5 relative transition-all">
        {/* Top Metallic Gold/Red Label */}
        <div className="bg-[#8b181b] text-white px-4 py-2 rounded-lg flex items-center justify-between shadow-md border-b-2 border-[#5a0c0f] mb-3">
          <div className="flex items-center gap-3">
            {/* Glowing Red Power LED */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 shadow-[0_0_8px_#ef4444]"></span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-red-200">POWER</span>
            </div>

            <div className="h-4 w-[1px] bg-red-700 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-black tracking-wider text-xs sm:text-sm font-mono drop-shadow">
                HUDSON SOFT 1986
              </span>
              <span className="text-white text-xs sm:text-sm font-bold tracking-wide">
                哆啦A夢 FC經典復刻
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-stone-300 hidden md:inline">關卡:</span>
            <span className="bg-black/40 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">
              {stageNames[stage]}
            </span>
          </div>
        </div>

        {/* TV / Monitor Bezel Frame */}
        <div className="relative bg-stone-950 p-2 sm:p-4 rounded-xl border-4 border-stone-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Main Game Screen */}
          <div className="relative flex items-center justify-center overflow-hidden rounded bg-black">
            {children}

            {/* Retro CRT Scanline & Curved Glass Overlay */}
            {crtFilter && (
              <div 
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
                style={{
                  background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.28) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))',
                  backgroundSize: '100% 4px, 6px 100%',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
                }}
              />
            )}
          </div>
        </div>

        {/* Console Control Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          {/* Left quick actions */}
          <div className="flex items-center gap-2">
            {/* Reset Button */}
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8b181b] hover:bg-[#a31f23] text-white rounded-md font-bold shadow transition-all active:scale-95"
              title="重設遊戲回到第一關"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>

            {/* Stage Select */}
            <button
              onClick={onOpenStageSelect}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-md font-bold shadow transition-all active:scale-95"
              title="章節選單"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>選關</span>
            </button>

            {/* Manual Booklet */}
            <button
              onClick={onOpenManual}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-md font-bold shadow transition-all active:scale-95"
              title="查看說明書與秘技"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>說明書</span>
            </button>
          </div>

          {/* Right toggles (Audio, CRT, Fullscreen) */}
          <div className="flex items-center gap-2">
            {/* BGM Toggle */}
            <button
              onClick={onToggleBgm}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-bold transition-colors ${
                bgmMuted ? 'bg-stone-300 text-stone-600' : 'bg-stone-800 text-cyan-400'
              }`}
              title={bgmMuted ? '開啟晶片背景音樂' : '靜音背景音樂'}
            >
              <Music className="w-3.5 h-3.5" />
              <span className="text-[11px]">{bgmMuted ? 'BGM 關' : 'BGM 開'}</span>
            </button>

            {/* SFX Toggle */}
            <button
              onClick={onToggleSfx}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-bold transition-colors ${
                sfxMuted ? 'bg-stone-300 text-stone-600' : 'bg-stone-800 text-lime-400'
              }`}
              title={sfxMuted ? '開啟音效' : '靜音音效'}
            >
              {sfxMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{sfxMuted ? '音效 關' : '音效 開'}</span>
            </button>

            {/* CRT Toggle */}
            <button
              onClick={onToggleCrt}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-bold transition-colors ${
                crtFilter ? 'bg-stone-800 text-amber-400' : 'bg-stone-300 text-stone-600'
              }`}
              title="切換復古 CRT 掃描線"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[11px]">{crtFilter ? 'CRT 開' : 'CRT 關'}</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md transition-colors"
              title="全螢幕切換"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
