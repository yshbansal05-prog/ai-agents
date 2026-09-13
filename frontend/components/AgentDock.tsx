'use client';

import React, { useState } from 'react';
import { Agent } from '@/types';
import { sound } from '@/utils/sound';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface AgentDockProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  selectedAgentId?: string;
}

export default function AgentDock({ agents, onSelectAgent, selectedAgentId }: AgentDockProps) {
  const [page, setPage] = useState(0);

  const getAgentByRole = (roleQuery: string) =>
    agents.find(
      (a) =>
        a.name.toLowerCase().includes(roleQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(roleQuery.toLowerCase())
    );

  const ceoAgent = getAgentByRole('Arnav') || getAgentByRole('CEO');
  const researchAgent = getAgentByRole('Meera') || getAgentByRole('Research');
  const ctoAgent = getAgentByRole('Rohan') || getAgentByRole('CTO');
  const devAgent = getAgentByRole('Dev') || getAgentByRole('Developer');
  const marketingAgent = getAgentByRole('Isha') || getAgentByRole('Marketing');
  const financeAgent = getAgentByRole('Kabir') || getAgentByRole('Finance');
  const productAgent = getAgentByRole('Ananya') || getAgentByRole('Product');
  const qaAgent = getAgentByRole('Vikram') || getAgentByRole('QA');
  const devopsAgent = getAgentByRole('Aditya') || getAgentByRole('DevOps');
  const salesAgent = getAgentByRole('Priya') || getAgentByRole('Sales');
  const legalAgent = getAgentByRole('Siddharth') || getAgentByRole('Legal');

  const allAgentCards = [
    // Page 1: Executive & Core Engineering (6 agents)
    {
      id: 'ceo',
      agent: ceoAgent,
      role: 'CEO',
      name: 'Arnav Sharma',
      avatar: '👨‍💼',
      hasCrown: true,
      defaultStatus: 'IN REVIEW',
      progressPct: 65
    },
    {
      id: 'research',
      agent: researchAgent,
      role: 'RESEARCH',
      name: 'Meera Iyer',
      avatar: '👩‍🔬',
      hasCrown: false,
      defaultStatus: 'COMPLETED',
      progressPct: 100
    },
    {
      id: 'cto',
      agent: ctoAgent,
      role: 'CTO',
      name: 'Rohan Verma',
      avatar: '👨‍💻',
      hasCrown: false,
      defaultStatus: 'IN REVIEW',
      progressPct: 75
    },
    {
      id: 'dev',
      agent: devAgent,
      role: 'LEAD DEV',
      name: 'Dev Sharma',
      avatar: '💻',
      hasCrown: false,
      defaultStatus: 'WORKING',
      progressPct: 85
    },
    {
      id: 'marketing',
      agent: marketingAgent,
      role: 'MARKETING',
      name: 'Isha Malhotra',
      avatar: '👩‍💼',
      hasCrown: false,
      defaultStatus: 'WORKING',
      progressPct: 40
    },
    {
      id: 'finance',
      agent: financeAgent,
      role: 'FINANCE',
      name: 'Kabir Singh',
      avatar: '👨‍🔧',
      hasCrown: false,
      defaultStatus: 'COMPLETED',
      progressPct: 100
    },
    // Page 2: Product, Operations & Governance (5 agents)
    {
      id: 'product',
      agent: productAgent,
      role: 'PRODUCT & UX',
      name: 'Ananya Roy',
      avatar: '🎨',
      hasCrown: false,
      defaultStatus: 'WORKING',
      progressPct: 50
    },
    {
      id: 'devops',
      agent: devopsAgent,
      role: 'DEVOPS / SRE',
      name: 'Aditya Chen',
      avatar: '🚀',
      hasCrown: false,
      defaultStatus: 'WORKING',
      progressPct: 60
    },
    {
      id: 'qa',
      agent: qaAgent,
      role: 'QA & INFOSEC',
      name: 'Vikram Rathore',
      avatar: '🛡️',
      hasCrown: false,
      defaultStatus: 'COMPLETED',
      progressPct: 100
    },
    {
      id: 'sales',
      agent: salesAgent,
      role: 'SALES & BIZDEV',
      name: 'Priya Nair',
      avatar: '🤝',
      hasCrown: false,
      defaultStatus: 'IN REVIEW',
      progressPct: 35
    },
    {
      id: 'legal',
      agent: legalAgent,
      role: 'LEGAL & ETHICS',
      name: 'Siddharth Mehta',
      avatar: '⚖️',
      hasCrown: false,
      defaultStatus: 'COMPLETED',
      progressPct: 100
    }
  ];

  const displayedCards = page === 0 ? allAgentCards.slice(0, 6) : allAgentCards.slice(6, 11);

  return (
    <div className="w-full bg-[#ebdcd0] border-4 border-[#2c2621] rounded-lg p-2 shadow-2xl font-mono select-none">
      <div className="flex items-center space-x-2">
        {/* Left Scroll Arrow */}
        <button
          type="button"
          onClick={() => {
            if (page > 0) {
              sound.playClick();
              setPage(0);
            }
          }}
          disabled={page === 0}
          className={`w-7 h-14 border-2 border-[#2c2621] rounded flex items-center justify-center text-[#2c2621] transition shadow shrink-0 ${
            page === 0
              ? 'bg-[#d8c7b8] opacity-40 cursor-not-allowed'
              : 'bg-[#e4d3c3] hover:bg-[#d8c3b1] cursor-pointer'
          }`}
          title="View Executive & Core Engineering (Page 1)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className={`flex-1 grid grid-cols-2 sm:grid-cols-3 ${page === 0 ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-2`}>
          {displayedCards.map((card) => {
            const live = card.agent;
            const statusText = live
              ? live.status === 'WORKING'
                ? 'WORKING'
                : live.status === 'COMPLETED'
                ? 'COMPLETED'
                : 'IN REVIEW'
              : card.defaultStatus;

            const isSelected = live && selectedAgentId === live.id;

            return (
              <div
                key={card.id}
                onClick={() => {
                  sound.playClick();
                  if (live) {
                    onSelectAgent(live);
                  }
                }}
                className={`bg-[#f9f3eb] border-2 border-[#2c2621] rounded-md p-1.5 transition duration-150 cursor-pointer shadow flex items-center space-x-2 relative ${
                  isSelected
                    ? 'ring-2 ring-amber-600 bg-[#fffcf7] scale-[1.02]'
                    : 'hover:bg-[#f0e4d7] hover:scale-[1.01]'
                }`}
              >
                {/* Crown badge for CEO */}
                {card.hasCrown && (
                  <span className="absolute -top-2 left-1.5 text-[10px] drop-shadow">👑</span>
                )}

                {/* Avatar Box */}
                <div className="w-9 h-9 bg-[#e4d3c3] border-2 border-[#2c2621] rounded flex items-center justify-center text-base shrink-0 shadow-xs">
                  {card.avatar}
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-black text-[#2c2621] uppercase tracking-wider leading-none truncate">
                    {card.role}
                  </div>
                  <div className="text-[11px] font-bold text-[#4a3e37] truncate mt-0.5">
                    {card.name}
                  </div>
                  <div className="mt-1 flex items-center space-x-1">
                    <span
                      className={`text-[8px] font-black px-1 py-0.2 rounded border leading-none ${
                        statusText === 'WORKING'
                          ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                          : statusText === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          : 'bg-amber-100 text-amber-900 border-amber-400'
                      }`}
                    >
                      • {statusText}
                    </span>
                  </div>
                  {/* Micro Progress Bar */}
                  <div className="w-full bg-[#d5ceb9] h-1 rounded-full mt-1.5 overflow-hidden border border-[#2c2621]/30">
                    <div
                      className={`h-full transition-all duration-300 ${
                        statusText === 'COMPLETED' ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${statusText === 'COMPLETED' ? 100 : card.progressPct}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Arrow Button */}
        <button
          type="button"
          onClick={() => {
            if (page < 1) {
              sound.playClick();
              setPage(1);
            }
          }}
          disabled={page === 1}
          className={`w-7 h-14 border-2 border-[#2c2621] rounded flex items-center justify-center text-[#2c2621] transition shadow shrink-0 ${
            page === 1
              ? 'bg-[#d8c7b8] opacity-40 cursor-not-allowed'
              : 'bg-[#e4d3c3] hover:bg-[#d8c3b1] cursor-pointer'
          }`}
          title="View Operations, Product & Governance (Page 2)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
