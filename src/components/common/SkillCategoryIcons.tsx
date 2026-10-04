import React from 'react';

// 3D Yellow Construction Helmet
export const ConstructionHelmetIcon: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="helmetGrad" x1="16" y1="12" x2="48" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="helmetHighlight" x1="24" y1="14" x2="38" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
      </linearGradient>
      <filter id="helmetShadow" x="4" y="8" width="56" height="52" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#CA8A04" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#helmetShadow)">
      {/* Helmet Dome */}
      <path
        d="M14 36C14 23 22 13 32 13C42 13 50 23 50 36C50 37.5 49 39 47 39L17 39C15 39 14 37.5 14 36Z"
        fill="url(#helmetGrad)"
      />
      {/* Center Ridge */}
      <path
        d="M29 13C29 13 31 11.5 32 11.5C33 11.5 35 13 35 13L36 38L28 38L29 13Z"
        fill="#FACC15"
      />
      {/* Dome Highlight */}
      <ellipse cx="25" cy="22" rx="7" ry="5" fill="url(#helmetHighlight)" />
      {/* Brim / Visor */}
      <path
        d="M10 39C10 37.5 12 37 17 37L47 37C52 37 54 37.5 54 39C54 42.5 46 45 32 45C18 45 10 42.5 10 39Z"
        fill="#CA8A04"
      />
      <path
        d="M12 39.5C14 38.5 22 38 32 38C42 38 50 38.5 52 39.5C51 42 43 43.5 32 43.5C21 43.5 13 42 12 39.5Z"
        fill="#EAB308"
      />
    </g>
  </svg>
);

// 3D Glowing Blue Processor / Circuit
export const ElectricalChipIcon: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chipGrad" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0C4A6E" />
      </linearGradient>
      <filter id="chipGlow" x="4" y="4" width="56" height="56" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0284C7" floodOpacity="0.45" />
      </filter>
    </defs>
    <g filter="url(#chipGlow)">
      {/* Connecting Pins */}
      {/* Top Pins */}
      <line x1="22" y1="10" x2="22" y2="16" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="8" x2="32" y2="16" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="10" x2="42" y2="16" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bottom Pins */}
      <line x1="22" y1="48" x2="22" y2="54" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="48" x2="32" y2="56" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="48" x2="42" y2="54" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Left Pins */}
      <line x1="10" y1="22" x2="16" y2="22" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="32" x2="16" y2="32" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="42" x2="16" y2="42" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Right Pins */}
      <line x1="48" y1="22" x2="54" y2="22" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="32" x2="56" y2="32" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="42" x2="54" y2="42" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Chip Body */}
      <rect x="16" y="16" width="32" height="32" rx="6" fill="url(#chipGrad)" stroke="#7DD3FC" strokeWidth="1.2" />
      {/* Inner Circuit Core */}
      <rect x="23" y="23" width="18" height="18" rx="3" fill="#0369A1" stroke="#BAE6FD" strokeWidth="1" />
      {/* Core Tracks */}
      <circle cx="32" cy="32" r="3" fill="#E0F2FE" />
      <path d="M28 28L31 31M36 28L33 31M28 36L31 33M36 36L33 33" stroke="#7DD3FC" strokeWidth="1.2" />
    </g>
  </svg>
);

// 3D Dark Metallic Industrial Gear
export const AutomotiveGearIcon: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gearGrad" x1="14" y1="14" x2="50" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <radialGradient id="gearCenter" cx="32" cy="32" r="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#1E293B" />
      </radialGradient>
      <filter id="gearShadow" x="6" y="6" width="52" height="52" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="url(#gearShadow)">
      {/* Gear Teeth & Body */}
      <path
        d="M29 10L35 10L36 15C37.5 15.5 39 16.2 40.4 17.1L45 14.8L49.2 19L46.9 23.6C47.8 25 48.5 26.5 49 28L54 29L54 35L49 36C48.5 37.5 47.8 39 46.9 40.4L49.2 45L45 49.2L40.4 46.9C39 47.8 37.5 48.5 36 49L35 54L29 54L28 49C26.5 48.5 25 47.8 23.6 46.9L19 49.2L14.8 45L17.1 40.4C16.2 39 15.5 37.5 15 36L10 35L10 29L15 28C15.5 26.5 16.2 25 17.1 23.6L14.8 19L19 14.8L23.6 17.1C25 16.2 26.5 15.5 28 15L29 10Z"
        fill="url(#gearGrad)"
        stroke="#94A3B8"
        strokeWidth="1.2"
      />
      {/* Inner Rim & Hole */}
      <circle cx="32" cy="32" r="14" fill="url(#gearCenter)" stroke="#64748B" strokeWidth="1" />
      <circle cx="32" cy="32" r="6" fill="#090D16" />
      <circle cx="32" cy="32" r="5" stroke="#475569" strokeWidth="0.8" />
    </g>
  </svg>
);

