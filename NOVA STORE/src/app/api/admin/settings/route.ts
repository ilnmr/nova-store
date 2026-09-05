import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// ─── GET /api/admin/settings ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await prisma.setting.findMany();

    // Convert array to { key: value } map for easy consumption
    const settingsMap = settings.reduce<Record<string, string>>(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {}
    );

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── POST /api/admin/settings ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be an array of { key, value } objects' },
        { status: 400 }
      );
    }

    // Validate each entry
    for (const entry of body) {
      if (typeof entry.key !== 'string' || typeof entry.value !== 'string') {
        return NextResponse.json(
          { error: 'Each entry must have a string "key" and a string "value"' },
          { status: 400 }
        );
      }
    }

    // Upsert each setting in a transaction
    const upserts = (body as { key: string; value: string }[]).map((entry) =>
      prisma.setting.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: { key: entry.key, value: entry.value },
      })
    );

    const results = await prisma.$transaction(upserts);

    return NextResponse.json({ success: true, updated: results.length });
  } catch (error) {
    console.error('POST /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
