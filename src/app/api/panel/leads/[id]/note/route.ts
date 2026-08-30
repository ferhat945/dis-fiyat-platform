import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  clinicNote: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),

  setLastContactNow: z.boolean().optional(),

  clearLastContactAt: z.boolean().optional(),
});

type Body = z.infer<typeof BodySchema>;

async function getParamId(req: Request, ctx: unknown): Promise<string> {
  const anyCtx = ctx as { params?: unknown };

  if (anyCtx?.params) {
    const p = anyCtx.params as unknown;

    if (typeof (p as { then?: unknown })?.then === "function") {
      const resolved = (await p) as { id?: string };

      if (typeof resolved?.id === "string" && resolved.id.trim()) {
        return resolved.id.trim();
      }
    }

    const obj = p as { id?: string };

    if (typeof obj?.id === "string" && obj.id.trim()) {
      return obj.id.trim();
    }
  }

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);

  return parts[parts.length - 2]?.trim() ?? "";
}

export async function PATCH(
  req: Request,
  ctx: unknown
): Promise<NextResponse> {
  try {
    const token =
      (await cookies()).get("clinic_session")?.value ?? "";

    const session = token
      ? await verifyClinicSession(token)
      : null;

    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          code: "UNAUTHORIZED_CLINIC",
        },
        {
          status: 401,
        }
      );
    }

    const leadId = await getParamId(req, ctx);

    if (!leadId) {
      return NextResponse.json(
        {
          ok: false,
          code: "MISSING_ID",
        },
        {
          status: 400,
        }
      );
    }

    const json: unknown = await req.json();
    const body: Body = BodySchema.parse(json);

    /*
     * Yalnızca gerçekten satın alınmış assignment
     * CRM notu değiştirebilir.
     *
     * unlocked:false assignment yetki sağlamaz.
     */
    const assignment = await prisma.leadAssignment.findFirst({
      where: {
        clinicId: session.clinicId,
        leadId,
        unlocked: true,
      },

      select: {
        id: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        {
          ok: false,
          code: "FORBIDDEN_NOT_UNLOCKED",
        },
        {
          status: 403,
        }
      );
    }

    const data: {
      clinicNote?: string | null;
      lastContactAt?: Date | null;
    } = {};

    if (body.clinicNote !== undefined) {
      data.clinicNote = body.clinicNote;
    }

    if (body.clearLastContactAt) {
      data.lastContactAt = null;
    } else if (body.setLastContactNow) {
      data.lastContactAt = new Date();
    }

    /*
     * Ortak Lead.clinicNote / Lead.lastContactAt artık
     * güncellenmez.
     *
     * Her klinik kendi LeadAssignment kaydını günceller.
     */
    const updated = await prisma.leadAssignment.update({
      where: {
        id: assignment.id,
      },

      data,

      select: {
        id: true,
        leadId: true,
        clinicNote: true,
        lastContactAt: true,
      },
    });

    /*
     * Mevcut NoteEditor'ın response sözleşmesini mümkün
     * olduğunca koruyoruz.
     */
    return NextResponse.json(
      {
        ok: true,

        lead: {
          id: updated.leadId,
          clinicNote: updated.clinicNote,
          lastContactAt: updated.lastContactAt,
        },
      },
      {
        status: 200,
      }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: "VALIDATION_ERROR",

          issues: err.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        {
          status: 400,
        }
      );
    }

    const msg =
      err instanceof Error
        ? err.message
        : "UNKNOWN";

    console.error(
      "LEAD_NOTE_UPDATE_ERROR:",
      err
    );

    return NextResponse.json(
      {
        ok: false,
        code: "LEAD_NOTE_UPDATE_ERROR",
        detail: msg,
      },
      {
        status: 500,
      }
    );
  }
}