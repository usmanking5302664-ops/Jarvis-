import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Mic, 
  MicOff, 
  Send, 
  Smartphone, 
  GraduationCap, 
  Terminal, 
  Code, 
  FileText, 
  Music, 
  Download, 
  MessageSquare, 
  Settings, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Cpu, 
  Activity, 
  Wifi, 
  Battery, 
  Languages, 
  ShieldCheck,
  Zap,
  Key,
  Check,
  X
} from 'lucide-react';

import { ArcReactor } from './components/ArcReactor';
import { PhoneControlPanel } from './components/PhoneControlPanel';
import { CourseMaker } from './components/CourseMaker';
import { PromptStudio } from './components/PromptStudio';
import { HtmlAppBuilder } from './components/HtmlAppBuilder';
import { TaskTerminal } from './components/TaskTerminal';
import { BackgroundAssistantOverlay } from './components/BackgroundAssistantOverlay';

import { 
  parseJarvisCommand, 
  askJarvisChat,
  getEffectiveApiKey,
  setCustomApiKey,
  DEFAULT_API_KEY
} from './services/gemini';

import { 
  executeSendSms, 
  executeOpenApp, 
  executeInstallFromPlayStore, 
  executePlaySong, 
  executeGenerateAndDownloadPdf, 
  executeDownloadHtml,
  fetchDeviceTelemetry, 
  jarvisAudio 
} from './services/phoneController';

import { jarvisSpeech } from './services/speech';
import { TaskLog, JarvisCommand } from './types';

