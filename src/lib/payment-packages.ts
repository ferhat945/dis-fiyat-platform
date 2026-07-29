export const PAYMENT_PACKAGE_CODES = [
  "credit_5",
  "credit_10",
  "credit_25",
  "premium",
] as const;

export type PaymentPackageCode =
  (typeof PAYMENT_PACKAGE_CODES)[number];

export type PaymentPackageKind =
  | "credit_pack"
  | "premium_membership";

export type PaymentPackageDefinition = {
  code: PaymentPackageCode;
  kind: PaymentPackageKind;

  title: string;
  shortTitle: string;
  description: string;

  amount: number;
  amountKurus: number;
  currency: "TRY";

  credits: number;

  premiumDays: number | null;
  automaticRenewal: boolean;

  serviceType: string;
  durationText: string;
  activationText: string;
  renewalText: string;

  leadDisclaimer: string;
};

const LEAD_DISCLAIMER =
  "Lead kaydı; kesin hasta, randevu, tedavi, satış veya gelir garantisi değildir.";

export const PAYMENT_PACKAGES: Record<
  PaymentPackageCode,
  PaymentPackageDefinition
> = {
  credit_5: {
    code: "credit_5",
    kind: "credit_pack",

    title: "5 Kredi Paketi",
    shortTitle: "5 Kredi",
    description:
      "Başlangıç için hazırlanmış tek seferlik lead görüntüleme paketi.",

    amount: 1500,
    amountKurus: 150000,
    currency: "TRY",

    credits: 5,

    premiumDays: null,
    automaticRenewal: false,

    serviceType:
      "Tek seferlik dijital kredi paketi",
    durationText:
      "Kredi bakiyesi tükenene kadar geçerlidir.",
    activationText:
      "Başarılı ödeme bildiriminin sunucu tarafında doğrulanmasından sonra hesaba tanımlanır.",
    renewalText:
      "Otomatik olarak yenilenmez.",

    leadDisclaimer: LEAD_DISCLAIMER,
  },

  credit_10: {
    code: "credit_10",
    kind: "credit_pack",

    title: "10 Kredi Paketi",
    shortTitle: "10 Kredi",
    description:
      "Dengeli kullanım için hazırlanmış tek seferlik lead görüntüleme paketi.",

    amount: 2000,
    amountKurus: 200000,
    currency: "TRY",

    credits: 10,

    premiumDays: null,
    automaticRenewal: false,

    serviceType:
      "Tek seferlik dijital kredi paketi",
    durationText:
      "Kredi bakiyesi tükenene kadar geçerlidir.",
    activationText:
      "Başarılı ödeme bildiriminin sunucu tarafında doğrulanmasından sonra hesaba tanımlanır.",
    renewalText:
      "Otomatik olarak yenilenmez.",

    leadDisclaimer: LEAD_DISCLAIMER,
  },

  credit_25: {
    code: "credit_25",
    kind: "credit_pack",

    title: "25 Kredi Paketi",
    shortTitle: "25 Kredi",
    description:
      "Yoğun lead kullanan klinikler için hazırlanmış tek seferlik kredi paketi.",

    amount: 4000,
    amountKurus: 400000,
    currency: "TRY",

    credits: 25,

    premiumDays: null,
    automaticRenewal: false,

    serviceType:
      "Tek seferlik dijital kredi paketi",
    durationText:
      "Kredi bakiyesi tükenene kadar geçerlidir.",
    activationText:
      "Başarılı ödeme bildiriminin sunucu tarafında doğrulanmasından sonra hesaba tanımlanır.",
    renewalText:
      "Otomatik olarak yenilenmez.",

    leadDisclaimer: LEAD_DISCLAIMER,
  },

  premium: {
    code: "premium",
    kind: "premium_membership",

    title: "Premium Üyelik",
    shortTitle: "Premium",
    description:
      "30 günlük Premium üyelik ve üyelik başlangıcında tanımlanan 10 kredi.",

    amount: 2500,
    amountKurus: 250000,
    currency: "TRY",

    credits: 10,

    premiumDays: 30,
    automaticRenewal: false,

    serviceType:
      "30 günlük dijital Premium üyelik",
    durationText:
      "Başarılı aktivasyon tarihinden itibaren 30 gün geçerlidir.",
    activationText:
      "Başarılı ödeme bildiriminin sunucu tarafında doğrulanmasından sonra Premium üyelik ve kredi hakkı hesaba tanımlanır.",
    renewalText:
      "Otomatik olarak yenilenmez.",

    leadDisclaimer: LEAD_DISCLAIMER,
  },
};

export function isPaymentPackageCode(
  value: unknown
): value is PaymentPackageCode {
  return (
    typeof value === "string" &&
    PAYMENT_PACKAGE_CODES.includes(
      value as PaymentPackageCode
    )
  );
}

export function getPaymentPackage(
  code: PaymentPackageCode
): PaymentPackageDefinition {
  return PAYMENT_PACKAGES[code];
}

export function formatPaymentAmount(
  amount: number
): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculatePremiumExpiry(
  startedAt: Date,
  premiumDays: number
): Date {
  const expiry = new Date(startedAt);

  expiry.setUTCDate(
    expiry.getUTCDate() + premiumDays
  );

  return expiry;
}