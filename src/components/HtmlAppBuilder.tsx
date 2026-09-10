import React, { useState } from 'react';
import { Code, Play, Download, Copy, Check, Eye, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { generateHtmlApp } from '../services/gemini';
import { executeDownloadHtml } from '../services/phoneController';
import { GeneratedHtmlApp } from '../types';

interface HtmlAppBuilderProps {
  onNotify: (msg: string) => void;
  prefillTopic?: string;
}

export const HtmlAppBuilder: React.FC<HtmlAppBuilderProps> = ({ onNotify, prefillTopic = '' }) => {
  const [topic, setTopic] = useState(prefillTopic || 'Voice Controlled Calculator & Unit Converter');
  const [customReq, setCustomReq] = useState('Add scientific functions, dark mode sci-fi layout, history log, and responsive layout.');
  const [isLoading, setIsLoading] = useState(false);
  const [appData, setAppData] = useState<GeneratedHtmlApp | null>(null);
  const [activeView, setActiveView] = useState<'PREVIEW' | 'CODE'>('PREVIEW');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateHtmlApp(topic, customReq);
      setAppData(result);
      onNotify(`HTML Application "${result.title}" generated successfully!`);
    } catch (e: any) {
      console.error(e);
      onNotify(`Error generating HTML app: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!appData) return;
    const res = executeDownloadHtml(appData.title, appData.code);
    onNotify(`Downloaded HTML file: ${res.filename}`);
  };

  const handleCopyCode = () => {
    if (!appData) return;
    navigator.clipboard.writeText(appData.code);
    setCopied(true);
    onNotify('HTML code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sci-fi-box rounded-xl p-4 md:p-6 text-jarvis-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-jarvis-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-400 animate-pulse" />
          <h2 className="font-orbitron text-sm md:text-base font-bold text-cyan-200">
            HTML WEB APP ARCHITECT (ایچ ٹی ایم ایل ایپ میکر)
          </h2>
        </div>
        <span className="text-[10px] font-mono-tech bg-purple-950 text-purple-300 px-2.5 py-1 rounded border border-purple-500/40">
          GEMINI PRO ENGINE
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-4">
        Ask JARVIS to construct single-file interactive HTML/CSS/JavaScript applications and tools with live sandbox execution and one-tap download.
      </p>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-mono-tech text-cyan-400 mb-1">
            APP CONCEPT OR PURPOSE / ایپ کا آئیڈیا
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Modern To-Do Board, Expense Budget Planner, Pong Game..."
            className="w-full bg-jarvis-surface border border-jarvis-border px-3 py-2 rounded text-sm text-cyan-100 focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-xs font-mono-tech text-cyan-400 mb-1">
            CUSTOM FEATURES & SPECIFICATIONS / تفصیلات
          </label>
          <input
            type="text"
            value={customReq}
            onChange={e => setCustomReq(e.target.value)}
            placeholder="e.g. Include local storage, sleek animations, responsive layout..."
            className="w-full bg-jarvis-surface border border-jarvis-border px-3 py-2 rounded text-sm text-cyan-100 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Preset Ideas */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[11px] text-cyan-500 font-mono-tech">Quick Blueprints:</span>
        {[
          'Scientific Calculator with Audio Clicks',
          'Cyberpunk Pomodoro Timer & Soundboard',
          'Personal Expense Tracker with Charts',
          'Classic Snake Retro Arcade Game',
          'Urdu & English Text Transliteration Tool'
        ].map(idea => (
          <button
            key={idea}
            onClick={() => setTopic(idea)}
            className="text-[11px] bg-jarvis-surface/80 hover:bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800 text-purple-200"
          >
            {idea}
          </button>
        ))}
      </div>

      {/* Build Button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 via-indigo-600 to-jarvis-cyan hover:opacity-95 text-white font-orbitron font-bold text-xs md:text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>SYNTHESIZING COMPLETE HTML APPLICATION...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>GENERATE HTML WEB APP (ایچ ٹی ایم ایل ایپ بنائیں)</span>
          </>
        )}
      </button>

      {/* Output Viewer */}
      {appData && (
        <div className="mt-6 border border-jarvis-border rounded-lg overflow-hidden bg-jarvis-surface">
          {/* Viewer Toolbar */}
          <div className="flex flex-wrap items-center justify-between bg-jarvis-card px-4 py-2.5 border-b border-jarvis-border gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
              <span className="font-orbitron text-xs md:text-sm font-bold text-cyan-200 truncate">
                {appData.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-jarvis-surface p-0.5 rounded border border-jarvis-border flex font-mono-tech text-xs">
                <button
                  onClick={() => setActiveView('PREVIEW')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                    activeView === 'PREVIEW' ? 'bg-jarvis-cyan text-black font-bold' : 'text-slate-300'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>PREVIEW</span>
                </button>
                <button
                  onClick={() => setActiveView('CODE')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                    activeView === 'CODE' ? 'bg-jarvis-cyan text-black font-bold' : 'text-slate-300'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>CODE</span>
                </button>
              </div>

              <button
                onClick={handleCopyCode}
                className="bg-jarvis-surface hover:bg-cyan-950 text-cyan-300 border border-cyan-700 text-xs px-2.5 py-1 rounded flex items-center gap-1 font-mono-tech"
              >
                {copied ? <Check className="w-3 h-3 text-jarvis-green" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="bg-jarvis-cyan hover:bg-cyan-300 text-black font-orbitron font-bold text-xs px-3 py-1 rounded flex items-center gap-1 shadow-cyan-glow"
              >
                <Download className="w-3 h-3" />
                <span>DOWNLOAD .HTML</span>
              </button>
            </div>
          </div>

          {/* View Container */}
          {activeView === 'PREVIEW' ? (
            <div className="w-full h-96 md:h-[480px] bg-white">
              <iframe
                title={appData.title}
                srcDoc={appData.code}
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="w-full h-96 md:h-[480px] overflow-auto p-4 bg-[#030712] font-mono-tech text-xs text-emerald-400">
              <pre className="whitespace-pre-wrap">{appData.code}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
