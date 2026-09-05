import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// ─── POST /api/orders ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, packageId, submittedFieldValues, paymentMethod } = body;

    if (!submittedFieldValues || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: submittedFieldValues, paymentMethod' },
        { status: 400 }
      );
    }

    const orderNumber = `NS-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        gameId: gameId ?? null,
        packageId: packageId ?? null,
        submittedFieldValues,
        paymentMethod,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { success: true, orderNumber: order.orderNumber, orderId: order.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── GET /api/orders ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        game: true,
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
