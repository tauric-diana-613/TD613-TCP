# Giving UX + resilience follow-up — continuation packet

**PR:** #640 · `agent/giving-ux-resilience` → `main`  
**Operator authorization:** implement all items below, merge to `main`, and deploy exactly once to Vercel after verification.  
**Release scope:** Giving-only. Do not run Ash, Dome, Flow, A14, full-repository, or self-hosted product witnesses.

This file is the authoritative handoff if the originating agent runs out of usage. Preserve the operator’s order: complete Priority A before spending time on Priority B.

## Confirmed product decisions

1. `/giving/history` must redirect to `/giving/history/`; a rewrite is not sufficient because relative asset URLs can render an unstyled ingress membrane in some browsers.
2. Remove the `All electronically available*` date button. Keep 2020/2022/2024/current-year quick starts. The coverage chip should end `source-receipt bounded.*`, followed by a short note explaining that the custodian receipt—not the requested year—defines actual searchable coverage.
3. Candidate & committee lookup must permit multi-selection at every level:
   - any combination of Federal, State, and Municipal top-level lanes;
   - multiple states (or all states) in the existing state-menu visual language;
   - multiple county/city custodians (or all) within the compact `Municipal` umbrella;
   - only selected lanes/sources are called.
4. `Municipal` is the compact UI label only. Its picker options stay jurisdiction-specific and concise: `Leon County`, `Hillsborough County`, `North Port`, etc. Do not show repeated `City of`, `Supervisor of Elections`, or source-family prose in the option label.
5. Contribution/expenditure is a single-choice lane, but must be a compact segmented control rather than a large native select.
6. Committee search starts by switching the main workspace to Committee Ledger. Campaign/committee searches never clear Contributions. Contribution searches never clear the Committee list.
7. The stored identity enum remains `CANDIDATE` for compatibility, but every operator-facing donor-record label becomes `Match`/`MATCH` to avoid confusion with political candidates.
8. Campaign Deputy Giving History remains distinct from Campaign Deputy Contributions.

## Production observations already captured

- At a 1600×1000 viewport the control rail remains approximately 342px wide. The current two-column scope grid forces native Jurisdiction and Ledger `<select>` controls into tall, Google-Forms-like boxes and makes an expanded county radio menu visually collide with the lane field.
- Production currently contains separate rewrites for `/giving/history` and `/giving/history/`; the slashless rewrite serves HTML at the non-directory URL and causes the relative-asset failure.
- The all-history control is injected at runtime by `giving-search-controls.js` and sets `1979-01-01`.
- Current campaign lookup stores one `selectedCampaignState`, one `selectedLocalSourceId`, and reads one native `campaignDirectoryJurisdiction` select. It therefore cannot satisfy multi-jurisdiction search.
- Current State lookup makes candidate and committee projections, while County/City makes only a committee projection. A local empty result is rendered as a successful-looking no-op, and one rejected call aborts the entire lookup.
- Production status showed `Operator session is not valid` after a test lookup; preserve explicit session errors, but never let a single source failure prevent other selected jurisdictions from rendering.

## Priority A — implement first

### A1. Canonical slash redirect

Files: `vercel.json`, `tests/vercel-deploy-hygiene.test.mjs`.

- Add permanent redirect `{ "source": "/giving/history", "destination": "/giving/history/", "permanent": true }`.
- Remove the slashless Giving rewrite; retain `/giving/history/` and `/giving/history/(.*)` rewrites.
- Retain no-store/noindex headers for the ingress surface.
- Add a redirect assertion and make the old slashless rewrite assertion fail if reintroduced.
- Acceptance: slashless production request redirects before HTML is served and the destination loads styled assets below `/giving/history/`.

### A2. Date-rail cleanup

Files: `app/giving/history/giving-search-controls.js`, `app/giving/history/index.html`, `app/giving/history/giving-clarity.css`, `tests/giving-interpretation-ux.test.mjs`.

