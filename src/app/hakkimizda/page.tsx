import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkımızda | DişFiyat360",
  description:
    "DişFiyat360'ın diş kliniklerine sunduğu dijital görünürlük, panel erişimi, lead yönlendirme, kredi paketi ve Premium üyelik hizmetleri hakkında bilgi edinin.",
  alternates: {
    canonical: "/hakkimizda",
  },
};

export default function AboutPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">🏢 Hakkımızda</div>

              <h1
                className="h1"
                style={{
                  fontSize: 34,
                  marginTop: 10,
                }}
              >
                DişFiyat360 <span className="grad">Hakkında</span>
              </h1>

              <p
                className="heroDesc"
                style={{
                  maxWidth: 800,
                }}
              >
                DişFiyat360; diş kliniklerine dijital görünürlük, klinik
                paneli, kullanıcı talebi yönlendirme, kredi paketi ve Premium
                üyelik hizmetleri sunan bir B2B dijital platformdur.
              </p>

              <div className="section">
                <div
                  className="sectionBox"
                  style={{
                    background: "rgba(255,255,255,0.82)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    <InfoBlock
                      title="DişFiyat360 Ne Yapar?"
                      text="DişFiyat360, diş kliniklerinin dijital ortamda görünürlük kazanmasına ve platform üzerinden iletilen kullanıcı taleplerini yönetmesine yardımcı olur. Klinikler kendi hesaplarıyla panele giriş yapabilir, profil bilgilerini düzenleyebilir, hizmet ve şehir kapsamlarını yönetebilir, kendilerine yönlendirilen uygun kullanıcı taleplerini görüntüleyebilir ve kredi veya Premium üyelik hizmetlerinden yararlanabilir."
                    />

                    <InfoBlock
                      title="Kliniklere Sunduğumuz Hizmetler"
                      text="Platform kapsamında klinik paneli erişimi, dijital klinik profili, hizmet ve şehir kapsamı yönetimi, kullanıcı talebi yönlendirme, lead iletişim bilgilerini kredi ile görüntüleme ve uygun lead dağıtımlarında öncelik sağlayan Premium üyelik hizmetleri sunulur."
                    />

                    <InfoBlock
                      title="Lead ve Kredi Modeli"
                      text="Bir kredi, kliniğe yönlendirilmiş bir kullanıcı talebinin iletişim bilgilerini görüntüleme hakkı sağlar. Lead kaydı; kesin hasta, randevu, tedavi, satış veya gelir garantisi anlamına gelmez. Kullanıcı ile iletişim kurulması, randevu oluşturulması ve sağlık hizmetinin sunulması ilgili kliniğin sorumluluğundadır."
                    />

                    <InfoBlock
                      title="Premium Üyelik Modeli"
                      text="Premium üyelik, geçerli üyelik süresi boyunca uygun kullanıcı taleplerinin dağıtımında standart kliniklere göre öncelik sağlar. Premium üyelik; belirli sayıda lead, münhasır kullanıcı talebi, kesin hasta, randevu, tedavi veya gelir garantisi vermez."
                    />

                    <InfoBlock
                      title="DişFiyat360 Ne Yapmaz?"
                      text="DişFiyat360 bir diş kliniği veya sağlık hizmeti sağlayıcısı değildir. Platform üzerinden tıbbi teşhis, muayene, tedavi, reçete, sağlık danışmanlığı veya kesin tedavi fiyatı sunulmaz. Tedavi planı, muayene, fiyatlandırma ve sağlık hizmetleri ilgili klinik ve sağlık profesyonelleri tarafından yürütülür."
                    />

                    <InfoBlock
                      title="Kullanıcı Taleplerinin Yönlendirilmesi"
                      text="Kullanıcılar, ilgilendikleri diş hizmeti ve şehir bilgisiyle teklif veya iletişim talebi oluşturabilir. İletilen talepler, kullanıcının bilgilendirilmesi ve gerekli onay süreçleri kapsamında uygun kliniklerle paylaşılabilir. Klinikler, kendilerine iletilen kişisel verileri yalnızca ilgili talebe dönüş yapmak, iletişim kurmak ve talep edilen hizmet hakkında bilgi vermek amacıyla kullanmalıdır."
                    />

                    <InfoBlock
                      title="Ücretli Dijital Hizmetler"
                      text="DişFiyat360 üzerinden kliniklere sunulan ücretli hizmetler fiziksel ürün veya sağlık hizmeti değildir. Satışa sunulan hizmetler; dijital kredi paketleri, klinik paneli özellikleri, dijital görünürlük hizmetleri, lead yönetimi ve süreli Premium üyelik haklarından oluşur."
                    />

                    <InfoBlock
                      title="Hizmet Sorumluluğu"
                      text="DişFiyat360, kullanıcı taleplerinin uygun kliniklere iletilmesine yönelik dijital altyapı sağlar. Kliniklerin kullanıcılarla kurduğu iletişim, verdiği fiyat bilgileri, randevu süreçleri, tıbbi değerlendirmeleri, tedavi kararları ve sunduğu sağlık hizmetleri ilgili kliniğin sorumluluğundadır."
                    />

                    <CorporateInformation />
                  </div>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/iletisim" className="btn btnSoft">
                  İletişim →
                </Link>

                <Link href="/kvkk" className="btn btnGhost">
                  KVKK Bilgilendirmesi →
                </Link>

                <Link href="/klinikler" className="btn btnPrimary">
                  Klinik Dizini →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBlock({
  title,
  text,
}: {
  title: string;
  text: string;
}): JSX.Element {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.86)",
        borderRadius: 20,
        padding: 14,
      }}
    >
      <div
        style={{
          fontWeight: 950,
          fontSize: 16,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 8,
          color: "rgba(15,23,42,0.72)",
          fontWeight: 750,
          lineHeight: 1.75,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function CorporateInformation(): JSX.Element {
  return (
    <div
      style={{
        border: "1px solid rgba(79,70,229,0.16)",
        background:
          "linear-gradient(135deg, rgba(238,242,255,0.92), rgba(255,255,255,0.88))",
        borderRadius: 20,
        padding: 16,
      }}
    >
      <div
        style={{
          fontWeight: 950,
          fontSize: 17,
        }}
      >
        Kurumsal Bilgiler
      </div>

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gap: 7,
          color: "rgba(15,23,42,0.74)",
          fontWeight: 750,
          lineHeight: 1.7,
        }}
      >
        <CorporateRow
          label="İşletme sahibi"
          value="Ferhat Menekşe"
        />

        <CorporateRow
          label="Vergi dairesi"
          value="5 Ocak Vergi Dairesi"
        />

        <CorporateRow
          label="Vergi numarası"
          value="6150625779"
        />

        <CorporateRow
          label="Adres"
          value="Dumlupınar Mahallesi, 38007 Sokak No:4, Seyhan / Adana"
        />

        <CorporateRow
          label="Telefon"
          value={
            <a
              href="tel:+905319171739"
              style={{
                color: "inherit",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              0531 917 17 39
            </a>
          }
        />

        <CorporateRow
          label="E-posta"
          value={
            <a
              href="mailto:ferhatmenekse945@gmail.com"
              style={{
                color: "inherit",
                fontWeight: 900,
                textDecoration: "none",
                overflowWrap: "anywhere",
              }}
            >
              ferhatmenekse945@gmail.com
            </a>
          }
        />

        <CorporateRow
          label="İnternet adresi"
          value={
            <a
              href="https://www.disfiyat360.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "inherit",
                fontWeight: 900,
                textDecoration: "none",
                overflowWrap: "anywhere",
              }}
            >
              www.disfiyat360.com
            </a>
          }
        />

        <CorporateRow
          label="Hizmet modeli"
          value="Diş kliniklerine yönelik B2B dijital platform, kredi paketi ve Premium üyelik hizmetleri"
        />
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: "1px solid rgba(15,23,42,0.08)",
          color: "rgba(15,23,42,0.62)",
          fontSize: 12,
          fontWeight: 750,
          lineHeight: 1.7,
        }}
      >
        DişFiyat360 sağlık hizmeti sunmaz. Platformda yer alan kliniklerin
        sunduğu muayene, teşhis, tedavi, fiyatlandırma ve diğer sağlık
        hizmetleri ilgili kliniklerin sorumluluğundadır.
      </div>
    </div>
  );
}

function CorporateRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}): JSX.Element {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(130px, 170px) minmax(0, 1fr)",
        gap: 10,
        alignItems: "start",
      }}
    >
      <span
        style={{
          color: "rgba(15,23,42,0.58)",
          fontWeight: 850,
        }}
      >
        {label}:
      </span>

      <strong
        style={{
          color: "rgba(15,23,42,0.88)",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </strong>
    </div>
  );
}