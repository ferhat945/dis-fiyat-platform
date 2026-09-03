"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "./page.module.css";

type Coverage = {
  id: string;
  city: string;
  service: string;
  isActive: boolean;
};

type GetResp =
  | {
      ok: true;
      coverages: Coverage[];
    }
  | {
      ok: false;
      code: string;
    };

type PostResp =
  | {
      ok: true;
    }
  | {
      ok: false;
      code: string;
      issues?: Array<{
        path: string;
        message: string;
      }>;
    };

type PatchResp =
  | {
      ok: true;
    }
  | {
      ok: false;
      code: string;
    };

function norm(
  value: string,
): string {
  return value
    .toLowerCase()
    .trim();
}

function labelize(
  value: string,
): string {
  const clean =
    value.trim();

  if (!clean) {
    return clean;
  }

  return clean
    .split("-")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

export default function PanelServicesPage(): JSX.Element {
  const [
    coverages,
    setCoverages,
  ] = useState<Coverage[]>([]);

  const [
    loading,
    setLoading,
  ] = useState<boolean>(true);

  const [
    city,
    setCity,
  ] = useState<string>(
    "istanbul",
  );

  const [
    service,
    setService,
  ] = useState<string>(
    "implant",
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    saving,
    setSaving,
  ] = useState<boolean>(false);

  const sorted =
    useMemo(() => {
      return [
        ...coverages,
      ].sort(
        (
          a,
          b,
        ) => {
          const x =
            `${a.city}|${a.service}`;

          const y =
            `${b.city}|${b.service}`;

          return x.localeCompare(
            y,
            "tr",
          );
        },
      );
    }, [
      coverages,
    ]);

  const activeCount =
    useMemo(
      () =>
        coverages.filter(
          (coverage) =>
            coverage.isActive,
        ).length,
      [
        coverages,
      ],
    );

  const passiveCount =
    Math.max(
      0,
      coverages.length -
        activeCount,
    );

  const canAdd =
    norm(city).length >= 2 &&
    norm(service).length >=
      2 &&
    !saving;

  const load =
    async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await fetch(
            "/api/panel/coverages",
            {
              cache:
                "no-store",
            },
          );

        const data =
          (await response.json()) as GetResp;

        if (
          !response.ok ||
          !data.ok
        ) {
          setError(
            data.ok
              ? "UNKNOWN"
              : data.code,
          );

          setCoverages(
            [],
          );

          return;
        }

        setCoverages(
          data.coverages,
        );
      } catch {
        setError(
          "NETWORK_ERROR",
        );

        setCoverages(
          [],
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void load();
  }, []);

  const addCoverage =
    async (): Promise<void> => {
      if (!canAdd) {
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const payload = {
          city:
            norm(city),

          service:
            norm(
              service,
            ),
        };

        const response =
          await fetch(
            "/api/panel/coverages",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload,
                ),
            },
          );

        const data =
          (await response.json()) as PostResp;

        if (
          !response.ok ||
          !data.ok
        ) {
          const issues =
            "issues" in
              data &&
            data.issues
              ?.length
              ? ` | ${data.issues
                  .map(
                    (
                      issue,
                    ) =>
                      `${issue.path}: ${issue.message}`,
                  )
                  .join(", ")}`
              : "";

          setError(
            `${
              data.ok
                ? "UNKNOWN"
                : data.code
            }${issues}`,
          );

          return;
        }

        /*
         * API coverage nesnesi döndürmediği için
         * başarılı ekleme sonrası listeyi tekrar
         * sunucudan yüklüyoruz.
         */
        await load();
      } catch {
        setError(
          "NETWORK_ERROR",
        );
      } finally {
        setSaving(false);
      }
    };

  const toggle =
    async (
      coverage: Coverage,
    ): Promise<void> => {
      setError(null);

      const nextValue =
        !coverage.isActive;

      /*
       * Optimistic UI:
       * API cevabını beklemeden ekranda değiştir.
       */
      setCoverages(
        (
          previous,
        ) =>
          previous.map(
            (
              item,
            ) =>
              item.id ===
              coverage.id
                ? {
                    ...item,
                    isActive:
                      nextValue,
                  }
                : item,
          ),
      );

      try {
        const response =
          await fetch(
            "/api/panel/coverages",
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    id:
                      coverage.id,

                    isActive:
                      nextValue,
                  },
                ),
            },
          );

        const data =
          (await response.json()) as PatchResp;

        if (
          !response.ok ||
          !data.ok
        ) {
          /*
           * API başarısızsa optimistic değişikliği geri al.
           */
          setCoverages(
            (
              previous,
            ) =>
              previous.map(
                (
                  item,
                ) =>
                  item.id ===
                  coverage.id
                    ? {
                        ...item,
                        isActive:
                          coverage.isActive,
                      }
                    : item,
              ),
          );

          setError(
            data.ok
              ? "UNKNOWN"
              : data.code,
          );

          return;
        }
      } catch {
        /*
         * Ağ hatasında da eski duruma dön.
         */
        setCoverages(
          (
            previous,
          ) =>
            previous.map(
              (
                item,
              ) =>
                item.id ===
                coverage.id
                  ? {
                      ...item,
                      isActive:
                        coverage.isActive,
                    }
                  : item,
            ),
        );

        setError(
          "NETWORK_ERROR",
        );
      }
    };

  return (
    <div
      className={
        styles.wrap
      }
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className={
          styles.hero
        }
      >
        <div
          className={
            styles.heroGlow
          }
          aria-hidden
        />

        <div
          className={
            styles.heroContent
          }
        >
          <div
            className={
              styles.pill
            }
          >
            <span>
              ▦
            </span>

            Kapsam Yönetimi
          </div>

          <h1
            className={
              styles.h1
            }
          >
            Hizmetlerim
          </h1>

          <p
            className={
              styles.sub
            }
          >
            Şehir ve hizmet
            eşleşmelerini
            yönetin. Aktif
            kapsamlarınız,
            uygun hasta
            taleplerinin
            eşleştirilmesinde
            kullanılır.
          </p>
        </div>

        <div
          className={
            styles.heroVisual
          }
          aria-hidden
        >
          <div
            className={
              styles.toothOrb
            }
          >
            <span
              className={
                styles.tooth
              }
            >
              🦷
            </span>

            <span
              className={
                styles.shield
              }
            >
              ✓
            </span>
          </div>
        </div>

        <div
          className={
            styles.statsRow
          }
        >
          <div
            className={
              styles.statCard
            }
          >
            <div
              className={
                styles.statIcon
              }
            >
              ▱
            </div>

            <div>
              <div
                className={
                  styles.statLabel
                }
              >
                Toplam Kapsam
              </div>

              <div
                className={
                  styles.statValue
                }
              >
                {
                  coverages.length
                }
              </div>

              <div
                className={
                  styles.statHelp
                }
              >
                Kayıtlı eşleşme
              </div>
            </div>
          </div>

          <div
            className={
              styles.statCard
            }
          >
            <div
              className={`${styles.statIcon} ${styles.statIconActive}`}
            >
              ✓
            </div>

            <div>
              <div
                className={
                  styles.statLabel
                }
              >
                Aktif Kapsam
              </div>

              <div
                className={
                  styles.statValue
                }
              >
                {
                  activeCount
                }
              </div>

              <div
                className={
                  styles.statHelp
                }
              >
                Lead eşleşmesinde
                aktif
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error ? (
        <div
          className={
            styles.msgErr
          }
        >
          <div
            className={
              styles.msgErrIcon
            }
          >
            !
          </div>

          <div>
            <strong>
              İşlem tamamlanamadı
            </strong>

            <span>
              Hata: {error}
            </span>
          </div>
        </div>
      ) : null}

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div
        className={
          styles.grid
        }
      >
        {/* ===================================================
            ADD COVERAGE
        =================================================== */}

        <section
          className={`${styles.card} ${styles.addCard}`}
        >
          <div
            className={
              styles.cardInner
            }
          >
            <div
              className={
                styles.cardHead
              }
            >
              <div
                className={
                  styles.cardHeading
                }
              >
                <div
                  className={
                    styles.cardIcon
                  }
                >
                  +
                </div>

                <div>
                  <h2
                    className={
                      styles.cardTitle
                    }
                  >
                    Yeni Kapsam
                    Ekle
                  </h2>

                  <p
                    className={
                      styles.cardSub
                    }
                  >
                    Yeni şehir +
                    hizmet
                    eşleşmesi
                    oluşturun.
                  </p>
                </div>
              </div>

              <button
                className={
                  styles.btnGhost
                }
                type="button"
                onClick={() =>
                  void load()
                }
                disabled={
                  saving ||
                  loading
                }
              >
                <span>
                  ↻
                </span>

                Yenile
              </button>
            </div>

            <div
              className={
                styles.formArea
              }
            >
              <div
                className={
                  styles.field
                }
              >
                <label
                  className={
                    styles.label
                  }
                  htmlFor="coverage-city"
                >
                  Şehir
                </label>

                <div
                  className={
                    styles.inputFrame
                  }
                >
                  <div
                    className={
                      styles.icon
                    }
                    aria-hidden
                  >
                    📍
                  </div>

                  <input
                    id="coverage-city"
                    className={
                      styles.input
                    }
                    value={
                      city
                    }
                    onChange={(
                      event,
                    ) =>
                      setCity(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Örn: istanbul"
                    autoComplete="off"
                  />
                </div>

                <div
                  className={
                    styles.fieldHelp
                  }
                >
                  Hizmet verdiğiniz
                  şehrin adını
                  yazın.
                </div>
              </div>

              <div
                className={
                  styles.field
                }
              >
                <label
                  className={
                    styles.label
                  }
                  htmlFor="coverage-service"
                >
                  Hizmet
                </label>

                <div
                  className={
                    styles.inputFrame
                  }
                >
                  <div
                    className={
                      styles.icon
                    }
                    aria-hidden
                  >
                    🦷
                  </div>

                  <input
                    id="coverage-service"
                    className={
                      styles.input
                    }
                    value={
                      service
                    }
                    onChange={(
                      event,
                    ) =>
                      setService(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Örn: implant"
                    autoComplete="off"
                  />
                </div>

                <div
                  className={
                    styles.fieldHelp
                  }
                >
                  Eklemek
                  istediğiniz
                  tedavi/hizmet
                  adını yazın.
                </div>
              </div>

              <button
                className={
                  styles.btnPrimary
                }
                type="button"
                onClick={() =>
                  void addCoverage()
                }
                disabled={
                  !canAdd
                }
              >
                <span
                  className={
                    styles.btnPlus
                  }
                >
                  +
                </span>

                {saving
                  ? "Ekleniyor..."
                  : "Kapsam Ekle"}
              </button>
            </div>

            <div
              className={
                styles.tipBox
              }
            >
              <div
                className={
                  styles.tipIcon
                }
              >
                💡
              </div>

              <div>
                <strong>
                  İpucu
                </strong>

                <p>
                  Aynı şehir ve
                  hizmet daha önce
                  eklenmişse sistem
                  mevcut kaydı
                  günceller.
                  Ekledikten sonra
                  liste otomatik
                  yenilenir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            EXISTING COVERAGES
        =================================================== */}

        <section
          className={`${styles.card} ${styles.listCard}`}
        >
          <div
            className={
              styles.cardInner
            }
          >
            <div
              className={
                styles.cardHead
              }
            >
              <div
                className={
                  styles.cardHeading
                }
              >
                <div
                  className={
                    styles.cardIcon
                  }
                >
                  ☷
                </div>

                <div>
                  <h2
                    className={
                      styles.cardTitle
                    }
                  >
                    Mevcut Kapsamlar
                  </h2>

                  <p
                    className={
                      styles.cardSub
                    }
                  >
                    Aktif ve pasif
                    hizmet
                    bölgelerinizi
                    yönetin.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.badgeRow
                }
              >
                <span
                  className={
                    styles.badge
                  }
                >
                  Tümü{" "}
                  <strong>
                    {
                      sorted.length
                    }
                  </strong>
                </span>

                <span
                  className={`${styles.badge} ${styles.badgeOk}`}
                >
                  Aktif{" "}
                  <strong>
                    {
                      activeCount
                    }
                  </strong>
                </span>

                <span
                  className={`${styles.badge} ${styles.badgePassive}`}
                >
                  Pasif{" "}
                  <strong>
                    {
                      passiveCount
                    }
                  </strong>
                </span>
              </div>
            </div>

            {loading ? (
              <div
                className={
                  styles.loading
                }
              >
                <div
                  className={
                    styles.loader
                  }
                />

                <strong>
                  Kapsamlar
                  yükleniyor...
                </strong>
              </div>
            ) : null}

            {!loading &&
            sorted.length ===
              0 ? (
              <div
                className={
                  styles.empty
                }
              >
                <div
                  className={
                    styles.emptyIcon
                  }
                >
                  🦷
                </div>

                <h3>
                  Henüz kapsam
                  eklenmedi.
                </h3>

                <p>
                  Sol taraftaki
                  formdan ilk şehir
                  ve hizmet
                  eşleşmenizi
                  ekleyebilirsiniz.
                </p>
              </div>
            ) : null}

            {!loading &&
            sorted.length >
              0 ? (
              <div
                className={
                  styles.list
                }
              >
                <div
                  className={
                    styles.listHeader
                  }
                >
                  <span>
                    Şehir
                  </span>

                  <span>
                    Hizmet
                  </span>

                  <span>
                    Durum
                  </span>

                  <span>
                    İşlem
                  </span>
                </div>

                {sorted.map(
                  (
                    coverage,
                  ) => (
                    <div
                      key={
                        coverage.id
                      }
                      className={
                        styles.item
                      }
                    >
                      <div
                        className={
                          styles.itemCity
                        }
                      >
                        <span
                          className={
                            styles.rowIcon
                          }
                        >
                          📍
                        </span>

                        <strong>
                          {labelize(
                            coverage.city,
                          )}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.itemService
                        }
                      >
                        <span
                          className={
                            styles.rowIcon
                          }
                        >
                          🦷
                        </span>

                        <strong>
                          {labelize(
                            coverage.service,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span
                          className={`${styles.statusPill} ${
                            coverage.isActive
                              ? styles.statusOn
                              : styles.statusOff
                          }`}
                        >
                          <span
                            className={
                              styles.statusDot
                            }
                          />

                          {coverage.isActive
                            ? "Aktif"
                            : "Pasif"}
                        </span>
                      </div>

                      <div
                        className={
                          styles.itemAction
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            void toggle(
                              coverage,
                            )
                          }
                          className={
                            coverage.isActive
                              ? styles.btnDangerSoft
                              : styles.btnPrimarySoft
                          }
                        >
                          <span
                            className={
                              styles.toggleVisual
                            }
                          >
                            <span
                              className={
                                styles.toggleDot
                              }
                            />
                          </span>

                          {coverage.isActive
                            ? "Pasif Yap"
                            : "Aktif Yap"}
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {/* =====================================================
          BOTTOM CTA
      ===================================================== */}

      <section
        className={
          styles.bottomCta
        }
      >
        <div
          className={
            styles.bottomIcon
          }
        >
          💎
        </div>

        <div
          className={
            styles.bottomText
          }
        >
          <h2>
            Daha fazla kapsam,
            daha fazla fırsat.
          </h2>

          <p>
            Hizmet verdiğiniz
            şehir ve tedavileri
            doğru tanımlayarak
            uygun lead
            fırsatlarını
            kaçırmayın.
          </p>
        </div>

        <div
          className={
            styles.bottomActions
          }
        >
          <Link
            href="/panel/leadler"
            className={
              styles.bottomSecondary
            }
          >
            Leadleri Gör
          </Link>

          <Link
            href="/panel/abonelik"
            className={
              styles.bottomPrimary
            }
          >
            Kredi Paketlerini
            Gör →
          </Link>
        </div>
      </section>
    </div>
  );
}