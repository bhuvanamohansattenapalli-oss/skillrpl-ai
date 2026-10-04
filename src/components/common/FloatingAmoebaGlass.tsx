import React, { useState } from 'react';
import { Sparkles, Zap, Compass, TrendingUp, CheckCircle2 } from 'lucide-react';

interface FloatingAmoebaGlassProps {
  style?: React.CSSProperties;
}

/**
 * 3D Rectangular Glass Plate
 * Sleek, modern rectangular glass plate with multi-layered 3D spatial extrusion,
 * vivid jewel-tone pillars, specular reflections, and interactive perspective tilt.
 */
export const FloatingAmoebaGlass: React.FC<FloatingAmoebaGlassProps> = ({ style }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="floating-glass-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        right: '28px',
        top: '20px',
        bottom: '20px',
        width: '230px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        pointerEvents: 'auto',
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        ...style
      }}
    >
      {/* 3D Rectangular Glass Plate with Perspective Spatial Tilt */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '24px',
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, rgba(230, 244, 255, 0.18) 45%, rgba(200, 230, 255, 0.28) 100%)',
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          border: '1.5px solid rgba(255, 255, 255, 0.75)',
          boxShadow: isHovered
            ? '0 24px 50px rgba(5, 20, 50, 0.35), 0 6px 16px rgba(0, 0, 0, 0.12), inset 0 2px 2px #ffffff, inset 0 -2px 3px rgba(10, 40, 90, 0.2)'
            : '0 16px 38px rgba(5, 20, 50, 0.26), 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1.5px 2px #ffffff, inset 0 -1.5px 2px rgba(10, 40, 90, 0.15)',
          transform: isHovered
            ? 'perspective(1200px) rotateY(-4deg) rotateX(2deg) translateY(-6px) scale(1.03)'
            : 'perspective(1200px) rotateY(-11deg) rotateX(5deg) scale(1)',
          transformStyle: 'preserve-3d',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          cursor: 'default'
        }}
      >
        {/* Top Specular Edge Highlight Sheen */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '2px',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.95) 45%, rgba(255, 255, 255, 0.95) 55%, transparent 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* Diagonal Specular Reflection Sweep */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-60%',
            width: '200%',
            height: '200%',
            background:
              'linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.32) 48%, rgba(255, 255, 255, 0.08) 54%, transparent 62%)',
            pointerEvents: 'none',
            transform: isHovered ? 'translateX(15px)' : 'none',
            transition: 'transform 0.6s ease'
          }}
        />

        {/* Header: National RPL Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 11px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)',
            border: '1px solid rgba(255, 235, 130, 0.9)',
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35), inset 0 1px 1px #ffffff',
            alignSelf: 'flex-start',
            marginBottom: '12px',
            transform: 'translateZ(15px)'
          }}
        >
          <Sparkles size={12} color="#FFF275" style={{ filter: 'drop-shadow(0 0 6px #FFD700)' }} />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.7)'
            }}
          >
            National RPL
          </span>
        </div>

        {/* 3 Core Pillars with Vibrant 3D Glow */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
            width: '100%',
            transform: 'translateZ(25px)'
          }}
        >
          {/* 1. Skills - Electric Cyan */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 11px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.28) 0%, rgba(2, 132, 199, 0.16) 100%)',
              border: '1.2px solid rgba(56, 189, 248, 0.9)',
              boxShadow: '0 4px 14px rgba(0, 229, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
              transition: 'all 0.25s ease',
              transform: isHovered ? 'scale(1.02) translateX(3px)' : 'none'
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00F0FF 0%, #0284C7 100%)',
                boxShadow: '0 0 10px #00F0FF, 0 0 3px #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Zap size={11} color="#FFFFFF" strokeWidth={3} />
            </div>
            <span
              style={{
                fontSize: '14.5px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                textShadow: '0 0 10px rgba(0, 240, 255, 0.9), 0 2px 4px rgba(0, 15, 40, 0.85)'
              }}
            >
              Skills
            </span>
          </div>

          {/* 2. Opportunities - Electric Violet */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 11px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.28) 0%, rgba(124, 58, 237, 0.16) 100%)',
              border: '1.2px solid rgba(192, 132, 252, 0.9)',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
              transition: 'all 0.25s ease',
              transform: isHovered ? 'scale(1.02) translateX(3px)' : 'none'
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C084FC 0%, #7C3AED 100%)',
                boxShadow: '0 0 10px #C084FC, 0 0 3px #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Compass size={11} color="#FFFFFF" strokeWidth={3} />
            </div>
            <span
              style={{
                fontSize: '14.5px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                textShadow: '0 0 10px rgba(168, 85, 247, 0.9), 0 2px 4px rgba(0, 15, 40, 0.85)'
              }}
            >
              Opportunities
            </span>
          </div>

          {/* 3. Growth - Radiant Amber / Flame */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '7px 11px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.18) 100%)',
              border: '1.2px solid rgba(251, 191, 36, 0.9)',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
              transition: 'all 0.25s ease',
              transform: isHovered ? 'scale(1.02) translateX(3px)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FBBF24 0%, #EA580C 100%)',
                  boxShadow: '0 0 10px #FBBF24, 0 0 3px #FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <TrendingUp size={11} color="#FFFFFF" strokeWidth={3} />
              </div>
              <span
                style={{
                  fontSize: '14.5px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '0.02em',
                  textShadow: '0 0 10px rgba(245, 158, 11, 0.9), 0 2px 4px rgba(0, 15, 40, 0.85)'
                }}
              >
                Growth
              </span>
            </div>

            {/* Mini Ascending 4-Bar Sparkline */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
              <div
                style={{
                  width: '3.5px',
                  height: '5px',
                  borderRadius: '1.5px',
                  background: '#FDE047',
                  boxShadow: '0 0 5px #FDE047'
                }}
              />
              <div
                style={{
                  width: '3.5px',
                  height: '8px',
                  borderRadius: '1.5px',
                  background: '#FBBF24',
                  boxShadow: '0 0 5px #FBBF24'
                }}
              />
              <div
                style={{
                  width: '3.5px',
                  height: '11px',
                  borderRadius: '1.5px',
                  background: '#F59E0B',
                  boxShadow: '0 0 6px #F59E0B'
                }}
              />
              <div
                style={{
                  width: '3.5px',
                  height: '14px',
                  borderRadius: '1.5px',
                  background: '#FFFFFF',
                  boxShadow: '0 0 8px #FFFFFF'
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer: Live Verification Active */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.25)',
            transform: 'translateZ(15px)'
          }}
        >
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e'
            }}
          />
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)'
            }}
          >
            Skill Verification Active
          </span>
          <CheckCircle2
            size={12}
            color="#22c55e"
            style={{ marginLeft: 'auto', filter: 'drop-shadow(0 0 4px #22c55e)' }}
          />
        </div>
      </div>
    </div>
  );
};
