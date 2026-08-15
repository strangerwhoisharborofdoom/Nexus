import React, { useState, useEffect, useRef } from 'react';
import { PuzzleDef, RegionDef } from '../../types';
import { EnergyPuzzleBoard } from './EnergyPuzzleBoard';
import { WaterPuzzleBoard } from './WaterPuzzleBoard';
import { GravityPuzzleBoard } from './GravityPuzzleBoard';
import { TimePuzzleBoard } from './TimePuzzleBoard';
import { MemoryPuzzleBoard } from './MemoryPuzzleBoard';
import { CorePuzzleBoard } from './CorePuzzleBoard';
import { soundEngine } from '../../audio/soundEngine';
import { echoService } from '../../ai/echoService';
import { MEMORIES } from '../../data/memoriesData';
import { Star, Clock, Award, Sparkles, ChevronRight, HelpCircle, RefreshCw, X } from 'lucide-react';

interface PuzzleEngineProps {
  puzzle: PuzzleDef;
  region: RegionDef;
  onPuzzleCompleted: (puzzleId: string, stars: number, timeSec: number, moves: number, memoryId?: string) => void;
  onClose: () => void;
  onNextPuzzle?: () => void;
  hasPreviousRecord?: { stars: number; timeSec: number; moves: number };
}

export const PuzzleEngine: React.FC<PuzzleEngineProps> = ({
  puzzle,
  region,
  onPuzzleCompleted,
  onClose,
  onNextPuzzle,
  hasPreviousRecord,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [solvedStats, setSolvedStats] = useState<{ stars: number; timeSec: number; moves: number } | null>(null);

  // ECHO In-Puzzle Guidance Modal
  const [hintTier, setHintTier] = useState<1 | 2 | 3 | 4>(1);
  const [showHintModal, setShowHintModal] = useState(false);
  const [echoHintText, setEchoHintText] = useState('');
  const [isQueryingEcho, setIsQueryingEcho] = useState(false);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when puzzle changes
  useEffect(() => {
    setSeconds(0);
    setMoves(0);
    setIsCompleted(false);
    setSolvedStats(null);
    setShowHintModal(false);
    setEchoHintText('');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [puzzle.id]);

  const handlePuzzleSolved = (finalMoves: number, extraData?: any) => {
    if (isCompleted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsCompleted(true);
    soundEngine.playPuzzleSolved();

    // Calculate Stars
    let stars = 1;
    if (finalMoves <= puzzle.targetMovesFor3Stars && seconds <= puzzle.targetTimeSecFor3Stars) {
      stars = 3;
    } else if (finalMoves <= puzzle.targetMovesFor3Stars * 1.5) {
      stars = 2;
    }

    setSolvedStats({ stars, timeSec: seconds, moves: finalMoves });

    // Call store callback
    onPuzzleCompleted(puzzle.id, stars, seconds, finalMoves, puzzle.consequence.unlockedMemoryId);
  };

  const handleRequestHint = async (tier: 1 | 2 | 3 | 4) => {
    setHintTier(tier);
    setShowHintModal(true);
    setIsQueryingEcho(true);

    const res = await echoService.queryEcho({
      hintLevel: tier,
      currentRegion: region,
      currentPuzzle: puzzle,
      restorationPercentage: 0,
      discoveredMemoriesCount: 1,
      echoMemoryLevel: 2,
    });

    setEchoHintText(res.reply);
    setIsQueryingEcho(false);
  };

  // Format Time (MM:SS)
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const unlockedMem = puzzle.consequence.unlockedMemoryId
    ? MEMORIES.find((m) => m.id === puzzle.consequence.unlockedMemoryId)
    : null;

    const law = puzzle.worldLaw || puzzle.law || 'energy';

    return (
    <div className="relative z-20 flex flex-col items-center justify-between w-full max-w-4xl min-h-[85vh] p-4 md:p-6 select-none animate-fadeIn">
      {/* Top Navigation HUD */}
      <div className="w-full flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800 shadow-xl mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold font-mono px-2 py-0.5 rounded uppercase"
              style={{ backgroundColor: `${region.themeColor}22`, color: region.themeColor }}
            >
              {region.name} • {puzzle.order} / {region.totalPuzzles}
            </span>
            <span className="text-xs text-slate-400 font-mono">[{law.toUpperCase()} LAW]</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-wide mt-0.5">
            {puzzle.title}
          </h2>
          <span className="text-xs text-slate-400 italic">{puzzle.objective}</span>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{formatTime(seconds)}</span>
          </div>

          {/* Hint Button */}
          <button
            onClick={() => handleRequestHint(hintTier)}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 hover:border-cyan-400 transition-all active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">ECHO HINT</span>
          </button>

          {/* Close / Return to Map */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-90"
            title="Return to Sector Map"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Board Container */}
      <div className="flex-1 flex items-center justify-center w-full my-auto">
        {law === 'energy' && (
          <EnergyPuzzleBoard
            puzzle={puzzle}
            onSolve={handlePuzzleSolved}
            onMove={(s) => setMoves(s.moves || 0)}
            disabled={isCompleted}
          />
        )}
        {law === 'water' && (
          <WaterPuzzleBoard
            puzzle={puzzle}
            onSolve={handlePuzzleSolved}
            onMove={(s) => setMoves(s.moves || 0)}
            disabled={isCompleted}
          />
        )}
        {law === 'gravity' && (
          <GravityPuzzleBoard
            puzzle={puzzle}
            onSolve={handlePuzzleSolved}
            onMove={(s) => setMoves(s.moves || 0)}
            disabled={isCompleted}
          />
        )}
        {law === 'time' && (
          <TimePuzzleBoard
            puzzle={puzzle}
            onSolve={handlePuzzleSolved}
            onMove={(s) => setMoves(s.moves || 0)}
            disabled={isCompleted}
          />
        )}
        {law === 'information' && (
          <MemoryPuzzleBoard
            puzzle={puzzle}
            onSolve={handlePuzzleSolved}
            onMove={(s) => setMoves(s.moves || 0)}
            disabled={isCompleted}
          />
        )}
        {law === 'matter' && (
          <CorePuzzleBoard
            puzzle={puzzle}
            onSolve={handlePuzzleSolved}
            onMove={(s) => setMoves(s.moves || 0)}
            disabled={isCompleted}
          />
        )}
      </div>

      {/* ECHO Hint Overlay Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-5 max-w-lg w-full shadow-2xl shadow-cyan-950/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">ECHO NEURAL ADVISOR</h3>
                  <span className="text-[10px] text-cyan-400 font-mono">Socratic Diagnostic Guidance</span>
                </div>
              </div>
              <button
                onClick={() => setShowHintModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4-Tier Hint Selector */}
            <div className="grid grid-cols-4 gap-1.5 mb-4 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {([1, 2, 3, 4] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleRequestHint(tier)}
                  className={`py-1.5 text-xs font-mono rounded-lg transition-all ${
                    hintTier === tier
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  Tier {tier}
                </button>
              ))}
            </div>

            {/* Message Body */}
            <div className="p-4 bg-slate-950/90 rounded-xl border border-cyan-900/40 text-sm text-cyan-100/90 leading-relaxed font-sans min-h-[90px] flex items-center">
              {isQueryingEcho ? (
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" /> ECHO synthesising harmonic diagnostic...
                </div>
              ) : (
                <p className="italic">{echoHintText}</p>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowHintModal(false)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl font-mono transition-all"
              >
                RETURN TO PUZZLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Celebration Modal */}
      {isCompleted && solvedStats && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900/95 border-2 border-cyan-400 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl shadow-cyan-500/40 flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(6,182,212,0.8)] animate-bounce">
              <Sparkles className="w-8 h-8 text-cyan-300" />
            </div>

            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
              SYSTEM RESTORED • HARMONY ACHIEVED
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {puzzle.title} Online
            </h2>

            {/* Stars Animation */}
            <div className="flex items-center justify-center gap-2 my-3">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-7 h-7 transition-all duration-500 ${
                    starIdx <= solvedStats.stars
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-110'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3 w-full bg-slate-950/80 p-3 rounded-2xl border border-slate-800 my-4 text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-slate-400">COMPLETION TIME</span>
                <span className="text-base text-cyan-300 font-bold">{formatTime(solvedStats.timeSec)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">TOTAL MOVES</span>
                <span className="text-base text-cyan-300 font-bold">{solvedStats.moves}</span>
              </div>
            </div>

            {/* Living World Consequence Banner */}
            <div className="w-full bg-cyan-950/40 border border-cyan-500/40 p-3.5 rounded-2xl mb-4 text-left">
              <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> World Consequence
              </div>
              <p className="text-xs text-white leading-relaxed">
                {puzzle.consequence.description}
              </p>
            </div>

            {/* Unlocked Memory Fragment if applicable */}
            {unlockedMem && (
              <div className="w-full bg-purple-950/40 border border-purple-500/40 p-3.5 rounded-2xl mb-4 text-left">
                <div className="text-[10px] font-mono text-purple-300 uppercase tracking-wider mb-1">
                  Memory Fragment Unlocked: {unlockedMem.title}
                </div>
                <p className="text-xs text-purple-200/90 italic">
                  «{unlockedMem.content.substring(0, 100)}...»
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all"
              >
                SECTOR MAP
              </button>
              {onNextPuzzle && (
                <button
                  onClick={onNextPuzzle}
                  className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center justify-center gap-1"
                >
                  NEXT PUZZLE <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
