'use client';

import React, { useState } from 'react';
import { ActivityLog, Memory, Task, Decision } from '@/types';
import { Terminal, Pause, RefreshCw, Send, Activity, CheckSquare, Scale, BookOpen, Users } from 'lucide-react';

interface CommandCenterProps {
  logs: ActivityLog[];
  memories: Memory[];
  tasks: Task[];
  decisions: Decision[];
  reportContent: string | null;
  companyGoal: string;
  onSendPrompt?: (prompt: string) => void;
}

export default function CommandCenter({
  logs,
  memories,
  tasks,
  decisions,
  reportContent,
  onSendPrompt
}: CommandCenterProps) {
  const [activeTab, setActiveTab] = useState<'ACTIVITY' | 'TASKS' | 'DECISIONS' | 'MEMORY' | 'AGENTS'>('ACTIVITY');
  const [promptInput, setPromptInput] = useState('');

  const activeTask = tasks.find((t) => t.status === 'RUNNING') || tasks[tasks.length - 1] || {
    title: 'Review budget conflict between CTO and Finance.',
    status: 'IN REVIEW',
    priority: '↑↑'
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    if (onSendPrompt) {
      onSendPrompt(promptInput.trim());
    }
    setPromptInput('');
  };

  return (
    <div className="bg-[#f0e3d8] border-4 border-[#2c2621] rounded-lg p-3 shadow-2xl flex flex-col h-[540px] font-mono text-[#2c2621]">
      {/* 1. COMMAND CENTER HEADER */}
      <div className="flex items-center justify-between border-b-2 border-[#2c2621] pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#2c2621]" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#2c2621]">COMMAND CENTER</h2>
            <p className="text-[9px] text-[#6b5b52]">Live feed, updates, and decisions</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button type="button" className="px-2 py-0.5 bg-[#e4d3c3] hover:bg-[#d8c3b1] border border-[#2c2621] rounded text-[9px] font-bold flex items-center gap-1">
            <Pause className="w-2.5 h-2.5" /> PAUSE
          </button>
          <button type="button" className="px-2 py-0.5 bg-[#e4d3c3] hover:bg-[#d8c3b1] border border-[#2c2621] rounded text-[9px] font-bold flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5" /> CLEAR
          </button>
        </div>
      </div>

      {/* 2. TAB BUTTONS BAR */}
      <div className="grid grid-cols-5 gap-1 border-b-2 border-[#2c2621] pb-2 mb-2 text-[10px]">
        {[
          { id: 'ACTIVITY', label: 'ACTIVITY', icon: Activity },
          { id: 'TASKS', label: 'TASKS', icon: CheckSquare },
          { id: 'DECISIONS', label: 'DECISIONS', icon: Scale },
          { id: 'MEMORY', label: 'MEMORY', icon: BookOpen },
          { id: 'AGENTS', label: 'AGENTS', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center space-x-1 py-1 rounded border font-bold transition text-[9px] ${
                isActive
                  ? 'bg-[#2c2621] text-[#f4ece1] border-[#2c2621] shadow'
                  : 'bg-[#e4d3c3] text-[#2c2621] border-[#8c7b70] hover:bg-[#d8c3b1]'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT BOX */}
      <div className="flex-1 bg-[#f9f3eb] border-2 border-[#2c2621] rounded p-2.5 overflow-y-auto mb-2 font-mono text-[10px] space-y-1.5 shadow-inner">
        {activeTab === 'ACTIVITY' && (
          <div>
            <div className="text-[9px] font-black uppercase text-[#6b5b52] mb-1">LIVE ACTIVITY FEED</div>
            {logs.length === 0 ? (
              <div className="space-y-1 text-[#4a3e37]">
                <div>🔹 11:34:01 | CEO initialized the organization.</div>
                <div>🔹 11:34:03 | New goal received: Build an AI-powered internship platform for college students.</div>
                <div>🔹 11:34:07 | CEO is breaking down the objective...</div>
                <div>🔹 11:34:12 | Created 5 tasks and assigned to agents.</div>
              </div>
            ) : (
              logs.map((log) => {
                const timeStr = log.timestamp
                  ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : '11:34:01';
                return (
                  <div key={log.id} className="leading-relaxed">
                    <span className="text-[#3b5e40] font-bold">🔹 {timeStr}</span> | <span className="font-semibold">{log.message}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'TASKS' && (
          <div className="space-y-1.5">
            {tasks.map((t) => (
              <div key={t.id} className="border-b border-[#d8c3b1] pb-1">
                <div className="font-bold">{t.title}</div>
                <div className="text-[9px] text-[#6b5b52]">{t.assigned_agent} — Status: {t.status}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'DECISIONS' && (
          <div className="space-y-2">
            {decisions.map((d) => (
              <div key={d.id} className="bg-[#e4d3c3] p-1.5 rounded border border-[#2c2621]">
                <div className="font-bold text-[#8c3b00]">⚖️ {d.title}</div>
                <div className="text-[9px] font-semibold">{d.decision}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'MEMORY' && (
          <div className="space-y-1.5">
            {memories.map((m) => (
              <div key={m.id} className="border-b border-[#d8c3b1] pb-1">
                <span className="font-bold text-[#2c2621]">{m.key}:</span>{' '}
                <span className="text-[9px] text-[#4a3e37]">{typeof m.value === 'string' ? m.value.slice(0, 100) : JSON.stringify(m.value)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'AGENTS' && (
          <div className="space-y-1 font-semibold">
            <div>👑 CEO (Arnav Sharma) — Executive Lead</div>
            <div>🔬 RESEARCH (Meera Iyer) — Market Intel</div>
            <div>💻 CTO (Rohan Verma) — Architecture</div>
            <div>🚀 MARKETING (Isha Malhotra) — GTM</div>
            <div>👨‍🔧 FINANCE / DEV (Kabir Singh) — Engineering</div>
          </div>
        )}
      </div>

      {/* 4. CURRENT TASK BOX */}
      <div className="bg-[#e4d3c3] border-2 border-[#2c2621] rounded p-2 mb-2">
        <div className="text-[9px] font-black uppercase text-[#6b5b52] mb-0.5">CURRENT TASK</div>
        <p className="text-[10px] font-bold text-[#2c2621] truncate mb-1">
          {activeTask.title}
        </p>
        <div className="flex items-center justify-between text-[9px] font-bold">
          <span className="flex items-center gap-1">
            Status: <span className="bg-amber-400 text-[#2c2621] px-1 rounded">🟡 IN REVIEW</span>
          </span>
          <span className="text-amber-800">Priority: ↑↑</span>
        </div>
      </div>

      {/* 5. CEO COMMAND INPUT BAR */}
      <div className="bg-[#e4d3c3] border-2 border-[#2c2621] rounded p-1.5">
        <div className="text-[8px] font-black uppercase text-[#6b5b52] mb-1">CEO COMMAND INPUT</div>
        <form onSubmit={handleSend} className="flex gap-1.5">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Type command..."
            className="flex-1 bg-[#f9f3eb] border border-[#2c2621] rounded px-2 py-1 text-[10px] text-[#2c2621] placeholder-[#8c7b70] focus:outline-none font-mono"
          />
          <button
            type="submit"
            className="bg-[#2c2621] hover:bg-[#3d3630] text-[#f4ece1] px-2.5 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1 transition"
          >
            <span>EXECUTE</span>
            <span>&gt;</span>
          </button>
        </form>
      </div>
    </div>
  );
}
