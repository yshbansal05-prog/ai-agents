'use client';

import React from 'react';
import { Agent } from '@/types';
import { ChevronRight } from 'lucide-react';

interface AgentDockProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  selectedAgentId?: string;
}

export default function AgentDock({ agents, onSelectAgent, selectedAgentId }: AgentDockProps) {
  const agentCards = [
    {
      id: 'ceo',
      role: 'CEO',
      name: 'Arnav Sharma',
      avatar: '👨‍💼',
      hasCrown: true,
      defaultStatus: 'IN REVIEW',
      statusColor: 'bg-amber-400 text-[#2c2621]',
      progressPct: 65,
      barColor: 'bg-amber-500'
    },
    {
      id: 'research',
      role: 'RESEARCH',
      name: 'Meera Iyer',
      avatar: '👩‍🔬',
      hasCrown: false,
      defaultStatus: 'COMPLETED',
      statusColor: 'bg-emerald-500 text-white',
      progressPct: 100,
      barColor: 'bg-emerald-500'
    },
    {
      id: 'cto',
      role: 'CTO',
      name: 'Rohan Verma',
      avatar: '👨‍💻',
      hasCrown: false,
      defaultStatus: 'IN REVIEW',
      statusColor: 'bg-amber-400 text-[#2c2621]',
      progressPct: 75,
      barColor: 'bg-amber-500'
    },
    {
      id: 'marketing',
      role: 'MARKETING',
      name: 'Isha Malhotra',
      avatar: '👩‍💼',
      hasCrown: false,
      defaultStatus: 'WORKING',
      statusColor: 'bg-orange-500 text-white',
      progressPct: 40,
      barColor: 'bg-orange-500'
    },
    {
      id: 'finance',
      role: 'FINANCE',
      name: 'Kabir Singh',
      avatar: '👨‍🔧',
      hasCrown: false,
      defaultStatus: 'COMPLETED',
      statusColor: 'bg-emerald-500 text-white',
      progressPct: 100,
      barColor: 'bg-emerald-500'
    }
  ];

  return (
    <div className="w-full bg-[#ebdcd0] border-4 border-[#2c2621] rounded-lg p-2.5 shadow-2xl font-mono">
      <div className="flex items-center space-x-2">
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {agentCards.map((card) => {
            const liveAgent = agents.find(
              (a) => a.name.toLowerCase().includes(card.role.toLowerCase()) || card.name.toLowerCase().includes(a.name.toLowerCase())
            );

            const statusText = liveAgent
              ? liveAgent.status === 'WORKING'
                ? 'WORKING'
                : liveAgent.status === 'COMPLETED'
                ? 'COMPLETED'
                : 'IN REVIEW'
              : card.defaultStatus;

            const isSelected = liveAgent && selectedAgentId === liveAgent.id;

            return (
              <div
                key={card.id}
                onClick={() => liveAgent && onSelectAgent(liveAgent)}
                className={`bg-[#f9f3eb] border-2 border-[#2c2621] rounded-md p-2 transition duration-150 cursor-pointer shadow flex items-center space-x-2 relative ${
                  isSelected ? 'ring-2 ring-amber-600 bg-[#fffdfa]' : 'hover:bg-[#f0e4d7]'
                }`}
              >
                {/* Crown badge for CEO */}
                {card.hasCrown && (
                  <span className="absolute -top-2 left-2 text-xs drop-shadow">👑</span>
                )}

                {/* Avatar Box */}
                <div className="w-10 h-10 bg-[#e4d3c3] border-2 border-[#2c2621] rounded flex items-center justify-center text-lg shrink-0">
                  {card.avatar}
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black text-[#2c2621] uppercase tracking-wider leading-none">
                    {card.role}
                  </div>
                  <div className="text-[10px] font-bold text-[#4a3e37] truncate mb-1">
                    {card.name}
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
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
                  <div className="w-full h-1 bg-[#d8c3b1] rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${
                        statusText === 'COMPLETED' ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${card.progressPct}%` }}
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
          className="w-8 h-16 bg-[#e4d3c3] hover:bg-[#d8c3b1] border-2 border-[#2c2621] rounded flex items-center justify-center text-[#2c2621] transition shadow"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
