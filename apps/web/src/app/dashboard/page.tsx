'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Room, Workboard } from '@/components/office/OfficeTypes';
import { OfficeScene } from '@/components/office/OfficeScene';
import { BoardGallery } from '@/components/office/BoardGallery';
import { WorkboardWorkspace } from '@/components/office/WorkboardWorkspace';
import { MobileRoomList } from '@/components/office/MobileRoomList';
import styles from './dashboard.module.css';

const MOCK_ROOMS: Room[] = [
  {
    id: 'room-design',
    name: '🎨 Tasarım Odası',
    category: 'Ürün & UX/UI',
    color: '#a855f7',
    activeUsers: [
      { name: 'Zeynep', avatar: 'Z', color: '#ef4444' },
      { name: 'Caner', avatar: 'C', color: '#6366f1' },
      { name: 'Mehmet', avatar: 'M', color: '#f59e0b' },
    ],
    boards: [
      {
        id: 'b1',
        title: 'Sprint 24 UI Tasarımları',
        mode: 'whiteboard',
        lastEdited: '2dk önce',
        activeUsers: [{ name: 'Zeynep', color: '#ef4444' }, { name: 'Caner', color: '#6366f1' }],
        previewType: 'canvas',
      },
      {
        id: 'b2',
        title: 'Tasarım Sistemi & İkonlar',
        mode: 'doc',
        lastEdited: '15dk önce',
        activeUsers: [{ name: 'Mehmet', color: '#f59e0b' }],
        previewType: 'doc',
      },
      {
        id: 'b3',
        title: 'Q3 Ürün Sunumu',
        mode: 'presentation',
        lastEdited: '1 saat önce',
        activeUsers: [{ name: 'Caner', color: '#6366f1' }],
        previewType: 'slides',
      },
    ],
  },
  {
    id: 'room-eng',
    name: '💻 Yazılım Ekibi Odası',
    category: 'Frontend & Backend',
    color: '#6366f1',
    activeUsers: [
      { name: 'Ali', avatar: 'A', color: '#10b981' },
      { name: 'Ayşe', avatar: 'A', color: '#06b6d4' },
    ],
    boards: [
      {
        id: 'b4',
        title: 'Mimari & API Şeması',
        mode: 'doc',
        lastEdited: '5dk önce',
        activeUsers: [{ name: 'Ali', color: '#10b981' }],
        previewType: 'doc',
      },
      {
        id: 'b5',
        title: 'Supabase & Neon DB Taşınması',
        mode: 'whiteboard',
        lastEdited: '30dk önce',
        activeUsers: [{ name: 'Ayşe', color: '#06b6d4' }],
        previewType: 'canvas',
      },
    ],
  },
  {
    id: 'room-product',
    name: '🚀 Ürün Strateji Odası',
    category: 'Yol Haritası & Growth',
    color: '#ff5e4d',
    activeUsers: [
      { name: 'Selin', avatar: 'S', color: '#ec4899' },
    ],
    boards: [
      {
        id: 'b6',
        title: '2026 Q4 Yol Haritası',
        mode: 'presentation',
        lastEdited: '3 saat önce',
        activeUsers: [{ name: 'Selin', color: '#ec4899' }],
        previewType: 'slides',
      },
    ],
  },
];

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Workboard | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    function handleResize() {
      setIsMobileView(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className={styles.page}>
      {/* App Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>Collab Workspace</span>
        </div>

        {/* Current Location Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#9ca3af' }}>
          <span
            style={{ cursor: 'pointer', textDecoration: selectedRoom ? 'underline' : 'none' }}
            onClick={() => {
              setSelectedRoom(null);
              setSelectedBoard(null);
            }}
          >
            🏢 Sanal Ofis
          </span>

          {selectedRoom && (
            <>
              <span>/</span>
              <span
                style={{ cursor: 'pointer', textDecoration: selectedBoard ? 'underline' : 'none' }}
                onClick={() => setSelectedBoard(null)}
              >
                {selectedRoom.name}
              </span>
            </>
          )}

          {selectedBoard && (
            <>
              <span>/</span>
              <span style={{ color: '#f3f4f6', fontWeight: 600 }}>
                {selectedBoard.title}
              </span>
            </>
          )}
        </div>

        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className={styles.userName}>{user.name}</span>
          <button className={styles.logoutBtn} onClick={logout} id="logout-button">
            Çıkış Yap
          </button>
        </div>
      </header>

      {/* Main Flow Controller */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Stage 4: Workboard Workspace (Productivity Mode) */}
        {selectedBoard ? (
          <WorkboardWorkspace
            board={selectedBoard}
            onBackToGallery={() => setSelectedBoard(null)}
          />
        ) : selectedRoom ? (
          /* Stage 3: Meeting Room Board Gallery */
          <BoardGallery
            room={selectedRoom}
            onBackToOffice={() => setSelectedRoom(null)}
            onSelectBoard={(board) => setSelectedBoard(board)}
          />
        ) : isMobileView ? (
          /* Mobile / Accessible 2D Fallback */
          <MobileRoomList
            rooms={MOCK_ROOMS}
            onSelectRoom={(room) => setSelectedRoom(room)}
          />
        ) : (
          /* Stage 1 & 2: 3.5D Virtual Office Room Scene & Door Opening Transition */
          <OfficeScene
            rooms={MOCK_ROOMS}
            onSelectRoom={(room) => setSelectedRoom(room)}
          />
        )}
      </div>
    </main>
  );
}
