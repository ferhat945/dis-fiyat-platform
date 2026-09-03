import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";

export const dynamic = "force-dynamic";

function startOfTodayUTC(): Date {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
}

function daysAgoUTC(days: number): Date {
  const d = startOfTodayUTC();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function startOfTodayUTCFor(d: Date): Date {
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
    ),
  );
}

function clamp(
  n: number,
  min: number,
  max: number,
): number {
  return Math.max(min, Math.min(max, n));
}

function maxOf(arr: number[]): number {
  let m = 0;

  for (const x of arr) {
    m = Math.max(m, x);
  }

  return m;
}

function fmtDayTR(d: Date): string {
  return new Date(d).toLocaleDateString(
    "tr-TR",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
    },
  );
}

export default async function PanelIstatistikPage(): Promise<JSX.Element> {
  const session = await requireClinic();

  const today = startOfTodayUTC();
  const last7Start = daysAgoUTC(6);

  /*
   * Mevcut veri sorguları korunuyor.
   */
  const [
    todayRow,
    last7Rows,
    totalAgg,
  ] = await Promise.all([
    prisma.clinicPageView.findUnique({
      where: {
        clinicId_day: {
          clinicId: session.clinicId,
          day: today,
        },
      },
      select: {
        count: true,
      },
    }),

    prisma.clinicPageView.findMany({
      where: {
        clinicId: session.clinicId,
        day: {
          gte: last7Start,
          lte: today,
        },
      },
      select: {
        day: true,
        count: true,
      },
      orderBy: {
        day: "asc",
      },
    }),

    prisma.clinicPageView.aggregate({
      where: {
        clinicId: session.clinicId,
      },
      _sum: {
        count: true,
      },
    }),
  ]);

  const todayCount =
    todayRow?.count ?? 0;

  const last7Count =
    last7Rows.reduce(
      (acc, row) =>
        acc + row.count,
      0,
    );

  const totalCount =
    totalAgg._sum.count ?? 0;

  /*
   * Eksik günleri sıfır ile doldur.
   */
  const map = new Map<
    string,
    number
  >();

  for (const row of last7Rows) {
    map.set(
      startOfTodayUTCFor(
        row.day,
      ).toISOString(),
      row.count,
    );
  }

  const series: {
    day: Date;
    count: number;
  }[] = [];

  for (
    let i = 6;
    i >= 0;
    i -= 1
  ) {
    const d = daysAgoUTC(i);
    const key = d.toISOString();

    series.push({
      day: d,
      count:
        map.get(key) ?? 0,
    });
  }

  const counts =
    series.map(
      (item) => item.count,
    );

  const peak =
    Math.max(
      1,
      maxOf(counts),
    );

  const realPeak =
    maxOf(counts);

  const avg =
    Math.round(
      last7Count / 7,
    );

  const last =
    series[6]?.count ?? 0;

  const prev =
    series[5]?.count ?? 0;

  const delta =
    last - prev;

  const deltaLabel =
    delta === 0
      ? "Değişim yok"
      : delta > 0
        ? `+${delta} artış`
        : `${delta} azalış`;

  const deltaTone =
    delta > 0
      ? "positive"
      : delta < 0
        ? "negative"
        : "neutral";

  return (
    <main className="analyticsPage">
      <style>{`
        .analyticsPage {
          width: 100%;
          padding: 8px 0 64px;
          color: #151d39;
        }

        .analyticsPage * {
          box-sizing: border-box;
        }

        /* ==========================================
           HERO
        ========================================== */

        .analyticsHero {
          position: relative;
          overflow: hidden;

          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(390px, 510px);

          gap: 32px;

          align-items: center;

          min-height: 245px;

          padding: 38px 42px;

          border:
            1px solid
            rgba(94, 76, 166, 0.08);

          border-radius: 30px;

          background:
            radial-gradient(
              720px 360px at 5% 0%,
              rgba(145, 94, 235, 0.17),
              transparent 65%
            ),
            radial-gradient(
              680px 360px at 100% 40%,
              rgba(44, 169, 235, 0.17),
              transparent 68%
            ),
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f9f7ff 48%,
              #f1faff 100%
            );

          box-shadow:
            0 22px 60px
            rgba(54, 42, 103, 0.065);
        }

        .analyticsHero::before {
          content: "";

          position: absolute;

          width: 360px;
          height: 360px;

          top: -230px;
          left: 34%;

          border-radius: 50%;

          border:
            1px solid
            rgba(125, 84, 226, 0.08);
        }

        .analyticsHero::after {
          content: "";

          position: absolute;

          width: 220px;
          height: 220px;

          right: -70px;
          top: -80px;

          border-radius: 50%;

          background:
            rgba(255,255,255,.16);
        }

        .heroContent {
          position: relative;
          z-index: 2;
        }

        .analyticsKicker {
          width: fit-content;

          display: inline-flex;

          align-items: center;

          gap: 9px;

          min-height: 42px;

          padding: 0 15px;

          border:
            1px solid
            rgba(103, 79, 197, 0.10);

          border-radius: 999px;

          background:
            rgba(255,255,255,.88);

          color: #684bd1;

          font-size: 14px;

          font-weight: 900;

          box-shadow:
            0 8px 22px
            rgba(62, 48, 120, 0.045);
        }

        .analyticsTitle {
          margin:
            18px
            0
            0;

          color: #101831;

          font-size:
            clamp(
              44px,
              4vw,
              62px
            );

          line-height: .98;

          letter-spacing: -.05em;

          font-weight: 950;
        }

        .analyticsDescription {
          max-width: 660px;

          margin:
            19px
            0
            0;

          color: #606981;

          font-size: 18px;

          line-height: 1.65;

          font-weight: 650;
        }

        .heroMetrics {
          position: relative;
          z-index: 2;

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 14px;
        }

        .heroMetric {
          min-height: 145px;

          display: flex;

          align-items: center;

          gap: 16px;

          padding: 20px;

          border:
            1px solid
            rgba(92, 77, 155, .08);

          border-radius: 22px;

          background:
            rgba(255,255,255,.86);

          box-shadow:
            0 14px 35px
            rgba(50, 42, 96, .06);

          backdrop-filter:
            blur(12px);
        }

        .heroMetricIcon {
          width: 62px;
          height: 62px;

          flex: 0 0 62px;

          display: grid;

          place-items: center;

          border-radius: 19px;

          font-size: 28px;
        }

        .heroMetricPurple {
          background:
            linear-gradient(
              135deg,
              rgba(124, 79, 237, .16),
              rgba(165, 85, 247, .10)
            );
        }

        .heroMetricGreen {
          background:
            linear-gradient(
              135deg,
              rgba(16, 185, 129, .15),
              rgba(45, 212, 191, .09)
            );
        }

        .heroMetricLabel {
          color: #5f687e;

          font-size: 14px;

          font-weight: 850;
        }

        .heroMetricValue {
          margin-top: 5px;

          color: #101831;

          font-size: 27px;

          line-height: 1.05;

          font-weight: 950;

          letter-spacing: -.035em;
        }

        .heroMetricValue.positive {
          color: #0d8b61;
        }

        .heroMetricValue.negative {
          color: #c24b55;
        }

        .heroMetricValue.neutral {
          color: #101831;
        }

        .heroMetricHint {
          margin-top: 7px;

          color: #8a90a0;

          font-size: 12px;

          font-weight: 700;
        }

        /* ==========================================
           MAIN STAT CARDS
        ========================================== */

        .statGrid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0,1fr)
            );

          gap: 16px;

          margin-top: 18px;
        }

        .statCard {
          position: relative;

          overflow: hidden;

          min-height: 160px;

          display: flex;

          align-items: center;

          gap: 21px;

          padding: 24px;

          border:
            1px solid
            rgba(91, 75, 159, .08);

          border-radius: 24px;

          background:
            rgba(255,255,255,.93);

          box-shadow:
            0 15px 38px
            rgba(54, 42, 103, .055);
        }

        .statCard.primary {
          border-color:
            rgba(124, 58, 237, .14);

          background:
            radial-gradient(
              420px 200px at 0% 0%,
              rgba(124,58,237,.13),
              transparent 72%
            ),
            rgba(255,255,255,.94);
        }

        .statCard.primary::before {
          content: "";

          position: absolute;

          top: 0;
          bottom: 0;
          left: 0;

          width: 5px;

          background:
            linear-gradient(
              #8052ed,
              #6848e7
            );
        }

        .statIcon {
          width: 74px;
          height: 74px;

          flex: 0 0 74px;

          display: grid;

          place-items: center;

          border-radius: 23px;

          font-size: 31px;
        }

        .todayIcon {
          background:
            linear-gradient(
              135deg,
              rgba(126, 80, 236, .17),
              rgba(169, 91, 242, .10)
            );
        }

        .weekIcon {
          background:
            linear-gradient(
              135deg,
              rgba(50, 135, 240, .16),
              rgba(56, 189, 248, .10)
            );
        }

        .totalIcon {
          background:
            linear-gradient(
              135deg,
              rgba(16, 185, 129, .15),
              rgba(52, 211, 153, .09)
            );
        }

        .statLabel {
          color: #4c566d;

          font-size: 17px;

          font-weight: 900;
        }

        .statValue {
          margin-top: 7px;

          color: #111936;

          font-size: 40px;

          line-height: 1;

          font-weight: 950;

          letter-spacing: -.04em;
        }

        .statHint {
          margin-top: 8px;

          color: #7e8597;

          font-size: 14px;

          line-height: 1.45;

          font-weight: 700;
        }

        /* ==========================================
           CHART CARD
        ========================================== */

        .trendCard {
          margin-top: 18px;

          overflow: hidden;

          border:
            1px solid
            rgba(91, 75, 159, .08);

          border-radius: 27px;

          background:
            rgba(255,255,255,.95);

          box-shadow:
            0 17px 45px
            rgba(54, 42, 103, .055);
        }

        .trendHeader {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          padding: 26px 28px;

          border-bottom:
            1px solid
            rgba(91,75,159,.065);
        }

        .trendTitleGroup {
          display: flex;

          align-items: center;

          gap: 15px;
        }

        .trendIcon {
          width: 57px;
          height: 57px;

          flex: 0 0 57px;

          display: grid;

          place-items: center;

          border-radius: 17px;

          background:
            linear-gradient(
              135deg,
              rgba(124, 79, 237, .16),
              rgba(165, 85, 247, .10)
            );

          font-size: 25px;
        }

        .trendTitle {
          margin: 0;

          color: #18213e;

          font-size: 24px;

          font-weight: 950;

          letter-spacing: -.025em;
        }

        .trendMeta {
          margin-top: 6px;

          color: #7d8497;

          font-size: 13px;

          font-weight: 750;
        }

        .trendBadges {
          display: flex;

          align-items: center;

          gap: 10px;

          flex-wrap: wrap;
        }

        .trendBadge {
          min-height: 42px;

          display: inline-flex;

          align-items: center;

          gap: 7px;

          padding: 0 13px;

          border:
            1px solid
            rgba(110, 82, 211, .13);

          border-radius: 13px;

          background:
            rgba(249,247,255,.86);

          color: #6149c2;

          font-size: 12px;

          font-weight: 900;
        }

        .trendBadge.success {
          border-color:
            rgba(16,185,129,.14);

          background:
            rgba(236,253,245,.86);

          color: #16805d;
        }

        /* ==========================================
           GRAPH
        ========================================== */

        .chartArea {
          position: relative;

          min-height: 330px;

          padding:
            34px
            30px
            28px;

          background:
            linear-gradient(
              180deg,
              rgba(252,252,255,.55),
              rgba(255,255,255,.98)
            );
        }

        .chartGrid {
          position: absolute;

          left: 30px;
          right: 30px;

          top: 50px;
          bottom: 77px;

          display: flex;

          flex-direction: column;

          justify-content: space-between;

          pointer-events: none;
        }

        .chartGridLine {
          width: 100%;

          border-top:
            1px dashed
            rgba(93, 101, 127, .14);
        }

        .barsGrid {
          position: relative;

          z-index: 2;

          height: 255px;

          display: grid;

          grid-template-columns:
            repeat(
              7,
              minmax(0,1fr)
            );

          align-items: end;

          gap: 22px;
        }

        .barItem {
          height: 100%;

          display: flex;

          flex-direction: column;

          justify-content: flex-end;

          align-items: center;

          min-width: 0;
        }

        .barValue {
          margin-bottom: 9px;

          color: #6847e4;

          font-size: 14px;

          font-weight: 950;
        }

        .barTrack {
          position: relative;

          width: min(76px, 70%);

          height: 178px;

          display: flex;

          align-items: flex-end;

          border-radius:
            15px
            15px
            7px
            7px;

          background:
            linear-gradient(
              180deg,
              rgba(245,243,252,.46),
              rgba(245,243,252,.10)
            );
        }

        .barFill {
          width: 100%;

          min-height: 5px;

          border-radius:
            12px
            12px
            5px
            5px;

          background:
            linear-gradient(
              180deg,
              #8052ee,
              #6549e4
            );

          box-shadow:
            0 8px 18px
            rgba(104,72,225,.17);

          transition:
            height .2s ease;
        }

        .barDate {
          min-height: 44px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-top: 12px;

          color: #6e768c;

          text-align: center;

          font-size: 12px;

          line-height: 1.3;

          font-weight: 750;
        }

        /* ==========================================
           TIP
        ========================================== */

        .analyticsTip {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          margin-top: 18px;

          padding: 20px 24px;

          border:
            1px solid
            rgba(234, 171, 76, .15);

          border-radius: 22px;

          background:
            linear-gradient(
              100deg,
              rgba(255,250,240,.98),
              rgba(255,255,255,.96)
            );

          box-shadow:
            0 12px 32px
            rgba(84, 65, 28, .035);
        }

        .tipContent {
          display: flex;

          align-items: center;

          gap: 16px;
        }

        .tipIcon {
          width: 57px;
          height: 57px;

          flex: 0 0 57px;

          display: grid;

          place-items: center;

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              #ffd17d,
              #ffb84c
            );

          font-size: 26px;

          box-shadow:
            0 10px 24px
            rgba(230, 154, 45, .16);
        }

        .tipText {
          color: #3e465e;

          font-size: 15px;

          line-height: 1.55;

          font-weight: 700;
        }

        .tipText strong {
          color: #17203c;

          font-size: 16px;

          font-weight: 950;
        }

        .clinicBadge {
          min-height: 43px;

          display: inline-flex;

          align-items: center;

          padding: 0 15px;

          border:
            1px solid
            rgba(156, 126, 73, .12);

          border-radius: 999px;

          background:
            rgba(255,255,255,.82);

          color: #565e72;

          font-size: 13px;

          font-weight: 850;

          white-space: nowrap;
        }

        /* ==========================================
           RESPONSIVE
        ========================================== */

        @media (min-width: 1500px) {
          .analyticsHero {
            min-height: 265px;

            padding: 43px 48px;
          }

          .analyticsDescription {
            font-size: 19px;
          }

          .heroMetricLabel {
            font-size: 15px;
          }

          .heroMetricValue {
            font-size: 30px;
          }

          .statCard {
            min-height: 174px;
          }

          .statLabel {
            font-size: 18px;
          }

          .statValue {
            font-size: 44px;
          }

          .statHint {
            font-size: 15px;
          }

          .trendTitle {
            font-size: 26px;
          }

          .chartArea {
            min-height: 355px;
          }
        }

        @media (max-width: 1100px) {
          .analyticsHero {
            grid-template-columns: 1fr;
          }

          .heroMetrics {
            max-width: 650px;
          }

          .statGrid {
            grid-template-columns: 1fr;
          }

          .statCard {
            min-height: 135px;
          }
        }

        @media (max-width: 760px) {
          .analyticsPage {
            padding-top: 0;
          }

          .analyticsHero {
            min-height: auto;

            padding: 25px 20px;

            border-radius: 23px;
          }

          .analyticsTitle {
            font-size: 42px;
          }

          .analyticsDescription {
            font-size: 16px;
          }

          .heroMetrics {
            grid-template-columns: 1fr;
          }

          .heroMetric {
            min-height: 115px;
          }

          .trendHeader {
            align-items: flex-start;

            flex-direction: column;

            padding: 21px 18px;
          }

          .trendBadges {
            width: 100%;
          }

          .chartArea {
            overflow-x: auto;

            padding:
              25px
              18px
              20px;
          }

          .chartGrid {
            left: 18px;
            right: 18px;
          }

          .barsGrid {
            min-width: 680px;
          }

          .analyticsTip {
            align-items: flex-start;

            flex-direction: column;

            padding: 18px;
          }
        }

        @media (max-width: 520px) {
          .analyticsTitle {
            font-size: 37px;
          }

          .analyticsKicker {
            font-size: 13px;
          }

          .statCard {
            align-items: flex-start;

            padding: 20px;
          }

          .statIcon {
            width: 62px;
            height: 62px;

            flex-basis: 62px;
          }

          .statValue {
            font-size: 36px;
          }

          .tipContent {
            align-items: flex-start;
          }
        }
      `}</style>

      {/* HERO */}

      <section className="analyticsHero">
        <div className="heroContent">
          <div className="analyticsKicker">
            📊 Görüntülenme Analitiği
          </div>

          <h1 className="analyticsTitle">
            İstatistikler
          </h1>

          <p className="analyticsDescription">
            Klinik profilinin görüntülenme
            performansını takip et. Günlük
            hareketleri ve son 7 günlük
            değişimi tek ekrandan incele.
          </p>
        </div>

        <div className="heroMetrics">
          <article className="heroMetric">
            <div className="heroMetricIcon heroMetricPurple">
              📈
            </div>

            <div>
              <div className="heroMetricLabel">
                Ortalama (7g)
              </div>

              <div className="heroMetricValue">
                {avg}
              </div>

              <div className="heroMetricHint">
                Günlük ortalama
              </div>
            </div>
          </article>

          <article className="heroMetric">
            <div className="heroMetricIcon heroMetricGreen">
              ↕
            </div>

            <div>
              <div className="heroMetricLabel">
                Dün → Bugün
              </div>

              <div
                className={`heroMetricValue ${deltaTone}`}
              >
                {deltaLabel}
              </div>

              <div className="heroMetricHint">
                Son 2 gün
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ANA İSTATİSTİKLER */}

      <section className="statGrid">
        <StatCard
          icon="▣"
          iconClass="todayIcon"
          title="Bugün"
          value={todayCount}
          hint="Bugünkü görüntülenme"
          primary
        />

        <StatCard
          icon="▣"
          iconClass="weekIcon"
          title="Son 7 Gün"
          value={last7Count}
          hint="Bugün dahil toplam"
        />

        <StatCard
          icon="▰"
          iconClass="totalIcon"
          title="Toplam"
          value={totalCount}
          hint="Tüm zamanlar"
        />
      </section>

      {/* TREND */}

      <section className="trendCard">
        <header className="trendHeader">
          <div className="trendTitleGroup">
            <div className="trendIcon">
              📈
            </div>

            <div>
              <h2 className="trendTitle">
                Son 7 Gün Trend
              </h2>

              <div className="trendMeta">
                Zirve:{" "}
                <strong>
                  {realPeak}
                </strong>
                {" "}• Ortalama:{" "}
                <strong>
                  {avg}
                </strong>
              </div>
            </div>
          </div>

          <div className="trendBadges">
            <span className="trendBadge">
              📊 Günlük bar
            </span>

            <span className="trendBadge success">
              ✓ Takip açık
            </span>
          </div>
        </header>

        <div className="chartArea">
          <div className="chartGrid">
            <div className="chartGridLine" />
            <div className="chartGridLine" />
            <div className="chartGridLine" />
          </div>

          <div className="barsGrid">
            {series.map((row) => {
              const percentage =
                clamp(
                  Math.round(
                    (row.count /
                      peak) *
                      100,
                  ),
                  0,
                  100,
                );

              /*
               * 0 olduğunda yalnızca taban çizgisi görünür.
               * Veri varsa minimum görünür yükseklik veriyoruz.
               */
              const visualHeight =
                row.count === 0
                  ? 3
                  : Math.max(
                      12,
                      percentage,
                    );

              return (
                <div
                  key={
                    row.day.toISOString()
                  }
                  className="barItem"
                >
                  <div className="barValue">
                    {row.count}
                  </div>

                  <div
                    className="barTrack"
                    aria-label={`${fmtDayTR(
                      row.day,
                    )}: ${
                      row.count
                    } görüntülenme`}
                  >
                    <div
                      className="barFill"
                      style={{
                        height: `${visualHeight}%`,
                      }}
                    />
                  </div>

                  <div className="barDate">
                    {fmtDayTR(
                      row.day,
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* İPUCU */}

      <section className="analyticsTip">
        <div className="tipContent">
          <div className="tipIcon">
            💡
          </div>

          <div className="tipText">
            <strong>
              İpucu:
            </strong>{" "}
            Klinik profilini güncel
            tutmak, hastaların seni
            daha kolay değerlendirmesine
            yardımcı olur. Telefon ve
            Instagram bilgilerini eksiksiz
            tutmanı öneririz.
          </div>
        </div>

        <div className="clinicBadge">
          Klinik:&nbsp;
          <strong>
            {session.name}
          </strong>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  iconClass,
  title,
  value,
  hint,
  primary = false,
}: {
  icon: string;
  iconClass: string;
  title: string;
  value: number;
  hint: string;
  primary?: boolean;
}): JSX.Element {
  return (
    <article
      className={`statCard ${
        primary
          ? "primary"
          : ""
      }`}
    >
      <div
        className={`statIcon ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <div className="statLabel">
          {title}
        </div>

        <div className="statValue">
          {value}
        </div>

        <div className="statHint">
          {hint}
        </div>
      </div>
    </article>
  );
}