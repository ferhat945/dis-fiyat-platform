import "server-only";
import { sendMail } from "@/lib/mailer";
import { cityLabel, serviceLabel } from "@/lib/seo-data";

type ClinicMini = {
  id: string;
  name: string;
  email: string | null;
};

type LeadMini = {
  id: string;
  city: string;
  service: string;
  createdAt: Date;
};

export async function notifyClinicNewLead({
  clinic,
  lead,
}: {
  clinic: ClinicMini;
  lead: LeadMini;
}): Promise<void> {
  const to = (clinic.email ?? "").trim();

  if (!to) {
    return;
  }

  const city = safeCityLabel(lead.city);
  const service = safeServiceLabel(lead.service);
  const created = new Date(lead.createdAt).toLocaleString("tr-TR");

  const baseUrl = getBaseUrl();
  const leadUrl = `${baseUrl}/panel/leadler/${encodeURIComponent(lead.id)}`;

  const subject = `Yeni kilitli lead: ${city} / ${service}`;

  const html = `
    <div style="margin:0;padding:28px;background:#f4f6fb;font-family:Arial,sans-serif;color:#111827">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.10)">
        <div style="padding:26px;background:linear-gradient(135deg,#111827,#4f46e5);color:#ffffff">
          <div style="display:inline-block;padding:7px 11px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(255,255,255,.12);font-size:12px;font-weight:700">
            Yeni Lead Bildirimi
          </div>

          <h1 style="margin:14px 0 0;font-size:27px;line-height:1.2">
            Yeni bir hasta talebi geldi
          </h1>

          <p style="margin:10px 0 0;color:rgba(255,255,255,.82);line-height:1.7">
            Hasta bilgileri güvenlik ve kredi sistemi nedeniyle kilitlidir.
            Lead detayını panelden açabilirsin.
          </p>
        </div>

        <div style="padding:26px">
          <div style="display:grid;gap:12px">
            <div style="padding:15px;border:1px solid #e5e7eb;border-radius:16px;background:#f8fafc">
              <div style="font-size:12px;color:#64748b;font-weight:700">Şehir</div>
              <div style="margin-top:5px;font-size:17px;font-weight:800">
                ${escapeHtml(city)}
              </div>
            </div>

            <div style="padding:15px;border:1px solid #e5e7eb;border-radius:16px;background:#f8fafc">
              <div style="font-size:12px;color:#64748b;font-weight:700">Hizmet</div>
              <div style="margin-top:5px;font-size:17px;font-weight:800">
                ${escapeHtml(service)}
              </div>
            </div>

            <div style="padding:15px;border:1px solid #e5e7eb;border-radius:16px;background:#f8fafc">
              <div style="font-size:12px;color:#64748b;font-weight:700">Talep tarihi</div>
              <div style="margin-top:5px;font-size:16px;font-weight:800">
                ${escapeHtml(created)}
              </div>
            </div>
          </div>

          <div style="margin-top:18px;padding:15px;border:1px solid #ddd6fe;border-radius:16px;background:#f5f3ff;color:#4c1d95;line-height:1.7;font-weight:700">
            🔒 Hasta adı, telefon numarası, e-posta adresi ve mesajı bu e-postada gösterilmez.
            İletişim bilgilerini görmek için panelde 1 kredi kullanarak leadi açmalısın.
          </div>

          <div style="margin-top:22px">
            <a
              href="${escapeHtml(leadUrl)}"
              style="display:block;text-align:center;padding:14px 18px;border-radius:16px;background:linear-gradient(135deg,#4f46e5,#9333ea);color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;box-shadow:0 16px 35px rgba(79,70,229,.24)"
            >
              Lead Detayını Gör →
            </a>
          </div>

          <div style="margin-top:18px;color:#64748b;font-size:12px;line-height:1.7">
            Lead ID: ${escapeHtml(lead.id)}<br />
            Bu e-posta DişFiyat360 klinik paneli tarafından otomatik gönderilmiştir.
          </div>
        </div>
      </div>
    </div>
  `;

  const text = `Yeni kilitli lead

Şehir: ${city}
Hizmet: ${service}
Talep tarihi: ${created}

Hasta adı, telefon numarası, e-posta adresi ve mesajı güvenlik nedeniyle bu e-postada gösterilmez.

İletişim bilgilerini görmek için panelde 1 kredi kullanarak leadi açmalısın.

Lead detayı:
${leadUrl}

Lead ID: ${lead.id}
`;

  await sendMail({
    to,
    subject,
    html,
    text,
  });
}

function getBaseUrl(): string {
  const base =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    process.env.APP_BASE_URL ||
    "http://localhost:3000";

  return base.replace(/\/+$/, "");
}

function safeCityLabel(citySlug: string): string {
  try {
    return cityLabel(citySlug);
  } catch {
    return citySlug;
  }
}

function safeServiceLabel(serviceSlug: string): string {
  try {
    return serviceLabel(serviceSlug);
  } catch {
    return serviceSlug;
  }
}

function escapeHtml(value: string): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}