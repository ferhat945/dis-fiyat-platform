import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";
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

function formatTR(d: Date): string {
  return d.toLocaleString("tr-TR");
}

function normalizePhoneTR(phone: string): string {
  // wa.me için 90 + (başındaki 0 atılır) + sadece rakam
  const onlyDigits = phone.replace(/\D/g, "");
  const noLeadingZero = onlyDigits.replace(/^0+/, "");
  return `90${noLeadingZero}`;
}

function whatsappHref(fullName: string, phone: string, city: string, service: string): string {
  const p = normalizePhoneTR(phone);
  const txt = `Merhaba ${fullName}, ${city} / ${service} için talebinizi aldık. Size yardımcı olalım mı?`;
  return `https://wa.me/${p}?text=${encodeURIComponent(txt)}`;
}

function statusBadgeClass(s: LeadStatus): string {
  if (s === "new") return "panelLeadStatus panelLeadStatusNew";
  if (s === "contacted") return "panelLeadStatus panelLeadStatusContacted";
  if (s === "won") return "panelLeadStatus panelLeadStatusWon";
  return "panelLeadStatus panelLeadStatusLost";
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const session = await requireClinic();

  // Lead bu kliniğe atanmış mı?
  const assigned = await prisma.leadAssignment.findFirst({
    where: { clinicId: session.clinicId, leadId: id },
    select: { id: true },
  });

  if (!assigned) {
    return (
      <div className="panelWrap">
        <div className="panelHeader">
          <div className="panelHeaderLeft">
            <div className="panelKicker">🧾 Lead Detay</div>
            <h1 className="panelTitle">Bulunamadı</h1>
            <div className="panelSub">Bu lead sana atanmış görünmüyor.</div>
          </div>
          <div className="panelHeaderRight">
            <Link className="panelQuickBtn panelQuickBtnSoft" href="/panel/leadler">
              ← Leadlere dön
            </Link>
          </div>
        </div>

        <div className="panelAlert">
          <div className="panelAlertTitle">Hata: NOT_FOUND</div>
          <div className="panelAlertDesc">Lead erişimin yok veya lead silinmiş olabilir.</div>
        </div>
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
      <div className="panelWrap">
        <div className="panelHeader">
          <div className="panelHeaderLeft">
            <div className="panelKicker">🧾 Lead Detay</div>
            <h1 className="panelTitle">Bulunamadı</h1>
            <div className="panelSub">Lead kayıt bulunamadı.</div>
          </div>
          <div className="panelHeaderRight">
            <Link className="panelQuickBtn panelQuickBtnSoft" href="/panel/leadler">
              ← Leadlere dön
            </Link>
          </div>
        </div>

        <div className="panelAlert">
          <div className="panelAlertTitle">Hata: NOT_FOUND</div>
          <div className="panelAlertDesc">Lead silinmiş veya erişilemiyor olabilir.</div>
        </div>
      </div>
    );
  }

  const st = lead.status as LeadStatus;

  return (
    <div className="panelWrap">
      <div className="panelHeader">
        <div className="panelHeaderLeft">
          <div className="panelKicker">🧾 Lead Detay</div>
          <h1 className="panelTitle">
            {lead.fullName} <span style={{ opacity: 0.55, fontWeight: 900 }}>•</span> {lead.phone}
          </h1>
          <div className="panelSub">
            <span className="panelChip">📍 {lead.city}</span>{" "}
            <span className="panelChip panelChipSoft">🦷 {lead.service}</span>{" "}
            <span className={statusBadgeClass(st)}>{statusLabel(st)}</span>
          </div>
        </div>

        <div className="panelHeaderRight">
          <Link className="panelQuickBtn panelQuickBtnSoft" href="/panel/leadler">
            ← Leadlere dön
          </Link>
          <a className="panelQuickBtn" href={whatsappHref(lead.fullName, lead.phone, lead.city, lead.service)} target="_blank" rel="noreferrer">
            WhatsApp →
          </a>
        </div>
      </div>

      {/* Lead info */}
      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">📌 Lead Bilgileri</div>
            <div className="panelCardSub">Oluşturma: {formatTR(lead.createdAt)}</div>
          </div>
        </div>

        <div className="panelDetailGrid">
          <div className="panelDetailItem">
            <div className="panelDetailLabel">Telefon</div>
            <div className="panelDetailValue">{lead.phone}</div>
          </div>

          <div className="panelDetailItem">
            <div className="panelDetailLabel">Email</div>
            <div className="panelDetailValue">{lead.email ?? "—"}</div>
          </div>

          <div className="panelDetailItem">
            <div className="panelDetailLabel">Şehir</div>
            <div className="panelDetailValue">{lead.city}</div>
          </div>

          <div className="panelDetailItem">
            <div className="panelDetailLabel">Hizmet</div>
            <div className="panelDetailValue">{lead.service}</div>
          </div>

          <div className="panelDetailItem panelDetailWide">
            <div className="panelDetailLabel">Mesaj</div>
            <div className="panelDetailValue panelDetailNote">{lead.message ?? "—"}</div>
          </div>
        </div>
      </div>

      {/* Status actions */}
      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">✅ Durum Güncelle</div>
            <div className="panelCardSub">Lead ile iletişim durumuna göre güncelle.</div>
          </div>
        </div>

        <div className="panelActionsShell">
          <StatusActions leadId={lead.id} currentStatus={st} />
        </div>
      </div>

      {/* Note + last contact */}
      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">📝 Not & Son Arama</div>
            <div className="panelCardSub">Kısa not ekle, son arama zamanını işaretle.</div>
          </div>
        </div>

        <NoteEditor
          leadId={lead.id}
          initialNote={lead.clinicNote}
          initialLastContactAt={lead.lastContactAt ? lead.lastContactAt.toISOString() : null}
        />
      </div>

      {/* Quick actions */}
      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">⚡ Hızlı Aksiyon</div>
            <div className="panelCardSub">Tek tıkla WhatsApp üzerinden dönüş yap.</div>
          </div>
        </div>

        <div className="panelQuickActions">
          <a
            className="panelBtn"
            href={whatsappHref(lead.fullName, lead.phone, lead.city, lead.service)}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp’a yaz →
          </a>

          <Link className="panelBtnGhost" href="/panel/leadler">
            Listeye dön
          </Link>
        </div>
      </div>
    </div>
  );
}