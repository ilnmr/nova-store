import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { verifyPaymentScreenshot } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string; // 'payment' or 'listing'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!['payment', 'listing'].includes(type)) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    const relativeDir = type === 'payment' ? 'payment-screenshots' : 'account-listings';
    
    // In Next.js, process.cwd() points to the root of the project
    const path = join(process.cwd(), 'public', 'uploads', relativeDir, fileName);

    await writeFile(path, buffer);
    const fileUrl = `/uploads/${relativeDir}/${fileName}`;

    let aiResult = null;
    if (type === 'payment') {
      aiResult = await verifyPaymentScreenshot(file, file.type);
    }

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      aiVerification: aiResult 
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
