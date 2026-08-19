'use client';

import React from 'react';
import { X, BarChart3, TrendingUp, Zap, Clock, Coins, CheckCircle, Award } from 'lucide-react';
import { Agent, Task } from '@/types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  tasks: Task[];
}

export default function StatsModal({ isOpen, onClose, agents, tasks }: StatsModalProps) {
  if (!isOpen) return null;

  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono">
      <div className="w-full max-w-2xl bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-4 border-[#2c2621] bg-[#e4d3c3] p-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#2c2621]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#2c2621]">
              ORGANIZATION ANALYTICS & PERFORMANCE METRICS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-[#f4ece1] hover:bg-[#d8c3b1] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4 bg-[#f9f3eb] text-[#2c2621]">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-2.5 text-center shadow">
              <div className="text-[9px] text-[#6b5b52] font-black uppercase">TASK THROUGHPUT</div>
              <div className="text-xl font-black text-emerald-800 mt-0.5">{completionRate}%</div>
              <div className="text-[8px] text-[#4a3e37]">{completedTasks}/{tasks.length} Done</div>
            </div>

            <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-2.5 text-center shadow">
              <div className="text-[9px] text-[#6b5b52] font-black uppercase">AVG DISPATCH TIME</div>
              <div className="text-xl font-black text-amber-800 mt-0.5">1.2s</div>
              <div className="text-[8px] text-[#4a3e37]">Sub-second SLA</div>
            </div>

            <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-2.5 text-center shadow">
              <div className="text-[9px] text-[#6b5b52] font-black uppercase">TOKEN CONSUMPTION</div>
              <div className="text-xl font-black text-indigo-800 mt-0.5">14.8k</div>
              <div className="text-[8px] text-[#4a3e37]">~$0.04 Est. Cost</div>
            </div>

            <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-2.5 text-center shadow">
              <div className="text-[9px] text-[#6b5b52] font-black uppercase">ACTIVE ROSTER</div>
              <div className="text-xl font-black text-purple-800 mt-0.5">5/5</div>
              <div className="text-[8px] text-[#4a3e37]">100% Operational</div>
            </div>
          </div>

          {/* Agent Workload Distribution */}
          <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 shadow space-y-2">
            <div className="text-xs font-black uppercase text-[#2c2621] flex items-center justify-between">
              <span>AGENT EFFICIENCY & WORKLOAD</span>
              <Award className="w-4 h-4 text-amber-700" />
            </div>

            <div className="space-y-2 pt-1">
              {agents.map((ag) => {
                const agentTasks = tasks.filter(
                  (t) =>
                    t.assigned_agent?.toLowerCase().includes(ag.name.toLowerCase()) ||
                    t.assigned_agent?.toLowerCase().includes(ag.role.toLowerCase())
                );
                const doneTasks = agentTasks.filter((t) => t.status === 'COMPLETED').length;
                const score =
                  agentTasks.length > 0
                    ? Math.round((doneTasks / agentTasks.length) * 40 + 60)
                    : ag.status === 'COMPLETED'
                    ? 98
                    : ag.status === 'WORKING'
                    ? 92
                    : 90;

                return (
                  <div key={ag.id} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>{ag.name} ({ag.role})</span>
                      <span className="text-[#6b5b52]">{score}% Score ({ag.status})</span>
                    </div>
                    <div className="w-full h-2 bg-[#d8c3b1] rounded-full overflow-hidden border border-[#2c2621]">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t-2 border-[#2c2621] bg-[#e4d3c3] p-2.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-[#2c2621] hover:bg-[#3d3630] text-[#f4ece1] rounded text-xs font-bold transition shadow cursor-pointer"
          >
            Close Stats
          </button>
        </div>
      </div>
    </div>
  );
}
