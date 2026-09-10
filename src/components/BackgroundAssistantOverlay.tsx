import React, { useState } from 'react';
import { Mic, MicOff, Minimize2, Maximize2, Shield, Radio, Volume2, X } from 'lucide-react';

interface BackgroundAssistantOverlayProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  lastTranscript: string;
  onToggleVoice: () => void;
  backgroundServiceActive: boolean;
  onToggleBackgroundService: () => void;
}

export const BackgroundAssistantOverlay: React.FC<BackgroundAssistantOverlayProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  lastTranscript,
  onToggleVoice,
  backgroundServiceActive,
  onToggleBackgroundService
}) => {
  const [isMinimized, setIsMinimized] = useState(true);

  if (!backgroundServiceActive) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {isMinimized ? (
        // Floating Mini Arc Bubble
        <div 
          onClick={() => setIsMinimized(false)}
          className={`relative group cursor-pointer w-14 h-14 rounded-full bg-jarvis-card border-2 flex items-center justify-center transition-all duration-300 shadow-2xl
            ${isListening 
              ? 'border-jarvis-cyan shadow-cyan-glow animate-pulse' 
              : isSpeaking
              ? 'border-jarvis-green shadow-[0_0_20px_#00FF9D]'
              : 'border-cyan-500/50 hover:border-jarvis-cyan'
            }`}
        >
          {/* Pulsing beacon */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jarvis-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-jarvis-cyan"></span>
          </span>

          <div className="w-8 h-8 rounded-full bg-cyan-950/80 flex items-center justify-center">
            {isListening ? (
              <Mic className="w-4 h-4 text-jarvis-cyan animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-4 h-4 text-jarvis-green" />
            ) : (
              <Radio className="w-4 h-4 text-cyan-400" />
            )}
          </div>
        </div>
      ) : (
        // Expanded Floating Assistant HUD
        <div className="w-80 bg-jarvis-card/95 border-2 border-jarvis-cyan rounded-xl p-3.5 shadow-cyan-glow backdrop-blur-xl animate-fadeIn text-jarvis-text">
          <div className="flex items-center justify-between border-b border-jarvis-border pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-jarvis-green animate-ping" />
              <span className="font-orbitron text-xs font-bold text-cyan-200">
                JARVIS BACKGROUND OVERLAY
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-cyan-400 hover:text-cyan-200 p-1 rounded hover:bg-jarvis-surface"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggleBackgroundService}
                className="text-cyan-400 hover:text-red-400 p-1 rounded hover:bg-jarvis-surface"
                title="Stop background listener"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 mb-3">
            JARVIS is actively monitoring in the background. Tap mic or speak your command.
          </p>

          {lastTranscript && (
            <div className="bg-jarvis-surface p-2 rounded border border-jarvis-border/70 mb-3 text-xs font-mono-tech text-cyan-200 truncate">
              &gt; {lastTranscript}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleVoice}
              className={`flex-1 py-2 px-3 rounded-lg font-orbitron font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isListening 
                  ? 'bg-jarvis-red text-white animate-pulse' 
                  : 'bg-jarvis-cyan text-black hover:bg-cyan-300 shadow-cyan-glow'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>STOP LISTENING</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>VOICE COMMAND</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="py-2 px-3 bg-jarvis-surface hover:bg-cyan-950 border border-jarvis-border rounded-lg text-xs font-mono-tech text-cyan-300"
            >
              HIDE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
