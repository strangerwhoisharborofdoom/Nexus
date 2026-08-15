import React, { useState, useEffect } from 'react';
import { GameSaveState, RegionId } from './types';
import { gameStore } from './engine/gameStateStore';
import { REGIONS } from './data/regionsData';
import { ALL_PUZZLES } from './data/puzzlesData';
import { soundEngine } from './audio/soundEngine';
import { Nexus3DWorld } from './components/world/Nexus3DWorld';
import { WorldMapUI } from './components/ui/WorldMapUI';
import { PuzzleEngine } from './components/puzzles/PuzzleEngine';
import { EchoHologramUI } from './components/ui/EchoHologramUI';
import { LoreVaultModal } from './components/ui/LoreVaultModal';
import { JudgeModeModal } from './components/ui/JudgeModeModal';
import { IntroCinematicModal } from './components/ui/IntroCinematicModal';
import {
  Globe,
  Bot,
  BookOpen,
  Award,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  RotateCcw,
} from 'lucide-react';

export function App() {
  const [gameState, setGameState] = useState<GameSaveState>(() => gameStore.getState());
  const [activeView, setActiveView] = useState<'map' | 'puzzle'>('map');
  const [showEchoChat, setShowEchoChat] = useState(false);
  const [showLoreVault, setShowLoreVault] = useState(false);
  const [showJudgeMode, setShowJudgeMode] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);

  // Subscribe to game store updates
  useEffect(() => {
    const unsubscribe = gameStore.subscribe((state) => {
      setGameState(state);
    });
    return unsubscribe;
  }, []);

  // Show intro cinematic on initial session if not marked
  useEffect(() => {
    if (!gameState.hasSeenIntroCinematic) {
      setShowIntro(true);
    }
  }, []);

  // Handler: Select a Region from World Map
  const handleSelectRegion = (regionId: RegionId) => {
    gameStore.setCurrentRegion(regionId);
  };

  // Handler: Open a specific Puzzle Node
  const handleSelectPuzzle = (puzzleId: string) => {
    gameStore.setCurrentPuzzle(puzzleId);
    setActiveView('puzzle');
  };

  // Handler: Solve Puzzle
  const handlePuzzleCompleted = (
    puzzleId: string,
    stars: number,
    timeSec: number,
    moves: number,
    unlockedMemoryId?: string
  ) => {
    gameStore.completePuzzle(puzzleId, stars, timeSec, moves, unlockedMemoryId);
    setCelebrationTrigger((prev) => prev + 1);
  };

  // Handler: Advance to next sequential puzzle in current region
  const handleNextPuzzle = () => {
    const currentRegion = REGIONS[gameState.currentRegionId];
    if (!currentRegion) return;

    const currentIdx = currentRegion.puzzles.findIndex((p) => p.id === gameState.currentPuzzleId);
    if (currentIdx !== -1 && currentIdx < currentRegion.puzzles.length - 1) {
      const nextPuzzle = currentRegion.puzzles[currentIdx + 1];
      gameStore.setCurrentPuzzle(nextPuzzle.id);
    } else {
      // Completed all in sector, return to map
      setActiveView('map');
    }
  };

  // Toggle Audio Mute
  const handleToggleAudio = () => {
    soundEngine.init();
    const isMuted = soundEngine.toggleSound();
    soundEngine.toggleMusic();
    setGameState((prev) => ({
      ...prev,
      audioSettings: {
        ...prev.audioSettings,
        soundMuted: isMuted,
        musicMuted: isMuted,
      },
    }));
  };

  const currentRegion = REGIONS[gameState.currentRegionId] || REGIONS.awakening;
  const currentPuzzle = ALL_PUZZLES.find((p) => p.id === gameState.currentPuzzleId) || currentRegion.puzzles[0];
  const globalRestoration = Math.round(
    (Object.values(gameState.regionRestoration) as number[]).reduce((a, b) => a + b, 0) / 6
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3D Background World Canvas */}
      <Nexus3DWorld
        currentRegionId={gameState.currentRegionId}
        restorationPercentage={gameState.regionRestoration[gameState.currentRegionId] || 0}
        allRestorations={gameState.regionRestoration}
        isPuzzleActive={activeView === 'puzzle'}
        celebrationTrigger={celebrationTrigger}
      />

      {/* Global Top Navigation Bar */}
      <header className="relative z-30 flex items-center justify-between px-4 md:px-8 py-3.5 bg-slate-950/70 backdrop-blur-md border-b border-slate-800/80 shadow-lg select-none">
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveView('map')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-cyan-300 fill-cyan-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm md:text-base tracking-widest text-white font-mono">
                NEXUS
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                WORLD OF LIVING PUZZLES
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Every puzzle you solve changes the world
            </span>
          </div>
        </div>

        {/* Global Controls & Modals */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* View Toggle: Map vs Active Puzzle */}
          {activeView === 'puzzle' ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveView('map');
              }}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">WORLD MAP</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundEngine.playClick();
                if (currentPuzzle) setActiveView('puzzle');
              }}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 transition-all active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">CURRENT PUZZLE</span>
            </button>
          )}

          {/* ECHO AI Companion Dialogue */}
          <button
            onClick={() => {
              soundEngine.playEchoChime();
              setShowEchoChat(true);
            }}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-800 text-cyan-300 transition-all active:scale-95"
            title="Speak with ECHO AI Companion"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">ECHO</span>
          </button>

          {/* Lore Vault Archive */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowLoreVault(true);
            }}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-800 text-purple-300 transition-all active:scale-95"
            title="View Unlocked Memory Shards"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">LORE ({gameState.unlockedMemories.length})</span>
          </button>

          {/* Judge Mode (Hackathon Showcase) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowJudgeMode(true);
            }}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-300 transition-all active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
            title="Judge & Hackathon Showcase Mode"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">JUDGE MODE</span>
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleToggleAudio}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all active:scale-90"
            title="Toggle Procedural Audio Engine"
          >
            {gameState.audioSettings.soundMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <section className="relative z-20 flex-1 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
        {activeView === 'map' ? (
          <WorldMapUI
            gameState={gameState}
            onSelectRegion={handleSelectRegion}
            onSelectPuzzle={handleSelectPuzzle}
            currentRegionId={gameState.currentRegionId}
          />
        ) : (
          <PuzzleEngine
            puzzle={currentPuzzle}
            region={currentRegion}
            onPuzzleCompleted={handlePuzzleCompleted}
            onClose={() => setActiveView('map')}
            onNextPuzzle={handleNextPuzzle}
            hasPreviousRecord={gameState.completedPuzzles[currentPuzzle.id]}
          />
        )}
      </section>

      {/* Modals & Overlays */}
      {showEchoChat && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <EchoHologramUI gameState={gameState} onClose={() => setShowEchoChat(false)} />
        </div>
      )}

      {showLoreVault && (
        <LoreVaultModal
          unlockedMemoryIds={gameState.unlockedMemories}
          onClose={() => setShowLoreVault(false)}
        />
      )}

      {showJudgeMode && (
        <JudgeModeModal
          gameState={gameState}
          onClose={() => setShowJudgeMode(false)}
          onUpdateSave={(updated) => {
            if (updated.completedPuzzles) {
              Object.entries(updated.completedPuzzles).forEach(([pId, data]) => {
                const item = data as { stars: number; timeSec: number; moves: number };
                gameStore.completePuzzle(pId, item.stars, item.timeSec, item.moves);
              });
            }
            if (updated.unlockedMemories) {
              updated.unlockedMemories.forEach((memId) => gameStore.unlockMemory(memId));
            }
          }}
          onJumpToPuzzle={(puzzleId) => {
            gameStore.setCurrentPuzzle(puzzleId);
            setActiveView('puzzle');
          }}
        />
      )}

      {showIntro && (
        <IntroCinematicModal
          onBegin={() => {
            gameStore.markIntroSeen();
            setShowIntro(false);
          }}
        />
      )}
    </main>
  );
}

export default App;
