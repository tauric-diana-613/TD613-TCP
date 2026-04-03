# Diagnostics Battery

Generated: 2026-04-02T23:57:06.551Z

Corpus: 56 samples across 14 families
Promoted deck subset: 16 samples
Total diagnostics cases: 168

## Failure Buckets

- over_flattened_output: 82
- register_miss: 61
- both_rejected_swap: 56
- semantic_drift: 44
- one_sided_swap: 30
- trainer_retrieval_fail: 24
- sentence_span_miss: 16
- surface_close_under_large_gap: 13
- false_neighbor_convergence: 9
- mask_near_home_hold: 1
- anchor_break: 1
- punctuation_only_shift: 0

## Worst Families

- school-coordination: 37
- customer-support: 36
- clinic-scheduling: 34
- building-access: 31
- tenant-leak: 28
- package-handoff: 26
- mutual-aid: 24
- performance-review: 22

## Worst Cases

- building-access-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- tenant-leak-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- clinic-scheduling-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- clinic-scheduling-rushed-to-formal: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- mutual-aid-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- performance-review-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- performance-review-rushed-to-formal: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- customer-support-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- newsroom-correction-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- benefits-appeal-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.

## Sample Audit

- randomizer_corpus_size: 56
- unique_resolved_sample_profile_count: 56
- deck_randomizer_size: 30
- deck_randomizer_family_count: 14
- deck_randomizer_paired_family_count: 14
- deck_randomizer_wide_subset_size: 16
- average_nearest_field_distance: 2.9106
- min_nearest_field_distance: 2.729
- deck_randomizer_library_average_nearest_field_distance: 2.0482
- deck_randomizer_library_min_nearest_field_distance: 1.426
- exact_profile_collisions: none

### Closest Sample Pairs

- tenant-leak-rushed-mobile <-> committee-budget-rushed-mobile: field distance 0.478, profile 0.331, heatmap 0, traceability 0.889
- archive-grant-professional-message <-> school-coordination-tangled-followup: field distance 1.074, profile 0.579, heatmap 0.4, traceability 0.975
- mutual-aid-professional-message <-> overwork-debrief-formal-record: field distance 1.248, profile 0.369, heatmap 0.571, traceability 0.967
- clinic-scheduling-professional-message <-> benefits-appeal-formal-record: field distance 1.28, profile 0.275, heatmap 0.857, traceability 0.964
- tenant-leak-rushed-mobile <-> mutual-aid-rushed-mobile: field distance 1.329, profile 0.638, heatmap 0.4, traceability 0.756
- building-access-tangled-followup <-> tenant-leak-professional-message: field distance 1.343, profile 0.617, heatmap 0.5, traceability 0.994

## Persona Audit

- resolved_persona_count: 7
- unique_resolved_persona_profile_count: 7
- average_nearest_field_distance: 1.8046
- min_nearest_field_distance: 1.42
- missing_recipe_sample_ids: none
- distinct_output_check: 7/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- archivist <-> matron: field distance 1.42, profile 0.883, heatmap 0, traceability 0.959
- archivist <-> methods-editor: field distance 1.512, profile 1.118, heatmap 0, traceability 1
- spark <-> cross-examiner: field distance 1.591, profile 1.528, heatmap 0, traceability 1
- archivist <-> undertow: field distance 2.206, profile 1.535, heatmap 0, traceability 0.905
- undertow <-> matron: field distance 2.424, profile 1.582, heatmap 0, traceability 0.885
- methods-editor <-> matron: field distance 2.506, profile 1.835, heatmap 0, traceability 0.912

## Private EO-RFD Working State

- state: warning
- blocked_generative_passage: no
- donor_pressure: real
- witness_pressure: rising
- realized_passage: weak
- provenance_floor: degraded
- swap_matrix: bilateral 12/76, one-sided 26/76, flagship 4/8
- representative_pairs: bilateral visible 1/1, bilateral non-trivial 1/1, average score 34

## Private EO-RFD Representative Pairs

- building-access-rushed-mobile -> committee-budget-formal-record: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
