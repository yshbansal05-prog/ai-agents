'use client';

import React from 'react';

export type CharacterType =
  | 'arnav'
  | 'meera'
  | 'rohan'
  | 'isha'
  | 'kabir'
  | 'ananya'
  | 'vikram'
  | 'aditya'
  | 'priya'
  | 'siddharth'
  | 'employee1'
  | 'employee2'
  | 'employee3';

interface PixelCharacterProps {
  type: CharacterType;
  isWorking?: boolean;
  name?: string;
  className?: string;
  size?: number; // default height in px
}

/**
 * Pixel-perfect SVG sprite matching the retro RPG / pixel office character art in the reference screenshot
 */
export default function PixelCharacter({
  type,
  isWorking = false,
  name,
  className = '',
  size = 54
}: PixelCharacterProps) {
  // Character color palettes matching the screenshot
  const characterConfig = {
    // 1. Arnav (CEO / Dark curly hair, dark beard, navy/charcoal executive suit or blue hoodie)
    arnav: {
      skin: '#d49b6a',
      skinShadow: '#b0794c',
      hair: '#231815',
      hairHighlight: '#3d2b25',
      eyes: '#151110',
      shirt: '#2b5c8f', // Blue shirt/sweater with logo
      shirtDetail: '#6ba3d6',
      pants: '#1c2430',
      shoes: '#111111',
      hairStyle: 'curly'
    },
    // 2. Meera (Research / Red shirt / brown hair - rightmost in screenshot)
    meera: {
      skin: '#c98a58',
      skinShadow: '#a6683c',
      hair: '#5c2c1a',
      hairHighlight: '#7d3f28',
      eyes: '#1a1412',
      shirt: '#a62b2b', // Crimson red sweater
      shirtDetail: '#d9534f',
      pants: '#2d3748',
      shoes: '#1a202c',
      hairStyle: 'bob'
    },
    // 3. Rohan (CTO / Blond hair, blue jumpsuit - 3rd from left in screenshot)
    rohan: {
      skin: '#f5c698',
      skinShadow: '#d49b6a',
      hair: '#d4a028', // Golden blond hair
      hairHighlight: '#f0c048',
      eyes: '#1c1b18',
      shirt: '#2563eb', // Royal blue jumpsuit
      shirtDetail: '#60a5fa',
      pants: '#1d4ed8',
      shoes: '#111827',
      hairStyle: 'spiky'
    },
    // 4. Isha (Marketing / Dark hair, white long sleeve shirt - 4th desk in screenshot)
    isha: {
      skin: '#f2c89f',
      skinShadow: '#d6a070',
      hair: '#1c1917',
      hairHighlight: '#38332e',
      eyes: '#0f0e0d',
      shirt: '#e2e8f0', // Crisp white shirt
      shirtDetail: '#94a3b8',
      pants: '#334155',
      shoes: '#0f172a',
      hairStyle: 'parted'
    },
    // 5. Kabir (Finance / Dev / Dark skin, short black hair, brown/black jacket - middle standing character)
    kabir: {
      skin: '#8d5524',
      skinShadow: '#6b3b14',
      hair: '#171412',
      hairHighlight: '#29231f',
      eyes: '#0f0d0c',
      shirt: '#374151', // Charcoal black shirt
      shirtDetail: '#eab308',
      pants: '#1e293b',
      shoes: '#0f172a',
      hairStyle: 'fade'
    },
    // 6. Ananya (Product & UX / Purple sweater, auburn hair, chic designer)
    ananya: {
      skin: '#f0c294',
      skinShadow: '#d49a63',
      hair: '#831843', // Deep magenta/burgundy
      hairHighlight: '#9d174d',
      eyes: '#1c1917',
      shirt: '#7e22ce', // Royal purple sweater
      shirtDetail: '#c084fc',
      pants: '#1e1b4b',
      shoes: '#0f172a',
      hairStyle: 'parted'
    },
    // 7. Vikram (QA & InfoSec / Military tactical dark olive jacket)
    vikram: {
      skin: '#c48956',
      skinShadow: '#9c663b',
      hair: '#1c1917',
      hairHighlight: '#292524',
      eyes: '#111827',
      shirt: '#365314', // Tactical olive green
      shirtDetail: '#84cc16',
      pants: '#1f2937',
      shoes: '#030712',
      hairStyle: 'fade'
    },
    // 8. Aditya (DevOps & SRE / Teal tech hoodie, headset vibes)
    aditya: {
      skin: '#e2b183',
      skinShadow: '#bc8554',
      hair: '#292524',
      hairHighlight: '#44403c',
      eyes: '#0f172a',
      shirt: '#0f766e', // Deep teal hoodie
      shirtDetail: '#2dd4bf',
      pants: '#1e293b',
      shoes: '#020617',
      hairStyle: 'spiky'
    },
    // 9. Priya (Sales & BizDev / Terracotta amber blazer)
    priya: {
      skin: '#d49b6a',
      skinShadow: '#b0794c',
      hair: '#18181b',
      hairHighlight: '#27272a',
      eyes: '#18181b',
      shirt: '#b45309', // Warm amber blazer
      shirtDetail: '#fde68a',
      pants: '#292524',
      shoes: '#0c0a09',
      hairStyle: 'bob'
    },
    // 10. Siddharth (Legal & Compliance / Slate gray formal suit with silver tie)
    siddharth: {
      skin: '#edd0b0',
      skinShadow: '#ca9e77',
      hair: '#27272a',
      hairHighlight: '#3f3f46',
      eyes: '#18181b',
      shirt: '#334155', // Formal slate suit
      shirtDetail: '#cbd5e1',
      pants: '#1e293b',
      shoes: '#020617',
      hairStyle: 'parted'
    },
    // Fallback brown hair / worker (bottom row 3rd desk)
    employee1: {
      skin: '#f0be8b',
      skinShadow: '#cb9259',
      hair: '#543d2b',
      hairHighlight: '#78583e',
      eyes: '#1c1917',
      shirt: '#b45309',
      shirtDetail: '#f59e0b',
      pants: '#1e3a8a',
      shoes: '#0f172a',
      hairStyle: 'messy'
    }
  };

  const cfg = characterConfig[type as keyof typeof characterConfig] || characterConfig.arnav;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Sprite SVG Container */}
      <div
        style={{ width: `${size * 0.65}px`, height: `${size}px` }}
        className={`relative transition-transform duration-300 ${
          isWorking ? 'animate-[bounce_1.5s_infinite]' : ''
        }`}
      >
        <svg
          viewBox="0 0 32 48"
          className="w-full h-full drop-shadow-[0_4px_3px_rgba(0,0,0,0.45)]"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* 1. Character Shadow */}
          <ellipse cx="16" cy="45" rx="10" ry="3" fill="#1b241c" opacity="0.55" />

          {/* 2. Shoes */}
          <rect x="10" y="41" width="4" height="4" rx="1" fill={cfg.shoes} stroke="#111" strokeWidth="0.8" />
          <rect x="18" y="41" width="4" height="4" rx="1" fill={cfg.shoes} stroke="#111" strokeWidth="0.8" />

          {/* 3. Pants / Legs */}
          <rect x="10" y="32" width="4.5" height="10" rx="0.5" fill={cfg.pants} stroke="#111" strokeWidth="0.8" />
          <rect x="17.5" y="32" width="4.5" height="10" rx="0.5" fill={cfg.pants} stroke="#111" strokeWidth="0.8" />
          {/* Belt */}
          <rect x="9.5" y="31.5" width="13" height="2" fill="#18181b" />
          <rect x="15" y="31.5" width="2" height="2" fill="#eab308" />

          {/* 4. Torso / Shirt */}
          <rect x="8.5" y="19" width="15" height="13" rx="1.5" fill={cfg.shirt} stroke="#111" strokeWidth="0.8" />
          {/* Shirt Details (collar / logo / buttons) */}
          <rect x="13.5" y="19" width="5" height="2.5" fill={cfg.skin} />
          <polygon points="12,19 14,22 16,19" fill={cfg.shirtDetail} />
          <polygon points="20,19 18,22 16,19" fill={cfg.shirtDetail} />
          {/* Logo badge */}
          <rect x="12" y="24" width="8" height="5" rx="1" fill={cfg.shirtDetail} opacity="0.8" />
          <rect x="14" y="25.5" width="4" height="2" fill="#ffffff" opacity="0.9" />

          {/* 5. Arms & Hands */}
          {/* Left Arm */}
          <rect x="6" y="20" width="3" height="9" rx="1" fill={cfg.shirt} stroke="#111" strokeWidth="0.7" />
          <circle cx="7.5" cy="30" r="1.8" fill={cfg.skin} stroke="#111" strokeWidth="0.6" />
          {/* Right Arm */}
          <rect x="23" y="20" width="3" height="9" rx="1" fill={cfg.shirt} stroke="#111" strokeWidth="0.7" />
          <circle cx="24.5" cy="30" r="1.8" fill={cfg.skin} stroke="#111" strokeWidth="0.6" />

          {/* 6. Head & Neck */}
          <rect x="14" y="17" width="4" height="3" fill={cfg.skinShadow} />
          {/* Face Base */}
          <rect x="9.5" y="7" width="13" height="11.5" rx="2" fill={cfg.skin} stroke="#111" strokeWidth="0.8" />
          {/* Face Shadow bottom */}
          <rect x="11" y="16.5" width="10" height="2" fill={cfg.skinShadow} rx="1" />

          {/* 7. Eyes & Eyebrows */}
          <rect x="11.5" y="9.5" width="3" height="1" fill={cfg.hair} />
          <rect x="17.5" y="9.5" width="3" height="1" fill={cfg.hair} />
          {/* Eyes with white & pupil */}
          <rect x="12" y="11.5" width="2.5" height="3" rx="0.5" fill="#ffffff" />
          <rect x="13" y="12" width="1.5" height="2" fill={cfg.eyes} />
          <rect x="17.5" y="11.5" width="2.5" height="3" rx="0.5" fill="#ffffff" />
          <rect x="17.5" y="12" width="1.5" height="2" fill={cfg.eyes} />
          {/* Catchlight */}
          <rect x="13.5" y="12" width="0.8" height="0.8" fill="#ffffff" />
          <rect x="18" y="12" width="0.8" height="0.8" fill="#ffffff" />

          {/* Nose & Mouth */}
          <rect x="15" y="14" width="2" height="1" fill={cfg.skinShadow} />
          <rect x="14.5" y="16" width="3" height="0.8" fill="#5a3825" />

          {/* 8. Hair Styles (matching the distinct characters in the screenshot) */}
          {cfg.hairStyle === 'curly' && (
            // Afro / Curly voluminous dark hair (Arnav)
            <g>
              <ellipse cx="16" cy="7" rx="8" ry="6" fill={cfg.hair} stroke="#111" strokeWidth="0.8" />
              <circle cx="9" cy="8" r="3" fill={cfg.hair} />
              <circle cx="23" cy="8" r="3" fill={cfg.hair} />
              <circle cx="12" cy="4" r="3" fill={cfg.hairHighlight} />
              <circle cx="16" cy="3.5" r="3.5" fill={cfg.hairHighlight} />
              <circle cx="20" cy="4" r="3" fill={cfg.hairHighlight} />
              <circle cx="8" cy="11" r="2.5" fill={cfg.hair} />
              <circle cx="24" cy="11" r="2.5" fill={cfg.hair} />
              <path d="M 9.5 9 Q 16 6 22.5 9" stroke={cfg.hair} strokeWidth="2" fill="none" />
            </g>
          )}

          {cfg.hairStyle === 'spiky' && (
            // Golden blond layered hair (Rohan)
            <g>
              <path
                d="M 8 9 Q 7 3 13 3 Q 16 1 19 3 Q 25 3 24 9 Q 22 7 16 7 Q 10 7 8 9 Z"
                fill={cfg.hair}
                stroke="#111"
                strokeWidth="0.8"
              />
              {/* Spiky fringe bangs */}
              <polygon points="9,8 12,11 14,7" fill={cfg.hairHighlight} />
              <polygon points="13,7 16,11 18,7" fill={cfg.hair} />
              <polygon points="17,7 20,11 23,8" fill={cfg.hairHighlight} />
            </g>
          )}

          {cfg.hairStyle === 'parted' && (
            // Dark neatly parted hair (Isha)
            <g>
              <path
                d="M 8 9 Q 8 2 16 2 Q 24 2 24 9 Q 20 6 16 6 Q 12 6 8 9 Z"
                fill={cfg.hair}
                stroke="#111"
                strokeWidth="0.8"
              />
              <path d="M 8 9 Q 12 5 17 8 Q 21 6 24 9" stroke={cfg.hairHighlight} strokeWidth="1.5" fill="none" />
              <rect x="7.5" y="8" width="2" height="4" rx="1" fill={cfg.hair} />
              <rect x="22.5" y="8" width="2" height="4" rx="1" fill={cfg.hair} />
            </g>
          )}

          {cfg.hairStyle === 'bob' && (
            // Brown bob haircut (Meera)
            <g>
              <ellipse cx="16" cy="6.5" rx="7.5" ry="5.5" fill={cfg.hair} stroke="#111" strokeWidth="0.8" />
              <rect x="7" y="7" width="3" height="6" rx="1" fill={cfg.hair} />
              <rect x="22" y="7" width="3" height="6" rx="1" fill={cfg.hair} />
              <polygon points="9,8 14,10 16,7" fill={cfg.hairHighlight} />
              <polygon points="15,7 18,10 23,8" fill={cfg.hair} />
            </g>
          )}

          {cfg.hairStyle === 'fade' && (
            // Clean fade crop (Kabir)
            <g>
              <ellipse cx="16" cy="6" rx="7" ry="4.5" fill={cfg.hair} stroke="#111" strokeWidth="0.8" />
              <rect x="8.5" y="6" width="1.5" height="4" fill={cfg.hairHighlight} opacity="0.6" />
              <rect x="22" y="6" width="1.5" height="4" fill={cfg.hairHighlight} opacity="0.6" />
              <path d="M 9.5 8 Q 16 6.5 22.5 8" stroke={cfg.hair} strokeWidth="1.5" fill="none" />
            </g>
          )}

          {cfg.hairStyle === 'messy' && (
            // Brown messy style
            <g>
              <path
                d="M 8 9 Q 8 3 16 2 Q 24 3 24 9 Q 20 6 16 6.5 Q 11 6 8 9 Z"
                fill={cfg.hair}
                stroke="#111"
                strokeWidth="0.8"
              />
              <polygon points="10,8 13,11 15,7" fill={cfg.hairHighlight} />
              <polygon points="14,7 17,11 19,7" fill={cfg.hair} />
              <polygon points="18,7 21,11 23,8" fill={cfg.hairHighlight} />
            </g>
          )}
        </svg>
      </div>

      {/* Name Label */}
      {name && (
        <div className="mt-0.5 bg-[#2c2621] text-[#f4ece1] text-[7px] font-black px-1.5 py-0.2 rounded shadow whitespace-nowrap border border-[#f4ece1]/30">
          {name}
        </div>
      )}
    </div>
  );
}
