# TD613 Routes

## Routing architecture

- Deployment: Vercel static assets plus eleven serverless API files.
- Frontend routing: no client router. URLs are Vercel rewrites into standalone HTML documents.
- Catch-all: /(.*) → /app/$1.
- Giving is deliberately unlinked and resolves through exact /giving/history routes.
- Dome-World and Flight use server-injected shells for production routes; source HTML remains present for local fixtures and tests.

## Key routes

| URL | Entry | Summary |
|---|---|---|
| / | app/index.html | Public TD613 gateway and chamber ingress. |
| /giving/history/ | app/giving/history/index.html | Private signed-session contribution research ledger; intentionally absent from public navigation. |
| /hush.html | app/hush.html | Current Hush product shell, persona gallery, readiness and evidence cockpit. |
| /adversarial-bench.html | app/adversarial-bench.html | Main Hush transformation console. |
| /hush-packet-dashboard.html | app/hush-packet-dashboard.html | Hush packet/evidence dashboard. |
| /aperture/ | app/aperture/index.html | Aperture loader; resolves the instrument contract and tool. |
| /homebase.html | app/homebase.html | TD613 Homebase overview and launch surface. |
| /dome-world/ | api/dome-world-shell.js (production) | Server-injected Dome-World shell; source app/dome-world/index.html is a local fixture/source surface. |
| /safe-harbor/td613-flight.html | api/flight-html.js (production) | Android-aware injected Safe Harbor Flight surface. |
| /readout.html | app/readout.html | Operator readout/report surface. |

## Static document inventory

