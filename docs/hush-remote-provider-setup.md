# TD613 Hush Remote Provider Setup

Phase 35 keeps Hush local-sovereign while allowing an optional remote model to generate candidate rewrites.

The remote model is only a candidate factory. Hush still performs local proposition integrity, literal retention, custody-collapse checks, source-residue checks, mask scoring, and release review.

## Do not paste API keys into the browser

Do not put provider keys in:

- browser UI fields
- localStorage
- committed JavaScript
- committed JSON
- screenshots
- issue comments

The browser calls `/api/hush-generate`. That endpoint reads `process.env.GEMINI_API_KEY` server-side.

## Local setup

Copy the example env file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
GEMINI_API_KEY=your_key_here
HUSH_REMOTE_PROVIDER=gemini
HUSH_REMOTE_MODEL=gemini-1.5-pro-002
```

Run the app behind a server environment that can expose `/api/hush-generate` to the browser while keeping environment variables server-side.

## Static deployment behavior

If the app is served as static files only, remote mode returns a provider-unavailable warning and Hush falls back to local candidates. This is intentional. Static browser deployments cannot protect API keys.

## What gets sent remotely

The remote contract sends only a compact candidate-generation payload:

- source text
- compact mask surface
- protected literal list
- proposition summary
- ontology route payload
- no-invention rules
- forbidden custody-collapse phrases

By default it does not send:

- mask memory
- iteration ledger
- local receipts
- hidden provenance
- full AU ontology
- custom reference samples

## Operator rule

Remote output is never final output by itself.

The flow is:

```text
remote provider candidates
→ local Hush audit
→ local selection / rejection
→ ledger receipt
→ operator review
```

If all candidates fail local audit, Hush should show no approved final output and should offer offline fallback or retry with stricter preservation.
