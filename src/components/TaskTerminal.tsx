import React from 'react';
import { Terminal, CheckCircle2, Clock, AlertTriangle, Play, Trash2 } from 'lucide-react';
import { TaskLog } from '../types';

interface TaskTerminalProps {
  logs: TaskLog[];
  onClearLogs: () => void;
}

export const TaskTerminal: React.FC<TaskTerminalProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="sci-fi-box rounded-xl p-4 md:p-5 text-jarvis-text">
      <div className="flex items-center justify-between border-b border-jarvis-border pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-jarvis-cyan" />
          <h3 className="font-orbitron text-xs md:text-sm font-bold tracking-wider text-cyan-200">
            AUTONOMOUS TASK TERMINAL (رئیل ٹائم لاگز)
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono-tech text-cyan-400">
            ACTIVE LOGS: {logs.length}
          </span>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-cyan-500 hover:text-red-400 transition-colors p-1"
              title="Clear terminal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 font-mono-tech text-xs">
        {logs.length === 0 ? (
          <div className="text-center py-6 text-cyan-700/80 italic">
            &gt; Standby mode. Speak or type a command to initialize autonomous execution...
          </div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className="p-2 rounded bg-jarvis-surface/80 border border-jarvis-border/60 flex items-start justify-between gap-2"
            >
              <div className="flex items-start gap-2">
                {log.status === 'SUCCESS' && <CheckCircle2 className="w-3.5 h-3.5 text-jarvis-green mt-0.5 flex-shrink-0" />}
                {log.status === 'EXECUTING' && <Play className="w-3.5 h-3.5 text-jarvis-amber mt-0.5 flex-shrink-0 animate-pulse" />}
                {log.status === 'PENDING' && <Clock className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />}
                {log.status === 'FAILED' && <AlertTriangle className="w-3.5 h-3.5 text-jarvis-red mt-0.5 flex-shrink-0" />}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-jarvis-cyan font-bold">[{log.action}]</span>
                    <span className="text-slate-200">{log.command}</span>
                  </div>
                  <div className="text-[11px] text-cyan-300/80 mt-0.5">{log.details}</div>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                {log.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
