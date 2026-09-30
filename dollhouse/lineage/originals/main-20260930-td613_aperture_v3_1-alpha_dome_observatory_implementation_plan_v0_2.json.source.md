{
  "schema": "td613.aperture.v31.dome-observatory-implementation-plan/v0.2",
  "title": "TD613 Aperture v3.1-alpha — Dome-World Admissibility Observatory",
  "status": "AUTHORED_NOT_IMPLEMENTED",
  "date": "2026-07-13",
  "supersession": {
    "preserves": "TD613 Aperture v3.1-alpha scientific specification v0.1",
    "supersedes_for_installation": [
      "repo-wide installation order",
      "station integration",
      "UI placement",
      "claim-boundary mechanism",
      "release compatibility",
      "next Ash phase"
    ]
  },
  "goal": "Create a distributed, reproducible forensic observatory: Ash owns experimental source and run custody; Flow-Core returns artifact-blind context per snapshot; Aperture reconstructs bounded multi-time route transformations; Phason records registry transitions; Relation Envelopes remain optional post-validation third objects; non-sovereign adapters testify without authority; human operators retain promotion, derivative eligibility, and closure.",
  "baseline": {
    "aperture": "v3.0-alpha",
    "aperture_schema": "td613-aperture/v3.0-alpha",
    "ash_custody": "td613.ash.custody-receipt/v0.8",
    "flowcore_context": "td613.flowcore.context-receipt/v0.1",
    "round_trip": "td613.aperture.round-trip-receipt/v3.0-alpha",
    "phase5_relation": "td613.relation-envelope/v0.1",
    "phase5_status": "IMPLEMENTED_VALIDATION_GATED",
    "phase5_production_status": "PRODUCTION_GATED",
    "uploaded_v30_sha256": "9d966ce147acf67e76b7c182f80f4bf33bf883b49e22c55930b95546f9cdb7a8"
  },
  "targets": {
    "aperture": "v3.1-alpha",
    "dome_world": "v0.6.0-alpha",
    "ash": "v0.9-alpha",
    "ash_phase": "VI-A_EXPERIMENTAL_RUN_CUSTODY_AND_ELIGIBILITY"
  },
  "station_jurisdiction": {
    "Ash": [
      "source custody",
      "experiment manifest",
      "snapshot-batch receipt",
      "result custody",
      "derivative eligibility",
      "export gate"
    ],
    "Flow-Core": [
      "per-snapshot context receipt",
      "context series",
      "missingness",
      "benign context controls"
    ],
    "Aperture": [
      "reconstruction",
      "registry estimation",
      "shared-layer burden",
      "phason susceptibility",
      "signed residual",
      "coverage",
      "abstention",
      "replay"
    ],
    "Phason": [
      "registry transition continuity",
      "source-invariant projection-change events"
    ],
    "Dome-World": [
      "experiment host",
      "full tomography lab",
      "station routing"
    ],
    "PhaseV": [
      "optional operator-confirmed association after independent validation"
    ],
    "Marrowline": [
      "carrier",
      "renderer",
      "ingress witness"
    ],
    "Human": [
      "experiment approval",
      "promotion",
      "derivative review",
      "closure"
    ]
  },
  "compatibility_firewall": {
    "preserve_schemas": [
      "td613.aperture.diagnostic-receipt/v3.0-alpha",
      "td613.aperture.round-trip-receipt/v3.0-alpha",
      "td613.flowcore.context-receipt/v0.1",
      "td613.relation-envelope/v0.1"
    ],
    "producer_version_field": "v3.1-alpha",
    "phase4_regression_required": true,
    "phase5_regression_required": true,
    "phase5_schema_mutation_in_v31": false,
    "single_identity_writer": true
  },
  "claim_boundary_correction": {
    "global_claim_ceiling_subsystem": false,
    "replace_with": [
      "scope_statement",
      "cannot_establish",
      "promotion_conditions",
      "abstention_reason",
      "operator_closure"
    ],
    "open_field_exempt_from_evidentiary_promotion_rules": true,
    "legal_synthesis_not_runtime_telemetry": true
  },
  "new_contracts": [
    "td613.dome-world.experiment-run/v0.1",
    "td613.flowcore.context-series/v0.1",
    "td613.aperture.instrument-adapter-receipt/v0.1",
    "td613.ash.experiment-custody-manifest/v0.1",
    "td613.ash.snapshot-batch-receipt/v0.1",
    "td613.ash.tomography-result-custody/v0.1",
    "td613.ash.derivative-eligibility-receipt/v0.1",
    "td613.aperture.admissibility-tomography-receipt/v0.1",
    "td613.aperture.tomography-replay/v0.1"
  ],
  "adapter_roles": {
    "EO-RFD": "declared detector/rupture observation instrument; signal source only",
    "ACEDIT": "controlled encoding, glyph, normalization, and rendering intervention adapter; signal source only",
    "KIRA": "instrument-design rank, redundancy, and coverage preflight; no runtime authority"
  },
  "ash_phase_vi": {
    "VI-A": {
      "name": "Experimental Run Custody + Eligibility",
      "status": "TO_IMPLEMENT",
      "automatic_cinder": false,
      "transport": false
    },
    "VI-B": {
      "name": "Human-Gated Derivative Construction",
      "status": "HELD_UNTIL_V31_AND_VI_A_PRODUCTION_DEMONSTRATED",
      "transport": false
    },
    "VI-C": {
      "name": "Destination-Bound Transport",
      "status": "DEFERRED"
    }
  },
  "ui": {
    "standalone_aperture": "compact tomography drawer and Dome lab launcher only",
    "full_lab": "app/dome-world/admissibility-tomography.html",
    "new_animation_clock": false,
    "menu_restage": false,
    "reduced_motion_required": true
  },
  "gates": [
    "PHASE_V_PRODUCTION_BASELINE",
    "FOUNDATION_AND_COMPATIBILITY_FREEZE",
    "DOME_EXPERIMENT_CONTRACT",
    "ASH_VI_A_EXPERIMENTAL_CUSTODY",
    "FLOWCORE_CONTEXT_SERIES",
    "SOURCE_AND_ENSEMBLE",
    "SNAPSHOT_LATTICE",
    "REFERENCE_LAYERS",
    "REGISTRY_DYNAMICS",
    "SHARED_LAYER",
    "PHASON_RESPONSE",
    "TEMPORAL_TOMOGRAPHY",
    "RECONSTRUCTION_AND_RESIDUE",
    "ASH_DERIVATIVE_ELIGIBILITY",
    "APERTURE_COMPACT_SURFACE",
    "DOME_WORLD_TOMOGRAPHY_LAB",
    "REPO_WIDE_RELEASE_SYNC",
    "PRODUCTION_DEMONSTRATION"
  ],
  "pr_sequence": [
    "baseline-and-compatibility-freeze",
    "dome-experiment-contracts",
    "ash-phase-vi-a",
    "aperture-v31-engine",
    "dome-world-tomography-lab",
    "aperture-v31-installation",
    "production-demonstration-and-promotion"
  ],
  "hard_stops": [
    "no Phase V mutation during first v3.1 install",
    "no Relation Envelope as experiment container",
    "no artifact digest in Flow-Core",
    "no automatic Ash action",
    "no Cinder construction or transport",
    "no sovereign EO-RFD or ACEDIT",
    "no runtime-authority KIRA",
    "no global claim-ceiling governor",
    "no Open Field suppression",
    "no legal-synthesis replacement by telemetry",
    "no hidden-state or intent claim",
    "no quantum or time-travel claim",
    "no uncontrolled animation loop",
    "no self-promotion"
  ],
  "promotion": {
    "before_production_evidence": "IMPLEMENTED_VALIDATION_GATED",
    "after_direct_production_receipt": "IMPLEMENTED_PRODUCTION_DEMONSTRATED",
    "operator_promotion_required": true,
    "phase_vi_b_remains_held": true,
    "phase_vi_c_remains_deferred": true
  },
  "seal": "⟐"
}
