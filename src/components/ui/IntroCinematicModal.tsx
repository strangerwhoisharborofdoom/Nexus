import React, { useState, useEffect } from 'react';
import { soundEngine } from '../../audio/soundEngine';
import { Sparkles, Zap, ChevronRight, Play } from 'lucide-react';

interface IntroCinematicModalProps {
  onBegin: () => void;
}

export const IntroCinematicModal: React.FC<IntroCinematicModalProps> = ({ onBegin }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: 'AN ARTIFACT FROM DEEP TIME',
      subtitle: 'NEXUS — The Planetary Synthetic Civilization',
      text: 'For thousands of cycles, NEXUS slept in cold obsidian silence. Its energy transformers went dark, its aqueducts froze, and its gravitational pillars drifted loose.',
      glowColor: '#06b6d4',
    },
    {
      title: 'THE DORMANT GUARDIAN',
      subtitle: 'ECHO Awakens',
      text: 'Deep within the planetary core, a single voice stirred. ECHO—the world’s neural consciousness—has fragmented. Only by restoring the physical laws can its memory be pieced back together.',
      glowColor: '#8b5cf6',
    },
    {
      title: 'EVERY PUZZLE YOU SOLVE CHANGES THE WORLD',
      subtitle: 'Your Hand On The Machinery',
      text: 'Reconnect the conduits. Direct the ancient waterways. Stabilize gravity. Align time. Uncover the secret of why humanity shut down their greatest creation.',
      glowColor: '#ec4899',
    },
  ];

  const handleNext = () => {
    soundEngine.playEchoChime();
    if (slide < slides.length - 1) {
      setSlide((prev) => prev + 1);
    } else {
      soundEngine.init();
      onBegin();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 select-none animate-fadeIn">
      <div className="max-w-2xl w-full flex flex-col items-center text-center">
        {/* Glowing Emblem */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border transition-all duration-700 shadow-2xl"
          style={{
            borderColor: slides[slide].glowColor,
            backgroundColor: `${slides[slide].glowColor}15`,
            boxShadow: `0 0 40px ${slides[slide].glowColor}66`,
          }}
        >
          <Sparkles
            className="w-10 h-10 transition-colors duration-500"
            style={{ color: slides[slide].glowColor }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide
                  ? 'w-8 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                  : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>

        <span
          className="text-xs font-mono font-bold uppercase tracking-widest mb-2 transition-colors duration-500"
          style={{ color: slides[slide].glowColor }}
        >
          {slides[slide].title}
        </span>

        <h1 className="text-2xl md:text-4xl font-bold text-white tracking-wide mb-4">
          {slides[slide].subtitle}
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed mb-8">
          {slides[slide].text}
        </p>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="py-3.5 px-8 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-sm tracking-wider transition-all duration-300 flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-95"
        >
          {slide < slides.length - 1 ? (
            <>
              CONTINUE TRANSMISSION <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950" /> AWAKEN NEXUS
            </>
          )}
        </button>

        <button
          onClick={() => {
            soundEngine.init();
            onBegin();
          }}
          className="mt-4 text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
        >
          Skip Prologue
        </button>
      </div>
    </div>
  );
};
