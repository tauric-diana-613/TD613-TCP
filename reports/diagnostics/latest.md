# Diagnostics Battery

Generated: 2026-04-18T17:04:32.089Z

Corpus: 72 samples across 18 families
Promoted deck subset: 24 samples
Total diagnostics cases: 270

## Failure Buckets

- register_miss: 57
- semantic_drift: 41
- sentence_span_miss: 37
- false_neighbor_convergence: 36
- trainer_retrieval_fail: 33
- one_sided_swap: 24
- over_flattened_output: 23
- surface_close_under_large_gap: 2
- punctuation_only_shift: 0
- anchor_break: 0
- generator_hold: 0
- generator_unbounded_semantics: 0
- both_rejected_swap: 0
- mask_near_home_hold: 0

## Worst Families

- customer-support: 31
- clinic-scheduling: 21
- committee-budget: 20
- tenant-leak: 18
- school-coordination: 18
- building-access: 16
- mutual-aid: 16
- archive-grant: 14

## Worst Cases

- clinic-scheduling-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap.
- customer-support-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap.
- tenant-leak-to-package-handoff-false-neighbor: one_sided_swap, over_flattened_output, register_miss, semantic_drift // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift.
- tenant-leak-to-package-handoff-false-neighbor: one_sided_swap, over_flattened_output, register_miss, semantic_drift // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift.
- customer-support-rushed-to-formal: one_sided_swap, semantic_drift, sentence_span_miss // Buckets: one_sided_swap, semantic_drift, sentence_span_miss.
- package-handoff-to-tenant-leak-false-neighbor: false_neighbor_convergence, one_sided_swap, register_miss // Buckets: false_neighbor_convergence, one_sided_swap, register_miss.
- customer-support-to-clinic-scheduling-false-neighbor: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- performance-review-to-committee-budget-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.
- mutual-aid-to-customer-support-false-neighbor: false_neighbor_convergence, one_sided_swap, register_miss // Buckets: false_neighbor_convergence, one_sided_swap, register_miss.
- customer-support-to-mutual-aid-false-neighbor: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- performance-review-to-overwork-debrief-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.
- building-access-to-customer-support-literal-risk: over_flattened_output, register_miss, semantic_drift // Buckets: over_flattened_output, register_miss, semantic_drift.

## Generator Audit

- case_count: 52
- landed_count: 52
- held_count: 0
- structural_count: 50
- surface_count: 1
- semantic_bounded_rate: 1
- unsafe_structural_count: 0
- protected_anchor_integrity_min: 1
- average_candidate_count: 3.1154
- average_selected_candidate_score: 0.8709
- generator_versions: v2:52
- source_classes: procedural-record:19, formal-correspondence:30, narrative-scene:3
- hold_classes: none

### Generator Misses

- model-safety-mask-same-family: mask, formal-correspondence, transfer surface, registered surface-only, hold landed/none, bounded yes, selected score 0.4901

## Toolability

- expected_case_count: 34
- landed_rate: 1
- hold_rate: 0
- artifact_rate: 0.4118
- weak_movement_rate: 0.0294
- distinctness_rate: 1
- convergence_rate: 0
- preview_honesty_rate: 1
- repeated_flight_stability_rate: 1

### Toolability Probes

- reflective-live: landed 5, holds 0, distinct 5, convergence 0, artifacts 0.8, preview honesty 1
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
- average_nearest_field_distance: 2.5227
- min_nearest_field_distance: 2.142
- missing_recipe_sample_ids: none
- distinct_output_check: 7/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- operator <-> methods-editor: field distance 2.142, profile 0.672, heatmap 1.305, traceability 1
- archivist <-> methods-editor: field distance 2.292, profile 1.005, heatmap 1.11, traceability 1
- operator <-> cross-examiner: field distance 2.334, profile 0.796, heatmap 1, traceability 0.869
- archivist <-> operator: field distance 2.361, profile 1.244, heatmap 1.001, traceability 1
- undertow <-> matron: field distance 2.496, profile 0.639, heatmap 1.333, traceability 0.986
- operator <-> matron: field distance 2.987, profile 1.051, heatmap 1.501, traceability 0.966

## Private TD613 Aperture Working State

- state: buffered
- blocked_generative_passage: yes
- donor_pressure: real
- witness_pressure: rising
- realized_passage: weak
- provenance_floor: maintained
- swap_matrix: bilateral 46/104, one-sided 14/104, flagship 6/8
- representative_pairs: bilateral visible 6/6, bilateral non-trivial 6/6, average score 35.67

## Private TD613 Aperture Representative Pairs

- building-access-rushed-mobile -> adversarial-hearing-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- benefits-appeal-professional-message -> adversarial-hearing-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- municipal-zoning-formal-record -> committee-budget-professional-message: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- adversarial-hearing-rushed-mobile -> adversarial-hearing-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- museum-fog-alarm-professional-message -> adversarial-hearing-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- model-safety-rushed-mobile -> adversarial-hearing-formal-record: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes

## Annex Diagnostics

### TD613 Aperture

- status: passed
- version: 1.8.0
- source: app/aperture/index.html
- content_hash_sha256: f8a7a4d10d6cd62a0215ae8d0bb525183f6257829bd9cc6a4746dc0a1c28b193
- inline_script_count: 3
- failed_checks: none

