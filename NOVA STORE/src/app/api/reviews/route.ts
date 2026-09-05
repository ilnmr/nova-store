import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// ─── GET /api/reviews ─────────────────────────────────────────────────────────
// Query params: ?targetType=store&targetId=<id>
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');

    if (!targetType) {
      return NextResponse.json(
        { error: 'Missing required query parameter: targetType' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        targetType,
        ...(targetId ? { targetId } : {}),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── POST /api/reviews ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId, rating, comment } = body;

    if (!targetType) {
      return NextResponse.json(
        { error: 'Missing required field: targetType' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        targetType,
        targetId: targetId ?? null,
        rating: Math.round(rating),
        comment: comment ?? null,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
