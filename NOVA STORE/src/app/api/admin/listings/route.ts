import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const payload = await getUserFromRequest(request);
  if (!payload || !isAdmin(payload)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const listings = await prisma.accountListing.findMany({
    include: { user: { select: { name: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(listings);
}
