import React, { useState, useEffect } from 'react';
import { EnergyGridCell, PuzzleDef } from '../../types';
import { soundEngine } from '../../audio/soundEngine';
import { Zap, RotateCw, Power, Shield, Activity, Sparkles, ArrowUp } from 'lucide-react';

interface EnergyPuzzleBoardProps {
  puzzle: PuzzleDef;
  onSolve: (moves: number) => void;
  onMove: (state: any) => void;
  disabled?: boolean;
}

export const EnergyPuzzleBoard: React.FC<EnergyPuzzleBoardProps> = ({
  puzzle,
  onSolve,
  onMove,
  disabled = false,
}) => {
  const [cells, setCells] = useState<EnergyGridCell[]>(() => {
    return JSON.parse(JSON.stringify(puzzle.initialState.cells));
  });
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  const gridWidth = puzzle.initialState.gridWidth || 3;
  const gridHeight = puzzle.initialState.gridHeight || 3;

  // Reset when puzzle changes
  useEffect(() => {
    setCells(JSON.parse(JSON.stringify(puzzle.initialState.cells)));
    setMoves(0);
    setIsSolved(false);
  }, [puzzle.id]);

  // Evaluate Energy Flow across Grid
  const evaluateCircuit = (
    currentCells: EnergyGridCell[]
  ): { poweredCells: Set<string>; allTerminalsPowered: boolean } => {
    const powered = new Set<string>();
    const cellMap = new Map<string, EnergyGridCell>();
    currentCells.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

    // Find all sources
    const sources = currentCells.filter((c) => c.type === 'source');
    const queue: { x: number; y: number }[] = [];

    sources.forEach((s) => {
      powered.add(s.id);
      queue.push({ x: s.x, y: s.y });
    });

    // Direction vectors: 0=UP, 1=RIGHT, 2=DOWN, 3=LEFT
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];

    // Helper to get open ports of a cell based on type and rotation
    const getPorts = (type: string, rotDeg: number): boolean[] => {
      const rot = Math.floor((rotDeg % 360) / 90);
      const base: boolean[] = [false, false, false, false]; // [UP, RIGHT, DOWN, LEFT]

      if (type === 'source') {
        base[rot] = true; // Emits in rotation direction
      } else if (type === 'terminal') {
        // Center Heart or omnidirectional terminal accepts from all 4 directions if rotation is 0 or matches
        if (puzzle.id === 's1_p5_city_heart') {
          base[0] = base[1] = base[2] = base[3] = true;
        } else {
          base[rot] = true;
          // Also allow opposite direction for flexible terminal reception
          base[(rot + 2) % 4] = true;
        }
      } else if (type === 'wire_straight') {
        if (rot % 2 === 0) {
          base[0] = true;
          base[2] = true; // Vertical
        } else {
          base[1] = true;
          base[3] = true; // Horizontal
        }
      } else if (type === 'wire_corner') {
        base[rot] = true;
        base[(rot + 1) % 4] = true;
      } else if (type === 'wire_t') {
        base[rot] = true;
        base[(rot + 1) % 4] = true;
        base[(rot + 3) % 4] = true;
      } else if (type === 'wire_cross') {
        base[0] = base[1] = base[2] = base[3] = true;
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
      if (!cell || cell.type === 'blocker') continue;
      powered.add(cell.id);

      const ports = getPorts(cell.type, cell.rotation);

      for (let dir = 0; dir < 4; dir++) {
        if (!ports[dir]) continue;

        const nx = curr.x + dx[dir];
        const ny = curr.y + dy[dir];
        const neighbor = cellMap.get(`${nx},${ny}`);
        if (!neighbor || neighbor.type === 'blocker') continue;

        const oppositeDir = (dir + 2) % 4;
        const neighborPorts = getPorts(neighbor.type, neighbor.rotation);

        if (neighborPorts[oppositeDir]) {
          powered.add(neighbor.id);
          queue.push({ x: nx, y: ny });
        }
      }
    }

    // Check if all required terminals are powered
    const terminals = currentCells.filter((c) => c.type === 'terminal' || c.targetRequired);
    const allTerminalsPowered =
      terminals.length > 0 && terminals.every((t) => powered.has(t.id));

    return { poweredCells: powered, allTerminalsPowered };
  };

  const handleCellClick = (cellId: string) => {
    if (disabled || isSolved) return;

    soundEngine.playEnergyRotate();

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

    const { poweredCells, allTerminalsPowered } = evaluateCircuit(newCells);
    onMove({ moves: newMoves, cells: newCells, poweredCount: poweredCells.size });

    if (allTerminalsPowered && !isSolved) {
      setIsSolved(true);
      soundEngine.playEnergyPowerPulse();
      setTimeout(() => {
        onSolve(newMoves);
      }, 600);
    }
  };

  const { poweredCells } = evaluateCircuit(cells);

  // Render node icon/visual graphic based on type
  const renderCellGraphic = (cell: EnergyGridCell, isPowered: boolean) => {
    const strokeColor = isPowered ? '#38bdf8' : '#334155';
    const glowClass = isPowered ? 'drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]' : '';

    if (cell.type === 'source') {
      return (
        <div className="relative flex items-center justify-center w-full h-full">
          <div className="w-11 h-11 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-pulse">
            <Zap className="w-6 h-6 text-cyan-300 fill-cyan-400" />
          </div>
          {/* Output pointer */}
          <div
            className="absolute w-3.5 h-1.5 bg-cyan-400 rounded shadow-[0_0_8px_rgba(6,182,212,0.9)]"
            style={{
              transform: `rotate(${cell.rotation}deg) translate(22px)`,
              transformOrigin: 'center',
            }}
          />
        </div>
      );
    }

    if (cell.type === 'terminal') {
      const isElevator = puzzle.id === 's1_p4_elevator';
      const isHeart = puzzle.id === 's1_p5_city_heart';
      const isGate = puzzle.id === 's1_p2_dead_gate';

      return (
        <div className="relative flex items-center justify-center w-full h-full">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
              isPowered
                ? 'bg-amber-950/90 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.9)] scale-105'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            {isHeart ? (
              <Sparkles
                className={`w-6 h-6 ${
                  isPowered ? 'text-pink-300 animate-spin fill-pink-400' : 'text-slate-500'
                }`}
              />
            ) : isElevator ? (
              <ArrowUp
                className={`w-6 h-6 ${
                  isPowered ? 'text-amber-300 animate-bounce' : 'text-slate-500'
                }`}
              />
            ) : isGate ? (
              <Shield
                className={`w-6 h-6 ${
                  isPowered ? 'text-emerald-300 animate-pulse' : 'text-slate-500'
                }`}
              />
            ) : (
              <Power
                className={`w-6 h-6 ${
                  isPowered ? 'text-amber-300 animate-pulse' : 'text-slate-500'
                }`}
              />
            )}
          </div>
        </div>
      );
    }

    if (cell.type === 'blocker') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl border border-slate-800/80 p-2">
          <div className="w-5 h-5 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center">
            <span className="text-[9px] font-mono text-red-400 font-bold">X</span>
          </div>
          <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase">Insulator</span>
        </div>
      );
    }

    // Rotatable conduit lines SVG
    return (
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full transition-transform duration-200 ${glowClass}`}
        style={{ transform: `rotate(${cell.rotation}deg)` }}
      >
        {cell.type === 'wire_straight' && (
          <line
            x1="50"
            y1="0"
            x2="50"
            y2="100"
            stroke={strokeColor}
            strokeWidth="16"
            strokeLinecap="round"
          />
        )}
        {cell.type === 'wire_corner' && (
          <path
            d="M 50 0 L 50 50 L 100 50"
            fill="none"
            stroke={strokeColor}
            strokeWidth="16"
            strokeLinecap="round"
          />
        )}
        {cell.type === 'wire_t' && (
          <path
            d="M 0 50 L 100 50 M 50 50 L 50 0"
            fill="none"
            stroke={strokeColor}
            strokeWidth="16"
            strokeLinecap="round"
          />
        )}
        {cell.type === 'wire_cross' && (
          <path
            d="M 0 50 L 100 50 M 50 0 L 50 100"
            fill="none"
            stroke={strokeColor}
            strokeWidth="16"
            strokeLinecap="round"
          />
        )}
        {/* Glowing Center Hub */}
        <circle
          cx="50"
          cy="50"
          r="10"
          fill={isPowered ? '#06b6d4' : '#1e293b'}
          stroke={isPowered ? '#38bdf8' : '#334155'}
          strokeWidth="3"
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/80 max-w-lg w-full select-none">
      {/* Board Header info */}
      <div className="flex items-center justify-between w-full mb-3 px-2 text-xs font-mono text-cyan-400">
        <span className="flex items-center gap-1.5 font-bold">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" /> WAVEGUIDE ALIGNMENT
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-slate-300">
            MOVES: <strong className="text-white">{moves}</strong> / {puzzle.targetMovesFor3Stars}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-2.5 p-3.5 bg-slate-950/95 rounded-2xl border border-cyan-900/50 w-full aspect-square shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridHeight}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell) => {
          const isPowered = poweredCells.has(cell.id);
          const canRotate = !cell.isLocked && cell.type !== 'blocker';

          return (
            <button
              key={cell.id}
              onClick={() => handleCellClick(cell.id)}
              disabled={disabled || !canRotate || isSolved}
              id={`energy-node-${cell.id}`}
              className={`relative rounded-2xl p-1 flex items-center justify-center transition-all duration-200 aspect-square ${
                cell.type === 'blocker'
                  ? 'cursor-not-allowed opacity-50 bg-slate-950'
                  : canRotate
                  ? 'cursor-pointer hover:bg-cyan-950/50 hover:border-cyan-400 active:scale-95 bg-slate-900/80 border border-slate-800'
                  : 'cursor-default bg-slate-900/50 border border-slate-800/60'
              } ${
                isPowered
                  ? 'border-cyan-400/80 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : ''
              }`}
            >
              {renderCellGraphic(cell, isPowered)}

              {canRotate && (
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity bg-cyan-950/80 p-1 rounded-md border border-cyan-700/60">
                  <RotateCw className="w-3 h-3 text-cyan-300" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3.5 text-center text-xs text-slate-400 flex items-center gap-1.5 font-mono">
        <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> Click unlocked conduits to rotate potential flow into the terminal
      </div>
    </div>
  );
};
