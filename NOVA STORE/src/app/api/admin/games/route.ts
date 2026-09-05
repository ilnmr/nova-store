import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// ─── GET /api/admin/games ─────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const games = await prisma.game.findMany({
      include: {
        fields: { orderBy: { order: 'asc' } },
        packages: true,
      },
      orderBy: { nameEn: 'asc' },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('GET /api/admin/games error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── POST /api/admin/games ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { slug, nameAr, nameEn, imageUrl, descriptionAr, descriptionEn } = body;

    if (!slug || !nameAr || !nameEn) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, nameAr, nameEn' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await prisma.game.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `A game with slug "${slug}" already exists` },
        { status: 409 }
      );
    }

    const game = await prisma.game.create({
      data: {
        slug,
        nameAr,
        nameEn,
        imageUrl: imageUrl ?? '',
        descriptionAr: descriptionAr ?? null,
        descriptionEn: descriptionEn ?? null,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/games error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
