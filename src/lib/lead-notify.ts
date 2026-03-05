import "server-only";
import { sendMail } from "@/lib/mailer";
import { cityLabel, serviceLabel } from "@/lib/seo-data";

/**
 * Klinik mail bildirimi
 * - clinic.email boşsa mail atmaz
 * - hata fırlatmaz (caller zaten try/catch yapıyor)
 */
type ClinicMini = { id: string; name: string; email: string | null };
type LeadMini = {
  id: string;
  city: string;
  service: string;
  fullName: string;
  phone: string;
  message: string | null;
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
  if (!to) return;

  const city = safeCityLabel(lead.city);
  const service = safeServiceLabel(lead.service);

  const baseUrl = getBaseUrl();
  // Panelde lead detay route’unun adı sende değişebilir.
  // En güvenlisi: liste sayfasına yönlendirip ID’yi mailde net göstermek.
  const panelUrl = `${baseUrl}/panel/leadler`;

  const subject = `Yeni Lead: ${city} / ${service}`;

  const created = new Date(lead.createdAt).toLocaleString("tr-TR");

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
    <h2 style="margin:0 0 12px">Yeni Lead Geldi ✅</h2>

    <div style="margin:0 0 10px">
      <strong>Şehir / Hizmet:</strong> ${escapeHtml(city)} / ${escapeHtml(service)}
    </div>

    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:720px">
      <tr>
        <td style="padding:6px 0;width:160px"><strong>Ad Soyad</strong></td>
        <td style="padding:6px 0">${escapeHtml(lead.fullName || "-")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0"><strong>Telefon</strong></td>
        <td style="padding:6px 0">${escapeHtml(lead.phone || "-")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0"><strong>Not</strong></td>
        <td style="padding:6px 0">${escapeHtml(lead.message ?? "-")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0"><strong>Tarih</strong></td>
        <td style="padding:6px 0">${escapeHtml(created)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0"><strong>Lead ID</strong></td>
        <td style="padding:6px 0">${escapeHtml(lead.id)}</td>
      </tr>
    </table>

    <div style="margin-top:16px">
      <a href="${panelUrl}"
         style="display:inline-block;padding:10px 14px;border-radius:10px;background:#111;color:#fff;text-decoration:none;font-weight:700">
        Panele Git →
      </a>
    </div>

    <p style="margin-top:16px;color:#555;font-size:12px">
      Not: Bu e-posta bilgilendirme amaçlıdır; kesin fiyat muayene sonrası netleşir.
    </p>
  </div>
  `;

  const text = `Yeni Lead ✅
Şehir/Hizmet: ${city} / ${service}
Ad Soyad: ${lead.fullName || "-"}
Telefon: ${lead.phone || "-"}
Not: ${lead.message ?? "-"}
Tarih: ${created}
Lead ID: ${lead.id}
Panel: ${panelUrl}
`;

  await sendMail({ to, subject, html, text });
}

function getBaseUrl(): string {
  const base =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    process.env.APP_BASE_URL ||
    "http://localhost:3000";

  return (base || "").replace(/\/+$/, "");
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

function escapeHtml(s: string): string {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}