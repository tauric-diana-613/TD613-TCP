{
  "schema": "td613.aperture.v31.dome-observatory-implementation-plan/v0.3",
  "title": "TD613 Aperture v3.1-alpha — Dome-World Admissibility Observatory",
  "status": "IMPLEMENTATION_ACTIVE_IDENTITY_NOT_PROMOTED",
  "date": "2026-07-13",
  "authority": {
    "scientific_source": "source/TD613_Aperture_v3_1-alpha_Admissibility_Tomography_Spec_v0_1.md",
    "integration_source": "source/TD613_Aperture_v3_1-alpha_Dome_Observatory_Integration_Spec_v0_2.md",
    "implementation_authority": "TD613_APERTURE_V31_DOME_OBSERVATORY_SPEC_V0_3.md"
  },
  "goal": "Create a distributed, reproducible observatory in which Ash owns experimental custody, Flow-Core returns artifact-blind snapshot context, Aperture reconstructs bounded multi-time route transformations, Phason preserves registry continuity, Dome-World hosts the lab, and the human retains promotion, derivative review, export, and closure.",
  "baseline": {
    "aperture": "v3.0-alpha",
    "aperture_schema": "td613-aperture/v3.0-alpha",
    "ash_custody": "td613.ash.custody-receipt/v0.8",
    "flowcore_context": "td613.flowcore.context-receipt/v0.1",
    "diagnostic": "td613.aperture.diagnostic-receipt/v3.0-alpha",
    "round_trip": "td613.aperture.round-trip-receipt/v3.0-alpha",
    "phase5_relation": "td613.relation-envelope/v0.1",
    "phase5_status": "IMPLEMENTED_PRODUCTION_DEMONSTRATED",
    "phase5_receipt": "app/dome-world/docs/PHASE_5_PRODUCTION_DEMO_RECEIPT.md",
    "v30_witness_sha256": "9d966ce147acf67e76b7c182f80f4bf33bf883b49e22c55930b95546f9cdb7a8"
  },
  "targets_after_release_gate": {
    "aperture": "v3.1-alpha",
    "dome_world": "v0.6.0-alpha",
    "ash": "v0.9-alpha",
    "ash_phase": "VI-A_EXPERIMENTAL_RUN_CUSTODY_AND_ELIGIBILITY"
  },
  "station_jurisdiction": {
    "Ash": [
      "source custody",
      "experiment manifest custody",
      "snapshot-batch custody",
      "result custody",
      "derivative eligibility",
      "export gate"
    ],
    "Flow-Core": [
      "artifact-blind per-snapshot context",
      "context series",
      "missingness",
      "benign controls"
    ],
    "Aperture": [
      "source-drift audit",
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
      "registry-transition continuity",
      "source-invariant projection-change events",
      "fork preservation"
    ],
    "Dome-World": [
      "experiment host",
      "full tomography lab",
      "station routing"
    ],
    "PhaseV": [
      "optional operator-confirmed third object after independent validation"
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
      "export",
      "closure"
    ]
  },
  "scientific_strata": [
    "controlled_source",
    "instrument_ensemble",
    "snapshot_lattice",
    "differential_reference_layers",
    "coupling_without_merger",
    "global_to_local_registry",
    "shared_layer_relaxation_burden",
    "phason_susceptibility",
    "multi_time_reconstruction",
    "signed_residual_ledger",
    "alternative_models",
    "held_out_validation",
    "abstention"
  ],
  "compatibility_firewall": {
    "preserve_schemas": [
      "td613.aperture.diagnostic-receipt/v3.0-alpha",
      "td613.aperture.round-trip-receipt/v3.0-alpha",
      "td613.flowcore.context-receipt/v0.1",
      "td613.relation-envelope/v0.1"
    ],
    "strict_round_trip_unknown_fields": false,
    "v31_fields_stripped_before_v30_serialization": true,
    "phase4_regression_required": true,
    "phase5_regression_required": true,
    "phase5_schema_mutation": false,
    "single_identity_writer": true
  },
  "claim_boundary_ruling": {
    "add_new_global_claim_ceiling_subsystem": false,
    "delete_existing_legacy_vocabulary": false,
    "new_receipt_fields": [
      "scope_statement",
      "cannot_establish",
      "promotion_conditions",
      "abstention_reason",
      "source_status",
      "authority_class",
      "operator_closure"
    ],
    "open_field_is_failed_evidence": false,
    "legal_synthesis_is_runtime_telemetry": false,
    "receipt_boundaries_censor_interpretation": false
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
  "digest_domains": {
    "experiment_run": "TD613:V31:EXPERIMENT-RUN:v1",
    "instrument_ensemble": "TD613:V31:INSTRUMENT-ENSEMBLE:v1",
    "snapshot": "TD613:V31:SNAPSHOT:v1",
    "snapshot_batch": "TD613:V31:SNAPSHOT-BATCH:v1",
    "flowcore_context_series": "TD613:V31:FLOWCORE-CONTEXT-SERIES:v1",
    "tomography_receipt": "TD613:V31:TOMOGRAPHY-RECEIPT:v1",
    "tomography_replay": "TD613:V31:TOMOGRAPHY-REPLAY:v1",
    "ash_experiment_custody": "TD613:V31:ASH-EXPERIMENT-CUSTODY:v1",
    "ash_result_custody": "TD613:V31:ASH-RESULT-CUSTODY:v1",
    "derivative_eligibility": "TD613:V31:DERIVATIVE-ELIGIBILITY:v1"
  },
  "storage": {
    "snapshot_bodies": "IndexedDB",
    "large_residual_arrays": "IndexedDB",
    "checkpoints": "IndexedDB",
    "compact_current_run_pointer": "localStorage",
    "server_persistence_default": false,
    "public_stable_snapshot_handle_default": false
  },
  "adapter_roles": {
    "EO-RFD": {
      "current_role": "declared detector and rupture observation instrument",
      "operational_state": "interface_context",
      "claim_authority": "design_signal",
      "target_state": "verified_runtime_installation"
    },
    "ACEDIT": {
      "current_role": "controlled encoding, glyph, normalization, and rendering intervention adapter",
      "operational_state": "interface_context",
      "claim_authority": "design_signal",
      "target_state": "verified_runtime_installation"
    },
    "KIRA": {
      "current_role": "design rank, redundancy, coverage, and identifiability preflight",
      "operational_state": "adapter_preflight",
      "claim_authority": "design_signal",
      "target_state": "verified_runtime_installation"
    }
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
    "existing_global_tabs_unchanged": [
      "Weather",
      "Rooms",
      "Lab",
      "Ash",
      "Substrate",
      "Phason",
      "Aperture",
      "Receipts"
    ],
    "full_lab": "/dome-world/admissibility-tomography.html",
    "lab_entry": "existing Lab Station 02 — Heterostratigraphic Tomography",
    "standalone_aperture": "compact tomography drawer and Dome lab launcher only",
    "new_global_tab": false,
    "new_animation_clock": false,
    "hidden_modes_draw": false,
    "reduced_motion": "deterministic_scrubbing"
  },
  "downloads_lane": {
    "preserve_v30_witness": true,
    "export_after_local_validation": "C:\\Users\\timst\\Downloads\\Aperture_v3_1-alpha.html",
    "standalone_functional_parity_required": true,
    "return_path": [
      "aperture:stage",
      "aperture:compare",
      "aperture:promote-staged"
    ],
    "automatic_promotion": false
  },
  "gates": [
    { "id": "PHASE_V_PRODUCTION_BASELINE", "status": "EARNED" },
    { "id": "FOUNDATION_AND_COMPATIBILITY_FREEZE", "status": "IN_PROGRESS" },
    { "id": "DOME_EXPERIMENT_CONTRACT", "status": "PENDING" },
    { "id": "FLOWCORE_CONTEXT_SERIES", "status": "PENDING" },
    { "id": "ASH_VI_A_EXPERIMENTAL_CUSTODY", "status": "PENDING" },
    { "id": "SOURCE_AND_ENSEMBLE", "status": "PENDING" },
    { "id": "SNAPSHOT_LATTICE", "status": "PENDING" },
    { "id": "REFERENCE_LAYERS", "status": "PENDING" },
    { "id": "REGISTRY_DYNAMICS", "status": "PENDING" },
    { "id": "SHARED_LAYER", "status": "PENDING" },
    { "id": "PHASON_RESPONSE", "status": "PENDING" },
    { "id": "TEMPORAL_TOMOGRAPHY", "status": "PENDING" },
    { "id": "RECONSTRUCTION_AND_RESIDUE", "status": "PENDING" },
    { "id": "ASH_DERIVATIVE_ELIGIBILITY", "status": "PENDING" },
    { "id": "DOME_WORLD_TOMOGRAPHY_LAB", "status": "PENDING" },
    { "id": "APERTURE_COMPACT_SURFACE", "status": "PENDING" },
    { "id": "REPO_WIDE_RELEASE_SYNC", "status": "PENDING" },
    { "id": "DOWNLOADS_STANDALONE_EXPORT", "status": "PENDING" },
    { "id": "PRODUCTION_DEMONSTRATION", "status": "PENDING" }
  ],
  "production_requirements": [
    "invariant source",
    "source drift negative control",
    "two or more declared instruments",
    "replicates",
    "benign control",
    "null result",
    "intentionally missing snapshot",
    "per-snapshot Flow-Core context",
    "reference-layer comparison",
    "shared-layer boundary",
    "controlled phason perturbation",
    "signed residuals",
    "alternative model comparison",
    "held-out trial",
    "abstention",
    "replay and tamper",
    "Phase IV regression",
    "Phase V regression",
    "no Ash action",
    "no Cinder",
    "desktop mobile reduced-motion",
    "standalone Downloads parity",
    "operator closure"
  ],
  "hard_stops": [
    "no in-place v3.0 bridge schema mutation",
    "no Phase V v0.1 mutation",
    "no Relation Envelope as experiment container",
    "no artifact digest or observation body in Flow-Core",
    "no automatic Ash action",
    "no Cinder construction or transport",
    "no sovereign EO-RFD, ACEDIT, or KIRA",
    "no new global Claim Ceiling subsystem",
    "no deletion of legacy compatibility vocabulary without migration",
    "no Open Field suppression",
    "no legal-synthesis replacement by telemetry",
    "no hidden-state, intent, identity, total-causation, quantum, physical-twistronics, or time-travel claim",
    "no one-shot tomography",
    "no erasure of null, missing, rejected, uncaptured, encoder-missing, or forked observations",
    "no ninth Dome global tab",
    "no uncontrolled animation loop",
    "no self-promotion"
  ],
  "seal": "⟐"
}
