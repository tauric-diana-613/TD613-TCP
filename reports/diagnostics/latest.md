# Diagnostics Battery

Generated: 2026-04-10T22:22:30.515Z

Corpus: 72 samples across 18 families
Promoted deck subset: 24 samples
Total diagnostics cases: 270

## Failure Buckets

- semantic_drift: 71
- register_miss: 65
- false_neighbor_convergence: 36
- trainer_retrieval_fail: 32
- one_sided_swap: 26
- over_flattened_output: 17
- sentence_span_miss: 8
- punctuation_only_shift: 0
- surface_close_under_large_gap: 0
- anchor_break: 0
- generator_hold: 0
- generator_unbounded_semantics: 0
- both_rejected_swap: 0
- mask_near_home_hold: 0

## Worst Families

- building-access: 31
- customer-support: 28
- tenant-leak: 23
- newsroom-correction: 18
- performance-review: 17
- committee-budget: 16
- school-coordination: 15
- mutual-aid: 14

## Worst Cases

- tenant-leak-to-school-coordination-false-neighbor: false_neighbor_convergence, one_sided_swap, register_miss, semantic_drift // Buckets: false_neighbor_convergence, one_sided_swap, register_miss, semantic_drift.
- building-access-to-package-handoff-literal-risk: one_sided_swap, over_flattened_output, register_miss, semantic_drift // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift.
- tenant-leak-to-school-coordination-false-neighbor: false_neighbor_convergence, one_sided_swap, register_miss, semantic_drift // Buckets: false_neighbor_convergence, one_sided_swap, register_miss, semantic_drift.
- building-access-formal-to-rushed: one_sided_swap, register_miss, semantic_drift // Buckets: one_sided_swap, register_miss, semantic_drift.
- tenant-leak-formal-to-rushed: one_sided_swap, register_miss, semantic_drift // Buckets: one_sided_swap, register_miss, semantic_drift.
- customer-support-rushed-to-formal: one_sided_swap, register_miss, semantic_drift // Buckets: one_sided_swap, register_miss, semantic_drift.
- tenant-leak-to-package-handoff-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.
- customer-support-to-clinic-scheduling-false-neighbor: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- committee-budget-to-archive-grant-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.
- performance-review-to-committee-budget-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.
- performance-review-to-overwork-debrief-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.
- newsroom-correction-to-model-safety-false-neighbor: false_neighbor_convergence, one_sided_swap, register_miss // Buckets: false_neighbor_convergence, one_sided_swap, register_miss.

## Generator Audit

- case_count: 52
- landed_count: 52
- held_count: 0
- structural_count: 48
- surface_count: 4
- semantic_bounded_rate: 1
- unsafe_structural_count: 0
- protected_anchor_integrity_min: 1
- average_candidate_count: 2.7692
- average_selected_candidate_score: 0.8668
- generator_versions: v2:52
- source_classes: procedural-record:19, formal-correspondence:30, narrative-scene:3
- hold_classes: none

### Generator Misses

- customer-support-mask-same-family: mask, procedural-record, transfer surface, registered surface-only, hold landed/none, bounded yes, selected score 0.2417
- model-safety-mask-same-family: mask, formal-correspondence, transfer surface, registered surface-only, hold landed/none, bounded yes, selected score 0.5895
- museum-fog-alarm-under-building-access-mask-cross-family: mask, formal-correspondence, transfer surface, registered surface-only, hold landed/none, bounded yes, selected score 0.6079
- newsroom-correction-rushed-mobile-under-professional-message: transfer, formal-correspondence, transfer surface, registered n/a, hold landed/none, bounded yes, selected score 0.959

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
- average_nearest_field_distance: 2.5536
- min_nearest_field_distance: 2.042
- missing_recipe_sample_ids: none
- distinct_output_check: 7/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- undertow <-> matron: field distance 2.042, profile 0.731, heatmap 0.933, traceability 0.989
- operator <-> cross-examiner: field distance 2.179, profile 0.776, heatmap 0.889, traceability 0.869
- archivist <-> methods-editor: field distance 2.887, profile 1.309, heatmap 1.2, traceability 1
- undertow <-> methods-editor: field distance 3.133, profile 1.14, heatmap 1.6, traceability 0.96
- methods-editor <-> matron: field distance 3.332, profile 1.106, heatmap 2.001, traceability 1
- undertow <-> operator: field distance 3.395, profile 1.372, heatmap 1.333, traceability 0.891

## Private TD613 Aperture Working State

- state: warning
- blocked_generative_passage: no
- donor_pressure: real
- witness_pressure: rising
- realized_passage: landing
- provenance_floor: maintained
- swap_matrix: bilateral 42/104, one-sided 20/104, flagship 8/8
- representative_pairs: bilateral visible 6/6, bilateral non-trivial 6/6, average score 35.33

## Private TD613 Aperture Representative Pairs

- building-access-rushed-mobile -> adversarial-hearing-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- benefits-appeal-professional-message -> adversarial-hearing-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- municipal-zoning-formal-record -> building-access-tangled-followup: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
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

