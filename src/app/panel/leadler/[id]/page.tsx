import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";
import StatusActions from "./status-actions";
import NoteEditor from "./note-editor";
import UnlockLeadButton from "./unlock-button";

export const dynamic = "force-dynamic";

const MARKETPLACE_MAX_PURCHASES = 3;
const MARKETPLACE_MAX_AGE_DAYS = 14;
const DEFAULT_MARKETPLACE_PRICE = 1;

type LeadStatus = "new" | "contacted" | "won" | "lost";

function statusLabel(s: LeadStatus): string {
  if (s === "new") return "Yeni";
  if (s === "contacted") return "İletişime Geçildi";
  if (s === "won") return "Kazanıldı";
  return "Kaybedildi";
}

function safeStatus(v: string): LeadStatus {
  if (
    v === "new" ||
    v === "contacted" ||
    v === "won" ||
    v === "lost"
  ) {
    return v;
  }

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

function whatsappHref(
  fullName: string,
  phone: string,
  city: string,
  service: string
): string {
  const p = normalizePhoneTR(phone);

  const txt =
    `Merhaba ${fullName}, ${city} / ${service} için ` +
    "talebinizi aldık. Size yardımcı olalım mı?";

  return `https://wa.me/${p}?text=${encodeURIComponent(txt)}`;
}

function statusBadgeClass(s: LeadStatus): string {
  if (s === "new") {
    return "panelLeadStatus panelLeadStatusNew";
  }

  if (s === "contacted") {
    return "panelLeadStatus panelLeadStatusContacted";
  }

  if (s === "won") {
    return "panelLeadStatus panelLeadStatusWon";
  }

  return "panelLeadStatus panelLeadStatusLost";
}

function maskName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "Kilitli lead";
  }

  return parts
    .map((p) => {
      const first = p[0] ?? "";

      return `${first}${"*".repeat(
        Math.max(3, p.length - 1)
      )}`;
    })
    .join(" ");
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length < 6) {
    return "05** *** ** **";
  }

  return `${digits.slice(0, 2)}** *** ** ${digits.slice(-2)}`;
}

function marketplaceCutoff(): Date {
  return new Date(
    Date.now() -
      MARKETPLACE_MAX_AGE_DAYS *
        24 *
        60 *
        60 *
        1000
  );
}

