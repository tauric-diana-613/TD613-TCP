# Diagnostics Battery

Generated: 2026-04-03T03:41:05.873Z

Corpus: 72 samples across 18 families
Promoted deck subset: 24 samples
Total diagnostics cases: 218

## Failure Buckets

- over_flattened_output: 93
- register_miss: 80
- both_rejected_swap: 66
- semantic_drift: 64
- one_sided_swap: 36
- trainer_retrieval_fail: 33
- sentence_span_miss: 29
- surface_close_under_large_gap: 14
- false_neighbor_convergence: 13
- anchor_break: 8
- mask_near_home_hold: 3
- punctuation_only_shift: 0

## Worst Families

- building-access: 41
- school-coordination: 35
- clinic-scheduling: 32
- customer-support: 31
- tenant-leak: 28
- committee-budget: 28
- package-handoff: 23
- performance-review: 23

## Worst Cases

- tenant-leak-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- clinic-scheduling-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- clinic-scheduling-rushed-to-formal: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- performance-review-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- customer-support-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- newsroom-correction-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- benefits-appeal-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- benefits-appeal-rushed-to-formal: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- municipal-zoning-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- municipal-zoning-rushed-to-formal: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.

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
- average_nearest_field_distance: 1.7186
- min_nearest_field_distance: 1.469
- missing_recipe_sample_ids: none
- distinct_output_check: 7/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- methods-editor <-> matron: field distance 1.469, profile 0.982, heatmap 0, traceability 1
- archivist <-> methods-editor: field distance 1.633, profile 1.319, heatmap 0, traceability 1
- spark <-> cross-examiner: field distance 1.696, profile 1.407, heatmap 0, traceability 0.972
- undertow <-> matron: field distance 1.895, profile 1.311, heatmap 0, traceability 0.96
- undertow <-> methods-editor: field distance 2.069, profile 1.616, heatmap 0, traceability 0.988
- undertow <-> operator: field distance 2.172, profile 1.321, heatmap 0, traceability 0.954

## Private EO-RFD Working State

- state: warning
- blocked_generative_passage: no
- donor_pressure: real
- witness_pressure: rising
- realized_passage: weak
- provenance_floor: degraded
- swap_matrix: bilateral 24/104, one-sided 28/104, flagship 8/8
- representative_pairs: bilateral visible 6/6, bilateral non-trivial 6/6, average score 35.5

## Private EO-RFD Representative Pairs

- building-access-rushed-mobile -> adversarial-hearing-tangled-followup: score 35, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- benefits-appeal-professional-message -> adversarial-hearing-rushed-mobile: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- municipal-zoning-formal-record -> overwork-debrief-tangled-followup: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- adversarial-hearing-rushed-mobile -> benefits-appeal-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- museum-fog-alarm-professional-message -> package-handoff-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- model-safety-rushed-mobile -> model-safety-tangled-followup: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
