"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "./page.module.css";

type ClinicProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  instagramUrl: string | null;
  updatedAt: string;
};

type ProfileResponse =
  | {
      ok: true;
      clinic: ClinicProfile;
    }
  | {
      ok: false;
      code?: string;
    };

function normalizeInstagramInput(
  value: string,
): string {
  const raw =
    value.trim();

  if (!raw) {
    return "";
  }

  const cleaned =
    raw.replace(
      /^@+/,
      "",
    );

  if (
    /^https?:\/\//i.test(
      cleaned,
    )
  ) {
    return cleaned;
  }

  return `https://www.instagram.com/${cleaned}/`;
}

function instagramHandle(
  urlOrUser: string,
): string {
  const value =
    urlOrUser.trim();

  if (!value) {
    return "";
  }

  try {
    const url =
      new URL(
        value,
      );

    const path =
      url.pathname.replace(
        /^\/+|\/+$/g,
        "",
      );

    const firstSegment =
      path.split(
        "/",
      )[0] ?? "";

    return firstSegment
      ? `@${firstSegment}`
      : "Instagram";
  } catch {
    const username =
      value.replace(
        /^@+/,
        "",
      );

    return username
      ? `@${username}`
      : "Instagram";
  }
}

export default function ClinicProfilePage(): JSX.Element {
  const [
    loading,
    setLoading,
  ] =
    useState<boolean>(
      true,
    );

  const [
    saving,
    setSaving,
  ] =
    useState<boolean>(
      false,
    );

  const [
    clinic,
    setClinic,
  ] =
    useState<
      ClinicProfile | null
    >(null);

  const [
    name,
    setName,
  ] =
    useState<string>(
      "",
    );

  const [
    phone,
    setPhone,
  ] =
    useState<string>(
      "",
    );

  const [
    instagramInput,
    setInstagramInput,
  ] =
    useState<string>(
      "",
    );

  const [
    msg,
    setMsg,
  ] =
    useState<{
      type:
        | "ok"
        | "err";

      text: string;
    } | null>(
      null,
    );

  const normalizedInstagram =
    useMemo<string>(
      () =>
        normalizeInstagramInput(
          instagramInput,
        ),
      [
        instagramInput,
      ],
    );

  const checks =
    useMemo(
      () => {
        const nameOk =
          name
            .trim()
            .length >=
          2;

        const phoneOk =
          phone
            .trim()
            .length >=
          7;

        const igOk =
          Boolean(
            normalizedInstagram,
          );

        return {
          nameOk,
          phoneOk,
          igOk,
        };
      },
      [
        name,
        phone,
        normalizedInstagram,
      ],
    );

  const completion =
    useMemo<number>(
      () => {
        let score =
          0;

        if (
          checks.nameOk
        ) {
          score +=
            50;
        }

        if (
          checks.phoneOk
        ) {
          score +=
            25;
        }

        if (
          checks.igOk
        ) {
          score +=
            25;
        }

        return score;
      },
      [
        checks,
      ],
    );

  const canSave =
    useMemo<boolean>(
      () =>
        name
          .trim()
          .length >=
        2,
      [
        name,
      ],
    );

  const loadProfile =
    useCallback(
      async (): Promise<void> => {
        setLoading(
          true,
        );

        setMsg(
          null,
        );

        try {
          const response =
            await fetch(
              "/api/panel/profile",
              {
                cache:
                  "no-store",
              },
            );

          const data:
            ProfileResponse =
            await response.json();

          if (
            !response.ok ||
            !data.ok
          ) {
            setClinic(
              null,
            );

            setMsg({
              type:
                "err",

              text:
                "Profil yüklenemedi.",
            });

            return;
          }

          const loadedClinic =
            data.clinic;

          setClinic(
            loadedClinic,
          );

          setName(
            loadedClinic.name ??
              "",
          );

          setPhone(
            loadedClinic.phone ??
              "",
          );

          setInstagramInput(
            loadedClinic.instagramUrl ??
              "",
          );
        } catch {
          setClinic(
            null,
          );

          setMsg({
            type:
              "err",

            text:
              "Profil yüklenemedi.",
          });
        } finally {
          setLoading(
            false,
          );
        }
      },
      [],
    );

  const saveProfile =
    useCallback(
      async (): Promise<void> => {
        if (
          !canSave ||
          saving
        ) {
          return;
        }

        setSaving(
          true,
        );

        setMsg(
          null,
        );

        try {
          const response =
            await fetch(
              "/api/panel/profile",
              {
                method:
                  "PATCH",

                headers: {
                  "content-type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    {
                      name:
                        name.trim(),

                      phone:
                        phone.trim(),

                      instagramUrl:
                        normalizedInstagram,
                    },
                  ),
              },
            );

          const data:
            ProfileResponse =
            await response.json();

          if (
            !response.ok ||
            !data.ok
          ) {
            setMsg({
              type:
                "err",

              text:
                "Kaydedilemedi.",
            });

            return;
          }

          setClinic(
            data.clinic,
          );

          setName(
            data.clinic
              .name ??
              "",
          );

          setPhone(
            data.clinic
              .phone ??
              "",
          );

          setInstagramInput(
            data.clinic
              .instagramUrl ??
              "",
          );

          setMsg({
            type:
              "ok",

            text:
              "Profil güncellendi.",
          });
        } catch {
          setMsg({
            type:
              "err",

            text:
              "Kaydedilemedi.",
          });
        } finally {
          setSaving(
            false,
          );
        }
      },
      [
        canSave,
        name,
        normalizedInstagram,
        phone,
        saving,
      ],
    );

  useEffect(() => {
    let cancelled =
      false;

    async function loadInitialProfile(): Promise<void> {
      try {
        const response =
          await fetch(
            "/api/panel/profile",
            {
              cache:
                "no-store",
            },
          );

        const data:
          ProfileResponse =
          await response.json();

        if (
          cancelled
        ) {
          return;
        }

        if (
          !response.ok ||
          !data.ok
        ) {
          setClinic(
            null,
          );

          setMsg({
            type:
              "err",

            text:
              "Profil yüklenemedi.",
          });

          return;
        }

        const loadedClinic =
          data.clinic;

        setClinic(
          loadedClinic,
        );

        setName(
          loadedClinic.name ??
            "",
        );

        setPhone(
          loadedClinic.phone ??
            "",
        );

        setInstagramInput(
          loadedClinic.instagramUrl ??
            "",
        );
      } catch {
        if (
          cancelled
        ) {
          return;
        }

        setClinic(
          null,
        );

        setMsg({
          type:
            "err",

          text:
            "Profil yüklenemedi.",
        });
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false,
          );
        }
      }
    }

    void loadInitialProfile();

    return () => {
      cancelled =
        true;
    };
  }, []);

  const updatedAt =
    clinic
      ? new Date(
          clinic.updatedAt,
        ).toLocaleString(
          "tr-TR",
        )
      : "";

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
            styles.heroGlow
          }
          aria-hidden
        />

        <div
          className={
            styles.heroLeft
          }
        >
          <div
            className={
              styles.kicker
            }
          >
            <span>
              🦷
            </span>

            Klinik Paneli
          </div>

          <h1
            className={
              styles.title
            }
          >
            Profil
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            Klinik dizininde
            daha güven veren
            bir profil için
            bilgilerinizi
            güncel tutun.
          </p>
        </div>

        {clinic ? (
          <div
            className={
              styles.updatedCard
            }
          >
            <div
              className={
                styles.updatedIcon
              }
            >
              ◷
            </div>

            <div>
              <strong>
                {
                  updatedAt
                }
              </strong>

              <span>
                Son
                güncelleme
              </span>
            </div>
          </div>
        ) : null}
      </section>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div
        className={
          styles.grid
        }
      >
        {/* ===================================================
            PROFILE FORM
        =================================================== */}

        <section
          className={
            styles.formCard
          }
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <div
              className={
                styles.cardTitleIcon
              }
            >
              ♙
            </div>

            <div>
              <h2>
                Klinik
                Bilgileri
              </h2>

              <p>
                Bilgilerinizi
                güncel tutun,
                potansiyel
                hastaların size
                ulaşmasını
                kolaylaştırın.
              </p>
            </div>
          </div>

          {loading ? (
            <div
              className={
                styles.loadingBox
              }
            >
              <div
                className={
                  styles.loader
                }
              />

              <strong>
                Profil
                yükleniyor...
              </strong>
            </div>
          ) : !clinic ? (
            <div
              className={
                styles.loadError
              }
            >
              <div
                className={
                  styles.loadErrorIcon
                }
              >
                !
              </div>

              <div>
                <strong>
                  Profil
                  yüklenemedi
                </strong>

                <p>
                  {msg?.text ??
                    "Profil bulunamadı."}
                </p>

                <button
                  type="button"
                  className={
                    styles.retryBtn
                  }
                  onClick={() =>
                    void loadProfile()
                  }
                >
                  Yeniden Dene
                </button>
              </div>
            </div>
          ) : (
            <>
              {msg ? (
                <div
                  className={
                    msg.type ===
                    "ok"
                      ? styles.messageOk
                      : styles.messageErr
                  }
                >
                  <span>
                    {msg.type ===
                    "ok"
                      ? "✓"
                      : "!"}
                  </span>

                  {
                    msg.text
                  }
                </div>
              ) : null}

              <div
                className={
                  styles.form
                }
              >
                <div
                  className={
                    styles.twoCol
                  }
                >
                  {/* CLINIC NAME */}

                  <div
                    className={
                      styles.field
                    }
                  >
                    <div
                      className={
                        styles.labelRow
                      }
                    >
                      <label
                        htmlFor="clinic-name"
                      >
                        Klinik Adı
                        <span>
                          *
                        </span>
                      </label>

                      <span
                        className={
                          styles.requiredBadge
                        }
                      >
                        Zorunlu
                      </span>
                    </div>

                    <div
                      className={
                        styles.inputFrame
                      }
                    >
                      <div
                        className={
                          styles.inputIcon
                        }
                      >
                        🏥
                      </div>

                      <input
                        id="clinic-name"
                        className={
                          styles.input
                        }
                        value={
                          name
                        }
                        onChange={(
                          event,
                        ) =>
                          setName(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Örn: Özel X Ağız ve Diş Sağlığı Polikliniği"
                        autoComplete="organization"
                      />
                    </div>
                  </div>

                  {/* PHONE */}

                  <div
                    className={
                      styles.field
                    }
                  >
                    <div
                      className={
                        styles.labelRow
                      }
                    >
                      <label
                        htmlFor="clinic-phone"
                      >
                        Telefon
                        <span>
                          *
                        </span>
                      </label>

                      <span
                        className={
                          styles.requiredBadge
                        }
                      >
                        Zorunlu
                      </span>
                    </div>

                    <div
                      className={
                        styles.inputFrame
                      }
                    >
                      <div
                        className={
                          styles.inputIcon
                        }
                      >
                        📞
                      </div>

                      <input
                        id="clinic-phone"
                        className={
                          styles.input
                        }
                        value={
                          phone
                        }
                        onChange={(
                          event,
                        ) =>
                          setPhone(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Örn: 0 (5xx) xxx xx xx"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>

                {/* INSTAGRAM */}

                <div
                  className={
                    styles.field
                  }
                >
                  <div
                    className={
                      styles.labelRow
                    }
                  >
                    <label
                      htmlFor="clinic-instagram"
                    >
                      Instagram
                      <span
                        className={
                          styles.optionalText
                        }
                      >
                        (opsiyonel)
                      </span>
                    </label>

                    <span
                      className={
                        styles.labelHint
                      }
                    >
                      Kullanıcı adı
                      veya link
                    </span>
                  </div>

                  <div
                    className={
                      styles.inputFrame
                    }
                  >
                    <div
                      className={
                        styles.inputIcon
                      }
                    >
                      ◎
                    </div>

                    <input
                      id="clinic-instagram"
                      className={
                        styles.input
                      }
                      value={
                        instagramInput
                      }
                      onChange={(
                        event,
                      ) =>
                        setInstagramInput(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder='Örn: https://www.instagram.com/kliniginiz/ veya "kliniginiz"'
                      autoComplete="url"
                    />
                  </div>

                  <div
                    className={
                      styles.instagramInfo
                    }
                  >
                    <span>
                      ⓘ
                    </span>

                    <p>
                      Instagram
                      eklemeniz
                      dizinde
                      profilinizi
                      daha güven
                      veren
                      gösterir.
                    </p>
                  </div>

                  <div
                    className={
                      styles.instagramBottom
                    }
                  >
                    {normalizedInstagram ? (
                      <a
                        className={
                          styles.instagramBadge
                        }
                        href={
                          normalizedInstagram
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        ◎{" "}
                        {instagramHandle(
                          normalizedInstagram,
                        )}{" "}
                        ↗
                      </a>
                    ) : (
                      <span
                        className={
                          styles.instagramMissing
                        }
                      >
                        Instagram
                        eklenmedi
                      </span>
                    )}

                    <span
                      className={
                        styles.instagramHelp
                      }
                    >
                      Sadece kullanıcı
                      adı yazarsanız
                      otomatik linke
                      çevrilir.
                    </span>
                  </div>
                </div>

                {/* EMAIL */}

                <div
                  className={
                    styles.field
                  }
                >
                  <div
                    className={
                      styles.labelRow
                    }
                  >
                    <label
                      htmlFor="clinic-email"
                    >
                      E-posta
                    </label>

                    <span
                      className={
                        styles.labelHint
                      }
                    >
                      Değiştirilemez
                    </span>
                  </div>

                  <div
                    className={`${styles.inputFrame} ${styles.readOnlyFrame}`}
                  >
                    <div
                      className={
                        styles.inputIcon
                      }
                    >
                      ✉
                    </div>

                    <input
                      id="clinic-email"
                      className={`${styles.input} ${styles.readonly}`}
                      value={
                        clinic.email
                      }
                      readOnly
                    />
                  </div>
                </div>

                {/* ACTIONS */}

                <div
                  className={
                    styles.actions
                  }
                >
                  <div
                    className={
                      styles.actionButtons
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.saveBtn
                      }
                      onClick={() =>
                        void saveProfile()
                      }
                      disabled={
                        !canSave ||
                        saving ||
                        loading
                      }
                    >
                      <span>
                        ▣
                      </span>

                      {saving
                        ? "Kaydediliyor..."
                        : "Kaydet"}
                    </button>

                    <button
                      type="button"
                      className={
                        styles.refreshBtn
                      }
                      onClick={() =>
                        void loadProfile()
                      }
                      disabled={
                        saving ||
                        loading
                      }
                    >
                      <span>
                        ↻
                      </span>

                      {loading
                        ? "Yükleniyor..."
                        : "Yenile"}
                    </button>
                  </div>

                  <div
                    className={
                      styles.lastUpdate
                    }
                  >
                    Son
                    güncelleme:{" "}
                    <strong>
                      {
                        updatedAt
                      }
                    </strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ===================================================
            COMPLETION
        =================================================== */}

        <aside
          className={
            styles.completionCard
          }
        >
          <div
            className={
              styles.completionHeader
            }
          >
            <div
              className={
                styles.cardTitleIcon
              }
            >
              ↗
            </div>

            <div>
              <h2>
                Profil
                Tamamlama
              </h2>

              <p>
                Daha çok güven
                → daha çok
                dönüş
              </p>
            </div>
          </div>

          <div
            className={
              styles.completionMain
            }
          >
            <div
              className={
                styles.circleWrap
              }
            >
              <div
                className={
                  styles.progressCircle
                }
                style={{
                  background: `conic-gradient(#7250ec ${completion * 3.6}deg, #ececf4 0deg)`,
                }}
                aria-label={`Profil tamamlanma oranı yüzde ${completion}`}
              >
                <div
                  className={
                    styles.progressCircleInner
                  }
                >
                  <strong>
                    %
                    {
                      completion
                    }
                  </strong>
                </div>
              </div>

              <div
                className={
                  styles.targetText
                }
              >
                Hedef:
                %100
              </div>
            </div>

            <div
              className={
                styles.progressBar
              }
            >
              <div
                className={
                  styles.progressBarFill
                }
                style={{
                  width: `${completion}%`,
                }}
              />
            </div>
          </div>

          <div
            className={
              styles.checkList
            }
          >
            <CompletionItem
              title="Klinik adı"
              complete={
                checks.nameOk
              }
              icon="🏥"
            />

            <CompletionItem
              title="Telefon"
              complete={
                checks.phoneOk
              }
              icon="📞"
            />

            <CompletionItem
              title="Instagram (opsiyonel)"
              complete={
                checks.igOk
              }
              icon="◎"
            />
          </div>

          <div
            className={
              styles.tipCard
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
                Instagram
                eklemek dizinde
                profilinizi daha
                güven veren
                gösterir.
              </p>

              <p>
                Telefon
                bilginiz doğru
                olduğunda
                hastaların size
                ulaşması
                kolaylaşır.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CompletionItem({
  title,
  complete,
  icon,
}: {
  title: string;
  complete: boolean;
  icon: string;
}): JSX.Element {
  return (
    <div
      className={
        styles.checkItem
      }
    >
      <div
        className={
          styles.checkLeft
        }
      >
        <div
          className={
            complete
              ? `${styles.checkIcon} ${styles.checkIconOk}`
              : styles.checkIcon
          }
        >
          {complete
            ? "✓"
            : icon}
        </div>

        <strong>
          {title}
        </strong>
      </div>

      <span
        className={
          complete
            ? `${styles.checkStatus} ${styles.checkStatusOk}`
            : `${styles.checkStatus} ${styles.checkStatusMissing}`
        }
      >
        {complete
          ? "Tamamlandı"
          : "Eksik"}
      </span>
    </div>
  );
}