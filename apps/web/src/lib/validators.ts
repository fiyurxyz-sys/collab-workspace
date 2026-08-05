import { z } from 'zod';

export const RegisterSchema = z
  .object({
    email: z.string().email('Geçerli bir email adresi girin'),
    name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalı')
      .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
      .regex(/[a-z]/, 'En az bir küçük harf içermeli')
      .regex(/[0-9]/, 'En az bir rakam içermeli'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export const LoginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
