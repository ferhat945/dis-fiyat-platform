// src/app/teklif-al/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import styles from "./OfferPage.module.css";
import OfferForm from "./OfferForm";

export const metadata: Metadata = {
  title: "Teklif Al | DişFiyat360",
  description: "Şehir + işlem seç, KVKK onaylı formu doldur. Uygun klinikler seninle iletişime geçsin.",
};

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

function first(sp: SP, k: string): string {
  const v = sp[k];
  if (!v) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

export default async function OfferPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<JSX.Element> {
  const sp = await searchParams;
  const clinicId = (first(sp, "clinicId") ?? "").trim();

  // ✅ Direct clinic data (clinicId varsa çek)
  const directClinic = clinicId
    ? await prisma.clinic.findUnique({
        where: { id: clinicId },
        select: {
          id: true,
          name: true,
          isActive: true,
          coverages: {
            where: { isActive: true },
            select: { city: true, service: true },
            orderBy: [{ city: "asc" }, { service: "asc" }],
          },
        },
      })
    : null;

  const safeDirectClinic =
    directClinic && directClinic.isActive
      ? { id: directClinic.id, name: directClinic.name, coverages: directClinic.coverages }
      : null;

  return (
    <section className={styles.wrap}>
      <div className={styles.shell}>
        {/* HERO */}
        <header className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.kicker}>
              <span className={styles.kDot} aria-hidden />
              KVKK Onaylı • Ücretsiz • Hızlı İletişim
            </div>

            <div className={styles.heroNav}>
              <Link className={styles.heroLink} href="/sehir">
                Şehirler
              </Link>
              <Link className={styles.heroLink} href="/hizmetler">
                Hizmetler
              </Link>
              <Link className={styles.heroLink} href="/kvkk">
                KVKK
              </Link>
            </div>
          </div>

          <h1 className={styles.h1}>
            <span className={styles.grad}>Teklif al</span>, klinikler seni arasın.
          </h1>

          <p className={styles.sub}>
            30 saniyede formu doldur. Klinikler kota/uygunluğa göre sırayla dönüş yapar.{" "}
            <strong>Kesin fiyat muayene sonrası netleşir.</strong>
          </p>

          <div className={styles.heroBadges}>
            <div className={styles.badge}>🛡️ Rate limit + honeypot</div>
            <div className={styles.badge}>✅ KVKK zorunlu</div>
            <div className={styles.badge}>📞 Hızlı geri dönüş</div>
          </div>
        </header>

        {/* CONTENT GRID */}
        <div className={styles.grid}>
          {/* FORM CARD */}
          <div className={styles.formCard}>
            <div className={styles.formHead}>
              <div className={styles.formTitleRow}>
                <div>
                  <div className={styles.formTitle}>Teklif Formu</div>
                  <div className={styles.formHint}>Şehir + işlem seç, bilgilerini gir, gönder.</div>

                  {safeDirectClinic ? (
                    <div style={{ marginTop: 8, fontWeight: 900, opacity: 0.85 }}>
                      Seçilen klinik: <strong>{safeDirectClinic.name}</strong>
                    </div>
                  ) : null}
                </div>

                <div className={styles.stepsMini} aria-label="Süreç">
                  <div className={styles.stepMini}>
                    <span>1</span> Seç
                  </div>
                  <div className={styles.stepMini}>
                    <span>2</span> Yaz
                  </div>
                  <div className={styles.stepMini}>
                    <span>3</span> Gönder
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ clinicId varsa directClinic prop'u dolu gider */}
            <OfferForm directClinic={safeDirectClinic} />
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className={styles.side}>
            <div className={styles.sideCard}>
              <div className={styles.sideTitle}>Neden bu kadar hızlı?</div>

              <div className={styles.featureList}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>⚡</div>
                  <div>
                    <div className={styles.featureTitle}>Tek tıkla eşleşme</div>
                    <div className={styles.featureDesc}>
                      Şehir + işlem seçimine göre uygun klinikler listelenir.
                    </div>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>🎯</div>
                  <div>
                    <div className={styles.featureTitle}>Doğru kliniğe gider</div>
                    <div className={styles.featureDesc}>
                      Klinik kapsama ve kota durumuna göre yönlendirme yapılır.
                    </div>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>🔒</div>
                  <div>
                    <div className={styles.featureTitle}>KVKK güvenliği</div>
                    <div className={styles.featureDesc}>
                      Onay olmadan form gönderilmez. Spam koruması vardır.
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.note}>
                <strong>Not:</strong> Bu bir bilgilendirme formudur; tıbbi teşhis/tavsiye değildir.
              </div>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideTitle}>İpucu</div>
              <div className={styles.tipGrid}>
                <div className={styles.tip}>🕘 “Ne zaman?” alanını doğru seç.</div>
                <div className={styles.tip}>📝 “Not” kısmına özel durumunu yaz.</div>
                <div className={styles.tip}>📍 Şehir/işlem doğru olmalı.</div>
              </div>

              <div className={styles.sideCtas}>
                <Link className={styles.sideBtn} href="/klinikler">
                  Klinik Dizini →
                </Link>
                <Link className={styles.sideBtnSoft} href="/">
                  Ana sayfa →
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* FOOT STRIP */}
        <section className={styles.bottom}>
          <div className={styles.bottomCard}>
            <div>
              <div className={styles.bottomTitle}>Şeffaf ve hızlı iletişim</div>
              <div className={styles.bottomDesc}>
                Formu gönderdikten sonra kliniklerden geri dönüş alırsın. Gerektiğinde WhatsApp ile iletişim kurarsın.
              </div>
            </div>

            <div className={styles.bottomBadges}>
              <div className={styles.bottomBadge}>💬 Kolay iletişim</div>
              <div className={styles.bottomBadge}>🧾 Ücretsiz</div>
              <div className={styles.bottomBadge}>🛡️ Güvenli</div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}