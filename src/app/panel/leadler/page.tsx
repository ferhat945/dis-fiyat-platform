import Link from "next/link";

import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";

export const dynamic = "force-dynamic";

const MARKETPLACE_MAX_PURCHASES = 3;
const MARKETPLACE_MAX_AGE_DAYS = 14;
const DEFAULT_UNLOCK_PRICE = 1;

type LeadStatus =
  | "new"
  | "contacted"
  | "won"
  | "lost";

type SearchParams = {
  status?: string;
  q?: string;
};

type OpportunityKind =
  | "marketplace"
  | "direct";

type OpportunityRow = {
  id: string;
  city: string;
  service: string;
  fullName: string;
  phone: string;
  createdAt: Date;

  kind: OpportunityKind;

  unlockPrice: number;

  /*
   * Sadece marketplace lead'lerinde anlamlıdır.
   * Direct lead için 0 bırakılır.
   */
  unlockCount: number;
};

type PurchasedRow = {
  id: string;
  city: string;
  service: string;
  fullName: string;
  phone: string;
  status: LeadStatus;
  createdAt: Date;
  unlockPrice: number;
};

type CoveragePair = {
  city: string;
  service: string;
};

const STATUS_LABEL: Record<
  LeadStatus,
  string
> = {
  new: "Yeni",
  contacted: "İletişime Geçildi",
  won: "Kazanıldı",
  lost: "Kaybedildi",
};

function normalizeQuery(
  value: string | undefined
): string {
  return (value ?? "")
    .trim()
    .slice(0, 80);
}

function normalizeStatus(
  value: string | undefined
): LeadStatus | "all" {
  if (
    value === "new" ||
    value === "contacted" ||
    value === "won" ||
    value === "lost"
  ) {
    return value;
  }

  return "all";
}

function safeStatus(
  value: string
): LeadStatus {
  if (
    value === "new" ||
    value === "contacted" ||
    value === "won" ||
    value === "lost"
  ) {
    return value;
  }

  return "new";
}

function formatTR(
  date: Date
): string {
  return date.toLocaleString(
    "tr-TR"
  );
}

function statusBadgeClass(
  status: LeadStatus
): string {
  if (status === "new") {
    return "panelLeadStatus panelLeadStatusNew";
  }

  if (status === "contacted") {
    return "panelLeadStatus panelLeadStatusContacted";
  }

  if (status === "won") {
    return "panelLeadStatus panelLeadStatusWon";
  }

  return "panelLeadStatus panelLeadStatusLost";
}

function maskName(
  name: string
): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "Kilitli lead";
  }

  return parts
    .map((part) => {
      const first =
        part[0] ?? "";

      return `${first}${"*".repeat(
        Math.max(
          3,
          part.length - 1
        )
      )}`;
    })
    .join(" ");
}

function maskPhone(
  phone: string
): string {
  const digits =
    phone.replace(/\D/g, "");

  if (digits.length < 6) {
    return "05** *** ** **";
  }

  return `${digits.slice(
    0,
    2
  )}** *** ** ${digits.slice(
    -2
  )}`;
}

function isRecent(
  createdAt: Date,
  now: Date
): boolean {
  const diff =
    now.getTime() -
    createdAt.getTime();

  const sixHours =
    6 * 60 * 60 * 1000;

  return (
    diff >= 0 &&
    diff <= sixHours
  );
}

function marketplaceCutoff(
  now: Date
): Date {
  return new Date(
    now.getTime() -
      MARKETPLACE_MAX_AGE_DAYS *
        24 *
        60 *
        60 *
        1000
  );
}

