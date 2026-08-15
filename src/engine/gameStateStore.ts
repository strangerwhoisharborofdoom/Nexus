import { GameSaveState, RegionId } from '../types';
import { ALL_PUZZLES } from '../data/puzzlesData';
import { REGIONS, REGION_ORDER } from '../data/regionsData';
import { soundEngine } from '../audio/soundEngine';

const SAVE_KEY = 'NEXUS_CHRONICLE_SAVE_v1';

export const INITIAL_GAME_STATE: GameSaveState = {
  version: 1,
  currentRegionId: 'awakening',
  currentPuzzleId: 's1_p1_spark',
  completedPuzzles: {},
  regionRestoration: {
    awakening: 0,
    flooded: 0,
    gravity: 0,
    clockwork: 0,
    memory: 0,
    core: 0,
  },
  unlockedMemories: ['mem_01'],
  echoMemoryLevel: 1,
  chosenEnding: null,
  audioSettings: {
    soundMuted: false,
    musicMuted: false,
    masterVolume: 0.8,
  },
  dailyProgress: {
    lastDate: '',
    completed: false,
    bestTimeSec: 0,
  },
  hasSeenIntroCinematic: false,
};

export class GameStore {
  private state: GameSaveState;
  private listeners: Set<(state: GameSaveState) => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
    this.recalculateRestorations();
    soundEngine.updateWorldState(this.state.regionRestoration);
  }

  public getState(): GameSaveState {
    return this.state;
  }

  public subscribe(listener: (state: GameSaveState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l({ ...this.state }));
    soundEngine.updateWorldState(this.state.regionRestoration);
  }

  private loadFromStorage(): GameSaveState {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...INITIAL_GAME_STATE,
          ...parsed,
          audioSettings: { ...INITIAL_GAME_STATE.audioSettings, ...(parsed.audioSettings || {}) },
          dailyProgress: { ...INITIAL_GAME_STATE.dailyProgress, ...(parsed.dailyProgress || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to load save from localStorage:', e);
    }
    return { ...INITIAL_GAME_STATE };
  }

  private saveToStorage() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  private recalculateRestorations() {
    const restorations: Record<RegionId, number> = {
      awakening: 0,
      flooded: 0,
      gravity: 0,
      clockwork: 0,
      memory: 0,
      core: 0,
    };

    REGION_ORDER.forEach((regionId) => {
      const regionPuzzles = ALL_PUZZLES.filter((p) => p.sectorId === regionId);
      const total = regionPuzzles.length;
      if (total === 0) return;

      const solvedCount = regionPuzzles.filter((p) => Boolean(this.state.completedPuzzles[p.id])).length;
      restorations[regionId] = Math.round((solvedCount / total) * 100);
    });

    this.state.regionRestoration = restorations;

    // Calculate ECHO Memory Level (1 to 10)
    const totalSolved = Object.keys(this.state.completedPuzzles).length;
    this.state.echoMemoryLevel = Math.min(10, Math.max(1, Math.floor(totalSolved / 2.5) + 1));
  }

  public completePuzzle(puzzleId: string, stars: number, timeSec: number, moves: number, unlockedMemoryId?: string) {
    const existing = this.state.completedPuzzles[puzzleId];
    const bestStars = existing ? Math.max(existing.stars, stars) : stars;
    const bestTime = existing ? Math.min(existing.timeSec, timeSec) : timeSec;
    const bestMoves = existing ? Math.min(existing.moves, moves) : moves;

    this.state.completedPuzzles[puzzleId] = {
      stars: bestStars,
      timeSec: bestTime,
      moves: bestMoves,
      completedAt: Date.now(),
    };

    if (unlockedMemoryId && !this.state.unlockedMemories.includes(unlockedMemoryId)) {
      this.state.unlockedMemories.push(unlockedMemoryId);
    }

    this.recalculateRestorations();
    this.notify();
  }

  public setCurrentRegion(regionId: RegionId) {
    this.state.currentRegionId = regionId;
    const regionPuzzles = ALL_PUZZLES.filter((p) => p.sectorId === regionId);
    // Find first unsolved puzzle in that region, or the first puzzle
    const nextUnsolved = regionPuzzles.find((p) => !this.state.completedPuzzles[p.id]) || regionPuzzles[0];
    this.state.currentPuzzleId = nextUnsolved ? nextUnsolved.id : null;
    this.notify();
  }

  public setCurrentPuzzle(puzzleId: string | null) {
    this.state.currentPuzzleId = puzzleId;
    if (puzzleId) {
      const p = ALL_PUZZLES.find((item) => item.id === puzzleId);
      if (p) this.state.currentRegionId = p.sectorId;
    }
    this.notify();
  }

  public unlockMemory(memoryId: string) {
    if (!this.state.unlockedMemories.includes(memoryId)) {
      this.state.unlockedMemories.push(memoryId);
      this.notify();
    }
  }

  public chooseEnding(ending: 'restore' | 'free' | 'reset') {
    this.state.chosenEnding = ending;
    this.notify();
  }

  public markIntroSeen() {
    this.state.hasSeenIntroCinematic = true;
    this.notify();
  }

  public completeDaily(timeSec: number) {
    const today = new Date().toISOString().split('T')[0];
    this.state.dailyProgress = {
      lastDate: today,
      completed: true,
      bestTimeSec: this.state.dailyProgress.bestTimeSec
        ? Math.min(this.state.dailyProgress.bestTimeSec, timeSec)
        : timeSec,
    };
    this.notify();
  }

  public resetAll() {
    this.state = { ...INITIAL_GAME_STATE };
    this.saveToStorage();
    this.recalculateRestorations();
    this.notify();
  }

  public exportJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed.regionRestoration === 'object') {
        this.state = { ...INITIAL_GAME_STATE, ...parsed };
        this.recalculateRestorations();
        this.notify();
        return true;
      }
    } catch (e) {
      console.error('Import save failed:', e);
    }
    return false;
  }
}

export const gameStore = new GameStore();
