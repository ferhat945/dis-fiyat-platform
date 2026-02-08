import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";
import StatusActions from "./status-actions";
import NoteEditor from "./note-editor";

export const dynamic = "force-dynamic";

type LeadStatus = "new" | "contacted" | "won" | "lost";

function statusLabel(s: LeadStatus): string {
  if (s === "new") return "Yeni";
  if (s === "contacted") return "İletişime Geçildi";
  if (s === "won") return "Kazanıldı";
  return "Kaybedildi";
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;

  const token = (await cookies()).get("clinic_session")?.value ?? "";
  const session = token ? await verifyClinicSession(token) : null;

  if (!session) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Yetkisiz</h1>
        <div>
          Lütfen <a href="/panel/login">/panel/login</a> üzerinden giriş yap.
        </div>
      </div>
    );
  }

  // Lead bu kliniğe atanmış mı?
  const assigned = await prisma.leadAssignment.findFirst({
    where: { clinicId: session.clinicId, leadId: id },
    select: { id: true },
  });

  if (!assigned) {
    return (
      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Lead Detay</h1>
        <div style={{ marginBottom: 12 }}>Hata: NOT_FOUND</div>
        <Link href="/panel/leadler" style={{ fontWeight: 900, textDecoration: "none" }}>
          ← Leadlere dön
        </Link>
      </div>
    );
  }

  const lead = await prisma.lead.findUnique({
    where: { id },
    select: {
      id: true,
      city: true,
      service: true,
      fullName: true,
      phone: true,
      email: true,
      message: true,
      status: true,
      clinicNote: true,
      lastContactAt: true,
      createdAt: true,
    },
  });

  if (!lead) {
    return (
      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Lead Detay</h1>
        <div style={{ marginBottom: 12 }}>Hata: NOT_FOUND</div>
        <Link href="/panel/leadler" style={{ fontWeight: 900, textDecoration: "none" }}>
          ← Leadlere dön
        </Link>
      </div>
    );
  }

  const st = lead.status as LeadStatus;

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto", display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Lead Detay</h1>
        <Link href="/panel/leadler" style={{ fontWeight: 900, textDecoration: "none" }}>
          ← Leadlere dön
        </Link>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 900 }}>
          {lead.fullName} — {lead.phone}
        </div>

        <div style={{ opacity: 0.85 }}>
          <strong>Şehir:</strong> {lead.city} &nbsp; | &nbsp; <strong>Hizmet:</strong> {lead.service}
        </div>

        <div style={{ opacity: 0.85 }}>
          <strong>Durum:</strong> {statusLabel(st)} ({st})
        </div>

        <div style={{ opacity: 0.85 }}>
          <strong>Email:</strong> {lead.email ?? "—"}
        </div>

        <div style={{ opacity: 0.85 }}>
          <strong>Mesaj:</strong> {lead.message ?? "—"}
        </div>

        <div style={{ opacity: 0.75 }}>
          <strong>Oluşturma:</strong> {new Date(lead.createdAt).toLocaleString("tr-TR")}
        </div>
      </div>

      {/* Status butonları */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Durum Güncelle</div>
        <StatusActions leadId={lead.id} currentStatus={st} />
      </div>

      {/* Not + Son arama */}
      <NoteEditor
        leadId={lead.id}
        initialNote={lead.clinicNote}
        initialLastContactAt={lead.lastContactAt ? lead.lastContactAt.toISOString() : null}
      />

      {/* WhatsApp hızlı aksiyon */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Hızlı Aksiyon</div>
        <a
          href={`https://wa.me/90${lead.phone.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
            `Merhaba ${lead.fullName}, ${lead.city} / ${lead.service} için teklif talebinizi aldık. Size yardımcı olalım mı?`
          )}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          WhatsApp’a yaz →
        </a>
      </div>
    </div>
  );
}
