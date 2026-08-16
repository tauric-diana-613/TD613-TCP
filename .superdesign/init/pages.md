# TD613 Page Dependency Trees

Trees include local HTML script/link/iframe dependencies plus recursive ES-module and CSS imports. Repeated dependencies are marked rather than expanded again. Runtime fetches and server-only dependencies remain outside this frontend candidate set.

## / — Public Gateway

Entry: app/index.html

Primary public ingress and TD613 chamber shell.

Dependencies:
- app/asset-versions.js
- app/analytics.js
- app/speed-insights.js
- app/chamber-bootstrap.js

## /giving/history/ — Giving History

Entry: app/giving/history/index.html

Private federated contribution search, human identity closure, committee ledger, encrypted vault, and Campaign Deputy writeback.

Dependencies:
- app/giving/history/giving.css
- app/giving/history/giving-app.js
  - app/giving/history/giving-model.js
  - app/giving/history/giving-api.js
    - app/giving/history/giving-model.js (already listed)
  - app/giving/history/giving-store.js
  - app/giving/history/giving-vault.js

## /hush.html — Hush Product Surface

Entry: app/hush.html

Current Hush launch shell with persona gallery, readiness, evidence cockpit, and embedded console.

Dependencies:
- app/hush-product-spine.css
- app/hush-visual-system.css
- app/hush-mobile-field-deck.css
- app/analytics.js
- app/speed-insights.js
- app/hush.js
  - app/engine/hush-readiness-dashboard.js
  - app/engine/hush-product-state.js
    - app/engine/hush-readiness-dashboard.js (already listed)
  - app/engine/hush-evidence-cockpit.js
    - app/engine/hush-signal-bus.js
    - app/engine/hush-readiness-dashboard.js (already listed)
    - app/engine/hush-narrowing-losses.js
    - app/engine/hush-export-receipt-v2.js
    - app/engine/hush-mask-registry-audit.js
      - app/data/hush-masks.js
      - app/data/hush-phase22-masks.js
      - app/data/hush-phase24-masks.js
      - app/data/hush-phase27-masks.js
      - app/data/hush-phase28-masks.js
      - app/engine/hush-mask-studio.js
        - app/data/hush-masks.js (already listed)
        - app/data/hush-phase22-masks.js (already listed)
        - app/data/hush-phase24-masks.js (already listed)
        - app/data/hush-phase27-masks.js (already listed)
        - app/data/hush-phase28-masks.js (already listed)
        - app/data/hush-mask-traits.js
        - app/engine/stylometry.js
          - app/engine/td613-aperture.js
          - app/engine/generator-v2.js
            - app/engine/td613-aperture.js (already listed)
            - app/engine/stylometry.js (cycle)
            - app/engine/vernacular-ontology.js
            - app/engine/au-forged-ontology.js
        - app/engine/hush-authorship-protection.js
        - app/engine/hush-style-diversity.js
    - app/engine/hush-self-test-harness.js
      - app/engine/hush-signal-bus.js (already listed)
      - app/engine/hush-mask-registry-audit.js (already listed)
      - app/engine/hush-export-receipt-v2.js (already listed)
      - app/engine/hush-docs-memory-check.js
  - app/engine/hush-mask-studio.js (already listed)
  - app/hush-persona-gallery.js
    - app/engine/hush-mask-studio.js (already listed)
    - app/hush-card-grammar.js
