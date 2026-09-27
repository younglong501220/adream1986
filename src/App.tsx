/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameState, StageId, ControllerKeys, FriendRescueInfo } from './game/types';
import { retroAudio } from './game/sound';
import { ConsoleBezel } from './components/ConsoleBezel';
import { TouchController } from './components/TouchController';
import { InstructionModal } from './components/InstructionModal';
import { StageSelectModal } from './components/StageSelectModal';
import { Gamepad2, Sparkles, HelpCircle } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [currentStage, setCurrentStage] = useState<StageId>(1);
  const [score, setScore] = useState<number>(0);
  const [crtFilter, setCrtFilter] = useState<boolean>(true);
  const [bgmMuted, setBgmMuted] = useState<boolean>(false);
  const [sfxMuted, setSfxMuted] = useState<boolean>(false);
  const [showManual, setShowManual] = useState<boolean>(false);
  const [showStageSelect, setShowStageSelect] = useState<boolean>(false);
  const [showTouchPad, setShowTouchPad] = useState<boolean>(true);

  // Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onScoreUpdate: (newScore) => setScore(newScore),
      onStateChange: (newState, newStage) => {
        setGameState(newState);
        setCurrentStage(newStage);
      },
      onFriendRescued: (_friend: FriendRescueInfo) => {
        // Can trigger any extra feedback if needed
      },
      onBossEncounter: (_active: boolean) => {
        // Boss fight hooks
      },
    });

    engineRef.current = engine;
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent page scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      const engine = engineRef.current;
      if (!engine) return;

      retroAudio.init();

      if (e.code === 'KeyW' || e.code === 'ArrowUp') engine.keys.up = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') engine.keys.down = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') engine.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') engine.keys.right = true;

      // Shoot (B Button)
      if (e.code === 'KeyJ' || e.code === 'Space') {
        if (!engine.keys.shoot) {
          if (engine.state === 'TITLE' || engine.state === 'GAMEOVER' || engine.state === 'VICTORY') {
            engine.newGame(engine.stage);
          } else {
            engine.shootAction();
          }
        }
        engine.keys.shoot = true;
      }

      // Jump (A Button)
      if (e.code === 'KeyK' || e.code === 'KeyZ') {
        if (!engine.keys.jump) {
          if (engine.state === 'TITLE' || engine.state === 'GAMEOVER' || engine.state === 'VICTORY') {
            engine.newGame(engine.stage);
          } else {
            engine.jumpAction();
          }
        }
        engine.keys.jump = true;
      }

      // Start Button (Enter or P)
      if (e.code === 'Enter' || e.code === 'KeyP') {
        if (engine.state === 'TITLE' || engine.state === 'GAMEOVER' || engine.state === 'VICTORY') {
          engine.newGame(1);
        }
      }

      // Select Button (Shift)
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setShowStageSelect(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') engine.keys.up = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') engine.keys.down = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') engine.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') engine.keys.right = false;
      if (e.code === 'KeyJ' || e.code === 'Space') engine.keys.shoot = false;
      if (e.code === 'KeyK' || e.code === 'KeyZ') engine.keys.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Controller Handlers
  const handleKeyChange = useCallback((key: keyof ControllerKeys, pressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.keys[key] = pressed;
    }
  }, []);

  const handleShootPress = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.state === 'TITLE' || engine.state === 'GAMEOVER' || engine.state === 'VICTORY') {
      engine.newGame(engine.stage);
    } else {
      engine.shootAction();
    }
  }, []);

  const handleJumpPress = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.state === 'TITLE' || engine.state === 'GAMEOVER' || engine.state === 'VICTORY') {
      engine.newGame(engine.stage);
    } else {
      engine.jumpAction();
    }
  }, []);

  const handleStartPress = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.state === 'TITLE' || engine.state === 'GAMEOVER' || engine.state === 'VICTORY') {
      engine.newGame(1);
    }
  }, []);

  const handleSelectPress = useCallback(() => {
    setShowStageSelect(true);
  }, []);

  const handleReset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.newGame(1);
    }
  }, []);

  const handleSelectStage = useCallback((st: StageId) => {
    if (engineRef.current) {
      engineRef.current.newGame(st);
    }
  }, []);

  const toggleBgm = useCallback(() => {
    setBgmMuted(prev => {
      const next = !prev;
      retroAudio.setBgmMuted(next);
      return next;
    });
  }, []);

  const toggleSfx = useCallback(() => {
    setSfxMuted(prev => {
      const next = !prev;
      retroAudio.setSfxMuted(next);
      return next;
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none font-sans"
    >
      {/* Top Banner */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 border-b border-stone-800 text-xs text-stone-400 font-mono mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-amber-300">1986 FC 紅白機《哆啦A夢》經典復刻</span>
          <span className="hidden sm:inline text-stone-500">| 開拓篇・魔境篇・海底篇</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTouchPad(prev => !prev)}
            className="flex items-center gap-1 hover:text-stone-200 transition-colors"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-red-500" />
            <span>{showTouchPad ? '隱藏手把' : '顯示手把'}</span>
          </button>
          <button
            onClick={() => setShowManual(true)}
            className="flex items-center gap-1 hover:text-stone-200 transition-colors text-amber-400"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>說明書</span>
          </button>
        </div>
      </header>

      {/* Main Console & Game Canvas */}
      <main className="w-full max-w-4xl flex flex-col items-center justify-center my-auto">
        <ConsoleBezel
          score={score}
          stage={currentStage}
          crtFilter={crtFilter}
          onToggleCrt={() => setCrtFilter(prev => !prev)}
          bgmMuted={bgmMuted}
          onToggleBgm={toggleBgm}
          sfxMuted={sfxMuted}
          onToggleSfx={toggleSfx}
          onReset={handleReset}
          onOpenManual={() => setShowManual(true)}
          onOpenStageSelect={() => setShowStageSelect(true)}
          onToggleFullscreen={toggleFullscreen}
        >
          <canvas
            ref={canvasRef}
            width={512}
            height={448}
            className="w-full h-auto max-h-[70vh] aspect-[512/448] block cursor-pointer select-none"
            style={{ imageRendering: 'pixelated' }}
            onClick={() => {
              retroAudio.init();
              if (engineRef.current && (engineRef.current.state === 'TITLE' || engineRef.current.state === 'GAMEOVER' || engineRef.current.state === 'VICTORY')) {
                engineRef.current.newGame(engineRef.current.stage);
              }
            }}
          />
        </ConsoleBezel>

        {/* On-Screen Touch Controller */}
        {showTouchPad && (
          <div className="w-full max-w-4xl mt-3">
            <TouchController
              onKeyChange={handleKeyChange}
              onShootPress={handleShootPress}
              onJumpPress={handleJumpPress}
              onStartPress={handleStartPress}
              onSelectPress={handleSelectPress}
            />
          </div>
        )}
      </main>

      {/* Keyboard Guide Footer */}
      <footer className="w-full max-w-4xl mt-3 pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between text-[11px] text-stone-400 font-mono gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-stone-500 font-bold">鍵盤操作:</span>
          <span className="bg-stone-900 px-2 py-0.5 rounded border border-stone-800 text-stone-300">
            方向鍵 / WASD 移動
          </span>
          <span className="bg-stone-900 px-2 py-0.5 rounded border border-stone-800 text-amber-300">
            J / 空白鍵 [B] 空氣砲
          </span>
          <span className="bg-stone-900 px-2 py-0.5 rounded border border-stone-800 text-amber-300">
            K / Z [A] 跳躍
          </span>
          <span className="bg-stone-900 px-2 py-0.5 rounded border border-stone-800 text-stone-300">
            Enter / P 開始/重試
          </span>
          <span className="bg-stone-900 px-2 py-0.5 rounded border border-stone-800 text-stone-300">
            Shift 選關
          </span>
        </div>

        <div className="text-stone-500 text-right">
          HUDSON SOFT 1986 / FUJIKO-PRO 致敬復刻
        </div>
      </footer>

      {/* Modals */}
      <InstructionModal
        isOpen={showManual}
        onClose={() => setShowManual(false)}
        onSelectStage={handleSelectStage}
      />

      <StageSelectModal
        isOpen={showStageSelect}
        currentStage={currentStage}
        onClose={() => setShowStageSelect(false)}
        onSelect={handleSelectStage}
      />
    </div>
  );
}
