import { prisma } from "@/lib/db";
import {
  calculatePremiumExpiry,
  getPaymentPackage,
  isPaymentPackageCode,
} from "@/lib/payment-packages";

export type BankTransferDeliveryResult =
  | {
      ok: true;
      alreadyDelivered: boolean;
      paymentLogId: string;
      clinicId: string;
      balanceBefore: number;
      balanceAfter: number;
      deliveredAt: Date;
      premiumStartedAt: Date | null;
      premiumExpiresAt: Date | null;
    }
  | {
      ok: false;
      code:
        | "PAYMENT_NOT_FOUND"
        | "INVALID_PACKAGE"
        | "INVALID_PAYMENT_STATUS"
        | "INVALID_PAYMENT_PROVIDER"
        | "PAYMENT_PACKAGE_MISMATCH";
    };

export async function approveBankTransferAndDeliver(
  paymentLogId: string
): Promise<BankTransferDeliveryResult> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.paymentLog.findUnique({
      where: {
        id: paymentLogId,
      },
      select: {
        id: true,
        clinicId: true,
        packageCode: true,
        kind: true,
        credits: true,
        amount: true,
        currency: true,
        status: true,
        provider: true,
        orderNumber: true,
        deliveredAt: true,
        paidAt: true,
        callbackPayload: true,
        balanceBefore: true,
        balanceAfter: true,
        premiumStartedAt: true,
        premiumExpiresAt: true,

        clinic: {
          select: {
            id: true,
            creditBalance: true,
            isPremium: true,
            premiumStartedAt: true,
            premiumExpiresAt: true,
          },
        },
      },
    });

    if (!payment) {
      return {
        ok: false,
        code: "PAYMENT_NOT_FOUND",
      };
    }

    if (payment.provider !== "bank_transfer") {
      return {
        ok: false,
        code: "INVALID_PAYMENT_PROVIDER",
      };
    }

    if (payment.deliveredAt) {
      return {
        ok: true,
        alreadyDelivered: true,
        paymentLogId: payment.id,
        clinicId: payment.clinicId,
        balanceBefore:
          payment.balanceBefore ??
          payment.clinic.creditBalance,
        balanceAfter:
          payment.balanceAfter ??
          payment.clinic.creditBalance,
        deliveredAt: payment.deliveredAt,
        premiumStartedAt:
          payment.premiumStartedAt,
        premiumExpiresAt:
          payment.premiumExpiresAt,
      };
    }

    if (
      !payment.packageCode ||
      !isPaymentPackageCode(payment.packageCode)
    ) {
      return {
        ok: false,
        code: "INVALID_PACKAGE",
      };
    }

    const selectedPackage = getPaymentPackage(
      payment.packageCode
    );

    if (
      payment.amount !== selectedPackage.amount ||
      payment.currency !== selectedPackage.currency ||
      payment.credits !== selectedPackage.credits ||
      payment.kind !== selectedPackage.kind
    ) {
      return {
        ok: false,
        code: "PAYMENT_PACKAGE_MISMATCH",
      };
    }

    if (
      payment.status !== "awaiting_transfer" &&
      payment.status !== "transfer_notified"
    ) {
      return {
        ok: false,
        code: "INVALID_PAYMENT_STATUS",
      };
    }

    /*
     * Bu siparişi atomik şekilde sahipleniyoruz.
     * Aynı anda iki admin isteği gelse bile yalnızca
     * biri processing_transfer durumuna geçebilir.
     */
    const claim = await tx.paymentLog.updateMany({
      where: {
        id: payment.id,
        provider: "bank_transfer",
        deliveredAt: null,
        status: {
          in: [
            "awaiting_transfer",
            "transfer_notified",
          ],
        },
      },
      data: {
        status: "processing_transfer",
      },
    });

    if (claim.count !== 1) {
      const latest =
        await tx.paymentLog.findUnique({
          where: {
            id: payment.id,
          },
          select: {
            deliveredAt: true,
            balanceBefore: true,
            balanceAfter: true,
            premiumStartedAt: true,
            premiumExpiresAt: true,
            clinicId: true,
          },
        });

      if (latest?.deliveredAt) {
        return {
          ok: true,
          alreadyDelivered: true,
          paymentLogId: payment.id,
          clinicId: latest.clinicId,
          balanceBefore:
            latest.balanceBefore ??
            payment.clinic.creditBalance,
          balanceAfter:
            latest.balanceAfter ??
            payment.clinic.creditBalance,
          deliveredAt: latest.deliveredAt,
          premiumStartedAt:
            latest.premiumStartedAt,
          premiumExpiresAt:
            latest.premiumExpiresAt,
        };
      }

      return {
        ok: false,
        code: "INVALID_PAYMENT_STATUS",
      };
    }

    const deliveredAt = new Date();

    const balanceBefore =
      payment.clinic.creditBalance;

    const balanceAfter =
      balanceBefore + selectedPackage.credits;

    let paymentPremiumStartedAt:
      | Date
      | null = null;

    let paymentPremiumExpiresAt:
      | Date
      | null = null;

    let clinicPremiumStartedAt:
      | Date
      | null
      | undefined = undefined;

    if (
      selectedPackage.kind ===
        "premium_membership" &&
      selectedPackage.premiumDays
    ) {
      paymentPremiumStartedAt = deliveredAt;

      const existingExpiry =
        payment.clinic.premiumExpiresAt;

      const hasActivePremium = Boolean(
        payment.clinic.isPremium &&
          existingExpiry &&
          existingExpiry.getTime() >
            deliveredAt.getTime()
      );

      const expiryBase =
        hasActivePremium && existingExpiry
          ? existingExpiry
          : deliveredAt;

      paymentPremiumExpiresAt =
        calculatePremiumExpiry(
          expiryBase,
          selectedPackage.premiumDays
        );

      clinicPremiumStartedAt =
        hasActivePremium &&
        payment.clinic.premiumStartedAt
          ? payment.clinic.premiumStartedAt
          : deliveredAt;
    }

    await tx.clinic.update({
      where: {
        id: payment.clinicId,
      },
      data: {
        creditBalance: balanceAfter,

        ...(selectedPackage.kind ===
        "premium_membership"
          ? {
              isPremium: true,
              premiumStartedAt:
                clinicPremiumStartedAt,
              premiumExpiresAt:
                paymentPremiumExpiresAt,
              autoRenewPremium: false,
            }
          : {}),
      },
    });

    await tx.creditTransaction.create({
      data: {
        clinicId: payment.clinicId,
        paymentLogId: payment.id,
        amount: selectedPackage.credits,

        type:
          selectedPackage.kind ===
          "premium_membership"
            ? "premium_monthly_credit"
            : "purchase",

        note:
          `${selectedPackage.title} banka transferi ödemesi doğrulandı. ` +
          `${selectedPackage.credits} kredi hesaba tanımlandı.`,

        balanceBefore,
        balanceAfter,
        deliveredAt,
      },
    });

    await tx.paymentLog.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "paid",
        paidAt: deliveredAt,
        callbackVerified: true,

        deliveredAt,
        balanceBefore,
        balanceAfter,

        premiumStartedAt:
          paymentPremiumStartedAt,

        premiumExpiresAt:
          paymentPremiumExpiresAt,

        errorCode: null,
        errorMessage: null,

        callbackPayload: {
          previous:
            payment.callbackPayload ?? null,

          bankTransferApproval: {
            method:
              "manual_bank_account_verification",
            approvedBy: "admin",
            approvedAt:
              deliveredAt.toISOString(),
            orderNumber:
              payment.orderNumber ?? null,
            amount: payment.amount,
            currency: payment.currency,
          },
        },
      },
    });

    return {
      ok: true,
      alreadyDelivered: false,
      paymentLogId: payment.id,
      clinicId: payment.clinicId,
      balanceBefore,
      balanceAfter,
      deliveredAt,
      premiumStartedAt:
        paymentPremiumStartedAt,
      premiumExpiresAt:
        paymentPremiumExpiresAt,
    };
  });
}