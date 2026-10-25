INSERT INTO decisions (
  title, problem, chosen_option, alternatives, rationale, status, success_measure, review_date, created_at
)
SELECT
  'Show new teams value sooner',
  'New teams spend too long setting up before seeing what the product can do.',
  'Offer a prefilled sample workspace.',
  'Add more setup tips; keep the current flow.',
  'Fictional interview notes suggest setup friction. A sample workspace may help people understand the product sooner.',
  'decided',
  'More new teams create their first project in their first session.',
  CURRENT_DATE + INTERVAL '30 days',
  NOW() - INTERVAL '12 days'
WHERE NOT EXISTS (SELECT 1 FROM decisions WHERE title = 'Show new teams value sooner');

INSERT INTO decisions (
  title, problem, chosen_option, alternatives, rationale, status, success_measure, review_date, created_at
)
SELECT
  'Wait before building CSV export',
  'A few users ask for exports, but the team does not yet know the main use case.',
  'Keep export out of the first release and gather more evidence.',
  'Build CSV export now; offer a manual download.',
  'The fictional team wants to learn whether exports solve a frequent problem before spending time building them.',
  'proposed',
  'Confirm the most common export use case with users.',
  CURRENT_DATE + INTERVAL '14 days',
  NOW() - INTERVAL '7 days'
WHERE NOT EXISTS (SELECT 1 FROM decisions WHERE title = 'Wait before building CSV export');

INSERT INTO decisions (
  title, problem, chosen_option, alternatives, rationale, status, success_measure, review_date, created_at
)
SELECT
  'Revisit the onboarding checklist',
  'The checklist may help some teams but add extra steps for others.',
  'Revisit the checklist after reviewing its use.',
  'Keep it for everyone; remove it entirely.',
  'This fictional decision is marked for review because the team wants to compare the checklist with the simpler sample workspace.',
  'revisited',
  'Compare first-session completion before and after the change.',
  CURRENT_DATE + INTERVAL '7 days',
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM decisions WHERE title = 'Revisit the onboarding checklist');

INSERT INTO evidence_links (decision_id, label, url, source_type, note)
SELECT d.id, 'Fictional interview notes', 'https://example.com/decision-trail/interviews/onboarding', 'research', 'Sample evidence link for the portfolio demo.'
FROM decisions d
WHERE d.title = 'Show new teams value sooner'
  AND NOT EXISTS (
    SELECT 1 FROM evidence_links e WHERE e.decision_id = d.id AND e.url = 'https://example.com/decision-trail/interviews/onboarding'
  );

INSERT INTO evidence_links (decision_id, label, url, source_type, note)
SELECT d.id, 'Fictional usage dashboard', 'https://example.com/decision-trail/dashboards/export-requests', 'analytics', 'Sample evidence link for the portfolio demo.'
FROM decisions d
WHERE d.title = 'Wait before building CSV export'
  AND NOT EXISTS (
    SELECT 1 FROM evidence_links e WHERE e.decision_id = d.id AND e.url = 'https://example.com/decision-trail/dashboards/export-requests'
  );

INSERT INTO evidence_links (decision_id, label, url, source_type, note)
SELECT d.id, 'Fictional checklist review', 'https://example.com/decision-trail/research/checklist-review', 'document', 'Sample evidence link for the portfolio demo.'
FROM decisions d
WHERE d.title = 'Revisit the onboarding checklist'
  AND NOT EXISTS (
    SELECT 1 FROM evidence_links e WHERE e.decision_id = d.id AND e.url = 'https://example.com/decision-trail/research/checklist-review'
  );