| Inferred URL | Source | Layout |
|---|---|---|
| /adversarial-bench.html | app/adversarial-bench.html | Standalone static document |
| /aperture/ | app/aperture/index.html | Standalone static document |
| /aperture/tool.html | app/aperture/tool.html | Standalone static document |
| /clone.html | app/clone.html | Standalone static document |
| /deck.html | app/deck.html | Standalone static document |
| /dome-world/admissibility-tomography.html | app/dome-world/admissibility-tomography.html | Standalone static document |
| /dome-world/ash-custody-pedagogue.html | app/dome-world/ash-custody-pedagogue.html | Standalone static document |
| /dome-world/ash-custody-v07.html | app/dome-world/ash-custody-v07.html | Standalone static document |
| /dome-world/ash-custody-v08.html | app/dome-world/ash-custody-v08.html | Standalone static document |
| /dome-world/ash-custody.html | app/dome-world/ash-custody.html | Standalone static document; rewrite → /app/dome-world/ash-custody-v08.html |
| /dome-world/ash-destination-handoff.html | app/dome-world/ash-destination-handoff.html | Standalone static document |
| /dome-world/ash-destination-recipient.html | app/dome-world/ash-destination-recipient.html | Standalone static document |
| /dome-world/ash-keep-entry.html | app/dome-world/ash-keep-entry.html | Standalone static document |
| /dome-world/ash-keep-source.html | app/dome-world/ash-keep-source.html | Standalone static document |
| /dome-world/ash-keep.html | app/dome-world/ash-keep.html | Standalone static document; rewrite → /api/dome-world-shell?surface=ash-keep-html |
| /dome-world/ash-threshold.html | app/dome-world/ash-threshold.html | Standalone static document; rewrite → /api/dome-world-shell?surface=ash-keep-html |
| /dome-world/domeblox/forward-battery/ | app/dome-world/domeblox/forward-battery/index.html | Standalone static document |
| /dome-world/domeblox/ | app/dome-world/domeblox/index.html | Standalone static document |
| /dome-world/fixtures/pedagogue/baselines/ash-custody-root-dom-fixture.html | app/dome-world/fixtures/pedagogue/baselines/ash-custody-root-dom-fixture.html | Standalone static document |
| /dome-world/flow-core-context.html | app/dome-world/flow-core-context.html | Standalone static document; rewrite → /app/dome-world/flow-core-context.html |
| /dome-world/flowcore-promotion-dashboard.html | app/dome-world/flowcore-promotion-dashboard.html | Standalone static document |
| /dome-world/flowcore-validation-lab.html | app/dome-world/flowcore-validation-lab.html | Standalone static document |
| /dome-world/ | app/dome-world/index.html | Standalone static document; rewrite → /api/dome-world-shell |
| /dome-world/information-dome-pedagogue.html | app/dome-world/information-dome-pedagogue.html | Standalone static document |
| /dome-world/marrowline.html | app/dome-world/marrowline.html | Standalone static document |
| /dome-world/physical-flowcore.html | app/dome-world/physical-flowcore.html | Standalone static document |
| /dome-world/reciprocal-bridge.html | app/dome-world/reciprocal-bridge.html | Standalone static document; rewrite → /app/dome-world/reciprocal-bridge.html |
| /dome-world/relation-envelope.html | app/dome-world/relation-envelope.html | Standalone static document |
| /dome-world/route-burden-observatory.html | app/dome-world/route-burden-observatory.html | Standalone static document |
| /dome-world/station-propagation-observatory.html | app/dome-world/station-propagation-observatory.html | Standalone static document |
| /giving/history/ | app/giving/history/index.html | Giving operator shell; rewrite → /app/giving/history/index.html |
| /homebase.html | app/homebase.html | Standalone static document |
| /hush-packet-dashboard.html | app/hush-packet-dashboard.html | Standalone static document |
| /hush.html | app/hush.html | Hush product shell |
| / | app/index.html | Public gateway shell |
| /readout.html | app/readout.html | Standalone static document |
| /safe-harbor/ash-keep-recovery.html | app/safe-harbor/ash-keep-recovery.html | Standalone static document |
| /safe-harbor/ | app/safe-harbor/index.html | Standalone static document |
| /safe-harbor/reference/TD613_offline_capsule.html | app/safe-harbor/reference/TD613_offline_capsule.html | Standalone static document |
| /safe-harbor/reference/TD613_verify.html | app/safe-harbor/reference/TD613_verify.html | Standalone static document |
| /safe-harbor/td613-flight.html | app/safe-harbor/td613-flight.html | Standalone static document; rewrite → /api/flight-html |
| /trainer.html | app/trainer.html | Standalone static document |

## Vercel rewrite map

