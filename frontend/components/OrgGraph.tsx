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
import { sound } from '@/utils/sound';

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
          <div className="flex items-center space-x-1 bg-orange-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase animate-pulse border border-[#2c2621]">
            <Cpu className="w-2.5 h-2.5 animate-spin" />
            <span>Working</span>
          </div>
        );
      case 'COMPLETED':
        return (
          <div className="flex items-center space-x-1 bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase border border-[#2c2621]">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Done</span>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center space-x-1 bg-rose-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase border border-[#2c2621]">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 bg-amber-400 text-[#2c2621] px-2 py-0.5 rounded text-[9px] font-black uppercase border border-[#2c2621]">
            <Clock className="w-2.5 h-2.5" />
            <span>Waiting</span>
          </div>
        );
    }
  };

  const getRoleIcon = (name: string) => {
    if (name.includes('CEO')) return <ShieldCheck className="w-4 h-4 text-[#8c3b00]" />;
    if (name.includes('Research')) return <Bot className="w-4 h-4 text-cyan-800" />;
    if (name.includes('CTO')) return <Cpu className="w-4 h-4 text-emerald-800" />;
    if (name.includes('Marketing')) return <Bot className="w-4 h-4 text-purple-800" />;
    if (name.includes('Development') || name.includes('Finance')) return <Bot className="w-4 h-4 text-amber-800" />;
    if (name.includes('Memory')) return <Database className="w-4 h-4 text-emerald-800" />;
    if (name.includes('Decision')) return <ShieldCheck className="w-4 h-4 text-amber-800" />;
    return <FileText className="w-4 h-4 text-emerald-800" />;
  };

  return (
    <div
      className={`px-3 py-2.5 rounded-lg border-2 transition-all duration-200 cursor-pointer shadow-md font-mono min-w-[190px] ${
        isSelected
          ? 'bg-[#fffdfa] border-[#2c2621] ring-2 ring-amber-600'
          : 'bg-[#f4ece1] border-[#2c2621] hover:bg-[#ebdcd0]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#2c2621] !w-2.5 !h-2.5" />

      <div className="flex items-center justify-between space-x-1.5 mb-1">
        <div className="flex items-center space-x-1.5">
          {getRoleIcon(agent?.name || (data.label as string) || '')}
          <span className="text-xs font-black text-[#2c2621] truncate max-w-[100px]">
            {agent?.name || (data.label as string) || ''}
          </span>
        </div>
        {agent && getStatusBadge(agent.status)}
      </div>

      <p className="text-[9px] text-[#6b5b52] font-bold truncate">
        {agent?.role || (data.sublabel as string) || ''}
      </p>

      {agent?.current_task && (
        <div className="mt-1.5 text-[8px] font-bold text-[#2c2621] bg-[#ebdcd0] p-1 rounded border border-[#d8c3b1] truncate">
          {agent.current_task}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[#2c2621] !w-2.5 !h-2.5" />
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

  const ceoAgent = getAgent('CEO') || getAgent('Arnav');
  const researchAgent = getAgent('Research') || getAgent('Meera');
  const ctoAgent = getAgent('CTO') || getAgent('Rohan');
  const marketingAgent = getAgent('Marketing') || getAgent('Isha');
  const devAgent = getAgent('Development') || getAgent('Finance') || getAgent('Kabir');

  const nodes: Node[] = [
    // Top Level: CEO
    {
      id: 'ceo',
      type: 'agentNode',
      position: { x: 340, y: 20 },
      data: {
        agent: ceoAgent || { id: 'agent-ceo', name: 'Arnav Sharma', role: 'Executive Lead', status: 'WAITING', capabilities: [], dependencies: [] },
        isSelected: selectedAgentId === ceoAgent?.id
      }
    },
    // Level 2: Specialized Agents (Research, CTO, Marketing)
    {
      id: 'research',
      type: 'agentNode',
      position: { x: 60, y: 150 },
      data: {
        agent: researchAgent || { id: 'agent-research', name: 'Meera Iyer', role: 'Market Intel', status: 'WAITING', capabilities: [], dependencies: [] },
        isSelected: selectedAgentId === researchAgent?.id
      }
    },
    {
      id: 'cto',
      type: 'agentNode',
      position: { x: 340, y: 150 },
      data: {
        agent: ctoAgent || { id: 'agent-cto', name: 'Rohan Verma', role: 'Tech Architecture', status: 'WAITING', capabilities: [], dependencies: [] },
        isSelected: selectedAgentId === ctoAgent?.id
      }
    },
    {
      id: 'marketing',
      type: 'agentNode',
      position: { x: 620, y: 150 },
      data: {
        agent: marketingAgent || { id: 'agent-marketing', name: 'Isha Malhotra', role: 'GTM Strategy', status: 'WAITING', capabilities: [], dependencies: [] },
        isSelected: selectedAgentId === marketingAgent?.id
      }
    },
    // Level 3: Shared Memory Core
    {
      id: 'memory',
      type: 'agentNode',
      position: { x: 340, y: 280 },
      data: {
        label: 'Shared Memory Core',
        sublabel: 'PostgreSQL Knowledge Layer',
        agent: {
          id: 'mem-node',
          name: 'Memory Core',
          role: 'Shared Memory Racks',
          status: companyStatus === 'IN_PROGRESS' || companyStatus === 'COMPLETED' ? 'COMPLETED' : 'WAITING',
          capabilities: [],
          dependencies: []
        }
      }
    },
    // Level 4: CEO Conflict & Decision Node (Arbitrates CTO vs Marketing)
    {
      id: 'decision',
      type: 'agentNode',
      position: { x: 340, y: 400 },
      data: {
        label: 'Conflict Arbiter',
        sublabel: 'Resolution & Alignment',
        agent: {
          id: 'dec-node',
          name: 'Conflict Arbiter',
          role: 'CEO Executive Decision',
          status: hasDecision ? 'COMPLETED' : companyStatus === 'IN_PROGRESS' ? 'WORKING' : 'WAITING',
          capabilities: [],
          dependencies: []
        }
      }
    },
    // Level 5: Development Agent (Implements CEO Conflict Ruling)
    {
      id: 'dev',
      type: 'agentNode',
      position: { x: 340, y: 520 },
      data: {
        agent: devAgent || { id: 'agent-dev', name: 'Kabir Singh', role: 'Lead Software Engineer', status: 'WAITING', capabilities: [], dependencies: [] },
        isSelected: selectedAgentId === devAgent?.id
      }
    },
    // Level 6: Final Outcome Node
    {
      id: 'outcome',
      type: 'agentNode',
      position: { x: 340, y: 640 },
      data: {
        label: 'Final Deliverable',
        sublabel: 'Consolidated Executive Report',
        agent: {
          id: 'out-node',
          name: 'Executive Deliverable',
          role: 'Final Blueprint & Plan',
          status: hasReport ? 'COMPLETED' : 'WAITING',
          capabilities: [],
          dependencies: []
        }
      }
    }
  ];

  const edges: Edge[] = [
    { id: 'e-ceo-research', source: 'ceo', target: 'research', style: { stroke: '#2c2621', strokeWidth: 2 } },
    { id: 'e-ceo-cto', source: 'ceo', target: 'cto', style: { stroke: '#2c2621', strokeWidth: 2 } },
    { id: 'e-ceo-marketing', source: 'ceo', target: 'marketing', style: { stroke: '#2c2621', strokeWidth: 2 } },
    { id: 'e-research-mem', source: 'research', target: 'memory', style: { stroke: '#2c2621', strokeWidth: 2 } },
    { id: 'e-cto-mem', source: 'cto', target: 'memory', style: { stroke: '#2c2621', strokeWidth: 2 } },
    { id: 'e-mkt-mem', source: 'marketing', target: 'memory', style: { stroke: '#2c2621', strokeWidth: 2 } },
    { id: 'e-mem-decision', source: 'memory', target: 'decision', style: { stroke: '#2c2621', strokeWidth: 2 } },
    { id: 'e-decision-dev', source: 'decision', target: 'dev', style: { stroke: '#2c2621', strokeWidth: 2 } },
    { id: 'e-dev-outcome', source: 'dev', target: 'outcome', style: { stroke: '#2c2621', strokeWidth: 2 } }
  ];

  return (
    <div className="w-full h-[600px] bg-[#5f8b65]/20 rounded-2xl border-4 border-[#2c2621] overflow-hidden relative shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          sound.playClick();
          if (node.data.agent && (node.data.agent as Agent).id) {
            onSelectAgent(node.data.agent as Agent);
          }
        }}
        fitView
      >
        <Background color="#2c2621" gap={24} size={1} />
        <Controls className="bg-[#ebdcd0] border-2 border-[#2c2621] text-[#2c2621] fill-[#2c2621]" />
      </ReactFlow>
    </div>
  );
}
