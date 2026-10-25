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

INSERT INTO decisions (
  title, problem, chosen_option, alternatives, rationale, status, success_measure, review_date, created_at
)
SELECT
  sample.title,
  sample.problem,
  sample.chosen_option,
  sample.alternatives,
  sample.rationale,
  sample.status,
  sample.success_measure,
  sample.review_date,
  sample.created_at
FROM (
  VALUES
    ('Let new members skip invites', 'Some people want to explore before inviting teammates.', 'Allow invites to be skipped during setup.', 'Require invites; show a reminder later.', 'The fictional team wants people to reach the product before asking for collaboration.', 'decided', 'More new members reach their first project.', CURRENT_DATE + INTERVAL '21 days', NOW() - INTERVAL '20 days'),
    ('Add a template gallery', 'New teams are unsure how to start a project.', 'Offer a small set of ready-made templates.', 'Keep a blank project; add a long tutorial.', 'Templates may make the first useful action clearer.', 'proposed', 'More new teams create a first project.', CURRENT_DATE + INTERVAL '18 days', NOW() - INTERVAL '19 days'),
    ('Keep the free plan to three projects', 'The team needs a clear limit for the free plan.', 'Keep the current three-project limit for now.', 'Raise the limit; remove it entirely.', 'The sample team will review support requests before changing the limit.', 'decided', 'Track upgrade requests from teams at the limit.', CURRENT_DATE + INTERVAL '30 days', NOW() - INTERVAL '18 days'),
    ('Send one daily notification digest', 'Frequent notifications distract people during focused work.', 'Group low-priority notifications into one daily digest.', 'Send each notification immediately; turn them all off.', 'The fictional team wants to reduce interruptions while keeping updates visible.', 'revisited', 'Fewer notification mutes without slower responses.', CURRENT_DATE + INTERVAL '15 days', NOW() - INTERVAL '17 days'),
    ('Delay calendar integration', 'The team has not confirmed which calendar use case matters most.', 'Wait for more evidence before building an integration.', 'Build calendar sync; add a simple export.', 'The team wants to avoid maintaining an integration before demand is clear.', 'proposed', 'Confirm the leading calendar use case with users.', CURRENT_DATE + INTERVAL '14 days', NOW() - INTERVAL '16 days'),
    ('Put search on every page', 'People have to return to the main page to find an item.', 'Make search available throughout the app.', 'Keep search on the main page; add more filters.', 'Reducing navigation may help people find their work faster.', 'decided', 'Reduce time to reopen a recently used item.', CURRENT_DATE + INTERVAL '28 days', NOW() - INTERVAL '15 days'),
    ('Remember the last-used filters', 'People repeatedly reselect the same list filters.', 'Keep the filters for the current browser session.', 'Always reset filters; save them permanently.', 'A session-only choice offers convenience without a settings screen.', 'decided', 'Fewer repeated filter changes per visit.', CURRENT_DATE + INTERVAL '20 days', NOW() - INTERVAL '14 days'),
    ('Keep shared links private by default', 'A shared link could expose work to unintended viewers.', 'Require the owner to enable link access deliberately.', 'Make every new link public; ask after sharing.', 'The team prefers a clear privacy choice before information is shared.', 'decided', 'No accidental public links in support reports.', CURRENT_DATE + INTERVAL '35 days', NOW() - INTERVAL '13 days'),
    ('Add CSV export', 'Some teams need to review their project list outside the app.', 'Explore a basic CSV export for project lists.', 'Build spreadsheet sync; keep data in the app only.', 'A small export may serve the need without a long-running integration.', 'proposed', 'Confirm export requests and successful downloads.', CURRENT_DATE + INTERVAL '24 days', NOW() - INTERVAL '12 days'),
    ('Show estimates before task creation', 'People discover time estimates only after creating a task.', 'Show the estimate field in the creation form.', 'Keep estimates in task details; remove estimates.', 'Showing the choice earlier may reduce later editing.', 'decided', 'Fewer tasks edited just to add an estimate.', CURRENT_DATE + INTERVAL '16 days', NOW() - INTERVAL '11 days'),
    ('Add labels to saved searches', 'Saved searches become hard to recognize as the list grows.', 'Allow a short label for each saved search.', 'Use the query text as its name; cap the number saved.', 'A label helps people recognize why they saved a search.', 'proposed', 'People reopen saved searches more often.', CURRENT_DATE + INTERVAL '19 days', NOW() - INTERVAL '10 days'),
    ('Support keyboard navigation in task lists', 'Some people want to move through tasks without a mouse.', 'Add keyboard navigation to the task list.', 'Keep mouse-only controls; add more shortcuts later.', 'Keyboard access can make repeated list work faster.', 'decided', 'More tasks opened through keyboard controls.', CURRENT_DATE + INTERVAL '25 days', NOW() - INTERVAL '9 days'),
    ('Remove a duplicate confirmation step', 'People confirm the same action twice in a common flow.', 'Keep one clear confirmation before the action.', 'Remove both confirmations; keep both.', 'One well-placed check should prevent mistakes without slowing everyone down.', 'decided', 'Fewer abandoned flows with no rise in mistaken actions.', CURRENT_DATE + INTERVAL '22 days', NOW() - INTERVAL '8 days'),
    ('Review checklist timing after setup', 'The checklist may repeat instructions already shown in setup.', 'Review the checklist after observing first-time use.', 'Keep it unchanged; remove it now.', 'The team needs evidence about whether the checklist helps people finish setup.', 'revisited', 'Compare setup completion with checklist use.', CURRENT_DATE + INTERVAL '10 days', NOW() - INTERVAL '7 days'),
    ('Allow bulk closing completed tasks', 'People spend time closing completed tasks one at a time.', 'Add a bulk close action for selected tasks.', 'Keep one-at-a-time actions; auto-close everything.', 'A selected bulk action may save time while keeping control with the user.', 'decided', 'Fewer clicks to clear completed work.', CURRENT_DATE + INTERVAL '26 days', NOW() - INTERVAL '6 days'),
    ('Keep the dashboard layout fixed for now', 'Several layout choices could make the first version harder to understand.', 'Launch with one clear dashboard layout.', 'Add a layout editor; offer several preset layouts.', 'The team wants to learn which information matters before adding customization.', 'proposed', 'See whether users can find their next action quickly.', CURRENT_DATE + INTERVAL '17 days', NOW() - INTERVAL '5 days'),
    ('Show who last edited a decision', 'A team may not know who to ask about a recent change.', 'Show the editor and last-updated time.', 'Keep only the original author; add a full activity feed.', 'A small update detail may answer the immediate ownership question.', 'decided', 'Fewer questions about who changed a record.', CURRENT_DATE + INTERVAL '23 days', NOW() - INTERVAL '4 days'),
    ('Add a review date to decisions', 'Some decisions are never checked again after they are made.', 'Allow an optional date to revisit a decision.', 'Require every decision to have a date; do not track reviews.', 'An optional reminder point makes it easier to revisit decisions that may change.', 'decided', 'More decisions revisited near their chosen date.', CURRENT_DATE + INTERVAL '29 days', NOW() - INTERVAL '3 days'),
    ('Ask for a reason when reversing a decision', 'A changed decision can lose the context behind the change.', 'Prompt for a short reason when marking a decision revisited.', 'Allow silent status changes; add a full audit log.', 'A brief reason can preserve context without a larger history feature.', 'proposed', 'Revisited decisions include an explanation.', CURRENT_DATE + INTERVAL '12 days', NOW() - INTERVAL '2 days'),
    ('Link to existing evidence', 'Copying research and dashboard content creates duplicate records.', 'Store a label and link to the original evidence.', 'Copy all evidence into the decision tool; use plain notes only.', 'Keeping the original source avoids duplicate content and points teammates to the source.', 'decided', 'Decision records with at least one useful source link.', CURRENT_DATE + INTERVAL '27 days', NOW() - INTERVAL '1 day')
) AS sample(title, problem, chosen_option, alternatives, rationale, status, success_measure, review_date, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM decisions existing WHERE existing.title = sample.title
);

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
