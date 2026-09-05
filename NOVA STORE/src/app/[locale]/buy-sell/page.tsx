"use client"

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateAccountListingMessage, generateWhatsAppLink } from '@/lib/whatsapp';

const SUPPORTED_GAMES = [
  'PUBG Mobile', 'Free Fire', 'Mobile Legends', 'Call of Duty: Mobile',
  'eFootball', 'FIFA', 'Fortnite',
];

export default function BuySellPage() {
  const { user } = useAuth();
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'ar';

  const [game, setGame]             = useState(SUPPORTED_GAMES[0]);
  const [details, setDetails]       = useState('');
  const [price, setPrice]           = useState('');
  const [sellerName, setSellerName] = useState(user?.name ?? '');
  const [sellerPhone, setSellerPhone] = useState('');
  const [files, setFiles]           = useState<FileList | null>(null);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Upload images
      const uploadedUrls: string[] = [];
      if (files?.length) {
        for (let i = 0; i < files.length; i++) {
          const fd = new FormData();
          fd.append('file', files[i]);
          fd.append('type', 'listing');
          const r = await fetch('/api/upload', { method: 'POST', body: fd });
          if (r.ok) { const d = await r.json(); if (d.url) uploadedUrls.push(d.url); }
        }
      }

      // 2. Save to DB
      const userId = user?.id;
      if (userId) {
        await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game, accountDetails: details, priceRequested: price, imageUrls: uploadedUrls, userId }),
        });
      }

      // 3. Open WhatsApp pre-filled
      const msg = generateAccountListingMessage(game, details, `${price} EGP`, sellerName, sellerPhone);
      const waLink = generateWhatsAppLink('201556723459', msg);
      setSuccess(true);
      setTimeout(() => { window.open(waLink, '_blank'); }, 800);

    } catch (err) {
      setError(locale === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="container py-20 max-w-md text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-2xl font-bold mb-3">{locale === 'ar' ? 'تم إرسال الطلب!' : 'Listing Submitted!'}</h2>
      <p className="text-muted-foreground">
        {locale === 'ar'
          ? 'تم تسجيل حسابك. سيفتح واتساب تلقائياً لإكمال عملية البيع مع الفريق.'
          : 'Your listing has been recorded. WhatsApp will open to complete with our team.'}
      </p>
      <button onClick={() => setSuccess(false)} className="mt-8 px-6 py-2 border rounded-md hover:bg-accent text-sm">
        {locale === 'ar' ? 'إضافة حساب آخر' : 'Add Another'}
      </button>
    </div>
  );

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">{locale === 'ar' ? 'بيع وشراء حسابات الألعاب' : 'Buy & Sell Game Accounts'}</h1>
      <p className="text-muted-foreground mb-8">{locale === 'ar' ? 'اعرض حسابك للبيع' : 'List your account for sale'}</p>

      <div className="bg-card text-card-foreground border rounded-2xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">{locale === 'ar' ? 'اللعبة' : 'Game'}</label>
            <select value={game} onChange={e => setGame(e.target.value)}
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              {SUPPORTED_GAMES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {locale === 'ar' ? 'تفاصيل الحساب (المستوى، السكنات، الرانك)' : 'Account Details (Level, Skins, Rank)'}
            </label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={4} required
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{locale === 'ar' ? 'اسمك' : 'Your Name'}</label>
              <input type="text" value={sellerName} onChange={e => setSellerName(e.target.value)} required
                className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{locale === 'ar' ? 'رقم موبايلك' : 'Your Phone'}</label>
              <input type="tel" value={sellerPhone} onChange={e => setSellerPhone(e.target.value)} required dir="ltr"
                className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{locale === 'ar' ? 'السعر المطلوب (ج.م)' : 'Asking Price (EGP)'}</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" required
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {locale === 'ar' ? 'صور الحساب (متعددة)' : 'Account Screenshots (multiple)'}
            </label>
            <input type="file" multiple accept="image/*" onChange={e => setFiles(e.target.files)}
              className="w-full px-4 py-2 bg-input border border-border rounded-md text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground focus:outline-none" />
            <p className="text-xs text-muted-foreground mt-1">
              {locale === 'ar' ? 'يمكنك رفع أكثر من صورة' : 'You can upload multiple images'}
            </p>
          </div>

          {error && <p className="text-destructive text-sm font-medium">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {loading ? (locale === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : (locale === 'ar' ? 'إرسال الطلب' : 'Submit Listing')}
          </button>
        </form>
      </div>
    </div>
  );
}
