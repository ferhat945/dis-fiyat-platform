"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useState,
} from "react";

type MenuItem = {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
  exact?: boolean;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "GENEL",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        description: "Genel bakış",
        exact: true,
        icon: <DashboardIcon />,
      },
      {
        href: "/admin/leads",
        label: "Leadler",
        description: "Lead yönetimi",
        icon: <LeadIcon />,
      },
      {
        href: "/admin/clinics",
        label: "Klinikler",
        description: "Klinik hesapları",
        icon: <ClinicIcon />,
      },
    ],
  },
  {
    label: "YÖNETİM",
    items: [
      {
        href: "/admin/coverages",
        label: "Coverage",
        description: "Şehir ve hizmetler",
        icon: <CoverageIcon />,
      },
      {
        href: "/admin/subscriptions",
        label: "Abonelik",
        description: "Paket ve kotalar",
        icon: <SubscriptionIcon />,
      },
      {
        href: "/admin/assignments",
        label: "Atamalar",
        description: "Lead hareketleri",
        icon: <AssignmentIcon />,
      },
      {
        href: "/admin/odemeler",
        label: "Ödemeler",
        description: "Tahsilat kayıtları",
        icon: <PaymentIcon />,
      },
    ],
  },
  {
    label: "İÇERİK & ANALİZ",
    items: [
      {
        href: "/admin/blog",
        label: "Blog",
        description: "İçerik yönetimi",
        icon: <BlogIcon />,
      },
      {
        href: "/admin/reports",
        label: "Raporlar",
        description: "Performans özeti",
        icon: <ReportIcon />,
      },
      {
        href: "/admin/logs",
        label: "Dağıtım Logları",
        description: "Sistem hareketleri",
        icon: <LogIcon />,
      },
    ],
  },
];

function isActivePath(
  pathname: string,
  item: MenuItem
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}

function getPageInfo(pathname: string): {
  title: string;
  description: string;
} {
  if (pathname === "/admin") {
    return {
      title: "Dashboard",
      description:
        "DişFiyat360 yönetim merkezine hoş geldiniz.",
    };
  }

  if (pathname.startsWith("/admin/clinics")) {
    return {
      title: "Klinikler",
      description:
        "Klinik hesaplarını ve durumlarını yönetin.",
    };
  }

  if (pathname.startsWith("/admin/leads")) {
    return {
      title: "Leadler",
      description:
        "Hasta taleplerini ve lead hareketlerini takip edin.",
    };
  }

  if (pathname.startsWith("/admin/coverages")) {
    return {
      title: "Coverage",
      description:
        "Kliniklerin şehir ve hizmet kapsamlarını yönetin.",
    };
  }

  if (pathname.startsWith("/admin/subscriptions")) {
    return {
      title: "Abonelik",
      description:
        "Abonelik ve kota kayıtlarını yönetin.",
    };
  }

  if (pathname.startsWith("/admin/assignments")) {
    return {
      title: "Atamalar",
      description:
        "Lead ve klinik eşleşmelerini inceleyin.",
    };
  }

  if (pathname.startsWith("/admin/odemeler")) {
    return {
      title: "Ödemeler",
      description:
        "Ödeme, teslimat ve tahsilat kayıtlarını takip edin.",
    };
  }

  if (pathname.startsWith("/admin/blog")) {
    return {
      title: "Blog",
      description:
        "SEO içeriklerini oluşturun ve yönetin.",
    };
  }

  if (pathname.startsWith("/admin/reports")) {
    return {
      title: "Raporlar",
      description:
        "Platform performansını ve temel metrikleri inceleyin.",
    };
  }

  if (pathname.startsWith("/admin/logs")) {
    return {
      title: "Dağıtım Logları",
      description:
        "Lead dağıtım ve sistem kayıtlarını inceleyin.",
    };
  }

  return {
    title: "Yönetim Merkezi",
    description: "DişFiyat360 Admin Paneli",
  };
}

