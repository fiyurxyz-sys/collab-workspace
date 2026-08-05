import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import styles from '../auth.module.css';

export const metadata: Metadata = {
  title: 'Giriş Yap',
  description: 'Collab Workspace hesabına giriş yap.',
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>Collab</span>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
