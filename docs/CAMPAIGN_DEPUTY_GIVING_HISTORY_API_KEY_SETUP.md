# Campaign Deputy API key setup for TD613 Giving

This is the bookmarkable setup page for the Campaign Deputy credential used by Giving.

## One safe human step

Open the TD613-TCP Production environment-variable page in Vercel:

**https://vercel.com/tauric-diana-s-projects/td-613-tcp/settings/environment-variables**

Create or update exactly this variable:

```text
CAMPAIGN_DEPUTY_API_KEY
```

Paste the Campaign Deputy API key as the value and scope it to **Production**. Do not paste the key into this repository, a pull request, issue, commit, source file, or chat transcript.

## What happens after saving it

The Giving server already reads `CAMPAIGN_DEPUTY_API_KEY` at runtime. No source-code edit is required. The next authorized Vercel Production deployment will build/run against the Production environment and Campaign Deputy readiness can become configured.

If Vercel offers an explicit redeploy prompt after the variable is saved, do not use that as an independent release path for TD613. Follow the repository's normal operator release gesture so the deployment ceiling, exact-source receipt, production observation, and relock remain intact.

## Verification without exposing the secret

After the authorized release, use Giving's readiness/status path or the Campaign Deputy controls. Verification should report only whether the integration is configured/authorized; it must never echo the credential.

## Why there is no “paste the key into GitHub and install it” box

GitHub repository content and pull-request history are the wrong custody layer for a production API credential. A GitHub-hosted installer would be acceptable only if it wrote directly into Vercel's secret store without ever committing, logging, returning, or rendering the value. This repository does not currently carry such a verified secret-mutation workflow, so the direct Vercel Production environment-variable page above is the shortest safe path.
