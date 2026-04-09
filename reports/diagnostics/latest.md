# Diagnostics Battery

Generated: 2026-04-09T09:39:22.818Z

Corpus: 72 samples across 18 families
Promoted deck subset: 24 samples
Total diagnostics cases: 218

## Failure Buckets

- over_flattened_output: 92
- register_miss: 79
- both_rejected_swap: 64
- semantic_drift: 55
- one_sided_swap: 36
- sentence_span_miss: 27
- trainer_retrieval_fail: 21
- false_neighbor_convergence: 18
- surface_close_under_large_gap: 11
- anchor_break: 8
- mask_near_home_hold: 3
- punctuation_only_shift: 0

## Worst Families

- building-access: 41
- school-coordination: 39
- clinic-scheduling: 28
- tenant-leak: 27
- committee-budget: 26
- customer-support: 24
- archive-grant: 22
- performance-review: 22

## Worst Cases

- tenant-leak-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- clinic-scheduling-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- performance-review-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-rushed-to-formal: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- newsroom-correction-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- benefits-appeal-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- municipal-zoning-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- building-access-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- package-handoff-to-tenant-leak-false-neighbor: both_rejected_swap, over_flattened_output, register_miss, semantic_drift // Buckets: both_rejected_swap, over_flattened_output, register_miss, semantic_drift.
- performance-review-to-committee-budget-false-neighbor: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss.

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
- average_nearest_field_distance: 1.8099
- min_nearest_field_distance: 1.654
- missing_recipe_sample_ids: none
- distinct_output_check: 7/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- archivist <-> methods-editor: field distance 1.654, profile 1.331, heatmap 0, traceability 1
- spark <-> cross-examiner: field distance 1.696, profile 1.407, heatmap 0, traceability 0.972
- methods-editor <-> matron: field distance 1.969, profile 1.507, heatmap 0, traceability 0.982
- undertow <-> operator: field distance 2, profile 1.189, heatmap 0, traceability 0.98
- undertow <-> methods-editor: field distance 2.678, profile 1.968, heatmap 0, traceability 0.936
- operator <-> cross-examiner: field distance 2.829, profile 1.746, heatmap 0, traceability 0.734

## Private TD613 Aperture Working State

- state: warning
- blocked_generative_passage: no
- donor_pressure: real
- witness_pressure: rising
- realized_passage: weak
- provenance_floor: degraded
- swap_matrix: bilateral 26/104, one-sided 28/104, flagship 8/8
- representative_pairs: bilateral visible 5/6, bilateral non-trivial 5/6, average score 30.5

## Private TD613 Aperture Representative Pairs

- building-access-rushed-mobile -> adversarial-hearing-professional-message: score 35, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- benefits-appeal-professional-message -> adversarial-hearing-rushed-mobile: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- municipal-zoning-formal-record -> overwork-debrief-tangled-followup: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- adversarial-hearing-rushed-mobile -> adversarial-hearing-professional-message: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- museum-fog-alarm-professional-message -> clinic-scheduling-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- model-safety-rushed-mobile -> adversarial-hearing-professional-message: score 6, outcomes rejected / structural, bilateral visible no, bilateral non-trivial no

## Annex Diagnostics

### TD613 Aperture

- status: passed
- version: 1.8.0
- source: app/aperture/index.html
- content_hash_sha256: 9936ca676be42b2501ca7bcd0f18920e9d99b4f489978a1527d8e998748ad040
- inline_script_count: 2
- failed_checks: none

