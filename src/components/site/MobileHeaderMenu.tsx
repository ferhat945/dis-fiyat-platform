"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Props = {
  siteName: string;
};

export default function MobileHeaderMenu({ siteName }: Props): React.ReactElement {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  function closeMenu(): void {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  }

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  return (
    <div className="mobileHeaderBar">
      <Link href="/" className="brandPill mobileBrandPill" aria-label="Ana sayfa" onClick={closeMenu}>
        <span className="brandIcon" aria-hidden>
          🦷
        </span>
        {siteName}
      </Link>

      <div className="mobileHeaderActions">
        <Link className="mobileTopCta navCtaPulse" href="/teklif-al" onClick={closeMenu}>
          Teklif Al
        </Link>

        <details className="mobileMenu" ref={detailsRef}>
          <summary className="mobileMenuBtn" aria-label="Menüyü aç">
            ☰
          </summary>

          <div className="mobileMenuPanel">
            <Link className="mobileMenuLink" href="/" onClick={closeMenu}>
              Ana Sayfa
            </Link>
            <Link className="mobileMenuLink" href="/sehir" onClick={closeMenu}>
              Şehirler
            </Link>
            <Link className="mobileMenuLink" href="/hizmetler" onClick={closeMenu}>
              Hizmetler
            </Link>
            <Link className="mobileMenuLink" href="/blog" onClick={closeMenu}>
              Blog
            </Link>
            <Link className="mobileMenuLink" href="/kvkk" onClick={closeMenu}>
              KVKK
            </Link>
            <Link className="mobileMenuLink mobileMenuClinic" href="/login" onClick={closeMenu}>
              Klinik Başvurusu
            </Link>
          </div>
        </details>
      </div>
    </div>
  );
}