export function App() {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState<'CORE' | 'CONTROLLER' | 'COURSES' | 'PROMPTS' | 'HTML_BUILDER'>('CORE');
  
  // Voice & AI State
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [language, setLanguage] = useState<'ur-PK' | 'en-US'>('ur-PK');
  const [audioMuted, setAudioMuted] = useState(false);
  const [backgroundService, setBackgroundService] = useState(true);

  // Prefill states for sub-views
  const [htmlPrefill, setHtmlPrefill] = useState('');

  // Device Telemetry
  const [battery, setBattery] = useState<number>(92);
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  // Execution & Terminal Logs
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getEffectiveApiKey());
  const [isTestingKey, setIsTestingKey] = useState(false);

  // Startup Sound
  useEffect(() => {
    jarvisAudio.playStartupChime();
    addLog('SYSTEM_TELEMETRY', 'SYSTEM INITIALIZATION', 'SUCCESS', 'J.A.R.V.I.S. Core V3.5 initialized with Gemini Pro intelligence.');
    
    // Initial welcome voice greeting
    setTimeout(() => {
      const welcomeMsg = language === 'ur-PK'
        ? 'جاروس سسٹم آن لائن ہے۔ میں آپ کے فون کے تمام کنٹرولز سنبھالنے کے لیے تیار ہوں۔'
        : 'JARVIS core online, Sir. All phone systems and autonomous protocols are active.';
      speakJarvis(welcomeMsg);
    }, 800);

    // Clock and telemetry updates
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    fetchDeviceTelemetry().then(t => {
      if (t.batteryLevel !== undefined) setBattery(t.batteryLevel);
      setIsOnline(t.online);
    });

    return () => clearInterval(timer);
  }, []);

  const addLog = (action: any, command: string, status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED', details: string) => {
    const newLog: TaskLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      command,
      action,
      status,
      details
    };
    setLogs(prev => [newLog, ...prev.slice(0, 40)]);
  };

  const notifyUser = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const speakJarvis = (text: string) => {
    if (audioMuted) return;
    setIsSpeaking(true);
    jarvisSpeech.speak(text, () => {
      setIsSpeaking(false);
    });
  };

  // Toggle Voice Recognition
  const toggleVoiceListening = () => {
    if (isListening) {
      jarvisSpeech.stopListening();
      setIsListening(false);
    } else {
      jarvisAudio.playBeep(980, 0.15, 'sine');
      setTranscript('');
      setIsListening(true);
      jarvisSpeech.setLanguage(language);

      jarvisSpeech.startListening(
        (recognized, isFinal) => {
          setTranscript(recognized);
          if (isFinal && recognized.trim().length > 1) {
            jarvisSpeech.stopListening();
            setIsListening(false);
            executeJarvisCommand(recognized);
          }
        },
        listening => setIsListening(listening),
        err => {
          console.warn('Speech err:', err);
          setIsListening(false);
          notifyUser(`Voice error: ${err}`);
        }
      );
    }
  };

  // Main Command Orchestrator (Autonomous execution of all user requests)
  const executeJarvisCommand = async (rawInput: string) => {
    const input = rawInput.trim();
    if (!input) return;

    setCommandInput('');
    setTranscript(input);
    setIsProcessing(true);
    jarvisAudio.playBeep(700, 0.1);

    addLog('SYSTEM_TELEMETRY', input, 'EXECUTING', 'Analyzing command with Gemini Pro...');

    try {
      // 1. Analyze with Gemini Pro
      const cmd: JarvisCommand = await parseJarvisCommand(input);

      const voiceReply = language === 'ur-PK' 
        ? (cmd.explanationUrdu || 'سر، آپ کا ٹاسک مکمل کیا جا رہا ہے۔')
        : (cmd.explanationEnglish || 'Executing command immediately, Sir.');
      
      speakJarvis(voiceReply);

      // 2. Dispatch real physical device actions based on parsed intent
      switch (cmd.action) {
        case 'SEND_SMS': {
          const phone = cmd.parameters.phoneNumber || '';
          const msg = cmd.parameters.message || input;
          const res = executeSendSms(phone, msg);
          addLog('SEND_SMS', `SMS to ${phone || 'recipient'}`, 'SUCCESS', res.message);
          notifyUser(`SMS intent dispatched: "${msg}"`);
          break;
        }

        case 'OPEN_APP': {
          const appName = cmd.parameters.appName || input;
          const res = executeOpenApp(appName);
          addLog('OPEN_APP', `Launch ${appName}`, 'SUCCESS', res.action);
          notifyUser(`Launching app: ${res.appName}`);
          break;
        }

        case 'INSTALL_APP': {
          const appName = cmd.parameters.appName || input;
          const res = executeInstallFromPlayStore(appName);
          addLog('INSTALL_APP', `Install ${appName}`, 'SUCCESS', `Opening Play Store for ${appName}`);
          notifyUser(`Searching ${appName} on Google Play Store`);
          break;
        }

        case 'PLAY_SONG': {
          const song = cmd.parameters.songTitle || input;
          const res = executePlaySong(song);
          addLog('PLAY_SONG', `Play ${song}`, 'SUCCESS', `Dispatched audio streaming for ${song}`);
          notifyUser(`Playing song: ${song}`);
          break;
        }

        case 'GENERATE_HTML': {
          const topic = cmd.parameters.htmlTopic || input;
          setHtmlPrefill(topic);
          setActiveTab('HTML_BUILDER');
          addLog('GENERATE_HTML', `HTML App for ${topic}`, 'SUCCESS', 'Redirecting to HTML Web App Builder...');
          notifyUser(`Generating HTML application for: ${topic}`);
          break;
        }

        case 'DOWNLOAD_PDF': {
          const title = cmd.parameters.pdfTitle || 'JARVIS Document';
          const content = cmd.parameters.pdfContent || input;
          const res = executeGenerateAndDownloadPdf(title, content);
          addLog('DOWNLOAD_PDF', `PDF: ${title}`, 'SUCCESS', `Downloaded: ${res.filename}`);
          notifyUser(`PDF Document downloaded: ${res.filename}`);
          break;
        }

        case 'CREATE_COURSE': {
          setActiveTab('COURSES');
          addLog('CREATE_COURSE', `Course: ${cmd.parameters.courseTopic || input}`, 'SUCCESS', 'Opening Course Architect...');
          notifyUser('Switching to Course Architect');
          break;
        }

        case 'CREATE_PROMPT': {
          setActiveTab('PROMPTS');
          addLog('CREATE_PROMPT', `Prompt: ${cmd.parameters.promptSubject || input}`, 'SUCCESS', 'Opening Prompt Studio...');
          notifyUser('Switching to Prompt Studio');
          break;
        }

        default: {
          // General conversation with Jarvis
          const chatReply = await askJarvisChat(input);
          speakJarvis(chatReply);
          addLog('GENERAL_CHAT', input, 'SUCCESS', chatReply);
          break;
        }
      }
    } catch (error: any) {
      console.error(error);
      addLog('SYSTEM_TELEMETRY', input, 'FAILED', error.message || 'Execution error');
      notifyUser(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-jarvis-bg text-jarvis-text flex flex-col justify-between selection:bg-jarvis-cyan selection:text-black">
      
      {/* Top Telemetry & Control Bar */}
      <header className="border-b border-jarvis-border/80 bg-jarvis-surface/90 backdrop-blur-md sticky top-0 z-40 px-3 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full bg-cyan-950 border border-jarvis-cyan flex items-center justify-center shadow-cyan-glow">
            <Zap className="w-4 h-4 text-jarvis-cyan animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-orbitron font-extrabold text-sm md:text-base tracking-widest text-cyan-100">
                J.A.R.V.I.S.
              </h1>
              <span className="text-[10px] font-mono-tech bg-cyan-950 text-jarvis-cyan px-2 py-0.5 rounded border border-jarvis-cyan/30">
                MOBILE AI CORE
              </span>
            </div>
            <div className="text-[10px] text-cyan-400/80 font-mono-tech flex items-center gap-1.5">
              <span>Tony Stark Protocol</span>
              <span>•</span>
              <span className="text-jarvis-green">Autonomous Engine Active</span>
            </div>
          </div>
        </div>

        {/* Telemetry badges */}
        <div className="flex items-center gap-2 md:gap-3 text-xs font-mono-tech">
          {/* Battery */}
          <div className="flex items-center gap-1 bg-jarvis-card px-2.5 py-1 rounded border border-jarvis-border text-cyan-300">
            <Battery className="w-3.5 h-3.5 text-jarvis-green" />
            <span>{battery}%</span>
          </div>

          {/* Online */}
          <div className="flex items-center gap-1 bg-jarvis-card px-2.5 py-1 rounded border border-jarvis-border text-cyan-300">
            <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-jarvis-cyan' : 'text-jarvis-red'}`} />
            <span className="hidden sm:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={() => {
              setAudioMuted(!audioMuted);
              if (!audioMuted) jarvisSpeech.stopSpeaking();
            }}
            className="p-1.5 rounded bg-jarvis-card border border-jarvis-border hover:border-jarvis-cyan text-cyan-300 transition-colors"
            title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-jarvis-red" /> : <Volume2 className="w-4 h-4 text-jarvis-green" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => {
              const next = language === 'ur-PK' ? 'en-US' : 'ur-PK';
              setLanguage(next);
              jarvisSpeech.setLanguage(next);
              notifyUser(`Voice language: ${next === 'ur-PK' ? 'Urdu (اردو)' : 'English'}`);
            }}
            className="flex items-center gap-1 bg-jarvis-card px-2.5 py-1 rounded border border-jarvis-border hover:border-jarvis-cyan text-cyan-300 font-bold transition-all"
          >
            <Languages className="w-3.5 h-3.5 text-jarvis-cyan" />
            <span>{language === 'ur-PK' ? 'اردو' : 'EN'}</span>
          </button>

          {/* Background Service Status */}
          <button
            onClick={() => {
              setBackgroundService(!backgroundService);
              notifyUser(backgroundService ? 'Background service paused' : 'Background service online');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] transition-all ${
              backgroundService 
                ? 'bg-emerald-950/70 border-jarvis-green text-emerald-300' 
                : 'bg-jarvis-card border-jarvis-border text-slate-400'
            }`}
          >
            <Radio className={`w-3 h-3 ${backgroundService ? 'text-jarvis-green animate-pulse' : ''}`} />
            <span className="hidden md:inline">BG MONITOR:</span>
            <span>{backgroundService ? 'ON' : 'OFF'}</span>
          </button>
          {/* Settings & API Key Modal Button */}
          <button
            onClick={() => {
              setApiKeyInput(getEffectiveApiKey());
              setIsSettingsOpen(true);
            }}
            className="p-1.5 rounded bg-jarvis-card border border-jarvis-border hover:border-jarvis-cyan text-cyan-300 transition-colors"
            title="Settings & API Key"
          >
            <Settings className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </header>

      {/* Mode Navigation Tabs */}
      <nav className="bg-jarvis-surface border-b border-jarvis-border/60 px-3 py-2 flex items-center justify-center gap-1 md:gap-2 overflow-x-auto text-xs font-mono-tech">
        {[
          { id: 'CORE', label: 'JARVIS CORE', icon: Zap },
          { id: 'CONTROLLER', label: 'PHONE CONTROLS', icon: Smartphone },
          { id: 'COURSES', label: 'COURSE ARCHITECT', icon: GraduationCap },
          { id: 'PROMPTS', label: 'PROMPT STUDIO', icon: Terminal },
          { id: 'HTML_BUILDER', label: 'HTML APP MAKER', icon: Code },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                jarvisAudio.playBeep(800, 0.05);
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-jarvis-cyan text-black font-bold shadow-cyan-glow'
                  : 'text-cyan-300/80 hover:text-cyan-100 hover:bg-jarvis-card'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 md:p-6 space-y-6">
        
        {/* Floating Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-4 z-50 bg-jarvis-cyan text-black px-4 py-2 rounded-lg font-orbitron font-bold text-xs shadow-cyan-glow animate-bounce flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* View 1: JARVIS CORE (Central Arc Reactor + Voice Command Terminal) */}
        {activeTab === 'CORE' && (
          <div className="flex flex-col items-center space-y-6">
            
            {/* Holographic Arc Reactor */}
            <ArcReactor
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              onClick={toggleVoiceListening}
              statusText={isListening ? 'LISTENING TO VOICE' : isProcessing ? 'GEMINI PRO PROCESSING' : isSpeaking ? 'SPEAKING' : 'ONLINE'}
            />

            {/* Real-time Voice Live Transcript Bubble */}
            {(transcript || isListening) && (
              <div className="w-full max-w-2xl bg-cyan-950/70 border border-jarvis-cyan rounded-xl p-3.5 text-center text-sm text-cyan-200 font-mono-tech shadow-cyan-glow animate-pulse">
                <span className="text-jarvis-cyan font-bold block text-xs mb-1">
                  {isListening ? 'LIVE VOICE STREAM (بولیں...)' : 'COMMAND RECOGNIZED:'}
                </span>
                {transcript || 'Listening for your command in Urdu or English...'}
              </div>
            )}

            {/* Command Input Field with Mic & Send Buttons */}
            <div className="w-full max-w-2xl sci-fi-box rounded-xl p-2 md:p-3 flex items-center gap-2">
              <button
                onClick={toggleVoiceListening}
                className={`p-3 rounded-lg flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-jarvis-red text-white animate-pulse'
                    : 'bg-jarvis-card hover:bg-jarvis-cyan/20 text-jarvis-cyan border border-jarvis-border hover:border-jarvis-cyan'
                }`}
                title={isListening ? 'Stop Mic' : 'Start Voice Command'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                placeholder={
                  language === 'ur-PK'
                    ? 'وائس کمانڈ دیں یا لکھیں (مثلاً: احمد کو میسج کرو، گانا لگاؤ، کورس بناؤ...)'
                    : 'Speak or type command (e.g. Send SMS to Ahmed, Open YouTube, Build HTML...)'
                }
                value={commandInput}
                onChange={e => setCommandInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    executeJarvisCommand(commandInput);
                  }
                }}
                className="flex-1 bg-transparent px-3 py-2 text-sm md:text-base text-cyan-100 placeholder:text-cyan-600/70 focus:outline-none font-mono-tech"
              />

              <button
                onClick={() => executeJarvisCommand(commandInput)}
                disabled={!commandInput.trim() || isProcessing}
                className="bg-jarvis-cyan hover:bg-cyan-300 text-black px-4 py-2.5 rounded-lg font-orbitron font-bold text-xs flex items-center gap-1.5 transition-all shadow-cyan-glow disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EXECUTE</span>
              </button>
            </div>

            {/* Quick Action Suggestion Chips in Urdu & English */}
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-between text-xs text-cyan-400 font-mono-tech mb-2">
                <span>AUTONOMOUS QUICK COMMANDS (تیز رفتار احکامات):</span>
                <span className="text-[10px] text-cyan-600">TAP TO TRIGGER</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { text: 'احمد کو ایس ایم ایس کرو کہ میں آ رہا ہوں', label: 'Send SMS (ایس ایم ایس)' },
                  { text: 'واٹس ایپ اوپن کرو', label: 'Open WhatsApp (ایپ کھولیں)' },
                  { text: 'عاطف اسلم کا گانا چلاؤ', label: 'Play Song (سونگ لگائیں)' },
                  { text: 'پلے اسٹور سے انسٹاگرام ڈاؤن لوڈ کرو', label: 'Install from Play Store' },
                  { text: 'کیلکولیٹر ایپ کا ایچ ٹی ایم ایل بناؤ', label: 'Create HTML App' },
                  { text: 'پائتھون اور اے آئی کا کورس بناؤ', label: 'Create Masterclass' },
                  { text: 'آرٹیفیشل انٹیلیجنس کی پی ڈی ایف بنا کر ڈاؤن لوڈ کرو', label: 'Download PDF Report' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => executeJarvisCommand(item.text)}
                    className="text-xs bg-jarvis-card hover:bg-cyan-950/90 border border-jarvis-border hover:border-jarvis-cyan px-3 py-1.5 rounded-lg text-cyan-200 transition-all text-left flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-jarvis-cyan" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Terminal */}
            <div className="w-full max-w-4xl">
              <TaskTerminal logs={logs} onClearLogs={() => setLogs([])} />
            </div>
          </div>
        )}

        {/* View 2: DEVICE CONTROLLER */}
        {activeTab === 'CONTROLLER' && (
          <div className="space-y-6">
            <PhoneControlPanel
              onSendSms={(phone, msg) => executeJarvisCommand(`Send SMS to ${phone} saying: ${msg}`)}
              onOpenApp={appName => executeJarvisCommand(`Open app ${appName}`)}
              onInstallApp={appName => executeJarvisCommand(`Install ${appName} from Play Store`)}
              onPlaySong={song => executeJarvisCommand(`Play song ${song}`)}
              onGenerateHtml={topic => {
                setHtmlPrefill(topic);
                setActiveTab('HTML_BUILDER');
              }}
              onDownloadPdf={(title, content) => {
                const res = executeGenerateAndDownloadPdf(title, content);
                addLog('DOWNLOAD_PDF', title, 'SUCCESS', `Downloaded: ${res.filename}`);
                notifyUser(`PDF Downloaded: ${res.filename}`);
              }}
            />

            <TaskTerminal logs={logs} onClearLogs={() => setLogs([])} />
          </div>
        )}

        {/* View 3: COURSE ARCHITECT */}
        {activeTab === 'COURSES' && (
          <CourseMaker onNotify={notifyUser} />
        )}

        {/* View 4: PROMPT STUDIO */}
        {activeTab === 'PROMPTS' && (
          <PromptStudio
            onNotify={notifyUser}
            onUsePrompt={prompt => {
              setActiveTab('CORE');
              executeJarvisCommand(prompt);
            }}
          />
        )}

        {/* View 5: HTML APP BUILDER */}
        {activeTab === 'HTML_BUILDER' && (
          <HtmlAppBuilder
            onNotify={notifyUser}
            prefillTopic={htmlPrefill}
          />
        )}

      </main>

      {/* Persistent Background Assistant Floating Overlay */}
      <BackgroundAssistantOverlay
        isListening={isListening}
        isProcessing={isProcessing}
        isSpeaking={isSpeaking}
        lastTranscript={transcript}
        onToggleVoice={toggleVoiceListening}
        backgroundServiceActive={backgroundService}
        onToggleBackgroundService={() => setBackgroundService(!backgroundService)}
      />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="sci-fi-box w-full max-w-lg rounded-xl p-5 md:p-6 bg-jarvis-card border-2 border-jarvis-cyan text-jarvis-text shadow-cyan-glow animate-fadeIn">
            <div className="flex items-center justify-between border-b border-jarvis-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-jarvis-cyan animate-pulse" />
                <h3 className="font-orbitron text-sm md:text-base font-bold text-cyan-200">
                  SYSTEM SETTINGS & GEMINI API KEY
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-cyan-400 hover:text-cyan-100 p-1 rounded hover:bg-jarvis-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono-tech text-cyan-300 mb-1.5">
                  GEMINI PRO API KEY (جیمنائی پرو اے پی آئی کی)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="Enter AIzaSy... API Key"
                    className="w-full bg-jarvis-surface border border-jarvis-border px-3 py-2 rounded text-sm text-cyan-100 focus:outline-none focus:border-jarvis-cyan font-mono-tech pr-10"
                  />
                </div>
                <p className="text-[11px] text-cyan-400/80 mt-1.5">
                  Your provided key is automatically loaded and stored locally in secure browser storage.
                </p>
              </div>

              {/* Status indicator */}
              <div className="p-3 bg-jarvis-surface/90 rounded border border-jarvis-border flex items-center justify-between text-xs font-mono-tech">
                <span className="text-slate-300">KEY STATUS:</span>
                <span className="text-jarvis-green flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {apiKeyInput.trim() ? 'CONFIGURED & ACTIVE' : 'MISSING'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={async () => {
                    setIsTestingKey(true);
                    try {
                      setCustomApiKey(apiKeyInput.trim());
                      const reply = await askJarvisChat('System health check. Are all protocols online?');
                      notifyUser(`API Key Test SUCCESS: "${reply.slice(0, 45)}..."`);
                      jarvisAudio.playBeep(880, 0.2);
                    } catch (e: any) {
                      notifyUser(`Test Failed: ${e.message}`);
                    } finally {
                      setIsTestingKey(false);
                    }
                  }}
                  disabled={isTestingKey || !apiKeyInput.trim()}
                  className="flex-1 bg-jarvis-surface hover:bg-cyan-950 text-cyan-300 border border-cyan-600 font-orbitron font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-jarvis-cyan" />
                  <span>{isTestingKey ? 'TESTING...' : 'TEST API KEY'}</span>
                </button>

                <button
                  onClick={() => {
                    setCustomApiKey(apiKeyInput.trim());
                    notifyUser('Settings saved successfully!');
                    setIsSettingsOpen(false);
                  }}
                  className="flex-1 bg-jarvis-cyan hover:bg-cyan-300 text-black font-orbitron font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-all shadow-cyan-glow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>SAVE & CLOSE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-jarvis-border/60 bg-jarvis-surface/70 px-4 py-3 text-center text-xs font-mono-tech text-cyan-400/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-jarvis-cyan" />
          <span>JARVIS PROTOCOL 2026 • GEMINI-3.1-PRO INTEGRATED</span>
        </div>
        <div>
          <span>ALL ACTIONS AUTONOMOUS & REAL-TIME</span>
        </div>
      </footer>
    </div>
  );
}
