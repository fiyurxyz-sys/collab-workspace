'use client';

import React from 'react';
import { Room } from './OfficeTypes';

interface MobileRoomListProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export function MobileRoomList({ rooms, onSelectRoom }: MobileRoomListProps) {
  return (
    <div style={{ padding: '1.5rem 1rem', width: '100%', backgroundColor: '#090d16', color: '#ffffff' }}>
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        Toplantı Odaları 🚪
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
        Girmek istediğiniz odaya dokunun
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => onSelectRoom(room)}
            style={{
              backgroundColor: 'rgba(18, 24, 40, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: room.color,
                  textTransform: 'uppercase',
                }}
              >
                {room.category}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2px', color: '#ffffff' }}>
                {room.name}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                🟢 {room.activeUsers.length} kişi içeride
              </span>
            </div>

            <button
              type="button"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: 'none',
              }}
            >
              Gir &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
