"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ApiOk = { ok: true };
type ApiFail = { ok: false; code?: string };

function normalizeSlug(v: string): string {
  return (v ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]+/gu, "");
}

function titleTR(slug: string): string {
  const s = normalizeSlug(slug).replace(/-/g, " ");
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
    .join(" ");
}

function serviceLabel(slug: string): string {
  const s = normalizeSlug(slug);
  const map: Record<string, string> = {
    implant: "İmplant",
    zirkonyum: "Zirkonyum Kaplama",
    lamina: "Lamina (Yaprak Porselen)",
    "dis-beyazlatma": "Diş Beyazlatma",
    "kanal-tedavisi": "Kanal Tedavisi",
    "dis-tasi-temizligi": "Diş Taşı Temizliği",
    dolgu: "Dolgu",
    kaplama: "Kaplama",
    ortodonti: "Ortodonti (Tel / Şeffaf Plak)",
  };
  return map[s] ?? titleTR(s);
}

function cityLabel(slug: string): string {
  const s = normalizeSlug(slug);
  const map: Record<string, string> = {
    istanbul: "İstanbul",
    ankara: "Ankara",
    izmir: "İzmir",
    bursa: "Bursa",
    antalya: "Antalya",
  };
  return map[s] ?? titleTR(s);
}

export default function TeklifAlPage(): JSX.Element {
  const sp = useSearchParams();

  const city = useMemo(() => normalizeSlug(sp.get("city") ?? ""), [sp]);
  const service = useMemo(() => normalizeSlug(sp.get("service") ?? ""), [sp]);

  const cityName = city ? cityLabel(city) : "Şehir seç";
  const serviceName = service ? serviceLabel(service) : "İşlem seç";

  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [when, setWhen] = useState<string>("hemen");
  const [kvkkOk, setKvkkOk] = useState<boolean>(false);

  // honeypot (spam)
  const [website, setWebsite] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setDone(false);

    if (loading) return;

    const name = fullName.trim();
    const ph = phone.trim();

    if (!city || !service) {
      setError("Lütfen önce şehir ve işlem seç (şehir/hizmet sayfasından gel).");
      return;
    }
    if (name.length < 2) {
      setError("Ad Soyad en az 2 karakter olmalı.");
      return;
    }
    if (ph.length < 8) {
      setError("Telefon numarası eksik görünüyor.");
      return;
    }
    if (!kvkkOk) {
      setError("Devam etmek için KVKK onayı zorunludur.");
      return;
    }

    // honeypot doluysa sessizce “ok” gibi davran (bot)
    if (website.trim().length > 0) {
      setDone(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: name,
        phone: ph,
        city,
        service,
        when,
        kvkkOk: true,
        website, // honeypot
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json().catch(() => null)) as ApiOk | ApiFail | null;

      if (!res.ok || !json || (json as ApiFail).ok === false) {
        const code = (json as ApiFail | null)?.code ?? "FORM_SUBMIT_FAILED";
        setError(`Gönderilemedi. (${code})`);
        return;
      }

      setDone(true);
      setFullName("");
      setPhone("");
      setWhen("hemen");
      setKvkkOk(false);
      setWebsite("");
    } catch {
      setError("Ağ hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="offer">
      <div className="container offerGrid">
        {/* LEFT */}
        <section className="offerInfo">
          <div className="offerKicker">Teklif Al</div>
          <h1 className="offerTitle">Şimdi teklif al, klinikler seni arasın</h1>
          <p className="offerDesc">
            30 saniyede formu doldur. KVKK onaylıdır. <strong>Kesin fiyat muayene sonrası netleşir.</strong>
          </p>

          <div className="offerMeta">
            <div className="metaItem">
              <div className="metaLabel">Şehir</div>
              <div className="metaValue">{cityName}</div>
            </div>
            <div className="metaItem">
              <div className="metaLabel">İşlem</div>
              <div className="metaValue">{serviceName}</div>
            </div>
          </div>

          <div className="offerLinks">
            <Link className="btn btnSoft" href="/sehir">
              Şehirleri Gör
            </Link>
            <Link className="btn btnGhost" href="/hizmetler">
              Hizmetler
            </Link>
            <Link className="btn btnGhost" href="/kvkk">
              KVKK Metni
            </Link>
          </div>

          <div className="offerNote">
            Not: Bu form bilgilendirme amaçlıdır; tıbbi teşhis/tavsiye değildir. Kesin fiyat muayene sonrası belirlenir.
          </div>
        </section>

        {/* RIGHT */}
        <section className="offerCard">
          <div className="offerCardHead">
            <div className="offerCardTitle">Form</div>
            <div className="offerCardSub">Ad, telefon, ne zaman bilgisi.</div>
          </div>

          {done && (
            <div className="alertOk">
              ✅ Başarılı! Bilgilerin iletildi. Uygun klinikler seninle iletişime geçecek.
            </div>
          )}

          {error && <div className="alertErr">⚠️ {error}</div>}

          <form onSubmit={submit} className="form">
            {/* Honeypot */}
            <div className="hp">
              <label>Website</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} autoComplete="off" />
            </div>

            <div className="field">
              <label>Ad Soyad</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ad Soyad"
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label>Telefon</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xx xxx xx xx"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            <div className="field">
              <label>Ne zaman düşünüyorsunuz?</label>
              <select value={when} onChange={(e) => setWhen(e.target.value)}>
                <option value="hemen">Hemen</option>
                <option value="1-3gun">1–3 gün</option>
                <option value="1hafta">1 hafta</option>
                <option value="1ay">1 ay</option>
                <option value="fark-etmez">Fark etmez</option>
              </select>
            </div>

            <label className="kvkkRow">
              <input type="checkbox" checked={kvkkOk} onChange={(e) => setKvkkOk(e.target.checked)} />
              <span>
                KVKK aydınlatma metnini okudum ve iletişime geçilmesine onay veriyorum.{" "}
                <Link href="/kvkk" className="inlineLink">
                  KVKK metni
                </Link>
              </span>
            </label>

            <button className="btn btnPrimary btnBlock" type="submit" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Gönder"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
