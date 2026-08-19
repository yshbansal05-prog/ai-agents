'use client';

import React, { useState } from 'react';
import { Memory } from '@/types';
import { Database, Search, Code, Cpu, Megaphone, FileText, CheckSquare } from 'lucide-react';

interface CompanyMemoryViewProps {
  memories: Memory[];
  companyGoal: string;
}

export default function CompanyMemoryView({ memories, companyGoal }: CompanyMemoryViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredMemories = memories.filter(
    (m) => categoryFilter === 'ALL' || m.category.toUpperCase() === categoryFilter
  );

  const categories = [
    { label: 'All Memory', value: 'ALL', icon: Database },
    { label: 'Research', value: 'RESEARCH', icon: Search },
    { label: 'Architecture', value: 'ARCHITECTURE', icon: Cpu },
    { label: 'Marketing', value: 'MARKETING', icon: Megaphone },
    { label: 'Code Snippets', value: 'CODE', icon: Code },
    { label: 'Decisions', value: 'DECISION', icon: CheckSquare }
  ];

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Goal Header Card */}
      <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/50 border border-indigo-800/40 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <Database className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Shared PostgreSQL Memory State</span>
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-1">{companyGoal || 'No goal set'}</h3>
        <p className="text-xs text-slate-400">
          All agent insights, research datasets, technical architectures, and decisions are persisted in shared PostgreSQL memory.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = categoryFilter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Memory Content Grid */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm">No memory entries stored under category "{categoryFilter}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => (
            <div key={mem.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 font-mono">{mem.key}</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold uppercase">
                  {mem.agent_name}
                </span>
              </div>
              <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {typeof mem.value === 'string' ? mem.value : JSON.stringify(mem.value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
