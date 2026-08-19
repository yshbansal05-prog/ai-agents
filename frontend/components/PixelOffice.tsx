'use client';

import React from 'react';
import { Agent } from '@/types';
import { sound } from '@/utils/sound';
import PixelCharacter, { CharacterType } from './PixelCharacter';
import PixelDesk from './PixelDesk';
import { Maximize2 } from 'lucide-react';

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
  hasDecision,
  onOpenDiagram,
  onOpenMemoryCore
}: PixelOfficeProps) {
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

  // Agent sprite configurations with coordinates matching the screenshot
  const characterSprites: {
    id: string;
    agent: Agent;
    type: CharacterType;
    name: string;
    normalPos: { x: number; y: number };
    meetingPos: { x: number; y: number };
  }[] = [
    {
      id: 'ceo',
      agent: ceo,
      type: 'arnav',
      name: 'Arnav',
      normalPos: { x: 10, y: 22 }, // In CEO Office
      meetingPos: { x: 38, y: 16 }
    },
    {
      id: 'research',
      agent: research,
      type: 'meera',
      name: 'Meera',
      normalPos: { x: 9.5, y: 49 }, // Row 1 Desk 1 (Top Left)
      meetingPos: { x: 44, y: 16 }
    },
    {
      id: 'cto',
      agent: cto,
      type: 'rohan',
      name: 'Rohan',
      normalPos: { x: 25.5, y: 49 }, // Row 1 Desk 3 (Blond character)
      meetingPos: { x: 50, y: 16 }
    },
    {
      id: 'marketing',
      agent: marketing,
      type: 'isha',
      name: 'Isha',
      normalPos: { x: 37, y: 49 }, // Row 1 Desk 4 (White shirt)
      meetingPos: { x: 40, y: 28 }
    },
    {
      id: 'finance',
      agent: finance,
      type: 'kabir',
      name: 'Kabir',
      normalPos: { x: 53, y: 55 }, // Standing in aisle (Dark skin / black shirt)
      meetingPos: { x: 48, y: 28 }
    }
  ];

  return (
    <div className="w-full h-[540px] bg-[#d5ceb9] border-4 border-[#2c2621] rounded-lg relative overflow-hidden font-mono shadow-2xl select-none">
      {/* 1. SAGE GREEN TILED FLOOR GRID WITH INTERSECTION DOTS (matching reference image) */}
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
      <div className="absolute top-0 left-0 w-[20%] h-[37%] bg-[#d2c7b5] border-r-4 border-b-4 border-[#2c2621] p-1.5 flex flex-col">
        <div className="text-[8px] font-black text-[#2c2621] tracking-wider border-b-2 border-[#2c2621] pb-0.5 flex justify-between items-center">
          <span>CEO OFFICE</span>
          <span className="text-[7px] text-[#4a3e37]">▼</span>
        </div>
        {/* CEO Desk */}
        <div className="relative flex-1 flex items-center justify-center">
          <PixelDesk monitorScreenColor="cyan" accessories="papers" hasChair={true} />
        </div>
      </div>

      {/* Top Center: Conference Room */}
      <div className="absolute top-0 left-[20%] w-[45%] h-[37%] bg-[#d2c7b5] border-r-4 border-b-4 border-[#2c2621] p-1.5">
        <div className="text-[8px] font-black text-[#2c2621] tracking-wider border-b-2 border-[#2c2621] pb-0.5">
          CONFERENCE ROOM
        </div>
        {/* Boardroom Table */}
        <div className="relative flex items-center justify-center h-[82%]">
          <div className="w-56 h-15 bg-[#9a673b] border-2 border-[#2c2621] rounded-2xl flex flex-col items-center justify-center shadow-md">
            <div className="flex space-x-3 -mt-1 mb-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-5 h-3 bg-[#6b306b] border border-[#2c2621] rounded-xs shadow-xs" />
              ))}
            </div>
            <span className="text-[7px] font-black text-[#f5ebe0] tracking-widest">BOARDROOM TABLE</span>
          </div>
        </div>
      </div>

      {/* Top Right: Quiet Room */}
      <div className="absolute top-0 right-0 w-[35%] h-[37%] bg-[#d2c7b5] border-b-4 border-[#2c2621] p-1.5">
        <div className="text-[8px] font-black text-[#2c2621] tracking-wider border-b-2 border-[#2c2621] pb-0.5">
          QUIET ROOM
        </div>
        <div className="flex justify-around items-center h-[82%] px-1">
          <PixelDesk monitorScreenColor="emerald" accessories="mug" />
          <PixelDesk monitorScreenColor="blue" accessories="none" />
        </div>
      </div>

      {/* 3. MAIN OPEN FLOOR DESKS (Row 1 & Row 2 matching the user's image) */}
      <div className="absolute top-[40%] left-[2%] w-[68%] h-[56%] flex flex-col justify-between py-1 pointer-events-none">
        {/* Row 1 Desks */}
        <div className="grid grid-cols-5 gap-2">
          <PixelDesk monitorScreenColor="cyan" accessories="mug" />
          <PixelDesk monitorScreenColor="black" accessories="none" />
          <PixelDesk monitorScreenColor="amber" accessories="mug" />
          <PixelDesk monitorScreenColor="blue" accessories="papers" />
          <PixelDesk monitorScreenColor="emerald" accessories="mug" />
        </div>

        {/* Row 2 Desks */}
        <div className="grid grid-cols-5 gap-2">
          <PixelDesk monitorScreenColor="black" accessories="none" />
          <PixelDesk monitorScreenColor="black" accessories="mug" />
          <PixelDesk monitorScreenColor="blue" accessories="papers" />
          <PixelDesk monitorScreenColor="black" accessories="none" />
          <PixelDesk monitorScreenColor="cyan" accessories="mug" />
        </div>
      </div>

      {/* Secondary Floor Decorative Character (Row 2 Desk 3 Employee) */}
      <div className="absolute left-[34%] top-[78%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <PixelCharacter type="employee1" size={48} />
      </div>

      {/* 4. MEMORY CORE SERVER ROOM (Bottom-Right) */}
      <div
        onClick={onOpenMemoryCore}
        className="absolute bottom-2 right-2 w-[27%] h-[58%] bg-[#7ca382] border-4 border-[#2c2621] rounded-lg p-1.5 flex flex-col justify-between shadow-xl cursor-pointer hover:brightness-105 transition z-30"
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

      {/* 5. INTERACTIVE PIXEL ART HUMAN CHARACTERS */}
      {characterSprites.map(({ id, agent, type, name, normalPos, meetingPos }) => {
        const isMeeting = hasDecision && companyStatus === 'IN_PROGRESS';
        const pos = isMeeting ? meetingPos : normalPos;
        const isSelected = selectedAgentId === agent.id;
        const isWorking = agent.status === 'WORKING';

        return (
          <div
            key={id}
            onClick={() => {
              sound.playClick();
              onSelectAgent(agent);
            }}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 cursor-pointer z-30 group ${
              isSelected ? 'scale-115 z-40' : 'hover:scale-105'
            }`}
          >
            {/* Speech / Task Bubble */}
            {agent.current_task && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2c2621] text-[#f4ece1] text-[7px] font-black px-1.5 py-0.5 rounded border border-[#f4ece1] shadow whitespace-nowrap z-40 animate-bounce">
                {isWorking ? `⚡ ${agent.current_task.slice(0, 14)}...` : '✓ Ready'}
              </div>
            )}

            {/* Selection Glow Indicator */}
            {isSelected && (
              <div className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping -z-10" />
            )}

            {/* Render Full Pixel Art Human Sprite */}
            <PixelCharacter
              type={type}
              isWorking={isWorking}
              name={name}
              size={52}
            />
          </div>
        );
      })}

      {/* 6. BOTTOM STATUS PILL OVERMAP */}
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
