'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { RegisterSchema, type RegisterFormData } from '@/lib/validators';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './AuthForm.module.css';

export function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = RegisterSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormData;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.email, formData.password, formData.name);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || 'Kayıt olunamadı. Lütfen tekrar deneyin.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.header}>
        <h1 className={styles.title}>Hesap oluştur</h1>
        <p className={styles.subtitle}>Ücretsiz başla, kart gerekmez</p>
      </div>

      {apiError && (
        <div className={styles.apiError} role="alert">
          {apiError}
        </div>
      )}

      <div className={styles.fields}>
        <Input
          id="register-name"
          label="İsim"
          name="name"
          type="text"
          placeholder="Adın Soyadın"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          id="register-email"
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
          id="register-password"
          label="Şifre"
          name="password"
          type="password"
          placeholder="En az 8 karakter"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          id="register-confirm-password"
          label="Şifre Tekrar"
          name="confirmPassword"
          type="password"
          placeholder="Şifreni tekrar gir"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
      </div>

      <Button type="submit" isLoading={isLoading}>
        Hesap Oluştur
      </Button>

      <p className={styles.footerText}>
        Zaten hesabın var mı?{' '}
        <Link href="/login" className={styles.link}>
          Giriş yap
        </Link>
      </p>
    </form>
  );
}
