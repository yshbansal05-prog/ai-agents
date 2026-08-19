'use client';

import React from 'react';
import { Agent, Task, Memory } from '@/types';
import { X, CheckCircle2, Clock, Cpu, ShieldCheck, ListTodo, Database } from 'lucide-react';
import { sound } from '@/utils/sound';

interface AgentDrawerProps {
  agent: Agent | null;
  onClose: () => void;
  tasks: Task[];
  memories: Memory[];
}

export default function AgentDrawer({ agent, onClose, tasks, memories }: AgentDrawerProps) {
  if (!agent) return null;

  const agentTasks = tasks.filter(
    (t) =>
      t.assigned_agent.toLowerCase().includes(agent.name.toLowerCase()) ||
      agent.name.toLowerCase().includes(t.assigned_agent.toLowerCase()) ||
      t.assigned_agent.toLowerCase().includes(agent.role.toLowerCase())
  );

  const agentMemories = memories.filter(
    (m) =>
      m.agent_name.toLowerCase().includes(agent.name.toLowerCase()) ||
      agent.name.toLowerCase().includes(m.agent_name.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WORKING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-orange-500 text-white animate-pulse border border-[#2c2621]">
            <Cpu className="w-3 h-3 animate-spin" /> WORKING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white border border-[#2c2621]">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-[#2c2621] border border-[#2c2621]">
            <Clock className="w-3 h-3" /> IN REVIEW / IDLE
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#ebdcd0] border-l-4 border-[#2c2621] shadow-2xl z-50 flex flex-col font-mono text-[#2c2621] select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-[#2c2621] bg-[#e4d3c3] p-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg flex items-center justify-center text-xl shadow">
            {agent.role.includes('CEO') ? '👨‍💼' :
             agent.role.includes('Research') || agent.name.includes('Meera') ? '👩‍🔬' :
             agent.role.includes('CTO') || agent.name.includes('Rohan') ? '👨‍💻' :
             agent.role.includes('Marketing') || agent.name.includes('Isha') ? '👩‍💼' : '👨‍🔧'}
          </div>
          <div>
            <h2 className="text-sm font-black text-[#2c2621] uppercase tracking-wider">{agent.name}</h2>
            <p className="text-[10px] text-[#6b5b52] font-bold">{agent.role}</p>
          </div>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="p-1 bg-[#f4ece1] hover:bg-[#d8c3b1] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-3.5 overflow-y-auto space-y-3.5 bg-[#f9f3eb] flex-1 text-xs">
        {/* Status & Objective */}
        <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#6b5b52]">CURRENT STATUS</span>
            {getStatusBadge(agent.status)}
          </div>
          <div className="border-t border-[#d8c3b1] pt-2 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#6b5b52]">PRIMARY OBJECTIVE</span>
            <p className="text-[11px] text-[#4a3e37] leading-relaxed">{agent.objective}</p>
          </div>
        </div>

        {/* Current Active Task */}
        {agent.current_task && (
          <div className="bg-[#e4d3c3] border-2 border-[#2c2621] rounded-lg p-2.5 space-y-1">
            <div className="text-[9px] font-black uppercase tracking-wider text-[#6b5b52] flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-[#8c3b00]" /> CURRENT ACTIVE TASK
            </div>
            <div className="text-[11px] font-bold text-[#2c2621]">
              {agent.current_task}
            </div>
          </div>
        )}

        {/* Capabilities */}
        <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 space-y-2 shadow-sm">
          <div className="text-[9px] font-black uppercase tracking-wider text-[#6b5b52] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" /> CAPABILITIES & TOOLS
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agent.capabilities.map((cap, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-[#e4d3c3] text-[#2c2621] border border-[#2c2621] rounded text-[9px] font-bold"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 space-y-2 shadow-sm">
          <div className="text-[9px] font-black uppercase tracking-wider text-[#6b5b52] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-amber-700" /> ASSIGNED TASKS ({agentTasks.length})
            </span>
          </div>

          <div className="space-y-2">
            {agentTasks.length === 0 ? (
              <p className="text-[10px] text-[#8c7b70] italic">No active task queue.</p>
            ) : (
              agentTasks.map((t) => (
                <div key={t.id} className="bg-[#f9f3eb] border border-[#2c2621] rounded p-2 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-[#2c2621] line-clamp-1">{t.title}</span>
                    <span
                      className={`text-[8px] font-black px-1 rounded uppercase ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-600 text-white'
                          : t.status === 'RUNNING'
                          ? 'bg-orange-500 text-white'
                          : 'bg-amber-400 text-[#2c2621]'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[9px] text-[#6b5b52]">{t.description}</p>
                  {t.result && (
                    <div className="text-[9px] text-emerald-800 bg-[#eef7ef] p-1 rounded border border-emerald-300 mt-1 font-semibold">
                      ✓ {t.result}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Memory Outputs */}
        <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 space-y-2 shadow-sm">
          <div className="text-[9px] font-black uppercase tracking-wider text-[#6b5b52] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-700" /> GENERATED MEMORY ARTIFACTS
          </div>

          <div className="space-y-2">
            {agentMemories.length === 0 ? (
              <p className="text-[10px] text-[#8c7b70] italic">No memory stored by this agent yet.</p>
            ) : (
              agentMemories.map((m) => (
                <div key={m.id} className="bg-[#f9f3eb] border border-[#2c2621] rounded p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#8c3b00]">{m.key}</span>
                    <span className="text-[8px] px-1 bg-[#2c2621] text-[#f4ece1] rounded uppercase font-bold">
                      {m.category}
                    </span>
                  </div>
                  <pre className="text-[9px] font-mono text-[#2c2621] bg-[#ebdcd0] p-1.5 rounded border border-[#d8c3b1] max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {typeof m.value === 'string' ? m.value : JSON.stringify(m.value, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
