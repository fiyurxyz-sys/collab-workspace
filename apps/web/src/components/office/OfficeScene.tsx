'use client';

import React, { useState } from 'react';
import { Room } from './OfficeTypes';
import styles from './OfficeScene.module.css';

interface OfficeSceneProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export function OfficeScene({ rooms, onSelectRoom }: OfficeSceneProps) {
  const [zoomingRoomId, setZoomingRoomId] = useState<string | null>(null);
  const [isDoorOpening, setIsDoorOpening] = useState(false);

  function handleRoomClick(room: Room) {
    setZoomingRoomId(room.id);
    setIsDoorOpening(true);

    // 750ms Camera Dolly-In + Door opening transition
    setTimeout(() => {
      onSelectRoom(room);
    }, 750);
  }

  return (
    <div className={styles.viewport}>
      <div className={styles.headerBanner}>
        <h1 className={styles.title}>Sanal Ofise Hoş Geldin 🚪</h1>
        <p className={styles.subtitle}>
          Girmek istediğin toplantı odasına tıkla ve ortak çalışma alanına geç
        </p>
      </div>

      <div
        className={`${styles.stage} ${zoomingRoomId ? styles.stageZooming : ''}`}
      >
        {rooms.map((room) => {
          const totalUsers = room.activeUsers.length;
          return (
            <div
              key={room.id}
              className={styles.roomCard}
              onClick={() => handleRoomClick(room)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleRoomClick(room)}
            >
              <div
                className={styles.roomBadge}
                style={{
                  background: `${room.color}20`,
                  color: room.color,
                  border: `1px solid ${room.color}40`,
                }}
              >
                {room.category}
              </div>

              <h2 className={styles.roomTitle}>{room.name}</h2>

              {/* Glass Wall with Peek Preview of Post-it notes inside */}
              <div className={styles.glassPreviewWall}>
                <div
                  className={styles.peekPostIt}
                  style={{
                    background: '#fef08a',
                    top: '20px',
                    left: '20px',
                    transform: 'rotate(-4deg)',
                  }}
                >
                  📌 Sprint 24
                </div>
                <div
                  className={styles.peekPostIt}
                  style={{
                    background: '#fed7aa',
                    top: '30px',
                    right: '20px',
                    transform: 'rotate(5deg)',
                  }}
                >
                  🎨 Figma Sync
                </div>
              </div>

              {/* Door Footer */}
              <div className={styles.doorContainer}>
                <div className={styles.presence}>
                  <span className={styles.presenceDot} />
                  <span className={styles.presenceText}>
                    {totalUsers} {totalUsers === 1 ? 'kişi' : 'kişi'} içeride
                  </span>
                </div>

                <button className={styles.enterBtn}>
                  Kapıyı Aç 🚪
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Door Opening Transition Overlay */}
      {isDoorOpening && (
        <div className={`${styles.doorTransitionOverlay} ${styles.doorOpening}`}>
          <div className={styles.doorLeft} />
          <div className={styles.doorRight} />
        </div>
      )}
    </div>
  );
}
