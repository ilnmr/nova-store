import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { enabled: true },
      include: {
        fields: { orderBy: { order: 'asc' } },
        packages: { where: { enabled: true } },
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('GET /api/games error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
