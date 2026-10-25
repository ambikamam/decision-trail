import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { InputError, isRecord, parseDecisionInput, type DecisionInput } from "@/lib/decision-validation";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(rawId: string): number | null {
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

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

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Decision ID must be a positive whole number." }, { status: 400 });
  }

  try {
    const sql = getDb();
    const decisions = await sql.query(`SELECT ${decisionColumns} FROM decisions WHERE id = $1`, [id]);
    if (decisions.length === 0) {
      return NextResponse.json({ error: "Decision not found." }, { status: 404 });
    }

    const evidenceLinks = await sql.query(
      `SELECT id, decision_id AS "decisionId", label, url, source_type AS "sourceType", note,
              created_at AS "createdAt"
       FROM evidence_links
       WHERE decision_id = $1
       ORDER BY created_at ASC, id ASC`,
      [id],
    );

    return NextResponse.json({ decision: decisions[0], evidenceLinks });
  } catch {
    return NextResponse.json({ error: "Could not load this decision right now." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "The public demo is read-only." }, { status: 403 });
  }

  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Decision ID must be a positive whole number." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request body." }, { status: 400 });
  }
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Send the decision changes as a JSON object." }, { status: 400 });
  }

  const editableFields = [
    "title",
    "problem",
    "chosenOption",
    "alternatives",
    "rationale",
    "status",
    "successMeasure",
    "reviewDate",
  ];
  if (!editableFields.some((field) => Object.prototype.hasOwnProperty.call(body, field))) {
    return NextResponse.json({ error: "Include at least one decision field to update." }, { status: 400 });
  }

  try {
    const sql = getDb();
    const existingRows = await sql.query(
      `SELECT title, problem, chosen_option AS "chosenOption", alternatives, rationale, status,
              success_measure AS "successMeasure", review_date AS "reviewDate"
       FROM decisions WHERE id = $1`,
      [id],
    );
    if (existingRows.length === 0) {
      return NextResponse.json({ error: "Decision not found." }, { status: 404 });
    }

    let decision: DecisionInput;
    try {
      decision = parseDecisionInput(body, existingRows[0] as DecisionInput);
    } catch (error) {
      if (error instanceof InputError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: "The decision changes could not be checked." }, { status: 400 });
    }

    const updatedRows = await sql.query(
      `UPDATE decisions
       SET title = $1,
           problem = $2,
           chosen_option = $3,
           alternatives = $4,
           rationale = $5,
           status = $6,
           success_measure = $7,
           review_date = $8::date,
           updated_at = NOW()
       WHERE id = $9
       RETURNING ${decisionColumns}`,
      [
        decision.title,
        decision.problem,
        decision.chosenOption,
        decision.alternatives,
        decision.rationale,
        decision.status,
        decision.successMeasure,
        decision.reviewDate,
        id,
      ],
    );

    return NextResponse.json({ success: true, decision: updatedRows[0] });
  } catch {
    return NextResponse.json({ error: "Could not update the decision right now." }, { status: 500 });
  }
}
