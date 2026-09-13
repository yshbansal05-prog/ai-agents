'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Agent, Task, Memory, Decision, ActivityLog, Company, TreasurySummary } from '@/types';
import PixelOffice from '@/components/PixelOffice';
import CommandCenter from '@/components/CommandCenter';
import AgentDock from '@/components/AgentDock';
import OrgGraph from '@/components/OrgGraph';
import AgentDrawer from '@/components/AgentDrawer';
import ActivityFeed from '@/components/ActivityFeed';
import CompanyMemoryView from '@/components/CompanyMemoryView';
import ConflictsView from '@/components/ConflictsView';
import FinalReportView from '@/components/FinalReportView';
import TreasuryPanel from '@/components/TreasuryPanel';
import DiagramBoardModal from '@/components/DiagramBoardModal';
import MemoryCoreModal from '@/components/MemoryCoreModal';
import StatsModal from '@/components/StatsModal';
import SettingsModal from '@/components/SettingsModal';
import ExecutiveReportModal from '@/components/ExecutiveReportModal';

import {
  INITIAL_COMPANY,
  INITIAL_AGENTS,
  INITIAL_TASKS,
  INITIAL_MEMORIES,
  INITIAL_DECISIONS,
  INITIAL_LOGS
} from '@/utils/initialState';
import { sound } from '@/utils/sound';
import { api, DEFAULT_API_BASE } from '@/utils/api';

import {
  BarChart3,
  Settings,
  X,
  GitFork,
  Gamepad2,
  Cpu,
  Activity,
  Database,
  Zap,
  FileText,
  Coins
} from 'lucide-react';

