"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./AiDentalHero.module.css";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const AI_SESSION_STORAGE_KEY =
  "disfiyat360_ai_dental_analysis_v1";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type UploadStatus =
  | "idle"
  | "ready"
  | "uploading"
  | "completed"
  | "error";

type ImageQuality =
  | "good"
  | "acceptable"
  | "poor";

type DentalAnalysis = {
  suitableImage: boolean;
  imageQuality: ImageQuality;
  visibleObservations: string[];
  suggestedTreatmentCategories: string[];
  summary: string;
  limitations: string[];
  disclaimer: string;
};

type AnalysisApiSuccess = {
  ok: true;
  analysis: DentalAnalysis;
};

type AnalysisApiError = {
  ok: false;
  code?: string;
  message?: string;
};

type AnalysisApiResponse =
  | AnalysisApiSuccess
  | AnalysisApiError;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readApiError(data: unknown): string {
  if (!isRecord(data)) {
    return "Analiz tamamlanamadı. Lütfen tekrar deneyin.";
  }

  const message = data.message;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }

  return "Analiz tamamlanamadı. Lütfen tekrar deneyin.";
}

function imageQualityText(
  quality: ImageQuality,
): string {
  switch (quality) {
    case "good":
      return "Fotoğraf kalitesi iyi";

    case "acceptable":
      return "Fotoğraf kalitesi kabul edilebilir";

    case "poor":
      return "Fotoğraf kalitesi yetersiz";

    default:
      return "Fotoğraf kalitesi değerlendirildi";
  }
}

