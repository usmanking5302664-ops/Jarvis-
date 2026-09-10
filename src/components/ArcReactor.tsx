import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface ArcReactorProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  onClick: () => void;
  statusText?: string;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  onClick,
  statusText = 'ONLINE'
}) => {
  const [waveBars, setWaveBars] = useState<number[]>(new Array(16).fill(20));

  useEffect(() => {
    let interval: any;
    if (isListening || isSpeaking || isProcessing) {
      interval = setInterval(() => {
        setWaveBars(
          new Array(16).fill(0).map(() => Math.floor(Math.random() * 65) + 15)
        );
      }, 80);
    } else {
      setWaveBars(new Array(16).fill(12));
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking, isProcessing]);

  return (
    <div className="flex flex-col items-center justify-center select-none my-4">
      {/* Outer Glow & Housing */}
      <div 
        onClick={onClick}
        className={`relative w-56 h-56 md:w-64 md:h-64 rounded-full cursor-pointer flex items-center justify-center transition-all duration-700
          ${isListening 
            ? 'shadow-[0_0_80px_rgba(0,240,255,0.7),inset_0_0_40px_rgba(0,240,255,0.5)] border-2 border-jarvis-cyan' 
            : isProcessing 
            ? 'shadow-[0_0_80px_rgba(255,184,0,0.6),inset_0_0_40px_rgba(255,184,0,0.4)] border-2 border-jarvis-amber'
            : isSpeaking
            ? 'shadow-[0_0_80px_rgba(0,255,157,0.7),inset_0_0_40px_rgba(0,255,157,0.5)] border-2 border-jarvis-green'
            : 'shadow-[0_0_45px_rgba(0,240,255,0.35),inset_0_0_20px_rgba(0,240,255,0.2)] border border-jarvis-border/60 hover:border-jarvis-cyan/80'
          }`}
        style={{
          background: 'radial-gradient(circle, #091a33 0%, #050d1a 60%, #03060d 100%)'
        }}
      >
        {/* Outer Ring 1: Clockwise Rotation */}
        <div 
          className={`absolute inset-2 rounded-full border border-dashed border-jarvis-cyan/40 pointer-events-none
            ${isListening || isProcessing ? 'animate-spin-slow' : 'animate-[spin_30s_linear_infinite]'}`}
        />

        {/* Outer Ring 2: Counter-Clockwise Segmented */}
        <div 
          className={`absolute inset-5 rounded-full border-2 border-t-jarvis-cyan border-r-transparent border-b-jarvis-cyan/30 border-l-transparent pointer-events-none
            ${isListening || isProcessing ? 'animate-spin-reverse' : 'animate-[spin_40s_linear_infinite_reverse]'}`}
        />

        {/* Inner Ring with Tick Markers */}
        <div className="absolute inset-9 rounded-full border border-cyan-400/20 flex items-center justify-center pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-3 origin-center transition-colors duration-300
                ${isListening ? 'bg-jarvis-cyan shadow-[0_0_6px_#00F0FF]' : isProcessing ? 'bg-jarvis-amber' : 'bg-cyan-500/40'}`}
              style={{
                transform: `rotate(${i * 30}deg) translateY(-85px)`
              }}
            />
          ))}
        </div>

        {/* Core Arc Reactor Chamber */}
        <div 
          className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500
            ${isListening 
              ? 'bg-cyan-950/80 shadow-[0_0_40px_#00F0FF] scale-105' 
              : isProcessing 
              ? 'bg-amber-950/80 shadow-[0_0_40px_#FFB800] scale-105'
              : isSpeaking
              ? 'bg-emerald-950/80 shadow-[0_0_40px_#00FF9D]'
              : 'bg-[#0b172a] shadow-[0_0_20px_rgba(0,240,255,0.4)]'
            }`}
        >
          {/* Triangular Arc Reactor Grid */}
          <div className="absolute inset-2 border border-cyan-400/30 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 border border-cyan-400/20 rotate-45" />
          </div>

          {/* Central Status Icon */}
          <div className="z-10 flex flex-col items-center">
            {isListening ? (
              <Mic className="w-9 h-9 text-jarvis-cyan animate-pulse" />
            ) : isProcessing ? (
              <div className="w-8 h-8 rounded-full border-2 border-jarvis-amber border-t-transparent animate-spin" />
            ) : isSpeaking ? (
              <Volume2 className="w-9 h-9 text-jarvis-green animate-bounce" />
            ) : (
              <MicOff className="w-8 h-8 text-cyan-400/70 group-hover:text-jarvis-cyan" />
            )}
            
            <span className="text-[10px] font-orbitron tracking-widest mt-1 font-bold text-cyan-300 uppercase">
              {isListening ? 'LISTENING' : isProcessing ? 'THINKING' : isSpeaking ? 'SPEAKING' : 'READY'}
            </span>
          </div>
        </div>

        {/* Tap Prompt Ripple */}
        {!isListening && !isProcessing && (
          <div className="absolute -bottom-3 bg-jarvis-card/90 px-3 py-1 rounded-full border border-jarvis-cyan/40 text-[11px] font-mono-tech tracking-wider text-jarvis-cyan shadow-cyan-glow">
            TAP TO COMMAND
          </div>
        )}
      </div>

      {/* Audio Reactive Equalizer Bars */}
      <div className="flex items-center justify-center gap-1 mt-6 h-10 w-64 px-4 bg-jarvis-card/40 rounded-lg border border-jarvis-border/40">
        {waveBars.map((height, idx) => (
          <div
            key={idx}
            className={`w-1.5 rounded-full transition-all duration-75
              ${isListening 
                ? 'bg-jarvis-cyan shadow-[0_0_8px_#00F0FF]' 
                : isProcessing 
                ? 'bg-jarvis-amber' 
                : isSpeaking 
                ? 'bg-jarvis-green shadow-[0_0_8px_#00FF9D]' 
                : 'bg-cyan-900/50'}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      {/* Telemetry Status Line */}
      <div className="mt-2 text-xs font-mono-tech text-cyan-300/80 tracking-widest uppercase flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-jarvis-cyan animate-ping' : 'bg-jarvis-green'}`} />
        <span>CORE: {statusText}</span>
        <span className="text-cyan-600">|</span>
        <span>GEMINI PRO: ACTIVE</span>
      </div>
    </div>
  );
};
