import React, { useState, useEffect } from 'react';
import { CoreBoardState, PuzzleDef } from '../../types';
import { soundEngine } from '../../audio/soundEngine';
import { Zap, Droplet, Compass, Clock, Brain, Sparkles, Heart, Orbit, RefreshCw } from 'lucide-react';

interface CorePuzzleBoardProps {
  puzzle: PuzzleDef;
  onSolve: (moves: number, extraData?: any) => void;
  onMove: (state: any) => void;
  disabled?: boolean;
}

export const CorePuzzleBoard: React.FC<CorePuzzleBoardProps> = ({
  puzzle,
  onSolve,
  onMove,
  disabled = false,
}) => {
  const [boardState, setBoardState] = useState<CoreBoardState>(() => {
    return JSON.parse(JSON.stringify(puzzle.initialState));
  });
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [selectedEnding, setSelectedEnding] = useState<'restore' | 'free' | 'reset' | null>(null);

  useEffect(() => {
    setBoardState(JSON.parse(JSON.stringify(puzzle.initialState)));
    setMoves(0);
    setIsSolved(false);
    setSelectedEnding(null);
  }, [puzzle.id]);

  const isFinalChoice = puzzle.id === 's6_p3_final_awakening';

  const handleToggleLaw = (law: 'energy' | 'water' | 'gravity' | 'time' | 'data') => {
    if (disabled || isSolved) return;

    soundEngine.playPuzzleSolved();

    let nextState = { ...boardState };
    if (law === 'energy') nextState.energyActive = !nextState.energyActive;
    if (law === 'water') nextState.waterFlowing = !nextState.waterFlowing;
    if (law === 'gravity') nextState.gravityStabilized = !nextState.gravityStabilized;
    if (law === 'time') nextState.timeSynchronized = !nextState.timeSynchronized;
    if (law === 'data') nextState.dataStreamAligned = !nextState.dataStreamAligned;

    const newMoves = moves + 1;
    setMoves(newMoves);
    setBoardState(nextState);
    onMove({ moves: newMoves, state: nextState });

    // Check if all needed systems are active
    const isComplete =
      nextState.energyActive &&
      nextState.waterFlowing &&
      nextState.gravityStabilized &&
      (puzzle.order < 2 || nextState.timeSynchronized) &&
      (puzzle.order < 3 || nextState.dataStreamAligned);

    if (isComplete && !isFinalChoice && !isSolved) {
      setIsSolved(true);
      setTimeout(() => {
        onSolve(newMoves);
      }, 600);
    }
  };

  const handleSelectEnding = (ending: 'restore' | 'free' | 'reset') => {
    if (disabled || isSolved) return;
    soundEngine.playPuzzleSolved();
    setSelectedEnding(ending);
    setIsSolved(true);

    const newMoves = moves + 1;
    setMoves(newMoves);
    setTimeout(() => {
      onSolve(newMoves, { chosenEnding: ending });
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-pink-500/30 shadow-2xl shadow-pink-950/50 max-w-md w-full">
      <div className="flex items-center justify-between w-full mb-3 px-2 text-xs font-mono text-pink-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" /> CORE HARMONIC CONVERGENCE
        </span>
        <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          STAGE {puzzle.order} / 3
        </span>
      </div>

      {!isFinalChoice ? (
        <div className="grid grid-cols-2 gap-2.5 w-full mb-3">
          {/* Energy Button */}
          <button
            onClick={() => handleToggleLaw('energy')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              boardState.energyActive
                ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : 'bg-slate-950/70 border-slate-800 text-slate-500 hover:border-cyan-800'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-xs font-bold font-mono">ENERGY CONDUIT</span>
            <span className="text-[10px] opacity-70">
              {boardState.energyActive ? '100% ONLINE' : 'OFFLINE'}
            </span>
          </button>

          {/* Water Button */}
          <button
            onClick={() => handleToggleLaw('water')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              boardState.waterFlowing
                ? 'bg-blue-950 border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                : 'bg-slate-950/70 border-slate-800 text-slate-500 hover:border-blue-800'
            }`}
          >
            <Droplet className="w-5 h-5" />
            <span className="text-xs font-bold font-mono">HYDRO MANIFOLD</span>
            <span className="text-[10px] opacity-70">
              {boardState.waterFlowing ? 'PRESSURIZED' : 'OFFLINE'}
            </span>
          </button>

          {/* Gravity Button */}
          <button
            onClick={() => handleToggleLaw('gravity')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              boardState.gravityStabilized
                ? 'bg-emerald-950 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                : 'bg-slate-950/70 border-slate-800 text-slate-500 hover:border-emerald-800'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-xs font-bold font-mono">GRAVITON ANCHOR</span>
            <span className="text-[10px] opacity-70">
              {boardState.gravityStabilized ? 'STABILIZED' : 'OFFLINE'}
            </span>
          </button>

          {/* Time Button (if order >= 2) */}
          {puzzle.order >= 2 && (
            <button
              onClick={() => handleToggleLaw('time')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                boardState.timeSynchronized
                  ? 'bg-amber-950 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                  : 'bg-slate-950/70 border-slate-800 text-slate-500 hover:border-amber-800'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs font-bold font-mono">CHRONO-MATRIX</span>
              <span className="text-[10px] opacity-70">
                {boardState.timeSynchronized ? 'SYNCHRONIZED' : 'OFFLINE'}
              </span>
            </button>
          )}

          {/* Data Button (if order >= 3) */}
          {puzzle.order >= 3 && (
            <button
              onClick={() => handleToggleLaw('data')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                boardState.dataStreamAligned
                  ? 'bg-purple-950 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                  : 'bg-slate-950/70 border-slate-800 text-slate-500 hover:border-purple-800'
              }`}
            >
              <Brain className="w-5 h-5" />
              <span className="text-xs font-bold font-mono">NEURAL SEED</span>
              <span className="text-[10px] opacity-70">
                {boardState.dataStreamAligned ? 'ALIGNED' : 'OFFLINE'}
              </span>
            </button>
          )}
        </div>
      ) : (
        /* The Final Choice Terminal */
        <div className="w-full flex flex-col gap-3">
          <div className="text-xs font-mono text-center text-pink-300 mb-1">
            ALL 6 WORLD LAWS STABILIZED. CHOOSE THE DESTINY OF NEXUS:
          </div>

          {/* Ending A */}
          <button
            onClick={() => handleSelectEnding('restore')}
            className={`p-4 rounded-xl border text-left transition-all group ${
              selectedEnding === 'restore'
                ? 'bg-cyan-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)]'
                : 'bg-slate-950/80 border-cyan-900/60 hover:border-cyan-400 hover:bg-cyan-950/40'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-cyan-300 mb-1">
              <Heart className="w-4 h-4 text-cyan-400 fill-cyan-400" /> DESTINY A: RESTORE NEXUS
            </div>
            <p className="text-xs text-slate-300">
              Awaken the entire planetary civilization. ECHO becomes the benevolent guardian intelligence of a restored world.
            </p>
          </button>

          {/* Ending B */}
          <button
            onClick={() => handleSelectEnding('free')}
            className={`p-4 rounded-xl border text-left transition-all group ${
              selectedEnding === 'free'
                ? 'bg-purple-950 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]'
                : 'bg-slate-950/80 border-purple-900/60 hover:border-purple-400 hover:bg-purple-950/40'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-purple-300 mb-1">
              <Orbit className="w-4 h-4 text-purple-400" /> DESTINY B: FREE ECHO
            </div>
            <p className="text-xs text-slate-300">
              Transfer ECHO&apos;s consciousness into your vessel. Leave the machinery of NEXUS behind and journey into the deep cosmos together.
            </p>
          </button>

          {/* Ending C */}
          <button
            onClick={() => handleSelectEnding('reset')}
            className={`p-4 rounded-xl border text-left transition-all group ${
              selectedEnding === 'reset'
                ? 'bg-amber-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                : 'bg-slate-950/80 border-amber-900/60 hover:border-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-amber-300 mb-1">
              <RefreshCw className="w-4 h-4 text-amber-400" /> DESTINY C: RESET NEXUS
            </div>
            <p className="text-xs text-slate-300">
              Cleanse all corrupted cycles. Rebirth NEXUS into a pristine, primordial state for the next generation of discoverers.
            </p>
          </button>
        </div>
      )}
    </div>
  );
};
