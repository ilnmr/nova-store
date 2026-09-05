"use client"

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'ar';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError(locale === 'ar' ? 'الاسم لازم يكون حرفين على الأقل' : 'Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    setError('');
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      const d = await res.json();
      setError(d.error || (locale === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
  };

  return (
    <div className="container py-12 max-w-xl">
      <h1 className="text-3xl font-bold mb-8">{locale === 'ar' ? 'الإعدادات' : 'Settings'}</h1>

      <div className="bg-card text-card-foreground border rounded-2xl shadow-sm p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6">{locale === 'ar' ? 'بيانات الحساب' : 'Account Details'}</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">{locale === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{locale === 'ar' ? 'رقم الموبايل' : 'Phone Number'}</label>
            <input
              type="tel"
              value={user?.phone ?? ''}
              disabled
              dir="ltr"
              className="w-full px-4 py-2 bg-muted border border-border rounded-md cursor-not-allowed text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">{locale === 'ar' ? 'رقم الموبايل لا يمكن تغييره' : 'Phone number cannot be changed'}</p>
          </div>

          {error && <p className="text-destructive text-sm font-medium">{error}</p>}
          {saved && <p className="text-green-500 text-sm font-medium">✓ {locale === 'ar' ? 'تم الحفظ' : 'Saved'}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
          </button>
        </form>

        <hr className="my-6 border-border" />

        <button
          onClick={logout}
          className="w-full py-2 border border-destructive text-destructive font-semibold rounded-md hover:bg-destructive/10 transition-colors"
        >
          {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