export default function Dashboard() {
  const [goalInput, setGoalInput] = useState<string>(INITIAL_COMPANY.goal);
  const [company, setCompany] = useState<Company>(INITIAL_COMPANY);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_DECISIONS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [treasury, setTreasury] = useState<TreasurySummary | null>(null);

  const [viewMode, setViewMode] = useState<'PIXEL_OFFICE' | 'GRAPH'>('PIXEL_OFFICE');
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'ACTIVITY' | 'MEMORY' | 'CONFLICTS' | 'REPORT' | 'TREASURY'>('GRAPH');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Modals state
  const [isDiagramOpen, setIsDiagramOpen] = useState<boolean>(false);
  const [isMemoryCoreOpen, setIsMemoryCoreOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Settings configuration
  const [apiBase, setApiBase] = useState<string>(DEFAULT_API_BASE);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Keep api service in sync with custom settings and load treasury
  const loadTreasury = async (companyId?: string) => {
    try {
      console.log('[TREASURY UI] fetching transactions');
      const data = await api.getTreasury(companyId);
      console.log('[TREASURY UI] response', data);
      setTreasury(data);
      console.log('[TREASURY UI] transactions loaded', data?.transactions?.length ?? 0);
    } catch (err) {
      console.warn('[TREASURY UI] Error loading treasury:', err);
    }
  };

  useEffect(() => {
    api.setBaseUrl(apiBase);
    loadTreasury();
  }, [apiBase]);

  const sseRef = useRef<EventSource | null>(null);
  const simulationTimers = useRef<NodeJS.Timeout[]>([]);

  const clearSimulationTimers = () => {
    simulationTimers.current.forEach((t) => clearTimeout(t));
    simulationTimers.current = [];
  };

  // Reset to initial baseline
  const handleResetOrg = () => {
    clearSimulationTimers();
    if (sseRef.current) sseRef.current.close();
    setCompany(INITIAL_COMPANY);
    setAgents(INITIAL_AGENTS);
    setTasks(INITIAL_TASKS);
    setMemories(INITIAL_MEMORIES);
    setDecisions(INITIAL_DECISIONS);
    setLogs(INITIAL_LOGS);
    loadTreasury();
    setIsRunning(false);
    setIsPaused(false);
    setSelectedAgent(null);
  };

  // Connect SSE for live backend
  const connectSSE = (companyId: string) => {
    if (sseRef.current) sseRef.current.close();
    try {
      const sse = new EventSource(api.getEventsUrl(companyId));
      sseRef.current = sse;

      const matchAgent = (a: Agent, targetName: string) => {
        const t = (targetName || '').toLowerCase();
        const n = (a.name || '').toLowerCase();
        const r = (a.role || '').toLowerCase();
        if (n.includes(t) || t.includes(n)) return true;
        if (r.includes(t) || t.includes(r)) return true;
        if (t.includes('ceo') && (r.includes('ceo') || n.includes('arnav'))) return true;
        if (t.includes('research') && (r.includes('intel') || r.includes('research') || n.includes('meera'))) return true;
        if (t.includes('cto') && (r.includes('cto') || r.includes('architect') || n.includes('rohan'))) return true;
        if (t.includes('marketing') && (r.includes('marketing') || r.includes('growth') || n.includes('isha'))) return true;
        if ((t.includes('dev') || t.includes('finance')) && (r.includes('dev') || r.includes('finance') || n.includes('kabir'))) return true;
        return false;
      };

      const handleEvent = (data: any) => {
        if (isPaused) return;

        if (data.event_type === 'agent_status') {
          sound.playTick();
          setAgents((prev) =>
            prev.map((a) =>
              matchAgent(a, data.data.agent_name)
                ? { ...a, status: data.data.status, current_task: data.data.current_task }
                : a
            )
          );
        } else if (data.event_type === 'task_status') {
          sound.playTick();
          setTasks((prev) => {
            const exists = prev.some((t) => t.title === data.data.title || (data.data.task_id && t.id === data.data.task_id));
            if (exists) {
              return prev.map((t) =>
                t.title === data.data.title || (data.data.task_id && t.id === data.data.task_id)
                  ? { ...t, status: data.data.status, result: data.data.result !== undefined ? data.data.result : t.result }
                  : t
              );
            } else {
              return [
                ...prev,
                {
                  id: data.data.task_id || `task-${Date.now()}`,
                  title: data.data.title,
                  description: data.data.description || '',
                  assigned_agent: data.data.assigned_agent || '',
                  status: data.data.status || 'PENDING',
                  priority: data.data.priority || 'MEDIUM',
                  dependencies: data.data.dependencies || [],
                  result: data.data.result
                }
              ];
            }
          });
        } else if (data.event_type === 'activity_log') {
          sound.playTick();
          setLogs((prev) => [...prev, data.data]);
        } else if (data.event_type === 'agent_message') {
          sound.playTick();
          setLogs((prev) => [
            ...prev,
            {
              id: data.data.id || `msg-${Date.now()}`,
              agent_name: data.data.sender_agent || 'Agent',
              message: `💬 [${data.data.sender_agent} -> ${data.data.recipient_agent}]: ${data.data.content}`,
              level: 'INFO',
              timestamp: data.data.timestamp || new Date().toISOString()
            }
          ]);
        } else if (data.event_type === 'memory_added') {
          setMemories((prev) => [...prev, data.data]);
          if (data.data.key === 'FINAL_EXECUTIVE_REPORT') {
            sound.playSuccess();
            setCompany((prev) => ({ ...prev, final_report: data.data.value, status: 'COMPLETED' }));
            setIsRunning(false);
            setIsReportModalOpen(true);
          }
        } else if (data.event_type === 'decision_made') {
          setDecisions((prev) => [...prev, data.data]);
        } else if (data.event_type === 'payment_requested') {
          sound.playTick();
          setLogs((prev) => [
            ...prev,
            {
              id: `pay-${Date.now()}`,
              agent_name: data.data.agent || 'Research Agent',
              message: `💰 [TREASURY] Payment Requested: $${data.data.amount} ${data.data.currency} for "${data.data.service}"`,
              level: 'INFO',
              timestamp: new Date().toISOString()
            }
          ]);
          loadTreasury(companyId);
        } else if (data.event_type === 'payment_approved') {
          sound.playTick();
          setLogs((prev) => [
            ...prev,
            {
              id: `pay-appr-${Date.now()}`,
              agent_name: 'CEO',
              message: `✓ [POLICY] Approved spending of $${data.data.amount} ${data.data.currency} for ${data.data.agent}`,
              level: 'SUCCESS',
              timestamp: new Date().toISOString()
            }
          ]);
          loadTreasury(companyId);
        } else if (data.event_type === 'payment_pending') {
          sound.playTick();
          setLogs((prev) => [
            ...prev,
            {
              id: `pay-pend-${Date.now()}`,
              agent_name: 'x402 Client',
              message: `⚡ [x402] Transmitting signed AVM payment payload to GoPlausible Facilitator...`,
              level: 'INFO',
              timestamp: new Date().toISOString()
            }
          ]);
          loadTreasury(companyId);
        } else if (data.event_type === 'payment_settled') {
          sound.playSuccess();
          setLogs((prev) => [
            ...prev,
            {
              id: `pay-settle-${Date.now()}`,
              agent_name: 'Algorand Testnet',
              message: `🔗 [x402 SETTLED] $${data.data.amount} ${data.data.currency} confirmed on Algorand Testnet via GoPlausible! Tx: ${
                data.data.tx_hash ? data.data.tx_hash.slice(0, 16) + '...' : 'settled'
              }`,
              level: 'SUCCESS',
              timestamp: new Date().toISOString()
            }
          ]);
          loadTreasury(companyId);
        } else if (data.event_type === 'payment_failed') {
          setLogs((prev) => [
            ...prev,
            {
              id: `pay-fail-${Date.now()}`,
              agent_name: 'Treasury',
              message: `⚠️ [x402] Payment failed: ${data.data.error || 'facilitator error'}`,
              level: 'CONFLICT',
              timestamp: new Date().toISOString()
            }
          ]);
          loadTreasury(companyId);
        }
      };

      const eventTypes = [
        'agent_status',
        'task_status',
        'activity_log',
        'memory_added',
        'decision_made',
        'agent_message',
        'payment_requested',
        'payment_approved',
        'payment_pending',
        'payment_settled',
        'payment_failed'
      ];
      eventTypes.forEach((evtType) => {
        sse.addEventListener(evtType, (evt: MessageEvent) => {
          try {
            const payload = JSON.parse(evt.data);
            handleEvent(payload);
          } catch (err) {
            console.error(`SSE event [${evtType}] parse error:`, err);
          }
        });
      });
    } catch (e) {
      console.warn('Backend SSE unavailable, fallback simulation active:', e);
    }
  };

  // Run simulated step-by-step pipeline when offline or testing
  const runSimulatedPipeline = (customGoal: string) => {
    clearSimulationTimers();
    setIsRunning(true);

    const goalToUse = customGoal.trim();
    setCompany({
      id: `comp-${Date.now()}`,
      name: 'AI ORG OS V1.0.0 - DEBUGGERS INC.',
      goal: goalToUse,
      status: 'IN_PROGRESS',
      created_at: new Date().toISOString()
    });

    // Reset initial activity for new goal
    const startTime = new Date();
    const formatTime = (offsetSec: number) => {
      const d = new Date(startTime.getTime() + offsetSec * 1000);
      return d.toISOString();
    };

    setLogs([
      {
        id: `log-${Date.now()}-1`,
        agent_name: 'CEO',
        message: `CEO accepted new objective: "${goalToUse.slice(0, 45)}..."`,
        level: 'INFO',
        timestamp: formatTime(0)
      }
    ]);

    setTasks([
      {
        id: 'sim-t1',
        title: 'Conduct Market & Competitor Analysis',
        description: 'Gather industry datasets, user pain points, and existing solution gaps.',
        assigned_agent: 'Meera Iyer (Research)',
        status: 'RUNNING',
        priority: 'P1 High',
        dependencies: []
      },
      {
        id: 'sim-t2',
        title: 'System Architecture & Tech Stack Spec',
        description: 'Define microservices architecture, vector store schemas, and latency SLAs.',
        assigned_agent: 'Rohan Verma (CTO)',
        status: 'PENDING',
        priority: 'P0 Critical',
        dependencies: ['sim-t1']
      },
      {
        id: 'sim-t3',
        title: 'Go-To-Market Strategy & Viral Loops',
        description: 'Establish acquisition channels, partnership agreements, and retention funnels.',
        assigned_agent: 'Isha Malhotra (Marketing)',
        status: 'PENDING',
        priority: 'P1 High',
        dependencies: ['sim-t1']
      },
      {
        id: 'sim-t4',
        title: 'Unit Economics & Infra Cost Modeling',
        description: 'Calculate CAC/LTV, monthly serverless budget, and 18-month runway extension.',
        assigned_agent: 'Kabir Singh (Finance)',
        status: 'PENDING',
        priority: 'P0 Critical',
        dependencies: ['sim-t2']
      }
    ]);

    setAgents((prev) =>
      prev.map((a) =>
        a.role.includes('CEO')
          ? { ...a, status: 'WORKING', current_task: 'Breaking down objective and assigning tasks' }
          : a.role.includes('Research')
          ? { ...a, status: 'WORKING', current_task: 'Analyzing market opportunities & competitor gaps' }
          : { ...a, status: 'WAITING', current_task: 'Awaiting dependency outputs' }
      )
    );

    const delay = (ms: number) => ms / simulationSpeed;

    // Simulation steps
    const step1 = setTimeout(() => {
      sound.playTick();
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-2`,
          agent_name: 'CEO',
          message: 'CEO dispatched 4 concurrent work streams across departments.',
          level: 'SUCCESS',
          timestamp: formatTime(2)
        },
        {
          id: `log-${Date.now()}-3`,
          agent_name: 'Research',
          message: 'Meera (Research) completed market analysis. 78% target audience demand confirmed.',
          level: 'SUCCESS',
          timestamp: formatTime(4)
        }
      ]);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === 'sim-t1'
            ? { ...t, status: 'COMPLETED', result: 'Identified $1.8B TAM with 78% student demand score.' }
            : t.id === 'sim-t2' || t.id === 'sim-t3'
            ? { ...t, status: 'RUNNING' }
            : t
        )
      );

      setAgents((prev) =>
        prev.map((a) =>
          a.role.includes('Research')
            ? { ...a, status: 'COMPLETED', current_task: 'Market analysis delivered' }
            : a.role.includes('CTO')
            ? { ...a, status: 'WORKING', current_task: 'Drafting distributed system architecture' }
            : a.role.includes('Marketing')
            ? { ...a, status: 'WORKING', current_task: 'Drafting campus growth playbooks' }
            : a
        )
      );

      setMemories((prev) => [
        ...prev,
        {
          id: `mem-${Date.now()}-1`,
          agent_name: 'Meera Iyer (Research)',
          key: 'MARKET_OPPORTUNITY_REPORT',
          category: 'RESEARCH',
          value: {
            demand_score: '78%',
            identified_gap: 'Personalized real-time feedback with matching algorithms',
            tam: '$1.8B annual market'
          },
          created_at: formatTime(4)
        }
      ]);
    }, delay(2000));
    simulationTimers.current.push(step1);

    // Step 2: CTO & Marketing Deliveries
    const step2 = setTimeout(() => {
      sound.playTick();
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-4`,
          agent_name: 'CTO',
          message: 'Rohan (CTO) finalized Next.js 15 + FastAPI architecture with ChromaDB caching.',
          level: 'SUCCESS',
          timestamp: formatTime(6)
        },
        {
          id: `log-${Date.now()}-5`,
          agent_name: 'Marketing',
          message: 'Isha (Marketing) finalized university ambassador playbook and referral loops.',
          level: 'SUCCESS',
          timestamp: formatTime(8)
        },
        {
          id: `log-${Date.now()}-6`,
          agent_name: 'Finance',
          message: 'Kabir (Finance) flagged infrastructure burn rate vs seed runway target.',
          level: 'CONFLICT',
          timestamp: formatTime(10)
        }
      ]);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === 'sim-t2'
            ? { ...t, status: 'COMPLETED', result: 'Next.js 15, FastAPI, ChromaDB with <100ms p95 latency.' }
            : t.id === 'sim-t3'
            ? { ...t, status: 'COMPLETED', result: 'Ambassador network across 50 partner universities.' }
            : t.id === 'sim-t4'
            ? { ...t, status: 'RUNNING' }
            : t
        )
      );

      setAgents((prev) =>
        prev.map((a) =>
          a.role.includes('CTO')
            ? { ...a, status: 'COMPLETED', current_task: 'Architecture spec delivered' }
            : a.role.includes('Marketing')
            ? { ...a, status: 'COMPLETED', current_task: 'GTM strategy delivered' }
            : a.role.includes('Finance')
            ? { ...a, status: 'WORKING', current_task: 'Financial modeling & unit economics' }
            : a.role.includes('CEO')
            ? { ...a, status: 'WORKING', current_task: 'Convening conflict resolution in Conference Room' }
            : a
        )
      );
    }, delay(4500));
    simulationTimers.current.push(step2);

    // Step 3: Conflict Arbitration in Conference Room
    const step3 = setTimeout(() => {
      sound.playTick();
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-7`,
          agent_name: 'CEO',
          message: 'CEO arbitrated Cloud Budget tradeoff: Hybrid serverless approved ($2,200/mo).',
          level: 'SUCCESS',
          timestamp: formatTime(12)
        }
      ]);

      setDecisions((prev) => [
        ...prev,
        {
          id: `dec-${Date.now()}`,
          title: `Resource Optimization for ${goalToUse.slice(0, 30)}...`,
          decision: 'Approved serverless embeddings with local caching, saving $2,800/mo while preserving sub-100ms latency.',
          rationale: 'Balanced CTO performance benchmarks with Finance runway parameters.',
          made_by: 'Arnav Sharma (CEO)',
          created_at: formatTime(12)
        }
      ]);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === 'sim-t4'
            ? { ...t, status: 'COMPLETED', result: 'Monthly burn capped at $2,200; 18 months runway.' }
            : t
        )
      );

      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          status: 'COMPLETED',
          current_task: 'Goal execution completed successfully'
        }))
      );
    }, delay(7000));
    simulationTimers.current.push(step3);

    // Step 4: Final Executive Deliverable
    const step4 = setTimeout(() => {
      sound.playSuccess();
      const finalDoc = `# EXECUTIVE STRATEGY DELIVERABLE
**Company:** AI ORG OS V1.0.0 - DEBUGGERS INC.
**Objective:** ${goalToUse}

## 1. Market Opportunity & Validation
- **Demand Rating:** 78% validated across university student cohorts.
- **Key Pain Point:** Lack of actionable resume-to-skill feedback before applying.
- **Target TAM:** $1.8 Billion addressable market in early talent acquisition.

## 2. Technical Architecture & Infrastructure
- **Frontend:** Next.js 15 with Tailwind CSS and retro tactile interface.
- **Backend:** FastAPI Python 3.11 with asynchronous worker pools.
- **Vector & Data Store:** ChromaDB with PostgreSQL on Supabase.
- **Performance SLA:** Sub-100ms vector matching latency via edge caching.

## 3. Go-To-Market & Growth Loops
- **University Ambassador Program:** 50 tier-1 engineering and design colleges in Phase 1.
- **Target CAC:** $14.20 per verified active student profile.
- **Employer Pipeline:** 120 hiring partners targeted for beta launch.

## 4. Financial Economics & Runway
- **Monthly Cloud Hosting:** $2,200/mo under hybrid serverless model.
- **Gross Margin:** 82%.
- **Projected Runway:** 18 months sustained operations.

---
*Signed off by CEO Arnav Sharma & Executive Squad.*`;

      setCompany((prev) => ({
        ...prev,
        status: 'COMPLETED',
        final_report: finalDoc
      }));

      setMemories((prev) => [
        ...prev,
        {
          id: `mem-final-${Date.now()}`,
          agent_name: 'Arnav Sharma (CEO)',
          key: 'FINAL_EXECUTIVE_REPORT',
          category: 'DECISION',
          value: finalDoc,
          created_at: formatTime(14)
        }
      ]);

      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-8`,
          agent_name: 'System',
          message: '🏆 Organization pipeline execution COMPLETED. Final report ready.',
          level: 'SUCCESS',
          timestamp: formatTime(14)
        }
      ]);

      setIsRunning(false);
      setIsReportModalOpen(true);
    }, delay(9500));
    simulationTimers.current.push(step4);
  };

  // Start Organization Workflow (Backend + Fallback Simulation)
  const handleStartOrganization = async (customPrompt?: string) => {
    const goalToUse = customPrompt || goalInput;
    if (!goalToUse.trim() || isRunning) return;

    sound.playExecute();

    // Reset transient execution state to prevent cross-run state pollution
    clearSimulationTimers();
    if (sseRef.current) sseRef.current.close();
    setTasks([]);
    setLogs([]);
    setMemories([]);
    setDecisions([]);
    // Do NOT wipe treasury to null; preserve existing expenditures
    loadTreasury();
    setSelectedAgent(null);
    setIsPaused(false);
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        status: a.role.includes('CEO') ? 'WORKING' : 'WAITING',
        current_task: a.role.includes('CEO') ? `Decomposing: "${goalToUse.slice(0, 32)}..."` : 'Awaiting task dispatch'
      }))
    );

    setIsRunning(true);
    setCompany({
      id: `comp-${Date.now()}`,
      name: 'AI ORG OS V1.0.0 - DEBUGGERS INC.',
      goal: goalToUse.trim(),
      status: 'IN_PROGRESS',
      final_report: undefined,
      created_at: new Date().toISOString()
    });

    try {
      const createData = await api.createCompany(goalToUse.trim(), 'AI ORG OS V1.0.0 - DEBUGGERS INC.');
      const companyId = createData.company_id;
      setCompany((prev) => ({ ...prev, id: companyId }));

      // Connect SSE
      connectSSE(companyId);

      // Trigger backend pipeline run
      await api.runCompany(companyId);
    } catch (err) {
      console.log('Running interactive fallback simulation engine:', err);
      runSimulatedPipeline(goalToUse);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4ece1] p-2 sm:p-4 md:p-6 font-mono selection:bg-[#2c2621] selection:text-[#f4ece1] flex items-center justify-center">
      {/* RETRO WINDOW FRAME CONTAINER (matching screenshot) */}
      <div className="w-full max-w-6xl bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl shadow-2xl overflow-hidden flex flex-col space-y-2.5 p-2.5 sm:p-3">
        {/* 1. TOP WINDOW TITLEBAR */}
        <div className="flex items-center justify-between border-b-4 border-[#2c2621] pb-2 px-1">
          {/* Traffic Light Dots & OS Title */}
          <div className="flex items-center space-x-2.5">
            <div className="flex space-x-1.5">
              <div
                onClick={() => {
                  sound.playClick();
                  handleResetOrg();
                }}
                className="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#2c2621] cursor-pointer hover:opacity-80"
                title="Reset Organization"
              />
              <div
                onClick={() => {
                  sound.playClick();
                  setIsPaused(!isPaused);
                }}
                className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#2c2621] cursor-pointer hover:opacity-80"
                title="Pause / Resume"
              />
              <div
                onClick={() => {
                  sound.playClick();
                  setIsStatsOpen(true);
                }}
                className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#2c2621] cursor-pointer hover:opacity-80"
                title="View Performance Stats"
              />
            </div>
            <div className="text-[11px] sm:text-xs font-black tracking-wider text-[#2c2621] uppercase">
              AI ORG OS <span className="text-[#8c7b70] text-[9px] sm:text-[10px] font-bold">V1.0.0 - DEBUGGERS INC.</span>
            </div>
          </div>

          {/* Right Action Controls (matching screenshot) */}
          <div className="flex items-center space-x-1.5">
            {company.final_report && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  setIsReportModalOpen(true);
                }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white border-2 border-[#2c2621] rounded text-[10px] font-black flex items-center gap-1.5 shadow cursor-pointer transition animate-pulse"
                title="View C-Suite Executive PDF Deliverable"
              >
                <FileText className="w-3 h-3 text-white" />
                <span>Executive PDF</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                setViewMode(viewMode === 'PIXEL_OFFICE' ? 'GRAPH' : 'PIXEL_OFFICE');
              }}
              className="px-2.5 py-1 bg-[#f4ece1] hover:bg-[#e4d3c3] border-2 border-[#2c2621] rounded text-[10px] font-black flex items-center gap-1.5 shadow cursor-pointer transition"
            >
              {viewMode === 'PIXEL_OFFICE' ? <GitFork className="w-3 h-3 text-[#2c2621]" /> : <Gamepad2 className="w-3 h-3 text-[#2c2621]" />}
              <span className="text-[#2c2621]">{viewMode === 'PIXEL_OFFICE' ? 'Graph View' : 'Pixel Office'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsStatsOpen(true);
              }}
              className="p-1 bg-[#f4ece1] hover:bg-[#e4d3c3] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer transition"
              title="Analytics & Stats"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsSettingsOpen(true);
              }}
              className="p-1 bg-[#f4ece1] hover:bg-[#e4d3c3] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer transition"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                handleResetOrg();
              }}
              className="p-1 bg-[#f4ece1] hover:bg-[#e4d3c3] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer transition"
              title="Reset System"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. MAIN WORKSPACE CONTENT */}
        {viewMode === 'PIXEL_OFFICE' ? (
          <div className="space-y-2.5">
            {/* GRID: 2D PIXEL OFFICE MAP + COMMAND CENTER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
              <div className="lg:col-span-7">
                <PixelOffice
                  agents={agents}
                  onSelectAgent={(agent) => setSelectedAgent(agent)}
                  selectedAgentId={selectedAgent?.id}
                  companyStatus={company.status}
                  hasDecision={decisions.length > 0}
                  hasReport={!!company.final_report}
                  onOpenDiagram={() => setIsDiagramOpen(true)}
                  onOpenMemoryCore={() => setIsMemoryCoreOpen(true)}
                />
              </div>

              <div className="lg:col-span-5">
                <CommandCenter
                  logs={logs}
                  memories={memories}
                  tasks={tasks}
                  decisions={decisions}
                  agents={agents}
                  treasury={treasury}
                  reportContent={company.final_report || null}
                  companyGoal={company.goal || goalInput}
                  isPaused={isPaused}
                  onTogglePause={() => setIsPaused(!isPaused)}
                  onClearLogs={() => setLogs([])}
                  onSendPrompt={(prompt) => handleStartOrganization(prompt)}
                  onSelectAgent={(agent) => setSelectedAgent(agent)}
                  onRefreshTreasury={() => loadTreasury(company.id)}
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
          <div className="space-y-3">
            {/* TOP TAB BAR FOR NODE GRAPH */}
            <div className="flex border-b-2 border-[#2c2621] gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'GRAPH', label: 'Organization Graph', icon: Cpu },
                { id: 'ACTIVITY', label: 'Activity Feed', icon: Activity },
                { id: 'MEMORY', label: 'Memory Core', icon: Database },
                { id: 'CONFLICTS', label: 'Conflicts & Decisions', icon: Zap },
                { id: 'REPORT', label: 'Final Report', icon: FileText },
                { id: 'TREASURY', label: 'Treasury (x402)', icon: Coins }
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
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-t text-[10px] font-black border-2 transition cursor-pointer ${
                      isActive
                        ? 'bg-[#2c2621] text-[#f4ece1] border-[#2c2621]'
                        : 'bg-[#f4ece1] text-[#2c2621] border-[#8c7b70] hover:bg-[#e4d3c3]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
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
                companyStatus={company.status}
                hasDecision={decisions.length > 0}
                hasReport={!!company.final_report}
              />
            )}

            {activeTab === 'ACTIVITY' && <ActivityFeed logs={logs} />}

            {activeTab === 'MEMORY' && (
              <CompanyMemoryView memories={memories} companyGoal={company.goal || goalInput} />
            )}

            {activeTab === 'CONFLICTS' && <ConflictsView decisions={decisions} />}

            {activeTab === 'REPORT' && (
              <FinalReportView
                reportContent={company.final_report || null}
                companyGoal={company.goal || goalInput}
              />
            )}

            {activeTab === 'TREASURY' && (
              <div className="bg-[#f9f3eb] border-2 border-[#2c2621] rounded-lg p-3">
                <TreasuryPanel treasury={treasury} onRefresh={() => loadTreasury(company.id)} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* RETRO AGENT DETAILS DRAWER */}
      <AgentDrawer
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        tasks={tasks}
        memories={memories}
      />

      {/* DIAGRAM BOARD MODAL */}
      <DiagramBoardModal
        isOpen={isDiagramOpen}
        onClose={() => setIsDiagramOpen(false)}
      />

      {/* MEMORY CORE INSPECTOR MODAL */}
      <MemoryCoreModal
        isOpen={isMemoryCoreOpen}
        onClose={() => setIsMemoryCoreOpen(false)}
        memories={memories}
      />

      {/* STATS & PERFORMANCE ANALYTICS MODAL */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        agents={agents}
        tasks={tasks}
      />

      {/* OS SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiBase={apiBase}
        setApiBase={setApiBase}
        simulationSpeed={simulationSpeed}
        setSimulationSpeed={setSimulationSpeed}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onResetOrg={handleResetOrg}
      />

      {/* EXECUTIVE DELIVERABLE PDF MODAL */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportContent={company.final_report || null}
        companyGoal={company.goal || goalInput}
      />
    </main>
  );
}
