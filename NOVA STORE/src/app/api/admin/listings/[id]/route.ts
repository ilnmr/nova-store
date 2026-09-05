import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const payload = await getUserFromRequest(request);
  if (!payload || !isAdmin(payload)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { status } = await request.json();
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SOLD'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const listing = await prisma.accountListing.update({
    where: { id: params.id },
    data: { status },
  });
  return NextResponse.json(listing);
}
