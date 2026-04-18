# Diagnostics Battery

Generated: 2026-04-18T03:12:37.889Z

Corpus: 72 samples across 18 families
Promoted deck subset: 24 samples
Total diagnostics cases: 270

## Failure Buckets

- register_miss: 60
- semantic_drift: 59
- sentence_span_miss: 41
- over_flattened_output: 35
- trainer_retrieval_fail: 33
- one_sided_swap: 26
- false_neighbor_convergence: 26
- both_rejected_swap: 8
- surface_close_under_large_gap: 3
- punctuation_only_shift: 0
- anchor_break: 0
- generator_hold: 0
- generator_unbounded_semantics: 0
- mask_near_home_hold: 0

## Worst Families

- customer-support: 33
- tenant-leak: 30
- building-access: 28
- clinic-scheduling: 21
- committee-budget: 21
- mutual-aid: 21
- school-coordination: 18
- archive-grant: 14

## Worst Cases

- tenant-leak-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap.
- clinic-scheduling-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap.
- customer-support-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap.
- building-access-to-museum-fog-alarm-false-neighbor: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss.
- building-access-to-museum-fog-alarm-false-neighbor: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss.
- tenant-leak-to-package-handoff-false-neighbor: one_sided_swap, over_flattened_output, register_miss, semantic_drift // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift.
- mutual-aid-to-customer-support-false-neighbor: both_rejected_swap, over_flattened_output, register_miss, semantic_drift // Buckets: both_rejected_swap, over_flattened_output, register_miss, semantic_drift.
- tenant-leak-to-package-handoff-false-neighbor: one_sided_swap, over_flattened_output, register_miss, semantic_drift // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift.
- mutual-aid-to-customer-support-false-neighbor: both_rejected_swap, over_flattened_output, register_miss, semantic_drift // Buckets: both_rejected_swap, over_flattened_output, register_miss, semantic_drift.
- tenant-leak-rushed-to-formal: one_sided_swap, semantic_drift, sentence_span_miss // Buckets: one_sided_swap, semantic_drift, sentence_span_miss.
- customer-support-rushed-to-formal: one_sided_swap, semantic_drift, sentence_span_miss // Buckets: one_sided_swap, semantic_drift, sentence_span_miss.
- building-access-to-customer-support-false-neighbor: both_rejected_swap, over_flattened_output, semantic_drift // Buckets: both_rejected_swap, over_flattened_output, semantic_drift.

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
- average_selected_candidate_score: 0.8447
- generator_versions: v2:52
- source_classes: procedural-record:19, formal-correspondence:30, narrative-scene:3
- hold_classes: none

### Generator Misses

- model-safety-mask-same-family: mask, formal-correspondence, transfer surface, registered surface-only, hold landed/none, bounded yes, selected score 0.4901

## Toolability

- expected_case_count: 34
- landed_rate: 1
- hold_rate: 0
- artifact_rate: 0.3824
- weak_movement_rate: 0.0294
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
- average_nearest_field_distance: 2.5306
- min_nearest_field_distance: 2.129
- missing_recipe_sample_ids: none
- distinct_output_check: 7/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- operator <-> methods-editor: field distance 2.129, profile 0.652, heatmap 1.305, traceability 1
- archivist <-> methods-editor: field distance 2.292, profile 1.005, heatmap 1.11, traceability 1
- operator <-> cross-examiner: field distance 2.415, profile 0.842, heatmap 1, traceability 0.864
- archivist <-> operator: field distance 2.447, profile 1.293, heatmap 1.001, traceability 1
- undertow <-> matron: field distance 2.496, profile 0.639, heatmap 1.333, traceability 0.986
- operator <-> matron: field distance 2.886, profile 0.995, heatmap 1.501, traceability 0.974

## Private TD613 Aperture Working State

- state: buffered
- blocked_generative_passage: yes
- donor_pressure: real
- witness_pressure: rising
- realized_passage: weak
- provenance_floor: maintained
- swap_matrix: bilateral 42/104, one-sided 16/104, flagship 6/8
- representative_pairs: bilateral visible 6/6, bilateral non-trivial 6/6, average score 35.67

## Private TD613 Aperture Representative Pairs

- building-access-rushed-mobile -> adversarial-hearing-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- benefits-appeal-professional-message -> adversarial-hearing-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- municipal-zoning-formal-record -> adversarial-hearing-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
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

