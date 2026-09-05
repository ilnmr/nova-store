import { NextResponse } from 'next/server';
import { suggestGameArtwork } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { gameName } = await request.json();
    if (!gameName) {
      return NextResponse.json({ error: 'gameName is required' }, { status: 400 });
    }
    const suggestion = await suggestGameArtwork(gameName);
    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('AI Suggest Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
