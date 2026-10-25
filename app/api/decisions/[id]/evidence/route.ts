import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { EVIDENCE_SOURCE_TYPES, InputError, isRecord, requiredText } from "@/lib/decision-validation";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(rawId: string): number | null {
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function POST(request: Request, context: RouteContext) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "The public demo is read-only." }, { status: 403 });
  }

  const { id: rawId } = await context.params;
  const decisionId = parseId(rawId);
  if (decisionId === null) {
    return NextResponse.json({ error: "Decision ID must be a positive whole number." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request body." }, { status: 400 });
  }
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Send the evidence link as a JSON object." }, { status: 400 });
  }

  let label: string;
  let url: string;
  let sourceType: string;
  let note: string;
  try {
    label = requiredText(body.label, "label");
    const rawUrl = requiredText(body.url, "url");
    const parsedUrl = new URL(rawUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new InputError("url must begin with http:// or https://.");
    }
    url = parsedUrl.toString();

    const rawSourceType = body.sourceType === undefined ? "other" : body.sourceType;
    if (typeof rawSourceType !== "string" || !EVIDENCE_SOURCE_TYPES.includes(rawSourceType as (typeof EVIDENCE_SOURCE_TYPES)[number])) {
      throw new InputError("sourceType must be research, analytics, support, document, or other.");
    }
    sourceType = rawSourceType;

    if (body.note === undefined || body.note === null) {
      note = "";
    } else if (typeof body.note === "string") {
      note = body.note.trim();
    } else {
      throw new InputError("note must be text.");
    }
  } catch (error) {
    const message = error instanceof InputError ? error.message : "url must be a valid web address.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const sql = getDb();
    const decisions = await sql.query("SELECT id FROM decisions WHERE id = $1", [decisionId]);
    if (decisions.length === 0) {
      return NextResponse.json({ error: "Decision not found." }, { status: 404 });
    }

    const rows = await sql.query(
      `INSERT INTO evidence_links (decision_id, label, url, source_type, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [decisionId, label, url, sourceType, note],
    );

    return NextResponse.json({ success: true, evidenceLinkId: rows[0].id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save this evidence link right now." }, { status: 500 });
  }
}
