import React, { useState, useEffect } from 'react';
import { PuzzleDef, TimeBoardState, TimeEntity, TimeEra } from '../../types';
import { soundEngine } from '../../audio/soundEngine';
import { Clock, History, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TimePuzzleBoardProps {
  puzzle: PuzzleDef;
  onSolve: (moves: number) => void;
  onMove: (state: any) => void;
  disabled?: boolean;
}

export const TimePuzzleBoard: React.FC<TimePuzzleBoardProps> = ({
  puzzle,
  onSolve,
  onMove,
  disabled = false,
}) => {
  const [boardState, setBoardState] = useState<TimeBoardState>(() => {
    return JSON.parse(JSON.stringify(puzzle.initialState));
  });
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    setBoardState(JSON.parse(JSON.stringify(puzzle.initialState)));
    setMoves(0);
    setIsSolved(false);
  }, [puzzle.id]);

  const checkVictory = (state: TimeBoardState): boolean => {
    // Condition 1: If entities exist, check if all entities are in a functional/passable state
    if (state.entities && state.entities.length > 0) {
      return state.entities.every((entity) => {
        const era = entity.currentEra;
        if (era === 'PAST') return entity.pastState.passable || entity.pastState.active;
        if (era === 'PRESENT') return entity.presentState.passable || entity.presentState.active;
        if (era === 'FUTURE') return entity.futureState.passable || entity.futureState.active;
        return false;
      });
    }
    return false;
  };

  const handleSetGlobalEra = (era: TimeEra) => {
    if (disabled || isSolved) return;

    soundEngine.playTimeShift();

    const updatedEntities = boardState.entities.map((e) => ({
      ...e,
      currentEra: era,
    }));

    const newMoves = moves + 1;
    const newState = {
      ...boardState,
      globalEra: era,
      entities: updatedEntities,
    };

    setMoves(newMoves);
    setBoardState(newState);
    onMove({ moves: newMoves, globalEra: era, entities: updatedEntities });

    if (checkVictory(newState) && !isSolved) {
      setIsSolved(true);
      setTimeout(() => {
        onSolve(newMoves);
      }, 500);
    }
  };

  const handleToggleEntityEra = (entityId: string, era: TimeEra) => {
    if (disabled || isSolved) return;

    soundEngine.playTimeShift();

    const updatedEntities = boardState.entities.map((e) => {
      if (e.id === entityId) {
        return { ...e, currentEra: era };
      }
      return e;
    });

    const newMoves = moves + 1;
    const newState = {
      ...boardState,
      entities: updatedEntities,
    };

    setMoves(newMoves);
    setBoardState(newState);
    onMove({ moves: newMoves, entities: updatedEntities });

    if (checkVictory(newState) && !isSolved) {
      setIsSolved(true);
      setTimeout(() => {
        onSolve(newMoves);
      }, 500);
    }
  };

  const getEntityCurrentStateInfo = (entity: TimeEntity) => {
    if (entity.currentEra === 'PAST') return entity.pastState;
    if (entity.currentEra === 'FUTURE') return entity.futureState;
    return entity.presentState;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-500/30 shadow-2xl shadow-amber-950/50 max-w-md w-full">
      <div className="flex items-center justify-between w-full mb-3 px-2 text-xs font-mono text-amber-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> CHRONO-STATE: <strong className="text-white">{boardState.globalEra}</strong>
        </span>
        <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          MOVES: <strong className="text-white">{moves}</strong> / {puzzle.targetMovesFor3Stars}
        </span>
      </div>

      {/* Global Timeline Era Scrubber */}
      <div className="w-full flex items-center justify-between p-1.5 bg-slate-950/90 rounded-xl border border-amber-900/50 mb-4">
        {(['PAST', 'PRESENT', 'FUTURE'] as TimeEra[]).map((era) => {
          const isActive = boardState.globalEra === era;
          return (
            <button
              key={era}
              onClick={() => handleSetGlobalEra(era)}
              disabled={disabled || isSolved}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-102'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-amber-950/40'
              }`}
            >
              {era === 'PAST' && <History className="w-3.5 h-3.5" />}
              {era === 'PRESENT' && <Clock className="w-3.5 h-3.5" />}
              {era === 'FUTURE' && <Sparkles className="w-3.5 h-3.5" />}
              {era}
            </button>
          );
        })}
      </div>

      {/* Temporal Object Entities List */}
      <div className="w-full flex flex-col gap-3">
        {boardState.entities.map((entity) => {
          const stateInfo = getEntityCurrentStateInfo(entity);
          const isOperational = stateInfo.passable || stateInfo.active;

          return (
            <div
              key={entity.id}
              className={`p-3 rounded-xl border transition-all ${
                isOperational
                  ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isOperational ? 'bg-amber-400 animate-ping' : 'bg-rose-500'}`} />
                  {entity.name}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isOperational ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {isOperational ? 'OPERATIONAL' : 'DECAYED / BLOCKED'}
                </span>
              </div>

              <div className="text-xs text-amber-200/80 mb-2.5 font-mono">
                Current Status: <strong>{stateInfo.label}</strong>
              </div>

              {/* Local Era Selector for this entity */}
              <div className="flex gap-1.5 pt-2 border-t border-slate-800">
                {(['PAST', 'PRESENT', 'FUTURE'] as TimeEra[]).map((era) => {
                  const isSel = entity.currentEra === era;
                  return (
                    <button
                      key={era}
                      onClick={() => handleToggleEntityEra(entity.id, era)}
                      disabled={disabled || isSolved}
                      className={`flex-1 py-1 text-[10px] font-mono rounded border transition-all ${
                        isSel
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-amber-700'
                      }`}
                    >
                      {era}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-center text-xs text-slate-400 flex items-center gap-1">
        <Clock className="w-3 h-3 text-amber-400" /> Shift eras to reverse decay and bypass temporal barriers
      </div>
    </div>
  );
};
