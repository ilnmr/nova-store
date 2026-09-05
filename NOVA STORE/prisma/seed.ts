import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Default Store Settings ───────────────────────────────────────────────
  const defaultSettings = [
    { key: 'store_name',       value: 'NOVA STORE' },
    { key: 'whatsapp_number',  value: '201556723459' },
    { key: 'support_phone',    value: '01038344909' },
    { key: 'support_email',    value: 'adhamsaide2@gmail.com' },
    { key: 'footer_text',      value: 'جميع الحقوق محفوظة ادهم سعيد' },
    { key: 'tiktok_url',       value: 'http://tiktok.com/@novastore504' },
    { key: 'facebook_url',     value: 'https://www.facebook.com/share/1Co84EHcpf/' },
    { key: 'whatsapp_channel', value: 'https://whatsapp.com/channel/0029Vb8OlWRATRSpCJeBQC1K' },
    { key: 'default_language', value: 'ar' },
    { key: 'default_theme',    value: 'dark' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // ─── Games & Fields ───────────────────────────────────────────────────────
  const games = [
    {
      slug: 'free-fire',
      nameAr: 'فري فاير',
      nameEn: 'Free Fire',
      imageUrl: '/assets/images/games/free-fire.png',
      descriptionAr: 'شحن جيمز لعبة Free Fire',
      descriptionEn: 'Top up Free Fire Diamonds',
      fields: [
        { key: 'player_id', labelAr: 'رقم اللاعب', labelEn: 'Player ID', type: 'number', required: true, minLength: 8, maxLength: 10, order: 1 },
      ],
    },
    {
      slug: 'pubg-mobile',
      nameAr: 'ببجي موبايل',
      nameEn: 'PUBG Mobile',
      imageUrl: '/assets/images/games/pubg.png',
      descriptionAr: 'شحن UC لعبة PUBG Mobile',
      descriptionEn: 'Top up PUBG Mobile UC',
      fields: [
        { key: 'player_id', labelAr: 'رقم اللاعب', labelEn: 'Player ID', type: 'number', required: true, minLength: 8, maxLength: 10, order: 1 },
      ],
    },
    {
      slug: 'mobile-legends',
      nameAr: 'موبايل ليجيندز',
      nameEn: 'Mobile Legends: Bang Bang',
      imageUrl: '/assets/images/games/mlbb.png',
      descriptionAr: 'شحن جيمز لعبة Mobile Legends',
      descriptionEn: 'Top up Mobile Legends Diamonds',
      fields: [
        { key: 'player_id', labelAr: 'رقم اللاعب', labelEn: 'User ID', type: 'number', required: true, minLength: 6, maxLength: 10, order: 1 },
        // Zone ID is a SEPARATE distinct field — not merged
        { key: 'zone_id',   labelAr: 'رقم المنطقة', labelEn: 'Zone ID',  type: 'number', required: true, minLength: 1, maxLength: 5, order: 2 },
      ],
    },
    {
      slug: 'cod-mobile',
      nameAr: 'كول أوف ديوتي موبايل',
      nameEn: 'Call of Duty: Mobile',
      imageUrl: '/assets/images/games/codm.png',
      descriptionAr: 'شحن CP لعبة COD Mobile',
      descriptionEn: 'Top up COD Mobile CP',
      fields: [
        { key: 'player_id', labelAr: 'رقم اللاعب (UID)', labelEn: 'Player UID', type: 'number', required: true, minLength: 8, maxLength: 12, order: 1 },
      ],
    },
    {
      slug: 'efootball',
      nameAr: 'إي فوتبول',
      nameEn: 'eFootball',
      imageUrl: '/assets/images/games/efootball.png',
      descriptionAr: 'شحن eFootball Points',
      descriptionEn: 'Top up eFootball Points',
      fields: [
        { key: 'player_id', labelAr: 'رقم اللاعب', labelEn: 'Player ID', type: 'text', required: true, minLength: 4, maxLength: 20, order: 1 },
      ],
    },
    {
      slug: 'roblox',
      nameAr: 'روبلوكس',
      nameEn: 'Roblox',
      imageUrl: '/assets/images/games/roblox.png',
      descriptionAr: 'شحن Robux',
      descriptionEn: 'Top up Robux',
      fields: [
        { key: 'player_id', labelAr: 'رقم المستخدم', labelEn: 'User ID', type: 'number', required: true, minLength: 5, maxLength: 12, order: 1 },
      ],
    },
  ];

  for (const game of games) {
    const { fields, ...gameData } = game;
    const createdGame = await prisma.game.upsert({
      where: { slug: game.slug },
      update: gameData,
      create: gameData,
    });

    // Clear and re-create fields for idempotent seeding
    await prisma.gameField.deleteMany({ where: { gameId: createdGame.id } });
    for (const field of fields) {
      await prisma.gameField.create({ data: { ...field, gameId: createdGame.id } });
    }

    console.log(`✓ Seeded game: ${game.nameEn}`);
  }

  // ─── Steam packages (no gameId — steam is treated separately) ────────────
  const steamPackages = [
    { nameAr: 'ستيم 5 دولار', nameEn: 'Steam Wallet $5',  price: null, enabled: true },
    { nameAr: 'ستيم 10 دولار', nameEn: 'Steam Wallet $10', price: null, enabled: true },
    { nameAr: 'ستيم 20 دولار', nameEn: 'Steam Wallet $20', price: null, enabled: true },
    { nameAr: 'ستيم 50 دولار', nameEn: 'Steam Wallet $50', price: null, enabled: true },
  ];

  for (const pkg of steamPackages) {
    await prisma.package.upsert({
      where: { id: `steam-${pkg.nameEn.replace(/ /g, '-').toLowerCase()}` },
      update: pkg,
      create: { id: `steam-${pkg.nameEn.replace(/ /g, '-').toLowerCase()}`, ...pkg },
    });
  }

  console.log('✓ Seeded Steam packages');
  console.log('\n✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
