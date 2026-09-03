// src/app/panel/fiyatlar/page.tsx
"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CITIES,
  SERVICES,
  cityLabel,
  serviceLabel,
} from "@/lib/seo-data";

import styles from "./page.module.css";

type PriceRange = {
  id: string;
  city: string;
  service: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  isActive: boolean;
  updatedAt?: string;
  createdAt?: string;
};

type ListResp =
  | {
      ok: true;
      items: PriceRange[];
    }
  | {
      ok: false;
      code: string;
    };

type CreateResp =
  | {
      ok: true;
      item: PriceRange;
    }
  | {
      ok: false;
      code: string;
    };

type RowState = {
  minPrice: string;
  maxPrice: string;
  currency: string;
  isActive: boolean;
  existingId?: string;
};

function onlyDigits(
  value: string,
): string {
  return (value ?? "").replace(
    /[^\d]/g,
    "",
  );
}

function toIntSafe(
  value: string,
): number {
  const n =
    Number(value);

  return Number.isFinite(n)
    ? n
    : 0;
}

function fmtTRY(
  value: number,
): string {
  try {
    return new Intl.NumberFormat(
      "tr-TR",
    ).format(value);
  } catch {
    return String(value);
  }
}

function currencySymbol(
  currency: string,
): string {
  if (currency === "USD") {
    return "$";
  }

  if (currency === "EUR") {
    return "€";
  }

  return "₺";
}

