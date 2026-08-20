'use client';

import React from 'react';
import { Decision } from '@/types';
import { Zap, ShieldCheck, Cpu, Megaphone, ArrowRight } from 'lucide-react';

interface ConflictsViewProps {
  decisions: Decision[];
}

export default function ConflictsView({ decisions }: ConflictsViewProps) {
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Recent';
    if (timestamp.includes('T')) {
      const timePart = timestamp.split('T')[1]?.split('.')[0]?.replace('Z', '');
      if (timePart) return timePart;
    }
    return 'Recent';
  };

  if (decisions.length === 0) {
    return (
      <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl p-8 text-center space-y-3 shadow-2xl font-mono text-[#2c2621]">
        <Zap className="w-8 h-8 mx-auto text-amber-700 animate-pulse" />
        <h3 className="text-sm font-black uppercase">No Active Inter-Agent Conflicts</h3>
        <p className="text-xs text-[#6b5b52] max-w-md mx-auto">
          When agents propose conflicting trade-offs, the CEO Orchestrator evaluates the dispute and logs the binding executive decision here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl p-4 shadow-2xl space-y-4 font-mono text-[#2c2621]">
      <div className="flex items-center space-x-2.5 border-b-2 border-[#2c2621] pb-3">
        <div className="p-1.5 bg-[#f4ece1] border-2 border-[#2c2621] rounded text-[#8c3b00]">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-[#2c2621]">
            CONFLICT DETECTION & ARBITRATION SYSTEM
          </h2>
          <p className="text-[9px] text-[#6b5b52]">
            Inter-agent recommendation trade-offs and CEO resolution log
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {decisions.map((dec, i) => (
          <div
            key={dec.id || i}
            className="bg-[#f9f3eb] border-2 border-[#2c2621] rounded-xl p-4 space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-amber-400 text-[#2c2621] border border-[#2c2621] rounded text-[9px] font-black uppercase">
                <Zap className="w-3 h-3" />
                <span>CONFLICT ARBITRATION #{String(i + 1).padStart(3, '0')}</span>
              </span>
              <span className="text-[9px] text-[#6b5b52] font-bold" suppressHydrationWarning>
                {formatTimestamp(dec.created_at)}
              </span>
            </div>

            <h3 className="text-xs font-black text-[#2c2621]">{dec.title}</h3>

            {/* CEO Binding Decision Card */}
            <div className="bg-[#ebdcd0] border-2 border-[#2c2621] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  <span className="text-[10px] font-black uppercase">CEO Binding Resolution</span>
                </div>
                <span className="text-[8px] bg-[#2c2621] text-[#f4ece1] px-2 py-0.5 rounded font-black">
                  By {dec.made_by}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-black text-[#2c2621] flex items-start gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#8c3b00] shrink-0 mt-0.5" />
                  <span>Decision: {dec.decision}</span>
                </div>
                {dec.rationale && (
                  <div className="text-[10px] text-[#4a3e37] pl-5">
                    <strong>Rationale: </strong> {dec.rationale}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
