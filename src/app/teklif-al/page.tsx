// src/app/teklif-al/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import styles from "./OfferPage.module.css";
import OfferForm from "./OfferForm";

export const metadata: Metadata = {
  title: "Teklif Al | DişFiyat360",
  description:
    "Şehir + işlem seç, KVKK onaylı formu doldur. Uygun klinikler seninle iletişime geçsin.",
};

export const dynamic = "force-dynamic";

type SP = {
  [key: string]: string | string[] | undefined;
};

function first(sp: SP, key: string): string {
  const value = sp[key];

  if (!value) {
    return "";
  }

  return Array.isArray(value)
    ? (value[0] ?? "")
    : value;
}

export default async function OfferPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<JSX.Element> {
  const sp = await searchParams;

  const clinicId = first(
    sp,
    "clinicId",
  ).trim();

  const directClinic = clinicId
    ? await prisma.clinic.findUnique({
        where: {
          id: clinicId,
        },
        select: {
          id: true,
          name: true,
          isActive: true,
          coverages: {
            where: {
              isActive: true,
            },
            select: {
              city: true,
              service: true,
            },
            orderBy: [
              {
                city: "asc",
              },
              {
                service: "asc",
              },
            ],
          },
        },
      })
    : null;

  const safeDirectClinic =
    directClinic &&
    directClinic.isActive
      ? {
          id: directClinic.id,
          name: directClinic.name,
          coverages:
            directClinic.coverages,
        }
      : null;

  return (
    <section className={styles.wrap}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroGlowOne} aria-hidden />
          <div className={styles.heroGlowTwo} aria-hidden />

          <div className={styles.heroContent}>
            <div className={styles.heroTop}>
              <div className={styles.kicker}>
                <span
                  className={styles.kickerIcon}
                  aria-hidden
                >
                  🛡️
                </span>

                KVKK Onaylı • Ücretsiz • Hızlı İletişim
              </div>

              <nav
                className={styles.heroNav}
                aria-label="Teklif sayfası bağlantıları"
              >
                <Link
                  className={styles.heroLink}
                  href="/sehir"
                >
                  Şehirler
                </Link>

                <Link
                  className={styles.heroLink}
                  href="/hizmetler"
                >
                  Hizmetler
                </Link>

                <Link
                  className={styles.heroLink}
                  href="/kvkk"
                >
                  KVKK
                </Link>
              </nav>
            </div>

            <div className={styles.heroGrid}>
              <div className={styles.heroText}>
                <h1 className={styles.h1}>
                  <span className={styles.grad}>
                    Teklif al
                  </span>
                  , klinikler seni arasın.
                </h1>

                <p className={styles.sub}>
                  30 saniyede formu doldur. Klinikler
                  kota/uygunluğa göre sırayla dönüş yapar.{" "}
                  <strong>
                    Kesin fiyat muayene sonrası netleşir.
                  </strong>
                </p>

                <div className={styles.heroBadges}>
                  <div className={styles.badge}>
                    🛡️ Rate limit + honeypot
                  </div>

                  <div className={styles.badge}>
                    ✅ KVKK zorunlu
                  </div>

                  <div className={styles.badge}>
                    📞 Hızlı geri dönüş
                  </div>
                </div>
              </div>

              <div
                className={styles.heroVisual}
                aria-hidden
              >
                <div className={styles.toothStage}>
                  <div className={styles.toothGlow} />

                  <div className={styles.tooth}>
                    🦷
                  </div>

                  <div className={styles.toothRing} />

                  <div className={styles.offerTicket}>
                    <div
                      className={
                        styles.offerTicketIcon
                      }
                    >
                      ✓
                    </div>

                    <div>
                      <strong>
                        Ücretsiz Teklif
                      </strong>

                      <span>
                        Talebini gönder
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.grid}>
          <div className={styles.formCard}>
            <div className={styles.formHead}>
              <div
                className={
                  styles.formTitleRow
                }
              >
                <div>
                  <div className={styles.formTitle}>
                    Teklif Formu
                  </div>

                  <div className={styles.formHint}>
                    Şehir + işlem seç, bilgilerini gir,
                    gönder.
                  </div>

                  {safeDirectClinic ? (
                    <div
                      className={
                        styles.directClinic
                      }
                    >
                      <span aria-hidden>
                        🏥
                      </span>

                      Seçilen klinik:{" "}
                      <strong>
                        {
                          safeDirectClinic.name
                        }
                      </strong>
                    </div>
                  ) : null}
                </div>

                <div
                  className={styles.stepsMini}
                  aria-label="Teklif formu süreci"
                >
                  <div
                    className={
                      styles.stepMini
                    }
                  >
                    <span>1</span>

                    <div>
                      <strong>Seç</strong>
                      <small>
                        Şehir &amp; işlem
                      </small>
                    </div>
                  </div>

                  <div
                    className={
                      styles.stepMini
                    }
                  >
                    <span>2</span>

                    <div>
                      <strong>Yaz</strong>
                      <small>
                        Bilgilerini gir
                      </small>
                    </div>
                  </div>

                  <div
                    className={
                      styles.stepMini
                    }
                  >
                    <span>3</span>

                    <div>
                      <strong>
                        Gönder
                      </strong>
                      <small>
                        Onayla &amp; gönder
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <OfferForm
              directClinic={
                safeDirectClinic
              }
            />
          </div>

          <aside className={styles.side}>
            <div className={styles.sideCard}>
              <div className={styles.sideTitle}>
                Neden bu kadar hızlı?
              </div>

              <div className={styles.featureList}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    ⚡
                  </div>

                  <div>
                    <div
                      className={
                        styles.featureTitle
                      }
                    >
                      Tek tıkla eşleşme
                    </div>

                    <div
                      className={
                        styles.featureDesc
                      }
                    >
                      Şehir + işlem seçimine göre
                      uygun klinikler listelenir.
                    </div>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    🎯
                  </div>

                  <div>
                    <div
                      className={
                        styles.featureTitle
                      }
                    >
                      Doğru kliniğe gider
                    </div>

                    <div
                      className={
                        styles.featureDesc
                      }
                    >
                      Klinik kapsama ve kota durumuna
                      göre yönlendirme yapılır.
                    </div>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div
                    className={`${styles.featureIcon} ${styles.featureIconSecure}`}
                  >
                    🔒
                  </div>

                  <div>
                    <div
                      className={
                        styles.featureTitle
                      }
                    >
                      KVKK güvenliği
                    </div>

                    <div
                      className={
                        styles.featureDesc
                      }
                    >
                      Onay olmadan form
                      gönderilmez. Spam koruması
                      vardır.
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.note}>
                <span aria-hidden>
                  🛡️
                </span>

                <div>
                  <strong>Not:</strong> Bu platform
                  teklif yönlendirme amaçlıdır; tıbbi
                  teşhis/tavsiye değildir. Kesin fiyat
                  muayene sonrası ilgili klinik
                  tarafından belirlenir.
                </div>
              </div>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideTitle}>
                Şeffaf Bilgilendirme
              </div>

              <div className={styles.tipGrid}>
                <div className={styles.tip}>
                  <span aria-hidden>
                    🦷
                  </span>
                  Platform tedavi hizmeti sunmaz,
                  teklif yönlendirmesi yapar.
                </div>

                <div className={styles.tip}>
                  <span aria-hidden>
                    📄
                  </span>
                  Kişisel veriler, talebine uygun
                  kliniklerle paylaşılabilir.
                </div>

                <div className={styles.tip}>
                  <span aria-hidden>
                    🔒
                  </span>
                  Form gönderimi KVKK ve güvenlik
                  kontrollerine tabidir.
                </div>
              </div>

              <div className={styles.infoLinks}>
                <Link
                  className={styles.sideBtn}
                  href="/kvkk"
                >
                  KVKK Metni →
                </Link>

                <Link
                  className={
                    styles.sideBtnSoft
                  }
                  href="/gizlilik-politikasi"
                >
                  Gizlilik Politikası →
                </Link>

                <Link
                  className={
                    styles.sideBtnSoft
                  }
                  href="/kullanim-kosullari"
                >
                  Kullanım Koşulları →
                </Link>
              </div>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideTitle}>
                Formu doldururken
              </div>

              <div className={styles.tipGrid}>
                <div className={styles.tip}>
                  🕘 “Ne zaman?” alanını doğru seç.
                </div>

                <div className={styles.tip}>
                  📝 “Not” kısmına özel durumunu yaz.
                </div>

                <div className={styles.tip}>
                  📍 Şehir ve işlemi doğru seç.
                </div>
              </div>

              <div className={styles.sideCtas}>
                <Link
                  className={styles.sideBtn}
                  href="/klinikler"
                >
                  Klinik Dizini →
                </Link>

                <Link
                  className={
                    styles.sideBtnSoft
                  }
                  href="/"
                >
                  Ana sayfa →
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <section className={styles.bottom}>
          <div className={styles.bottomCard}>
            <div>
              <div className={styles.bottomTitle}>
                Şeffaf ve hızlı iletişim
              </div>

              <div className={styles.bottomDesc}>
                Formu gönderdikten sonra uygun
                kliniklerden geri dönüş alırsın.
                Gerektiğinde iletişim kurarsın.
              </div>
            </div>

            <div className={styles.bottomBadges}>
              <div className={styles.bottomBadge}>
                💬 Kolay iletişim
              </div>

              <div className={styles.bottomBadge}>
                🧾 Ücretsiz
              </div>

              <div className={styles.bottomBadge}>
                🛡️ Güvenli
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}