export default function PanelFiyatlarPage(): JSX.Element {
  const [
    city,
    setCity,
  ] = useState<string>(
    CITIES[0] ??
      "istanbul",
  );

  const [
    loading,
    setLoading,
  ] =
    useState<boolean>(
      false,
    );

  const [
    err,
    setErr,
  ] =
    useState<
      string | null
    >(null);

  const [
    rows,
    setRows,
  ] =
    useState<
      Record<
        string,
        RowState
      >
    >({});

  const [
    saving,
    setSaving,
  ] =
    useState<
      Record<
        string,
        boolean
      >
    >({});

  const [
    items,
    setItems,
  ] =
    useState<
      PriceRange[]
    >([]);

  const itemsByService =
    useMemo(() => {
      const map =
        new Map<
          string,
          PriceRange
        >();

      for (
        const item of
        items
      ) {
        if (
          item.city ===
          city
        ) {
          map.set(
            item.service,
            item,
          );
        }
      }

      return map;
    }, [
      items,
      city,
    ]);

  const registeredCount =
    itemsByService.size;

  const activeCount =
    useMemo(() => {
      let count = 0;

      for (
        const service of
        SERVICES
      ) {
        const row =
          rows[
            service
          ];

        if (
          row?.isActive
        ) {
          count += 1;
        }
      }

      return count;
    }, [
      rows,
    ]);

  function ensureRowsInitialized(
    fromItems: PriceRange[],
    selectedCity: string,
  ): void {
    setRows(
      (
        previous,
      ) => {
        const next:
          Record<
            string,
            RowState
          > = {
          ...previous,
        };

        for (
          const service of
          SERVICES
        ) {
          const existing =
            fromItems.find(
              (
                item,
              ) =>
                item.city ===
                  selectedCity &&
                item.service ===
                  service,
            );

          if (
            next[
              service
            ]
          ) {
            continue;
          }

          next[
            service
          ] = {
            minPrice:
              existing
                ? String(
                    existing.minPrice,
                  )
                : "",

            maxPrice:
              existing
                ? String(
                    existing.maxPrice,
                  )
                : "",

            currency:
              existing?.currency ??
              "TRY",

            isActive:
              existing?.isActive ??
              true,

            existingId:
              existing?.id,
          };
        }

        return next;
      },
    );
  }

  async function load(): Promise<void> {
    setLoading(
      true,
    );

    setErr(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/panel/price-ranges",
          {
            method:
              "GET",
          },
        );

      const data =
        (await response.json()) as ListResp;

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.ok
            ? "UNKNOWN"
            : data.code,
        );
      }

      setItems(
        data.items,
      );

      ensureRowsInitialized(
        data.items,
        city,
      );
    } catch (
      error
    ) {
      const message =
        error instanceof
        Error
          ? error.message
          : "NETWORK_ERROR";

      setErr(
        message,
      );

      setItems(
        [],
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  async function saveService(
    service: string,
  ): Promise<void> {
    setErr(
      null,
    );

    const row =
      rows[
        service
      ];

    if (!row) {
      return;
    }

    const min =
      toIntSafe(
        row.minPrice ||
          "0",
      );

    const max =
      toIntSafe(
        row.maxPrice ||
          "0",
      );

    if (
      min <= 0 ||
      max <= 0
    ) {
      setErr(
        `${serviceLabel(
          service,
        )}: Min/Max 0’dan büyük olmalı.`,
      );

      return;
    }

    if (
      max < min
    ) {
      setErr(
        `${serviceLabel(
          service,
        )}: Max, Min’den küçük olamaz.`,
      );

      return;
    }

    setSaving(
      (
        previous,
      ) => ({
        ...previous,

        [service]:
          true,
      }),
    );

    try {
      const response =
        await fetch(
          "/api/panel/price-ranges",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  city,

                  service,

                  minPrice:
                    min,

                  maxPrice:
                    max,

                  currency:
                    row.currency ||
                    "TRY",

                  isActive:
                    row.isActive ??
                    true,
                },
              ),
          },
        );

      const data =
        (await response.json()) as CreateResp;

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.ok
            ? "UNKNOWN"
            : data.code,
        );
      }

      setItems(
        (
          previous,
        ) => {
          const next = [
            ...previous,
          ];

          const index =
            next.findIndex(
              (
                item,
              ) =>
                item.city ===
                  city &&
                item.service ===
                  service,
            );

          if (
            index >= 0
          ) {
            next[
              index
            ] =
              data.item;
          } else {
            next.push(
              data.item,
            );
          }

          return next;
        },
      );

      setRows(
        (
          previous,
        ) => ({
          ...previous,

          [service]: {
            ...previous[
              service
            ],

            minPrice:
              String(
                data
                  .item
                  .minPrice,
              ),

            maxPrice:
              String(
                data
                  .item
                  .maxPrice,
              ),

            currency:
              data
                .item
                .currency ??
              previous[
                service
              ]
                .currency ??
              "TRY",

            isActive:
              data
                .item
                .isActive ??
              previous[
                service
              ]
                .isActive ??
              true,

            existingId:
              data
                .item
                .id,
          },
        }),
      );
    } catch (
      error
    ) {
      const message =
        error instanceof
        Error
          ? error.message
          : "NETWORK_ERROR";

      setErr(
        message,
      );
    } finally {
      setSaving(
        (
          previous,
        ) => ({
          ...previous,

          [service]:
            false,
        }),
      );
    }
  }

  function setRow(
    service: string,
    patch: Partial<RowState>,
  ): void {
    setRows(
      (
        previous,
      ) => ({
        ...previous,

        [service]: {
          ...(previous[
            service
          ] ?? {
            minPrice:
              "",

            maxPrice:
              "",

            currency:
              "TRY",

            isActive:
              true,
          }),

          ...patch,
        },
      }),
    );
  }

  useEffect(() => {
    void load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ensureRowsInitialized(
      items,
      city,
    );

    setRows(
      (
        previous,
      ) => {
        const next = {
          ...previous,
        };

        for (
          const service of
          SERVICES
        ) {
          const existing =
            items.find(
              (
                item,
              ) =>
                item.city ===
                  city &&
                item.service ===
                  service,
            );

          if (
            !existing
          ) {
            continue;
          }

          const current =
            next[
              service
            ];

          if (
            !current
          ) {
            continue;
          }

          const minEmpty =
            !current.minPrice;

          const maxEmpty =
            !current.maxPrice;

          next[
            service
          ] = {
            ...current,

            minPrice:
              minEmpty
                ? String(
                    existing.minPrice,
                  )
                : current.minPrice,

            maxPrice:
              maxEmpty
                ? String(
                    existing.maxPrice,
                  )
                : current.maxPrice,

            currency:
              current.currency ||
              existing.currency ||
              "TRY",

            isActive:
              typeof current.isActive ===
              "boolean"
                ? current.isActive
                : existing.isActive ??
                  true,

            existingId:
              existing.id,
          };
        }

        return next;
      },
    );
  }, [
    city,
    items,
  ]);

  return (
    <div
      className={
        styles.page
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
            styles.heroLeft
          }
        >
          <div
            className={
              styles.heroIcon
            }
          >
            ₺
          </div>

          <div>
            <div
              className={
                styles.kicker
              }
            >
              Fiyat Yönetimi
            </div>

            <h1
              className={
                styles.title
              }
            >
              Fiyat
              Aralıkları
            </h1>

            <p
              className={
                styles.subtitle
              }
            >
              Şehir seçin,
              hizmetlerinize
              ait minimum ve
              maksimum fiyat
              aralıklarını
              belirleyip
              kaydedin.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          disabled={
            loading
          }
          className={
            styles.refreshBtn
          }
        >
          <span>
            ↻
          </span>

          {loading
            ? "Yükleniyor..."
            : "Yenile"}
        </button>
      </section>

      {err ? (
        <div
          className={
            styles.errorBox
          }
        >
          <div
            className={
              styles.errorIcon
            }
          >
            !
          </div>

          <div>
            <strong>
              İşlem
              tamamlanamadı
            </strong>

            <span>
              {err}
            </span>
          </div>
        </div>
      ) : null}

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div
        className={
          styles.layout
        }
      >
        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside
          className={
            styles.sidebar
          }
        >
          <section
            className={
              styles.sideCard
            }
          >
            <div
              className={
                styles.sideTitleRow
              }
            >
              <div
                className={
                  styles.stepBadge
                }
              >
                1
              </div>

              <div>
                <h2>
                  Şehir
                  Seçin
                </h2>

                <p>
                  Fiyat
                  aralıklarını
                  belirlemek
                  istediğiniz
                  şehri seçin.
                </p>
              </div>
            </div>

            <label
              className={
                styles.cityLabel
              }
              htmlFor="price-city"
            >
              Şehir
            </label>

            <div
              className={
                styles.citySelectWrap
              }
            >
              <span>
                📍
              </span>

              <select
                id="price-city"
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
                className={
                  styles.citySelect
                }
              >
                {CITIES.map(
                  (
                    citySlug,
                  ) => (
                    <option
                      key={
                        citySlug
                      }
                      value={
                        citySlug
                      }
                    >
                      {cityLabel(
                        citySlug,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div
              className={
                styles.cityMeta
              }
            >
              <span>
                Seçili
                şehir:
              </span>

              <strong>
                {cityLabel(
                  city,
                )}
              </strong>

              <span
                className={
                  styles.metaDot
                }
              >
                •
              </span>

              <span>
                Kayıtlı:
              </span>

              <strong>
                {
                  registeredCount
                }
              </strong>
            </div>
          </section>

          <section
            className={
              styles.sideCard
            }
          >
            <div
              className={
                styles.infoTitle
              }
            >
              <span>
                💡
              </span>

              Bilmeniz
              Gerekenler
            </div>

            <div
              className={
                styles.infoList
              }
            >
              <div
                className={
                  styles.infoItem
                }
              >
                <span>
                  ✓
                </span>

                <p>
                  Minimum
                  fiyat,
                  maksimum
                  fiyattan
                  büyük
                  olamaz.
                </p>
              </div>

              <div
                className={
                  styles.infoItem
                }
              >
                <span>
                  ✓
                </span>

                <p>
                  Boş
                  bıraktığınız
                  hizmetler
                  kaydedilmez.
                </p>
              </div>

              <div
                className={
                  styles.infoItem
                }
              >
                <span>
                  ✓
                </span>

                <p>
                  TRY, USD
                  veya EUR
                  para
                  birimini
                  ayrı ayrı
                  seçebilirsiniz.
                </p>
              </div>

              <div
                className={
                  styles.infoItem
                }
              >
                <span>
                  ✓
                </span>

                <p>
                  Her hizmeti
                  kendi
                  Kaydet
                  butonuyla
                  ayrı ayrı
                  kaydedebilirsiniz.
                </p>
              </div>
            </div>

            <div
              className={
                styles.visibilityBox
              }
            >
              <div
                className={
                  styles.visibilityIcon
                }
              >
                ↗
              </div>

              <div>
                <strong>
                  Düzenli
                  fiyat
                  bilgisi
                </strong>

                <p>
                  Klinik
                  profilinizdeki
                  bilgiler
                  güncel
                  kaldıkça
                  hastalara
                  daha net
                  bilgi
                  sunabilirsiniz.
                </p>
              </div>
            </div>
          </section>
        </aside>

        {/* ===================================================
            SERVICES
        =================================================== */}

        <main
          className={
            styles.contentCard
          }
        >
          <div
            className={
              styles.contentHead
            }
          >
            <div
              className={
                styles.contentHeading
              }
            >
              <div
                className={
                  styles.stepBadge
                }
              >
                2
              </div>

              <div>
                <h2>
                  Hizmet
                  Fiyatları
                </h2>

                <p>
                  Hizmetlerinize
                  ait min –
                  max fiyat
                  aralıklarını
                  belirleyin.
                </p>
              </div>
            </div>

            <div
              className={
                styles.summary
              }
            >
              <div
                className={
                  styles.summaryItem
                }
              >
                <span>
                  Toplam
                  Hizmet
                </span>

                <strong>
                  {
                    SERVICES.length
                  }
                </strong>
              </div>

              <div
                className={`${styles.summaryItem} ${styles.summaryActive}`}
              >
                <span>
                  Aktif
                  Hizmet
                </span>

                <strong>
                  {
                    activeCount
                  }
                </strong>
              </div>
            </div>
          </div>

          <div
            className={
              styles.serviceList
            }
          >
            {SERVICES.map(
              (
                service,
              ) => {
                const row =
                  rows[
                    service
                  ] ?? {
                    minPrice:
                      "",

                    maxPrice:
                      "",

                    currency:
                      "TRY",

                    isActive:
                      true,
                  };

                const existing =
                  itemsByService.get(
                    service,
                  );

                const isSaving =
                  Boolean(
                    saving[
                      service
                    ],
                  );

                const min =
                  toIntSafe(
                    row.minPrice,
                  );

                const max =
                  toIntSafe(
                    row.maxPrice,
                  );

                const invalidRange =
                  Boolean(
                    row.minPrice &&
                      row.maxPrice &&
                      max < min,
                  );

                const canSave =
                  !isSaving &&
                  Boolean(
                    row.minPrice,
                  ) &&
                  Boolean(
                    row.maxPrice,
                  ) &&
                  min > 0 &&
                  max > 0 &&
                  max >= min;

                return (
                  <article
                    key={
                      service
                    }
                    className={
                      styles.serviceRow
                    }
                  >
                    <div
                      className={
                        styles.serviceIdentity
                      }
                    >
                      <div
                        className={
                          styles.toothIcon
                        }
                      >
                        🦷
                      </div>

                      <div
                        className={
                          styles.serviceNameArea
                        }
                      >
                        <strong
                          className={
                            styles.serviceName
                          }
                        >
                          {serviceLabel(
                            service,
                          )}
                        </strong>

                        {existing ? (
                          <span
                            className={
                              styles.savedBadge
                            }
                          >
                            Kayıtlı
                          </span>
                        ) : (
                          <span
                            className={
                              styles.emptyBadge
                            }
                          >
                            Henüz
                            kayıt yok
                          </span>
                        )}
                      </div>
                    </div>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span
                        className={
                          styles.fieldLabel
                        }
                      >
                        Min (
                        {currencySymbol(
                          row.currency,
                        )}
                        )
                      </span>

                      <div
                        className={
                          styles.inputWrap
                        }
                      >
                        <input
                          value={
                            row.minPrice
                          }
                          onChange={(
                            event,
                          ) =>
                            setRow(
                              service,
                              {
                                minPrice:
                                  onlyDigits(
                                    event
                                      .target
                                      .value,
                                  ),
                              },
                            )
                          }
                          inputMode="numeric"
                          placeholder="Örn: 10000"
                          className={
                            styles.input
                          }
                        />

                        <span
                          className={
                            styles.currencySuffix
                          }
                        >
                          {currencySymbol(
                            row.currency,
                          )}
                        </span>
                      </div>

                      <small>
                        {row.minPrice
                          ? `${fmtTRY(
                              min,
                            )} ${currencySymbol(
                              row.currency,
                            )}`
                          : "—"}
                      </small>
                    </label>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span
                        className={
                          styles.fieldLabel
                        }
                      >
                        Max (
                        {currencySymbol(
                          row.currency,
                        )}
                        )
                      </span>

                      <div
                        className={
                          styles.inputWrap
                        }
                      >
                        <input
                          value={
                            row.maxPrice
                          }
                          onChange={(
                            event,
                          ) =>
                            setRow(
                              service,
                              {
                                maxPrice:
                                  onlyDigits(
                                    event
                                      .target
                                      .value,
                                  ),
                              },
                            )
                          }
                          inputMode="numeric"
                          placeholder="Örn: 25000"
                          className={
                            styles.input
                          }
                        />

                        <span
                          className={
                            styles.currencySuffix
                          }
                        >
                          {currencySymbol(
                            row.currency,
                          )}
                        </span>
                      </div>

                      <small>
                        {row.maxPrice
                          ? `${fmtTRY(
                              max,
                            )} ${currencySymbol(
                              row.currency,
                            )}`
                          : "—"}
                      </small>
                    </label>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span
                        className={
                          styles.fieldLabel
                        }
                      >
                        Para
                        Birimi
                      </span>

                      <select
                        value={
                          row.currency ||
                          "TRY"
                        }
                        onChange={(
                          event,
                        ) =>
                          setRow(
                            service,
                            {
                              currency:
                                event
                                  .target
                                  .value,
                            },
                          )
                        }
                        className={
                          styles.currencySelect
                        }
                      >
                        <option value="TRY">
                          TRY
                          (₺)
                        </option>

                        <option value="USD">
                          USD
                          ($)
                        </option>

                        <option value="EUR">
                          EUR
                          (€)
                        </option>
                      </select>

                      <small>
                        Varsayılan:
                        TRY
                      </small>
                    </label>

                    <div
                      className={
                        styles.actionArea
                      }
                    >
                      <label
                        className={
                          styles.activeToggle
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            row.isActive ??
                            true
                          }
                          onChange={(
                            event,
                          ) =>
                            setRow(
                              service,
                              {
                                isActive:
                                  event
                                    .target
                                    .checked,
                              },
                            )
                          }
                        />

                        <span
                          className={
                            styles.toggleTrack
                          }
                        >
                          <span
                            className={
                              styles.toggleThumb
                            }
                          />
                        </span>

                        <strong>
                          {row.isActive
                            ? "Aktif"
                            : "Pasif"}
                        </strong>
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          void saveService(
                            service,
                          )
                        }
                        disabled={
                          !canSave
                        }
                        className={
                          styles.saveButton
                        }
                      >
                        <span>
                          ▣
                        </span>

                        {isSaving
                          ? "Kaydediliyor..."
                          : existing
                            ? "Güncelle"
                            : "Kaydet"}
                      </button>
                    </div>

                    {invalidRange ? (
                      <div
                        className={
                          styles.rowWarning
                        }
                      >
                        ⚠️ Maksimum
                        fiyat minimum
                        fiyattan küçük
                        olamaz.
                      </div>
                    ) : null}

                    {existing ? (
                      <div
                        className={
                          styles.lastSaved
                        }
                      >
                        Son kayıt:{" "}
                        <strong>
                          {fmtTRY(
                            existing.minPrice,
                          )}
                          –
                          {fmtTRY(
                            existing.maxPrice,
                          )}{" "}
                          {
                            existing.currency
                          }
                        </strong>
                      </div>
                    ) : null}
                  </article>
                );
              },
            )}
          </div>

          <div
            className={
              styles.contentNote
            }
          >
            <span>
              🛡️
            </span>

            Her hizmeti ayrı
            ayrı kaydedebilirsiniz.
            Kaydet butonu yalnız
            geçerli bir min–max
            aralığı girildiğinde
            aktif olur.
          </div>
        </main>
      </div>

      {/* =====================================================
          FOOTNOTE + CTA
      ===================================================== */}

      <div
        className={
          styles.medicalNote
        }
      >
        <span>
          ℹ️
        </span>

        <p>
          <strong>
            Bilgilendirme:
          </strong>{" "}
          Kesin fiyat muayene
          sonrası netleşir.
          Buradaki fiyat
          aralıkları
          bilgilendirme
          amaçlıdır.
        </p>
      </div>

      <section
        className={
          styles.bottomCta
        }
      >
        <div
          className={
            styles.ctaIcon
          }
        >
          💎
        </div>

        <div
          className={
            styles.ctaText
          }
        >
          <h2>
            Klinik panelinizi
            aktif kullanın,
            fırsatları
            kaçırmayın.
          </h2>

          <p>
            Fiyat
            aralıklarınızı
            güncel tutun ve
            yeni lead
            fırsatlarını
            değerlendirmek
            için kredi
            bakiyenizi hazır
            bulundurun.
          </p>
        </div>

        <div
          className={
            styles.ctaActions
          }
        >
          <Link
            href="/panel/leadler"
            className={
              styles.ctaSecondary
            }
          >
            Leadleri Gör
          </Link>

          <Link
            href="/panel/abonelik"
            className={
              styles.ctaPrimary
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