| Source | Destination |
|---|---|
| /api/dome-world/ash-custody-register | /api/ash-local-commitment-guard |
| /api/dome-world/ash-custody-replay | /api/ash-local-commitment-guard |
| /api/dome-world/ash-custody-migrate | /api/ash-local-commitment-guard |
| /api/ash-local-commitment | /api/ash-local-commitment-guard |
| /api/dome-world-engine | /api/dome-world-engine-guard |
| /api/flowcore-context | /api/dome-world-engine-guard?operation=flowcore-context |
| /api/dome-world/flowcore-context | /api/dome-world-engine-guard?operation=flowcore-context |
| /api/aperture-bridge | /api/dome-world-engine-guard?operation=aperture-bridge-readiness |
| /api/dome-world/aperture-bridge | /api/dome-world-engine-guard?operation=aperture-bridge-readiness |
| /api/hush-generate | /api/hush-generate-quality |
| /api/hush-generate-budgeted | /api/hush-generate-quality |
| /api/dome-world/khonapolit | /api/khonapolit |
| /api/dome-world/marrowline | /api/marrowline |
| /api/dome-world/ping | /api/dome-world-engine-guard?operation=ping |
| /api/dome-world/readiness | /api/dome-world-engine-guard?operation=readiness |
| /api/dome-world/step2-readiness | /api/dome-world-engine-guard?operation=step2-readiness |
| /api/dome-world/(.*) | /api/dome-world-engine-guard?operation=$1 |
| /dome-world | /api/dome-world-shell |
| /dome-world/ | /api/dome-world-shell |
| /dome-world/index.html | /api/dome-world-shell |
| /app/dome-world/index.html | /api/dome-world-shell |
| /dome-world/ash-threshold.html | /api/dome-world-shell?surface=ash-keep-html |
| /app/dome-world/ash-threshold.html | /api/dome-world-shell?surface=ash-keep-html |
| /dome-world/ash-keep.html | /api/dome-world-shell?surface=ash-keep-html |
| /app/dome-world/ash-keep.html | /api/dome-world-shell?surface=ash-keep-html |
| /dome-world/ash-keep.js | /api/dome-world-shell?surface=ash-keep-js |
| /app/dome-world/ash-keep.js | /api/dome-world-shell?surface=ash-keep-js |
| /dome-world/ash-custody.html | /app/dome-world/ash-custody-v08.html |
| /app/dome-world/ash-custody.html | /app/dome-world/ash-custody-v08.html |
| /dome-world/flow-core-context.html | /app/dome-world/flow-core-context.html |
| /dome-world/reciprocal-bridge.html | /app/dome-world/reciprocal-bridge.html |
| /dome-world/(.*) | /app/dome-world/$1 |
| /api/hush-generate-strict-pr124 | /api/hush-generate-strict |
| /api/khonapolit-quality | /api/khonapolit |
| /api/gemini-readiness | /api/khonapolit?operation=gemini-readiness |
| /api/(.*) | /api/$1 |
| /safe-harbor/td613-flight.html | /api/flight-html |
| /app/safe-harbor/td613-flight.html | /api/flight-html |
| /giving/history | /app/giving/history/index.html |
| /giving/history/ | /app/giving/history/index.html |
| /giving/history/(.*) | /app/giving/history/$1 |
| /app/(.*) | /app/$1 |
| /(.*) | /app/$1 |

## Full routing/deployment configuration

