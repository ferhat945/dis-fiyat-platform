import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";
import StatusActions from "./status-actions";
import NoteEditor from "./note-editor";
import UnlockLeadButton from "./unlock-button";

export const dynamic = "force-dynamic";

type LeadStatus = "new" | "contacted" | "won" | "lost";

function statusLabel(s: LeadStatus): string {
  if (s === "new") return "Yeni";
  if (s === "contacted") return "İletişime Geçildi";
  if (s === "won") return "Kazanıldı";
  return "Kaybedildi";
}

function safeStatus(v: string): LeadStatus {
  if (v === "new" || v === "contacted" || v === "won" || v === "lost") return v;
  return "new";
}

function formatTR(d: Date): string {
  return d.toLocaleString("tr-TR");
}

function normalizePhoneTR(phone: string): string {
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

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Kilitli lead";

  return parts
    .map((p) => {
      const first = p[0] ?? "";
      return `${first}${"*".repeat(Math.max(3, p.length - 1))}`;
    })
    .join(" ");
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "05** *** ** **";
  return `${digits.slice(0, 2)}** *** ** ${digits.slice(-2)}`;
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const session = await requireClinic();

  const [assigned, clinicBalance] = await Promise.all([
    prisma.leadAssignment.findFirst({
      where: { clinicId: session.clinicId, leadId: id },
      select: {
        id: true,
        unlocked: true,
        unlockedAt: true,
        unlockPrice: true,
      },
    }),
    prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: {
        creditBalance: true,
      },
    }),
  ]);

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

  const st = safeStatus(lead.status);
  const isUnlocked = assigned.unlocked;
  const creditBalance = clinicBalance?.creditBalance ?? 0;
  const unlockPrice = Math.max(1, assigned.unlockPrice ?? 1);

  const shownName = isUnlocked ? lead.fullName : maskName(lead.fullName);
  const shownPhone = isUnlocked ? lead.phone : maskPhone(lead.phone);

  return (
    <div className="panelWrap">
      <div className="panelHeader">
        <div className="panelHeaderLeft">
          <div className="panelKicker">🧾 Lead Detay</div>
          <h1 className="panelTitle">
            {shownName} <span style={{ opacity: 0.55, fontWeight: 900 }}>•</span> {shownPhone}
          </h1>
          <div className="panelSub">
            <span className="panelChip">📍 {lead.city}</span>{" "}
            <span className="panelChip panelChipSoft">🦷 {lead.service}</span>{" "}
            <span className={statusBadgeClass(st)}>{statusLabel(st)}</span>{" "}
            {!isUnlocked ? <span className="panelChip panelChipMuted">🔒 Kilitli</span> : null}
          </div>
        </div>

        <div className="panelHeaderRight">
          <Link className="panelQuickBtn panelQuickBtnSoft" href="/panel/leadler">
            ← Leadlere dön
          </Link>

          {isUnlocked ? (
            <a
              className="panelQuickBtn"
              href={whatsappHref(lead.fullName, lead.phone, lead.city, lead.service)}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp →
            </a>
          ) : null}
        </div>
      </div>

      {!isUnlocked ? (
        <div className="panelCard">
          <div className="panelCardHead">
            <div>
              <div className="panelCardTitle">🔒 Lead Kilitli</div>
              <div className="panelCardSub">
                Bu leadin telefon, e-posta ve mesaj bilgilerini görmek için {unlockPrice} kredi kullanmalısın.
              </div>
            </div>
            <div className="panelCardHeadRight">
              <span className="panelPill">Kredin: {creditBalance}</span>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <UnlockLeadButton leadId={lead.id} disabled={creditBalance < unlockPrice} />

            {creditBalance < unlockPrice ? (
              <Link href="/panel/abonelik" className="panelBtn">
                Kredi Satın Al →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">📌 Lead Bilgileri</div>
            <div className="panelCardSub">
              Oluşturma: {formatTR(lead.createdAt)}
              {isUnlocked && assigned.unlockedAt ? <> • Açılma: {formatTR(assigned.unlockedAt)}</> : null}
            </div>
          </div>
        </div>

        <div className="panelDetailGrid">
          <div className="panelDetailItem">
            <div className="panelDetailLabel">Ad Soyad</div>
            <div className="panelDetailValue">{isUnlocked ? lead.fullName : shownName}</div>
          </div>

          <div className="panelDetailItem">
            <div className="panelDetailLabel">Telefon</div>
            <div className="panelDetailValue">{isUnlocked ? lead.phone : shownPhone}</div>
          </div>

          <div className="panelDetailItem">
            <div className="panelDetailLabel">Email</div>
            <div className="panelDetailValue">{isUnlocked ? lead.email ?? "—" : "🔒 Kilitli"}</div>
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
            <div className="panelDetailValue panelDetailNote">
              {isUnlocked ? lead.message ?? "—" : "🔒 Mesajı görmek için leadi açmalısın."}
            </div>
          </div>
        </div>
      </div>

      {isUnlocked ? (
        <>
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
        </>
      ) : null}
    </div>
  );
}