export default function AiDentalHero(): JSX.Element {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string>("");

  const [status, setStatus] =
    useState<UploadStatus>("idle");

  const [error, setError] =
    useState<string>("");

  const [analysis, setAnalysis] =
    useState<DentalAnalysis | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function openFilePicker(): void {
    inputRef.current?.click();
  }

  function clearSelection(): void {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setStatus("idle");
    setError("");
    setAnalysis(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    try {
      window.sessionStorage.removeItem(
        AI_SESSION_STORAGE_KEY,
      );
    } catch {
      // sessionStorage kullanılamıyorsa işlem devam eder.
    }
  }

  function validateAndSelectFile(
    file: File,
  ): void {
    setError("");
    setAnalysis(null);

    if (!ALLOWED_TYPES.has(file.type)) {
      setStatus("error");
      setError(
        "Lütfen JPG, PNG veya WebP formatında bir fotoğraf yükleyin.",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatus("error");
      setError(
        "Fotoğraf en fazla 8 MB olabilir.",
      );
      return;
    }

    if (file.size === 0) {
      setStatus("error");
      setError(
        "Seçilen fotoğraf geçerli görünmüyor.",
      );
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
    setStatus("ready");
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    validateAndSelectFile(file);
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
  ): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ): void {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    validateAndSelectFile(file);
  }

  async function startAnalysis(): Promise<void> {
    if (
      !selectedFile ||
      status === "uploading"
    ) {
      return;
    }

    setStatus("uploading");
    setError("");
    setAnalysis(null);

    try {
      const formData = new FormData();

      formData.append(
        "image",
        selectedFile,
        selectedFile.name,
      );

      const response = await fetch(
        "/api/ai/dental-analysis",
        {
          method: "POST",
          body: formData,
          cache: "no-store",
        },
      );

      const data: unknown =
        await response.json().catch(() => null);

      if (
        !response.ok ||
        !isRecord(data) ||
        data.ok !== true
      ) {
        throw new Error(readApiError(data));
      }

      const typedData =
        data as AnalysisApiSuccess;

      setAnalysis(typedData.analysis);
      setStatus("completed");

      try {
        window.sessionStorage.setItem(
          AI_SESSION_STORAGE_KEY,
          JSON.stringify({
            analysis: typedData.analysis,
            createdAt: new Date().toISOString(),
          }),
        );
      } catch {
        /*
          Analiz ekranda gösterilmeye devam eder.
          sessionStorage başarısız olursa teklif
          formuna otomatik taşıma yapılamayabilir.
        */
      }
    } catch (caughtError: unknown) {
      setStatus("error");

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Analiz tamamlanamadı. Lütfen tekrar deneyin.",
      );
    }
  }

  function continueToOffer(): void {
    if (!analysis) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        AI_SESSION_STORAGE_KEY,
        JSON.stringify({
          analysis,
          createdAt: new Date().toISOString(),
        }),
      );
    } catch {
      // Teklif sayfasına yönlendirme devam eder.
    }

    router.push("/teklif-al?ai=1");
  }

  return (
    <section
      className={styles.hero}
      aria-labelledby="ai-hero-title"
    >
      <div
        className={styles.backgroundGlowOne}
        aria-hidden
      />

      <div
        className={styles.backgroundGlowTwo}
        aria-hidden
      />

      <div className={styles.grid}>
        <div className={styles.content}>
          <div className={styles.kicker}>
            <span
              className={styles.kickerIcon}
              aria-hidden
            >
              ✨
            </span>

            Türkiye&apos;nin AI destekli diş ön
            değerlendirme platformu
          </div>

          <h1
            id="ai-hero-title"
            className={styles.title}
          >
            Dişinizin Fotoğrafını Yükleyin,
            <span>
              {" "}
              AI Ön Değerlendirme Alın.
            </span>
          </h1>

          <p className={styles.description}>
            Diş fotoğrafınızı yükleyin. Yapay
            zekâ, fotoğrafta görülebilen genel
            durumlar hakkında ön değerlendirme
            oluştursun. Ardından uygun kliniklerden
            ücretsiz teklif alın.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={openFilePicker}
            >
              <span aria-hidden>📷</span>
              Diş Fotoğrafınızı Yükleyin
            </button>

            <Link
              href="/teklif-al"
              className={styles.secondaryButton}
            >
              Fotoğraf yüklemeden teklif alın
            </Link>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />

          <div
            className={styles.trustRow}
            aria-label="Hizmet özellikleri"
          >
            <span>✓ Ücretsiz</span>
            <span>✓ Fotoğraf saklanmaz</span>
            <span>✓ KVKK odaklı akış</span>
            <span>✓ Kesin teşhis değildir</span>
          </div>

          <p className={styles.medicalNotice}>
            Ön değerlendirme bilgilendirme
            amaçlıdır. Kesin teşhis ve tedavi planı
            yalnızca diş hekimi muayenesiyle
            belirlenebilir.
          </p>
        </div>

        <div className={styles.phoneArea}>
          <div
            className={styles.phoneGlow}
            aria-hidden
          />

          <div className={styles.phone}>
            <div className={styles.phoneTop}>
              <span
                className={styles.phoneSpeaker}
              />

              <span
                className={styles.phoneCamera}
              />
            </div>

            <div className={styles.phoneScreen}>
              <div className={styles.appHeader}>
                <div className={styles.appLogo}>
                  <span aria-hidden>🦷</span>

                  <div>
                    <strong>DişFiyat360</strong>
                    <small>
                      AI Ön Değerlendirme
                    </small>
                  </div>
                </div>

                <span
                  className={styles.secureBadge}
                >
                  Güvenli
                </span>
              </div>

              {!previewUrl ? (
                <>
                  <div
                    className={styles.uploadArea}
                    role="button"
                    tabIndex={0}
                    onClick={openFilePicker}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        openFilePicker();
                      }
                    }}
                  >
                    <div
                      className={styles.uploadIcon}
                      aria-hidden
                    >
                      📷
                    </div>

                    <strong>
                      Diş fotoğrafınızı yükleyin
                    </strong>

                    <p>
                      Fotoğrafı buraya sürükleyin
                      veya cihazınızdan seçin.
                    </p>

                    <span>
                      JPG, PNG veya WebP · En fazla
                      8 MB
                    </span>
                  </div>

                  <div className={styles.tips}>
                    <div
                      className={styles.tipsTitle}
                    >
                      Daha iyi sonuç için
                    </div>

                    <div
                      className={styles.tipItem}
                    >
                      <span>1</span>
                      Aydınlık bir ortamda çekin
                    </div>

                    <div
                      className={styles.tipItem}
                    >
                      <span>2</span>
                      Dişlerin net görünmesini
                      sağlayın
                    </div>

                    <div
                      className={styles.tipItem}
                    >
                      <span>3</span>
                      Filtre veya düzenleme
                      kullanmayın
                    </div>
                  </div>
                </>
              ) : analysis ? (
                <>
                  <div
                    style={{
                      maxHeight: 455,
                      overflowY: "auto",
                      paddingRight: 3,
                    }}
                  >
                    <div
                      style={{
                        padding: 14,
                        border:
                          "1px solid rgba(91, 77, 190, 0.16)",
                        borderRadius: 18,
                        background: "#ffffff",
                        boxShadow:
                          "0 14px 32px rgba(51, 38, 103, 0.08)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent:
                            "space-between",
                          gap: 10,
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display: "block",
                              color: "#33364c",
                              fontSize: 13,
                              fontWeight: 900,
                            }}
                          >
                            AI ön değerlendirme
                          </strong>

                          <span
                            style={{
                              display: "block",
                              marginTop: 3,
                              color: analysis.suitableImage
                                ? "#23805e"
                                : "#a15d28",
                              fontSize: 9,
                              fontWeight: 800,
                            }}
                          >
                            {imageQualityText(
                              analysis.imageQuality,
                            )}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={
                            styles.removeButton
                          }
                          onClick={clearSelection}
                          aria-label="Analizi ve fotoğrafı kaldır"
                        >
                          ×
                        </button>
                      </div>

                      <p
                        style={{
                          margin: "12px 0 0",
                          color: "#5d6275",
                          fontSize: 10,
                          fontWeight: 650,
                          lineHeight: 1.6,
                        }}
                      >
                        {analysis.summary}
                      </p>

                      {analysis
                        .visibleObservations.length >
                      0 ? (
                        <div
                          style={{
                            marginTop: 13,
                          }}
                        >
                          <strong
                            style={{
                              display: "block",
                              marginBottom: 7,
                              color: "#41445b",
                              fontSize: 10,
                              fontWeight: 900,
                            }}
                          >
                            Fotoğrafta görülebilenler
                          </strong>

                          <div
                            style={{
                              display: "grid",
                              gap: 6,
                            }}
                          >
                            {analysis.visibleObservations.map(
                              (
                                observation,
                                index,
                              ) => (
                                <div
                                  key={`${observation}-${index}`}
                                  style={{
                                    display:
                                      "flex",
                                    gap: 7,
                                    alignItems:
                                      "flex-start",
                                    padding:
                                      "7px 8px",
                                    borderRadius:
                                      10,
                                    background:
                                      "#f7f6ff",
                                    color:
                                      "#666a7d",
                                    fontSize: 9,
                                    lineHeight:
                                      1.45,
                                  }}
                                >
                                  <span
                                    aria-hidden
                                  >
                                    •
                                  </span>

                                  <span>
                                    {
                                      observation
                                    }
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ) : null}

                      {analysis
                        .suggestedTreatmentCategories
                        .length > 0 ? (
                        <div
                          style={{
                            marginTop: 13,
                          }}
                        >
                          <strong
                            style={{
                              display: "block",
                              marginBottom: 7,
                              color: "#41445b",
                              fontSize: 10,
                              fontWeight: 900,
                            }}
                          >
                            Görüşülebilecek hizmet
                            kategorileri
                          </strong>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            {analysis.suggestedTreatmentCategories.map(
                              (
                                category,
                                index,
                              ) => (
                                <span
                                  key={`${category}-${index}`}
                                  style={{
                                    padding:
                                      "6px 8px",
                                    border:
                                      "1px solid rgba(92, 82, 202, 0.12)",
                                    borderRadius:
                                      999,
                                    background:
                                      "#f1efff",
                                    color:
                                      "#5f54ae",
                                    fontSize: 8,
                                    fontWeight:
                                      850,
                                  }}
                                >
                                  {category}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      ) : null}

                      {analysis.limitations.length >
                      0 ? (
                        <div
                          style={{
                            marginTop: 13,
                            padding: 10,
                            borderRadius: 12,
                            background:
                              "#fff8ec",
                            color: "#81683b",
                            fontSize: 8,
                            lineHeight: 1.5,
                          }}
                        >
                          <strong
                            style={{
                              display: "block",
                              marginBottom: 4,
                              color: "#765821",
                              fontSize: 9,
                              fontWeight: 900,
                            }}
                          >
                            Değerlendirme sınırları
                          </strong>

                          {analysis.limitations.join(
                            " ",
                          )}
                        </div>
                      ) : null}

                      <div
                        style={{
                          marginTop: 12,
                          color: "#888c9b",
                          fontSize: 8,
                          lineHeight: 1.5,
                        }}
                      >
                        {analysis.disclaimer}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={
                      styles.analysisButton
                    }
                    onClick={continueToOffer}
                  >
                    Ücretsiz Teklif Formuna Geç
                  </button>

                  <button
                    type="button"
                    className={
                      styles.changeButton
                    }
                    onClick={clearSelection}
                  >
                    Başka fotoğraf analiz et
                  </button>
                </>
              ) : (
                <>
                  <div
                    className={
                      styles.previewCard
                    }
                  >
                    <div
                      className={
                        styles.previewHeader
                      }
                    >
                      <div>
                        <strong>
                          Fotoğrafınız hazır
                        </strong>

                        <span>
                          Analizden önce kontrol
                          edin
                        </span>
                      </div>

                      <button
                        type="button"
                        className={
                          styles.removeButton
                        }
                        onClick={clearSelection}
                        aria-label="Seçilen fotoğrafı kaldır"
                        disabled={
                          status === "uploading"
                        }
                      >
                        ×
                      </button>
                    </div>

                    <div
                      className={
                        styles.previewImageWrap
                      }
                    >
                      <Image
                        src={previewUrl}
                        alt="Yüklenen diş fotoğrafı ön izlemesi"
                        fill
                        unoptimized
                        className={
                          styles.previewImage
                        }
                      />
                    </div>

                    <div
                      className={
                        styles.fileInformation
                      }
                    >
                      <span
                        className={
                          styles.fileName
                        }
                      >
                        {selectedFile?.name}
                      </span>

                      <span>
                        {selectedFile
                          ? `${(
                              selectedFile.size /
                              1024 /
                              1024
                            ).toFixed(2)} MB`
                          : ""}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={
                      styles.analysisButton
                    }
                    onClick={startAnalysis}
                    disabled={
                      status === "uploading"
                    }
                  >
                    {status === "uploading"
                      ? "Fotoğraf analiz ediliyor..."
                      : "AI Ön Değerlendirmeyi Başlat"}
                  </button>

                  <button
                    type="button"
                    className={
                      styles.changeButton
                    }
                    onClick={openFilePicker}
                    disabled={
                      status === "uploading"
                    }
                  >
                    Farklı fotoğraf seç
                  </button>
                </>
              )}

              {error ? (
                <div
                  className={
                    styles.errorMessage
                  }
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              <div
                className={
                  styles.privacyNotice
                }
              >
                <span aria-hidden>🔒</span>

                <p>
                  <strong>
                    Fotoğrafınız saklanmaz.
                  </strong>
                  Analiz sırasında yalnızca geçici
                  olarak işlenir. Kliniklere
                  fotoğraf gönderilmez.
                </p>
              </div>
            </div>
          </div>

          <div
            className={
              styles.floatingCardOne
            }
          >
            <span aria-hidden>⚡</span>

            <div>
              <strong>
                Hızlı değerlendirme
              </strong>

              <small>
                Kısa süre içinde
              </small>
            </div>
          </div>

          <div
            className={
              styles.floatingCardTwo
            }
          >
            <span aria-hidden>🔒</span>

            <div>
              <strong>
                Gizlilik odaklı
              </strong>

              <small>
                Fotoğraf saklanmaz
              </small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}