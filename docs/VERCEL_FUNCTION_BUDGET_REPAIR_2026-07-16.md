# Vercel function-budget repair · 2026-07-16

## Failure received

The production deployment at commit `8b42bc1` was rejected by the Vercel Hobby-plan ceiling because the repository exposed more than twelve deployable files under the root `api/` directory while the deployment test counted only entries explicitly listed in `vercel.json.functions`.

## Repair

- Restored the TD613 operating budget to **11 deployable functions** with **1 reserved slot**.
- Moved shared Gemini/Hush/Kʰonapolit implementations, helper guards, receipt metadata, and model-policy utilities to `server/`.
- Preserved public routes through four thin `api/` boundary wrappers.
- Retired `api/hush-generate-strict-pr124.js` while preserving its legacy URL as a rewrite to `/api/hush-generate-strict`.
- Removed the redundant `api/hush-generate.js` function while retaining its rewrite to `/api/hush-generate-quality`.
- Collapsed Kʰonapolit onto the canonical `/api/khonapolit` function while preserving `/api/khonapolit-quality` as an alias rewrite.
- Strengthened deployment hygiene so CI counts actual deployable `api/` files rather than only configured overrides.

## Governing count

`11 active + 1 reserved = 12 absolute ceiling`

Marked ⟐
