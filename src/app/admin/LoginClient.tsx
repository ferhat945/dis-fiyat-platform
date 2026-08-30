"use client";

import {
  useState,
  type KeyboardEvent,
} from "react";

export default function AdminLoginClient(): JSX.Element {
  const [key, setKey] = useState<string>("");
  const [loading, setLoading] =
    useState<boolean>(false);
  const [err, setErr] =
    useState<string | null>(null);

  async function submit(): Promise<void> {
    if (!key.trim() || loading) {
      return;
    }

    setErr(null);
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            key: key.trim(),
          }),
        }
      );

      const json =
        (await response.json()) as {
          ok?: boolean;
          code?: string;
        };

      if (
        !response.ok ||
        !json.ok
      ) {
        setErr(
          json.code ??
            `HTTP_${response.status}`
        );

        return;
      }

      window.location.href =
        "/admin";
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : "NETWORK_ERROR"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ): void {
    if (
      event.key === "Enter" &&
      key.trim() &&
      !loading
    ) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at 15% 10%,rgba(99,91,255,.13),transparent 28%), radial-gradient(circle at 85% 80%,rgba(46,144,250,.09),transparent 30%), #f6f7fb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1060,
          display: "grid",
          gridTemplateColumns:
            "minmax(0,1.15fr) minmax(340px,.85fr)",
          border:
            "1px solid #e7eaf0",
          borderRadius: 28,
          overflow: "hidden",
          background: "#fff",
          boxShadow:
            "0 24px 70px rgba(16,24,40,.12)",
        }}
      >
        <section
          style={{
            position: "relative",
            minHeight: 590,
            padding: 48,
            display: "flex",
            flexDirection: "column",
            justifyContent:
              "space-between",
            overflow: "hidden",
            color: "#fff",
            background:
              "linear-gradient(145deg,#0b1020 0%,#111a32 60%,#4338ca 140%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 360,
              height: 360,
              right: -160,
              top: -150,
              borderRadius: 999,
              background:
                "rgba(99,91,255,.20)",
              filter: "blur(4px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              left: -150,
              bottom: -150,
              borderRadius: 999,
              background:
                "rgba(46,144,250,.10)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display:
                  "inline-flex",
                alignItems: "center",
                gap: 9,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  display: "grid",
                  placeItems:
                    "center",
                  borderRadius: 13,
                  background:
                    "linear-gradient(135deg,#8179ff,#554bea)",
                  boxShadow:
                    "0 12px 32px rgba(99,91,255,.35)",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                D
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 1,
                }}
              >
                <strong
                  style={{
                    fontSize: 16,
                    letterSpacing:
                      "-.025em",
                  }}
                >
                  DişFiyat360
                </strong>

                <span
                  style={{
                    color:
                      "rgba(255,255,255,.46)",
                    fontSize: 9,
                    fontWeight: 650,
                  }}
                >
                  Yönetim Merkezi
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: 72,
                maxWidth: 560,
              }}
            >
              <div
                style={{
                  display:
                    "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding:
                    "6px 9px",
                  border:
                    "1px solid rgba(255,255,255,.11)",
                  borderRadius: 999,
                  background:
                    "rgba(255,255,255,.06)",
                  color:
                    "rgba(255,255,255,.68)",
                  fontSize: 9,
                  fontWeight: 750,
                }}
              >
                <span className="adminStatusDot" />
                Yetkili yönetici alanı
              </div>

              <h1
                style={{
                  margin:
                    "18px 0 0",
                  maxWidth: 500,
                  fontSize:
                    "clamp(34px,5vw,50px)",
                  lineHeight: 1.02,
                  letterSpacing:
                    "-.055em",
                }}
              >
                Operasyonlarını tek
                merkezden yönet.
              </h1>

              <p
                style={{
                  margin:
                    "18px 0 0",
                  maxWidth: 480,
                  color:
                    "rgba(255,255,255,.55)",
                  fontSize: 12,
                  lineHeight: 1.8,
                  fontWeight: 520,
                }}
              >
                Klinikler, leadler,
                ödemeler, hizmet
                kapsamları ve içerik
                operasyonları için
                güvenli yönetim alanı.
              </p>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns:
                "repeat(3,minmax(0,1fr))",
              gap: 9,
            }}
          >
            <Feature
              title="Klinikler"
              text="Hesap yönetimi"
            />

            <Feature
              title="Leadler"
              text="Talep takibi"
            />

            <Feature
              title="Ödemeler"
              text="Tahsilat kontrolü"
            />
          </div>
        </section>

        <section
          style={{
            padding: 42,
            display: "flex",
            alignItems: "center",
            background:
              "linear-gradient(180deg,#fff,#fafbfc)",
          }}
        >
          <div
            style={{
              width: "100%",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                display: "grid",
                placeItems: "center",
                borderRadius: 15,
                background:
                  "#f0efff",
                color: "#5148e5",
                fontSize: 20,
                fontWeight: 850,
              }}
            >
              ↗
            </div>

            <h2
              style={{
                margin:
                  "21px 0 0",
                color: "#101828",
                fontSize: 26,
                lineHeight: 1.15,
                letterSpacing:
                  "-.04em",
              }}
            >
              Admin Giriş
            </h2>

            <p
              style={{
                margin:
                  "8px 0 0",
                color: "#667085",
                fontSize: 11,
                lineHeight: 1.65,
              }}
            >
              Yönetim paneline devam
              etmek için ADMIN_KEY
              bilgisini gir.
            </p>

            <label
              style={{
                marginTop: 27,
                display: "grid",
                gap: 7,
              }}
            >
              <span
                style={{
                  color: "#475467",
                  fontSize: 9,
                  fontWeight: 750,
                }}
              >
                ADMIN_KEY
              </span>

              <input
                type="password"
                className="adminInput"
                value={key}
                disabled={loading}
                autoComplete="off"
                placeholder="Yönetici anahtarını gir"
                onChange={(event) => {
                  setKey(
                    event.target.value
                  );

                  if (err) {
                    setErr(null);
                  }
                }}
                onKeyDown={
                  handleKeyDown
                }
                style={{
                  height: 48,
                  fontSize: 12,
                }}
              />
            </label>

            {err ? (
              <div
                style={{
                  marginTop: 11,
                  padding: 11,
                  border:
                    "1px solid #fecdca",
                  borderRadius: 11,
                  background:
                    "#fef3f2",
                  color: "#b42318",
                  fontSize: 10,
                  fontWeight: 750,
                }}
              >
                Giriş başarısız:{" "}
                {err}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() =>
                void submit()
              }
              disabled={
                !key.trim() ||
                loading
              }
              className="adminButton adminButtonPrimary"
              style={{
                width: "100%",
                minHeight: 46,
                marginTop: 14,
                fontSize: 11,
              }}
            >
              {loading
                ? "Giriş yapılıyor..."
                : "Yönetim Merkezine Gir →"}
            </button>

            <div
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop:
                  "1px solid #eaecf0",
                display: "flex",
                alignItems:
                  "flex-start",
                gap: 8,
                color: "#98a2b3",
                fontSize: 9,
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  marginTop: 4,
                  flex: "0 0 7px",
                  borderRadius:
                    999,
                  background:
                    "#12b76a",
                }}
              />

              <span>
                Bu alan yalnızca
                yetkili yöneticiler
                içindir. Giriş
                bilgilerini üçüncü
                kişilerle paylaşma.
              </span>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 820px) {
          div > div {
          }
        }
      `}</style>
    </div>
  );
}

function Feature({
  title,
  text,
}: {
  title: string;
  text: string;
}): JSX.Element {
  return (
    <div
      style={{
        padding: 12,
        border:
          "1px solid rgba(255,255,255,.08)",
        borderRadius: 13,
        background:
          "rgba(255,255,255,.04)",
      }}
    >
      <strong
        style={{
          display: "block",
          fontSize: 10,
          fontWeight: 750,
        }}
      >
        {title}
      </strong>

      <span
        style={{
          display: "block",
          marginTop: 3,
          color:
            "rgba(255,255,255,.35)",
          fontSize: 8,
        }}
      >
        {text}
      </span>
    </div>
  );
}