# Extractable TD613 Draft Components

The repository is intentionally vanilla and page-owned. The entries below are extraction candidates for Superdesign; they are not claims that the current code already exports each as an independent component.

## Layout Components

## GivingOperatorMasthead
- Source: app/giving/history/index.html + app/giving/history/giving.css
- Category: layout
- Description: Sticky private-ledger masthead with brand mark, signed-session state, readiness, and session close.
- Extractable props: sessionState, readinessVisible, onReadiness, onCloseSession
- Hardcoded: TD613/Giving labels, typography, icon glyph, visual treatments

## GivingControlRail
- Source: app/giving/history/index.html
- Category: layout
- Description: Dossier custody and deterministic retrieval composer in a compact left rail.
- Extractable props: custodyMode, selectedSourceCount, searchRunning, saveState
- Hardcoded: Field labels, source semantics, custody explanatory copy

## GivingLedgerTabs
- Source: app/giving/history/index.html + app/giving/history/giving-app.js
- Category: layout
- Description: Horizontally scrollable mode switch for source run, identity review, ledger, vault, CRM, and receipts.
- Extractable props: activeView, reviewCount, ledgerCount
- Hardcoded: Tab order and evidence-oriented labels

## HushProductShell
- Source: app/hush.html + app/hush-product-spine.css
- Category: layout
- Description: Rounded dark cockpit shell with product header, evidence panels, and embedded current console.
- Extractable props: routeState, currentSurfaceHref, packetDrawerHref
- Hardcoded: Hush safety posture and panel order

## Basic Components

## SourceRunCard
- Source: app/giving/history/giving-app.js (renderSourceProgress) + app/giving/history/giving.css
- Category: basic
- Description: One source instance's running/complete/failed/partial state, count, continuation, retry, and progress.
- Extractable props: sourceName, jurisdiction, status, recordCount, hasContinuation, retryable, message
- Hardcoded: Status vocabulary and no-zero-assertion behavior

## IdentityRecordCard
- Source: app/giving/history/giving-app.js (renderReview) + app/giving/history/giving.css
- Category: basic
- Description: Contribution evidence row with person, committee, amount, lineage, suggestion reasons, and explicit decision controls.
- Extractable props: identityState, record, suggestionReasons, onDecision
- Hardcoded: CANDIDATE/CONFIRMED/EXCLUDED/UNREVIEWED taxonomy

## CommitteeSummaryCard
- Source: app/giving/history/giving-app.js (renderLedger) + app/giving/history/giving.css
- Category: basic
- Description: Confirmed-only committee total with provisional semantics and record context.
- Extractable props: committeeName, amountCents, recordCount, jurisdiction, provisional
- Hardcoded: Confirmed-only aggregation rule

## ReceiptCard
- Source: app/giving/history/giving-app.js (receiptMarkup) + app/giving/history/giving.css
- Category: basic
- Description: Custody, lineage, refusal, mutation, or error receipt with monospaced detail.
- Extractable props: kind, label, timestamp, detail, expanded
- Hardcoded: Edge-signal grammar and receipt taxonomy

## VaultVersionItem
- Source: app/giving/history/giving-app.js (renderVaultVersions) + app/giving/history/giving.css
- Category: basic
- Description: Hosted encrypted version metadata and ancestry control; never renders plaintext server-side.
- Extractable props: versionId, createdAt, digest, parents, selected, conflict
- Hardcoded: Ciphertext-only custody explanation

## CampaignDeputyPersonOption
- Source: app/giving/history/giving-app.js (renderPeopleIndex) + app/giving/history/giving.css
- Category: basic
- Description: Exact-person selection row for human-reviewed CRM linkage.
- Extractable props: personId, displayName, email, phone, selected
- Hardcoded: Explicit selection and duplicate-review posture

## HushPersonaGallery
- Source: app/hush-persona-gallery.js
- Category: basic
- Description: Responsive 4/2/1-up carousel for custody-aware persona cards.
- Extractable props: masks, activePage, selectedMaskId
- Hardcoded: Navigation glyphs, page-size breakpoints, card semantics

## HushPersonaCard
- Source: app/hush-persona-gallery.js + app/hush-card-grammar.js
- Category: basic
- Description: Story/risk/use card with route warnings and a clear selection gesture.
- Extractable props: card, selected, onSelect
- Hardcoded: Route class names, labels, chip grammar

## HushGeneratorStatusPlate
- Source: app/hush-generator-status-plate.js
- Category: basic
- Description: Live-region provider/action status with info/ok/warning/error edge signals.
- Extractable props: message, tone
- Hardcoded: Placement contract and glow styling

## EvidenceStatusBadge
- Source: app/giving/history/giving.css and app/hush-visual-system.css
- Category: basic
- Description: Compact semantic status indicator that always pairs color with text.
- Extractable props: status, label, count
- Hardcoded: Status palette and uppercase mono label grammar
