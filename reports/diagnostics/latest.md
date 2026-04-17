# Diagnostics Battery

Generated: 2026-04-17T19:52:40.255Z

Corpus: 72 samples across 18 families
Promoted deck subset: 24 samples
Total diagnostics cases: 270

## Failure Buckets

- semantic_drift: 79
- register_miss: 75
- false_neighbor_convergence: 44
- sentence_span_miss: 34
- trainer_retrieval_fail: 31
- over_flattened_output: 17
- one_sided_swap: 16
- punctuation_only_shift: 0
- surface_close_under_large_gap: 0
- anchor_break: 0
- generator_hold: 0
- generator_unbounded_semantics: 0
- both_rejected_swap: 0
- mask_near_home_hold: 0

## Worst Families

- customer-support: 34
- building-access: 29
- school-coordination: 27
- mutual-aid: 22
- committee-budget: 20
- tenant-leak: 19
- newsroom-correction: 19
- clinic-scheduling: 15

## Worst Cases

- mutual-aid-to-customer-support-false-neighbor: false_neighbor_convergence, one_sided_swap, register_miss, semantic_drift // Buckets: false_neighbor_convergence, one_sided_swap, register_miss, semantic_drift.
- customer-support-to-mutual-aid-false-neighbor: one_sided_swap, over_flattened_output, register_miss, semantic_drift // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift.
- mutual-aid-to-customer-support-false-neighbor: false_neighbor_convergence, one_sided_swap, register_miss, semantic_drift // Buckets: false_neighbor_convergence, one_sided_swap, register_miss, semantic_drift.
- customer-support-to-mutual-aid-false-neighbor: one_sided_swap, over_flattened_output, register_miss, semantic_drift // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift.
- building-access-formal-to-rushed: one_sided_swap, register_miss, semantic_drift // Buckets: one_sided_swap, register_miss, semantic_drift.
- customer-support-rushed-to-formal: one_sided_swap, register_miss, sentence_span_miss // Buckets: one_sided_swap, register_miss, sentence_span_miss.
- newsroom-correction-rushed-to-formal: register_miss, semantic_drift, sentence_span_miss // Buckets: register_miss, semantic_drift, sentence_span_miss.
- tenant-leak-to-package-handoff-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.
- customer-support-to-clinic-scheduling-false-neighbor: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- committee-budget-to-archive-grant-false-neighbor: over_flattened_output, register_miss, semantic_drift // Buckets: over_flattened_output, register_miss, semantic_drift.
- performance-review-to-committee-budget-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.
- school-coordination-to-clinic-scheduling-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.

## Generator Audit

- case_count: 52
- landed_count: 52
- held_count: 0
- structural_count: 49
- surface_count: 3
- semantic_bounded_rate: 1
- unsafe_structural_count: 0
- protected_anchor_integrity_min: 1
- average_candidate_count: 2.9423
- average_selected_candidate_score: 0.8787
- generator_versions: v2:52
- source_classes: procedural-record:19, formal-correspondence:30, narrative-scene:3
- hold_classes: none

### Generator Misses

- customer-support-mask-same-family: mask, procedural-record, transfer surface, registered surface-only, hold landed/none, bounded yes, selected score 0.2481
- model-safety-mask-same-family: mask, formal-correspondence, transfer surface, registered surface-only, hold landed/none, bounded yes, selected score 0.3493
- museum-fog-alarm-under-building-access-mask-cross-family: mask, formal-correspondence, transfer surface, registered surface-only, hold landed/none, bounded yes, selected score 0.6143

## Toolability

- expected_case_count: 34
- landed_rate: 1
- hold_rate: 0
- artifact_rate: 0.4118
- weak_movement_rate: 0.0882
- distinctness_rate: 1
- convergence_rate: 0
- preview_honesty_rate: 1
- repeated_flight_stability_rate: 1

### Toolability Probes

- reflective-live: landed 5, holds 0, distinct 5, convergence 0, artifacts 0.6, preview honesty 1
- narrative-live: landed 5, holds 0, distinct 5, convergence 0, artifacts 1, preview honesty 1

## Sample Audit

- randomizer_corpus_size: 72
- unique_resolved_sample_profile_count: 72
- deck_randomizer_size: 66
- deck_randomizer_family_count: 18
- deck_randomizer_paired_family_count: 18
- deck_randomizer_wide_subset_size: 16
- average_nearest_field_distance: 3.0497
- min_nearest_field_distance: 2.766
- deck_randomizer_library_average_nearest_field_distance: 1.7626
- deck_randomizer_library_min_nearest_field_distance: 1.144
- exact_profile_collisions: none

### Closest Sample Pairs

- tenant-leak-rushed-mobile <-> committee-budget-rushed-mobile: field distance 0.478, profile 0.331, heatmap 0, traceability 0.889
- archive-grant-professional-message <-> school-coordination-tangled-followup: field distance 1.074, profile 0.579, heatmap 0.4, traceability 0.975
- benefits-appeal-formal-record <-> museum-fog-alarm-formal-record: field distance 1.144, profile 0.45, heatmap 0.286, traceability 0.972
- mutual-aid-professional-message <-> overwork-debrief-formal-record: field distance 1.248, profile 0.369, heatmap 0.571, traceability 0.967
- clinic-scheduling-professional-message <-> benefits-appeal-formal-record: field distance 1.28, profile 0.275, heatmap 0.857, traceability 0.964
- tenant-leak-rushed-mobile <-> mutual-aid-rushed-mobile: field distance 1.329, profile 0.638, heatmap 0.4, traceability 0.756

## Persona Audit

- resolved_persona_count: 7
- unique_resolved_persona_profile_count: 7
- average_nearest_field_distance: 2.5749
- min_nearest_field_distance: 2.255
- missing_recipe_sample_ids: none
- distinct_output_check: 7/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- operator <-> cross-examiner: field distance 2.255, profile 0.8, heatmap 0.889, traceability 0.869
- operator <-> methods-editor: field distance 2.363, profile 0.646, heatmap 1.554, traceability 1
- undertow <-> matron: field distance 2.457, profile 0.63, heatmap 1.429, traceability 0.988
- archivist <-> methods-editor: field distance 2.48, profile 1.067, heatmap 1.162, traceability 1
- operator <-> matron: field distance 2.648, profile 0.98, heatmap 1.27, traceability 0.977
- archivist <-> operator: field distance 2.712, profile 1.348, heatmap 1.162, traceability 1

## Private TD613 Aperture Working State

- state: warning
- blocked_generative_passage: no
- donor_pressure: real
- witness_pressure: rising
- realized_passage: landing
- provenance_floor: maintained
- swap_matrix: bilateral 54/104, one-sided 10/104, flagship 8/8
- representative_pairs: bilateral visible 6/6, bilateral non-trivial 6/6, average score 35.33

## Private TD613 Aperture Representative Pairs

- building-access-rushed-mobile -> adversarial-hearing-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- benefits-appeal-professional-message -> adversarial-hearing-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- municipal-zoning-formal-record -> committee-budget-professional-message: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- adversarial-hearing-rushed-mobile -> adversarial-hearing-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- museum-fog-alarm-professional-message -> adversarial-hearing-rushed-mobile: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- model-safety-rushed-mobile -> adversarial-hearing-formal-record: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes

## Annex Diagnostics

### TD613 Aperture

- status: passed
- version: 1.8.0
- source: app/aperture/index.html
- content_hash_sha256: f8a7a4d10d6cd62a0215ae8d0bb525183f6257829bd9cc6a4746dc0a1c28b193
- inline_script_count: 3
- failed_checks: none

