"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReviewsSection from '@/components/ReviewsSection';

type Game = { id: string; slug: string; nameAr: string; nameEn: string; imageUrl: string; packages: { price?: number | null }[] };

const GAME_EMOJIS: Record<string, string> = {
  'free-fire': '🔥', 'pubg-mobile': '🪖', 'mobile-legends': '⚔️',
  'cod-mobile': '🎯', 'efootball': '⚽', 'roblox': '🧱',
};

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'ar';

  useEffect(() => {
    fetch('/api/games')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGames(data.slice(0, 8)); })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background border-b">
        <div className="container py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            متاح 24/7
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            مرحباً بك في{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              NOVA STORE
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            المنصة الأفضل لشحن الألعاب وبيع الحسابات في مصر — سريع، آمن، وموثوق
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/games"
              className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              🎮 تصفح الألعاب
            </Link>
            <Link
              href="/buy-sell"
              className="px-8 py-3 border bg-card font-semibold rounded-xl hover:bg-accent transition-colors"
            >
              🏪 بيع وشراء حسابات
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">الألعاب المتاحة</h2>
          <Link href="/games" className="text-sm text-primary hover:underline">عرض الكل ←</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {games.map(game => {
              const gameName = locale === 'ar' ? game.nameAr : game.nameEn;
              const minPrice = game.packages.length > 0
                ? Math.min(...game.packages.map(p => p.price ?? Infinity))
                : null;
              return (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-5xl">{GAME_EMOJIS[game.slug] || '🎮'}</span>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{gameName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {minPrice != null && isFinite(minPrice) ? `من ${minPrice} EGP` : 'اشحن الآن'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="container py-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: 'شحن فوري', desc: 'شحن حسابك خلال دقائق من تأكيد الدفع' },
            { icon: '🔒', title: 'آمن 100%', desc: 'جميع المعاملات مؤمنة ومراقبة من فريقنا' },
            { icon: '🎧', title: 'دعم 24/7', desc: 'فريق دعم متاح على مدار الساعة عبر واتساب' },
          ].map(f => (
            <div key={f.title} className="bg-card border rounded-2xl p-6 shadow-sm text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="container pb-20">
        <ReviewsSection targetType="store" />
      </section>
    </div>
  );
}
