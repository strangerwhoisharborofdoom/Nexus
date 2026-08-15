import React, { useState } from 'react';
import { GameSaveState, RegionId } from '../../types';
import { REGIONS, REGION_ORDER } from '../../data/regionsData';
import { MEMORIES } from '../../data/memoriesData';
import { soundEngine } from '../../audio/soundEngine';
import {
  Star,
  CheckCircle2,
  Lock,
  Zap,
  Droplet,
  Compass,
  Clock,
  Brain,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Radio,
  BookOpen,
  Info,
  Layers,
  Activity,
  X,
  Play,
} from 'lucide-react';

interface WorldMapUIProps {
  gameState: GameSaveState;
  onSelectRegion: (regionId: RegionId) => void;
  onSelectPuzzle: (puzzleId: string) => void;
  currentRegionId: RegionId;
}

export const WorldMapUI: React.FC<WorldMapUIProps> = ({
  gameState,
  onSelectRegion,
  onSelectPuzzle,
  currentRegionId,
}) => {
  const [selectedLockedRegion, setSelectedLockedRegion] = useState<RegionId | null>(null);

  const currentRegion = REGIONS[currentRegionId];

  const getLawIcon = (law: string, className = 'w-4 h-4') => {
    switch (law) {
      case 'energy':
        return <Zap className={`${className} text-cyan-400`} />;
      case 'water':
        return <Droplet className={`${className} text-sky-400`} />;
      case 'gravity':
        return <Compass className={`${className} text-emerald-400`} />;
      case 'time':
        return <Clock className={`${className} text-amber-400`} />;
      case 'information':
        return <Brain className={`${className} text-purple-400`} />;
      case 'matter':
        return <Sparkles className={`${className} text-pink-400`} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const calculateTotalStars = () => {
    return Object.values(gameState.completedPuzzles).reduce(
      (acc: number, p: any) => acc + (p?.stars || 0),
      0
    );
  };

  const globalRestoration = Math.round(
    (Object.values(gameState.regionRestoration) as number[]).reduce((a, b) => a + b, 0) / 6
  );

  // Region unlock calculation logic
  const isRegionUnlocked = (regId: RegionId, idx: number): boolean => {
    if (idx === 0) return true; // Sector 1 is always unlocked
    const prevRegId = REGION_ORDER[idx - 1];
    const prevRestoration = gameState.regionRestoration[prevRegId] || 0;
    const currentRestoration = gameState.regionRestoration[regId] || 0;
    return prevRestoration >= 35 || currentRestoration > 0;
  };

  // Get unlock requirement description for a locked sector
  const getUnlockRequirement = (idx: number): string => {
    if (idx === 0) return 'Accessible';
    const prevRegion = REGIONS[REGION_ORDER[idx - 1]];
    return `Requires ${prevRegion.name} (Sector ${prevRegion.number}) restored to 35%`;
  };

  // Count memories per region
  const getDiscoveredMemoriesInRegion = (regId: RegionId) => {
    const regionMems = MEMORIES.filter((m) => m.sectorId === regId);
    const discoveredCount = regionMems.filter((m) =>
      gameState.unlockedMemories.includes(m.id)
    ).length;
    return {
      discovered: discoveredCount,
      total: regionMems.length,
    };
  };

  // Count completed puzzles per region
  const getCompletedPuzzlesInRegion = (regId: RegionId) => {
    const reg = REGIONS[regId];
    const completedCount = reg.puzzles.filter(
      (p) => Boolean(gameState.completedPuzzles[p.id])
    ).length;
    return {
      completed: completedCount,
      total: reg.puzzles.length,
    };
  };

  return (
    <div className="relative z-20 w-full max-w-6xl flex flex-col gap-5 p-3 md:p-6 animate-fadeIn select-none">
      {/* Top Shiny Holographic Header Matrix */}
      <div className="relative overflow-hidden glass-panel-3d p-5 md:p-6 rounded-3xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/70">
        {/* Holographic Scanline Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40d_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40d_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-300 bg-cyan-950/90 px-3 py-1 rounded-full border border-cyan-700/80 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" /> PLANETARY TOPOLOGY MATRIX
              </span>
              <span className="text-[11px] font-mono text-slate-300 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5 shadow">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow" />
                <strong className="text-amber-300">{calculateTotalStars()}</strong> STARS
              </span>
              <span className="text-[11px] font-mono text-slate-300 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5 shadow">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <strong className="text-purple-300">{gameState.unlockedMemories.length}</strong> / {MEMORIES.length} LORE SHARDS
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center gap-2 drop-shadow-md">
              NEXUS Holographic Cartography
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Six monumental physical sectors govern the artificial biosphere. Reconnect conduits, valves, gravity wells, time cogs, and neural synapses to awaken the living world.
            </p>
          </div>

          {/* Global World Restoration Gauge */}
          <div className="w-full md:w-72 bg-slate-950/90 p-4 rounded-2xl border border-cyan-500/40 flex flex-col gap-2.5 shadow-2xl">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> GLOBAL HARMONY
              </span>
              <span className="text-base font-extrabold text-cyan-300 font-mono drop-shadow">
                {globalRestoration}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-pink-500 transition-all duration-700 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.9)]"
                style={{ width: `${globalRestoration}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>SECTORS ONLINE: {Object.values(gameState.regionRestoration).filter((v) => (v as number) >= 100).length} / 6</span>
              <span className={globalRestoration >= 100 ? 'text-emerald-400 font-bold' : 'text-cyan-400'}>
                {globalRestoration >= 100 ? 'TRANSCENDENCE READY' : 'STABILIZING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Six Sectors Shiny 3D Holographic Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-4">
        {REGION_ORDER.map((regId, idx) => {
          const reg = REGIONS[regId];
          const isSelected = regId === currentRegionId;
          const pct = gameState.regionRestoration[regId] || 0;
          const isUnlocked = isRegionUnlocked(regId, idx);
          const memStats = getDiscoveredMemoriesInRegion(regId);
          const puzzleStats = getCompletedPuzzlesInRegion(regId);
          const unlockReq = getUnlockRequirement(idx);

          if (!isUnlocked) {
            // ==========================================
            // LOCKED SECTOR CARD (Intriguing & Distinct)
            // ==========================================
            return (
              <div
                key={regId}
                onClick={() => {
                  soundEngine.playEnergyRotate();
                  setSelectedLockedRegion(regId);
                }}
                id={`sector-card-${regId}`}
                className="relative rounded-3xl p-5 border-2 border-dashed border-amber-500/40 bg-slate-950/85 backdrop-blur-md overflow-hidden cursor-pointer hover:border-amber-400/80 hover:bg-slate-900/90 transition-all duration-300 group shadow-lg hover:shadow-amber-950/40 flex flex-col justify-between min-h-[220px] game-btn-3d"
              >
                {/* Shimmering Quantum Barrier Forcefield Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#f59e0b18_0%,transparent_70%)] pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform" />

                {/* Card Top */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-700/60 shadow">
                        SECTOR {reg.number}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        [{reg.law} LAW]
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/80 animate-pulse shadow">
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                      <span>BARRIER ENGAGED</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-200 group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    {reg.name}
                  </h3>

                  {/* Encrypted Lore Glitch Snippet */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-amber-900/50 font-mono text-[11px] text-amber-200/70 leading-snug">
                    <p className="line-clamp-2">
                      <span className="text-amber-500 font-bold">◈ ENCRYPTED DATA: </span>
                      {reg.loreSnippet.substring(0, 45)}... [██████ SECURE LOG]
                    </p>
                  </div>
                </div>

                {/* Card Bottom */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-1.5">
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-300/90 font-semibold line-clamp-1">{unlockReq}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 group-hover:text-amber-300 transition-colors">
                    <span>Click to analyze barrier telemetry</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-amber-400" />
                  </div>
                </div>
              </div>
            );
          }

          // ==========================================
          // UNLOCKED ACTIVE SECTOR CARD
          // ==========================================
          return (
            <div
              key={regId}
              onClick={() => {
                soundEngine.playClick();
                onSelectRegion(regId);
              }}
              id={`sector-card-${regId}`}
              className={`relative rounded-3xl p-5 border backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[220px] group game-btn-3d ${
                isSelected
                  ? 'glass-panel-3d border-2 shadow-2xl scale-[1.02]'
                  : 'glass-card-shiny border-slate-800/80 hover:border-slate-600'
              }`}
              style={{
                borderColor: isSelected ? reg.themeColor : undefined,
                boxShadow: isSelected
                  ? `0 0 30px ${reg.themeColor}44, 0 15px 35px rgba(0,0,0,0.6)`
                  : undefined,
              }}
            >
              {/* Dynamic Theme Glow */}
              <div
                className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none"
                style={{ backgroundColor: reg.themeColor }}
              />

              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border shadow"
                      style={{
                        backgroundColor: `${reg.themeColor}22`,
                        color: reg.themeColor,
                        borderColor: `${reg.themeColor}66`,
                      }}
                    >
                      SECTOR {reg.number}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      [{reg.law} LAW]
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getLawIcon(reg.law)}
                    {pct >= 100 && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                    )}
                  </div>
                </div>

                <h3 className="text-base md:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors drop-shadow">
                  {reg.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {reg.tagline}
                </p>
              </div>

              {/* Card Middle: Memory & Puzzle completion stats */}
              <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono shadow-inner">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">PUZZLES</span>
                  <span className="font-bold text-white">
                    {puzzleStats.completed} / {puzzleStats.total} Solved
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">LORE SHARDS</span>
                  <span className="font-bold text-purple-300">
                    {memStats.discovered} / {memStats.total} Found
                  </span>
                </div>
              </div>

              {/* Card Bottom: Progress Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Sector Restoration</span>
                  <span className="font-bold" style={{ color: reg.themeColor }}>
                    {pct}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: reg.themeColor,
                      boxShadow: `0 0 12px ${reg.themeColor}`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Selected Sector Deep-Dive & Puzzle Node Grid */}
      <div className="glass-panel-3d p-5 md:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col gap-5">
        {/* Sector Detail Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs font-bold font-mono px-3 py-1 rounded-full uppercase border shadow"
                style={{
                  backgroundColor: `${currentRegion.themeColor}22`,
                  color: currentRegion.themeColor,
                  borderColor: `${currentRegion.themeColor}55`,
                }}
              >
                Sector {currentRegion.number} • {currentRegion.tagline}
              </span>
              <span className="text-xs font-mono text-slate-400">
                [{currentRegion.law.toUpperCase()} LAW]
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white drop-shadow">
              {currentRegion.name}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              {currentRegion.description}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 shadow-lg">
            <span className="text-[10px] font-mono text-slate-400">DISTRICT LANDMARK</span>
            <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5 mt-1">
              <CheckCircle2
                className={`w-4 h-4 ${
                  gameState.regionRestoration[currentRegionId] >= 100
                    ? 'text-emerald-400 fill-emerald-950'
                    : 'text-slate-600'
                }`}
              />
              {currentRegion.landmarkName}
            </span>
          </div>
        </div>

        {/* Puzzle Nodes in This Sector */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
            <span>SECTOR 0{currentRegion.number} INTERCONNECTED NODES ({currentRegion.puzzles.length})</span>
            <span>Click any unlocked node to enter puzzle chamber</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {currentRegion.puzzles.map((puzzle, pIdx) => {
              const completed = gameState.completedPuzzles[puzzle.id];
              const isSolved = Boolean(completed);
              const stars = completed?.stars || 0;
              // Unlock rule: first puzzle unlocked; subsequent unlocked if previous puzzle solved
              const isUnlocked =
                pIdx === 0 ||
                Boolean(gameState.completedPuzzles[currentRegion.puzzles[pIdx - 1]?.id]);

              return (
                <button
                  key={puzzle.id}
                  onClick={() => {
                    if (isUnlocked) {
                      soundEngine.playClick();
                      onSelectPuzzle(puzzle.id);
                    }
                  }}
                  disabled={!isUnlocked}
                  id={`puzzle-node-${puzzle.id}`}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group relative game-btn-3d ${
                    isSolved
                      ? 'glass-card-shiny border-cyan-500/50 hover:border-cyan-400 hover:scale-[1.02]'
                      : isUnlocked
                      ? 'bg-slate-900/80 border-slate-700 hover:border-cyan-500/60 hover:bg-slate-800/90 hover:scale-[1.02]'
                      : 'bg-slate-950/40 border-slate-900 opacity-45 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        NODE 0{puzzle.order}
                      </span>
                      {isSolved ? (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= stars ? 'text-amber-400 fill-amber-400 drop-shadow' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      ) : isUnlocked ? (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                          READY
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {puzzle.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {puzzle.objective}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 group-hover:text-cyan-300">
                    <span className="truncate pr-1">{puzzle.systemName}</span>
                    <Play className="w-3 h-3 shrink-0 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Locked Region Analysis Modal */}
      {selectedLockedRegion && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel-3d border-2 border-amber-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl shadow-amber-950/80 flex flex-col gap-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-400 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                    SECTOR QUANTUM CONTAINMENT
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {REGIONS[selectedLockedRegion].name} (Sector {REGIONS[selectedLockedRegion].number})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedLockedRegion(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-900/50 space-y-1.5 shadow-inner">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Barrier Decryption Condition
                </div>
                <p className="text-white font-mono">
                  {getUnlockRequirement(REGION_ORDER.indexOf(selectedLockedRegion))}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> ECHO Environmental Analysis
                </div>
                <p className="text-cyan-100 italic leading-relaxed">
                  «"The harmonic barrier guarding Sector {REGIONS[selectedLockedRegion].number} remains polarized. When you restore the preceding sectors, the electromagnetic resonance will disengage the containment clamps."»
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLockedRegion(null)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-mono transition-all game-btn-3d shadow-lg"
              >
                ACKNOWLEDGE TELEMETRY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
