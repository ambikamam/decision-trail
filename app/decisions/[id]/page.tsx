"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Icon } from "@/components/icon";

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
type Evidence = { id: number; label: string; url: string; sourceType: string; note: string; createdAt: string };

const readOnly = process.env.NODE_ENV === "production";
const statusLabels: Record<Decision["status"], string> = { proposed: "Proposed", decided: "Decided", revisited: "Revisited" };
const sourceLabels: Record<string, string> = { research: "Research", analytics: "Analytics", support: "Support", document: "Document", other: "Link" };

function dateLabel(value: string, includeYear = false) {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", ...(includeYear ? { year: "numeric" } : {}) }).format(new Date(value));
}

export default function DecisionDetail() {
  const params = useParams<{ id: string }>();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [addingEvidence, setAddingEvidence] = useState(false);

  const loadDecision = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/decisions/${params.id}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load this decision.");
      setDecision(result.decision);
      setEvidence(result.evidenceLinks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this decision.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { loadDecision(); }, [loadDecision]);

  async function updateStatus(nextStatus: Decision["status"]) {
    if (!decision) return;
    setSavingStatus(true);
    setStatusMessage("");
    try {
      const response = await fetch(`/api/decisions/${decision.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update the status.");
      setDecision(result.decision);
      setStatusMessage("Status updated.");
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Could not update the status.");
    } finally { setSavingStatus(false); }
  }

  async function submitEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!decision) return;
    const formElement = event.currentTarget;
    setAddingEvidence(true);
    setStatusMessage("");
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`/api/decisions/${decision.id}/evidence`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not add this link.");
      formElement.reset();
      await loadDecision();
      setStatusMessage("Evidence link added.");
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Could not add this link.");
    } finally { setAddingEvidence(false); }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Decision Trail home"><span className="brand-mark"><Icon name="idea" size={18} /></span><span>decision trail</span></Link>
        <div className="topbar-right"><span className="workspace-label"><span className="workspace-dot" /> Product workspace</span>{readOnly && <span className="demo-label">Read-only demo</span>}<span className="avatar" aria-label="Product team">P</span></div>
      </header>
      <div className="detail-wrap">
        <Link href="/" className="back-link"><span>←</span> All decisions</Link>
        {loading ? <div className="loading-card detail-loading"><span className="loader" /> Opening the decision…</div> : error ? <div className="detail-error"><div className="empty-icon">!</div><h1>We couldn’t open this decision</h1><p>{error}</p><Link className="button button-secondary" href="/">Back to decisions</Link></div> : decision ? (
          <>
            <div className="detail-heading">
              <div className="detail-overline"><span className={`status-pill status-${decision.status}`}>{statusLabels[decision.status]}</span><span className="detail-date">Recorded {dateLabel(decision.createdAt, true)}</span></div>
              <h1>{decision.title}</h1>
              <p className="detail-subtitle">A decision record <span>·</span> No. {String(decision.id).padStart(3, "0")}</p>
            </div>
            {statusMessage && <div className={statusMessage.includes("Could not") || statusMessage.includes("read-only") ? "error-banner" : "notice"} role="status">{statusMessage}</div>}
            <div className="detail-grid">
              <div className="detail-content">
                <section className="record-section context-section"><div className="section-number section-icon-context"><Icon name="idea" size={20} /></div><div><p className="eyebrow">THE CONTEXT</p><h2>What needed a decision?</h2><p className="long-copy">{decision.problem}</p></div></section>
                <section className="record-section chosen-section"><div className="section-number section-icon-choice"><Icon name="choice" size={20} /></div><div><p className="eyebrow">THE CHOICE</p><h2>What we decided</h2><div className="choice-callout"><span className="choice-spark"><Icon name="choice" size={19} /></span><p>{decision.chosenOption}</p></div></div></section>
                <section className="record-section"><div className="section-number section-icon-why"><Icon name="why" size={20} /></div><div><p className="eyebrow">THE REASONING</p><h2>Why this option</h2><p className="long-copy">{decision.rationale}</p></div></section>
                {decision.alternatives && <section className="record-section"><div className="section-number section-icon-options"><Icon name="options" size={20} /></div><div><p className="eyebrow">OTHER PATHS</p><h2>What else we considered</h2><p className="long-copy">{decision.alternatives}</p></div></section>}
                <section className="evidence-section">
                  <div className="evidence-heading"><div><p className="eyebrow">THE RECEIPTS</p><h2>Evidence &amp; context</h2></div><span className="evidence-count">{evidence.length} {evidence.length === 1 ? "link" : "links"}</span></div>
                  {evidence.length > 0 ? <div className="evidence-list">{evidence.map((item) => <a className="evidence-card" href={item.url} key={item.id} target="_blank" rel="noreferrer"><span className="evidence-type">{sourceLabels[item.sourceType] || "Link"}</span><span className="evidence-text"><strong>{item.label}</strong>{item.note && <small>{item.note}</small>}</span><span className="external-arrow"><Icon name="arrow" size={17} /></span></a>)}</div> : <div className="evidence-empty"><span className="link-glyph"><Icon name="link" size={18} /></span><p>No supporting links yet. Add the research, customer signal, or document that informed this choice.</p></div>}
                  {!readOnly && <form className="evidence-form" onSubmit={submitEvidence}><p className="form-overline">ADD A SUPPORTING LINK</p><div className="evidence-fields"><input name="label" placeholder="Name this source" aria-label="Source name" required /><input name="url" type="url" placeholder="https://source-url.com" aria-label="Source URL" required /><select name="sourceType" aria-label="Source type" defaultValue="other"><option value="other">Type</option><option value="research">Research</option><option value="analytics">Analytics</option><option value="support">Support</option><option value="document">Document</option></select><button className="button button-secondary" disabled={addingEvidence}>{addingEvidence ? "Adding…" : "Add link"}</button></div><input className="evidence-note-input" name="note" placeholder="Optional note about this source" aria-label="Optional note" /></form>}
                </section>
              </div>
              <aside className="detail-sidebar">
                <div className="sidebar-card"><p className="eyebrow">FOLLOW THROUGH</p><h2>How will we know?</h2>{decision.successMeasure ? <p className="sidebar-copy">{decision.successMeasure}</p> : <p className="sidebar-muted">No success measure was added to this record.</p>}{decision.reviewDate && <div className="review-date"><span className="calendar-icon"><Icon name="calendar" size={19} /></span><span><small>REVISIT ON</small><strong>{dateLabel(decision.reviewDate, true)}</strong></span></div>}</div>
                <div className="sidebar-card status-card"><p className="eyebrow">DECISION STATUS</p><label className="status-label" htmlFor="decision-status">Current status</label><select id="decision-status" value={decision.status} onChange={(event) => updateStatus(event.target.value as Decision["status"])} disabled={readOnly || savingStatus}><option value="proposed">Proposed</option><option value="decided">Decided</option><option value="revisited">Revisited</option></select><p className="sidebar-muted">A decision can be revisited as new information comes in.</p></div>
                <div className="sidebar-note"><span>✳</span><p>Good records help the next person understand the “why” without having to start from scratch.</p></div>
              </aside>
            </div>
            <footer className="page-footer detail-footer"><span>Good decisions deserve a memory.</span><span>Decision Trail <i>·</i> Product workspace</span></footer>
          </>
        ) : null}
      </div>
    </main>
  );
}
