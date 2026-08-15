import { PuzzleDef, RegionDef } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { ECHO_AMBIENT_QUOTES, ECHO_PUZZLE_REACTIONS } from '../data/echoDialogue';

export interface EchoRequestOptions {
  prompt?: string;
  hintLevel?: 1 | 2 | 3 | 4;
  currentRegion: RegionDef;
  currentPuzzle: PuzzleDef;
  puzzleState?: any;
  restorationPercentage: number;
  discoveredMemoriesCount: number;
  echoMemoryLevel: number;
}

export interface EchoResponse {
  reply: string;
  source: 'gemini' | 'local_matrix';
  mood?: 'curious' | 'reminiscing' | 'alarmed' | 'harmonious' | 'profound';
}

class EchoService {
  /**
   * Request guidance or lore from ECHO via Gemini API with guaranteed offline fallback
   */
  public async queryEcho(options: EchoRequestOptions): Promise<EchoResponse> {
    soundEngine.playEchoChime();

    try {
      const res = await fetch('/api/echo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: options.prompt,
          hintLevel: options.hintLevel,
          currentRegion: {
            name: options.currentRegion.name,
            law: options.currentRegion.law,
          },
          currentPuzzle: {
            title: options.currentPuzzle.title,
            systemName: options.currentPuzzle.systemName,
            objective: options.currentPuzzle.objective,
          },
          puzzleState: options.puzzleState,
          restorationPercentage: options.restorationPercentage,
          discoveredMemoriesCount: options.discoveredMemoriesCount,
          echoMemoryLevel: options.echoMemoryLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.reply) {
          return {
            reply: data.reply,
            source: 'gemini',
            mood: 'harmonious',
          };
        }
      }
    } catch (e) {
      console.log('Using local ECHO neural fallback:', e);
    }

    // High quality offline fallback
    return this.getLocalFallback(options);
  }

  private getLocalFallback(options: EchoRequestOptions): EchoResponse {
    const { hintLevel, currentPuzzle, currentRegion } = options;

    if (hintLevel) {
      const hints = currentPuzzle.hints;
      let reply = '';
      if (hintLevel === 1) reply = `«"Question: ${hints.level1}"»`;
      else if (hintLevel === 2) reply = `«"Relationship: ${hints.level2}"»`;
      else if (hintLevel === 3) reply = `«"Action: ${hints.level3}"»`;
      else reply = `«"Directive: ${hints.level4}"»`;

      return {
        reply,
        source: 'local_matrix',
        mood: 'curious',
      };
    }

    // Ambient or lore query fallback
    const reactions = ECHO_PUZZLE_REACTIONS[currentRegion.law] || ECHO_AMBIENT_QUOTES;
    const randomQuote = reactions[Math.floor(Math.random() * reactions.length)];

    return {
      reply: randomQuote,
      source: 'local_matrix',
      mood: 'reminiscing',
    };
  }

  public getSolvedCelebration(law: string): string {
    const pool = (ECHO_PUZZLE_REACTIONS as any)[law] || ECHO_AMBIENT_QUOTES;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

export const echoService = new EchoService();