- app/adversarial-bench.html
  - app/hush-phase31-1.css
  - app/hush-housekeeping.css
  - app/styles.css
  - app/hush-phase39.css
  - app/hush-visual-system.css (already listed)
  - app/hush-compact.css
  - app/hush-invisible.css
  - app/hush-alien-console.css
  - app/hush-field-instrument.css
  - app/hush-mobile-viewport-fix.css
  - app/hush-phase32.css
  - app/hush-packet-entrypoint.css
  - app/hush-cosmetic-repair.css
  - app/analytics.js (already listed)
  - app/speed-insights.js (already listed)
  - app/chamber-bootstrap.js
  - app/hush-pr123-strict-undefined-fallback.js
  - app/hush-pr168-strict-transform-run-lock.js
  - app/adversarial-bench-light.js
    - app/hush-simple-path.js
    - app/data/hush-masks.js (already listed)
    - app/data/hush-phase22-masks.js (already listed)
    - app/data/hush-phase24-masks.js (already listed)
    - app/data/hush-phase27-masks.js (already listed)
    - app/data/hush-phase28-masks.js (already listed)
    - app/data/hush-mask-traits.js (already listed)
    - app/engine/hush-style-diversity.js (already listed)
    - app/engine/context-profile.js
    - app/engine/iteration-ledger.js
    - app/hush-invisible-shell.js
    - app/hush-alien-console.js
    - app/adversarial-bench.mjs
      - app/engine/stylometry.js (already listed)
      - app/engine/escape-vector.js
        - app/engine/ingestion-friction.js
        - app/engine/hush-source-residue.js
        - app/engine/stylometry.js (already listed)
      - app/engine/ingestion-friction.js (already listed)
      - app/engine/escape-controller.js
      - app/engine/persona-memory.js
        - app/engine/stylometry.js (already listed)
        - app/engine/ingestion-friction.js (already listed)
      - app/engine/iteration-ledger.js (already listed)
      - app/engine/claim-ladder.js
      - app/engine/report-export.js
        - app/engine/claim-ladder.js (already listed)
        - app/engine/iteration-ledger.js (already listed)
      - app/engine/context-profile.js (already listed)
      - app/engine/recognition-field.js
        - app/engine/context-profile.js (already listed)
      - app/engine/hush-mask-studio.js (already listed)
      - app/engine/hush-custom-mask.js
        - app/engine/stylometry.js (already listed)
        - app/engine/hush-mask-studio.js (already listed)
      - app/engine/hush-profile-match.js
        - app/engine/stylometry.js (already listed)
      - app/engine/hush-swap.js
        - app/engine/stylometry.js (already listed)
        - app/engine/escape-vector.js (already listed)
        - app/engine/ingestion-friction.js (already listed)
        - app/engine/escape-controller.js (already listed)
        - app/engine/claim-ladder.js (already listed)
        - app/engine/context-profile.js (already listed)
        - app/engine/recognition-field.js (already listed)
        - app/engine/hush-profile-match.js (already listed)
        - app/engine/hush-residual-vector.js
          - app/engine/stylometry.js (already listed)
        - app/engine/hush-protected-literal-lockbox.js
        - app/engine/hush-steering-plan.js
          - app/engine/hush-residual-vector.js (already listed)
          - app/engine/hush-protected-literal-lockbox.js (already listed)
        - app/engine/hush-mask-lifecycle.js
        - app/engine/hush-export-policy.js
        - app/engine/hush-meaning-plan.js
        - app/engine/hush-realization-plan.js
        - app/engine/hush-mask-writer.js
          - app/engine/stylometry.js (already listed)
          - app/engine/hush-meaning-plan.js (already listed)
          - app/engine/hush-realization-plan.js (already listed)
          - app/engine/hush-naturalness.js
          - app/engine/hush-catchphrase-quarantine.js
        - app/engine/hush-naturalness.js (already listed)
        - app/engine/hush-candidate-cleanroom.js
        - app/engine/hush-release-policy.js
          - app/engine/claim-ladder.js (already listed)
        - app/engine/hush-source-residue.js (already listed)
        - app/engine/hush-claim-roles.js
        - app/engine/hush-literal-placement.js
        - app/engine/hush-syntax-plan.js
        - app/engine/hush-syntax-recomposer.js
          - app/engine/stylometry.js (already listed)
          - app/engine/hush-payload-repair.js
        - app/engine/hush-syntax-shift.js
        - app/engine/hush-claim-integrity.js
        - app/engine/hush-payload-map.js
          - app/engine/hush-meaning-plan.js (already listed)
        - app/engine/hush-payload-binding.js
        - app/engine/hush-payload-integrity.js
        - app/engine/hush-payload-repair.js (already listed)
      - app/engine/hush-protected-literals.js
    - app/hush-phase39-ui.js
      - app/hush-phase39-engine.js
  - app/hush-current-runtime-coherence.js
    - app/hush-remote-contract-detox.js
      - app/engine/hush-catchphrase-quarantine.js (already listed)
      - app/engine/hush-contract-sanitizer.js
    - app/hush-visible-detox-seam-guard.js
    - app/adversarial-bench-light.js (already listed)
  - app/hush-phase31-1.js
    - app/hush-phase31-native-edit-carousel-v4.js
    - app/hush-phase31-1-original.js
      - app/engine/hush-custom-mask.js (already listed)
  - app/hush-housekeeping.js
  - app/hush-housekeeping-relayout.js
  - app/hush-customizer-capsule-scope.js
  - app/hush-compare-layout-custody.js
    - app/hush-layout-topology-guard.js
    - app/hush-aperture-repair-runtime.js
      - app/engine/hush-aperture-repair-pass.js
        - app/engine/hush-phase14-cognitive-authorship-gate.js
          - app/data/hush-phase14-cognitive-process-profiles.js
        - app/engine/hush-source-residual-guard.js
          - app/engine/hush-source-residue.js (already listed)
    - app/hush-mask-native-layout-runtime.js
    - app/hush-candidate-carryover-runtime.js
      - app/engine/hush-source-residue.js (already listed)
    - app/hush-strict-held-diagnostic-popup.js
    - app/hush-edit-corpus-carousel.js
    - app/hush-input-control-rail.js
    - app/hush-pr76-light-panels.js
    - app/hush-lab-mobile-polish.js
    - app/hush-lab-provider-sync.js
    - app/hush-output-active-mask-route.js
    - app/hush-custody-export-wake.js
  - app/hush-source-layout-policy.js

