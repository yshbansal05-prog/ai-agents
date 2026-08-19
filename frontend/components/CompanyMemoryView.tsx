'use client';

import React, { useState } from 'react';
import { Memory } from '@/types';
import { Database, Search, Code, Cpu, Megaphone, FileText, CheckSquare } from 'lucide-react';
import { sound } from '@/utils/sound';

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
    <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl p-4 shadow-2xl space-y-4 font-mono text-[#2c2621]">
      {/* Goal Header Card */}
      <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-xl p-3.5 space-y-1">
        <div className="flex items-center space-x-1.5 text-emerald-800">
          <Database className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider">Shared Memory Core Store</span>
        </div>
        <h3 className="text-sm font-black text-[#2c2621]">{companyGoal || 'No goal set'}</h3>
        <p className="text-[10px] text-[#6b5b52]">
          All agent insights, research datasets, technical architectures, and decisions are persisted in shared memory.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b-2 border-[#2c2621] pb-2.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = categoryFilter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => {
                sound.playClick();
                setCategoryFilter(cat.value);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded border-2 text-[10px] font-black transition cursor-pointer ${
                isActive
                  ? 'bg-[#2c2621] text-[#f4ece1] border-[#2c2621] shadow'
                  : 'bg-[#f4ece1] text-[#2c2621] border-[#8c7b70] hover:bg-[#e4d3c3]'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Memory Content Grid */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-10 text-[#6b5b52]">
          <FileText className="w-6 h-6 mx-auto mb-1.5 text-[#8c7b70]" />
          <p className="text-xs font-bold">No memory entries stored under category "{categoryFilter}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredMemories.map((mem) => (
            <div key={mem.id} className="bg-[#f9f3eb] border-2 border-[#2c2621] rounded-lg p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#8c3b00]">{mem.key}</span>
                <span className="text-[8px] px-1.5 py-0.2 bg-[#2c2621] text-[#f4ece1] rounded font-black uppercase">
                  {mem.agent_name}
                </span>
              </div>
              <pre className="text-[10px] font-mono text-[#2c2621] bg-[#ebdcd0] p-2 rounded border border-[#d8c3b1] max-h-40 overflow-y-auto whitespace-pre-wrap">
                {typeof mem.value === 'string' ? mem.value : JSON.stringify(mem.value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
