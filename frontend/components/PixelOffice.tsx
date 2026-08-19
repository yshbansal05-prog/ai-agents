'use client';

import React, { useState } from 'react';
import { Agent } from '@/types';
import { sound } from '@/utils/sound';
import PixelCharacter, { CharacterType } from './PixelCharacter';
import PixelDesk from './PixelDesk';
import { Maximize2, Users } from 'lucide-react';

interface PixelOfficeProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  selectedAgentId?: string;
  companyStatus: string;
  hasDecision: boolean;
  hasReport: boolean;
  onOpenDiagram?: () => void;
  onOpenMemoryCore?: () => void;
}

export default function PixelOffice({
  agents,
  onSelectAgent,
  selectedAgentId,
  companyStatus,
  onOpenDiagram,
  onOpenMemoryCore
}: PixelOfficeProps) {
  // Manual meeting toggle (false by default so characters are at their desks)
  const [meetingMode, setMeetingMode] = useState<boolean>(false);

  const getAgent = (roleOrName: string) =>
    agents.find(
      (a) =>
        a.name.toLowerCase().includes(roleOrName.toLowerCase()) ||
        a.role.toLowerCase().includes(roleOrName.toLowerCase())
    );

  const ceo: Agent = getAgent('Arnav') || getAgent('CEO') || {
    id: 'agent-ceo',
    name: 'Arnav Sharma',
    role: 'CEO',
    objective: 'Lead organization and orchestrate strategy',
    status: 'WAITING',
    current_task: 'Review budget conflict',
    capabilities: [],
    dependencies: []
  };

  const research: Agent = getAgent('Meera') || getAgent('Research') || {
    id: 'agent-research',
    name: 'Meera Iyer',
    role: 'Research',
    objective: 'Market Intel',
    status: 'COMPLETED',
    current_task: 'Market research done',
    capabilities: [],
    dependencies: []
  };

  const cto: Agent = getAgent('Rohan') || getAgent('CTO') || {
    id: 'agent-cto',
    name: 'Rohan Verma',
    role: 'CTO',
    objective: 'Tech Architecture',
    status: 'WAITING',
    current_task: 'Tech spec drafted',
    capabilities: [],
    dependencies: []
  };

  const marketing: Agent = getAgent('Isha') || getAgent('Marketing') || {
    id: 'agent-marketing',
    name: 'Isha Malhotra',
    role: 'Marketing',
    objective: 'Growth & GTM',
    status: 'WORKING',
    current_task: 'Campus playbook',
    capabilities: [],
    dependencies: []
  };

  const finance: Agent = getAgent('Kabir') || getAgent('Finance') || getAgent('Dev') || {
    id: 'agent-finance',
    name: 'Kabir Singh',
    role: 'Finance',
    objective: 'Unit Economics',
    status: 'COMPLETED',
    current_task: 'Unit economics finalized',
    capabilities: [],
    dependencies: []
  };

  // Helper to render an interactive character attached directly to a desk
  const renderDeskCharacter = (agent: Agent, type: CharacterType, displayName: string) => {
    const isSelected = selectedAgentId === agent.id;
    const isWorking = agent.status === 'WORKING';

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          sound.playClick();
          onSelectAgent(agent);
        }}
        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-110 z-30' : 'hover:scale-105'
        }`}
      >
        {/* Speech / Task Status Bubble */}
        {agent.current_task && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2c2621] text-[#f4ece1] text-[7px] font-black px-1.5 py-0.2 rounded border border-[#f4ece1] shadow whitespace-nowrap z-30 animate-bounce">
            {isWorking ? `⚡ ${agent.current_task.slice(0, 14)}...` : '✓ Ready'}
          </div>
        )}

        {/* Selection Indicator Ring */}
        {isSelected && (
          <div className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping -z-10" />
        )}

        <PixelCharacter type={type} isWorking={isWorking} name={displayName} size={46} />
      </div>
    );
  };

  return (
    <div className="w-full h-[540px] bg-[#d5ceb9] border-4 border-[#2c2621] rounded-lg relative overflow-hidden font-mono shadow-2xl select-none">
      {/* 1. SAGE GREEN TILED FLOOR GRID (matching reference image) */}
      <div
        className="absolute inset-0 bg-[#598460]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1.5px, transparent 0),
            linear-gradient(to right, rgba(0,0,0,0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.18) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px'
        }}
      />

      {/* 2. TOP ROOMS LAYER */}

      {/* Top Left: CEO Office */}
      <div className="absolute top-0 left-0 w-[20%] h-[38%] bg-[#d2c7b5] border-r-4 border-b-4 border-[#2c2621] p-1.5 flex flex-col z-10">
        <div className="text-[8px] font-black text-[#2c2621] tracking-wider border-b-2 border-[#2c2621] pb-0.5 flex justify-between items-center">
          <span>CEO OFFICE</span>
          <span className="text-[7px] text-[#4a3e37]">▼</span>
        </div>
        {/* CEO Desk with Arnav Standing */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="cyan" accessories="papers" hasChair={true} />
            {!meetingMode && renderDeskCharacter(ceo, 'arnav', 'Arnav')}
          </div>
        </div>
      </div>

      {/* Top Center: Conference Room */}
      <div className="absolute top-0 left-[20%] w-[45%] h-[38%] bg-[#d2c7b5] border-r-4 border-b-4 border-[#2c2621] p-1.5 z-10">
        <div className="text-[8px] font-black text-[#2c2621] tracking-wider border-b-2 border-[#2c2621] pb-0.5 flex justify-between items-center">
          <span>CONFERENCE ROOM</span>
          <button
            onClick={() => {
              sound.playClick();
              setMeetingMode(!meetingMode);
            }}
            className="text-[7px] px-1.5 py-0.2 bg-[#f4ece1] hover:bg-[#ebdcd0] border border-[#2c2621] rounded font-bold text-[#2c2621] cursor-pointer flex items-center gap-0.5"
            title="Toggle All-Hands Boardroom Meeting"
          >
            <Users className="w-2 h-2" />
            <span>{meetingMode ? 'Disperse' : 'All-Hands'}</span>
          </button>
        </div>

        {/* Boardroom Table */}
        <div className="relative flex items-center justify-center h-[82%]">
          <div className="w-56 h-15 bg-[#9a673b] border-2 border-[#2c2621] rounded-2xl flex flex-col items-center justify-center shadow-md relative">
            <div className="flex space-x-3 -mt-1 mb-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-5 h-3 bg-[#6b306b] border border-[#2c2621] rounded-xs shadow-xs" />
              ))}
            </div>
            <span className="text-[7px] font-black text-[#f5ebe0] tracking-widest">BOARDROOM TABLE</span>

            {/* When Meeting Mode is activated, agents gather around the table */}
            {meetingMode && (
              <div className="absolute inset-0 flex items-center justify-around z-30 pointer-events-auto px-2">
                {[
                  { agent: ceo, type: 'arnav' as CharacterType, name: 'Arnav' },
                  { agent: research, type: 'meera' as CharacterType, name: 'Meera' },
                  { agent: cto, type: 'rohan' as CharacterType, name: 'Rohan' },
                  { agent: marketing, type: 'isha' as CharacterType, name: 'Isha' },
                  { agent: finance, type: 'kabir' as CharacterType, name: 'Kabir' }
                ].map(({ agent, type, name }) => (
                  <div
                    key={agent.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      onSelectAgent(agent);
                    }}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    <PixelCharacter type={type} isWorking={agent.status === 'WORKING'} name={name} size={42} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Right: Quiet Room */}
      <div className="absolute top-0 right-0 w-[35%] h-[38%] bg-[#d2c7b5] border-b-4 border-[#2c2621] p-1.5 z-10">
        <div className="text-[8px] font-black text-[#2c2621] tracking-wider border-b-2 border-[#2c2621] pb-0.5">
          QUIET ROOM
        </div>
        <div className="flex justify-around items-center h-[82%] px-1">
          <PixelDesk monitorScreenColor="emerald" accessories="mug" />
          <PixelDesk monitorScreenColor="blue" accessories="none" />
        </div>
      </div>

      {/* 3. MAIN OPEN FLOOR PLAN DESKS (Exact placement matching reference image) */}
      <div className="absolute top-[41%] left-[2%] w-[68%] h-[56%] flex flex-col justify-between py-1 z-10">
        {/* ROW 1: 5 DESKS */}
        <div className="grid grid-cols-5 gap-2">
          {/* Row 1 Desk 1: Meera (Research - Afro/Dark hair blue shirt style) */}
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="cyan" accessories="mug" />
            {!meetingMode && renderDeskCharacter(research, 'arnav', 'Meera')}
          </div>

          {/* Row 1 Desk 2: Empty Desk */}
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="black" accessories="none" />
          </div>

          {/* Row 1 Desk 3: Rohan (CTO - Blond hair, blue jumpsuit) */}
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="amber" accessories="mug" />
            {!meetingMode && renderDeskCharacter(cto, 'rohan', 'Rohan')}
          </div>

          {/* Row 1 Desk 4: Isha (Marketing - Dark hair, white long sleeve) */}
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="blue" accessories="papers" />
            {!meetingMode && renderDeskCharacter(marketing, 'isha', 'Isha')}
          </div>

          {/* Row 1 Desk 5: Empty Desk */}
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="emerald" accessories="mug" />
          </div>
        </div>

        {/* ROW 2: 5 DESKS */}
        <div className="grid grid-cols-5 gap-2">
          {/* Row 2 Desk 1: Empty Desk */}
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="black" accessories="none" />
          </div>

          {/* Row 2 Desk 2: Empty Desk */}
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="black" accessories="mug" />
          </div>

          {/* Row 2 Desk 3: Assistant / Dev Employee */}
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="blue" accessories="papers" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <PixelCharacter type="employee1" size={46} name="Dev" />
            </div>
          </div>

          {/* Row 2 Desk 4: Empty Desk */}
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="black" accessories="none" />
          </div>

          {/* Row 2 Desk 5: Empty Desk */}
          <div className="relative flex flex-col items-center">
            <PixelDesk monitorScreenColor="cyan" accessories="mug" />
          </div>
        </div>
      </div>

      {/* STANDING IN AISLE (Kabir - Finance / Dev - Dark skin, black jacket standing between desks) */}
      {!meetingMode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            onSelectAgent(finance);
          }}
          className={`absolute left-[58%] top-[65%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-transform duration-200 ${
            selectedAgentId === finance.id ? 'scale-110 z-30' : 'hover:scale-105'
          }`}
        >
          {/* Speech / Task Status Bubble */}
          {finance.current_task && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2c2621] text-[#f4ece1] text-[7px] font-black px-1.5 py-0.2 rounded border border-[#f4ece1] shadow whitespace-nowrap z-30 animate-bounce">
              {finance.status === 'WORKING' ? `⚡ ${finance.current_task.slice(0, 14)}...` : '✓ Ready'}
            </div>
          )}

          {selectedAgentId === finance.id && (
            <div className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping -z-10" />
          )}

          <PixelCharacter type="kabir" isWorking={finance.status === 'WORKING'} name="Kabir" size={48} />
        </div>
      )}

      {/* 4. MEMORY CORE SERVER ROOM (Bottom-Right) */}
      <div
        onClick={onOpenMemoryCore}
        className="absolute bottom-2 right-2 w-[27%] h-[58%] bg-[#7ca382] border-4 border-[#2c2621] rounded-lg p-1.5 flex flex-col justify-between shadow-xl cursor-pointer hover:brightness-105 transition z-20"
      >
        {/* Header */}
        <div className="bg-[#48704e] border-2 border-[#2c2621] py-0.5 rounded text-center">
          <span className="text-[9px] font-black text-[#f4ece1] uppercase tracking-widest block">
            MEMORY CORE
          </span>
        </div>

        {/* Server Racks */}
        <div className="grid grid-cols-2 gap-1 my-1">
          <div className="bg-[#1e2e21] border-2 border-[#2c2621] p-1 rounded flex flex-col justify-between h-20 shadow">
            <div className="text-[7px] text-emerald-400 font-bold uppercase">RACK #01</div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-emerald-400 animate-pulse rounded" />
              <div className="w-full h-1 bg-emerald-400 rounded" />
              <div className="w-full h-1 bg-emerald-500 rounded" />
              <div className="w-full h-1 bg-emerald-400 rounded" />
            </div>
          </div>

          <div className="bg-[#1e2e21] border-2 border-[#2c2621] p-1 rounded flex flex-col justify-between h-20 shadow">
            <div className="text-[7px] text-emerald-400 font-bold uppercase">RACK #02</div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-emerald-400 rounded" />
              <div className="w-full h-1 bg-emerald-500 animate-pulse rounded" />
              <div className="w-full h-1 bg-emerald-400 rounded" />
              <div className="w-full h-1 bg-emerald-400 rounded" />
            </div>
          </div>
        </div>

        {/* Diagram Board Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            if (onOpenDiagram) onOpenDiagram();
          }}
          className="bg-[#f5ebe0] hover:bg-[#ebdcd0] border-2 border-[#2c2621] rounded p-1 text-[8px] font-black text-[#2c2621] flex justify-between items-center transition cursor-pointer shadow"
        >
          <span>📋 DIAGRAM BOARD</span>
          <Maximize2 className="w-2.5 h-2.5 text-[#2c2621]" />
        </button>
      </div>

      {/* 5. BOTTOM STATUS PILL OVERMAP */}
      <div className="absolute bottom-2 left-2 bg-[#f5ebe0] border-2 border-[#2c2621] px-2.5 py-0.5 rounded shadow-lg flex items-center space-x-1.5 z-20">
        <span className="text-[9px] font-black text-[#2c2621] uppercase">COMPANY STATUS:</span>
        <span className="inline-flex items-center text-[9px] font-black text-emerald-800 gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {companyStatus === 'IN_PROGRESS' || companyStatus === 'RUNNING'
            ? 'RUNNING'
            : companyStatus}
        </span>
      </div>
    </div>
  );
}
