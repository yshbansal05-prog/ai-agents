'use client';

import React, { useState } from 'react';
import { X, Database, Search, Copy, Check } from 'lucide-react';
import { Memory } from '@/types';

interface MemoryCoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
}

export default function MemoryCoreModal({ isOpen, onClose, memories }: MemoryCoreModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'RESEARCH', 'ARCHITECTURE', 'MARKETING', 'CODE', 'DECISION'];

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(m.value).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-mono">
      <div className="w-full max-w-4xl bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-4 border-[#2c2621] bg-[#e4d3c3] p-3">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-800" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#2c2621]">
                MEMORY CORE // RACK #01 & RACK #02 INSPECTOR
              </span>
              <p className="text-[9px] text-[#6b5b52]">Persistent Knowledge Base & Semantic Vector Layer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-[#f4ece1] hover:bg-[#d8c3b1] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Server Rack Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-[#2e4c34] text-[#f4ece1] border-b-2 border-[#2c2621]">
          <div className="bg-[#1e3423] p-2 rounded border border-[#3b5e40]">
            <div className="text-[8px] text-emerald-400 font-bold uppercase">RACK #01 STATUS</div>
            <div className="text-xs font-black flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE (99.98%)
            </div>
          </div>
          <div className="bg-[#1e3423] p-2 rounded border border-[#3b5e40]">
            <div className="text-[8px] text-emerald-400 font-bold uppercase">RACK #02 STATUS</div>
            <div className="text-xs font-black flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              CACHE HOT (4.2 MB)
            </div>
          </div>
          <div className="bg-[#1e3423] p-2 rounded border border-[#3b5e40]">
            <div className="text-[8px] text-emerald-400 font-bold uppercase">STORED ENTRIES</div>
            <div className="text-xs font-black mt-0.5">{memories.length} Artifacts</div>
          </div>
          <div className="bg-[#1e3423] p-2 rounded border border-[#3b5e40]">
            <div className="text-[8px] text-emerald-400 font-bold uppercase">LATENCY</div>
            <div className="text-xs font-black mt-0.5 text-emerald-300">12ms (p99)</div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-3 bg-[#f4ece1] border-b-2 border-[#2c2621] flex flex-wrap gap-2 items-center justify-between">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b5b52]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search memory keys, content, or agents..."
              className="w-full bg-[#f9f3eb] border-2 border-[#2c2621] rounded pl-8 pr-2 py-1 text-xs text-[#2c2621] placeholder-[#8c7b70] focus:outline-none"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 text-[9px] font-bold rounded border transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2c2621] text-[#f4ece1] border-[#2c2621]'
                    : 'bg-[#e4d3c3] text-[#2c2621] border-[#8c7b70] hover:bg-[#d8c3b1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Memory Content List */}
        <div className="p-4 overflow-y-auto space-y-3 bg-[#f9f3eb] flex-1">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#6b5b52] italic">
              No memory artifacts matching criteria.
            </div>
          ) : (
            filteredMemories.map((m) => {
              const formattedValue =
                typeof m.value === 'string' ? m.value : JSON.stringify(m.value, null, 2);

              return (
                <div key={m.id} className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 shadow-sm space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-[#8c3b00]">{m.key}</span>
                      <span className="text-[9px] bg-[#2c2621] text-[#f4ece1] px-1.5 py-0.5 rounded font-bold uppercase">
                        {m.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-[#6b5b52]">
                      <span>By: {m.agent_name}</span>
                      <button
                        onClick={() => handleCopy(m.id, formattedValue)}
                        className="p-1 bg-[#e4d3c3] hover:bg-[#d8c3b1] border border-[#2c2621] rounded text-[#2c2621] flex items-center gap-1 cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                        <span className="text-[9px]">{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <pre className="text-[10px] font-mono text-[#2c2621] bg-[#ece2d5] p-2 rounded border border-[#d8c3b1] max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {formattedValue}
                  </pre>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t-2 border-[#2c2621] bg-[#e4d3c3] p-2.5 flex justify-between items-center text-xs">
          <span className="text-[10px] text-[#6b5b52] font-semibold">
            Showing {filteredMemories.length} of {memories.length} entries
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-[#2c2621] hover:bg-[#3d3630] text-[#f4ece1] rounded text-xs font-bold transition shadow cursor-pointer"
          >
            Close Core
          </button>
        </div>
      </div>
    </div>
  );
}
