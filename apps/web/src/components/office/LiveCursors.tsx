'use client';

import React, { useEffect, useState } from 'react';
import { LiveUserCursor } from './OfficeTypes';

interface LiveCursorsProps {
  initialCursors: LiveUserCursor[];
}

export function LiveCursors({ initialCursors }: LiveCursorsProps) {
  const [cursors, setCursors] = useState<LiveUserCursor[]>(initialCursors);

  // Simulate subtle real-time cursor movement for live collaboration demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors((prev) =>
        prev.map((c) => {
          // Small smooth random motion simulation
          const dx = (Math.random() - 0.5) * 30;
          const dy = (Math.random() - 0.5) * 30;
          return {
            ...c,
            x: Math.max(100, Math.min(window.innerWidth - 200, c.x + dx)),
            y: Math.max(120, Math.min(window.innerHeight - 150, c.y + dy)),
          };
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {cursors.map((c) => (
        <div
          key={c.id}
          style={{
            position: 'fixed',
            left: `${c.x}px`,
            top: `${c.y}px`,
            pointerEvents: 'none',
            zIndex: 1000,
            transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {/* Custom Cursor SVG */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={c.color}
            stroke="#ffffff"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))' }}
          >
            <path d="M5.5 3.21l10.8 10.8-4.5 1.2 2.7 6.3-2.3 1-2.7-6.3-3.2 3.2V3.21z" />
          </svg>

          {/* User Tag */}
          <div
            style={{
              background: c.color,
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            {c.name}
            {c.status && (
              <span style={{ opacity: 0.85, fontWeight: 400, marginLeft: '4px' }}>
                ({c.status})
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
