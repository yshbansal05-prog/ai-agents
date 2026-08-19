'use client';

import React from 'react';
import { Agent } from '@/types';

interface PixelOfficeProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  selectedAgentId?: string;
  companyStatus: string;
  hasDecision: boolean;
  hasReport: boolean;
}

export default function PixelOffice({
  agents,
  onSelectAgent,
  selectedAgentId,
  companyStatus,
  hasDecision
}: PixelOfficeProps) {
  const getAgent = (roleSubstring: string) =>
    agents.find((a) => a.name.toLowerCase().includes(roleSubstring.toLowerCase()));

  const ceo = getAgent('CEO') || { name: 'Arnav Sharma', role: 'CEO', status: 'WAITING' };
  const research = getAgent('Research') || { name: 'Meera Iyer', role: 'Research', status: 'WAITING' };
  const cto = getAgent('CTO') || { name: 'Rohan Verma', role: 'CTO', status: 'WAITING' };
  const marketing = getAgent('Marketing') || { name: 'Isha Malhotra', role: 'Marketing', status: 'WAITING' };
  const dev = getAgent('Development') || getAgent('Finance') || { name: 'Kabir Singh', role: 'Development', status: 'WAITING' };

  // Calculate pixel sprite coordinates on floor
  const getAgentPos = (type: string) => {
    // If in conflict resolution or decision, move to conference room
    if (hasDecision || companyStatus === 'COMPLETED') {
      if (type === 'ceo') return { x: 42, y: 18 };
      if (type === 'research') return { x: 36, y: 22 };
      if (type === 'cto') return { x: 48, y: 22 };
      if (type === 'marketing') return { x: 38, y: 28 };
      if (type === 'dev') return { x: 46, y: 28 };
    }

    switch (type) {
      case 'ceo':
        return { x: 9, y: 22 };
      case 'research':
        return { x: 7, y: 52 };
      case 'cto':
        return { x: 22, y: 52 };
      case 'marketing':
        return { x: 37, y: 52 };
      case 'dev':
        return { x: 62, y: 56 };
      default:
        return { x: 50, y: 50 };
    }
  };

  const spriteList = [
    { type: 'ceo', name: 'Arnav Sharma', role: 'CEO', avatar: '👨‍💼', color: 'bg-amber-800' },
    { type: 'research', name: 'Meera Iyer', role: 'RESEARCH', avatar: '👩‍🔬', color: 'bg-cyan-800' },
    { type: 'cto', name: 'Rohan Verma', role: 'CTO', avatar: '👨‍💻', color: 'bg-emerald-800' },
    { type: 'marketing', name: 'Isha Malhotra', role: 'MARKETING', avatar: '👩‍💼', color: 'bg-purple-800' },
    { type: 'dev', name: 'Kabir Singh', role: 'FINANCE / DEV', avatar: '👨‍🔧', color: 'bg-amber-900' }
  ];

  return (
    <div className="w-full h-[540px] bg-[#d5ceb9] border-4 border-[#2c2621] rounded-lg relative overflow-hidden font-mono shadow-2xl select-none">
      {/* 1. SAGE GREEN TILED FLOOR GRID */}
      <div
        className="absolute inset-0 bg-[#5f8b65]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px'
        }}
      />

      {/* 2. OFFICE WALL STRUCTURES */}

      {/* Top Left: CEO Office Wall */}
      <div className="absolute top-0 left-0 w-[24%] h-[40%] bg-[#d2c7b5] border-r-4 border-b-4 border-[#2c2621] p-2">
        <div className="text-[9px] font-extrabold text-[#2c2621] tracking-wider border-b-2 border-[#2c2621] pb-1 flex justify-between">
          <span>CEO OFFICE</span>
          <span>📅</span>
        </div>
        {/* CEO Desk */}
        <div className="absolute top-12 left-5 w-24 h-14 bg-[#9a673b] border-2 border-[#2c2621] rounded flex items-center justify-center shadow">
          <div className="w-10 h-6 bg-[#2a2a2a] rounded flex items-center justify-center text-[9px] text-emerald-400">
            💻
          </div>
        </div>
      </div>

      {/* Top Center: Conference Room Wall */}
      <div className="absolute top-0 left-[24%] w-[48%] h-[40%] bg-[#d2c7b5] border-r-4 border-b-4 border-[#2c2621] p-2">
        <div className="text-[9px] font-extrabold text-[#2c2621] tracking-wider border-b-2 border-[#2c2621] pb-1">
          CONFERENCE ROOM
        </div>
        {/* Boardroom Table */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-56 h-16 bg-[#9a673b] border-2 border-[#2c2621] rounded-xl flex flex-col items-center justify-center shadow">
          <div className="flex space-x-2 mb-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-5 h-3 bg-[#6b306b] border border-[#2c2621] rounded-sm" />
            ))}
          </div>
          <span className="text-[8px] font-bold text-[#f5ebe0]">BOARDROOM TABLE</span>
        </div>
      </div>

      {/* Top Right: Quiet Room Wall */}
      <div className="absolute top-0 right-0 w-[28%] h-[40%] bg-[#d2c7b5] border-b-4 border-[#2c2621] p-2">
        <div className="text-[9px] font-extrabold text-[#2c2621] tracking-wider border-b-2 border-[#2c2621] pb-1">
          QUIET ROOM
        </div>
        <div className="flex justify-around mt-6">
          <div className="w-12 h-10 bg-[#9a673b] border border-[#2c2621] rounded flex items-center justify-center text-[9px]">💻</div>
          <div className="w-12 h-10 bg-[#9a673b] border border-[#2c2621] rounded flex items-center justify-center text-[9px]">💻</div>
        </div>
      </div>

      {/* 3. MAIN WORKSTATION DESK GRID (Center/Bottom Floor) */}
      <div className="absolute top-[44%] left-[4%] w-[68%] h-[50%] grid grid-cols-4 gap-4">
        {/* Row 1 Desks */}
        {[1, 2, 3, 4].map((desk) => (
          <div key={`r1-${desk}`} className="w-16 h-14 bg-[#9a673b] border-2 border-[#2c2621] rounded p-1 flex flex-col items-center justify-between shadow">
            <div className="w-8 h-5 bg-[#222] border border-[#111] rounded flex items-center justify-center text-[8px] text-cyan-400">💻</div>
            <div className="w-6 h-2 bg-[#2c2621] rounded-full" />
          </div>
        ))}
        {/* Row 2 Desks */}
        {[1, 2, 3, 4].map((desk) => (
          <div key={`r2-${desk}`} className="w-16 h-14 bg-[#9a673b] border-2 border-[#2c2621] rounded p-1 flex flex-col items-center justify-between shadow mt-2">
            <div className="w-8 h-5 bg-[#222] border border-[#111] rounded flex items-center justify-center text-[8px] text-amber-400">💻</div>
            <div className="w-6 h-2 bg-[#2c2621] rounded-full" />
          </div>
        ))}
      </div>

      {/* 4. MEMORY CORE SERVER ROOM (Bottom-Right) */}
      <div className="absolute bottom-2 right-2 w-[26%] h-[54%] bg-[#7ca382] border-4 border-[#2c2621] rounded-lg p-2 flex flex-col justify-between shadow-xl">
        <div className="bg-[#48704e] border-2 border-[#2c2621] px-2 py-1 rounded text-center">
          <span className="text-[10px] font-extrabold text-[#f4ece1] uppercase tracking-widest block">
            MEMORY CORE
          </span>
        </div>

        {/* Server Racks */}
        <div className="grid grid-cols-2 gap-1.5 my-1">
          <div className="bg-[#1e2e21] border-2 border-[#2c2621] p-1 rounded flex flex-col justify-between h-16 shadow">
            <div className="text-[7px] text-emerald-400 font-bold">RACK #01</div>
            <div className="w-full h-1 bg-emerald-400 animate-pulse rounded" />
            <div className="w-full h-1 bg-emerald-500 rounded" />
            <div className="w-full h-1 bg-emerald-400 rounded" />
          </div>
          <div className="bg-[#1e2e21] border-2 border-[#2c2621] p-1 rounded flex flex-col justify-between h-16 shadow">
            <div className="text-[7px] text-emerald-400 font-bold">RACK #02</div>
            <div className="w-full h-1 bg-emerald-400 rounded" />
            <div className="w-full h-1 bg-emerald-500 animate-pulse rounded" />
            <div className="w-full h-1 bg-emerald-400 rounded" />
          </div>
        </div>

        {/* Diagram Board & Lounge */}
        <div className="bg-[#f5ebe0] border-2 border-[#2c2621] rounded p-1 text-[8px] font-bold text-[#2c2621] flex justify-between items-center">
          <span>📋 DIAGRAM BOARD</span>
          <span>🛋️</span>
        </div>
      </div>

      {/* 5. CHARACTER PIXEL SPRITES */}
      {spriteList.map(({ type, name, role, avatar }) => {
        const pos = getAgentPos(type);
        const liveAgent = agents.find((a) => a.name.toLowerCase().includes(role.toLowerCase()) || name.toLowerCase().includes(a.name.toLowerCase()));
        const isWorking = liveAgent?.status === 'WORKING';
        const isSelected = liveAgent && selectedAgentId === liveAgent.id;

        return (
          <div
            key={type}
            onClick={() => liveAgent && onSelectAgent(liveAgent)}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 cursor-pointer z-30 group ${
              isSelected ? 'scale-125 ring-2 ring-amber-400 rounded-full' : 'hover:scale-110'
            }`}
          >
            {/* Speech Bubble */}
            {liveAgent?.current_task && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2c2621] text-[#f4ece1] text-[8px] font-bold px-1.5 py-0.5 rounded border border-[#f4ece1] shadow whitespace-nowrap z-40 animate-bounce">
                {isWorking ? `⚡ ${liveAgent.current_task.slice(0, 16)}...` : '✓ Done'}
              </div>
            )}

            {/* Sprite Body */}
            <div className="w-9 h-9 rounded-full bg-[#f4ece1] border-2 border-[#2c2621] shadow-lg flex items-center justify-center relative">
              <span className="text-base">{avatar}</span>
              {isWorking && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border border-[#2c2621] rounded-full animate-ping" />
              )}
            </div>

            {/* Name Tag */}
            <div className="mt-0.5 bg-[#2c2621] text-[#f4ece1] px-1 rounded text-center text-[7px] font-bold shadow truncate max-w-[60px]">
              {name.split(' ')[0]}
            </div>
          </div>
        );
      })}

      {/* 6. BOTTOM STATUS PILL OVERMAP */}
      <div className="absolute bottom-2 left-2 bg-[#f5ebe0] border-2 border-[#2c2621] px-3 py-1 rounded-md shadow-lg flex items-center space-x-1.5 z-20">
        <span className="text-[10px] font-black text-[#2c2621] uppercase">COMPANY STATUS:</span>
        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {companyStatus === 'IN_PROGRESS' ? 'RUNNING' : companyStatus}
        </span>
      </div>
    </div>
  );
}
