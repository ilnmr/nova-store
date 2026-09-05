'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const EGYPTIAN_PHONE_RE = /^01[0125][0-9]{8}$/;

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!EGYPTIAN_PHONE_RE.test(phone)) {
      setError(t('phoneInvalid'));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordLength'));
      return;
    }

    setLoading(true);
    try {
      await register(name, phone, password);
      // Show success feedback then redirect to login
      router.replace('/login');
    } catch (err: any) {
      setError(err?.message ?? tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-20 flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md p-8 bg-card text-card-foreground border rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">{t('registerTitle')}</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('nameLabel')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('phoneLabel')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('phonePlaceholder')}
              dir="ltr"
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('passwordLabel')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              dir="ltr"
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-destructive text-sm font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? tCommon('loading') : t('registerTitle')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-primary transition-colors">
            {t('haveAccount')}
          </Link>
        </p>
      </div>
    </div>
  );
}
