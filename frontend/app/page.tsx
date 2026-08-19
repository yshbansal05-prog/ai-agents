'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Agent, Task, Memory, Decision, ActivityLog, Company } from '@/types';
import PixelOffice from '@/components/PixelOffice';
import CommandCenter from '@/components/CommandCenter';
import AgentDock from '@/components/AgentDock';
import OrgGraph from '@/components/OrgGraph';
import AgentDrawer from '@/components/AgentDrawer';
import ActivityFeed from '@/components/ActivityFeed';
import CompanyMemoryView from '@/components/CompanyMemoryView';
import ConflictsView from '@/components/ConflictsView';
import FinalReportView from '@/components/FinalReportView';
import { BarChart3, Settings, X, GitFork, Gamepad2, Cpu, Activity, Database, Zap, FileText } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/company';

export default function Dashboard() {
  const [goalInput, setGoalInput] = useState<string>('Build an AI-powered internship platform for college students.');
  const [company, setCompany] = useState<Company | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [viewMode, setViewMode] = useState<'PIXEL_OFFICE' | 'GRAPH'>('PIXEL_OFFICE');
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'ACTIVITY' | 'MEMORY' | 'CONFLICTS' | 'REPORT'>('GRAPH');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const sseRef = useRef<EventSource | null>(null);

  // Fetch initial company datasets
  const fetchAllData = async (companyId: string) => {
    try {
      const [compRes, agRes, taskRes, memRes, decRes, actRes] = await Promise.all([
        fetch(`${API_BASE}/${companyId}`).then((r) => r.json()),
        fetch(`${API_BASE}/${companyId}/agents`).then((r) => r.json()),
        fetch(`${API_BASE}/${companyId}/tasks`).then((r) => r.json()),
        fetch(`${API_BASE}/${companyId}/memory`).then((r) => r.json()),
        fetch(`${API_BASE}/${companyId}/decisions`).then((r) => r.json()),
        fetch(`${API_BASE}/${companyId}/activity`).then((r) => r.json())
      ]);

      setCompany(compRes);
      setAgents(agRes);
      setTasks(taskRes);
      setMemories(memRes);
      setDecisions(decRes);
      setLogs(actRes);
    } catch (e) {
      console.error('Error fetching company state:', e);
    }
  };

  // Connect Server-Sent Events (SSE) stream
  const connectSSE = (companyId: string) => {
    if (sseRef.current) {
      sseRef.current.close();
    }

    const sse = new EventSource(`${API_BASE}/${companyId}/events`);
    sseRef.current = sse;

    const handleEvent = (data: any) => {
      if (data.event_type === 'agent_status') {
        setAgents((prev) =>
          prev.map((a) =>
            a.name.toLowerCase().includes(data.data.agent_name.toLowerCase()) ||
            data.data.agent_name.toLowerCase().includes(a.name.toLowerCase())
              ? { ...a, status: data.data.status, current_task: data.data.current_task }
              : a
          )
        );
      } else if (data.event_type === 'task_status') {
        setTasks((prev) => {
          const exists = prev.some((t) => t.title === data.data.title);
          if (exists) {
            return prev.map((t) => (t.title === data.data.title ? { ...t, status: data.data.status, result: data.data.result } : t));
          } else {
            return [...prev, data.data];
          }
        });
      } else if (data.event_type === 'activity_log') {
        setLogs((prev) => [...prev, data.data]);
      } else if (data.event_type === 'memory_added') {
        setMemories((prev) => [...prev, data.data]);
        if (data.data.key === 'FINAL_EXECUTIVE_REPORT') {
          setCompany((prev) => (prev ? { ...prev, final_report: data.data.value, status: 'COMPLETED' } : null));
          setIsRunning(false);
        }
      } else if (data.event_type === 'decision_made') {
        setDecisions((prev) => [...prev, data.data]);
      }
    };

    sse.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        handleEvent(payload);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    const eventTypes = ['agent_status', 'task_status', 'activity_log', 'memory_added', 'decision_made'];
    eventTypes.forEach((evtType) => {
      sse.addEventListener(evtType, (evt: MessageEvent) => {
        try {
          const payload = JSON.parse(evt.data);
          handleEvent(payload);
        } catch (err) {
          console.error(`SSE event [${evtType}] error:`, err);
        }
      });
    });
  };

  // Start Organization Workflow
  const handleStartOrganization = async (customPrompt?: string) => {
    const goalToUse = customPrompt || goalInput;
    if (!goalToUse.trim() || isRunning) return;
    setIsRunning(true);
    setCompany(null);
    setTasks([]);
    setMemories([]);
    setDecisions([]);
    setLogs([]);

    try {
      const createRes = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'AI Organization MVP',
          goal: goalToUse.trim()
        })
      }).then((r) => r.json());

      const companyId = createRes.company_id;
      await fetchAllData(companyId);
      connectSSE(companyId);
      await fetch(`${API_BASE}/${companyId}/run`, { method: 'POST' });
    } catch (e) {
      console.error('Failed to start organization:', e);
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4ece1] p-3 md:p-6 font-mono selection:bg-[#2c2621] selection:text-[#f4ece1] flex items-center justify-center">
      {/* WINDOW FRAME CONTAINER */}
      <div className="w-full max-w-7xl bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl shadow-2xl overflow-hidden flex flex-col space-y-3 p-3">
        {/* 1. TOP WINDOW TITLEBAR */}
        <div className="flex items-center justify-between border-b-4 border-[#2c2621] pb-2 px-2">
          {/* Traffic Dots & OS Title */}
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-[#2c2621]" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-[#2c2621]" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-[#2c2621]" />
            </div>
            <div className="text-xs font-black tracking-wider text-[#2c2621] uppercase">
              AI ORG OS <span className="text-[#8c7b70] text-[10px] font-bold">v1.0.0 - DEBUGGERS INC.</span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'PIXEL_OFFICE' ? 'GRAPH' : 'PIXEL_OFFICE')}
              className="px-2.5 py-1 bg-[#f4ece1] hover:bg-[#e8dbc9] border-2 border-[#2c2621] rounded text-[10px] font-bold flex items-center gap-1.5 shadow"
            >
              {viewMode === 'PIXEL_OFFICE' ? <GitFork className="w-3 h-3" /> : <Gamepad2 className="w-3 h-3" />}
              <span>{viewMode === 'PIXEL_OFFICE' ? 'Graph View' : 'Pixel Office'}</span>
            </button>
            <button className="p-1 bg-[#f4ece1] hover:bg-[#e8dbc9] border-2 border-[#2c2621] rounded text-[#2c2621] shadow">
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 bg-[#f4ece1] hover:bg-[#e8dbc9] border-2 border-[#2c2621] rounded text-[#2c2621] shadow">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 bg-[#f4ece1] hover:bg-[#e8dbc9] border-2 border-[#2c2621] rounded text-[#2c2621] shadow">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. MAIN WORKSPACE CONTENT */}
        {viewMode === 'PIXEL_OFFICE' ? (
          <div className="space-y-3">
            {/* GRID: 2D PIXEL OFFICE MAP + COMMAND CENTER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-7">
                <PixelOffice
                  agents={agents}
                  onSelectAgent={(agent) => setSelectedAgent(agent)}
                  selectedAgentId={selectedAgent?.id}
                  companyStatus={company?.status || 'RUNNING'}
                  hasDecision={decisions.length > 0}
                  hasReport={!!company?.final_report}
                />
              </div>

              <div className="lg:col-span-5">
                <CommandCenter
                  logs={logs}
                  memories={memories}
                  tasks={tasks}
                  decisions={decisions}
                  reportContent={company?.final_report || null}
                  companyGoal={company?.goal || goalInput}
                  onSendPrompt={(prompt) => handleStartOrganization(prompt)}
                />
              </div>
            </div>

            {/* BOTTOM DOCK: 5 AGENT AVATAR CARDS */}
            <AgentDock
              agents={agents}
              onSelectAgent={(agent) => setSelectedAgent(agent)}
              selectedAgentId={selectedAgent?.id}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* TOP TAB BAR FOR NODE GRAPH */}
            <div className="flex border-b-2 border-[#2c2621] gap-2 overflow-x-auto pb-1">
              {[
                { id: 'GRAPH', label: 'Organization Graph', icon: Cpu },
                { id: 'ACTIVITY', label: 'Activity Feed', icon: Activity },
                { id: 'MEMORY', label: 'Memory Core', icon: Database },
                { id: 'CONFLICTS', label: 'Conflicts & Decisions', icon: Zap },
                { id: 'REPORT', label: 'Final Report', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-t text-xs font-extrabold border-2 transition ${
                      isActive
                        ? 'bg-[#2c2621] text-[#f4ece1] border-[#2c2621]'
                        : 'bg-[#f4ece1] text-[#2c2621] border-[#8c7b70] hover:bg-[#e4d3c3]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'GRAPH' && (
              <OrgGraph
                agents={agents}
                onSelectAgent={(agent) => setSelectedAgent(agent)}
                selectedAgentId={selectedAgent?.id}
                companyStatus={company?.status || 'RUNNING'}
                hasDecision={decisions.length > 0}
                hasReport={!!company?.final_report}
              />
            )}

            {activeTab === 'ACTIVITY' && <ActivityFeed logs={logs} />}

            {activeTab === 'MEMORY' && (
              <CompanyMemoryView memories={memories} companyGoal={company?.goal || goalInput} />
            )}

            {activeTab === 'CONFLICTS' && <ConflictsView decisions={decisions} />}

            {activeTab === 'REPORT' && (
              <FinalReportView
                reportContent={company?.final_report || null}
                companyGoal={company?.goal || goalInput}
              />
            )}
          </div>
        )}
      </div>

      {/* AGENT DETAILS DRAWER */}
      <AgentDrawer
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        tasks={tasks}
        memories={memories}
      />
    </main>
  );
}
