"use client"

import { useState, useEffect } from 'react';

type Setting = { key: string; label: string; value: string; type?: string };

const SETTING_LABELS: Record<string, { label: string; type?: string }> = {
  store_name:       { label: 'اسم المتجر' },
  whatsapp_number:  { label: 'رقم واتساب', type: 'tel' },
  support_phone:    { label: 'رقم خدمة العملاء', type: 'tel' },
  support_email:    { label: 'إيميل الدعم', type: 'email' },
  footer_text:      { label: 'نص الفوتر' },
  tiktok_url:       { label: 'رابط تيك توك', type: 'url' },
  facebook_url:     { label: 'رابط فيسبوك', type: 'url' },
  whatsapp_channel: { label: 'قناة واتساب', type: 'url' },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        const list = Object.entries(data).map(([key, value]) => ({
          key,
          value,
          label: SETTING_LABELS[key]?.label ?? key,
          type: SETTING_LABELS[key]?.type,
        }));
        setSettings(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = settings.map(({ key, value }) => ({ key, value }));
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">إعدادات المتجر</h1>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : saved ? '✓ تم الحفظ' : 'حفظ الإعدادات'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm p-6 space-y-5">
          {settings.map(setting => (
            <div key={setting.key}>
              <label className="block text-sm font-medium mb-1">{setting.label}</label>
              <input
                type={setting.type || 'text'}
                value={setting.value}
                onChange={e => handleChange(setting.key, e.target.value)}
                dir={['tel','url','email'].includes(setting.type ?? '') ? 'ltr' : undefined}
                className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
