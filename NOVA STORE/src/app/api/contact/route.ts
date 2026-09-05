import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const { name, phone, message } = await request.json();

    if (!name || !phone || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supportEmail = process.env.SUPPORT_EMAIL || 'adhamsaide2@gmail.com';

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h2 style="background: #111; color: #fff; padding: 20px; border-radius: 8px 8px 0 0;">
          رسالة جديدة من NOVA STORE
        </h2>
        <div style="padding: 24px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
          <p><strong>الاسم:</strong> ${name}</p>
          <p><strong>الموبايل:</strong> ${phone}</p>
          <hr />
          <p><strong>المشكلة:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 16px;">
          تم إرسال هذه الرسالة من نموذج الدعم في NOVA STORE
        </p>
      </div>
    `;

    const sent = await sendEmail({
      to: supportEmail,
      subject: `[NOVA STORE] رسالة من ${name}`,
      html,
    });

    if (!sent) {
      return NextResponse.json({ error: 'Email service unavailable' }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
