# Manual Gemini observation chamber

𝌋 · successor to merged #1080 (`b3938b920b765a41ea942a631ab429c4fc76feea`)

## Boundary

The operator authorized GitHub Actions as the non-production metadata observation
environment. The existing TD613 Consolidated Validation workflow gains the manual
mode `gemini-observation`. Its observation job accepts only dispatches on main,
checks out the triggering exact SHA, uses read-only contents permission, installs
no repository dependencies, and runs only `node scripts/observe-gemini-models.mjs`.
Ordinary validation jobs are excluded from that mode. Its run-specific concurrency
group cannot cancel a validation run or another independent observation.

The job binds to GitHub Environment `gemini-observation`. Only the observation
step receives that environment's `GEMINI_API_KEY` secret. It calls models.list
only, never generateContent. The artifact contains one sanitized JSON file with
source SHA, run ID/attempt, observation times, completeness, and returned models.
HTTP/transport failure yields a bounded error receipt; it never becomes a complete
empty catalog. The key and its cache-scope digest never leave the reader.

No provider preference, release gate, deployment, fifth workflow, or Vercel action
is introduced. Existing #1080 remains immutable. Listing conveys credential-scoped
visibility at observation time only. Quota, quality, future availability, routing
superiority, release, production readiness, empirical exteriority and Golden-Egg
completion remain outside the receipt's claim ceiling.

## Required human setup

A repository administrator must create/configure Environment `gemini-observation`
and place `GEMINI_API_KEY` in its **environment secrets**, server-side. Limit allowed
deployment branches for this environment to main. The environment name is a GitHub
secret/protection scope; this job performs no application deployment.

GitHub resolves same-name environment secrets ahead of repository/organization
secrets. The workflow cannot independently attest which secret scope supplied a
value. The administrator must confirm environment provisioning before the first
dispatch; do not rely on a same-name repository/organization secret as fallback.
If an environment reviewer is configured, that approval remains a human step.
Never send the raw key through chat or repository content.

## Exact execution sequence

1. Validate this successor through Draft Static, same-head Ready browser matrix,
   and full convergence, then guarded merge.
2. Confirm environment setup with the administrator; no assumed secret custody.
3. Fetch current main and dispatch `td613-ci.yml` on main with mode
   `gemini-observation` under the operator's explicit observation authorization.
4. Record the run's actual source SHA; confirm artifact custody matches that SHA
   and its run ID/attempt. Head movement never rewrites the observation's source.
5. Require successful, complete listing before comparing against shared registry
   and fresh official Google lifecycle evidence. Preserve failed acquisition.
6. Continue to a separate routing/lifecycle and bounded task-quality chamber.

Missing environment/key or approval holds the acquisition. No secret is required
for deterministic PR tests. Test fixtures use synthetic provider responses and
grant zero live provider evidence.

Sealed ⟐
