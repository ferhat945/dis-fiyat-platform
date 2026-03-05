import { prisma } from "@/lib/db";

export async function hasActiveSubscription(clinicId: string): Promise<boolean> {
  const now = new Date();

  const sub = await prisma.subscription.findFirst({
    where: {
      clinicId,
      expiresAt: { gt: now },
      status: { in: ["active", "paid"] }, // sende status nasıl kullanılıyorsa burayı ayarla
    },
    orderBy: { expiresAt: "desc" },
    select: { id: true },
  });

  return Boolean(sub);
}