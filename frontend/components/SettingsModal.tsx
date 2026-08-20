'use client';

import React from 'react';
import { X, Settings, Volume2, VolumeX, Sliders, RefreshCw, Zap, Server } from 'lucide-react';
import { sound } from '@/utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  setApiBase: (url: string) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onResetOrg: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  apiBase,
  setApiBase,
  simulationSpeed,
  setSimulationSpeed,
  soundEnabled,
  setSoundEnabled,
  onResetOrg
}: SettingsModalProps) {
  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-mono">
      <div className="w-full max-w-lg bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-4 border-[#2c2621] bg-[#e4d3c3] p-3">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#2c2621]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#2c2621]">
              AI ORG OS SETTINGS & CONFIGURATION
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-[#f4ece1] hover:bg-[#d8c3b1] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 bg-[#f9f3eb] text-[#2c2621]">
          {/* Sound FX Setting */}
          <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-800" /> : <VolumeX className="w-4 h-4 text-[#8c7b70]" />}
              <div>
                <div className="text-xs font-black uppercase">8-Bit Sound Synthesizer</div>
                <div className="text-[9px] text-[#6b5b52]">Retro beeps on ticks, task completions, and command executes</div>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1 text-xs font-bold rounded border-2 transition cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-700 text-white border-[#2c2621]'
                  : 'bg-[#e4d3c3] text-[#2c2621] border-[#8c7b70]'
              }`}
            >
              {soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* Simulation Speed */}
          <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#2c2621]" />
                <span className="text-xs font-black uppercase">Simulation Pace</span>
              </div>
              <span className="text-xs font-black text-[#8c3b00]">{simulationSpeed}x Speed</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[0.5, 1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setSimulationSpeed(speed);
                    sound.playClick();
                  }}
                  className={`py-1 text-xs font-black rounded border-2 transition cursor-pointer ${
                    simulationSpeed === speed
                      ? 'bg-[#2c2621] text-[#f4ece1] border-[#2c2621]'
                      : 'bg-[#e4d3c3] text-[#2c2621] border-[#8c7b70] hover:bg-[#d8c3b1]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Backend API Endpoint */}
          <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 space-y-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-[#2c2621]" />
              <span className="text-xs font-black uppercase">Backend API URL</span>
            </div>
            <input
              type="text"
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              className="w-full bg-[#f9f3eb] border-2 border-[#2c2621] rounded px-2.5 py-1 text-xs text-[#2c2621] font-mono focus:outline-none"
            />
            <p className="text-[9px] text-[#6b5b52]">
              Defaults to FastAPI endpoint at <code>http://localhost:8000/api/company</code>. Automatically falls back to offline live simulation when server is unreachable.
            </p>
          </div>

          {/* Reset Organization */}
          <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-black uppercase text-rose-800">Reset Organization State</div>
              <div className="text-[9px] text-[#6b5b52]">Clears current memory and restores sample MVP</div>
            </div>
            <button
              onClick={() => {
                onResetOrg();
                sound.playClick();
              }}
              className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded border-2 border-[#2c2621] text-xs font-bold transition shadow cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t-2 border-[#2c2621] bg-[#e4d3c3] p-2.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-[#2c2621] hover:bg-[#3d3630] text-[#f4ece1] rounded text-xs font-bold transition shadow cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
