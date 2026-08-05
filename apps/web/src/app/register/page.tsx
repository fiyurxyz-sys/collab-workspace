import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import styles from '../auth.module.css';

export const metadata: Metadata = {
  title: 'Kayıt Ol',
  description: 'Collab Workspace\'e ücretsiz kayıt ol.',
};

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>Collab</span>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
