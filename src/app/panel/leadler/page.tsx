import Link from "next/link";

import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";

import styles from "./leadler.module.css";

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
  value: string | undefined,
): string {
  return (value ?? "")
    .trim()
    .slice(0, 80);
}

function normalizeStatus(
  value: string | undefined,
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
  value: string,
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

function statusClass(
  status: LeadStatus,
): string {
  if (status === "new") {
    return styles.statusNew;
  }

  if (status === "contacted") {
    return styles.statusContacted;
  }

  if (status === "won") {
    return styles.statusWon;
  }

  return styles.statusLost;
}

function marketplaceCutoff(
  now: Date,
): Date {
  return new Date(
    now.getTime() -
      MARKETPLACE_MAX_AGE_DAYS *
        24 *
        60 *
        60 *
        1000,
  );
}

function uniqueCoverages(
  values: CoveragePair[],
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

function getInitials(
  name: string,
): string {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 0) {
    return "DF";
  }

  if (parts.length === 1) {
    return (
      parts[0]
        ?.slice(0, 2)
        .toLocaleUpperCase("tr-TR") ??
      "DF"
    );
  }

  return `${parts[0]?.[0] ?? ""}${
    parts[parts.length - 1]?.[0] ?? ""
  }`.toLocaleUpperCase(
    "tr-TR",
  );
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
    normalizeStatus(
      sp.status,
    );

  let creditBalance = 0;

  let opportunityRows:
    OpportunityRow[] = [];

  let purchasedRows:
    PurchasedRow[] = [];

  let loadError:
    string | null = null;

  let coverages:
    CoveragePair[] = [];

  /*
   * ========================================================
   * KLİNİK / KREDİ / KAPSAMLAR
   * ========================================================
   */
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
          [],
      );
  } catch (error) {
    console.error(
      "PANEL_LEADLER_CLINIC_ERROR",
      error,
    );

    loadError =
      "Leadler şu an yüklenemedi. Panelin diğer alanlarını kullanmaya devam edebilirsin.";
  }

  /*
   * ========================================================
   * SATIN ALINMIŞ LEADLER
   * ========================================================
   *
   * Arama SADECE unlocked:true satın almalarda çalışır.
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
                          contains:
                            q,
                        },
                      },
                      {
                        phone: {
                          contains:
                            q,
                        },
                      },
                    ],
                  }
                : {}),
            },
          },

          orderBy: {
            createdAt:
              "desc",
          },

          take: 200,

          select: {
            status: true,
            unlockPrice:
              true,

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
          (
            assignment,
          ) => ({
            id:
              assignment.lead
                .id,

            city:
              assignment.lead
                .city,

            service:
              assignment.lead
                .service,

            fullName:
              assignment.lead
                .fullName,

            phone:
              assignment.lead
                .phone,

            status:
              safeStatus(
                assignment.status,
              ),

            createdAt:
              assignment.lead
                .createdAt,

            unlockPrice:
              Math.max(
                1,
                assignment.unlockPrice ??
                  DEFAULT_UNLOCK_PRICE,
              ),
          }),
        );
    } catch (error) {
      console.error(
        "PANEL_LEADLER_PURCHASED_ERROR",
        error,
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
   * Güvenlik şartları korunuyor:
   *
   * - aktif kapsam
   * - clinic_direct değil
   * - son 14 gün
   * - fcfs_marketplace_created
   * - unlockCount < 3
   * - klinik daha önce satın almamış
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

            OR:
              coverages.map(
                (
                  coverage,
                ) => ({
                  city:
                    coverage.city,

                  service:
                    coverage.service,
                }),
              ),

            distributionLogs: {
              some: {
                reason:
                  "fcfs_marketplace_created",
              },
            },

            assignments: {
              none: {
                clinicId:
                  session.clinicId,

                unlocked:
                  true,
              },
            },
          },

          orderBy: {
            createdAt:
              "desc",
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
            id:
              lead.id,

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
                lead.unlockCount,
              ),
          }),
        );

      opportunityRows.push(
        ...marketplaceRows,
      );
    } catch (error) {
      console.error(
        "PANEL_LEADLER_MARKETPLACE_ERROR",
        error,
      );

      loadError =
        "Leadler şu an yüklenemedi. Panelin diğer alanlarını kullanmaya devam edebilirsin.";
    }
  }

  /*
   * ========================================================
   * DIRECT LEADLER
   * ========================================================
   *
   * unlocked:false + clinic_direct yalnız assignment sahibi
   * klinikte fırsat olarak görünür.
   */
  if (!loadError) {
    try {
      const directAssignments =
        await prisma.leadAssignment.findMany({
          where: {
            clinicId:
              session.clinicId,

            unlocked:
              false,

            lead: {
              source:
                "clinic_direct",
            },
          },

          orderBy: {
            createdAt:
              "desc",
          },

          take: 100,

          select: {
            unlockPrice:
              true,

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
          (
            assignment,
          ) => ({
            id:
              assignment.lead
                .id,

            city:
              assignment.lead
                .city,

            service:
              assignment.lead
                .service,

            fullName:
              assignment.lead
                .fullName,

            phone:
              assignment.lead
                .phone,

            createdAt:
              assignment.lead
                .createdAt,

            kind:
              "direct",

            unlockPrice:
              Math.max(
                1,
                assignment.unlockPrice ??
                  DEFAULT_UNLOCK_PRICE,
              ),

            unlockCount:
              0,
          }),
        );

      opportunityRows.push(
        ...directRows,
      );
    } catch (error) {
      console.error(
        "PANEL_LEADLER_DIRECT_ERROR",
        error,
      );

      loadError =
        "Leadler şu an yüklenemedi. Panelin diğer alanlarını kullanmaya devam edebilirsin.";
    }
  }

  opportunityRows.sort(
    (a, b) =>
      b.createdAt.getTime() -
      a.createdAt.getTime(),
  );

  opportunityRows =
    Array.from(
      new Map(
        opportunityRows.map(
          (row) => [
            row.id,
            row,
          ],
        ),
      ).values(),
    );

  const opportunityCount =
    opportunityRows.length;

  const purchasedCount =
    purchasedRows.length;

  const buildHref = (
    next: {
      status?: string;
      q?: string;
    },
  ): string => {
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
        nextStatus,
      );
    }

    if (nextQuery) {
      params.set(
        "q",
        nextQuery,
      );
    }

    const value =
      params.toString();

    return value
      ? `/panel/leadler?${value}`
      : "/panel/leadler";
  };

  return (
    <div className={styles.page}>
      {/* ========================= HERO ========================= */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />

        <div className={styles.heroContent}>
          <div className={styles.kicker}>
            <span>📥</span>
            Lead Yönetimi
          </div>

          <h1 className={styles.title}>
            Leadler
          </h1>

          <div className={styles.heroMeta}>
            <span>
              Klinik:{" "}
              <strong>
                {session.name}
              </strong>
            </span>

            <span className={styles.metaDot}>
              •
            </span>

            <span>
              Fırsat:{" "}
              <strong>
                {opportunityCount}
              </strong>
            </span>

            <span className={styles.metaDot}>
              •
            </span>

            <span>
              Satın Alınmış:{" "}
              <strong>
                {purchasedCount}
              </strong>
            </span>
          </div>
        </div>

        <div
          className={styles.heroTooth}
          aria-hidden
        >
          🦷
        </div>

        <div className={styles.heroActions}>
          <Link
            href="/panel"
            className={styles.dashboardBtn}
          >
            Dashboard →
          </Link>

          <Link
            href="/panel/abonelik"
            className={styles.creditHero}
          >
            <span>💎</span>

            <span>
              <strong>
                Kredi: {creditBalance}
              </strong>
              <small>
                Kredi bakiyeniz
              </small>
            </span>
          </Link>
        </div>
      </section>

      {loadError ? (
        <section className={styles.errorCard}>
          <div className={styles.errorIcon}>
            ⚠️
          </div>

          <div>
            <strong>
              Leadler yüklenemedi
            </strong>

            <p>
              {loadError}
            </p>
          </div>
        </section>
      ) : null}

      {/* ======================= CREDIT ======================== */}
      <section className={styles.creditCard}>
        <div className={styles.creditLeft}>
          <div className={styles.creditIcon}>
            💎
          </div>

          <div>
            <h2>
              Kredi Durumu
            </h2>

            <p>
              Lead iletişim bilgilerini açmak için kredi
              kullanılır.
            </p>

            <strong className={styles.creditRule}>
              1 kredi = 1 lead açma hakkı.
            </strong>

            {creditBalance <= 0 ? (
              <p className={styles.noCredit}>
                Kredin yok. Yeni fırsatları kaçırmamak için
                hesabına kredi ekleyebilirsin.
              </p>
            ) : (
              <p className={styles.creditReady}>
                Kredin hazır. Uygun bir fırsatı gördüğünde
                iletişim bilgilerini açabilirsin.
              </p>
            )}
          </div>
        </div>

        <div className={styles.creditActions}>
          <div className={styles.balanceBox}>
            <span>
              Mevcut kredi
            </span>

            <strong>
              {creditBalance}
            </strong>
          </div>

          <Link
            href="/panel/abonelik"
            className={styles.buyCreditBtn}
          >
            💎 Kredi Al →
          </Link>
        </div>
      </section>

      {/* ===================== OPPORTUNITIES =================== */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitleArea}>
            <div className={`${styles.sectionIcon} ${styles.fireIcon}`}>
              🔥
            </div>

            <div>
              <h2>
                Fırsatlar
              </h2>

              <p>
                Hizmet verdiğin şehir ve işlemlerdeki yeni
                hasta talepleri.
              </p>
            </div>
          </div>

          <div className={styles.countBadge}>
            Açık fırsat:{" "}
            <strong>
              {opportunityCount}
            </strong>
          </div>
        </div>

        {opportunityRows.length === 0 ? (
          <div className={styles.emptyOpportunity}>
            <div className={styles.emptyVisual}>
              <span>⌕</span>
            </div>

            <h3>
              Şu anda hizmet bölgelerinde açık yeni lead
              bulunmuyor.
            </h3>

            <p>
              Yeni talepler geldiğinde bu alanda
              listelenecek.
            </p>

            {creditBalance <= 0 ? (
              <Link
                href="/panel/abonelik"
                className={styles.emptyCreditLink}
              >
                Bu arada kredini hazırla →
              </Link>
            ) : null}
          </div>
        ) : (
          <div className={styles.opportunityGrid}>
            {opportunityRows.map(
              (row) => (
                <article
                  key={`${row.kind}-${row.id}`}
                  className={styles.opportunityCard}
                >
                  <div className={styles.opportunityIcon}>
                    🦷
                  </div>

                  <div className={styles.opportunityMain}>
                    <div className={styles.opportunityBadges}>
                      <span className={styles.opportunityBadge}>
                        {row.kind === "direct"
                          ? "Size Özel"
                          : "Yeni Fırsat"}
                      </span>

                      <span className={styles.priceBadge}>
                        💎 {row.unlockPrice} Kredi
                      </span>
                    </div>

                    <h3>
                      {row.service}
                    </h3>

                    <div className={styles.location}>
                      📍 {row.city}
                    </div>

                    <div className={styles.lockedInfo}>
                      <span className={styles.lockIcon}>
                        🔒
                      </span>

                      <div>
                        <strong>
                          Hasta iletişim bilgileri gizli
                        </strong>

                        <p>
                          Lead açıldıktan sonra hasta adı,
                          telefonu ve diğer detaylar
                          görüntülenir.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.opportunityAction}>
                    <Link
                      href={`/panel/leadler/${row.id}`}
                      className={styles.unlockLink}
                    >
                      {row.unlockPrice} Kredi ile Lead&apos;i
                      Aç →
                    </Link>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      {/* ======================== SEARCH ======================= */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitleArea}>
            <div className={styles.sectionIcon}>
              🔎
            </div>

            <div>
              <h2>
                Satın Aldıklarında Ara
              </h2>

              <p>
                Ad ve telefon araması yalnızca satın aldığın
                leadlerde çalışır.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.filterArea}>
          <div className={styles.filterPills}>
            <Link
              href={buildHref({
                status: "",
              })}
              className={
                statusFilter === "all"
                  ? `${styles.filterPill} ${styles.filterPillActive}`
                  : styles.filterPill
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
            ).map(
              (status) => (
                <Link
                  key={status}
                  href={buildHref({
                    status,
                  })}
                  className={
                    statusFilter === status
                      ? `${styles.filterPill} ${styles.filterPillActive}`
                      : styles.filterPill
                  }
                >
                  {
                    STATUS_LABEL[
                      status
                    ]
                  }
                </Link>
              ),
            )}
          </div>

          <form
            action="/panel/leadler"
            method="GET"
            className={styles.searchForm}
          >
            {statusFilter !== "all" ? (
              <input
                type="hidden"
                name="status"
                value={statusFilter}
              />
            ) : null}

            <div className={styles.searchInputWrap}>
              <span aria-hidden>
                🔍
              </span>

              <input
                name="q"
                defaultValue={q}
                placeholder="Satın aldığın leadlerde ad veya telefon ara..."
                className={styles.searchInput}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className={styles.searchBtn}
            >
              Ara
            </button>

            <Link
              href="/panel/leadler"
              className={styles.resetBtn}
            >
              Sıfırla
            </Link>
          </form>
        </div>

        {/* ===================== PURCHASED ===================== */}
        {purchasedRows.length === 0 ? (
          <div className={styles.emptyPurchased}>
            <div className={styles.emptyPurchasedIcon}>
              ▣
            </div>

            <h3>
              {q ||
              statusFilter !== "all"
                ? "Bu arama veya filtrede lead bulunamadı."
                : "Henüz satın aldığın lead yok."}
            </h3>

            <p>
              Açtığın leadler burada listelenecek ve iletişim
              bilgileri açık kalacak.
            </p>
          </div>
        ) : (
          <div className={styles.purchasedArea}>
            <div className={styles.purchasedHeader}>
              <div>
                <h3>
                  Satın Aldığın Leadler
                </h3>

                <p>
                  Hasta iletişim bilgileri ve CRM durumu
                </p>
              </div>

              <span>
                {purchasedRows.length} sonuç
              </span>
            </div>

            <div className={styles.purchasedList}>
              {purchasedRows.map(
                (row) => (
                  <article
                    key={row.id}
                    className={styles.purchasedRow}
                  >
                    <div className={styles.patientAvatar}>
                      {getInitials(
                        row.fullName,
                      )}
                    </div>

                    <div className={styles.patientInfo}>
                      <strong>
                        {
                          row.fullName
                        }
                      </strong>

                      <a
                        href={`tel:${row.phone}`}
                      >
                        📞 {row.phone}
                      </a>
                    </div>

                    <div className={styles.patientLocation}>
                      <strong>
                        📍 {row.city}
                      </strong>

                      <span>
                        🦷 {row.service}
                      </span>
                    </div>

                    <div className={styles.patientStatus}>
                      <span
                        className={`${styles.statusBadge} ${statusClass(
                          row.status,
                        )}`}
                      >
                        {
                          STATUS_LABEL[
                            row.status
                          ]
                        }
                      </span>
                    </div>

                    <Link
                      href={`/panel/leadler/${row.id}`}
                      className={styles.detailBtn}
                    >
                      Detay Gör →
                    </Link>
                  </article>
                ),
              )}
            </div>
          </div>
        )}
      </section>

      {/* ===================== CREDIT CTA ====================== */}
      <section className={styles.bottomCta}>
        <div className={styles.bottomCtaVisual}>
          💎
        </div>

        <div className={styles.bottomCtaText}>
          <span>
            Lead fırsatlarına hazır ol
          </span>

          <h2>
            Kredin bittiğinde fırsatı kaçırma.
          </h2>

          <p>
            Hesabında kredi bulundurarak uygun lead geldiğinde
            iletişim bilgilerini hemen açabilirsin.
          </p>
        </div>

        <Link
          href="/panel/abonelik"
          className={styles.bottomCtaBtn}
        >
          Kredi Paketlerini İncele →
        </Link>
      </section>
    </div>
  );
}