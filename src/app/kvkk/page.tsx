import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "KVKK aydınlatma metni ve iletişim onayı bilgileri.",
  alternates: { canonical: "/kvkk" },
};

export default function KvkkPage(): JSX.Element {
  return (
    <main className="mx-automax-w-[900px] px-4">
      <section className="mt-8 card p-6 md:p-8">
        <h1 className="text-3xl font-black">KVKK Aydınlatma Metni (v1)</h1>

        <p className="mt-4 text-[rgb(var(--subtext))] font-semibold leading-relaxed">
          Bu metin, teklif formu üzerinden paylaştığınız kişisel verilerin işlenmesine ilişkin bilgilendirme amaçlıdır.
          Form gönderimi için “iletişime geçilmesine onay” şarttır.
        </p>

        <div className="mt-6 grid gap-4 text-[rgb(var(--subtext))] font-semibold leading-relaxed">
          <div>
            <div className="font-black text-black">1) İşlenen Veriler</div>
            Ad-soyad, telefon, (opsiyonel) e-posta, talep edilen hizmet ve şehir bilgisi.
          </div>

          <div>
            <div className="font-black text-black">2) Amaç</div>
            Talebinize uygun kliniklerin sizinle iletişime geçebilmesi.
          </div>

          <div>
            <div className="font-black text-black">3) Saklama</div>
            Kayıtlar hizmet kalitesi ve operasyon amacıyla saklanabilir. Kesin süreler ürüne göre güncellenebilir.
          </div>

          <div>
            <div className="font-black text-black">4) Güvenlik</div>
            Spam önleme (honeypot), rate limit ve loglama mekanizmaları kullanılır.
          </div>

          <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))] p-5">
            <div className="font-black text-black">Not</div>
            Bu site bilgilendirme amaçlıdır; tıbbi teşhis/tavsiye değildir. Kesin fiyat muayene sonrası netleşir.
          </div>
        </div>
      </section>

      <div className="h-10" />
    </main>
  );
}