- Delete `EARLIEST_SUPPORTED_REQUEST_FROM`, the earliest preset button/listener, and the old injected note.
- Keep the 2020 default and year presets.
- Render `Requested coverage: YYYY → … · actual coverage is source-receipt bounded.*`.
- Put directly below it: `* Each custodian receipt—not the requested year—defines the searchable coverage actually returned.`

### A3. Candidate & committee redesign + true multi-source execution

Files: `index.html`, `giving-campaign-tools-v2.js`, `giving-campaign-tools-v2.css`, `giving-clarity.css`, `tests/giving-interpretation-ux.test.mjs`, plus a focused behavior test if cleanly extractable.

UI:

- Replace Jurisdiction `<select>` with small checkbox chips: `Federal`, `State`, `Municipal`.
- Replace Ledger `<select>` with small radio chips: `Contributions`, `Expenditures`.
- Preserve the State details-menu visual language, but use checkboxes and tiny `All`/`Clear`; summary shows `FL`, `3 states`, or `All states`.
- Combine VoterFocus + EasyVote into one Municipal details menu using checkboxes and `All`/`Clear`. VoterFocus label → `<jurisdiction> County`; EasyVote label → city only, stripping `City of` and county suffix.
- Keep one clean column inside the 342px rail; chips may wrap, no two large boxes share a row.

State model:

- Replace `selectedCampaignState` with `Set(['FL'])`.
- Replace `selectedLocalSourceId` with `Set()` of registry source IDs.
- Add helpers returning checked top-level lanes, states, and municipal sources.
- Never silently select a source after operator Clear.

Execution:

- At submit start, immediately click `[data-view="ledger"]`.
- Build bounded tasks from checked lanes. Federal uses an unfiltered request when appropriate or checked-state requests without duplicating OpenSecrets aggregate work. State runs every selected/wired state custodian. Municipal runs every checked VoterFocus/EasyVote source.
- State/Municipal tasks issue both candidate and committee facets, not committee-only.
- Use `Promise.allSettled`; preserve each source success/partial/error independently.
- Merge fulfilled identities into one Committee snapshot. One rejected source yields a visible held-source status without erasing successes or crashing the page.
- Empty success explicitly says `No matching filer identity returned from <source>`.
- Keep PR #639 Hold law: Hold OFF replaces on next logical lookup; Hold ON appends. One multi-jurisdiction submit is one logical lookup snapshot containing multiple source receipts.
- Normalize the merged payload as `{ candidates, committees, opensecrets, records, source_results }` or equivalent. Preserve FEC candidate metadata/committee IDs. Deduplicate local filers by normalized label **and source ID**.

### A4. Committee Ledger toolbar

Files: `index.html`, `giving-clarity.css`, `tests/giving-interpretation-ux.test.mjs`.

- Replace the chaotic wrapping row with `.committee-ledger-toolbar` groups:
  - list: tiny adjacent `Hold` + `Clear`;
  - view: tiny `Date ↓/↑`;
  - export: primary `CD import .zip`, `Reviewed .csv`, and compact `Forensic ▾` details holding Spreadsheet, CSV, Encrypted JSON.
- Keep existing IDs so handlers remain wired.
- Desktop is calm; narrow screens collapse into ordered rows.

## Priority B — same PR

### B5. Readiness tooltip

File: `giving-clarity.css`. Hover delay ~500ms; keyboard `:focus-within` immediate via separate rules. Keep narrow tooltip left-hugging.

### B6. Campaign Deputy API key path

Files: `docs/GIVING_HISTORY_ENGINE.md`; add `docs/CAMPAIGN_DEPUTY_API_KEY_SETUP.md`; only add a workflow if it provably never echoes the secret.

- Runtime reads `process.env.CAMPAIGN_DEPUTY_API_KEY` in `server/giving/campaign-deputy.js` and `server/giving/campaign-directory.js`.
- GitHub secret creation alone does not install a Vercel environment variable or trigger a workflow.
- Provide a direct Vercel project Environment Variables link and exact settings: `CAMPAIGN_DEPUTY_API_KEY`, Sensitive, Production, then intentionally redeploy current `main` once.
- A direct GitHub repository-secret link may be offered only if a verified installer workflow exists. Never claim one-step installation when the platforms cannot guarantee it.
- Never create committed `.env`, issue, PR-comment, log, or browser-form paths for the key.

