'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ActivityLog, Memory, Task, Decision, Agent, TreasurySummary } from '@/types';
import { sound } from '@/utils/sound';
import { Terminal, Pause, Play, Trash2, Activity, CheckSquare, Scale, BookOpen, Users, Sparkles, Send, Coins, FileText } from 'lucide-react';
import TreasuryPanel from './TreasuryPanel';
import ExecutiveReportModal from './ExecutiveReportModal';

interface CommandCenterProps {
  logs: ActivityLog[];
  memories: Memory[];
  tasks: Task[];
  decisions: Decision[];
  agents?: Agent[];
  treasury?: TreasurySummary | null;
  reportContent: string | null;
  companyGoal: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onClearLogs: () => void;
  onSendPrompt?: (prompt: string) => void;
  onSelectAgent?: (agent: Agent) => void;
  onRefreshTreasury?: () => void;
}

export default function CommandCenter({
  logs,
  memories,
  tasks,
  decisions,
  agents = [],
  treasury,
  reportContent,
  companyGoal = 'AI Organization Objective',
  isPaused,
  onTogglePause,
  onClearLogs,
  onSendPrompt,
  onSelectAgent,
  onRefreshTreasury
}: CommandCenterProps) {
  const [activeTab, setActiveTab] = useState<'ACTIVITY' | 'TASKS' | 'DECISIONS' | 'MEMORY' | 'AGENTS' | 'TREASURY' | 'REPORT'>('ACTIVITY');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const logScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs when new entries arrive and not paused
  useEffect(() => {
    if (!isPaused && logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [logs, isPaused, activeTab]);

  const activeTask =
    tasks.find((t) => t.status === 'RUNNING') ||
    tasks.find((t) => t.title.toLowerCase().includes('budget') || t.title.toLowerCase().includes('conflict')) ||
    tasks[tasks.length - 1] || {
      title: 'Review budget conflict between CTO and Finance.',
      status: 'IN REVIEW',
      priority: '↑↑'
    };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    sound.playExecute();
    if (onSendPrompt) {
      onSendPrompt(promptInput.trim());
    }
    setPromptInput('');
  };

  const presetPrompts = [
    'Scale campus ambassador program to 50 universities',
    'Resolve budget dispute between CTO and Finance',
    'Deploy Next.js & FastAPI backend to AWS ECS',
    'Generate comprehensive executive launch plan'
  ];

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '11:34:01';
    if (timestamp.includes('T')) {
      const timePart = timestamp.split('T')[1]?.split('.')[0]?.replace('Z', '');
      if (timePart) return timePart;
    }
    return '11:34:01';
  };

  return (
    <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-lg p-2.5 shadow-2xl flex flex-col h-[530px] font-mono text-[#2c2621] select-none">
      {/* 1. COMMAND CENTER HEADER */}
      <div className="flex items-center justify-between border-b-2 border-[#2c2621] pb-1.5 mb-2">
        <div className="flex items-center space-x-1.5">
          <Terminal className="w-4 h-4 text-[#2c2621]" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#2c2621] leading-none">
              &gt;_ COMMAND CENTER
            </h2>
            <p className="text-[8px] text-[#6b5b52] font-bold mt-0.5">Live feed, updates, and decisions</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onTogglePause();
            }}
            className={`px-2 py-0.5 border-2 border-[#2c2621] rounded text-[8px] font-black uppercase flex items-center gap-1 transition cursor-pointer shadow-xs ${
              isPaused
                ? 'bg-amber-400 text-[#2c2621]'
                : 'bg-[#f4ece1] hover:bg-[#e4d3c3] text-[#2c2621]'
            }`}
          >
            {isPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClearLogs();
            }}
            className="px-2 py-0.5 bg-[#f4ece1] hover:bg-[#e4d3c3] border-2 border-[#2c2621] rounded text-[8px] font-black uppercase flex items-center gap-1 text-[#2c2621] transition cursor-pointer shadow-xs"
          >
            <Trash2 className="w-2.5 h-2.5" />
            <span>CLEAR</span>
          </button>
        </div>
      </div>

      {/* Celebration Banner when All Tasks Complete */}
      {reportContent && (
        <div className="bg-emerald-800/15 border-2 border-emerald-700/60 rounded p-1.5 mb-1.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs">🏆</span>
            <div>
              <div className="text-[8px] font-black uppercase text-emerald-950 leading-tight">
                ALL TASKS COMPLETED
              </div>
              <div className="text-[7px] text-emerald-800 font-semibold leading-tight">
                Executive Deliverable Report Ready
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playSuccess();
              setIsReportModalOpen(true);
            }}
            className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded border border-[#2c2621] text-[7.5px] font-black uppercase tracking-wider transition shadow cursor-pointer animate-pulse"
          >
            <FileText className="w-2.5 h-2.5" />
            <span>View PDF</span>
          </button>
        </div>
      )}

      {/* 2. TAB BUTTONS BAR */}
      <div className={`grid ${reportContent ? 'grid-cols-7' : 'grid-cols-6'} gap-1 border-b-2 border-[#2c2621] pb-1.5 mb-1.5`}>
        {[
          { id: 'ACTIVITY', label: 'ACTIVITY', icon: Activity },
          { id: 'TASKS', label: 'TASKS', icon: CheckSquare },
          { id: 'DECISIONS', label: 'DECISIONS', icon: Scale },
          { id: 'MEMORY', label: 'MEMORY', icon: BookOpen },
          { id: 'AGENTS', label: 'AGENTS', icon: Users },
          { id: 'TREASURY', label: 'TREASURY', icon: Coins },
          ...(reportContent ? [{ id: 'REPORT', label: 'REPORT', icon: FileText }] : [])
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center justify-center space-x-1 py-1 rounded border-2 font-black transition text-[8px] cursor-pointer ${
                isActive
                  ? 'bg-[#2c2621] text-[#f4ece1] border-[#2c2621] shadow'
                  : 'bg-[#f4ece1] text-[#2c2621] border-[#8c7b70] hover:bg-[#e8dacb]'
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT SCROLL BOX */}
      <div
        ref={logScrollRef}
        className="flex-1 bg-[#f9f3eb] border-2 border-[#2c2621] rounded p-2 overflow-y-auto mb-1.5 font-mono text-[9px] space-y-1 shadow-inner"
      >
        {/* Tab 1: ACTIVITY */}
        {activeTab === 'ACTIVITY' && (
          <div className="space-y-1">
            <div className="text-[8px] font-black uppercase text-[#6b5b52] border-b border-[#d8c3b1] pb-0.5 flex justify-between items-center">
              <span>LIVE ACTIVITY FEED</span>
              {isPaused && <span className="text-amber-800 font-bold">⏸ PAUSED</span>}
            </div>

            {logs.length === 0 ? (
              <div className="space-y-1 text-[#4a3e37] pt-1">
                <div>🔹 11:34:01 | CEO initialized the organization.</div>
                <div>🔹 11:34:03 | New goal received: Build an AI-powered internship platform for college students.</div>
                <div>🔹 11:34:07 | CEO is breaking down the objective...</div>
                <div>🔹 11:34:12 | Created 5 tasks and assigned to agents.</div>
              </div>
            ) : (
              logs.map((log) => {
                const timeStr = formatTimestamp(log.timestamp);

                return (
                  <div key={log.id} className="leading-tight py-0.5">
                    <span className="text-[#3b5e40] font-black" suppressHydrationWarning>🔹 {timeStr}</span>{' '}
                    <span className="text-[#8c7b70]">|</span>{' '}
                    <span
                      className={`font-semibold ${
                        log.level === 'WARNING' || log.level === 'CONFLICT'
                          ? 'text-amber-900 font-black'
                          : log.level === 'SUCCESS'
                          ? 'text-emerald-900 font-bold'
                          : 'text-[#2c2621]'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: TASKS */}
        {activeTab === 'TASKS' && (
          <div className="space-y-1.5">
            <div className="text-[8px] font-black uppercase text-[#6b5b52] border-b border-[#d8c3b1] pb-0.5">
              TASK QUEUE & STATUS ({tasks.length})
            </div>
            {tasks.map((t) => (
              <div key={t.id} className="bg-[#f4ece1] border border-[#2c2621] rounded p-1.5 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-black text-[#2c2621]">{t.title}</span>
                  <span
                    className={`text-[7px] font-black px-1 rounded uppercase ${
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
                <div className="text-[8px] text-[#6b5b52]">
                  Assigned: <span className="font-bold text-[#2c2621]">{t.assigned_agent}</span> • Priority: {t.priority}
                </div>
                {t.result && (
                  <div className="text-[8px] text-emerald-900 bg-[#eef7ef] p-1 rounded font-medium mt-1">
                    ✓ {t.result}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: DECISIONS */}
        {activeTab === 'DECISIONS' && (
          <div className="space-y-1.5">
            <div className="text-[8px] font-black uppercase text-[#6b5b52] border-b border-[#d8c3b1] pb-0.5">
              EXECUTIVE ARBITRATIONS & DECISIONS
            </div>
            {decisions.length === 0 ? (
              <div className="text-[#8c7b70] italic pt-2">No active conflict requiring decision.</div>
            ) : (
              decisions.map((d) => (
                <div key={d.id} className="bg-[#ebdcd0] border-2 border-[#2c2621] rounded p-1.5 space-y-1">
                  <div className="font-black text-[#8c3b00] flex items-center gap-1">
                    <span>⚖️</span>
                    <span>{d.title}</span>
                  </div>
                  <div className="text-[8px] font-bold text-[#2c2621] bg-[#f4ece1] p-1 rounded border border-[#d8c3b1]">
                    {d.decision}
                  </div>
                  {d.rationale && (
                    <div className="text-[8px] text-[#6b5b52]">
                      <strong>Rationale:</strong> {d.rationale}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: MEMORY */}
        {activeTab === 'MEMORY' && (
          <div className="space-y-1.5">
            <div className="text-[8px] font-black uppercase text-[#6b5b52] border-b border-[#d8c3b1] pb-0.5">
              COMPANY MEMORY STORE ({memories.length} ARTIFACTS)
            </div>
            {memories.map((m) => (
              <div key={m.id} className="bg-[#f4ece1] border border-[#2c2621] rounded p-1.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#8c3b00]">{m.key}</span>
                  <span className="text-[7px] px-1 bg-[#2c2621] text-[#f4ece1] rounded uppercase font-bold">
                    {m.category}
                  </span>
                </div>
                <div className="text-[8px] text-[#4a3e37]">
                  {typeof m.value === 'string'
                    ? m.value.slice(0, 120) + (m.value.length > 120 ? '...' : '')
                    : JSON.stringify(m.value)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: AGENTS */}
        {activeTab === 'AGENTS' && (
          <div className="space-y-1.5">
            <div className="text-[8px] font-black uppercase text-[#6b5b52] border-b border-[#d8c3b1] pb-0.5">
              ACTIVE AGENT SQUAD
            </div>
            {[
              { role: 'CEO', name: 'Arnav Sharma', title: 'Executive Lead', icon: '👨‍💼', status: 'IN REVIEW' },
              { role: 'RESEARCH', name: 'Meera Iyer', title: 'Market Intel', icon: '👩‍🔬', status: 'COMPLETED' },
              { role: 'CTO', name: 'Rohan Verma', title: 'Architecture', icon: '👨‍💻', status: 'IN REVIEW' },
              { role: 'MARKETING', name: 'Isha Malhotra', title: 'GTM Strategy', icon: '👩‍💼', status: 'WORKING' },
              { role: 'FINANCE / DEV', name: 'Kabir Singh', title: 'Unit Economics', icon: '👨‍🔧', status: 'COMPLETED' }
            ].map((ag) => {
              const live = agents.find((a) => a.name.toLowerCase().includes(ag.name.toLowerCase()) || a.role.toLowerCase().includes(ag.role.toLowerCase()));
              return (
                <div
                  key={ag.role}
                  onClick={() => live && onSelectAgent && onSelectAgent(live)}
                  className="bg-[#f4ece1] hover:bg-[#e4d3c3] border border-[#2c2621] rounded p-1.5 flex items-center justify-between cursor-pointer transition shadow-xs"
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm">{ag.icon}</span>
                    <div>
                      <div className="font-black text-[9px] text-[#2c2621] uppercase">{ag.role} ({ag.name})</div>
                      <div className="text-[7px] text-[#6b5b52]">{ag.title}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[7px] font-black px-1 rounded uppercase ${
                      ag.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white'
                        : ag.status === 'WORKING'
                        ? 'bg-orange-500 text-white'
                        : 'bg-amber-400 text-[#2c2621]'
                    }`}
                  >
                    ● {ag.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 6: TREASURY */}
        {activeTab === 'TREASURY' && (
          <TreasuryPanel treasury={treasury} onRefresh={onRefreshTreasury} />
        )}

        {/* Tab 7: REPORT */}
        {activeTab === 'REPORT' && (
          <div className="space-y-2 p-1">
            <div className="flex items-center justify-between border-b border-[#d8c3b1] pb-1">
              <span className="text-[8px] font-black uppercase text-[#6b5b52]">EXECUTIVE REPORT PREVIEW</span>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="text-[7.5px] px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold uppercase transition"
              >
                Open Fullscreen PDF
              </button>
            </div>
            <div className="bg-[#f4ece1] border border-[#2c2621] rounded p-2 text-[8px] whitespace-pre-wrap leading-relaxed max-h-[260px] overflow-y-auto font-mono text-[#2c2621]">
              {reportContent}
            </div>
          </div>
        )}
      </div>

      {/* 4. CURRENT TASK BOX (matching screenshot exactly) */}
      <div className="bg-[#e4d3c3] border-2 border-[#2c2621] rounded p-1.5 mb-1.5 shadow-xs">
        <div className="text-[8px] font-black uppercase text-[#6b5b52] mb-0.5">CURRENT TASK</div>
        <p className="text-[9px] font-black text-[#2c2621] truncate mb-1">
          {activeTask.title}
        </p>
        <div className="flex items-center justify-between text-[8px] font-black">
          <span className="flex items-center gap-1">
            Status: <span className="bg-amber-400 text-[#2c2621] px-1 py-0.2 rounded border border-[#2c2621]/30">🟡 IN REVIEW</span>
          </span>
          <span className="text-amber-900 font-black">Priority: ↑↑</span>
        </div>
      </div>

      {/* 5. CEO COMMAND INPUT BAR (matching screenshot) */}
      <div className="bg-[#e4d3c3] border-2 border-[#2c2621] rounded p-1.5 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8px] font-black uppercase text-[#6b5b52]">CEO COMMAND INPUT</span>
          <div className="flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-700" />
            <span className="text-[7px] text-[#6b5b52] font-bold">Auto-Dispatch</span>
          </div>
        </div>

        <form onSubmit={handleSend} className="flex gap-1">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Type command..."
            className="flex-1 bg-[#f9f3eb] border border-[#2c2621] rounded px-2 py-0.5 text-[9px] text-[#2c2621] placeholder-[#8c7b70] focus:outline-none font-mono"
          />
          <button
            type="submit"
            className="bg-[#2c2621] hover:bg-[#3d3630] text-[#f4ece1] px-2.5 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1 transition cursor-pointer shadow"
          >
            <span>EXECUTE</span>
            <span>&gt;</span>
          </button>
        </form>

        {/* Quick prompt suggestion pills */}
        <div className="flex gap-1 mt-1 overflow-x-auto pb-0.5">
          {presetPrompts.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPromptInput(preset);
                sound.playClick();
              }}
              className="text-[7px] bg-[#f4ece1] hover:bg-[#f9f3eb] border border-[#8c7b70] rounded px-1.5 py-0.2 text-[#4a3e37] whitespace-nowrap cursor-pointer transition font-medium"
            >
              + {preset.slice(0, 26)}...
            </button>
          ))}
        </div>
      </div>

      {/* Executive Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportContent={reportContent}
        companyGoal={companyGoal}
      />
    </div>
  );
}
