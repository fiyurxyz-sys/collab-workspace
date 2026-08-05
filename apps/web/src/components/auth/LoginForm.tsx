'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LoginSchema, type LoginFormData } from '@/lib/validators';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './AuthForm.module.css';

export function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = LoginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<LoginFormData> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || 'Giriş yapılamadı. Lütfen tekrar deneyin.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.header}>
        <h1 className={styles.title}>Tekrar hoş geldin</h1>
        <p className={styles.subtitle}>Hesabına giriş yap</p>
      </div>

      {apiError && (
        <div className={styles.apiError} role="alert">
          {apiError}
        </div>
      )}

      <div className={styles.fields}>
        <Input
          id="login-email"
          label="Email"
          name="email"
          type="email"
          placeholder="sen@ornek.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          id="login-password"
          label="Şifre"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
      </div>

      <Button type="submit" isLoading={isLoading}>
        Giriş Yap
      </Button>

      <p className={styles.footerText}>
        Hesabın yok mu?{' '}
        <Link href="/register" className={styles.link}>
          Kayıt ol
        </Link>
      </p>
    </form>
  );
}
