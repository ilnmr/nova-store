import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const payload = await getUserFromRequest(request);
  if (!payload || !payload.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub as string },
    select: { id: true, name: true, phone: true, role: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const payload = await getUserFromRequest(request);
  if (!payload || !payload.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name } = await request.json();
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id: payload.sub as string },
    data: { name: name.trim() },
    select: { id: true, name: true, phone: true, role: true },
  });
  return NextResponse.json(user);
}
