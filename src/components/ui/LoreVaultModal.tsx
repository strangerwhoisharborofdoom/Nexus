import React, { useState } from 'react';
import { MEMORIES } from '../../data/memoriesData';
import { soundEngine } from '../../audio/soundEngine';
import { BookOpen, Lock, Sparkles, X, ChevronRight } from 'lucide-react';

interface LoreVaultModalProps {
  unlockedMemoryIds: string[];
  onClose: () => void;
}

export const LoreVaultModal: React.FC<LoreVaultModalProps> = ({
  unlockedMemoryIds,
  onClose,
}) => {
  const [selectedMemoryId, setSelectedMemoryId] = useState<string>(
    unlockedMemoryIds[0] || MEMORIES[0].id
  );

  const selectedMemory = MEMORIES.find((m) => m.id === selectedMemoryId) || MEMORIES[0];
  const isSelectedUnlocked = unlockedMemoryIds.includes(selectedMemory.id);

  const handleSelect = (id: string, isUnlocked: boolean) => {
    if (isUnlocked) {
      soundEngine.playEchoChime();
      setSelectedMemoryId(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fadeIn select-none">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl shadow-purple-950/80">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.6)]">
              <BookOpen className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono tracking-wide">
                NEXUS CHRONICLE VAULT
              </h2>
              <span className="text-xs text-purple-400 font-mono">
                Recovered Memory Shards: {unlockedMemoryIds.length} / {MEMORIES.length}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 overflow-hidden min-h-[400px]">
          {/* Left Column: Fragment List */}
          <div className="flex flex-col gap-2 overflow-y-auto pr-1">
            {MEMORIES.map((mem) => {
              const isUnlocked = unlockedMemoryIds.includes(mem.id);
              const isCurrent = mem.id === selectedMemoryId;

              return (
                <button
                  key={mem.id}
                  onClick={() => handleSelect(mem.id, isUnlocked)}
                  disabled={!isUnlocked}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-purple-950/60 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : isUnlocked
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      : 'bg-slate-950/30 border-slate-900 opacity-40 cursor-not-allowed text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isUnlocked ? (
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold line-clamp-1">
                        {isUnlocked ? mem.title : 'Corrupted Memory Shard'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {mem.timestamp}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Fragment Reader */}
          <div className="md:col-span-2 bg-slate-950/80 border border-purple-900/40 rounded-2xl p-6 flex flex-col justify-between overflow-y-auto">
            {isSelectedUnlocked ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                      {selectedMemory.category.toUpperCase()} RECORD • {selectedMemory.timestamp}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Author: <strong className="text-white">{selectedMemory.author}</strong>
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {selectedMemory.title}
                  </h3>
                </div>

                <div className="text-sm text-purple-100/90 leading-relaxed font-sans whitespace-pre-line italic">
                  «{selectedMemory.content}»
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Lock className="w-10 h-10 mb-3 opacity-40 text-purple-400" />
                <h4 className="text-base font-bold text-white font-mono mb-1">
                  Memory Shard Encrypted
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Solve puzzles throughout the corresponding Sector to decrypt this historical transcript.
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>NEXUS Core Data Preservation Protocol</span>
              <span className="text-purple-400">ID: {selectedMemory.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
