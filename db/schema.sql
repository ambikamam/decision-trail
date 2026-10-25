CREATE TABLE IF NOT EXISTS decisions (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  problem         TEXT NOT NULL,
  chosen_option   TEXT NOT NULL,
  alternatives    TEXT NOT NULL DEFAULT '',
  rationale       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'proposed'
                  CHECK (status IN ('proposed', 'decided', 'revisited')),
  success_measure TEXT,
  review_date     DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence_links (
  id          SERIAL PRIMARY KEY,
  decision_id INTEGER NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  url         TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'other'
              CHECK (source_type IN ('research', 'analytics', 'support', 'document', 'other')),
  note        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
