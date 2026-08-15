import React from 'react';
import { GameSaveState, RegionId } from '../../types';
import { REGIONS, REGION_ORDER } from '../../data/regionsData';
import { ALL_PUZZLES } from '../../data/puzzlesData';
import { MEMORIES } from '../../data/memoriesData';
import { soundEngine } from '../../audio/soundEngine';
import { Award, Zap, Sparkles, CheckCheck, RefreshCw, X, Play, Volume2 } from 'lucide-react';

interface JudgeModeModalProps {
  gameState: GameSaveState;
  onClose: () => void;
  onUpdateSave: (updated: Partial<GameSaveState>) => void;
  onJumpToPuzzle: (puzzleId: string) => void;
}

export const JudgeModeModal: React.FC<JudgeModeModalProps> = ({
  gameState,
  onClose,
  onUpdateSave,
  onJumpToPuzzle,
}) => {
  // Quick Unlock All Puzzles with 3 stars
  const handleUnlockAll = () => {
    soundEngine.playPuzzleSolved();

    const allCompleted: Record<string, { stars: number; timeSec: number; moves: number; completedAt: number }> = {};
    ALL_PUZZLES.forEach((p) => {
      allCompleted[p.id] = {
        stars: 3,
        timeSec: (p as any).targetTimeSecFor3Stars || 45,
        moves: p.targetMovesFor3Stars || 8,
        completedAt: Date.now(),
      };
    });

    const allRestored: Record<RegionId, number> = {
      awakening: 100,
      flooded: 100,
      gravity: 100,
      clockwork: 100,
      memory: 100,
      core: 100,
    };

    onUpdateSave({
      completedPuzzles: allCompleted,
      regionRestoration: allRestored,
      unlockedMemories: MEMORIES.map((m) => m.id),
      echoMemoryLevel: 10,
    });
  };

  // Instant Restore a single Sector
  const handleRestoreSector = (regionId: RegionId) => {
    soundEngine.playEnergyPowerPulse();

    const sectorPuzzles = ALL_PUZZLES.filter((p) => p.sectorId === regionId);
    const updatedCompleted = { ...gameState.completedPuzzles };

    sectorPuzzles.forEach((p) => {
      updatedCompleted[p.id] = {
        stars: 3,
        timeSec: 30,
        moves: p.targetMovesFor3Stars,
        completedAt: Date.now(),
      };
    });

    const updatedRestorations = {
      ...gameState.regionRestoration,
      [regionId]: 100,
    };

    onUpdateSave({
      completedPuzzles: updatedCompleted,
      regionRestoration: updatedRestorations,
    });
  };

  // Sound Engine Test
  const handleTestAudio = (sound: 'spark' | 'water' | 'gravity' | 'time' | 'glyph' | 'victory') => {
    if (sound === 'spark') soundEngine.playEnergyPowerPulse();
    if (sound === 'water') soundEngine.playWaterFlow();
    if (sound === 'gravity') soundEngine.playGravityShift();
    if (sound === 'time') soundEngine.playTimeShift();
    if (sound === 'glyph') soundEngine.playGlyphDecode();
    if (sound === 'victory') soundEngine.playPuzzleSolved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fadeIn select-none">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-amber-950/80 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono tracking-wide">
                JUDGE & EVALUATOR SHOWCASE CONSOLE
              </h2>
              <span className="text-xs text-amber-400 font-mono">
                Puzzle Masters Hackathon 2026 • Live Inspection Controls
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
          <button
            onClick={handleUnlockAll}
            className="p-4 rounded-2xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/60 text-left transition-all flex items-center justify-between group shadow-lg"
          >
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-amber-300 mb-1">
                <CheckCheck className="w-4 h-4" /> 1-CLICK UNLOCK ENTIRE WORLD
              </div>
              <p className="text-xs text-slate-300">
                Instantly completes all 28 puzzles, unlocks all 18 lore shards, and maximizes ECHO Memory Level to 10.
              </p>
            </div>
            <Sparkles className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
          </button>

          <button
            onClick={() => {
              onClose();
              onJumpToPuzzle('s6_p3_final_awakening');
            }}
            className="p-4 rounded-2xl bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/60 text-left transition-all flex items-center justify-between group shadow-lg"
          >
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-pink-300 mb-1">
                <Play className="w-4 h-4" /> TEST FINAL CONVERGENCE & ENDINGS
              </div>
              <p className="text-xs text-slate-300">
                Directly jump to Sector 06 (The Core) to test the three philosophical branching destiny choices.
              </p>
            </div>
            <Sparkles className="w-6 h-6 text-pink-400 group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        {/* Individual Sector Instant Restore */}
        <div className="my-2">
          <h3 className="text-xs font-bold font-mono text-slate-400 mb-2 uppercase tracking-wider">
            Sector Instant Restore (Inspect 3D Transformations)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {REGION_ORDER.map((regId) => {
              const reg = REGIONS[regId];
              const pct = gameState.regionRestoration[regId] || 0;

              return (
                <button
                  key={regId}
                  onClick={() => handleRestoreSector(regId)}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-left transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] font-mono text-slate-400">{reg.number} {reg.name}</span>
                  <span
                    className="text-xs font-bold font-mono mt-1"
                    style={{ color: reg.themeColor }}
                  >
                    {pct === 100 ? 'RESTORED' : 'RESTORE NOW'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Procedural Audio Synthesis Test Pad */}
        <div className="my-3 pt-3 border-t border-slate-800">
          <h3 className="text-xs font-bold font-mono text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Procedural Web Audio Synthesizer Test (Zero MP3 Files)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { id: 'spark', label: 'Energy Arc Pulse' },
              { id: 'water', label: 'Hydro Turbine' },
              { id: 'gravity', label: 'Graviton Shift' },
              { id: 'time', label: 'Chrono Tick' },
              { id: 'glyph', label: 'Glyph Decode' },
              { id: 'victory', label: 'Sector Harmonized' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => handleTestAudio(snd.id as any)}
                className="py-2 px-2.5 rounded-lg bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-all"
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Evaluation Rubric Reference */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
          <span>Target: Puzzle Masters Hackathon 2026</span>
          <span className="text-amber-400">Architecture: Full-Stack React + Three.js + Gemini Live</span>
        </div>
      </div>
    </div>
  );
};
