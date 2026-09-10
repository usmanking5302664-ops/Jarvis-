import React, { useState } from 'react';
import { Terminal, Sparkles, Copy, Check, FileDown, Layers, Loader2 } from 'lucide-react';
import { generateEngineeredPrompt } from '../services/gemini';
import { executeGenerateAndDownloadPdf } from '../services/phoneController';

interface PromptStudioProps {
  onNotify: (msg: string) => void;
  onUsePrompt: (promptText: string) => void;
}

export const PromptStudio: React.FC<PromptStudioProps> = ({ onNotify, onUsePrompt }) => {
  const [subject, setSubject] = useState('Senior Full Stack System Architect & Code Reviewer');
  const [category, setCategory] = useState('Coding & Software Architecture');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [generatedPrompt, setGeneratedPrompt] = useState<{
    title: string;
    systemPrompt: string;
    userPromptTemplate: string;
    tips: string[];
  } | null>(null);

  const handleGenerate = async () => {
    if (!subject.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateEngineeredPrompt(subject, category);
      setGeneratedPrompt(result);
      onNotify(`Engineered prompt for "${result.title}" created!`);
    } catch (e: any) {
      console.error(e);
      onNotify(`Error generating prompt: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    onNotify('Copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadPdf = () => {
    if (!generatedPrompt) return;
    const content = `ENGINEERED PROMPT: ${generatedPrompt.title}\nCategory: ${category}\n\nSYSTEM INSTRUCTION / PERSONA:\n${generatedPrompt.systemPrompt}\n\nUSER PROMPT TEMPLATE:\n${generatedPrompt.userPromptTemplate}\n\nOPTIMIZATION TIPS:\n${generatedPrompt.tips.join('\n• ')}`;
    executeGenerateAndDownloadPdf(`Prompt_${generatedPrompt.title}`, content);
    onNotify('Prompt downloaded as PDF!');
  };

  return (
    <div className="sci-fi-box rounded-xl p-4 md:p-6 text-jarvis-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-jarvis-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-jarvis-cyan animate-pulse" />
          <h2 className="font-orbitron text-sm md:text-base font-bold text-cyan-200">
            PROMPT STUDIO & META-ENGINEER (پرومٹ اسٹوڈیو)
          </h2>
        </div>
        <span className="text-[10px] font-mono-tech bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded border border-cyan-500/40">
          PROMPT OPTIMIZER
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-4">
        Synthesize elite system prompts, role constraints, and few-shot reasoning templates for Gemini, ChatGPT, Claude, and Midjourney.
      </p>

      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-mono-tech text-cyan-400 mb-1">
            TARGET ROLE OR TASK / مقصد
          </label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. YouTube Script Writer, Cybersecurity Auditor, Urdu Poet..."
            className="w-full bg-jarvis-surface border border-jarvis-border px-3 py-2 rounded text-sm text-cyan-100 focus:outline-none focus:border-jarvis-cyan"
          />
        </div>

        <div>
          <label className="block text-xs font-mono-tech text-cyan-400 mb-1">
            CATEGORY / زمرہ
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-jarvis-surface border border-jarvis-border px-3 py-2 rounded text-xs text-cyan-100 focus:outline-none focus:border-jarvis-cyan"
          >
            <option>Coding & Software Architecture</option>
            <option>Autonomous AI Agents</option>
            <option>Marketing & Copywriting</option>
            <option>Academic Research & Study</option>
            <option>Creative Writing & Urdu Adab</option>
            <option>Midjourney & Image Generation</option>
          </select>
        </div>
      </div>

      {/* Quick Picks */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[11px] text-cyan-500 font-mono-tech">Quick Themes:</span>
        {[
          'Autonomous Agent Jailbreak & Zero-Shot Reasoner',
          'Kotlin Jetpack Compose Android Senior Dev',
          'Urdu Shairi & Ghazal Master Poet (اردو شاعر)',
          'High Converting Viral Video Script Creator',
          'Photorealistic Cyberpunk Midjourney Prompt'
        ].map(theme => (
          <button
            key={theme}
            onClick={() => setSubject(theme)}
            className="text-[11px] bg-jarvis-surface/80 hover:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 text-cyan-300"
          >
            {theme}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-amber-400 via-jarvis-cyan to-jarvis-blue hover:opacity-90 text-black font-orbitron font-bold text-xs md:text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-cyan-glow disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>ENGINEERING PRECISION PROMPT...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-black" />
            <span>ENGINEER PROMPT WITH GEMINI PRO (پرومٹ بنائیں)</span>
          </>
        )}
      </button>

      {/* Result Display */}
      {generatedPrompt && (
        <div className="mt-6 space-y-4 animate-fadeIn">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-jarvis-border pb-2 gap-2">
            <h3 className="font-orbitron text-sm font-bold text-cyan-200">
              {generatedPrompt.title}
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                className="bg-jarvis-surface hover:bg-cyan-950 text-cyan-300 border border-cyan-700 text-xs px-2.5 py-1 rounded flex items-center gap-1 font-mono-tech"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>SAVE PDF</span>
              </button>
              <button
                onClick={() => onUsePrompt(`${generatedPrompt.systemPrompt}\n\nTask: ${generatedPrompt.userPromptTemplate}`)}
                className="bg-jarvis-cyan hover:bg-cyan-300 text-black text-xs px-3 py-1 rounded flex items-center gap-1 font-orbitron font-bold"
              >
                <span>TEST IN JARVIS</span>
              </button>
            </div>
          </div>

          {/* System Prompt Box */}
          <div className="bg-jarvis-card/90 rounded-lg p-3 border border-jarvis-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono-tech text-jarvis-cyan font-bold">
                1. SYSTEM INSTRUCTION / PERSONA (سسٹم پرومٹ)
              </span>
              <button
                onClick={() => copyToClipboard(generatedPrompt.systemPrompt, 'system')}
                className="text-xs text-cyan-400 hover:text-cyan-200 flex items-center gap-1 font-mono-tech"
              >
                {copiedSection === 'system' ? <Check className="w-3 h-3 text-jarvis-green" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'system' ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <pre className="text-xs text-slate-200 font-mono-tech whitespace-pre-wrap bg-jarvis-surface/80 p-2.5 rounded border border-jarvis-border/60">
              {generatedPrompt.systemPrompt}
            </pre>
          </div>

          {/* User Prompt Template */}
          <div className="bg-jarvis-card/90 rounded-lg p-3 border border-jarvis-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono-tech text-amber-300 font-bold">
                2. USER INPUT TEMPLATE WITH VARIABLES (یوزر ٹیمپلیٹ)
              </span>
              <button
                onClick={() => copyToClipboard(generatedPrompt.userPromptTemplate, 'template')}
                className="text-xs text-cyan-400 hover:text-cyan-200 flex items-center gap-1 font-mono-tech"
              >
                {copiedSection === 'template' ? <Check className="w-3 h-3 text-jarvis-green" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'template' ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <pre className="text-xs text-slate-200 font-mono-tech whitespace-pre-wrap bg-jarvis-surface/80 p-2.5 rounded border border-jarvis-border/60">
              {generatedPrompt.userPromptTemplate}
            </pre>
          </div>

          {/* Tips */}
          {generatedPrompt.tips && generatedPrompt.tips.length > 0 && (
            <div className="p-3 bg-jarvis-surface/90 rounded-lg border border-jarvis-border/60">
              <span className="text-xs font-mono-tech text-jarvis-green font-bold block mb-1.5">
                OPTIMIZATION RECOMMENDATIONS:
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {generatedPrompt.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-jarvis-cyan">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
