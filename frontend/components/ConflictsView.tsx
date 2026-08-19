'use client';

import React from 'react';
import { Decision } from '@/types';
import { Zap, ShieldCheck, Cpu, Megaphone, ArrowRight } from 'lucide-react';

interface ConflictsViewProps {
  decisions: Decision[];
}

export default function ConflictsView({ decisions }: ConflictsViewProps) {
  if (decisions.length === 0) {
    return (
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-8 text-center space-y-3 shadow-2xl">
        <Zap className="w-10 h-10 mx-auto text-amber-500/60 animate-pulse" />
        <h3 className="text-lg font-bold text-slate-200">No Inter-Agent Conflicts Logged Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          When agents propose conflicting trade-offs (e.g., CTO technical depth vs. Marketing rapid launch), the CEO Orchestrator evaluates the dispute and logs the binding executive decision here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Conflict Detection & Decision System</h2>
          <p className="text-xs text-slate-400">
            Real-time inter-agent recommendation disputes and CEO resolution log
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {decisions.map((dec, i) => {
          const ctoInput = dec.context?.cto_input || "Robust PostgreSQL schema with deep relational constraints";
          const mktInput = dec.context?.marketing_input || "Aggressive 2-week MVP launch speed over infrastructure scale";

          return (
            <div
              key={dec.id || i}
              className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden"
            >
              {/* Conflict Header Tag */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Zap className="w-3.5 h-3.5" />
                  <span>CONFLICT DETECTED #{String(i + 1).padStart(3, '0')}</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {dec.created_at ? new Date(dec.created_at).toLocaleTimeString() : 'Recent'}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100">{dec.title}</h3>

              {/* Opposing Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CTO side */}
                <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Cpu className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Strategy / CTO Recommendation</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-2.5 rounded border border-slate-800">
                    "{ctoInput}"
                  </p>
                </div>

                {/* Marketing side */}
                <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-purple-400">
                    <Megaphone className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Marketing Recommendation</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-2.5 rounded border border-slate-800">
                    "{mktInput}"
                  </p>
                </div>
              </div>

              {/* CEO Binding Decision */}
              <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/50 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-indigo-300">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">CEO Binding Resolution</span>
                  </div>
                  <span className="text-[11px] bg-indigo-900/60 text-indigo-200 px-2.5 py-0.5 rounded font-semibold border border-indigo-700/50">
                    Made by {dec.made_by}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-bold text-white flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                    <span>Decision: {dec.decision}</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed pl-6">
                    <strong className="text-indigo-300">Rationale: </strong>
                    {dec.rationale}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