function uniqueCoverages(
  values: CoveragePair[]
): CoveragePair[] {
  const seen =
    new Set<string>();

  const result:
    CoveragePair[] = [];

  for (const item of values) {
    const key =
      `${item.city}::${item.service}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    result.push({
      city: item.city,
      service: item.service,
    });
  }

  return result;
}

export default async function PanelLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<JSX.Element> {
  const sp =
    await searchParams;

  const session =
    await requireClinic();

  const now =
    new Date();

  const cutoff =
    marketplaceCutoff(now);

  const q =
    normalizeQuery(sp.q);

  const statusFilter =
    normalizeStatus(sp.status);

  let creditBalance = 0;

  let opportunityRows:
    OpportunityRow[] = [];

  let purchasedRows:
    PurchasedRow[] = [];

  let loadError:
    string | null = null;

  /*
   * Önce kliniğin:
   *
   * - kredi bakiyesini
   * - aktif şehir + hizmet kapsamlarını
   *
   * alıyoruz.
   */
  let coverages:
    CoveragePair[] = [];

  try {
    const clinic =
      await prisma.clinic.findUnique({
        where: {
          id: session.clinicId,
        },

        select: {
          creditBalance: true,

          coverages: {
            where: {
              isActive: true,
            },

            select: {
              city: true,
              service: true,
            },
          },
        },
      });

    creditBalance =
      clinic?.creditBalance ??
      0;

    coverages =
      uniqueCoverages(
        clinic?.coverages ??
          []
      );
  } catch (error) {
    console.error(
      "PANEL_LEADLER_CLINIC_ERROR",
      error
    );

    loadError =
      "Leadler şu an yüklenemedi. Panelin diğer alanlarını kullanmaya devam edebilirsin.";
  }

  /*
   * ========================================================
   * SATIN ALINMIŞ LEADLER
   * ========================================================
   *
   * Satın alma tanımı:
   *
   * LeadAssignment.unlocked === true
   *
   * Böylece eski sistemden kalan unlocked:false
   * hayalet assignment kayıtları satın alma sayılmaz.
   *
   * Ad / telefon araması SADECE burada yapılır.
   */
  if (!loadError) {
    try {
      const purchasedAssignments =
        await prisma.leadAssignment.findMany({
          where: {
            clinicId:
              session.clinicId,

            unlocked: true,

            ...(statusFilter !==
            "all"
              ? {
                  status:
                    statusFilter,
                }
              : {}),

            lead: {
              ...(q
                ? {
                    OR: [
                      {
                        fullName: {
                          contains: q,
                        },
                      },
                      {
                        phone: {
                          contains: q,
                        },
                      },
                    ],
                  }
                : {}),
            },
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 200,

          select: {
            status: true,
            unlockPrice: true,

            lead: {
              select: {
                id: true,
                city: true,
                service: true,
                fullName: true,
                phone: true,
                createdAt: true,
              },
            },
          },
        });

      purchasedRows =
        purchasedAssignments.map(
          (assignment) => ({
            id:
              assignment.lead.id,

            city:
              assignment.lead.city,

            service:
              assignment.lead
                .service,

            fullName:
              assignment.lead
                .fullName,

            phone:
              assignment.lead.phone,

            status:
              safeStatus(
                assignment.status
              ),

            createdAt:
              assignment.lead
                .createdAt,

            unlockPrice:
              Math.max(
                1,
                assignment.unlockPrice ??
                  DEFAULT_UNLOCK_PRICE
              ),
          })
        );
    } catch (error) {
      console.error(
        "PANEL_LEADLER_PURCHASED_ERROR",
        error
      );

      loadError =
        "Leadler şu an yüklenemedi. Panelin diğer alanlarını kullanmaya devam edebilirsin.";
    }
  }

  /*
   * ========================================================
   * MARKETPLACE FIRSATLARI
   * ========================================================
   *
   * Marketplace lead'i olabilmek için:
   *
   * 1. Kliniğin aktif city + service kapsamına uymalı.
   * 2. clinic_direct OLMAMALI.
   * 3. Son 14 gün içinde oluşturulmuş olmalı.
   * 4. fcfs_marketplace_created logu bulunmalı.
   * 5. unlockCount < 3 olmalı.
   * 6. Bu klinik daha önce unlocked:true olarak satın almamış
   *    olmalı.
   *
   * Bu şartlar eski lead selini engeller.
   */
  if (
    !loadError &&
    coverages.length > 0
  ) {
    try {
      const marketplaceLeads =
        await prisma.lead.findMany({
          where: {
            createdAt: {
              gte: cutoff,
            },

            source: {
              not:
                "clinic_direct",
            },

            unlockCount: {
              lt:
                MARKETPLACE_MAX_PURCHASES,
            },

            OR: coverages.map(
              (coverage) => ({
                city:
                  coverage.city,

                service:
                  coverage.service,
              })
            ),

            /*
             * Aşama 2'den önce oluşturulmuş eski
             * lead'lerin marketplace'e girmesini
             * engelleyen asıl güvenlik şartı.
             */
            distributionLogs: {
              some: {
                reason:
                  "fcfs_marketplace_created",
              },
            },

            /*
             * Klinik daha önce gerçekten satın aldıysa
             * fırsatlar listesinde tekrar gösterilmez.
             *
             * unlocked:false eski assignment kayıtları
             * burada satın alma sayılmaz.
             */
            assignments: {
              none: {
                clinicId:
                  session.clinicId,

                unlocked: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 200,

          select: {
            id: true,
            city: true,
            service: true,
            fullName: true,
            phone: true,
            createdAt: true,
            unlockCount: true,
          },
        });

      const marketplaceRows:
        OpportunityRow[] =
        marketplaceLeads.map(
          (lead) => ({
            id: lead.id,

            city:
              lead.city,

            service:
              lead.service,

            fullName:
              lead.fullName,

            phone:
              lead.phone,

            createdAt:
              lead.createdAt,

            kind:
              "marketplace",

            unlockPrice:
              DEFAULT_UNLOCK_PRICE,

            unlockCount:
              Math.max(
                0,
                lead.unlockCount
              ),
          })
        );

      opportunityRows.push(
        ...marketplaceRows
      );
    } catch (error) {
      console.error(
        "PANEL_LEADLER_MARKETPLACE_ERROR",
        error
      );

      loadError =
        "Leadler şu an yüklenemedi. Panelin diğer alanlarını kullanmaya devam edebilirsin.";
    }
  }

  /*
   * ========================================================
   * DOĞRUDAN KLİNİĞE GELEN KİLİTLİ LEADLER
   * ========================================================
   *
   * clinic_direct lead genel marketplace'e çıkmaz.
   *
   * Ancak hasta doğrudan bu kliniğin profilinden
   * talep gönderdiyse mevcut eski/direct akışta
   * kliniğe unlocked:false assignment oluşturulur.
   *
   * Bu özel assignment'ı yalnızca sahibi görür.
   */
  if (!loadError) {
    try {
      const directAssignments =
        await prisma.leadAssignment.findMany({
          where: {
            clinicId:
              session.clinicId,

            unlocked: false,

            lead: {
              source:
                "clinic_direct",
            },
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 100,

          select: {
            unlockPrice: true,

            lead: {
              select: {
                id: true,
                city: true,
                service: true,
                fullName: true,
                phone: true,
                createdAt: true,
              },
            },
          },
        });

      const directRows:
        OpportunityRow[] =
        directAssignments.map(
          (assignment) => ({
            id:
              assignment.lead.id,

            city:
              assignment.lead.city,

            service:
              assignment.lead
                .service,

            fullName:
              assignment.lead
                .fullName,

            phone:
              assignment.lead.phone,

            createdAt:
              assignment.lead
                .createdAt,

            kind:
              "direct",

            unlockPrice:
              Math.max(
                1,
                assignment.unlockPrice ??
                  DEFAULT_UNLOCK_PRICE
              ),

            unlockCount: 0,
          })
        );

      opportunityRows.push(
        ...directRows
      );
    } catch (error) {
      console.error(
        "PANEL_LEADLER_DIRECT_ERROR",
        error
      );

      loadError =
        "Leadler şu an yüklenemedi. Panelin diğer alanlarını kullanmaya devam edebilirsin.";
    }
  }

  /*
   * Marketplace ve direct fırsatlar tek fırsat bölümünde
   * tarih sırasına göre gösterilir.
   */
  opportunityRows.sort(
    (a, b) =>
      b.createdAt.getTime() -
      a.createdAt.getTime()
  );

  /*
   * Aynı lead yanlışlıkla iki kaynaktan gelirse
   * UI'da çift göstermemek için son güvenlik.
   */
  opportunityRows =
    Array.from(
      new Map(
        opportunityRows.map(
          (row) => [
            row.id,
            row,
          ]
        )
      ).values()
    );

  const opportunityCount =
    opportunityRows.length;

  const purchasedCount =
    purchasedRows.length;

  const buildHref = (next: {
    status?: string;
    q?: string;
  }): string => {
    const params =
      new URLSearchParams();

    const nextStatus =
      next.status ??
      (statusFilter === "all"
        ? ""
        : statusFilter);

    const nextQuery =
      next.q ?? q;

    if (nextStatus) {
      params.set(
        "status",
        nextStatus
      );
    }

    if (nextQuery) {
      params.set(
        "q",
        nextQuery
      );
    }

    const value =
      params.toString();

    return value
      ? `/panel/leadler?${value}`
      : "/panel/leadler";
  };

  return (
    <div className="panelWrap">
      <div className="panelHeader">
        <div className="panelHeaderLeft">
          <div className="panelKicker">
            📥 Leadler
          </div>

          <h1 className="panelTitle">
            Lead Yönetimi
          </h1>

          <div className="panelSub">
            Klinik:{" "}
            <strong>
              {session.name}
            </strong>{" "}
            • Fırsat:{" "}
            <strong>
              {opportunityCount}
            </strong>{" "}
            • Satın Alınmış:{" "}
            <strong>
              {purchasedCount}
            </strong>
          </div>
        </div>

        <div className="panelHeaderRight">
          <Link
            className="panelQuickBtn panelQuickBtnSoft"
            href="/panel"
          >
            Dashboard →
          </Link>

          <Link
            className="panelQuickBtn"
            href="/panel/abonelik"
          >
            💎 Kredi:{" "}
            {creditBalance}
          </Link>
        </div>
      </div>

      {loadError ? (
        <div className="panelCard">
          <div className="panelCardTitle">
            ⚠️ Leadler yüklenemedi
          </div>

          <div
            className="panelCardSub"
            style={{
              marginTop: 8,
            }}
          >
            {loadError}
          </div>
        </div>
      ) : null}

      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">
              💎 Kredi Durumu
            </div>

            <div className="panelCardSub">
              Lead iletişim
              bilgilerini açmak
              için kredi kullanılır.
              1 kredi = 1 lead açma
              hakkı.
            </div>
          </div>

          <div className="panelCardHeadRight">
            <span className="panelPill">
              Kredi:{" "}
              {creditBalance}
            </span>

            <Link
              href="/panel/abonelik"
              className="panelMiniCta"
            >
              Kredi Al →
            </Link>
          </div>
        </div>

        {creditBalance <= 0 ? (
          <div
            style={{
              marginTop: 10,
            }}
            className="panelStatHint"
          >
            Kredin yok. Kilitli
            leadleri açmak için
            kredi satın almalısın.
          </div>
        ) : null}
      </div>

      {/* ==================================================
          FIRSATLAR
      ================================================== */}

      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">
              🔥 Fırsatlar
            </div>

            <div className="panelCardSub">
              Hizmet verdiğin şehir
              ve işlemlerdeki yeni
              talepler. Marketplace
              leadlerini ilk 3 klinik
              satın alabilir.
            </div>
          </div>

          <div className="panelCardHeadRight">
            <span className="panelPill">
              Açık fırsat:{" "}
              {opportunityCount}
            </span>
          </div>
        </div>

        {opportunityRows.length ===
        0 ? (
          <div
            className="panelEmpty"
            style={{
              marginTop: 14,
            }}
          >
            Şu anda hizmet
            bölgelerinde açık yeni
            lead bulunmuyor.
          </div>
        ) : (
          <div
            className="panelLeadList"
            style={{
              marginTop: 14,
            }}
          >
            {opportunityRows.map(
              (row) => {
                const shownName =
                  maskName(
                    row.fullName
                  );

                const shownPhone =
                  maskPhone(
                    row.phone
                  );

                const remaining =
                  row.kind ===
                  "marketplace"
                    ? Math.max(
                        0,
                        MARKETPLACE_MAX_PURCHASES -
                          row.unlockCount
                      )
                    : null;

                return (
                  <div
                    key={`${row.kind}-${row.id}`}
                    className="panelLeadRow"
                  >
                    <div className="panelLeadMain">
                      <div className="panelLeadTop">
                        <div className="panelLeadName">
                          {shownName}{" "}
                          <span className="panelLeadSep">
                            •
                          </span>{" "}
                          {shownPhone}
                        </div>

                        <div className="panelLeadRight">
                          {isRecent(
                            row.createdAt,
                            now
                          ) ? (
                            <span className="panelNewBadge">
                              Yeni
                            </span>
                          ) : null}

                          {row.kind ===
                          "direct" ? (
                            <span className="panelLeadStatus panelLeadStatusContacted">
                              Size Özel
                            </span>
                          ) : (
                            <span className="panelLeadStatus panelLeadStatusNew">
                              Fırsat
                            </span>
                          )}

                          <span className="panelLeadTime">
                            {formatTR(
                              row.createdAt
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="panelLeadMeta">
                        <span className="panelChip">
                          📍 {row.city}
                        </span>

                        <span className="panelChip panelChipSoft">
                          🦷{" "}
                          {row.service}
                        </span>

                        <span className="panelChip panelChipMuted">
                          🔒 Açma bedeli:{" "}
                          {
                            row.unlockPrice
                          }{" "}
                          kredi
                        </span>

                        {row.kind ===
                        "marketplace" ? (
                          <span className="panelChip panelChipMuted">
                            👥{" "}
                            {row.unlockCount}
                            /
                            {
                              MARKETPLACE_MAX_PURCHASES
                            }{" "}
                            alındı •{" "}
                            {remaining} yer
                            kaldı
                          </span>
                        ) : (
                          <span className="panelChip panelChipMuted">
                            🎯 Bu talep
                            doğrudan
                            kliniğinize
                            gönderildi
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="panelLeadActions">
                      <Link
                        href={`/panel/leadler/${row.id}`}
                        className="panelBtn"
                      >
                        Kilidi Aç →
                      </Link>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ==================================================
          SATIN ALDIKLARIN - FİLTRE / ARAMA
      ================================================== */}

      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">
              🔎 Satın Aldıklarında Ara
            </div>

            <div className="panelCardSub">
              Ad ve telefon araması
              yalnızca satın aldığın
              leadlerde çalışır.
              Kilitli fırsatların ham
              iletişim bilgileri aramada
              kullanılmaz.
            </div>
          </div>
        </div>

        <div className="panelFilterShell">
          <div className="panelFilterPills">
            <Link
              href={buildHref({
                status: "",
              })}
              className={
                statusFilter ===
                "all"
                  ? "panelFilterPill panelFilterPillActive"
                  : "panelFilterPill"
              }
            >
              Tümü
            </Link>

            {(
              [
                "new",
                "contacted",
                "won",
                "lost",
              ] as LeadStatus[]
            ).map((status) => (
              <Link
                key={status}
                href={buildHref({
                  status,
                })}
                className={
                  statusFilter ===
                  status
                    ? "panelFilterPill panelFilterPillActive"
                    : "panelFilterPill"
                }
              >
                {
                  STATUS_LABEL[
                    status
                  ]
                }
              </Link>
            ))}
          </div>

          <form
            action="/panel/leadler"
            method="GET"
            className="panelSearchRow"
          >
            {statusFilter !==
            "all" ? (
              <input
                type="hidden"
                name="status"
                value={
                  statusFilter
                }
              />
            ) : null}

            <input
              name="q"
              defaultValue={q}
              placeholder="Satın aldığın leadlerde ad veya telefon ara…"
              className="panelInput"
              autoComplete="off"
            />

            <button
              type="submit"
              className="panelBtnSoft"
            >
              Ara
            </button>

            <Link
              href="/panel/leadler"
              className="panelBtnGhost"
            >
              Sıfırla
            </Link>
          </form>
        </div>
      </div>

      {/* ==================================================
          SATIN ALINMIŞ LEADLER
      ================================================== */}

      {purchasedRows.length ===
      0 ? (
        <div className="panelEmpty">
          {q ||
          statusFilter !== "all"
            ? "Bu arama veya filtrede satın alınmış lead bulunamadı."
            : "Henüz satın aldığın lead yok."}
        </div>
      ) : (
        <div className="panelCard">
          <div className="panelCardHead">
            <div>
              <div className="panelCardTitle">
                📋 Satın Aldıkların
              </div>

              <div className="panelCardSub">
                Satın aldığın
                leadlerin iletişim
                bilgileri açık kalır.
                Lead tamamen satılsa 
                bile buradan kaybolmaz.
              </div>
            </div>

            <div className="panelCardHeadRight">
              <span className="panelPill">
                Sonuç:{" "}
                {
                  purchasedRows.length
                }
              </span>
            </div>
          </div>

          <div
            className="panelLeadList"
            style={{
              marginTop: 14,
            }}
          >
            {purchasedRows.map(
              (row) => (
                <div
                  key={row.id}
                  className="panelLeadRow"
                >
                  <div className="panelLeadMain">
                    <div className="panelLeadTop">
                      <div className="panelLeadName">
                        {
                          row.fullName
                        }{" "}
                        <span className="panelLeadSep">
                          •
                        </span>{" "}
                        {row.phone}
                      </div>

                      <div className="panelLeadRight">
                        {isRecent(
                          row.createdAt,
                          now
                        ) &&
                        row.status ===
                          "new" ? (
                          <span className="panelNewBadge">
                            Yeni
                          </span>
                        ) : null}

                        <span
                          className={statusBadgeClass(
                            row.status
                          )}
                        >
                          {
                            STATUS_LABEL[
                              row.status
                            ]
                          }
                        </span>

                        <span className="panelLeadTime">
                          {formatTR(
                            row.createdAt
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="panelLeadMeta">
                      <span className="panelChip">
                        📍 {row.city}
                      </span>

                      <span className="panelChip panelChipSoft">
                        🦷{" "}
                        {row.service}
                      </span>

                      <span className="panelChip panelChipMuted">
                        ✅ İletişim
                        bilgileri açık
                      </span>
                    </div>
                  </div>

                  <div className="panelLeadActions">
                    <Link
                      href={`/panel/leadler/${row.id}`}
                      className="panelBtn"
                    >
                      Detay →
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}