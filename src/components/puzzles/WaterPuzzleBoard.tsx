import React, { useState, useEffect } from 'react';
import { WaterGridCell, PuzzleDef } from '../../types';
import { soundEngine } from '../../audio/soundEngine';
import { Droplet, RotateCw, Gauge } from 'lucide-react';

interface WaterPuzzleBoardProps {
  puzzle: PuzzleDef;
  onSolve: (moves: number) => void;
  onMove: (state: any) => void;
  disabled?: boolean;
}

export const WaterPuzzleBoard: React.FC<WaterPuzzleBoardProps> = ({
  puzzle,
  onSolve,
  onMove,
  disabled = false,
}) => {
  const [cells, setCells] = useState<WaterGridCell[]>(() => {
    return JSON.parse(JSON.stringify(puzzle.initialState.cells));
  });
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  const gridWidth = puzzle.initialState.gridWidth || 3;
  const gridHeight = puzzle.initialState.gridHeight || 3;

  useEffect(() => {
    setCells(JSON.parse(JSON.stringify(puzzle.initialState.cells)));
    setMoves(0);
    setIsSolved(false);
  }, [puzzle.id]);

  // Evaluate Fluid Simulation across Pipes
  const evaluateWaterFlow = (currentCells: WaterGridCell[]): { filledCells: Set<string>; allTurbinesPowered: boolean } => {
    const filled = new Set<string>();
    const cellMap = new Map<string, WaterGridCell>();
    currentCells.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

    const sources = currentCells.filter((c) => c.type === 'pump_source');
    const queue: { x: number; y: number }[] = [];

    sources.forEach((s) => {
      filled.add(s.id);
      queue.push({ x: s.x, y: s.y });
    });

    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];

    const getPorts = (type: string, rotDeg: number): boolean[] => {
      const rot = Math.floor((rotDeg % 360) / 90);
      const base: boolean[] = [false, false, false, false];

      if (type === 'pump_source') {
        base[rot] = true;
      } else if (type === 'turbine_target') {
        base[rot] = true;
      } else if (type === 'pipe_straight') {
        if (rot % 2 === 0) {
          base[0] = true;
          base[2] = true;
        } else {
          base[1] = true;
          base[3] = true;
        }
      } else if (type === 'pipe_corner') {
        base[rot] = true;
        base[(rot + 1) % 4] = true;
      } else if (type === 'pipe_t') {
        base[rot] = true;
        base[(rot + 1) % 4] = true;
        base[(rot + 3) % 4] = true;
      }
      return base;
    };

    const visited = new Set<string>();

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const key = `${curr.x},${curr.y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const cell = cellMap.get(key);
      if (!cell) continue;
      filled.add(cell.id);

      const ports = getPorts(cell.type, cell.rotation);

      for (let dir = 0; dir < 4; dir++) {
        if (!ports[dir]) continue;

        const nx = curr.x + dx[dir];
        const ny = curr.y + dy[dir];
        const neighbor = cellMap.get(`${nx},${ny}`);
        if (!neighbor) continue;

        const oppositeDir = (dir + 2) % 4;
        const neighborPorts = getPorts(neighbor.type, neighbor.rotation);

        if (neighborPorts[oppositeDir]) {
          filled.add(neighbor.id);
          queue.push({ x: nx, y: ny });
        }
      }
    }

    const targets = currentCells.filter((c) => c.type === 'turbine_target');
    const allTurbinesPowered =
      targets.length > 0 && targets.every((t) => filled.has(t.id));

    return { filledCells: filled, allTurbinesPowered };
  };

  const handleCellClick = (cellId: string) => {
    if (disabled || isSolved) return;

    soundEngine.playValveTurn();

    const newCells = cells.map((cell) => {
      if (cell.id === cellId && !cell.isLocked) {
        return {
          ...cell,
          rotation: (cell.rotation + 90) % 360,
        };
      }
      return cell;
    });

    const newMoves = moves + 1;
    setMoves(newMoves);
    setCells(newCells);

    const { filledCells, allTurbinesPowered } = evaluateWaterFlow(newCells);
    onMove({ moves: newMoves, cells: newCells, filledCount: filledCells.size });

    if (allTurbinesPowered && !isSolved) {
      setIsSolved(true);
      soundEngine.playWaterFlow();
      setTimeout(() => {
        onSolve(newMoves);
      }, 600);
    }
  };

  const { filledCells } = evaluateWaterFlow(cells);

  const renderWaterGraphic = (cell: WaterGridCell, isFilled: boolean) => {
    const pipeColor = isFilled ? '#0284c7' : '#334155';
    const waterColor = isFilled ? '#38bdf8' : 'transparent';

    if (cell.type === 'pump_source') {
      return (
        <div className="relative flex items-center justify-center w-full h-full">
          <div className="w-10 h-10 rounded-full bg-blue-950 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(2,132,199,0.7)] animate-pulse">
            <Droplet className="w-5 h-5 text-sky-300 fill-sky-400" />
          </div>
        </div>
      );
    }

    if (cell.type === 'turbine_target') {
      return (
        <div className="relative flex items-center justify-center w-full h-full">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-300 ${
              isFilled
                ? 'bg-sky-950 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)] scale-105'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            <Gauge className={`w-5 h-5 ${isFilled ? 'text-sky-300 animate-spin' : 'text-slate-500'}`} />
          </div>
        </div>
      );
    }

    return (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full transition-transform duration-200"
        style={{ transform: `rotate(${cell.rotation}deg)` }}
      >
        {/* Outer Pipe */}
        {cell.type === 'pipe_straight' && (
          <>
            <line x1="50" y1="0" x2="50" y2="100" stroke={pipeColor} strokeWidth="18" strokeLinecap="square" />
            {isFilled && <line x1="50" y1="0" x2="50" y2="100" stroke={waterColor} strokeWidth="8" />}
          </>
        )}
        {cell.type === 'pipe_corner' && (
          <>
            <path d="M 50 0 L 50 50 L 100 50" fill="none" stroke={pipeColor} strokeWidth="18" strokeLinecap="square" />
            {isFilled && <path d="M 50 0 L 50 50 L 100 50" fill="none" stroke={waterColor} strokeWidth="8" />}
          </>
        )}
        {cell.type === 'pipe_t' && (
          <>
            <path d="M 0 50 L 100 50 M 50 50 L 50 0" fill="none" stroke={pipeColor} strokeWidth="18" strokeLinecap="square" />
            {isFilled && <path d="M 0 50 L 100 50 M 50 50 L 50 0" fill="none" stroke={waterColor} strokeWidth="8" />}
          </>
        )}
        <circle cx="50" cy="50" r="10" fill={isFilled ? '#0284c7' : '#1e293b'} stroke="#0f172a" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-sky-500/30 shadow-2xl shadow-sky-950/50 max-w-md w-full">
      <div className="flex items-center justify-between w-full mb-3 px-2 text-xs font-mono text-sky-400">
        <span className="flex items-center gap-1">
          <Droplet className="w-3.5 h-3.5" /> HYDRAULIC PRESSURE
        </span>
        <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          MOVES: <strong className="text-white">{moves}</strong> / {puzzle.targetMovesFor3Stars}
        </span>
      </div>

      <div
        className="grid gap-2 p-3 bg-slate-950/90 rounded-xl border border-sky-900/40 w-full aspect-square"
        style={{
          gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridHeight}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell) => {
          const isFilled = filledCells.has(cell.id);
          const canRotate = !cell.isLocked;

          return (
            <button
              key={cell.id}
              onClick={() => handleCellClick(cell.id)}
              disabled={disabled || !canRotate || isSolved}
              id={`water-node-${cell.id}`}
              className={`relative rounded-xl p-1 flex items-center justify-center transition-all duration-200 aspect-square ${
                canRotate
                  ? 'cursor-pointer hover:bg-sky-950/40 hover:border-sky-500/50 active:scale-95 bg-slate-900/70 border border-slate-800'
                  : 'cursor-default bg-slate-900/40 border border-slate-800/50'
              } ${isFilled ? 'border-sky-500/50 bg-sky-950/20' : ''}`}
            >
              {renderWaterGraphic(cell, isFilled)}

              {canRotate && (
                <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                  <RotateCw className="w-3 h-3 text-sky-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-center text-xs text-slate-400 flex items-center gap-1">
        <RotateCw className="w-3 h-3 text-sky-400" /> Turn pipe joints to direct pressurized water into turbines
      </div>
    </div>
  );
};
