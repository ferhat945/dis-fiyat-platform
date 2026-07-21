import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const DentalAnalysisSchema = z.object({
  suitableImage: z.boolean(),

  imageQuality: z.enum([
    "good",
    "acceptable",
    "poor",
  ]),

  visibleObservations: z
    .array(z.string().min(2).max(220))
    .max(6),

  suggestedTreatmentCategories: z
    .array(z.string().min(2).max(120))
    .max(6),

  summary: z.string().min(10).max(800),

  limitations: z
    .array(z.string().min(2).max(220))
    .max(5),

  disclaimer: z.string().min(10).max(500),
});

type DentalAnalysis = z.infer<typeof DentalAnalysisSchema>;

type OpenAIContentItem = {
  type?: unknown;
  text?: unknown;
};

type OpenAIOutputItem = {
  type?: unknown;
  content?: unknown;
};

type OpenAIResponseShape = {
  output?: unknown;
  error?: {
    message?: unknown;
    code?: unknown;
  };
};

type SuccessResponse = {
  ok: true;
  analysis: DentalAnalysis;
};

type ErrorResponse = {
  ok: false;
  code: string;
  message: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

function getIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function extractOutputText(response: OpenAIResponseShape): string | null {
  if (!Array.isArray(response.output)) {
    return null;
  }

  for (const outputItem of response.output) {
    if (
      typeof outputItem !== "object" ||
      outputItem === null
    ) {
      continue;
    }

    const typedOutputItem = outputItem as OpenAIOutputItem;

    if (!Array.isArray(typedOutputItem.content)) {
      continue;
    }

    for (const contentItem of typedOutputItem.content) {
      if (
        typeof contentItem !== "object" ||
        contentItem === null
      ) {
        continue;
      }

      const typedContentItem =
        contentItem as OpenAIContentItem;

      if (
        typedContentItem.type === "output_text" &&
        typeof typedContentItem.text === "string"
      ) {
        return typedContentItem.text;
      }
    }
  }

  return null;
}

function getOpenAIErrorMessage(
  response: OpenAIResponseShape,
): string | null {
  const message = response.error?.message;

  return typeof message === "string" && message.trim()
    ? message.trim()
    : null;
}

function imageQualityLabel(
  quality: DentalAnalysis["imageQuality"],
): string {
  switch (quality) {
    case "good":
      return "İyi";

    case "acceptable":
      return "Kabul edilebilir";

    case "poor":
      return "Yetersiz";

    default:
      return "Bilinmiyor";
  }
}

function normalizeAnalysis(
  analysis: DentalAnalysis,
): DentalAnalysis {
  const disclaimer =
    "Bu ön değerlendirme yalnızca fotoğrafta görülebilen genel özelliklere dayanır. Tıbbi teşhis, kesin tedavi önerisi veya hekim muayenesi yerine geçmez.";

  return {
    suitableImage: analysis.suitableImage,
    imageQuality: analysis.imageQuality,

    visibleObservations: analysis.visibleObservations
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6),

    suggestedTreatmentCategories:
      analysis.suggestedTreatmentCategories
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 6),

    summary: analysis.summary.trim(),

    limitations: analysis.limitations
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5),

    disclaimer,
  };
}

