'use client';

import React from 'react';

interface PixelDeskProps {
  monitorScreenColor?: 'cyan' | 'amber' | 'emerald' | 'blue' | 'black';
  hasChair?: boolean;
  hasLaptop?: boolean;
  accessories?: 'mug' | 'papers' | 'none';
  className?: string;
}

/**
 * Pixel-art Office Desk matching the reference image:
 * Wooden surface, monitor with silver/white bezel & stand, mouse, accessories, and wooden chair.
 */
export default function PixelDesk({
  monitorScreenColor = 'cyan',
  hasChair = true,
  accessories = 'mug',
  className = ''
}: PixelDeskProps) {
  const screenGlows = {
    cyan: { bg: '#082f49', glow: '#38bdf8', text: '0101' },
    amber: { bg: '#451a03', glow: '#fbbf24', text: 'JS.TS' },
    emerald: { bg: '#022c22', glow: '#34d399', text: 'READY' },
    blue: { bg: '#172554', glow: '#60a5fa', text: 'RUN' },
    black: { bg: '#0f172a', glow: '#1e293b', text: '' }
  };

  const currentScreen = screenGlows[monitorScreenColor] || screenGlows.cyan;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Desk Unit SVG */}
      <svg
        viewBox="0 0 64 56"
        className="w-16 h-14 drop-shadow-[0_4px_4px_rgba(0,0,0,0.35)]"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* 1. Wooden Chair (Behind / under desk) */}
        {hasChair && (
          <g>
            {/* Chair Shadow */}
            <ellipse cx="32" cy="52" rx="7" ry="2" fill="#1b241c" opacity="0.45" />
            {/* Chair Legs */}
            <rect x="27" y="47" width="2" height="4" fill="#6b4423" stroke="#111" strokeWidth="0.5" />
            <rect x="35" y="47" width="2" height="4" fill="#6b4423" stroke="#111" strokeWidth="0.5" />
            {/* Chair Cushion */}
            <rect x="25" y="40" width="14" height="8" rx="1.5" fill="#c48a4a" stroke="#111" strokeWidth="0.8" />
            <rect x="26.5" y="41.5" width="11" height="5" fill="#d99f5e" />
            {/* Chair Backrest */}
            <rect x="26" y="36" width="12" height="4" rx="1" fill="#a06d35" stroke="#111" strokeWidth="0.7" />
          </g>
        )}

        {/* 2. Wooden Desk Legs Shadow & Base */}
        <rect x="4" y="24" width="3" height="6" fill="#6b4423" stroke="#111" strokeWidth="0.8" />
        <rect x="57" y="24" width="3" height="6" fill="#6b4423" stroke="#111" strokeWidth="0.8" />

        {/* 3. Main Wooden Desk Surface */}
        {/* Desk Edge Thickness */}
        <rect x="2" y="15" width="60" height="12" rx="1" fill="#935b2a" stroke="#111" strokeWidth="1" />
        {/* Top Surface */}
        <rect x="2" y="11" width="60" height="12" rx="1" fill="#c88b48" stroke="#111" strokeWidth="1" />
        {/* Wood grain highlight lines */}
        <line x1="6" y1="14" x2="58" y2="14" stroke="#dba05e" strokeWidth="1" />
        <line x1="8" y1="18" x2="56" y2="18" stroke="#b07535" strokeWidth="0.8" />

        {/* 4. Desktop Monitor */}
        {/* Monitor Base Stand */}
        <ellipse cx="32" cy="18.5" rx="5" ry="1.5" fill="#94a3b8" stroke="#111" strokeWidth="0.6" />
        <rect x="31" y="12" width="2" height="6" fill="#cbd5e1" stroke="#111" strokeWidth="0.6" />

        {/* Monitor Outer Bezel (Silver / White as in screenshot) */}
        <rect x="21" y="1" width="22" height="14" rx="1.5" fill="#e2e8f0" stroke="#111" strokeWidth="1" />
        {/* Monitor Inner Screen Display */}
        <rect x="22.5" y="2.5" width="19" height="10.5" rx="0.8" fill={currentScreen.bg} stroke="#000" strokeWidth="0.6" />

        {/* Glowing Terminal Line inside monitor */}
        <rect x="24" y="4" width="10" height="1.5" rx="0.5" fill={currentScreen.glow} opacity="0.9" />
        <rect x="24" y="6.5" width="16" height="1.5" rx="0.5" fill={currentScreen.glow} opacity="0.75" />
        <rect x="24" y="9" width="7" height="1.5" rx="0.5" fill={currentScreen.glow} opacity="0.85" />

        {/* 5. Keyboard & Mouse */}
        <rect x="26" y="19" width="10" height="3" rx="0.5" fill="#334155" stroke="#111" strokeWidth="0.5" />
        {/* Key grid */}
        <line x1="27" y1="20.5" x2="35" y2="20.5" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="1,1" />
        {/* Mouse */}
        <ellipse cx="40" cy="20.5" rx="1.5" ry="1.8" fill="#475569" stroke="#111" strokeWidth="0.5" />

        {/* 6. Desk Accessories */}
        {accessories === 'mug' && (
          <g>
            {/* Coffee Mug */}
            <rect x="8" y="15" width="3" height="4" rx="0.5" fill="#38bdf8" stroke="#111" strokeWidth="0.6" />
            <path d="M 11 16 Q 12.5 17 11 18" stroke="#111" strokeWidth="0.6" fill="none" />
            <circle cx="9.5" cy="15" r="1" fill="#451a03" />
          </g>
        )}
        {accessories === 'papers' && (
          <g>
            {/* Paper documents / notebook */}
            <rect x="7" y="15" width="5" height="4" rx="0.5" fill="#f8fafc" stroke="#111" strokeWidth="0.6" />
            <line x1="8" y1="16.5" x2="11" y2="16.5" stroke="#94a3b8" strokeWidth="0.6" />
            <line x1="8" y1="18" x2="10" y2="18" stroke="#94a3b8" strokeWidth="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
}
