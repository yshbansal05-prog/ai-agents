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
  const marketingAgent = getAgentByRole('Isha') || getAgentByRole('Marketing');
  const financeAgent = getAgentByRole('Kabir') || getAgentByRole('Finance');

  const agentCards = [
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
    }
  ];

  return (
    <div className="w-full bg-[#ebdcd0] border-4 border-[#2c2621] rounded-lg p-2 shadow-2xl font-mono select-none">
      <div className="flex items-center space-x-2">
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {agentCards.map((card) => {
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
                  <div className="text-[9px] font-black text-[#2c2621] uppercase tracking-wider leading-none">
                    {card.role}
                  </div>
                  <div className="text-[9px] font-bold text-[#4a3e37] truncate mb-0.5">
                    {card.name}
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[7px] font-black px-1 py-0.2 rounded uppercase ${
                        statusText === 'COMPLETED'
                          ? 'bg-emerald-600 text-white'
                          : statusText === 'WORKING'
                          ? 'bg-orange-500 text-white animate-pulse'
                          : 'bg-amber-400 text-[#2c2621]'
                      }`}
                    >
                      ● {statusText}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-[#d8c3b1] rounded-full overflow-hidden mt-1 border border-[#2c2621]/20">
                    <div
                      className={`h-full transition-all duration-500 ${
                        statusText === 'COMPLETED'
                          ? 'bg-emerald-600'
                          : statusText === 'WORKING'
                          ? 'bg-orange-500'
                          : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${
                          statusText === 'COMPLETED'
                            ? 100
                            : statusText === 'WORKING'
                            ? card.progressPct
                            : card.progressPct
                        }%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Arrow Button (matching screenshot) */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setPage((p) => (p === 0 ? 1 : 0));
          }}
          className="w-7 h-14 bg-[#e4d3c3] hover:bg-[#d8c3b1] border-2 border-[#2c2621] rounded flex items-center justify-center text-[#2c2621] transition shadow cursor-pointer shrink-0"
          title="Cycle view"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
