import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const listings = await prisma.accountListing.findMany({
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(listings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { game, accountDetails, priceRequested, imageUrls, userId } = body;

    if (!game || !accountDetails || !priceRequested || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const listing = await prisma.accountListing.create({
      data: {
        game,
        accountDetails,
        priceRequested: parseFloat(priceRequested),
        imageUrls: imageUrls || [],
        userId,
      },
    });

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
