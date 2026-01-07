import nodemailer from "nodemailer";

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

// Create transporter only if SMTP is configured
const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
};

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
    const transporter = createTransporter();

    if (!transporter) {
        console.log("[Email] SMTP not configured, skipping email");
        return false;
    }

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html,
        });
        console.log(`[Email] Sent to ${to}: ${subject}`);
        return true;
    } catch (error) {
        console.error("[Email] Failed to send:", error);
        return false;
    }
}

// Email templates
export const emailTemplates = {
    requestApproved: (nama: string, items: string[]) => ({
        subject: "Permintaan Barang Disetujui - Hanadap",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">✅ Permintaan Disetujui</h2>
        <p>Halo ${nama},</p>
        <p>Permintaan barang Anda telah disetujui. Berikut detailnya:</p>
        <ul>
          ${items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
        <p>Silakan ambil barang di gudang.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Hanadap - Sistem Manajemen Inventori</p>
      </div>
    `,
    }),

    requestRejected: (nama: string, alasan: string) => ({
        subject: "Permintaan Barang Ditolak - Hanadap",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">❌ Permintaan Ditolak</h2>
        <p>Halo ${nama},</p>
        <p>Mohon maaf, permintaan barang Anda tidak dapat disetujui.</p>
        <p><strong>Alasan:</strong> ${alasan || "Tidak tersedia"}</p>
        <p>Silakan ajukan permintaan baru jika diperlukan.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Hanadap - Sistem Manajemen Inventori</p>
      </div>
    `,
    }),

    lowStockAlert: (barangList: { nama: string; stok: number }[]) => ({
        subject: "⚠️ Peringatan Stok Menipis - Hanadap",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⚠️ Stok Menipis</h2>
        <p>Berikut barang yang stoknya sudah menipis:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f5f5f5;">
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Barang</th>
            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Sisa Stok</th>
          </tr>
          ${barangList
                .map(
                    (b) => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${b.nama}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; color: #dc2626; font-weight: bold;">${b.stok}</td>
            </tr>
          `
                )
                .join("")}
        </table>
        <p style="margin-top: 20px;">Segera lakukan restocking.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Hanadap - Sistem Manajemen Inventori</p>
      </div>
    `,
    }),

    newRequest: (requesterName: string, itemCount: number) => ({
        subject: "📋 Permintaan Barang Baru - Hanadap",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">📋 Permintaan Baru</h2>
        <p>Ada permintaan barang baru yang perlu diproses:</p>
        <p><strong>Dari:</strong> ${requesterName}</p>
        <p><strong>Jumlah Item:</strong> ${itemCount} barang</p>
        <p>Silakan login ke sistem untuk memprosesnya.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Hanadap - Sistem Manajemen Inventori</p>
      </div>
    `,
    }),
};
