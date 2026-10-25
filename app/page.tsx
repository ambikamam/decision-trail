"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Decision = {
  id: number;
  title: string;
  problem: string;
  chosenOption: string;
  alternatives: string;
  rationale: string;
  status: "proposed" | "decided" | "revisited";
  successMeasure: string | null;
  reviewDate: string | null;
  createdAt: string;
  updatedAt: string;
};

const readOnly = process.env.NODE_ENV === "production";
const statusLabels: Record<Decision["status"], string> = {
  proposed: "Proposed",
  decided: "Decided",
  revisited: "Revisited",
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function Home() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const loadDecisions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (status !== "all") params.set("status", status);
      const response = await fetch(`/api/decisions?${params.toString()}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load decisions.");
      setDecisions(result.decisions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load decisions.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(loadDecisions, 180);
    return () => window.clearTimeout(timer);
  }, [loadDecisions]);

  async function createDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this decision.");
      setShowForm(false);
      setNotice("Decision saved. Its reasoning is now part of the trail.");
      await loadDecisions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this decision.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Decision Trail home">
          <span className="brand-mark"><span /></span>
          <span>decision trail</span>
        </Link>
        <div className="topbar-right">
          <span className="workspace-label"><span className="workspace-dot" /> Product workspace</span>
          {readOnly && <span className="demo-label">Read-only demo</span>}
          <span className="avatar" aria-label="Product team">P</span>
        </div>
      </header>

      <div className="page-wrap">
        <div className="page-heading">
          <div>
            <p className="eyebrow">THE MEMORY BEHIND THE WORK</p>
            <h1>Decisions</h1>
            <p className="page-intro">A clear record of what we chose, why we chose it, and what we’ll learn next.</p>
          </div>
          <button className="button button-primary" onClick={() => setShowForm(true)} disabled={readOnly}>
            <span className="plus">+</span> Add decision
          </button>
        </div>

        <div className="toolbar">
          <label className="search-box">
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.8" cy="8.8" r="5.8" /><path d="m13.2 13.2 4 4" /></svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search decisions, context, or reasoning" aria-label="Search decisions" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="filter-tabs" aria-label="Filter by status">
            {["all", "decided", "proposed", "revisited"].map((item) => (
              <button key={item} className={status === item ? "filter-tab active" : "filter-tab"} onClick={() => setStatus(item)}>
                {item === "all" ? "All decisions" : statusLabels[item as Decision["status"]]}
              </button>
            ))}
          </div>
        </div>

        {notice && <div className="notice"><span>✓</span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}
        {error && <div className="error-banner" role="alert">{error}</div>}

        <section className="decision-section" aria-label="Decision list">
          <div className="section-caption"><span>{status === "all" ? "RECENT DECISIONS" : `${statusLabels[status as Decision["status"]].toUpperCase()} DECISIONS`}</span><span>{loading ? "Loading…" : `${decisions.length} ${decisions.length === 1 ? "record" : "records"}`}</span></div>
          {loading ? (
            <div className="loading-card"><span className="loader" /> Finding the decisions…</div>
          ) : decisions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">↳</div>
              <h2>{search || status !== "all" ? "No decisions found" : "Your trail starts here"}</h2>
              <p>{search || status !== "all" ? "Try a different search or status filter." : "Capture a choice and the thinking behind it, so the team can find it later."}</p>
              {!readOnly && !search && status === "all" && <button className="button button-secondary" onClick={() => setShowForm(true)}>Add your first decision</button>}
            </div>
          ) : (
            <div className="decision-list">
              {decisions.map((decision, index) => (
                <Link className="decision-card" href={`/decisions/${decision.id}`} key={decision.id}>
                  <div className="decision-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="decision-main">
                    <div className="decision-title-row"><h2>{decision.title}</h2><span className={`status-pill status-${decision.status}`}>{statusLabels[decision.status]}</span></div>
                    <p className="decision-problem">{decision.problem}</p>
                    <div className="decision-choice"><span className="choice-label">CHOSEN</span><span>{decision.chosenOption}</span></div>
                  </div>
                  <div className="decision-meta"><span>{dateLabel(decision.createdAt)}</span><span className="card-arrow">↗</span></div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <footer className="page-footer"><span>Good decisions deserve a memory.</span><span>Decision Trail <i>·</i> Product workspace</span></footer>
      </div>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-decision-title">
            <div className="modal-heading"><div><p className="eyebrow">ADD TO THE TRAIL</p><h2 id="new-decision-title">Capture a decision</h2><p>Record the choice and the reasoning someone will need later.</p></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close">×</button></div>
            <form className="decision-form" onSubmit={createDecision}>
              <label>Decision title<input name="title" placeholder="e.g. Make setup checklist optional" required maxLength={200} /></label>
              <label>What problem were you solving?<textarea name="problem" placeholder="Describe the situation or customer need." required rows={3} /></label>
              <label>What did you choose?<textarea name="chosenOption" placeholder="State the decision in a sentence or two." required rows={2} /></label>
              <label>Why this option?<textarea name="rationale" placeholder="What evidence or trade-off led you here?" required rows={3} /></label>
              <div className="form-grid"><label>Status<select name="status" defaultValue="decided"><option value="proposed">Proposed</option><option value="decided">Decided</option><option value="revisited">Revisited</option></select></label><label>Review date <span className="optional-label">optional</span><input name="reviewDate" type="date" /></label></div>
              <label>Other options considered <span className="optional-label">optional</span><textarea name="alternatives" placeholder="What else did you consider?" rows={2} /></label>
              <label>How will you know it worked? <span className="optional-label">optional</span><input name="successMeasure" placeholder="A signal or outcome to look for" /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save decision"}<span>↗</span></button></div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
