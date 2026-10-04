import React from 'react';
import indiaMap from '@svg-maps/india';

interface IndiaMapGraphicProps {
  width?: number;
  height?: number;
  className?: string;
}

export const IndiaMapGraphic: React.FC<IndiaMapGraphicProps> = ({
  width = 175,
  height = 195,
  className = ''
}) => {
  // Constellation network nodes (based on 612x696 viewBox)
  const nodes = [
    { id: 'srinagar', cx: 160, cy: 90, label: 'Kashmir', primary: true },
    { id: 'delhi', cx: 188, cy: 208, label: 'Delhi', primary: true },
    { id: 'jaipur', cx: 155, cy: 240 },
    { id: 'ahmedabad', cx: 95, cy: 320 },
    { id: 'mumbai', cx: 105, cy: 440, label: 'Mumbai', primary: true },
    { id: 'hyderabad', cx: 230, cy: 450, primary: true },
    { id: 'bengaluru', cx: 180, cy: 555, label: 'Bengaluru', primary: true },
    { id: 'chennai', cx: 250, cy: 560 },
    { id: 'kanyakumari', cx: 205, cy: 655, primary: true },
    { id: 'kolkata', cx: 410, cy: 338, label: 'Kolkata', primary: true },
    { id: 'patna', cx: 350, cy: 265 },
    { id: 'guwahati', cx: 485, cy: 260, label: 'Guwahati', primary: true },
    { id: 'bhopal', cx: 215, cy: 330 }
  ];

  const links = [
    ['srinagar', 'delhi'],
    ['delhi', 'jaipur'],
    ['jaipur', 'ahmedabad'],
    ['ahmedabad', 'mumbai'],
    ['delhi', 'bhopal'],
    ['bhopal', 'hyderabad'],
    ['mumbai', 'hyderabad'],
    ['hyderabad', 'bengaluru'],
    ['bengaluru', 'chennai'],
    ['bengaluru', 'kanyakumari'],
    ['delhi', 'patna'],
    ['patna', 'kolkata'],
    ['kolkata', 'guwahati'],
    ['bhopal', 'patna'],
    ['hyderabad', 'kolkata']
  ];

  return (
    <div
      className={`india-map-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 612 696"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.45))',
          overflow: 'visible'
        }}
      >
        <defs>
          <filter id="indiaNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="mapStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* 1. Official Precise State Boundaries from @svg-maps/india */}
        <g filter="url(#indiaNeonGlow)">
          {indiaMap.locations.map((loc: { id: string; name?: string; path: string }) => (
            <path
              key={loc.id}
              d={loc.path}
              fill="rgba(5, 30, 65, 0.55)"
              stroke="#00d4ff"
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{
                transition: 'fill 0.2s ease'
              }}
            />
          ))}
        </g>

        {/* 2. Constellation Network Connecting Major Hubs */}
        <g stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.4" strokeDasharray="3 4">
          {links.map(([fromId, toId], idx) => {
            const fromNode = nodes.find((n) => n.id === fromId);
            const toNode = nodes.find((n) => n.id === toId);
            if (!fromNode || !toNode) return null;
            return (
              <line
                key={`link-${idx}`}
                x1={fromNode.cx}
                y1={fromNode.cy}
                x2={toNode.cx}
                y2={toNode.cy}
              />
            );
          })}
        </g>

        {/* 3. Glowing City Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            {node.primary && (
              <circle
                cx={node.cx}
                cy={node.cy}
                r="6"
                fill="none"
                stroke="rgba(0, 212, 255, 0.5)"
                strokeWidth="1"
              />
            )}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.primary ? '4' : '2.8'}
              fill={node.primary ? '#FFFFFF' : '#38bdf8'}
              filter={node.primary ? 'url(#indiaNeonGlow)' : undefined}
            />
          </g>
        ))}
      </svg>

      {/* Skilled India Stronger India Typography */}
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <div
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontStyle: 'italic',
            fontSize: '15px',
            color: '#ffffff',
            letterSpacing: '0.02em',
            lineHeight: 1.2
          }}
        >
          Skilled India
        </div>
        <div
          style={{
            fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
            fontWeight: 800,
            fontSize: '16.5px',
            color: '#ffffff',
            letterSpacing: '0.01em',
            lineHeight: 1.25
          }}
        >
          Stronger India
        </div>

        {/* Tri-color Glowing Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            marginTop: '8px',
            width: '80px',
            margin: '8px auto 0 auto'
          }}
        >
          <div
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              background: '#FF9933',
              boxShadow: '0 0 6px rgba(255, 153, 51, 0.8)'
            }}
          />
          <div
            style={{
              width: '12px',
              height: '3px',
              borderRadius: '2px',
              background: '#FFFFFF',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)'
            }}
          />
          <div
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              background: '#138808',
              boxShadow: '0 0 6px rgba(19, 136, 8, 0.8)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
