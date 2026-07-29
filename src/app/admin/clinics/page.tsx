import Link from "next/link";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import AdminClinicsClient from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminClinicsPage(): Promise<JSX.Element> {
  await requireAdmin();

  const clinics =
    await prisma.clinic.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 900,
              margin: 0,
            }}
          >
            Klinikler
          </h1>

          <div
            style={{
              marginTop: 5,
              opacity: 0.7,
              fontWeight: 750,
            }}
          >
            Klinik hesaplarını ve durumlarını
            yönet.
          </div>
        </div>

        <Link
          href="/admin/odemeler"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "10px 14px",
            borderRadius: 12,
            color: "white",
            background: "#111827",
            textDecoration: "none",
            fontWeight: 900,
          }}
        >
          💳 Ödeme Kayıtları →
        </Link>
      </div>

      <AdminClinicsClient
        initialClinics={clinics}
      />
    </div>
  );
}