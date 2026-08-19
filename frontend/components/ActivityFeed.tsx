'use client';

import React from 'react';
import { ActivityLog } from '@/types';
import { Activity, CheckCircle2, AlertTriangle, Info, Zap } from 'lucide-react';

interface ActivityFeedProps {
  logs: ActivityLog[];
}

export default function ActivityFeed({ logs }: ActivityFeedProps) {
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />;
      case 'CONFLICT':
        return <Zap className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 animate-pulse" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />;
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-[#4a3e37] shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl p-4 shadow-2xl space-y-3.5 max-h-[600px] overflow-y-auto font-mono text-[#2c2621]">
      <div className="flex items-center justify-between border-b-2 border-[#2c2621] pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#2c2621]" />
          <h2 className="text-xs font-black uppercase tracking-wider text-[#2c2621]">
            LIVE ORGANIZATION ACTIVITY TIMELINE
          </h2>
        </div>
        <span className="text-[9px] bg-[#f4ece1] text-[#2c2621] border border-[#2c2621] px-2 py-0.5 rounded font-black uppercase">
          Realtime Stream
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-10 text-[#6b5b52] space-y-2">
          <Activity className="w-6 h-6 mx-auto text-[#8c7b70] animate-pulse" />
          <p className="text-xs font-bold">Awaiting organization tasks...</p>
        </div>
      ) : (
        <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2c2621]">
          {logs.map((log) => {
            const timeStr = log.timestamp
              ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '11:34:01';

            return (
              <div key={log.id} className="relative flex items-start space-x-2.5">
                <div className="absolute -left-5 top-1 p-0.5 bg-[#f4ece1] border border-[#2c2621] rounded-full">
                  {getLevelBadge(log.level)}
                </div>

                <div className="flex-1 bg-[#f9f3eb] border-2 border-[#2c2621] rounded-lg p-2.5 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-[#8c3b00] uppercase tracking-wider">{log.agent_name}</span>
                    <span className="text-[9px] font-bold text-[#6b5b52]">{timeStr}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${
                    log.level === 'CONFLICT' ? 'text-amber-950 font-black' :
                    log.level === 'SUCCESS' ? 'text-emerald-950 font-bold' : 'text-[#2c2621]'
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
