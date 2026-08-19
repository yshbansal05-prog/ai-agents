'use client';

import React from 'react';
import { Agent, Task, Memory } from '@/types';
import { X, Bot, CheckCircle2, Clock, Cpu, ShieldCheck, ListTodo, Database, MessageSquare } from 'lucide-react';

interface AgentDrawerProps {
  agent: Agent | null;
  onClose: () => void;
  tasks: Task[];
  memories: Memory[];
}

export default function AgentDrawer({ agent, onClose, tasks, memories }: AgentDrawerProps) {
  if (!agent) return null;

  const agentTasks = tasks.filter(
    (t) => t.assigned_agent.toLowerCase().includes(agent.name.toLowerCase()) ||
           agent.name.toLowerCase().includes(t.assigned_agent.toLowerCase())
  );

  const agentMemories = memories.filter(
    (m) => m.agent_name.toLowerCase().includes(agent.name.toLowerCase()) ||
           agent.name.toLowerCase().includes(m.agent_name.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WORKING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
            <Cpu className="w-3.5 h-3.5 animate-spin" /> Working
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600">
            <Clock className="w-3.5 h-3.5" /> Waiting
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-50 flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{agent.name}</h2>
            <p className="text-xs text-indigo-300 font-medium">{agent.role}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status & Objective */}
      <div className="space-y-6">
        <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Status</span>
            {getStatusBadge(agent.status)}
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Objective</span>
            <p className="text-sm text-slate-300 leading-relaxed">{agent.objective}</p>
          </div>
        </div>

        {/* Current Active Task */}
        {agent.current_task && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> Current Active Task
            </h3>
            <div className="bg-indigo-950/30 border border-indigo-800/40 p-3.5 rounded-xl text-sm text-indigo-200">
              {agent.current_task}
            </div>
          </div>
        )}

        {/* Capabilities */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Capabilities & Tools
          </h3>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((cap, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Assigned Tasks */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-amber-400" /> Assigned Tasks ({agentTasks.length})
          </h3>
          <div className="space-y-3">
            {agentTasks.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No task assigned yet.</p>
            ) : (
              agentTasks.map((t) => (
                <div key={t.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-200">{t.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      t.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                      t.status === 'RUNNING' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{t.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Memory Outputs */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" /> Generated Artifacts & Memory Outputs
          </h3>
          <div className="space-y-3">
            {agentMemories.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No output stored in company memory yet.</p>
            ) : (
              agentMemories.map((m) => (
                <div key={m.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">{m.key}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase font-semibold">
                      {m.category}
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 max-h-40 overflow-y-auto whitespace-pre-wrap">
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
