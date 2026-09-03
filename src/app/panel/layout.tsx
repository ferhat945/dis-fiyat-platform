import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyClinicSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const token =
    (await cookies()).get("clinic_session")?.value ?? "";

  const session = token
    ? await verifyClinicSession(token)
    : null;

  if (!session) {
    return (
      <div className="clinicPanelUnauthorized">
        <div className="clinicPanelUnauthorizedCard">
          <div className="clinicPanelUnauthorizedIcon">
            🔒
          </div>

          <h1>Panel Girişi Gerekli</h1>

          <p>
            Klinik panelini görüntülemek için hesabınıza
            giriş yapmalısınız.
          </p>

          <Link
            href="/login"
            className="clinicPanelUnauthorizedBtn"
          >
            Giriş Yap →
          </Link>
        </div>
      </div>
    );
  }

  const clinic =
    await prisma.clinic.findUnique({
      where: {
        id: session.clinicId,
      },

      select: {
        creditBalance: true,
        isPremium: true,
        premiumExpiresAt: true,
      },
    });

  const now = new Date();

  const isPremiumActive =
    Boolean(
      clinic?.isPremium &&
        clinic.premiumExpiresAt &&
        clinic.premiumExpiresAt.getTime() >
          now.getTime(),
    );

  return (
    <div className="clinicPanelOuter">
      <div className="clinicPanelShell">
        <header className="clinicPanelTop">
          <div className="clinicPanelBrandArea">
            <Link
              href="/panel"
              className="clinicPanelBrand"
            >
              <span className="clinicPanelBrandIcon">
                🦷
              </span>

              <span>
                <strong>DişFiyat360</strong>
                <small>Klinik Paneli</small>
              </span>
            </Link>
          </div>

          <div className="clinicPanelAccountArea">
            <Link
              href="/panel/abonelik"
              className="clinicPanelCreditPill"
            >
              <span>💎</span>
              <strong>
                Kredi: {clinic?.creditBalance ?? 0}
              </strong>
            </Link>

            {isPremiumActive ? (
              <Link
                href="/panel/abonelik"
                className="clinicPanelPremiumPill clinicPanelPremiumPillActive"
              >
                ⭐ Premium
              </Link>
            ) : (
              <Link
                href="/panel/abonelik"
                className="clinicPanelPremiumPill"
              >
                ⭐ Premium Ol
              </Link>
            )}

            <Link
              href="/panel/profil"
              className="clinicPanelClinicName"
            >
              <span className="clinicPanelClinicAvatar">
                🏥
              </span>

              <span className="clinicPanelClinicNameText">
                <strong>{session.name}</strong>
                <small>Klinik Hesabı</small>
              </span>
            </Link>
          </div>
        </header>

        <nav
          className="clinicPanelNav"
          aria-label="Klinik panel menüsü"
        >
          <NavLink
            href="/panel"
            icon="⌂"
          >
            Dashboard
          </NavLink>

          <NavLink
            href="/panel/leadler"
            icon="◉"
          >
            Leadler
          </NavLink>

          <NavLink
            href="/panel/hizmetler"
            icon="✚"
          >
            Hizmetler
          </NavLink>

          <NavLink
            href="/panel/fiyatlar"
            icon="₺"
          >
            Fiyatlar
          </NavLink>

          <NavLink
            href="/panel/profil"
            icon="♙"
          >
            Profil
          </NavLink>

          <NavLink
            href="/panel/abonelik"
            icon="◆"
          >
            Kredi / Premium
          </NavLink>

          <NavLink
            href="/panel/islemler"
            icon="↻"
          >
            İşlem Geçmişi
          </NavLink>

          <NavLink
            href="/panel/istatistik"
            icon="▥"
          >
            İstatistikler
          </NavLink>

          <NavLink
            href="/panel/blog"
            icon="▤"
          >
            Blog
          </NavLink>
        </nav>

        <main className="clinicPanelContent">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <Link
      href={href}
      className="clinicPanelNavLink"
    >
      <span
        className="clinicPanelNavIcon"
        aria-hidden
      >
        {icon}
      </span>

      <span>{children}</span>
    </Link>
  );
}