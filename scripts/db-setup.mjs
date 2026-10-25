import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Check your .env.local file.");
}

const sql = neon(databaseUrl);

for (const fileName of ["schema.sql", "seed.sql"]) {
  const contents = await readFile(new URL(`../db/${fileName}`, import.meta.url), "utf8");
  const statements = contents
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }
}

const decisions = await sql`
  SELECT id, title, status, created_at
  FROM decisions
  ORDER BY created_at DESC, id DESC
`;
const evidenceLinks = await sql`
  SELECT id, decision_id, label, source_type
  FROM evidence_links
  ORDER BY id
`;

console.log("Decision Trail database is ready.");
console.log("Decisions:", JSON.stringify(decisions, null, 2));
console.log("Evidence links:", JSON.stringify(evidenceLinks, null, 2));