## /adversarial-bench.html — Hush Console

Entry: app/adversarial-bench.html

Full transformation workbench and its layered runtime/repair modules.

Dependencies:
- app/hush-phase31-1.css
- app/hush-housekeeping.css
- app/styles.css
- app/hush-phase39.css
- app/hush-visual-system.css
- app/hush-compact.css
- app/hush-invisible.css
- app/hush-alien-console.css
- app/hush-field-instrument.css
- app/hush-mobile-viewport-fix.css
- app/hush-phase32.css
- app/hush-packet-entrypoint.css
- app/hush-cosmetic-repair.css
- app/analytics.js
- app/speed-insights.js
- app/chamber-bootstrap.js
- app/hush-pr123-strict-undefined-fallback.js
- app/hush-pr168-strict-transform-run-lock.js
- app/adversarial-bench-light.js
  - app/hush-simple-path.js
  - app/data/hush-masks.js
  - app/data/hush-phase22-masks.js
  - app/data/hush-phase24-masks.js
  - app/data/hush-phase27-masks.js
  - app/data/hush-phase28-masks.js
  - app/data/hush-mask-traits.js
  - app/engine/hush-style-diversity.js
  - app/engine/context-profile.js
  - app/engine/iteration-ledger.js
  - app/hush-invisible-shell.js
  - app/hush-alien-console.js
  - app/adversarial-bench.mjs
    - app/engine/stylometry.js
      - app/engine/td613-aperture.js
      - app/engine/generator-v2.js
        - app/engine/td613-aperture.js (already listed)
        - app/engine/stylometry.js (cycle)
        - app/engine/vernacular-ontology.js
        - app/engine/au-forged-ontology.js
    - app/engine/escape-vector.js
      - app/engine/ingestion-friction.js
      - app/engine/hush-source-residue.js
      - app/engine/stylometry.js (already listed)
    - app/engine/ingestion-friction.js (already listed)
    - app/engine/escape-controller.js
    - app/engine/persona-memory.js
      - app/engine/stylometry.js (already listed)
      - app/engine/ingestion-friction.js (already listed)
    - app/engine/iteration-ledger.js (already listed)
    - app/engine/claim-ladder.js
    - app/engine/report-export.js
      - app/engine/claim-ladder.js (already listed)
      - app/engine/iteration-ledger.js (already listed)
    - app/engine/context-profile.js (already listed)
    - app/engine/recognition-field.js
      - app/engine/context-profile.js (already listed)
    - app/engine/hush-mask-studio.js
      - app/data/hush-masks.js (already listed)
      - app/data/hush-phase22-masks.js (already listed)
      - app/data/hush-phase24-masks.js (already listed)
      - app/data/hush-phase27-masks.js (already listed)
      - app/data/hush-phase28-masks.js (already listed)
      - app/data/hush-mask-traits.js (already listed)
      - app/engine/stylometry.js (already listed)
      - app/engine/hush-authorship-protection.js
      - app/engine/hush-style-diversity.js (already listed)
    - app/engine/hush-custom-mask.js
      - app/engine/stylometry.js (already listed)
      - app/engine/hush-mask-studio.js (already listed)
    - app/engine/hush-profile-match.js
      - app/engine/stylometry.js (already listed)
    - app/engine/hush-swap.js
      - app/engine/stylometry.js (already listed)
      - app/engine/escape-vector.js (already listed)
      - app/engine/ingestion-friction.js (already listed)
      - app/engine/escape-controller.js (already listed)
      - app/engine/claim-ladder.js (already listed)
      - app/engine/context-profile.js (already listed)
      - app/engine/recognition-field.js (already listed)
      - app/engine/hush-profile-match.js (already listed)
      - app/engine/hush-residual-vector.js
        - app/engine/stylometry.js (already listed)
      - app/engine/hush-protected-literal-lockbox.js
      - app/engine/hush-steering-plan.js
        - app/engine/hush-residual-vector.js (already listed)
        - app/engine/hush-protected-literal-lockbox.js (already listed)
      - app/engine/hush-mask-lifecycle.js
      - app/engine/hush-export-policy.js
      - app/engine/hush-meaning-plan.js
      - app/engine/hush-realization-plan.js
      - app/engine/hush-mask-writer.js
        - app/engine/stylometry.js (already listed)
        - app/engine/hush-meaning-plan.js (already listed)
        - app/engine/hush-realization-plan.js (already listed)
        - app/engine/hush-naturalness.js
        - app/engine/hush-catchphrase-quarantine.js
      - app/engine/hush-naturalness.js (already listed)
      - app/engine/hush-candidate-cleanroom.js
      - app/engine/hush-release-policy.js
        - app/engine/claim-ladder.js (already listed)
      - app/engine/hush-source-residue.js (already listed)
      - app/engine/hush-claim-roles.js
      - app/engine/hush-literal-placement.js
      - app/engine/hush-syntax-plan.js
      - app/engine/hush-syntax-recomposer.js
        - app/engine/stylometry.js (already listed)
        - app/engine/hush-payload-repair.js
      - app/engine/hush-syntax-shift.js
      - app/engine/hush-claim-integrity.js
      - app/engine/hush-payload-map.js
        - app/engine/hush-meaning-plan.js (already listed)
      - app/engine/hush-payload-binding.js
      - app/engine/hush-payload-integrity.js
      - app/engine/hush-payload-repair.js (already listed)
    - app/engine/hush-protected-literals.js
  - app/hush-phase39-ui.js
    - app/hush-phase39-engine.js
