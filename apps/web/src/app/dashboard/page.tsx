'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>Collab</span>
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

      <section className={styles.content}>
        <div className={styles.glow} />
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⬡</div>
          <h1 className={styles.emptyTitle}>Workboard'ların</h1>
          <p className={styles.emptyDesc}>
            İlk board'unu oluştur ve ekibinle gerçek zamanlı işbirliği yapmaya başla.
          </p>
          <button className={styles.createBtn} id="create-board-button">
            + Yeni Board Oluştur
          </button>
        </div>
      </section>
    </main>
  );
}