~~~json
{
  "version": 2,
  "functions": {
    "api/hush-generate-strict.js": {
      "maxDuration": 60
    },
    "api/hush-generate-quality.js": {
      "maxDuration": 60
    },
    "api/khonapolit.js": {
      "maxDuration": 60
    },
    "api/giving.js": {
      "maxDuration": 30
    },
    "api/marrowline.js": {
      "maxDuration": 10
    },
    "api/dome-world-shell.js": {
      "maxDuration": 10,
      "includeFiles": "app/dome-world/{index.html,ash-keep.html,ash-keep.js}"
    },
    "api/dome-world-engine.py": {
      "maxDuration": 60,
      "includeFiles": "packages/dome_world_exact/**/*.py",
      "excludeFiles": "packages/dome_world_exact/{bridge,fixtures,schemas,tests,verification}/**"
    },
    "api/dome-world-engine-guard.py": {
      "maxDuration": 60,
      "includeFiles": "{api/dome-world-engine.py,packages/dome_world_exact/**/*.py}"
    },
    "api/ash-local-commitment.py": {
      "maxDuration": 60,
      "includeFiles": "packages/dome_world_exact/ash_*.py"
    },
    "api/ash-local-commitment-guard.py": {
      "maxDuration": 60,
      "includeFiles": "{api/ash-local-commitment.py,packages/dome_world_exact/ash_*.py}"
    }
  },
  "headers": [
    {
      "source": "/",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/hush.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/hush.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/hush.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/hush.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/adversarial-bench.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/adversarial-bench.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/safe-harbor",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/safe-harbor/",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/safe-harbor/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/safe-harbor/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/safe-harbor/td613-flight.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/safe-harbor/td613-flight.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/safe-harbor/app/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/safe-harbor/app/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/speed-insights.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/speed-insights.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/safe-harbor/td613-flight-android-scroll-fix.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/safe-harbor/td613-flight-android-scroll-fix.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/safe-harbor/app/safe-harbor-housekeeping.css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/safe-harbor/app/safe-harbor-housekeeping.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/safe-harbor/app/safe-harbor-housekeeping.css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/safe-harbor/app/safe-harbor-housekeeping.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/gateway-housekeeping.css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/gateway-housekeeping.css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/styles.css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/styles.css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/adversarial-bench.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/adversarial-bench.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/adversarial-bench-light.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/adversarial-bench-light.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/adversarial-bench.mjs",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/adversarial-bench.mjs",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/hush-(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/hush-(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/app/engine/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/engine/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/asset-versions.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/asset-versions.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/desktop-visibility-parity.css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/desktop-visibility-parity.css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/dome-world/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/ash-threshold.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/ash-keep.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/ash-keep.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/ash-lifecycle.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/ash-custody.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/dome-world/ash-custody-v07.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/dome-world/ash-custody-v08.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/flow-core-context.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/dome-world/flow-core-context.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/reciprocal-bridge.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/dome-world/reciprocal-bridge.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/ash/local-commitment.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/dome-world/ash/local-commitment.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/ash/canonical-json.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/app/dome-world/ash/canonical-json.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/aperture-bridge",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/dome-world/aperture-bridge",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/dome-world-engine",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/ash-local-commitment",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/flowcore-context",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/dome-world/flowcore-context",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/dome-world-engine-guard",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/ash-local-commitment-guard",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/hush-generate",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/hush-generate-budgeted",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/hush-generate-quality",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/giving/history",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        },
        {
          "key": "X-Robots-Tag",
          "value": "noindex, nofollow, noarchive, nosnippet"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'"
        },
        {
          "key": "Referrer-Policy",
          "value": "no-referrer"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    },
    {
      "source": "/giving/history/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        },
        {
          "key": "X-Robots-Tag",
          "value": "noindex, nofollow, noarchive, nosnippet"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'"
        },
        {
          "key": "Referrer-Policy",
          "value": "no-referrer"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    },
    {
      "source": "/app/giving/history/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        },
        {
          "key": "X-Robots-Tag",
          "value": "noindex, nofollow, noarchive, nosnippet"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'"
        },
        {
          "key": "Referrer-Policy",
          "value": "no-referrer"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    },
    {
      "source": "/api/giving",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        },
        {
          "key": "X-Robots-Tag",
          "value": "noindex, nofollow, noarchive, nosnippet"
        },
        {
          "key": "Referrer-Policy",
          "value": "no-referrer"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    },
    {
      "source": "/api/gemini-readiness",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/marrowline",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/dome-world/marrowline",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/khonapolit",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/dome-world/khonapolit",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/dome-world/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/api/hush-generate-strict-pr124",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/api/khonapolit-quality",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/dome-world/ash-custody-register",
      "destination": "/api/ash-local-commitment-guard"
    },
    {
      "source": "/api/dome-world/ash-custody-replay",
      "destination": "/api/ash-local-commitment-guard"
    },
    {
      "source": "/api/dome-world/ash-custody-migrate",
      "destination": "/api/ash-local-commitment-guard"
    },
    {
      "source": "/api/ash-local-commitment",
      "destination": "/api/ash-local-commitment-guard"
    },
    {
      "source": "/api/dome-world-engine",
      "destination": "/api/dome-world-engine-guard"
    },
    {
      "source": "/api/flowcore-context",
      "destination": "/api/dome-world-engine-guard?operation=flowcore-context"
    },
    {
      "source": "/api/dome-world/flowcore-context",
      "destination": "/api/dome-world-engine-guard?operation=flowcore-context"
    },
    {
      "source": "/api/aperture-bridge",
      "destination": "/api/dome-world-engine-guard?operation=aperture-bridge-readiness"
    },
    {
      "source": "/api/dome-world/aperture-bridge",
      "destination": "/api/dome-world-engine-guard?operation=aperture-bridge-readiness"
    },
    {
      "source": "/api/hush-generate",
      "destination": "/api/hush-generate-quality"
    },
    {
      "source": "/api/hush-generate-budgeted",
      "destination": "/api/hush-generate-quality"
    },
    {
      "source": "/api/dome-world/khonapolit",
      "destination": "/api/khonapolit"
    },
    {
      "source": "/api/dome-world/marrowline",
      "destination": "/api/marrowline"
    },
    {
      "source": "/api/dome-world/ping",
      "destination": "/api/dome-world-engine-guard?operation=ping"
    },
    {
      "source": "/api/dome-world/readiness",
      "destination": "/api/dome-world-engine-guard?operation=readiness"
    },
    {
      "source": "/api/dome-world/step2-readiness",
      "destination": "/api/dome-world-engine-guard?operation=step2-readiness"
    },
    {
      "source": "/api/dome-world/(.*)",
      "destination": "/api/dome-world-engine-guard?operation=$1"
    },
    {
      "source": "/dome-world",
      "destination": "/api/dome-world-shell"
    },
    {
      "source": "/dome-world/",
      "destination": "/api/dome-world-shell"
    },
    {
      "source": "/dome-world/index.html",
      "destination": "/api/dome-world-shell"
    },
    {
      "source": "/app/dome-world/index.html",
      "destination": "/api/dome-world-shell"
    },
    {
      "source": "/dome-world/ash-threshold.html",
      "destination": "/api/dome-world-shell?surface=ash-keep-html"
    },
    {
      "source": "/app/dome-world/ash-threshold.html",
      "destination": "/api/dome-world-shell?surface=ash-keep-html"
    },
    {
      "source": "/dome-world/ash-keep.html",
      "destination": "/api/dome-world-shell?surface=ash-keep-html"
    },
    {
      "source": "/app/dome-world/ash-keep.html",
      "destination": "/api/dome-world-shell?surface=ash-keep-html"
    },
    {
      "source": "/dome-world/ash-keep.js",
      "destination": "/api/dome-world-shell?surface=ash-keep-js"
    },
    {
      "source": "/app/dome-world/ash-keep.js",
      "destination": "/api/dome-world-shell?surface=ash-keep-js"
    },
    {
      "source": "/dome-world/ash-custody.html",
      "destination": "/app/dome-world/ash-custody-v08.html"
    },
    {
      "source": "/app/dome-world/ash-custody.html",
      "destination": "/app/dome-world/ash-custody-v08.html"
    },
    {
      "source": "/dome-world/flow-core-context.html",
      "destination": "/app/dome-world/flow-core-context.html"
    },
    {
      "source": "/dome-world/reciprocal-bridge.html",
      "destination": "/app/dome-world/reciprocal-bridge.html"
    },
    {
      "source": "/dome-world/(.*)",
      "destination": "/app/dome-world/$1"
    },
    {
      "source": "/api/hush-generate-strict-pr124",
      "destination": "/api/hush-generate-strict"
    },
    {
      "source": "/api/khonapolit-quality",
      "destination": "/api/khonapolit"
    },
    {
      "source": "/api/gemini-readiness",
      "destination": "/api/khonapolit?operation=gemini-readiness"
    },
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/safe-harbor/td613-flight.html",
      "destination": "/api/flight-html"
    },
    {
      "source": "/app/safe-harbor/td613-flight.html",
      "destination": "/api/flight-html"
    },
    {
      "source": "/giving/history",
      "destination": "/app/giving/history/index.html"
    },
    {
      "source": "/giving/history/",
      "destination": "/app/giving/history/index.html"
    },
    {
      "source": "/giving/history/(.*)",
      "destination": "/app/giving/history/$1"
    },
    {
      "source": "/app/(.*)",
      "destination": "/app/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/app/$1"
    }
  ],
  "git": {
    "deploymentEnabled": false
  }
}
~~~