- app/hush-current-runtime-coherence.js
  - app/hush-remote-contract-detox.js
    - app/engine/hush-catchphrase-quarantine.js (already listed)
    - app/engine/hush-contract-sanitizer.js
  - app/hush-visible-detox-seam-guard.js
  - app/adversarial-bench-light.js (already listed)
- app/hush-phase31-1.js
  - app/hush-phase31-native-edit-carousel-v4.js
  - app/hush-phase31-1-original.js
    - app/engine/hush-custom-mask.js (already listed)
- app/hush-housekeeping.js
- app/hush-housekeeping-relayout.js
- app/hush-customizer-capsule-scope.js
- app/hush-compare-layout-custody.js
  - app/hush-layout-topology-guard.js
  - app/hush-aperture-repair-runtime.js
    - app/engine/hush-aperture-repair-pass.js
      - app/engine/hush-phase14-cognitive-authorship-gate.js
        - app/data/hush-phase14-cognitive-process-profiles.js
      - app/engine/hush-source-residual-guard.js
        - app/engine/hush-source-residue.js (already listed)
  - app/hush-mask-native-layout-runtime.js
  - app/hush-candidate-carryover-runtime.js
    - app/engine/hush-source-residue.js (already listed)
  - app/hush-strict-held-diagnostic-popup.js
  - app/hush-edit-corpus-carousel.js
  - app/hush-input-control-rail.js
  - app/hush-pr76-light-panels.js
  - app/hush-lab-mobile-polish.js
  - app/hush-lab-provider-sync.js
  - app/hush-output-active-mask-route.js
  - app/hush-custody-export-wake.js
