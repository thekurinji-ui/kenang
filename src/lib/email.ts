// Helper pengiriman email pakai Resend (https://resend.com).
// Pakai fetch langsung ke REST API-nya jadi gak perlu nambah dependency baru.
//
// Setup:
// 1. Daftar gratis di resend.com (free tier: 100 email/hari, 3000/bulan)
// 2. Ambil API key di dashboard → API Keys
// 3. Isi RESEND_API_KEY di .env
// 4. EMAIL_FROM harus pakai domain yang sudah diverifikasi di Resend.
//    Untuk testing awal tanpa domain sendiri, bisa pakai "onboarding@resend.dev"
//    (cuma bisa kirim ke email akun Resend kamu sendiri, cocok buat testing).

const RESEND_API_URL = "https://api.resend.com/emails";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Kenang Kurinji <onboarding@resend.dev>";

  if (!apiKey) {
    // Mode development tanpa API key: tulis ke console aja biar gak nge-block flow.
    console.warn(
      "[email] RESEND_API_KEY belum diset — email tidak benar-benar terkirim.\n" +
        `[email] To: ${to}\n[email] Subject: ${subject}\n[email] HTML:\n${html}`
    );
    return { success: true, dev: true };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    console.error("[email] Gagal kirim email:", res.status, errorBody);
    return { success: false };
  }

  return { success: true };
}

export function passwordResetEmailHtml(resetUrl: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <p style="margin-bottom: 16px;">
      <img src="${appUrl}/logo.png" alt="Kenang Kurinji" style="height: 32px; width: auto;" />
    </p>
    <h2 style="color: #1a1a1a;">Reset Password Kamu</h2>
    <p style="color: #444; line-height: 1.6;">
      Kami menerima permintaan untuk reset password akun Kenang Kurinji kamu.
      Klik tombol di bawah ini untuk membuat password baru. Link ini berlaku
      selama <strong>1 jam</strong>.
    </p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}"
         style="background: #b3123c; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600;">
        Reset Password
      </a>
    </p>
    <p style="color: #888; font-size: 13px; line-height: 1.6;">
      Kalau kamu tidak meminta reset password, abaikan saja email ini —
      password akun kamu tidak akan berubah.
    </p>
    <p style="color: #888; font-size: 13px;">
      Atau copy link ini ke browser: <br />
      <span style="word-break: break-all;">${resetUrl}</span>
    </p>
  </div>
  `;
}
