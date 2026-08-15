export type RegionId =
  | 'awakening'
  | 'flooded'
  | 'gravity'
  | 'clockwork'
  | 'memory'
  | 'core';

export type WorldLaw =
  | 'energy'
  | 'water'
  | 'gravity'
  | 'time'
  | 'matter'
  | 'information';

export type PuzzleCategory =
  | 'energy_flow'
  | 'water_routing'
  | 'gravity_shift'
  | 'time_reversion'
  | 'memory_decode'
  | 'core_convergence';

export interface EchoDialogueEntry {
  speaker: 'ECHO' | 'SYSTEM' | 'NEXUS';
  text: string;
  mood?: 'curious' | 'reminiscing' | 'alarmed' | 'harmonious' | 'profound';
}

export interface PuzzleHints {
  level1: string; // Question
  level2: string; // Relationship
  level3: string; // Action
  level4: string; // Explicit solution
}

export interface RestorationConsequence {
  title: string;
  description: string;
  visualEffect: 'lights_on' | 'water_flow' | 'gravity_invert' | 'clock_spin' | 'data_stream' | 'core_radiance';
  unlockedArea?: string;
  loreFragmentId?: string;
  unlockedMemoryId?: string;
  echoQuote: string;
}

// Node and Component definitions for Energy Puzzles
export type EnergyNodeType =
  | 'source'
  | 'terminal'
  | 'wire_straight'
  | 'wire_corner'
  | 'wire_t'
  | 'wire_cross'
  | 'switch'
  | 'inverter'
  | 'blocker';

export interface EnergyGridCell {
  id: string;
  x: number;
  y: number;
  type: EnergyNodeType;
  rotation: number; // 0, 90, 180, 270
  isLocked?: boolean;
  powerOutputDirection?: number; // 0=UP, 1=RIGHT, 2=DOWN, 3=LEFT
  targetRequired?: boolean;
}

// Water/Hydraulic Flow Definitions
export type WaterNodeType =
  | 'pump_source'
  | 'turbine_target'
  | 'pipe_straight'
  | 'pipe_corner'
  | 'pipe_t'
  | 'valve'
  | 'filter'
  | 'reservoir';

export interface WaterGridCell {
  id: string;
  x: number;
  y: number;
  type: WaterNodeType;
  rotation: number;
  isLocked?: boolean;
  pressure?: number;
  requiredPressure?: number;
}

// Directional Gravity Board Definitions
export type GravityDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ZERO';

export interface GravityEntity {
  id: string;
  x: number;
  y: number;
  type: 'movable_cube' | 'target_pedestal' | 'static_wall' | 'magnetic_barrier' | 'portal';
  color?: string;
  isActivated?: boolean;
}

export interface GravityBoardState {
  width: number;
  height: number;
  entities: GravityEntity[];
  currentGravity: GravityDirection;
}

// Temporal Time Era Definitions
export type TimeEra = 'PAST' | 'PRESENT' | 'FUTURE';

export interface TimeEraObjectState {
  label: string;
  passable: boolean;
  active: boolean;
  description: string;
}

export interface TimeEntity {
  id: string;
  name: string;
  currentEra: TimeEra;
  pastState: TimeEraObjectState;
  presentState: TimeEraObjectState;
  futureState: TimeEraObjectState;
}

export interface TimeBoardState {
  globalEra: TimeEra;
  entities: TimeEntity[];
}

// Synaptic Memory Decoding Definitions
export interface GlyphSymbol {
  id: string;
  symbol: string;
  frequency: number;
  meaning: string;
}

export interface MemoryBoardState {
  targetPattern: string[];
  currentInput: string[];
  glyphs: GlyphSymbol[];
  decryptedPercentage: number;
}

// Core Showcase Multi-System State
export interface CoreBoardState {
  energyActive: boolean;
  waterFlowing: boolean;
  gravityStabilized: boolean;
  timeSynchronized: boolean;
  dataStreamAligned: boolean;
  step: number;
  subPuzzlesSolved: string[];
}

export interface PuzzleDef {
  id: string;
  sectorId: RegionId;
  order: number;
  title: string;
  subtitle: string;
  systemName: string;
  worldLaw: WorldLaw;
  law?: WorldLaw; // Alias for worldLaw
  category: PuzzleCategory;
  objective: string;
  description: string;
  initialState: any;
  hints: PuzzleHints;
  consequence: RestorationConsequence;
  targetMovesFor3Stars: number;
  targetTimeSecFor3Stars?: number;
  timeLimitSec?: number;
  echoIntro: string;
}

export interface RegionDef {
  id: RegionId;
  number: string;
  name: string;
  tagline: string;
  law: WorldLaw;
  description: string;
  themeColor: string;
  accentColor: string;
  skyGradient: [string, string];
  puzzles: PuzzleDef[];
  landmarkName: string;
  totalPuzzles: number;
  loreSnippet: string;
}

export interface MemoryLog {
  id: string;
  sectorId: RegionId;
  title: string;
  chronicleDate: string;
  snippet: string;
  fullTranscription: string;
  audioKey?: string;
  echoCommentary: string;
  // Aliases for unified UI reading
  timestamp?: string;
  author?: string;
  content?: string;
  category?: string;
}

export interface CompletedPuzzleStats {
  stars: number;
  timeSec: number;
  moves: number;
  completedAt: number;
}

export interface GameSaveState {
  version: number;
  currentRegionId: RegionId;
  currentPuzzleId: string | null;
  completedPuzzles: Record<string, CompletedPuzzleStats>;
  regionRestoration: Record<RegionId, number>; // 0 - 100
  unlockedMemories: string[];
  echoMemoryLevel: number; // 1 - 10
  chosenEnding: 'restore' | 'free' | 'reset' | null;
  audioSettings: {
    soundMuted: boolean;
    musicMuted: boolean;
    masterVolume: number;
  };
  dailyProgress: {
    lastDate: string;
    completed: boolean;
    bestTimeSec: number;
  };
  hasSeenIntroCinematic: boolean;
}
