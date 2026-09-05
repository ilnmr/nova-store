import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const payload = await getUserFromRequest(request);
  if (!payload || !isAdmin(payload)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const reviews = await prisma.review.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(reviews);
}

export async function DELETE(request: Request) {
  const payload = await getUserFromRequest(request);
  if (!payload || !isAdmin(payload)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await request.json();
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
