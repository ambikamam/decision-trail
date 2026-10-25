export const DECISION_STATUSES = ["proposed", "decided", "revisited"] as const;
export const EVIDENCE_SOURCE_TYPES = ["research", "analytics", "support", "document", "other"] as const;

export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export type DecisionInput = {
  title: string;
  problem: string;
  chosenOption: string;
  alternatives: string;
  rationale: string;
  status: DecisionStatus;
  successMeasure: string | null;
  reviewDate: string | null;
};

export class InputError extends Error {}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new InputError(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

function optionalText(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new InputError(`${field} must be text.`);
  }
  return value.trim() || null;
}

function parseReviewDate(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new InputError("reviewDate must be a date in YYYY-MM-DD format.");
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new InputError("reviewDate must be a real calendar date.");
  }
  return value;
}

export function parseDecisionInput(value: unknown, existing?: DecisionInput): DecisionInput {
  if (!isRecord(value)) {
    throw new InputError("Send the decision as a JSON object.");
  }

  const title = value.title === undefined && existing ? existing.title : requiredText(value.title, "title");
  const problem = value.problem === undefined && existing ? existing.problem : requiredText(value.problem, "problem");
  const chosenOption =
    value.chosenOption === undefined && existing
      ? existing.chosenOption
      : requiredText(value.chosenOption, "chosenOption");
  const rationale =
    value.rationale === undefined && existing ? existing.rationale : requiredText(value.rationale, "rationale");

  const alternatives =
    value.alternatives === undefined && existing
      ? existing.alternatives
      : value.alternatives === undefined
        ? ""
        : typeof value.alternatives === "string"
          ? value.alternatives.trim()
          : (() => {
              throw new InputError("alternatives must be text.");
            })();

  const statusValue = value.status === undefined ? existing?.status ?? "proposed" : value.status;
  if (typeof statusValue !== "string" || !DECISION_STATUSES.includes(statusValue as DecisionStatus)) {
    throw new InputError("status must be proposed, decided, or revisited.");
  }

  const successMeasure =
    value.successMeasure === undefined && existing
      ? existing.successMeasure
      : optionalText(value.successMeasure, "successMeasure");
  const reviewDate =
    value.reviewDate === undefined && existing ? existing.reviewDate : parseReviewDate(value.reviewDate);

  return {
    title,
    problem,
    chosenOption,
    alternatives,
    rationale,
    status: statusValue as DecisionStatus,
    successMeasure,
    reviewDate,
  };
}
