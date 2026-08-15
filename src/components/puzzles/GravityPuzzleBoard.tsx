import React, { useState, useEffect } from 'react';
import { GravityBoardState, GravityDirection, GravityEntity, PuzzleDef } from '../../types';
import { soundEngine } from '../../audio/soundEngine';
import { Compass, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface GravityPuzzleBoardProps {
  puzzle: PuzzleDef;
  onSolve: (moves: number) => void;
  onMove: (state: any) => void;
  disabled?: boolean;
}

export const GravityPuzzleBoard: React.FC<GravityPuzzleBoardProps> = ({
  puzzle,
  onSolve,
  onMove,
  disabled = false,
}) => {
  const [boardState, setBoardState] = useState<GravityBoardState>(() => {
    return JSON.parse(JSON.stringify(puzzle.initialState));
  });
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  const width = boardState.width || 5;
  const height = boardState.height || 5;

  useEffect(() => {
    setBoardState(JSON.parse(JSON.stringify(puzzle.initialState)));
    setMoves(0);
    setIsSolved(false);
  }, [puzzle.id]);

  // Check victory condition: All movable cubes are on their respective pedestals
  const checkVictory = (entities: GravityEntity[]): boolean => {
    const cubes = entities.filter((e) => e.type === 'movable_cube');
    const pedestals = entities.filter((e) => e.type === 'target_pedestal');

    if (cubes.length === 0 || pedestals.length === 0) return false;

    // Check if every cube has a pedestal at the exact same (x, y) with matching color
    return cubes.every((cube) => {
      const match = pedestals.find(
        (p) => p.x === cube.x && p.y === cube.y && (!cube.color || !p.color || cube.color === p.color)
      );
      return Boolean(match);
    });
  };

  const handleShiftGravity = (direction: GravityDirection) => {
    if (disabled || isSolved) return;

    soundEngine.playGravityShift();

    const entities: GravityEntity[] = JSON.parse(JSON.stringify(boardState.entities));
    const walls = entities.filter((e) => e.type === 'static_wall');
    const cubes = entities.filter((e) => e.type === 'movable_cube');

    // Direction offsets
    let dx = 0;
    let dy = 0;
    if (direction === 'UP') dy = -1;
    if (direction === 'DOWN') dy = 1;
    if (direction === 'LEFT') dx = -1;
    if (direction === 'RIGHT') dx = 1;

    // Sort cubes based on movement direction to prevent jumping over each other
    cubes.sort((a, b) => {
      if (direction === 'UP') return a.y - b.y;
      if (direction === 'DOWN') return b.y - a.y;
      if (direction === 'LEFT') return a.x - b.x;
      if (direction === 'RIGHT') return b.x - a.x;
      return 0;
    });

    let movedAny = false;

    // Move each cube until collision
    cubes.forEach((cube) => {
      while (true) {
        const nextX = cube.x + dx;
        const nextY = cube.y + dy;

        // Boundary check
        if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) break;

        // Wall collision
        if (walls.some((w) => w.x === nextX && w.y === nextY)) break;

        // Other cube collision
        if (cubes.some((c) => c.id !== cube.id && c.x === nextX && c.y === nextY)) break;

        cube.x = nextX;
        cube.y = nextY;
        movedAny = true;
      }
    });

    // Reconstruct full entity list
    const updatedEntities = entities.map((e) => {
      const movedCube = cubes.find((c) => c.id === e.id);
      return movedCube || e;
    });

    const newMoves = moves + 1;
    setMoves(newMoves);
    setBoardState({
      ...boardState,
      currentGravity: direction,
      entities: updatedEntities,
    });

    onMove({ moves: newMoves, direction, entities: updatedEntities });

    const solved = checkVictory(updatedEntities);
    if (solved && !isSolved) {
      setIsSolved(true);
      setTimeout(() => {
        onSolve(newMoves);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 max-w-md w-full">
      <div className="flex items-center justify-between w-full mb-3 px-2 text-xs font-mono text-emerald-400">
        <span className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5" /> GRAVITATIONAL VECTOR: <strong className="text-white">{boardState.currentGravity}</strong>
        </span>
        <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          MOVES: <strong className="text-white">{moves}</strong> / {puzzle.targetMovesFor3Stars}
        </span>
      </div>

      {/* Grid Canvas */}
      <div
        className="grid gap-1.5 p-3 bg-slate-950/90 rounded-xl border border-emerald-900/40 w-full aspect-square relative"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: height }).map((_, y) =>
          Array.from({ length: width }).map((_, x) => {
            const wall = boardState.entities.find((e) => e.type === 'static_wall' && e.x === x && e.y === y);
            const pedestal = boardState.entities.find((e) => e.type === 'target_pedestal' && e.x === x && e.y === y);
            const cube = boardState.entities.find((e) => e.type === 'movable_cube' && e.x === x && e.y === y);
            const isMatch = cube && pedestal && (!cube.color || !pedestal.color || cube.color === pedestal.color);

            return (
              <div
                key={`${x}-${y}`}
                className={`relative rounded-lg flex items-center justify-center aspect-square transition-all duration-300 ${
                  wall
                    ? 'bg-slate-800 border-2 border-slate-700 shadow-inner'
                    : pedestal
                    ? 'bg-emerald-950/40 border-2 border-dashed border-emerald-400/80'
                    : 'bg-slate-900/40 border border-slate-800/60'
                }`}
              >
                {/* Pedestal Glyph */}
                {pedestal && !cube && (
                  <div
                    className="w-5 h-5 rounded-md border-2 border-dashed flex items-center justify-center opacity-70 animate-pulse"
                    style={{ borderColor: pedestal.color || '#10b981' }}
                  />
                )}

                {/* Movable Floating Monolith Cube */}
                {cube && (
                  <div
                    className={`w-4/5 h-4/5 rounded-lg flex items-center justify-center font-bold text-xs shadow-lg transition-transform duration-200 ${
                      isMatch
                        ? 'ring-4 ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-105'
                        : 'shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                    }`}
                    style={{ backgroundColor: cube.color || '#10b981', color: '#022c22' }}
                  >
                    {isMatch ? <CheckCircle2 className="w-4 h-4 text-emerald-950" /> : '◆'}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Directional Gravity Controller Pad */}
      <div className="mt-4 flex flex-col items-center gap-1">
        <button
          onClick={() => handleShiftGravity('UP')}
          disabled={disabled || isSolved}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-500 text-emerald-400 transition-all active:scale-90"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleShiftGravity('LEFT')}
            disabled={disabled || isSolved}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-500 text-emerald-400 transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-center text-xs font-mono text-emerald-300">
            GRAV
          </div>
          <button
            onClick={() => handleShiftGravity('RIGHT')}
            disabled={disabled || isSolved}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-500 text-emerald-400 transition-all active:scale-90"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => handleShiftGravity('DOWN')}
          disabled={disabled || isSolved}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-500 text-emerald-400 transition-all active:scale-90"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
