'use client';

import React from 'react';
import { ActivityLog } from '@/types';
import { Activity, CheckCircle2, AlertTriangle, Info, Zap, ShieldCheck } from 'lucide-react';

interface ActivityFeedProps {
  logs: ActivityLog[];
}

export default function ActivityFeed({ logs }: ActivityFeedProps) {
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'CONFLICT':
        return <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[620px] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-100">Live Organization Activity Timeline</h2>
        </div>
        <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full font-mono font-semibold">
          Realtime SSE Stream
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500 space-y-2">
          <Activity className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
          <p className="text-sm">Awaiting Organization Goal to start execution...</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {logs.map((log) => {
            const timeStr = log.timestamp
              ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '';

            return (
              <div key={log.id} className="relative flex items-start space-x-3 group">
                <div className="absolute -left-6 top-1.5 p-1 bg-slate-900 border border-slate-800 rounded-full">
                  {getLevelBadge(log.level)}
                </div>

                <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-300 tracking-wide">{log.agent_name}</span>
                    <span className="text-[11px] font-mono text-slate-500">{timeStr}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    log.level === 'CONFLICT' ? 'text-amber-300 font-semibold' :
                    log.level === 'SUCCESS' ? 'text-emerald-200' : 'text-slate-300'
                  }`}>
                    {log.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
