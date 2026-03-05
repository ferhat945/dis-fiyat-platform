import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminAssignmentsPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="sectionHead">
          <div className="sectionKicker">Admin</div>
          <h1 className="sectionTitle">Atamalar</h1>
          <p className="sectionDesc">
            Lead’lerin hangi kliniğe atandığını ve dağıtım loglarını buradan izlersin.
          </p>

          <div
            className="ctaRow"
            style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            <Link href="/admin" className="btn btnSoft">Dashboard</Link>
            <Link href="/admin/leads" className="btn btnSoft">Lead’ler</Link>
            <Link href="/admin/clinics" className="btn btnSoft">Klinikler</Link>
          </div>
        </div>

        <div className="cards" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <div className="card">
            <div className="cardIcon">🧾</div>
            <div className="cardBody">
              <div className="cardTitle">Atama listesi</div>
              <div className="cardDesc">Lead → Klinik eşleşmeleri burada görünecek.</div>
            </div>
          </div>

          <div className="card">
            <div className="cardIcon">📊</div>
            <div className="cardBody">
              <div className="cardTitle">Dağıtım logları</div>
              <div className="cardDesc">Neden atandı/atanmadı gibi kayıtlar burada.</div>
            </div>
          </div>

          <div className="card">
            <div className="cardIcon">⚙️</div>
            <div className="cardBody">
              <div className="cardTitle">Kurallar</div>
              <div className="cardDesc">Kota / coverage / dağıtım mantığı izlenebilir.</div>
            </div>
          </div>
        </div>

        <div className="finalCta" style={{ marginTop: 16 }}>
          <div>
            <div className="finalTitle">Bir sonraki adım</div>
            <div className="finalDesc">İstersen buraya gerçek tablo + filtre ekleyelim.</div>
          </div>
          <Link href="/admin/leads" className="btn btnPrimary">Lead’lere git</Link>
        </div>
      </div>
    </main>
  );
}
