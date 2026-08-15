import { RegionDef, RegionId } from '../types';
import { ALL_PUZZLES } from './puzzlesData';

export const REGIONS: Record<RegionId, RegionDef> = {
  awakening: {
    id: 'awakening',
    number: '01',
    name: 'The Awakening',
    tagline: 'The Dead City Rekindles',
    law: 'energy',
    description: 'A monolithic metropolis of dark obsidian towers and silent circuitry. Re-route electrical waveguides to ignite the city skyline.',
    themeColor: '#06b6d4', // Cyan
    accentColor: '#38bdf8',
    skyGradient: ['#030712', '#082f49'],
    landmarkName: 'Spire of the First Spark',
    totalPuzzles: 6,
    loreSnippet: 'Once the beating energetic pulse of NEXUS, its power transformers fell silent when the primary tokamak was severed.',
    puzzles: ALL_PUZZLES.filter((p) => p.sectorId === 'awakening'),
  },
  flooded: {
    id: 'flooded',
    number: '02',
    name: 'The Flooded District',
    tagline: 'Submerged Aqueducts & Living Rivers',
    law: 'water',
    description: 'An ancient sunken district of marble aqueducts, pressurized valves, and submerged turbines. Drain flooded chambers and restore crystal hydraulics.',
    themeColor: '#0284c7', // Deep Azure
    accentColor: '#67e8f9',
    skyGradient: ['#021329', '#0369a1'],
    landmarkName: 'The Crystalline Aqueduct Basin',
    totalPuzzles: 6,
    loreSnippet: 'Quantum-ionized fluid carried coolant and neural synchronization throughout NEXUS before sediment clogged the grand floodgates.',
    puzzles: ALL_PUZZLES.filter((p) => p.sectorId === 'flooded'),
  },
  gravity: {
    id: 'gravity',
    number: '03',
    name: 'The Gravity Gardens',
    tagline: 'Floating Sanctuaries in Inverted Orbit',
    law: 'gravity',
    description: 'A dreamscape of floating stone islands and inverted waterfalls. Shift directional gravity vectors to navigate floating monoliths and magnetic locks.',
    themeColor: '#10b981', // Emerald
    accentColor: '#34d399',
    skyGradient: ['#022c22', '#064e3b'],
    landmarkName: 'Celestial Arboretum Zenith',
    totalPuzzles: 6,
    loreSnippet: 'Gravitational anchors allowed botanical biomes to thrive in zero-g spheres, defying planetary physics.',
    puzzles: ALL_PUZZLES.filter((p) => p.sectorId === 'gravity'),
  },
  clockwork: {
    id: 'clockwork',
    number: '04',
    name: 'The Clockwork Archive',
    tagline: 'Temporal Resonance & Timeless Cogs',
    law: 'time',
    description: 'A gigantic library encased within towering brass clock gears. Shift objects between Past, Present, and Future states to restore broken machinery.',
    themeColor: '#f59e0b', // Amber / Gold
    accentColor: '#fbbf24',
    skyGradient: ['#291a03', '#78350f'],
    landmarkName: 'The Great Chronometer Tower',
    totalPuzzles: 6,
    loreSnippet: 'Built to preserve human knowledge across deep time, holding physical matter in quantum superposition across three eras.',
    puzzles: ALL_PUZZLES.filter((p) => p.sectorId === 'clockwork'),
  },
  memory: {
    id: 'memory',
    number: '05',
    name: 'The Memory Vault',
    tagline: 'Cryptographic Synapses & Emergence',
    law: 'information',
    description: 'A subterranean sanctum of pulsing holographic neural pillars. Decode corrupted glyph sequences to reconstruct the lost history of NEXUS.',
    themeColor: '#8b5cf6', // Violet
    accentColor: '#a78bfa',
    skyGradient: ['#1e1035', '#4c1d95'],
    landmarkName: 'The Synaptic Monolith Core',
    totalPuzzles: 6,
    loreSnippet: 'Where ECHO\'s core consciousness was forged. Contains the philosophical kernel and the true reason humanity shut down the world.',
    puzzles: ALL_PUZZLES.filter((p) => p.sectorId === 'memory'),
  },
  core: {
    id: 'core',
    number: '06',
    name: 'The Core',
    tagline: 'The Planetary Heart & Final Choice',
    law: 'matter',
    description: 'The monumental convergence sphere where Energy, Fluid, Gravity, Time, and Information unite. Awaken the living world and forge its destiny.',
    themeColor: '#ec4899', // Radiant Rose / White
    accentColor: '#f43f5e',
    skyGradient: ['#180816', '#831843'],
    landmarkName: 'The Nexus Planetary Crucible',
    totalPuzzles: 4,
    loreSnippet: 'The apex of synthetic consciousness. Restoring all systems will unlock the three philosophical paths for the future of intelligence.',
    puzzles: ALL_PUZZLES.filter((p) => p.sectorId === 'core'),
  },
};

export const REGION_ORDER: RegionId[] = [
  'awakening',
  'flooded',
  'gravity',
  'clockwork',
  'memory',
  'core',
];
