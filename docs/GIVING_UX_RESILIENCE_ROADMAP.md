# Giving UX + resilience follow-up

This is the durable handoff map for the August 15 Giving follow-up. Keep the change lane Giving-only and do not run Ash, Dome, Flow, or A14 product witnesses.

## Priority A — finish first

- [ ] Canonicalize `/giving/history` to `/giving/history/` with a real redirect so relative assets never resolve against the wrong base path.
- [ ] Remove the `All electronically available*` quick-start button. Keep the ordinary year presets and move a short, relevant `*` note to the source-receipt-bounded coverage sentence.
- [ ] Redesign Candidate & committee lookup for a wide desktop rail: compact segmented jurisdiction toggles (Federal, State, Municipal), compact receipt/expenditure lane toggles, and a clean query field. Jurisdictions are multi-select; only selected lanes run. Municipal uses one combined county/city custodian picker with short labels such as `Leon County` and `North Port`, so unwired API calls are never sprayed across every local custodian.
- [ ] Recompose the Committee Ledger toolbar into deliberate action groups while keeping Hold and Clear tiny and adjacent.

## Priority B — complete in the same PR

- [ ] Delay the Readiness hover tooltip slightly longer while keeping keyboard focus immediate.
- [ ] Provide a direct GitHub Actions environment-secret link and repository guidance for adding `CAMPAIGN_DEPUTY_API_KEY`; never put the key in source, issues, PRs, logs, or browser forms.
- [ ] Add a compact, child-legible Vault explainer using the existing Dome-World pedagogical vocabulary without importing unrelated Dome runtime code.
- [ ] Make queued contact searches use the same source result/error semantics as an individual search, isolate one contact failure from the page/remaining queue, and document that the browser currently performs one bounded search operation per contact rather than one upstream provider call for the entire list.
- [ ] Rename donor identity state `Candidate` to the unambiguous operator label `Match` without changing the stored `CANDIDATE` enum.
- [ ] Switch to Committee Ledger immediately when a Candidate & committee lookup starts; make Florida State and selected county/city lookup results render reliably into the Committee search list, with explicit empty/partial/error status instead of apparent no-op behavior.

## Required verification

- Giving-only static/model/API/import/activity tests.
- Redirect contract for the slashless path.
- Wide desktop and narrow/mobile browser checks.
- Queue failure-isolation regression coverage.
- Campaign lookup multi-jurisdiction and auto-tab regression coverage.
- Exact-source Vercel production verification, one deployment, then Git deployment relock.
