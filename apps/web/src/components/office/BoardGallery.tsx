'use client';

import React, { useState } from 'react';
import { Room, Workboard } from './OfficeTypes';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import styles from './BoardGallery.module.css';

interface BoardGalleryProps {
  room: Room;
  onBackToOffice: () => void;
  onSelectBoard: (board: Workboard) => void;
}

const POSTIT_COLORS = ['#fef9c3', '#e0f2fe', '#fce7f3', '#dcfce7'];
const ROTATIONS = ['-1.5deg', '1.2deg', '-2deg', '1.8deg', '-0.8deg'];

export function BoardGallery({ room, onBackToOffice, onSelectBoard }: BoardGalleryProps) {
  const [boards, setBoards] = useState<Workboard[]>(room.boards);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMode, setNewMode] = useState<'doc' | 'whiteboard' | 'presentation'>('whiteboard');

  function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newBoard: Workboard = {
      id: `board-${Date.now()}`,
      title: newTitle,
      mode: newMode,
      lastEdited: 'Şimdi',
      activeUsers: [{ name: 'Sen', color: '#ef4444' }],
      previewType: newMode === 'doc' ? 'doc' : newMode === 'presentation' ? 'slides' : 'canvas',
    };

    setBoards([newBoard, ...boards]);
    setIsModalOpen(false);
    setNewTitle('');
    onSelectBoard(newBoard);
  }

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBackToOffice}>
          ← Ofise Dön
        </button>

        <h1 className={styles.roomTitle}>🏢 {room.name}</h1>

        <div className={styles.avatarGroup}>
          {room.activeUsers.map((u, i) => (
            <div
              key={i}
              className={styles.avatar}
              style={{ background: u.color }}
              title={u.name}
            >
              {u.avatar}
            </div>
          ))}
        </div>
      </div>

      {/* Sunum Tahtası Wall */}
      <div className={styles.boardWall}>
        <div className={styles.wallHeader}>
          <div className={styles.wallTitle}>
            <span>📌 Toplantı Odası Sunum Pano & Workboard'lar</span>
          </div>

          <button className={styles.backBtn} onClick={() => setIsModalOpen(true)}>
            + Yeni Board Ekle
          </button>
        </div>

        <div className={styles.grid}>
          {/* Create New Board Card */}
          <div className={styles.newBoardCard} onClick={() => setIsModalOpen(true)}>
            <div className={styles.plusIcon}>+</div>
            <div className={styles.newBoardText}>Yeni Workboard Oluştur</div>
          </div>

          {/* Workboard Post-it Cards */}
          {boards.map((board, idx) => {
            const cardBg = POSTIT_COLORS[idx % POSTIT_COLORS.length];
            const rotation = ROTATIONS[idx % ROTATIONS.length];

            return (
              <div
                key={board.id}
                className={styles.card}
                style={{ background: cardBg, transform: `rotate(${rotation})` }}
                onClick={() => onSelectBoard(board)}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{board.title}</h3>
                  <span className={styles.modeBadge}>
                    {board.mode === 'doc'
                      ? '📝 Doküman'
                      : board.mode === 'presentation'
                      ? '📊 Sunum'
                      : '🎨 Whiteboard'}
                  </span>
                </div>

                <div className={styles.previewBox}>
                  {board.mode === 'doc' && '📄 Ortak metin düzenleyici'}
                  {board.mode === 'whiteboard' && '🎨 Çizim tuvali & yapışkan notlar'}
                  {board.mode === 'presentation' && '📊 Canlı sunum slaytları'}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.avatarGroup}>
                    {board.activeUsers.map((u, i) => (
                      <div
                        key={i}
                        className={styles.avatar}
                        style={{ background: u.color }}
                      >
                        {u.name.charAt(0)}
                      </div>
                    ))}
                  </div>

                  <span className={styles.editedTime}>{board.lastEdited}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Board Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Yeni Workboard Oluştur
            </h2>

            <form onSubmit={handleCreateBoard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                id="new-board-title"
                label="Board Başlığı"
                placeholder="Örn: Q4 Ürün Yol Haritası"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '6px' }}>
                  Çalışma Modu
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {(['whiteboard', 'doc', 'presentation'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewMode(m)}
                      style={{
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: newMode === m ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {m === 'doc' ? '📝 Doküman' : m === 'presentation' ? '📊 Sunum' : '🎨 Canvas'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  Oluştur ve Gir 🚀
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
