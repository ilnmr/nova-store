import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// ─── PATCH /api/admin/games/[id] ─────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await prisma.game.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const body = await request.json();
    const { slug, nameAr, nameEn, imageUrl, descriptionAr, descriptionEn, enabled } = body;

    // If slug is changing, check uniqueness
    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.game.findUnique({ where: { slug } });
      if (slugConflict) {
        return NextResponse.json(
          { error: `A game with slug "${slug}" already exists` },
          { status: 409 }
        );
      }
    }

    const updatedGame = await prisma.game.update({
      where: { id: params.id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(nameAr !== undefined && { nameAr }),
        ...(nameEn !== undefined && { nameEn }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(enabled !== undefined && { enabled }),
      },
      include: {
        fields: { orderBy: { order: 'asc' } },
        packages: true,
      },
    });

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error(`PATCH /api/admin/games/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── DELETE /api/admin/games/[id] ────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await prisma.game.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // GameField rows cascade-delete via Prisma schema (onDelete: Cascade)
    await prisma.game.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error) {
    console.error(`DELETE /api/admin/games/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
