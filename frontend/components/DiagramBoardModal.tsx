'use client';

import React from 'react';
import { X, Network, ArrowRight, Database, ShieldCheck, Zap } from 'lucide-react';

interface DiagramBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiagramBoardModal({ isOpen, onClose }: DiagramBoardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-mono">
      <div className="w-full max-w-4xl bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-4 border-[#2c2621] bg-[#e4d3c3] p-3">
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-[#2c2621]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#2c2621]">
              SYSTEM ARCHITECTURE & MULTI-AGENT DATAFLOW
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-[#f4ece1] hover:bg-[#d8c3b1] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 bg-[#f9f3eb] text-[#2c2621]">
          {/* Top description */}
          <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded p-3 text-xs leading-relaxed">
            <p className="font-bold">
              💡 <strong>AI ORG OS Multi-Agent Graph Architecture:</strong> The executive orchestrator delegates concurrent sub-tasks across specialized agents, storing intermediate results in the shared Memory Core and invoking conflict resolution arbitration when constraints diverge.
            </p>
          </div>

          {/* Visual Flow Diagram */}
          <div className="bg-[#5f8b65]/20 border-2 border-[#2c2621] rounded-xl p-4 relative space-y-6">
            {/* Level 1: CEO */}
            <div className="flex flex-col items-center">
              <div className="bg-[#ebdcd0] border-2 border-[#2c2621] rounded-lg p-3 w-64 text-center shadow-lg">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-[#2c2621]">
                  <span>👑</span>
                  <span>CEO (Lead Orchestrator)</span>
                </div>
                <div className="text-[10px] text-[#6b5b52] font-semibold mt-1">
                  Goal Decomposition & Task Dispatch
                </div>
              </div>
              <div className="w-0.5 h-6 bg-[#2c2621]" />
            </div>

            {/* Level 2: 4 Specialized Agents */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { title: 'RESEARCH', name: 'Meera Iyer', icon: '👩‍🔬', desc: 'Market & Competitor Intel' },
                { title: 'CTO', name: 'Rohan Verma', icon: '👨‍💻', desc: 'Systems Architecture & Tech Stack' },
                { title: 'MARKETING', name: 'Isha Malhotra', icon: '👩‍💼', desc: 'GTM Strategy & Growth Loops' },
                { title: 'FINANCE / DEV', name: 'Kabir Singh', icon: '👨‍🔧', desc: 'Unit Economics & Infra Prototyping' }
              ].map((ag) => (
                <div key={ag.title} className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-2.5 shadow text-center flex flex-col justify-between">
                  <div>
                    <div className="text-xl mb-1">{ag.icon}</div>
                    <div className="text-[10px] font-black text-[#2c2621] uppercase">{ag.title}</div>
                    <div className="text-[9px] font-bold text-[#6b5b52]">{ag.name}</div>
                  </div>
                  <div className="text-[9px] text-[#4a3e37] mt-1.5 border-t border-[#d8c3b1] pt-1">
                    {ag.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Level 3: Arrow to Memory Core */}
            <div className="flex justify-center my-1">
              <ArrowRight className="w-5 h-5 text-[#2c2621] rotate-90" />
            </div>

            {/* Level 4: Shared Memory Core & Conflict Arbiter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#2e4c34] text-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 shadow">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400">
                  <Database className="w-4 h-4" />
                  <span>SHARED MEMORY CORE</span>
                </div>
                <p className="text-[10px] text-emerald-200 mt-1 leading-relaxed">
                  Persistent PostgreSQL & ChromaDB Vector Store holding market analysis, tech specs, marketing playbooks, and financials.
                </p>
              </div>

              <div className="bg-[#ebdcd0] border-2 border-[#2c2621] rounded-lg p-3 shadow">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-[#8c3b00]">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>CONFLICT ARBITRATION</span>
                </div>
                <p className="text-[10px] text-[#4a3e37] mt-1 leading-relaxed">
                  Automatic conflict detector that flags resource, budget, or architectural tradeoffs and prompts CEO executive resolution.
                </p>
              </div>
            </div>

            {/* Level 5: Final Deliverable */}
            <div className="flex flex-col items-center pt-2">
              <div className="w-0.5 h-4 bg-[#2c2621]" />
              <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-2.5 w-72 text-center shadow">
                <div className="text-xs font-black text-emerald-800 uppercase flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>FINAL EXECUTIVE DELIVERABLE</span>
                </div>
                <div className="text-[9px] text-[#4a3e37] mt-0.5">
                  Consolidated Go-To-Market Plan & Architecture Blueprint
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t-2 border-[#2c2621] bg-[#e4d3c3] p-2.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-[#2c2621] hover:bg-[#3d3630] text-[#f4ece1] rounded text-xs font-bold transition shadow cursor-pointer"
          >
            Close Diagram
          </button>
        </div>
      </div>
    </div>
  );
}
