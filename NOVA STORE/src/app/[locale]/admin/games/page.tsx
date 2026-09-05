"use client"

import { useState } from 'react';
import { suggestGameArtwork } from '@/lib/gemini';

type GameField = {
  key: string;
  labelAr: string;
  labelEn: string;
  type: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
};

type Game = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  enabled: boolean;
  fields: GameField[];
};

const DEMO_GAMES: Game[] = [
  {
    id: '1', nameAr: 'موبايل ليجيندز', nameEn: 'Mobile Legends', slug: 'mobile-legends', enabled: true,
    fields: [
      { key: 'player_id', labelAr: 'رقم اللاعب', labelEn: 'Player ID', type: 'number', required: true, minLength: 6, maxLength: 10 },
      { key: 'zone_id', labelAr: 'رقم المنطقة', labelEn: 'Zone ID', type: 'number', required: true, minLength: 1, maxLength: 5 },
    ]
  },
  {
    id: '2', nameAr: 'فري فاير', nameEn: 'Free Fire', slug: 'free-fire', enabled: true,
    fields: [
      { key: 'player_id', labelAr: 'رقم اللاعب', labelEn: 'Player ID', type: 'number', required: true, minLength: 8, maxLength: 10 },
    ]
  },
];

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>(DEMO_GAMES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  const handleAiSuggest = async () => {
    if (!newGameName.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/admin/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName: newGameName }),
      });
      const data = await res.json();
      setAiSuggestion(data.suggestion || 'لم يتمكن الذكاء الاصطناعي من تقديم اقتراح.');
    } catch {
      setAiSuggestion('خطأ في الاتصال بخدمة الذكاء الاصطناعي.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleGame = (id: string) => {
    setGames(prev => prev.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">إدارة الألعاب</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90"
        >
          {showAddForm ? '× إلغاء' : '+ إضافة لعبة'}
        </button>
      </div>

      {/* Add Game Form with AI Assist */}
      {showAddForm && (
        <div className="bg-card border rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">إضافة لعبة جديدة</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                placeholder="اسم اللعبة بالإنجليزية..."
                dir="ltr"
                className="flex-1 px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleAiSuggest}
                disabled={aiLoading || !newGameName.trim()}
                className="px-4 py-2 border border-primary text-primary text-sm font-semibold rounded-md hover:bg-primary/10 disabled:opacity-50"
              >
                {aiLoading ? '⏳ جاري...' : '✨ اقتراح بالذكاء الاصطناعي'}
              </button>
            </div>

            {aiSuggestion && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">AI Artwork Prompt Suggestion</p>
                <p className="text-sm" dir="ltr">{aiSuggestion}</p>
                <p className="text-xs text-muted-foreground mt-2">يمكنك استخدام هذا النص في أي أداة لتوليد الصور (Midjourney, DALL-E, إلخ)</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">الاسم بالعربية</label>
                <input type="text" className="w-full px-4 py-2 bg-input border border-border rounded-md text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">الاسم بالإنجليزية</label>
                <input type="text" value={newGameName} dir="ltr" className="w-full px-4 py-2 bg-input border border-border rounded-md text-sm focus:outline-none" readOnly />
              </div>
            </div>
            <button className="px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90">
              حفظ اللعبة
            </button>
          </div>
        </div>
      )}

      {/* Games List */}
      <div className="space-y-4">
        {games.map((game) => (
          <div key={game.id} className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-xl">🎮</div>
                <div>
                  <p className="font-semibold">{game.nameAr}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">{game.nameEn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleGame(game.id)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    game.enabled ? 'bg-green-500/10 text-green-600 hover:bg-red-500/10 hover:text-red-500' : 'bg-red-500/10 text-red-500 hover:bg-green-500/10 hover:text-green-600'
                  }`}
                >
                  {game.enabled ? '✓ مفعل' : '✗ معطل'}
                </button>
                <button
                  onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                  className="text-xs px-3 py-1 rounded-md border hover:bg-accent"
                >
                  {expandedGame === game.id ? 'إخفاء الحقول' : 'الحقول'}
                </button>
              </div>
            </div>

            {/* Fields Editor */}
            {expandedGame === game.id && (
              <div className="border-t bg-muted/30 p-5">
                <h3 className="text-sm font-semibold mb-4">حقول معرف اللاعب</h3>
                <div className="space-y-3">
                  {game.fields.map((field) => (
                    <div key={field.key} className="flex flex-wrap items-center gap-3 p-3 bg-card rounded-xl border">
                      <span className="text-xs font-mono text-muted-foreground w-24">{field.key}</span>
                      <span className="text-sm">{field.labelAr}</span>
                      <span className="text-xs text-muted-foreground" dir="ltr">{field.labelEn}</span>
                      <span className="text-xs border rounded px-2 py-0.5">{field.type}</span>
                      {field.minLength && <span className="text-xs text-muted-foreground">min: {field.minLength}</span>}
                      {field.maxLength && <span className="text-xs text-muted-foreground">max: {field.maxLength}</span>}
                      <span className={`text-xs rounded-full px-2 py-0.5 ${field.required ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                        {field.required ? 'مطلوب' : 'اختياري'}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-sm text-primary hover:underline">+ إضافة حقل</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