- app/hush-source-layout-policy.js

## /hush-packet-dashboard.html — Hush Packet Dashboard

Entry: app/hush-packet-dashboard.html

Evidence, packet, and release-state dashboard.

Dependencies:
- app/hush-visual-system.css
- app/hush-compact.css
- app/hush-field-instrument.css
- app/hush-packet-dashboard.css
- app/hush-packet-dashboard.js
  - app/engine/hush-phase10-release-discipline.js
    - app/data/hush-phase10-release-statuses.js
  - app/engine/hush-phase11-dashboard-state.js
    - app/data/hush-phase10-release-statuses.js (already listed)
    - app/engine/hush-phase10-release-discipline.js (already listed)
    - app/engine/hush-phase11-surface-registry.js
  - app/engine/hush-phase11-action-gates.js
    - app/engine/hush-phase11-dashboard-state.js (already listed)

## /aperture/ — Aperture

Entry: app/aperture/index.html

Aperture loader and machine/human instrument surface.

Dependencies:
- app/aperture/tool.html
- app/aperture/bootstrap.js
  - app/aperture/release.js
  - app/engine/aperture-v3-task-intent.js
  - app/engine/aperture-v31-compatibility.js
    - app/engine/aperture-v3-reciprocal-bridge.js
      - app/dome-world/ash/canonical-json.js
  - app/engine/aperture-v3-reciprocal-bridge.js (already listed)
  - app/engine/aperture-composition.js
    - app/dome-world/ash/canonical-json.js (already listed)
  - app/engine/aperture-composition-frame.js
    - app/engine/aperture-composition.js (already listed)

## /homebase.html — Homebase

Entry: app/homebase.html

TD613 project orientation and launch deck.

Dependencies:
- app/asset-versions.js
- app/analytics.js
- app/speed-insights.js
- app/chamber-bootstrap.js

## /dome-world/ — Dome-World

Entry: app/dome-world/index.html

Dome-World source shell; production response is mediated by api/dome-world-shell.js.

Dependencies:
- No local linked assets detected.

## /safe-harbor/td613-flight.html — Safe Harbor Flight

Entry: app/safe-harbor/td613-flight.html

Safe Harbor flight instrument; production HTML is injected by api/flight-html.js.

Dependencies:
- app/analytics.js
- app/speed-insights.js

## /readout.html — Readout

Entry: app/readout.html

Operator report/readout surface.

Dependencies:
- app/asset-versions.js
- app/analytics.js
- app/speed-insights.js
- app/chamber-bootstrap.js