export default function AdminShell({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState<boolean>(false);

  function openMobileMenu(): void {
    setMobileOpen(true);
  }

  function closeMobileMenu(): void {
    setMobileOpen(false);
  }


  const pageInfo = getPageInfo(pathname);

  if (pathname === "/admin/login") {
    return (
      <div className="adminStandalone">
        {children}
      </div>
    );
  }

  return (
    <div className="adminApp">
      <aside
        className={
          mobileOpen
            ? "adminSidebar isOpen"
            : "adminSidebar"
        }
      >
        <div className="adminSidebarInner">
          <div className="adminBrand">
            <Link
              href="/admin"
              className="adminBrandLink"
            >
              <div className="adminBrandMark">
                D
              </div>

              <div className="adminBrandText">
                <strong>DişFiyat360</strong>
                <span>Yönetim Merkezi</span>
              </div>
            </Link>

            <button
              type="button"
              className="adminSidebarClose"
              aria-label="Menüyü kapat"
              onClick={closeMobileMenu}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="adminSidebarStatus">
            <span className="adminStatusDot" />

            <div>
              <strong>Sistem aktif</strong>
              <span>Admin operasyon merkezi</span>
            </div>
          </div>

          <nav className="adminNavigation">
            {menuGroups.map((group) => (
              <div
                className="adminNavGroup"
                key={group.label}
              >
                <div className="adminNavGroupTitle">
                  {group.label}
                </div>

                <div className="adminNavList">
                  {group.items.map((item) => {
                    const active = isActivePath(
                      pathname,
                      item
                    );

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={
                          active
                            ? "adminNavItem isActive"
                            : "adminNavItem"
                        }
                      >
                        <span className="adminNavIcon">
                          {item.icon}
                        </span>

                        <span className="adminNavContent">
                          <strong>
                            {item.label}
                          </strong>

                          <small>
                            {item.description}
                          </small>
                        </span>

                        <span className="adminNavArrow">
                          <ChevronIcon />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="adminSidebarFooter">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="adminVisitSite"
            >
              <span className="adminVisitIcon">
                <GlobeIcon />
              </span>

              <span>
                <strong>Siteyi Gör</strong>
                <small>disfiyat360.com</small>
              </span>

              <ExternalIcon />
            </Link>

            <form
              action="/api/admin/logout"
              method="post"
            >
              <button
                type="submit"
                className="adminLogoutButton"
              >
                <LogoutIcon />
                <span>Güvenli Çıkış</span>
              </button>
            </form>

            <div className="adminSidebarVersion">
              DişFiyat360 Admin
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Menüyü kapat"
          className="adminSidebarOverlay"
          onClick={closeMobileMenu}
        />
      ) : null}

      <div className="adminMain">
        <header className="adminTopbar">
          <div className="adminTopbarLeft">
            <button
              type="button"
              className="adminMenuButton"
              aria-label="Menüyü aç"
              onClick={openMobileMenu}
            >
              <MenuIcon />
            </button>

            <div className="adminTopbarTitle">
              <div className="adminTopbarBreadcrumb">
                DişFiyat360
                <span>/</span>
                Yönetim
              </div>

              <strong>{pageInfo.title}</strong>
            </div>
          </div>

          <div className="adminTopbarRight">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="adminTopbarSiteButton"
            >
              <GlobeIcon />
              <span>Siteyi Gör</span>
            </Link>

            <div className="adminAccount">
              <div className="adminAccountAvatar">
                A
              </div>

              <div className="adminAccountText">
                <strong>Admin</strong>
                <span>Yönetici</span>
              </div>
            </div>
          </div>
        </header>

        <main className="adminContent">
          <div className="adminContentHeader">
            <div>
              <h1>{pageInfo.title}</h1>
              <p>{pageInfo.description}</p>
            </div>

            <div className="adminContentHeaderBadge">
              <span className="adminStatusDot" />
              Canlı Sistem
            </div>
          </div>

          <div className="adminPageContent">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Svg({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function DashboardIcon(): JSX.Element {
  return (
    <Svg>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </Svg>
  );
}

function LeadIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <circle cx="12" cy="12" r="8" />
    </Svg>
  );
}

function ClinicIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M16 9h2a2 2 0 0 1 2 2v10" />
      <path d="M8 7h4" />
      <path d="M10 5v4" />
      <path d="M8 13h1" />
      <path d="M12 13h1" />
      <path d="M8 17h1" />
      <path d="M12 17h1" />
      <path d="M3 21h18" />
    </Svg>
  );
}

function CoverageIcon(): JSX.Element {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </Svg>
  );
}

function SubscriptionIcon(): JSX.Element {
  return (
    <Svg>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 10h18" />
      <path d="M7 15h3" />
    </Svg>
  );
}

function AssignmentIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="m3 6 1 1 2-2" />
      <path d="m3 12 1 1 2-2" />
      <path d="m3 18 1 1 2-2" />
    </Svg>
  );
}

function PaymentIcon(): JSX.Element {
  return (
    <Svg>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </Svg>
  );
}

function BlogIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M4 19.5V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v15.5" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v5H6.5A2.5 2.5 0 0 1 4 19.5Z" />
      <path d="M8 7h7" />
      <path d="M8 11h6" />
    </Svg>
  );
}

function ReportIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </Svg>
  );
}

function LogIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </Svg>
  );
}

function GlobeIcon(): JSX.Element {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </Svg>
  );
}

function LogoutIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </Svg>
  );
}

function MenuIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Svg>
  );
}

function CloseIcon(): JSX.Element {
  return (
    <Svg>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </Svg>
  );
}

function ChevronIcon(): JSX.Element {
  return (
    <Svg>
      <path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

function ExternalIcon(): JSX.Element {
  return (
    <Svg>
      <path d="M15 3h6v6" />
      <path d="m10 14 11-11" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Svg>
  );
}