export async function POST(
  request: Request,
): Promise<NextResponse<ApiResponse>> {
  try {
    const ip = getIp(request);

    const rateLimitResult = rateLimit(
      `ai-dental-analysis:${ip}`,
      60 * 10,
      4,
    );

    if (!rateLimitResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: "RATE_LIMIT",
          message:
            "Çok fazla analiz denemesi yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              rateLimitResult.retryAfterSec,
            ),
          },
        },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      console.error(
        "AI_DENTAL_ANALYSIS_ERROR: OPENAI_API_KEY bulunamadı.",
      );

      return NextResponse.json(
        {
          ok: false,
          code: "AI_NOT_CONFIGURED",
          message:
            "AI analiz hizmeti henüz yapılandırılmamış.",
        },
        {
          status: 503,
        },
      );
    }

    const contentType =
      request.headers.get("content-type") ?? "";

    if (
      !contentType
        .toLowerCase()
        .includes("multipart/form-data")
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_CONTENT_TYPE",
          message:
            "Fotoğraf gönderim biçimi geçersiz.",
        },
        {
          status: 400,
        },
      );
    }

    const formData = await request.formData();
    const uploadedImage = formData.get("image");

    if (!(uploadedImage instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          code: "IMAGE_REQUIRED",
          message: "Lütfen bir diş fotoğrafı seçin.",
        },
        {
          status: 400,
        },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(uploadedImage.type)) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_IMAGE_TYPE",
          message:
            "Yalnızca JPG, PNG veya WebP fotoğraf yükleyebilirsiniz.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      uploadedImage.size <= 0 ||
      uploadedImage.size > MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_IMAGE_SIZE",
          message:
            "Fotoğraf boyutu 0 MB ile 8 MB arasında olmalıdır.",
        },
        {
          status: 400,
        },
      );
    }

    /*
      Fotoğraf yalnızca RAM üzerinde okunur.

      - Dosya sistemine yazılmaz.
      - Veritabanına kaydedilmez.
      - Bulut depolamaya yüklenmez.
      - İşlem tamamlandığında buffer erişilemez hale gelir.
    */
    const imageArrayBuffer =
      await uploadedImage.arrayBuffer();

    const imageBuffer = Buffer.from(imageArrayBuffer);
    const base64Image = imageBuffer.toString("base64");

    const imageDataUrl =
      `data:${uploadedImage.type};base64,${base64Image}`;

    const model =
      process.env.OPENAI_VISION_MODEL?.trim() ||
      "gpt-5.6";

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 55_000);

    let openAIResponse: Response;

    try {
      openAIResponse = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },

          signal: controller.signal,

          body: JSON.stringify({
            model,

            store: false,

            max_output_tokens: 1200,

            input: [
              {
                role: "system",
                content: [
                  {
                    type: "input_text",
                    text: [
                      "Sen bir diş fotoğrafı ön değerlendirme sistemisin.",
                      "Kullanıcıya Türkçe yanıt ver.",
                      "Asla hastalık teşhisi koyma.",
                      "Asla kesin tedavi gerektiğini söyleme.",
                      "Asla kesin fiyat, kesin sonuç veya kesin sağlık iddiası üretme.",
                      "Yalnızca fotoğrafta doğrudan görülebilen genel özellikleri tarafsız biçimde belirt.",
                      "Çürük, enfeksiyon, apse, diş eti hastalığı veya benzeri tıbbi durumları kesin olarak tanımlama.",
                      "Bunun yerine 'renk değişikliği görülebilir', 'düzensizlik görülebilir', 'diş hekimi değerlendirmesi düşünülebilir' gibi ihtiyatlı ifadeler kullan.",
                      "Fotoğraftan görülemeyen kök, kemik, sinir, röntgen veya ağız içi durumlar hakkında çıkarım yapma.",
                      "Fotoğraf ağız veya diş fotoğrafı değilse suitableImage false döndür.",
                      "Fotoğraf bulanık, karanlık veya dişler görünmüyorsa suitableImage false döndür.",
                      "suggestedTreatmentCategories alanı teşhis değildir; yalnızca kullanıcının bir klinikle görüşürken sorabileceği genel hizmet kategorilerini içerir.",
                      "Örnek kategoriler: Genel diş hekimi muayenesi, diş beyazlatma danışmanlığı, ortodonti danışmanlığı, estetik diş hekimliği danışmanlığı, diş taşı temizliği danışmanlığı, dolgu değerlendirmesi.",
                      "Kesin teşhisin ve tedavi planının yalnızca diş hekimi muayenesiyle oluşturulabileceğini belirt.",
                    ].join("\n"),
                  },
                ],
              },

              {
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: [
                      "Bu fotoğrafı yalnızca görsel ön değerlendirme amacıyla incele.",
                      "Fotoğrafta açıkça görülebilen genel özellikleri belirt.",
                      "Teşhis koyma.",
                      "Görsel uygun değilse bunu açıkça belirt.",
                      "Yanıtını verilen JSON şemasına göre oluştur.",
                    ].join("\n"),
                  },

                  {
                    type: "input_image",
                    image_url: imageDataUrl,
                    detail: "high",
                  },
                ],
              },
            ],

            text: {
              format: {
                type: "json_schema",
                name: "dental_visual_preassessment",
                description:
                  "Diş fotoğrafı için teşhis içermeyen görsel ön değerlendirme.",

                strict: true,

                schema: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    suitableImage: {
                      type: "boolean",
                    },

                    imageQuality: {
                      type: "string",
                      enum: [
                        "good",
                        "acceptable",
                        "poor",
                      ],
                    },

                    visibleObservations: {
                      type: "array",
                      maxItems: 6,
                      items: {
                        type: "string",
                      },
                    },

                    suggestedTreatmentCategories: {
                      type: "array",
                      maxItems: 6,
                      items: {
                        type: "string",
                      },
                    },

                    summary: {
                      type: "string",
                    },

                    limitations: {
                      type: "array",
                      maxItems: 5,
                      items: {
                        type: "string",
                      },
                    },

                    disclaimer: {
                      type: "string",
                    },
                  },

                  required: [
                    "suitableImage",
                    "imageQuality",
                    "visibleObservations",
                    "suggestedTreatmentCategories",
                    "summary",
                    "limitations",
                    "disclaimer",
                  ],
                },
              },
            },
          }),
        },
      );
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return NextResponse.json(
          {
            ok: false,
            code: "AI_TIMEOUT",
            message:
              "Analiz beklenenden uzun sürdü. Lütfen tekrar deneyin.",
          },
          {
            status: 504,
          },
        );
      }

      console.error(
        "AI_DENTAL_OPENAI_REQUEST_FAILED:",
        error,
      );

      return NextResponse.json(
        {
          ok: false,
          code: "AI_CONNECTION_ERROR",
          message:
            "AI analiz hizmetine bağlanılamadı. Lütfen tekrar deneyin.",
        },
        {
          status: 502,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    const openAIJson: unknown =
      await openAIResponse.json().catch(() => null);

    if (
      typeof openAIJson !== "object" ||
      openAIJson === null
    ) {
      console.error(
        "AI_DENTAL_INVALID_OPENAI_RESPONSE:",
        openAIJson,
      );

      return NextResponse.json(
        {
          ok: false,
          code: "AI_INVALID_RESPONSE",
          message:
            "AI hizmetinden geçerli bir yanıt alınamadı.",
        },
        {
          status: 502,
        },
      );
    }

    const typedOpenAIResponse =
      openAIJson as OpenAIResponseShape;

    if (!openAIResponse.ok) {
      console.error(
        "AI_DENTAL_OPENAI_ERROR:",
        openAIResponse.status,
        getOpenAIErrorMessage(typedOpenAIResponse),
      );

      return NextResponse.json(
        {
          ok: false,
          code: "AI_PROVIDER_ERROR",
          message:
            "AI değerlendirmesi şu anda tamamlanamadı. Lütfen tekrar deneyin.",
        },
        {
          status: 502,
        },
      );
    }

    const outputText = extractOutputText(
      typedOpenAIResponse,
    );

    if (!outputText) {
      console.error(
        "AI_DENTAL_OUTPUT_TEXT_NOT_FOUND:",
        typedOpenAIResponse,
      );

      return NextResponse.json(
        {
          ok: false,
          code: "AI_EMPTY_RESPONSE",
          message:
            "AI değerlendirmesi oluşturulamadı. Lütfen farklı bir fotoğraf deneyin.",
        },
        {
          status: 502,
        },
      );
    }

    let parsedOutput: unknown;

    try {
      parsedOutput = JSON.parse(outputText);
    } catch (error) {
      console.error(
        "AI_DENTAL_JSON_PARSE_FAILED:",
        error,
        outputText,
      );

      return NextResponse.json(
        {
          ok: false,
          code: "AI_JSON_ERROR",
          message:
            "AI değerlendirmesi okunamadı. Lütfen tekrar deneyin.",
        },
        {
          status: 502,
        },
      );
    }

    const validatedAnalysis =
      DentalAnalysisSchema.safeParse(parsedOutput);

    if (!validatedAnalysis.success) {
      console.error(
        "AI_DENTAL_SCHEMA_VALIDATION_FAILED:",
        validatedAnalysis.error.flatten(),
      );

      return NextResponse.json(
        {
          ok: false,
          code: "AI_SCHEMA_ERROR",
          message:
            "AI değerlendirmesi beklenen biçimde oluşturulamadı.",
        },
        {
          status: 502,
        },
      );
    }

    const analysis = normalizeAnalysis(
      validatedAnalysis.data,
    );

    console.info("AI_DENTAL_ANALYSIS_COMPLETED", {
      suitableImage: analysis.suitableImage,
      imageQuality: imageQualityLabel(
        analysis.imageQuality,
      ),
      mimeType: uploadedImage.type,
      fileSize: uploadedImage.size,
    });

    return NextResponse.json(
      {
        ok: true,
        analysis,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error: unknown) {
    console.error(
      "AI_DENTAL_ANALYSIS_UNEXPECTED_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        code: "AI_ANALYSIS_ERROR",
        message:
          "Fotoğraf değerlendirmesi tamamlanamadı. Lütfen tekrar deneyin.",
      },
      {
        status: 500,
      },
    );
  }
}