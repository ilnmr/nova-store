"use client"

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { sendEmail } from '@/lib/resend';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message }),
      });
      if (res.ok) {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">خدمة عملاء NOVA STORE</h1>
      <p className="text-muted-foreground mb-8">فريقنا هنا عشانك — ابعتلنا مشكلتك وهنرد عليك أسرع ما يكون</p>

      <div className="grid gap-6">
        {/* Quick Contact */}
        <div className="bg-card border rounded-2xl p-6 flex flex-col sm:flex-row gap-4">
          <a
            href="tel:01038344909"
            className="flex-1 flex items-center gap-3 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
          >
            <span className="text-2xl">📞</span>
            <div>
              <p className="font-semibold text-sm">خدمة العملاء</p>
              <p className="font-bold text-primary" dir="ltr">01038344909</p>
            </div>
          </a>
          <a
            href="https://wa.me/201556723459"
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center gap-3 p-4 bg-[#25D366]/10 rounded-xl hover:bg-[#25D366]/20 transition-colors"
          >
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-semibold text-sm">واتساب</p>
              <p className="font-bold text-[#25D366]" dir="ltr">01556723459</p>
            </div>
          </a>
        </div>

        {/* Contact Form */}
        <div className="bg-card text-card-foreground border rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">بعتلنا رسالة</h2>
          {sent ? (
            <div className="p-4 bg-green-500/10 text-green-600 border border-green-500/20 rounded-md text-center">
              تم إرسال رسالتك بنجاح. سنرد عليك في أقرب وقت.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الموبايل</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  required
                  className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المشكلة أو الاستفسار</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                  className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
