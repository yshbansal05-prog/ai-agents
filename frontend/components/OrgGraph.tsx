'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Agent } from '@/types';
import { Bot, CheckCircle2, Clock, AlertTriangle, Cpu, ShieldCheck, Database, FileText } from 'lucide-react';

interface OrgGraphProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  selectedAgentId?: string;
  companyStatus: string;
  hasDecision: boolean;
  hasReport: boolean;
}

// Custom Node Component
const AgentNode = ({ data }: NodeProps) => {
  const agent: Agent = data.agent as Agent;
  const isSelected = data.isSelected;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WORKING':
        return (
          <div className="flex items-center space-x-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">
            <Cpu className="w-3 h-3 animate-spin" />
            <span>Working</span>
          </div>
        );
      case 'COMPLETED':
        return (
          <div className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center space-x-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-3 h-3" />
            <span>Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 bg-slate-700/50 text-slate-400 border border-slate-600 px-2 py-0.5 rounded-full text-xs font-semibold">
            <Clock className="w-3 h-3" />
            <span>Waiting</span>
          </div>
        );
    }
  };

  const getRoleIcon = (name: string) => {
    if (name.includes('CEO')) return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
    if (name.includes('Research')) return <Bot className="w-5 h-5 text-cyan-400" />;
    if (name.includes('CTO')) return <Cpu className="w-5 h-5 text-emerald-400" />;
    if (name.includes('Marketing')) return <Bot className="w-5 h-5 text-purple-400" />;
    if (name.includes('Development')) return <Bot className="w-5 h-5 text-amber-400" />;
    if (name.includes('Memory')) return <Database className="w-5 h-5 text-blue-400" />;
    if (name.includes('Decision')) return <ShieldCheck className="w-5 h-5 text-amber-400" />;
    return <FileText className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div
      className={`px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-md min-w-[200px] ${
        isSelected
          ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/50'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-3 !h-3" />
      
      <div className="flex items-center justify-between space-x-2 mb-2">
        <div className="flex items-center space-x-2">
          {getRoleIcon(agent?.name || (data.label as string) || '')}
          <span className="text-sm font-bold text-slate-100">{agent?.name || (data.label as string) || ''}</span>
        </div>
        {agent && getStatusBadge(agent.status)}
      </div>
      
      <p className="text-xs text-slate-400 line-clamp-1">{agent?.role || (data.sublabel as string) || ''}</p>
      
      {agent?.current_task && (
        <div className="mt-2 text-[11px] text-indigo-300/80 bg-indigo-950/40 p-1.5 rounded border border-indigo-900/50 line-clamp-1">
          {agent.current_task}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3" />
    </div>
  );
};

export default function OrgGraph({
  agents,
  onSelectAgent,
  selectedAgentId,
  companyStatus,
  hasDecision,
  hasReport
}: OrgGraphProps) {
  const nodeTypes = useMemo(() => ({ agentNode: AgentNode }), []);

  const getAgent = (roleSubstring: string) =>
    agents.find((a) => a.name.toLowerCase().includes(roleSubstring.toLowerCase()));

  const ceoAgent = getAgent('CEO');
  const researchAgent = getAgent('Research');
  const ctoAgent = getAgent('CTO');
  const marketingAgent = getAgent('Marketing');
  const devAgent = getAgent('Development');

  const nodes: Node[] = [
    // Top Level: CEO
    {
      id: 'ceo',
      type: 'agentNode',
      position: { x: 340, y: 20 },
      data: {
        agent: ceoAgent || { name: 'CEO / Orchestrator', role: 'Executive Lead', status: 'WAITING' },
        isSelected: selectedAgentId === ceoAgent?.id
      }
    },
    // Level 2: Specialized Agents
    {
      id: 'research',
      type: 'agentNode',
      position: { x: 40, y: 170 },
      data: {
        agent: researchAgent || { name: 'Research Agent', role: 'Market Intel', status: 'WAITING' },
        isSelected: selectedAgentId === researchAgent?.id
      }
    },
    {
      id: 'cto',
      type: 'agentNode',
      position: { x: 270, y: 170 },
      data: {
        agent: ctoAgent || { name: 'Strategy / CTO Agent', role: 'Tech Architecture', status: 'WAITING' },
        isSelected: selectedAgentId === ctoAgent?.id
      }
    },
    {
      id: 'marketing',
      type: 'agentNode',
      position: { x: 500, y: 170 },
      data: {
        agent: marketingAgent || { name: 'Marketing Agent', role: 'GTM Strategy', status: 'WAITING' },
        isSelected: selectedAgentId === marketingAgent?.id
      }
    },
    {
      id: 'dev',
      type: 'agentNode',
      position: { x: 730, y: 170 },
      data: {
        agent: devAgent || { name: 'Development Agent', role: 'Software Engineering', status: 'WAITING' },
        isSelected: selectedAgentId === devAgent?.id
      }
    },
    // Level 3: Shared Memory Node
    {
      id: 'memory',
      type: 'agentNode',
      position: { x: 340, y: 320 },
      data: {
        label: 'Shared Company Memory',
        sublabel: 'PostgreSQL Memory Layer',
        agent: {
          id: 'mem-node',
          name: 'Shared Memory',
          role: 'PostgreSQL Persistence',
          status: companyStatus === 'IN_PROGRESS' || companyStatus === 'COMPLETED' ? 'COMPLETED' : 'WAITING'
        }
      }
    },
    // Level 4: CEO Conflict & Decision Node
    {
      id: 'decision',
      type: 'agentNode',
      position: { x: 340, y: 450 },
      data: {
        label: 'CEO Decision Engine',
        sublabel: 'Conflict Resolution & Alignment',
        agent: {
          id: 'dec-node',
          name: 'CEO Decision',
          role: 'Conflict Resolution',
          status: hasDecision ? 'COMPLETED' : companyStatus === 'IN_PROGRESS' ? 'WORKING' : 'WAITING'
        }
      }
    },
    // Level 5: Final Outcome Node
    {
      id: 'outcome',
      type: 'agentNode',
      position: { x: 340, y: 580 },
      data: {
        label: 'Final Deliverable Outcome',
        sublabel: 'Executive Organization Report',
        agent: {
          id: 'out-node',
          name: 'Final Outcome Report',
          role: 'Executive Plan',
          status: hasReport ? 'COMPLETED' : 'WAITING'
        }
      }
    }
  ];

  const edges: Edge[] = [
    { id: 'e-ceo-research', source: 'ceo', target: 'research', animated: researchAgent?.status === 'WORKING' },
    { id: 'e-ceo-cto', source: 'ceo', target: 'cto', animated: ctoAgent?.status === 'WORKING' },
    { id: 'e-ceo-marketing', source: 'ceo', target: 'marketing', animated: marketingAgent?.status === 'WORKING' },
    { id: 'e-cto-dev', source: 'cto', target: 'dev', animated: devAgent?.status === 'WORKING' },
    { id: 'e-research-mem', source: 'research', target: 'memory' },
    { id: 'e-cto-mem', source: 'cto', target: 'memory' },
    { id: 'e-mkt-mem', source: 'marketing', target: 'memory' },
    { id: 'e-dev-mem', source: 'dev', target: 'memory' },
    { id: 'e-mem-decision', source: 'memory', target: 'decision', animated: hasDecision },
    { id: 'e-decision-outcome', source: 'decision', target: 'outcome', animated: hasReport }
  ];

  return (
    <div className="w-full h-[620px] bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          if (node.data.agent && (node.data.agent as Agent).id) {
            onSelectAgent(node.data.agent as Agent);
          }
        }}
        fitView
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="bg-slate-900 border-slate-800 text-slate-200 fill-slate-200" />
      </ReactFlow>
    </div>
  );
}
