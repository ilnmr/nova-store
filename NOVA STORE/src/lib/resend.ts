import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Skipping email send.");
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'NOVA STORE <onboarding@resend.dev>', // Update with verified domain in production
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend Error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