// 3D Dark Metallic Plumbing Pipe
export const PlumbingPipeIcon: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pipeGrad" x1="12" y1="14" x2="52" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="40%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <filter id="pipeShadow" x="8" y="10" width="48" height="48" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="url(#pipeShadow)">
      {/* Vertical Pipe Flange Top */}
      <rect x="18" y="12" width="14" height="6" rx="2" fill="#64748B" stroke="#94A3B8" strokeWidth="0.8" />
      {/* Vertical Pipe segment */}
      <path
        d="M21 18 L29 18 L29 32 C29 37.5 33.5 42 39 42 L46 42 L46 50 L39 50 C29 50 21 42 21 32 Z"
        fill="url(#pipeGrad)"
        stroke="#64748B"
        strokeWidth="1.2"
      />
      {/* Pipe Highlight curve */}
      <path
        d="M23 18 L26 18 L26 32 C26 35 28 37 31 38"
        stroke="#94A3B8"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Horizontal Pipe Flange Right */}
      <rect x="46" y="39" width="6" height="14" rx="2" fill="#64748B" stroke="#94A3B8" strokeWidth="0.8" />
      {/* Pipe Joint Ring */}
      <rect x="19" y="24" width="12" height="4" rx="1.5" fill="#475569" stroke="#64748B" strokeWidth="0.8" />
    </g>
  </svg>
);

// 3D Modern Laptop with illuminated screen
export const ITDigitalLaptopIcon: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="screenGlow" x1="18" y1="16" x2="46" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
      <filter id="laptopShadow" x="6" y="10" width="52" height="48" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#laptopShadow)">
      {/* Screen Lid */}
      <rect x="16" y="14" width="32" height="23" rx="3.5" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
      {/* Screen Display */}
      <rect x="18" y="16" width="28" height="18" rx="2" fill="url(#screenGlow)" />
      {/* Code / App lines on screen */}
      <line x1="22" y1="20" x2="30" y2="20" stroke="#E0F2FE" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="23" x2="38" y2="23" stroke="#BAE6FD" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="26" x2="34" y2="26" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="40" cy="20" r="1.5" fill="#38BDF8" />
      {/* Laptop Base / Keyboard deck */}
      <path
        d="M10 40C10 38.5 12 37.5 14 37.5L50 37.5C52 37.5 54 38.5 54 40L51 44C50.5 44.5 49 45 47 45L17 45C15 45 13.5 44.5 13 44L10 40Z"
        fill="#334155"
        stroke="#64748B"
        strokeWidth="1"
      />
      {/* Trackpad notch */}
      <rect x="28" y="42" width="8" height="2" rx="1" fill="#1E293B" />
    </g>
  </svg>
);

// 3D Medical Stethoscope
export const HealthcareStethoscopeIcon: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="stethTubing" x1="14" y1="16" x2="50" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="50%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <radialGradient id="chestPiece" cx="44" cy="42" r="10" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="60%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#334155" />
      </radialGradient>
      <filter id="stethShadow" x="10" y="8" width="46" height="50" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.35" />
      </filter>
    </defs>
    <g filter="url(#stethShadow)">
      {/* Binaural Ear Tubes (metallic) */}
      <path
        d="M20 14 C20 10 24 10 24 14 L24 22 C24 26 27 28 30 28"
        stroke="#64748B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M40 14 C40 10 36 10 36 14 L36 22 C36 26 33 28 30 28"
        stroke="#64748B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Ear Tips */}
      <circle cx="20" cy="13" r="2.2" fill="#0F172A" />
      <circle cx="40" cy="13" r="2.2" fill="#0F172A" />

      {/* Flexible Tubing U-loop */}
      <path
        d="M30 28 L30 34 C30 44 20 44 20 34 C20 28 26 26 32 36 C36 42 40 43 44 42"
        fill="none"
        stroke="url(#stethTubing)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Chest Piece / Stethoscope Bell */}
      <circle cx="44" cy="42" r="7.5" fill="url(#chestPiece)" stroke="#CBD5E1" strokeWidth="1.2" />
      <circle cx="44" cy="42" r="4" fill="#1E293B" stroke="#94A3B8" strokeWidth="0.8" />
      <circle cx="44" cy="42" r="1.5" fill="#E2E8F0" />
    </g>
  </svg>
);
