'use client';

import React, { useState } from 'react';
import { Workboard } from './OfficeTypes';
import { LiveCursors } from './LiveCursors';
import styles from './WorkboardWorkspace.module.css';

interface WorkboardWorkspaceProps {
  board: Workboard;
  onBackToGallery: () => void;
}

const INITIAL_STICKIES = [
  { id: '1', text: '💡 Kullanıcı kayıt akışını sadeleştirelim', x: 80, y: 100, color: '#fef08a' },
  { id: '2', text: '🚀 3D Ofis geçişi 750ms ease-out', x: 300, y: 140, color: '#fed7aa' },
  { id: '3', text: '🎨 Canvas renk kodlu canlı imleçler', x: 180, y: 280, color: '#bbf7d0' },
];

export function WorkboardWorkspace({ board, onBackToGallery }: WorkboardWorkspaceProps) {
  const [activeMode, setActiveMode] = useState<'doc' | 'whiteboard' | 'presentation'>(board.mode);
  const [stickies, setStickies] = useState(INITIAL_STICKIES);
  const [activeTool, setActiveTool] = useState<'select' | 'sticky' | 'draw'>('select');

  // Simulated live collaborative cursors
  const initialCursors = [
    { id: 'c1', name: 'Zeynep', color: '#ef4444', x: 420, y: 220, status: 'yazıyor...' },
    { id: 'c2', name: 'Caner', color: '#6366f1', x: 780, y: 350, status: 'çiziyor' },
    { id: 'c3', name: 'Mehmet', color: '#f59e0b', x: 250, y: 480 },
  ];

  function handleAddSticky() {
    const newSticky = {
      id: `sticky-${Date.now()}`,
      text: '📌 Yeni yapışkan not...',
      x: 120 + Math.random() * 200,
      y: 150 + Math.random() * 150,
      color: ['#fef08a', '#e0f2fe', '#fce7f3', '#dcfce7'][Math.floor(Math.random() * 4)],
    };
    setStickies([...stickies, newSticky]);
  }

  return (
    <div className={styles.workspace}>
      {/* Collaborative Live Cursors */}
      <LiveCursors initialCursors={initialCursors} />

      {/* Top Navigation Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.leftSection}>
          <button className={styles.backBtn} onClick={onBackToGallery}>
            ← Panoya Dön
          </button>
          <span className={styles.boardTitle}>📌 {board.title}</span>
        </div>

        {/* 3 Modes Segmented Control */}
        <div className={styles.segmentedControl}>
          <button
            className={`${styles.segmentBtn} ${activeMode === 'doc' ? styles.segmentBtnActive : ''}`}
            onClick={() => setActiveMode('doc')}
          >
            📝 Doküman
          </button>
          <button
            className={`${styles.segmentBtn} ${activeMode === 'whiteboard' ? styles.segmentBtnActive : ''}`}
            onClick={() => setActiveMode('whiteboard')}
          >
            🎨 Whiteboard
          </button>
          <button
            className={`${styles.segmentBtn} ${activeMode === 'presentation' ? styles.segmentBtnActive : ''}`}
            onClick={() => setActiveMode('presentation')}
          >
            📊 Sunum
          </button>
        </div>

        {/* Right Section / Active Presence */}
        <div className={styles.rightSection}>
          <div className={styles.presencePill}>
            <span className={styles.presenceDot} />
            <span>3 kişi canlı</span>
          </div>

          <button
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              background: '#6366f1',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Davet Et
          </button>
        </div>
      </div>

      {/* Main Workspace Mode Content */}
      <div className={styles.canvasArea}>
        {/* 📝 MODE 1: DOC MODE */}
        {activeMode === 'doc' && (
          <div className={styles.docContainer}>
            <input
              className={styles.docTitle}
              defaultValue={board.title}
              placeholder="Doküman Başlığı"
            />

            <div
              className={styles.docContent}
              contentEditable
              suppressContentEditableWarning
            >
              <h2>1. Proje Özeti</h2>
              <p>
                Sanal ofis metaforu ile çalışan gerçek zamanlı işbirliği platformumuzun faz 1
                arayüz ve mimarisi kuruldu. Ortak çalışma alanında ekibimiz aynı anda
                doküman düzenleyebilir ve tuval üzerinde fikir geliştirebilir.
              </p>

              <div className={styles.collabHighlight}>
                <strong style={{ color: '#6366f1' }}>Zeynep:</strong> "Ofis geçiş
                animasyonlarını 750ms ease-out olarak ayarladık, akıcılık mükemmel!"
              </div>

              <h2 style={{ marginTop: '1.5rem' }}>2. Yapılacaklar</h2>
              <ul>
                <li>✅ JWT Auth & Refresh Token rotation</li>
                <li>✅ Prisma & Neon DB entegrasyonu</li>
                <li>🟢 Canlı renkli imleç takibi</li>
              </ul>
            </div>
          </div>
        )}

        {/* 🎨 MODE 2: WHITEBOARD CANVAS MODE */}
        {activeMode === 'whiteboard' && (
          <div className={styles.whiteboardGrid}>
            <div className={styles.whiteboardToolbar}>
              <button
                className={`${styles.toolBtn} ${activeTool === 'select' ? styles.toolBtnActive : ''}`}
                onClick={() => setActiveTool('select')}
                title="Seç"
              >
                ↖
              </button>
              <button
                className={`${styles.toolBtn} ${activeTool === 'sticky' ? styles.toolBtnActive : ''}`}
                onClick={() => {
                  setActiveTool('sticky');
                  handleAddSticky();
                }}
                title="Not Ekle"
              >
                📌
              </button>
              <button
                className={`${styles.toolBtn} ${activeTool === 'draw' ? styles.toolBtnActive : ''}`}
                onClick={() => setActiveTool('draw')}
                title="Çizim"
              >
                ✏️
              </button>
            </div>

            {/* Draggable Sticky Notes */}
            {stickies.map((s) => (
              <div
                key={s.id}
                className={styles.stickyNote}
                style={{
                  left: `${s.x}px`,
                  top: `${s.y}px`,
                  background: s.color,
                }}
              >
                {s.text}
              </div>
            ))}
          </div>
        )}

        {/* 📊 MODE 3: PRESENTATION SLIDE MODE */}
        {activeMode === 'presentation' && (
          <div className={styles.presentationLayout}>
            <div className={styles.slideSidebar}>
              <div className={`${styles.slideThumb} ${styles.slideThumbActive}`}>
                <strong>Slayt 1</strong>
                <p>Giriş ve Sanal Ofis Mimarisi</p>
              </div>
              <div className={styles.slideThumb}>
                <strong>Slayt 2</strong>
                <p>Gerçek Zamanlı İletişim</p>
              </div>
              <div className={styles.slideThumb}>
                <strong>Slayt 3</strong>
                <p>Yol Haritası & Faz 2</p>
              </div>
            </div>

            <div className={styles.mainSlide}>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                Collab Workspace — Sanal Ofis
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px' }}>
                Görsel ve mekânsal işbirliği platformu. Takımınızla canlı olarak aynı tuval
                ve dokümanda buluşun.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
