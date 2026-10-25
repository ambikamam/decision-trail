import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { InputError, isRecord, parseDecisionInput, DECISION_STATUSES } from "@/lib/decision-validation";

const decisionColumns = `
  id,
  title,
  problem,
  chosen_option AS "chosenOption",
  alternatives,
  rationale,
  status,
  success_measure AS "successMeasure",
  review_date AS "reviewDate",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status")?.trim() || null;
  const search = url.searchParams.get("search")?.trim() || null;

  if (status && !DECISION_STATUSES.includes(status as (typeof DECISION_STATUSES)[number])) {
    return NextResponse.json({ error: "status must be proposed, decided, or revisited." }, { status: 400 });
  }
  if (search && search.length > 200) {
    return NextResponse.json({ error: "search must be 200 characters or fewer." }, { status: 400 });
  }

  try {
    const sql = getDb();
    const decisions = await sql.query(
      `SELECT ${decisionColumns}
       FROM decisions
       WHERE ($1::text IS NULL OR status = $1)
         AND ($2::text IS NULL OR title ILIKE '%' || $2 || '%'
           OR problem ILIKE '%' || $2 || '%'
           OR rationale ILIKE '%' || $2 || '%')
       ORDER BY created_at DESC, id DESC`,
      [status, search],
    );

    return NextResponse.json({ decisions });
  } catch {
    return NextResponse.json({ error: "Could not load decisions right now." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "The public demo is read-only." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request body." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Send the decision as a JSON object." }, { status: 400 });
  }

  let decision;
  try {
    decision = parseDecisionInput(body);
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "The decision could not be checked." }, { status: 400 });
  }

  try {
    const sql = getDb();
    const rows = await sql.query(
      `INSERT INTO decisions
        (title, problem, chosen_option, alternatives, rationale, status, success_measure, review_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date)
       RETURNING id`,
      [
        decision.title,
        decision.problem,
        decision.chosenOption,
        decision.alternatives,
        decision.rationale,
        decision.status,
        decision.successMeasure,
        decision.reviewDate,
      ],
    );

    return NextResponse.json({ success: true, decisionId: rows[0].id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the decision right now." }, { status: 500 });
  }
}
