import React, { useState } from 'react';
import { GameSaveState } from '../../types';
import { REGIONS } from '../../data/regionsData';
import { ALL_PUZZLES } from '../../data/puzzlesData';
import { echoService } from '../../ai/echoService';
import { soundEngine } from '../../audio/soundEngine';
import { Sparkles, Send, MessageSquare, Bot, RefreshCw, X, Radio } from 'lucide-react';

interface EchoHologramUIProps {
  gameState: GameSaveState;
  onClose?: () => void;
}

export const EchoHologramUI: React.FC<EchoHologramUIProps> = ({ gameState, onClose }) => {
  const [promptInput, setPromptInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'player' | 'echo'; text: string }>>([
    {
      sender: 'echo',
      text: '«"Greetings, Traveler. I am ECHO. As you restore the physical laws to NEXUS, fragments of my past identity return to me. What would you like to ask?"»',
    },
  ]);

  const currentRegion = REGIONS[gameState.currentRegionId] || REGIONS.awakening;
  const currentPuzzle = ALL_PUZZLES.find((p) => p.id === gameState.currentPuzzleId) || currentRegion.puzzles[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isThinking) return;

    const userText = promptInput.trim();
    setPromptInput('');
    setChatHistory((prev) => [...prev, { sender: 'player', text: userText }]);
    setIsThinking(true);
    soundEngine.playClick();

    const response = await echoService.queryEcho({
      prompt: userText,
      currentRegion,
      currentPuzzle,
      restorationPercentage: Math.round(
        (Object.values(gameState.regionRestoration) as number[]).reduce((a, b) => a + b, 0) / 6
      ),
      discoveredMemoriesCount: gameState.unlockedMemories.length,
      echoMemoryLevel: gameState.echoMemoryLevel,
    });

    setChatHistory((prev) => [...prev, { sender: 'echo', text: response.reply }]);
    setIsThinking(false);
  };

  return (
    <div className="relative z-30 w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-3xl p-5 md:p-6 shadow-2xl shadow-cyan-950/80 flex flex-col gap-4 animate-fadeIn select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {/* Animated Holographic Core Avatar */}
          <div className="relative w-11 h-11 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            <div className="absolute inset-0 rounded-2xl border border-cyan-300 animate-ping opacity-25" />
            <Bot className="w-6 h-6 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-mono tracking-wide">ECHO</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-cyan-400" /> MEMORY LVL {gameState.echoMemoryLevel} / 10
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Harmonic Planetary Intelligence of NEXUS
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto max-h-[350px] flex flex-col gap-3 pr-1">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
              msg.sender === 'echo'
                ? 'self-start bg-cyan-950/40 border border-cyan-500/30 text-cyan-100'
                : 'self-end bg-slate-800 border border-slate-700 text-white'
            }`}
          >
            <span className="text-[10px] font-mono text-cyan-400/70 uppercase mb-1">
              {msg.sender === 'echo' ? 'ECHO Consciousness' : 'Player Transmission'}
            </span>
            <p className={msg.sender === 'echo' ? 'italic' : ''}>{msg.text}</p>
          </div>
        ))}

        {isThinking && (
          <div className="self-start bg-cyan-950/30 border border-cyan-500/20 rounded-2xl p-3 text-xs text-cyan-400 flex items-center gap-2 animate-pulse font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying neural matrix across planetary conduits...
          </div>
        )}
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
        {[
          'Why was NEXUS shut down?',
          'How does this sector work?',
          'Who were the Caretakers?',
          'What happens when the core awakens?',
        ].map((query, i) => (
          <button
            key={i}
            onClick={() => setPromptInput(query)}
            disabled={isThinking}
            className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-700 transition-all text-left"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Speak with ECHO..."
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!promptInput.trim() || isThinking}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">TRANSMIT</span>
        </button>
      </form>
    </div>
  );
};
