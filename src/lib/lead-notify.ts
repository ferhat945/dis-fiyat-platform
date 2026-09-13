import "server-only";

import { sendMail } from "@/lib/mailer";
import {
  cityLabel,
  serviceLabel,
} from "@/lib/seo-data";

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
  const to =
    (clinic.email ?? "").trim();

  if (!to) {
    return;
  }

  const city =
    safeCityLabel(
      lead.city,
    );

  const service =
    safeServiceLabel(
      lead.service,
    );

  const created =
    new Date(
      lead.createdAt,
    ).toLocaleString(
      "tr-TR",
    );

  const baseUrl =
    getBaseUrl();

  const leadUrl =
    `${baseUrl}/panel/leadler/${encodeURIComponent(
      lead.id,
    )}`;

  const clinicName =
    clinic.name.trim() ||
    "Klinik";

  const subject =
    `Yeni hasta talebi: ${city} / ${service}`;

  const html = `
    <div
      style="
        margin:0;
        padding:32px 20px;
        background:#f5f7fb;
        font-family:Arial,Helvetica,sans-serif;
        color:#111827;
      "
    >
      <div
        style="
          max-width:680px;
          margin:0 auto;
          background:#ffffff;
          border:1px solid #e5e7eb;
          border-radius:20px;
          overflow:hidden;
          box-shadow:0 18px 45px rgba(15,23,42,.08);
        "
      >
        <div
          style="
            padding:28px;
            background:linear-gradient(135deg,#4f46e5,#7c3aed);
            color:#ffffff;
          "
        >
          <div
            style="
              display:inline-block;
              padding:7px 11px;
              border:1px solid rgba(255,255,255,.24);
              border-radius:999px;
              background:rgba(255,255,255,.12);
              font-size:12px;
              font-weight:700;
            "
          >
            DişFiyat360
          </div>

          <h1
            style="
              margin:16px 0 0;
              font-size:27px;
              line-height:1.25;
              font-weight:800;
            "
          >
            Yeni bir hasta talebi oluşturuldu
          </h1>

          <p
            style="
              margin:10px 0 0;
              color:rgba(255,255,255,.86);
              font-size:15px;
              line-height:1.7;
            "
          >
            Kliniğinizin hizmet kapsamına uygun yeni bir talep
            sisteme eklendi. Talep detaylarını klinik panelinizden
            inceleyebilirsiniz.
          </p>
        </div>

        <div
          style="
            padding:28px;
          "
        >
          <p
            style="
              margin:0 0 18px;
              color:#374151;
              font-size:15px;
              line-height:1.7;
            "
          >
            Merhaba
            <strong>
              ${escapeHtml(clinicName)}
            </strong>,
          </p>

          <div
            style="
              display:grid;
              gap:12px;
            "
          >
            <div
              style="
                padding:15px 16px;
                border:1px solid #e5e7eb;
                border-radius:14px;
                background:#f8fafc;
              "
            >
              <div
                style="
                  font-size:12px;
                  color:#64748b;
                  font-weight:700;
                "
              >
                Şehir
              </div>

              <div
                style="
                  margin-top:5px;
                  font-size:17px;
                  color:#111827;
                  font-weight:800;
                "
              >
                ${escapeHtml(city)}
              </div>
            </div>

            <div
              style="
                padding:15px 16px;
                border:1px solid #e5e7eb;
                border-radius:14px;
                background:#f8fafc;
              "
            >
              <div
                style="
                  font-size:12px;
                  color:#64748b;
                  font-weight:700;
                "
              >
                Hizmet
              </div>

              <div
                style="
                  margin-top:5px;
                  font-size:17px;
                  color:#111827;
                  font-weight:800;
                "
              >
                ${escapeHtml(service)}
              </div>
            </div>

            <div
              style="
                padding:15px 16px;
                border:1px solid #e5e7eb;
                border-radius:14px;
                background:#f8fafc;
              "
            >
              <div
                style="
                  font-size:12px;
                  color:#64748b;
                  font-weight:700;
                "
              >
                Talep tarihi
              </div>

              <div
                style="
                  margin-top:5px;
                  font-size:16px;
                  color:#111827;
                  font-weight:800;
                "
              >
                ${escapeHtml(created)}
              </div>
            </div>
          </div>

          <div
            style="
              margin-top:18px;
              padding:15px 16px;
              border:1px solid #ddd6fe;
              border-radius:14px;
              background:#f5f3ff;
              color:#5b21b6;
              font-size:14px;
              line-height:1.7;
              font-weight:700;
            "
          >
            Hasta iletişim bilgileri bu e-postada gösterilmez.
            Talep detaylarını ve erişim seçeneklerini güvenli
            klinik panelinizden inceleyebilirsiniz.
          </div>

          <div
            style="
              margin-top:22px;
            "
          >
            <a
              href="${escapeHtml(leadUrl)}"
              style="
                display:block;
                text-align:center;
                padding:15px 18px;
                border-radius:14px;
                background:linear-gradient(135deg,#4f46e5,#7c3aed);
                color:#ffffff;
                text-decoration:none;
                font-size:16px;
                font-weight:800;
                box-shadow:0 12px 28px rgba(79,70,229,.22);
              "
            >
              Talep Detayını Gör →
            </a>
          </div>

          <div
            style="
              margin-top:20px;
              padding-top:18px;
              border-top:1px solid #e5e7eb;
              color:#6b7280;
              font-size:12px;
              line-height:1.7;
            "
          >
            Talep ID:
            ${escapeHtml(lead.id)}
            <br />

            Bu e-posta DişFiyat360 klinik paneli tarafından
            otomatik olarak gönderilmiştir.
          </div>
        </div>
      </div>

      <div
        style="
          max-width:680px;
          margin:14px auto 0;
          text-align:center;
          color:#9ca3af;
          font-size:11px;
          line-height:1.6;
        "
      >
        DişFiyat360 • Klinik bildirim sistemi
      </div>
    </div>
  `;

  const text = `DişFiyat360 - Yeni hasta talebi

Merhaba ${clinicName},

Kliniğinizin hizmet kapsamına uygun yeni bir hasta talebi oluşturuldu.

Şehir: ${city}
Hizmet: ${service}
Talep tarihi: ${created}

Hasta iletişim bilgileri bu e-postada gösterilmez.
Talep detaylarını ve erişim seçeneklerini klinik panelinizden inceleyebilirsiniz.

Talep detayı:
${leadUrl}

Talep ID: ${lead.id}

Bu e-posta DişFiyat360 klinik paneli tarafından otomatik olarak gönderilmiştir.
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

  return base.replace(
    /\/+$/,
    "",
  );
}

function safeCityLabel(
  citySlug: string,
): string {
  try {
    return cityLabel(
      citySlug,
    );
  } catch {
    return citySlug;
  }
}

function safeServiceLabel(
  serviceSlug: string,
): string {
  try {
    return serviceLabel(
      serviceSlug,
    );
  } catch {
    return serviceSlug;
  }
}

function escapeHtml(
  value: string,
): string {
  return (
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#39;",
    );
}