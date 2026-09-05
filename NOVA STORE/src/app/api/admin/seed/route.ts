import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

// POST /api/admin/seed
// Admin-only. Idempotent — safe to call multiple times.
// Seeds games, game fields, packages, and default store settings.
export async function POST(request: Request) {
  const payload = await getUserFromRequest(request);
  if (!payload || !isAdmin(payload)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const results: string[] = [];

  try {
    // ─── Store Settings ───────────────────────────────────────────────────────
    const defaultSettings = [
      { key: 'store_name',       value: 'NOVA STORE' },
      { key: 'whatsapp_number',  value: '201556723459' },
      { key: 'support_phone',    value: '01038344909' },
      { key: 'support_email',    value: 'adhamsaide2@gmail.com' },
      { key: 'footer_text',      value: 'جميع الحقوق محفوظة ادهم سعيد' },
      { key: 'tiktok_url',       value: 'http://tiktok.com/@novastore504' },
      { key: 'facebook_url',     value: 'https://www.facebook.com/share/1Co84EHcpf/' },
      { key: 'whatsapp_channel', value: 'https://whatsapp.com/channel/0029Vb8OlWRATRSpCJeBQC1K' },
    ];
    for (const s of defaultSettings) {
      await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
    }
    results.push(`✓ ${defaultSettings.length} store settings upserted`);

    // ─── Games & Fields ───────────────────────────────────────────────────────
    const games = [
      {
        slug: 'free-fire', nameAr: 'فري فاير', nameEn: 'Free Fire', imageUrl: '',
        descriptionAr: 'شحن جيمز لعبة Free Fire', descriptionEn: 'Top up Free Fire Diamonds',
        fields: [
          { key: 'player_id', labelAr: 'رقم اللاعب', labelEn: 'Player ID', type: 'number', required: true, minLength: 8, maxLength: 10, order: 1 },
        ],
        packages: [
          { nameAr: '100 جيمز', nameEn: '100 Diamonds', price: 40 },
          { nameAr: '310 جيمز', nameEn: '310 Diamonds', price: 110 },
          { nameAr: '520 جيمز', nameEn: '520 Diamonds', price: 180 },
          { nameAr: '1060 جيمز', nameEn: '1060 Diamonds', price: 350 },
        ],
      },
      {
        slug: 'pubg-mobile', nameAr: 'ببجي موبايل', nameEn: 'PUBG Mobile', imageUrl: '',
        descriptionAr: 'شحن UC لعبة PUBG Mobile', descriptionEn: 'Top up PUBG Mobile UC',
        fields: [
          { key: 'player_id', labelAr: 'رقم اللاعب', labelEn: 'Player ID', type: 'number', required: true, minLength: 8, maxLength: 10, order: 1 },
        ],
        packages: [
          { nameAr: '60 UC', nameEn: '60 UC', price: 35 },
          { nameAr: '300 UC', nameEn: '300 UC', price: 160 },
          { nameAr: '660 UC', nameEn: '660 UC', price: 310 },
          { nameAr: '1800 UC', nameEn: '1800 UC', price: 800 },
        ],
      },
      {
        slug: 'mobile-legends', nameAr: 'موبايل ليجيندز', nameEn: 'Mobile Legends: Bang Bang', imageUrl: '',
        descriptionAr: 'شحن جيمز موبايل ليجيندز', descriptionEn: 'Top up Mobile Legends Diamonds',
        fields: [
          { key: 'player_id', labelAr: 'رقم اللاعب (User ID)', labelEn: 'User ID', type: 'number', required: true, minLength: 6, maxLength: 10, order: 1 },
          { key: 'zone_id',   labelAr: 'رقم المنطقة (Zone ID)', labelEn: 'Zone ID', type: 'number', required: true, minLength: 1, maxLength: 5, order: 2 },
        ],
        packages: [
          { nameAr: '86 جيمز', nameEn: '86 Diamonds', price: 45 },
          { nameAr: '172 جيمز', nameEn: '172 Diamonds', price: 88 },
          { nameAr: '257 جيمز', nameEn: '257 Diamonds', price: 130 },
          { nameAr: '565 جيمز', nameEn: '565 Diamonds', price: 280 },
          { nameAr: '1135 جيمز', nameEn: '1135 Diamonds', price: 545 },
          { nameAr: '2398 جيمز', nameEn: '2398 Diamonds', price: 1100 },
        ],
      },
      {
        slug: 'cod-mobile', nameAr: 'كول أوف ديوتي موبايل', nameEn: 'Call of Duty: Mobile', imageUrl: '',
        descriptionAr: 'شحن CP لعبة COD Mobile', descriptionEn: 'Top up COD Mobile CP',
        fields: [
          { key: 'player_id', labelAr: 'رقم اللاعب (UID)', labelEn: 'Player UID', type: 'number', required: true, minLength: 8, maxLength: 12, order: 1 },
        ],
        packages: [
          { nameAr: '80 CP', nameEn: '80 CP', price: 30 },
          { nameAr: '400 CP', nameEn: '400 CP', price: 140 },
          { nameAr: '800 CP', nameEn: '800 CP', price: 275 },
          { nameAr: '2000 CP', nameEn: '2000 CP', price: 660 },
        ],
      },
      {
        slug: 'efootball', nameAr: 'إي فوتبول', nameEn: 'eFootball', imageUrl: '',
        descriptionAr: 'شحن eFootball Points', descriptionEn: 'Top up eFootball Points',
        fields: [
          { key: 'player_id', labelAr: 'رقم اللاعب', labelEn: 'Player ID', type: 'text', required: true, minLength: 4, maxLength: 20, order: 1 },
        ],
        packages: [
          { nameAr: '200 نقطة', nameEn: '200 Points', price: 50 },
          { nameAr: '500 نقطة', nameEn: '500 Points', price: 120 },
          { nameAr: '1000 نقطة', nameEn: '1000 Points', price: 230 },
        ],
      },
      {
        slug: 'roblox', nameAr: 'روبلوكس', nameEn: 'Roblox', imageUrl: '',
        descriptionAr: 'شحن Robux', descriptionEn: 'Top up Robux',
        fields: [
          { key: 'player_id', labelAr: 'رقم المستخدم', labelEn: 'User ID', type: 'number', required: true, minLength: 5, maxLength: 12, order: 1 },
        ],
        packages: [
          { nameAr: '400 روبوكس', nameEn: '400 Robux', price: 90 },
          { nameAr: '800 روبوكس', nameEn: '800 Robux', price: 175 },
          { nameAr: '1700 روبوكس', nameEn: '1700 Robux', price: 360 },
        ],
      },
    ];

    for (const game of games) {
      const { fields, packages, ...gameData } = game;

      const g = await prisma.game.upsert({
        where: { slug: game.slug },
        update: {},
        create: gameData,
      });

      // Only insert fields if none exist for this game
      const existingFields = await prisma.gameField.count({ where: { gameId: g.id } });
      if (existingFields === 0) {
        for (const field of fields) {
          await prisma.gameField.create({ data: { ...field, gameId: g.id } });
        }
      }

      // Only insert packages if none exist for this game
      const existingPackages = await prisma.package.count({ where: { gameId: g.id } });
      if (existingPackages === 0) {
        for (const pkg of packages) {
          await prisma.package.create({ data: { ...pkg, gameId: g.id } });
        }
      }

      results.push(`✓ Game seeded: ${game.nameEn} (${fields.length} fields, ${packages.length} packages)`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Seed failed', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET — Returns seed status (how many games/settings exist)
export async function GET(request: Request) {
  const payload = await getUserFromRequest(request);
  if (!payload || !isAdmin(payload)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [gameCount, settingCount, packageCount] = await Promise.all([
    prisma.game.count(),
    prisma.setting.count(),
    prisma.package.count(),
  ]);

  return NextResponse.json({
    seeded: gameCount > 0,
    games: gameCount,
    packages: packageCount,
    settings: settingCount,
  });
}