function NotFoundView({
  message,
}: {
  message: string;
}): JSX.Element {
  return (
    <div className="panelWrap">
      <div className="panelHeader">
        <div className="panelHeaderLeft">
          <div className="panelKicker">
            🧾 Lead Detay
          </div>

          <h1 className="panelTitle">
            Bulunamadı
          </h1>

          <div className="panelSub">
            {message}
          </div>
        </div>

        <div className="panelHeaderRight">
          <Link
            className="panelQuickBtn panelQuickBtnSoft"
            href="/panel/leadler"
          >
            ← Leadlere dön
          </Link>
        </div>
      </div>

      <div className="panelAlert">
        <div className="panelAlertTitle">
          Hata: NOT_FOUND
        </div>

        <div className="panelAlertDesc">
          Lead erişimin yok, lead dolmuş veya lead artık
          marketplacete olmayabilir.
        </div>
      </div>
    </div>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const session = await requireClinic();

  /*
   * Önce yalnız erişim kararında gerekli alanları alıyoruz.
   *
   * Henüz satın alınmamış marketplace lead'inde
   * email/message gibi özel alanları bu sorguda almıyoruz.
   */
  const [leadAccess, clinic] = await Promise.all([
    prisma.lead.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        city: true,
        service: true,
        source: true,
        createdAt: true,
        unlockCount: true,

        assignments: {
          where: {
            clinicId: session.clinicId,
          },

          select: {
            id: true,
            unlocked: true,
            unlockedAt: true,
            unlockPrice: true,
            status: true,
            clinicNote: true,
            lastContactAt: true,
          },

          take: 1,
        },

        distributionLogs: {
          where: {
            reason: "fcfs_marketplace_created",
          },

          select: {
            id: true,
          },

          take: 1,
        },
      },
    }),

    prisma.clinic.findUnique({
      where: {
        id: session.clinicId,
      },

      select: {
        id: true,
        isActive: true,
        creditBalance: true,
      },
    }),
  ]);

  if (!leadAccess) {
    return (
      <NotFoundView message="Lead kayıt bulunamadı." />
    );
  }

  if (!clinic || !clinic.isActive) {
    return (
      <NotFoundView message="Klinik hesabın bu lead için aktif değil." />
    );
  }

  const assignment =
    leadAccess.assignments[0] ?? null;

  const isDirect =
    leadAccess.source === "clinic_direct";

  /*
   * ==========================================================
   * DIRECT CLINIC LEAD
   * ==========================================================
   *
   * Direct lead yalnız kendisine assignment oluşturulan
   * klinik tarafından görülebilir.
   *
   * Başka klinik aynı URL'yi bilse bile erişemez.
   */
  if (isDirect && !assignment) {
    return (
      <NotFoundView message="Bu lead sana ait değil." />
    );
  }

  /*
   * ==========================================================
   * SATIN ALINMIŞ MARKETPLACE LEAD
   * ==========================================================
   *
   * unlocked:true assignment varsa klinik bu lead'i daha önce
   * satın almıştır.
   *
   * Lead sonradan 3/3 dolsa veya 14 günü geçse bile
   * satın alan klinik erişimini kaybetmez.
   */
  const isPurchased =
    !isDirect &&
    assignment?.unlocked === true;

  /*
   * ==========================================================
   * SATIN ALINMAMIŞ MARKETPLACE LEAD
   * ==========================================================
   *
   * Bu durumda marketplace uygunluğunu yeniden backend'de
   * kontrol ediyoruz.
   */
  let marketplaceEligible = false;

  if (!isDirect && !isPurchased) {
    const isFresh =
      leadAccess.createdAt >= marketplaceCutoff();

    const hasFcfsMarker =
      leadAccess.distributionLogs.length > 0;

    const hasSlot =
      leadAccess.unlockCount <
      MARKETPLACE_MAX_PURCHASES;

    if (
      isFresh &&
      hasFcfsMarker &&
      hasSlot
    ) {
      const coverage =
        await prisma.clinicCoverage.findFirst({
          where: {
            clinicId: session.clinicId,
            city: leadAccess.city,
            service: leadAccess.service,
            isActive: true,

            clinic: {
              isActive: true,
            },
          },

          select: {
            id: true,
          },
        });

      marketplaceEligible =
        Boolean(coverage);
    }

    if (!marketplaceEligible) {
      return (
        <NotFoundView message="Bu lead artık satın alınabilir değil veya hizmet kapsamına uygun değilsin." />
      );
    }
  }

  /*
   * Direct lead:
   * assignment varsa görüntülenebilir.
   *
   * Marketplace:
   * - satın alınmışsa görüntülenebilir
   * - satın alınmamışsa eligibility kontrolünden geçmiş olmalı
   */
  const isUnlocked =
    assignment?.unlocked === true;

  /*
   * Erişim kararı verildikten sonra lead detaylarını alıyoruz.
   */
  const lead =
    await prisma.lead.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        city: true,
        service: true,
        fullName: true,
        phone: true,
        email: true,
        message: true,
        createdAt: true,
        unlockCount: true,
      },
    });

  if (!lead) {
    return (
      <NotFoundView message="Lead kayıt bulunamadı." />
    );
  }

  /*
   * CRM bilgileri artık Lead üzerinde ortak değildir.
   *
   * Her satın alan kliniğin kendi:
   *
   * - status
   * - clinicNote
   * - lastContactAt
   *
   * değerleri LeadAssignment üzerinden gelir.
   */
  const st =
    safeStatus(
      assignment?.status ?? "new"
    );

  const creditBalance =
    clinic.creditBalance;

  const unlockPrice =
    Math.max(
      1,
      assignment?.unlockPrice ??
        DEFAULT_MARKETPLACE_PRICE
    );

  const shownName =
    isUnlocked
      ? lead.fullName
      : maskName(lead.fullName);

  const shownPhone =
    isUnlocked
      ? lead.phone
      : maskPhone(lead.phone);

  const remainingSlots =
    Math.max(
      0,
      MARKETPLACE_MAX_PURCHASES -
        lead.unlockCount
    );

  return (
    <div className="panelWrap">
      <div className="panelHeader">
        <div className="panelHeaderLeft">
          <div className="panelKicker">
            🧾 Lead Detay
          </div>

          <h1 className="panelTitle">
            {shownName}{" "}
            <span
              style={{
                opacity: 0.55,
                fontWeight: 900,
              }}
            >
              •
            </span>{" "}
            {shownPhone}
          </h1>

          <div className="panelSub">
            <span className="panelChip">
              📍 {lead.city}
            </span>{" "}

            <span className="panelChip panelChipSoft">
              🦷 {lead.service}
            </span>{" "}

            {isUnlocked ? (
              <span className={statusBadgeClass(st)}>
                {statusLabel(st)}
              </span>
            ) : null}{" "}

            {!isUnlocked ? (
              <span className="panelChip panelChipMuted">
                🔒 Kilitli
              </span>
            ) : null}

            {!isDirect && !isUnlocked ? (
              <>
                {" "}
                <span className="panelChip">
                  🔥 {lead.unlockCount}/
                  {MARKETPLACE_MAX_PURCHASES} satın alındı
                </span>
              </>
            ) : null}

            {isDirect && !isUnlocked ? (
              <>
                {" "}
                <span className="panelChip">
                  ⭐ Size Özel
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className="panelHeaderRight">
          <Link
            className="panelQuickBtn panelQuickBtnSoft"
            href="/panel/leadler"
          >
            ← Leadlere dön
          </Link>

          {isUnlocked ? (
            <a
              className="panelQuickBtn"
              href={whatsappHref(
                lead.fullName,
                lead.phone,
                lead.city,
                lead.service
              )}
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
              <div className="panelCardTitle">
                🔒 Lead Kilitli
              </div>

              <div className="panelCardSub">
                {isDirect
                  ? `Bu özel leadin telefon, e-posta ve mesaj bilgilerini görmek için ${unlockPrice} kredi kullanmalısın.`
                  : `Bu leadin iletişim bilgilerini görmek için ${unlockPrice} kredi kullanmalısın. İlk 3 klinik satın alabilir.`}
              </div>
            </div>

            <div className="panelCardHeadRight">
              <span className="panelPill">
                Kredin: {creditBalance}
              </span>
            </div>
          </div>

          {!isDirect ? (
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                fontWeight: 800,
                opacity: 0.72,
              }}
            >
              Kalan satın alma hakkı: {remainingSlots}
            </div>
          ) : null}

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <UnlockLeadButton
              leadId={lead.id}
              disabled={
                creditBalance <
                unlockPrice
              }
            />

            {creditBalance < unlockPrice ? (
              <Link
                href="/panel/abonelik"
                className="panelBtn"
              >
                Kredi Satın Al →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">
              📌 Lead Bilgileri
            </div>

            <div className="panelCardSub">
              Oluşturma:{" "}
              {formatTR(lead.createdAt)}

              {isUnlocked &&
              assignment?.unlockedAt ? (
                <>
                  {" "}
                  • Açılma:{" "}
                  {formatTR(
                    assignment.unlockedAt
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="panelDetailGrid">
          <div className="panelDetailItem">
            <div className="panelDetailLabel">
              Ad Soyad
            </div>

            <div className="panelDetailValue">
              {shownName}
            </div>
          </div>

          <div className="panelDetailItem">
            <div className="panelDetailLabel">
              Telefon
            </div>

            <div className="panelDetailValue">
              {shownPhone}
            </div>
          </div>

          <div className="panelDetailItem">
            <div className="panelDetailLabel">
              Email
            </div>

            <div className="panelDetailValue">
              {isUnlocked
                ? lead.email ?? "—"
                : "🔒 Kilitli"}
            </div>
          </div>

          <div className="panelDetailItem">
            <div className="panelDetailLabel">
              Şehir
            </div>

            <div className="panelDetailValue">
              {lead.city}
            </div>
          </div>

          <div className="panelDetailItem">
            <div className="panelDetailLabel">
              Hizmet
            </div>

            <div className="panelDetailValue">
              {lead.service}
            </div>
          </div>

          <div className="panelDetailItem panelDetailWide">
            <div className="panelDetailLabel">
              Mesaj
            </div>

            <div className="panelDetailValue panelDetailNote">
              {isUnlocked
                ? lead.message ?? "—"
                : "🔒 Mesajı görmek için leadi satın almalısın."}
            </div>
          </div>
        </div>
      </div>

      {isUnlocked && assignment ? (
        <>
          <div className="panelCard">
            <div className="panelCardHead">
              <div>
                <div className="panelCardTitle">
                  ✅ Durum Güncelle
                </div>

                <div className="panelCardSub">
                  Lead ile iletişim durumuna göre güncelle.
                </div>
              </div>
            </div>

            <div className="panelActionsShell">
              <StatusActions
                leadId={lead.id}
                currentStatus={st}
              />
            </div>
          </div>

          <div className="panelCard">
            <div className="panelCardHead">
              <div>
                <div className="panelCardTitle">
                  📝 Not & Son Arama
                </div>

                <div className="panelCardSub">
                  Kısa not ekle, son arama zamanını işaretle.
                </div>
              </div>
            </div>

            <NoteEditor
              leadId={lead.id}
              initialNote={
                assignment.clinicNote
              }
              initialLastContactAt={
                assignment.lastContactAt
                  ? assignment.lastContactAt.toISOString()
                  : null
              }
            />
          </div>

          <div className="panelCard">
            <div className="panelCardHead">
              <div>
                <div className="panelCardTitle">
                  ⚡ Hızlı Aksiyon
                </div>

                <div className="panelCardSub">
                  Tek tıkla WhatsApp üzerinden dönüş yap.
                </div>
              </div>
            </div>

            <div className="panelQuickActions">
              <a
                className="panelBtn"
                href={whatsappHref(
                  lead.fullName,
                  lead.phone,
                  lead.city,
                  lead.service
                )}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp’a yaz →
              </a>

              <Link
                className="panelBtnGhost"
                href="/panel/leadler"
              >
                Listeye dön
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}