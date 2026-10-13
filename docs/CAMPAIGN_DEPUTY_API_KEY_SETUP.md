# Campaign Deputy API key setup for TD613 Giving

This is the canonical bookmarkable setup page for the Campaign Deputy credential used by Giving.

## One safe human step

Open the TD613-TCP environment-variable page in Vercel:

**https://vercel.com/tauric-diana-s-projects/td-613-tcp/settings/environment-variables**

Create or update exactly this variable:

```text
CAMPAIGN_DEPUTY_API_KEY
```

Set the Vercel variable as:

- **Sensitive:** enabled
- **Environment:** Production

Paste the Campaign Deputy API key as the value. Do not paste the key into this repository, a pull request, issue, commit, source file, browser-visible configuration field, log, or chat transcript.

## What happens after saving it

The Giving server reads `process.env.CAMPAIGN_DEPUTY_API_KEY` at runtime. No source-code edit is required. The next intentionally authorized Vercel Production deployment will run against the Production environment and Campaign Deputy readiness can become configured.

If Vercel offers an explicit redeploy prompt after the variable is saved, do not use that as an independent release path for TD613. Use the repository's normal operator release gesture so the one-deployment ceiling, exact-source receipt, production Giving observation, and relock remain intact.

## Verification without exposing the secret

After the authorized release, use Giving's readiness/status path or the Campaign Deputy controls. Verification may report only whether the integration is configured/authorized. It must never echo the credential.

## Durable replay prerequisite for explicit new-contact creation

`campaign-deputy.create-confirmed` is intentionally treated as a non-idempotent consequential write. Cistern Law therefore requires the existing Giving Neon boundary (`TD613_GIVING_NEON_DATABASE_URL`) to record a digest-only spent-intent tombstone before the external person-create request is admitted. If that durable replay ledger is unavailable, explicit new-contact creation fails closed rather than claiming replay protection it does not have.

Existing-person membership and committee-list routes reconcile destination state before writing and do not claim a durable tombstone merely because the signed browser session rotates its intent.

## Why there is no “paste the key into GitHub and install it” box

GitHub repository content and pull-request history are the wrong custody layer for a production API credential. A GitHub-hosted installer would be acceptable only if it wrote directly into Vercel's secret store without ever committing, logging, returning, or rendering the value. This repository does not currently carry such a verified secret-mutation workflow, so the direct Vercel Production environment-variable page above is the shortest safe path.
