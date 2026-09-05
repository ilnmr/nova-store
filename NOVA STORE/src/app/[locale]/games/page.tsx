"use client"

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type Game = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  descriptionAr?: string;
  descriptionEn?: string;
  packages: { id: string; price?: number | null }[];
};

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = typeof window !== 'undefined' ? document.documentElement.lang : 'ar';

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGames(data);
      })
      .catch(() => {
        // Fall back to demo games if DB not yet seeded
        setGames([
          { id: '1', slug: 'free-fire', nameAr: 'فري فاير', nameEn: 'Free Fire', imageUrl: '', packages: [] },
          { id: '2', slug: 'pubg-mobile', nameAr: 'ببجي موبايل', nameEn: 'PUBG Mobile', imageUrl: '', packages: [] },
          { id: '3', slug: 'mobile-legends', nameAr: 'موبايل ليجيندز', nameEn: 'Mobile Legends', imageUrl: '', packages: [] },
          { id: '4', slug: 'cod-mobile', nameAr: 'كول أوف ديوتي', nameEn: 'COD Mobile', imageUrl: '', packages: [] },
          { id: '5', slug: 'efootball', nameAr: 'إي فوتبول', nameEn: 'eFootball', imageUrl: '', packages: [] },
          { id: '6', slug: 'roblox', nameAr: 'روبلوكس', nameEn: 'Roblox', imageUrl: '', packages: [] },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const gameEmojis: Record<string, string> = {
    'free-fire': '🔥',
    'pubg-mobile': '🪖',
    'mobile-legends': '⚔️',
    'cod-mobile': '🎯',
    'efootball': '⚽',
    'roblox': '🧱',
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-2">الألعاب</h1>
      <p className="text-muted-foreground mb-10">اختار لعبتك وشحن فوراً</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => {
            const name = locale === 'ar' ? game.nameAr : game.nameEn;
            const minPrice = game.packages.length > 0
              ? Math.min(...game.packages.map(p => p.price ?? Infinity))
              : null;

            return (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                {/* Game Image / Emoji */}
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {game.imageUrl ? (
                    <img
                      src={game.imageUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-6xl">{gameEmojis[game.slug] || '🎮'}</span>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-base group-hover:text-primary transition-colors">
                    {name}
                  </h2>
                  {minPrice !== null && isFinite(minPrice) ? (
                    <p className="text-sm text-muted-foreground mt-1">من {minPrice} EGP</p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">اشحن الآن</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
