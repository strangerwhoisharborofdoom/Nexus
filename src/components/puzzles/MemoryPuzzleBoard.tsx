import React, { useState, useEffect } from 'react';
import { GlyphSymbol, PuzzleDef } from '../../types';
import { soundEngine } from '../../audio/soundEngine';
import { Brain, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

interface MemoryPuzzleBoardProps {
  puzzle: PuzzleDef;
  onSolve: (moves: number) => void;
  onMove: (state: any) => void;
  disabled?: boolean;
}

export const MemoryPuzzleBoard: React.FC<MemoryPuzzleBoardProps> = ({
  puzzle,
  onSolve,
  onMove,
  disabled = false,
}) => {
  const targetPattern: string[] = puzzle.initialState.targetPattern || [];
  const availableGlyphs: any[] = puzzle.initialState.availableGlyphs || [];

  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    setInputSequence([]);
    setMoves(0);
    setIsSolved(false);
  }, [puzzle.id]);

  const handleGlyphClick = (symbol: string) => {
    if (disabled || isSolved) return;

    soundEngine.playGlyphDecode();

    const nextInput = [...inputSequence, symbol];
    const newMoves = moves + 1;
    setMoves(newMoves);
    setInputSequence(nextInput);

    onMove({ moves: newMoves, inputSequence: nextInput });

    // Check match so far
    const currentIndex = nextInput.length - 1;
    if (targetPattern[currentIndex] !== symbol) {
      // Wrong symbol in sequence, reset with audio feedback
      soundEngine.playError();
      setTimeout(() => {
        setInputSequence([]);
      }, 400);
      return;
    }

    // If full sequence correctly input
    if (nextInput.length === targetPattern.length) {
      setIsSolved(true);
      setTimeout(() => {
        onSolve(newMoves);
      }, 500);
    }
  };

  const handleReset = () => {
    soundEngine.playClick();
    setInputSequence([]);
  };

  const progressPercent = Math.round((inputSequence.length / targetPattern.length) * 100);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-950/50 max-w-md w-full">
      <div className="flex items-center justify-between w-full mb-3 px-2 text-xs font-mono text-purple-400">
        <span className="flex items-center gap-1">
          <Brain className="w-3.5 h-3.5" /> SYNAPTIC DECRYPTION: <strong className="text-white">{progressPercent}%</strong>
        </span>
        <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          MOVES: <strong className="text-white">{moves}</strong> / {puzzle.targetMovesFor3Stars}
        </span>
      </div>

      {/* Target Pattern Display Slots */}
      <div className="w-full p-3 bg-slate-950/90 rounded-xl border border-purple-900/50 mb-4 flex flex-col items-center">
        <div className="text-[10px] uppercase font-mono tracking-wider text-purple-300 mb-2">
          Target Harmonic Neural Sequence
        </div>

        <div className="flex gap-2 items-center justify-center">
          {targetPattern.map((targetSym, idx) => {
            const isFilled = inputSequence.length > idx;
            const currentSym = inputSequence[idx];
            const isCurrent = inputSequence.length === idx;

            return (
              <div
                key={idx}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${
                  isFilled
                    ? 'bg-purple-950 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.7)] scale-105'
                    : isCurrent
                    ? 'border-dashed border-purple-400 bg-slate-900 animate-pulse text-purple-400/50'
                    : 'border-slate-800 bg-slate-900/50 text-slate-600'
                }`}
              >
                {isFilled ? currentSym : '?'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Interactive Glyphs */}
      <div className="grid grid-cols-3 gap-2.5 w-full mb-3">
        {availableGlyphs.map((glyph) => {
          return (
            <button
              key={glyph.id}
              onClick={() => handleGlyphClick(glyph.symbol)}
              disabled={disabled || isSolved}
              id={`glyph-btn-${glyph.id}`}
              className="p-3 rounded-xl bg-slate-950/80 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500 text-purple-300 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 group shadow-lg"
            >
              <span className="text-xl font-bold group-hover:scale-110 transition-transform">
                {glyph.symbol}
              </span>
              <span className="text-[9px] font-mono text-purple-400/70 tracking-wider">
                {glyph.meaning}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between w-full pt-2 border-t border-slate-800">
        <button
          onClick={handleReset}
          disabled={disabled || isSolved || inputSequence.length === 0}
          className="text-xs font-mono text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors disabled:opacity-30"
        >
          <RefreshCw className="w-3 h-3" /> Clear Sequence
        </button>
        <span className="text-[10px] text-purple-400/60 font-mono">
          Select glyphs matching the neural frequency
        </span>
      </div>
    </div>
  );
};