### B7. Child-legible Vault insert

Files: `index.html`, `giving-clarity.css`, Vault/interpretation tests.

Before the Vault grid add three compact beats: `Lock here` (browser encrypts), `Store the sealed copy` (TD613 receives ciphertext + ancestry), `Unlock here` (passphrase stays in browser memory and cannot be recovered). Include: `Think of the Vault as a locked field case: TD613 can shelve the case and track its versions, but only your passphrase opens what is inside.` Use Giving-local markup only; import no Dome runtime.

### B8. Contact Queue holds/crashes + batching truth

Files: `giving-contact-queue.js`, possibly `giving-app.js`, queue/surface tests.

Current truth:

- Queue is client orchestration: contacts run sequentially; each contact submits the normal search, which fans out over selected sources. It is **not** one FEC/EasyVote upstream API call for the whole list.
- Provider searches remain per contributor/source; server-side batching could reduce browser orchestration but would still perform bounded provider requests per contact/source and must retain partitioned receipts.

Repair:

- Queue completion/error detection must wait for the same final run-settled signal as direct search.
- Wrap each contact in its own `try/catch/finally`; only that contact becomes `HELD`, form is restored, then queue continues unless Stop requested.
- Prevent adapter rejection, form rejection, observer, or stale DOM errors from escaping/crashing the page.
- Yellow source hold appears only when the direct search would finish partial/error/held—not from intermediate RUNNING state.
- Reuse direct-search retry bounds. Final queue message reports complete/held counts and held custodians; failures never become zero-giving claims.

### B9. Rename visible donor state to Match

Files: `index.html`, `giving-app.js` (`identityStatusLabel`), display tests.

Visible donor-record `Candidate` becomes `Match`; serialized `IDENTITY_STATUS.CANDIDATE` remains unchanged. Political candidate wording in Candidate & committee lookup remains Candidate.

### B10. Auto-tab + State/Municipal apparent no-op

Mostly A3, plus:

- Switch to Committee Ledger at submit start and show an immediate pending summary.
- Florida State searches project both candidate and PC queries.
- Hillsborough candidate/campaign and Florida PC tests must yield either normalized identities or explicit empty/held explanations.
- Never clear loaded Contributions during lookup.

## Verification

Local minimum: all 13 `test:giving` files from `package.json`; `giving-fec-boundary-page`; `giving-source-budget-hotfix`; `giving-validation-scope`; `vercel-deploy-hygiene`; `vercel-operator-release-gate`; `vercel-relock-safety`; `workflow-estate`; `release-manifest`.

Browser:

- 1600×1000 expanded layout; inspect Campaign/PC panel and Committee toolbar.
- Narrow/mobile breakpoint; no horizontal overflow.
- Slashless URL redirects before ingress HTML.
- Multi-jurisdiction fulfilled + partial + rejected tasks retain source-specific state.
- Queue scenario: success, held source, later success; page remains alive and partitions separate.

## GitHub / release sequence

1. Commit Priority A first as a coherent continuation milestone.
2. Complete Priority B and update this checklist.
3. Run Giving-only CI; resolve every actionable PR thread.
4. Mark ready; squash-merge exact reviewed head.
5. Trigger exactly one `/td613-vercel-release PRODUCTION <merge_sha>` on established release issue.
6. Require: `validation_scope = giving`, `deployment_count = 1`, `exact_source_content = PASS`, `production_giving_history = PASS`, unrelated witnesses `NOT_APPLICABLE`.
7. Verify relock commit and `"git": { "deploymentEnabled": false }` on `main`.

## Never regress

- Contributions Hold and Committee Hold independent/default OFF.
- Committee searches never clear Contributions; Contributions never clear Committee list.
- Committee Hold appends logical searches; Hold OFF replaces only at next lookup.
- Committee Clear asks `Clear List?`.
- Excluded records stay out of ordinary exports/totals.
- Giving History remains distinct from Campaign Deputy Contributions.
- Partial/error source states never become zero-giving claims.
