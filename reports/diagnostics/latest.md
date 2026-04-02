# Diagnostics Battery

Generated: 2026-04-02T22:54:57.892Z

Corpus: 48 samples across 12 families
Promoted deck subset: 16 samples
Total diagnostics cases: 160

## Failure Buckets

- over_flattened_output: 78
- register_miss: 60
- both_rejected_swap: 52
- semantic_drift: 36
- one_sided_swap: 30
- trainer_retrieval_fail: 24
- sentence_span_miss: 12
- surface_close_under_large_gap: 9
- false_neighbor_convergence: 8
- mask_near_home_hold: 1
- anchor_break: 1
- punctuation_only_shift: 0

## Worst Families

- school-coordination: 38
- customer-support: 36
- tenant-leak: 30
- building-access: 29
- clinic-scheduling: 29
- package-handoff: 26
- mutual-aid: 25
- performance-review: 22

## Worst Cases

- building-access-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- tenant-leak-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- clinic-scheduling-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- mutual-aid-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- performance-review-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- performance-review-rushed-to-formal: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- customer-support-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- package-handoff-to-tenant-leak-false-neighbor: both_rejected_swap, over_flattened_output, register_miss, semantic_drift // Buckets: both_rejected_swap, over_flattened_output, register_miss, semantic_drift.
- package-handoff-to-tenant-leak-false-neighbor: both_rejected_swap, over_flattened_output, register_miss, semantic_drift // Buckets: both_rejected_swap, over_flattened_output, register_miss, semantic_drift.
- package-handoff-to-building-access-false-neighbor: both_rejected_swap, over_flattened_output, semantic_drift // Buckets: both_rejected_swap, over_flattened_output, semantic_drift.

## Sample Audit

- randomizer_corpus_size: 48
- unique_resolved_sample_profile_count: 48
- deck_randomizer_size: 16
- deck_randomizer_family_count: 8
- deck_randomizer_paired_family_count: 8
- average_nearest_field_distance: 2.6756
- min_nearest_field_distance: 2.135
- exact_profile_collisions: none

### Closest Sample Pairs

- tenant-leak-rushed-mobile <-> committee-budget-rushed-mobile: field distance 0.478, profile 0.331, heatmap 0, traceability 0.889
- archive-grant-professional-message <-> school-coordination-tangled-followup: field distance 1.074, profile 0.579, heatmap 0.4, traceability 0.975
- mutual-aid-professional-message <-> overwork-debrief-formal-record: field distance 1.248, profile 0.369, heatmap 0.571, traceability 0.967
- tenant-leak-rushed-mobile <-> mutual-aid-rushed-mobile: field distance 1.329, profile 0.638, heatmap 0.4, traceability 0.756
- building-access-tangled-followup <-> tenant-leak-professional-message: field distance 1.343, profile 0.617, heatmap 0.5, traceability 0.994
- overwork-debrief-rushed-mobile <-> archive-grant-rushed-mobile: field distance 1.426, profile 0.572, heatmap 0.5, traceability 0.794

## Persona Audit

- resolved_persona_count: 7
- unique_resolved_persona_profile_count: 7
- average_nearest_field_distance: 1.8146
- min_nearest_field_distance: 1.42
- missing_recipe_sample_ids: none
- distinct_output_check: 7/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- archivist <-> matron: field distance 1.42, profile 0.883, heatmap 0, traceability 0.959
- archivist <-> methods-editor: field distance 1.512, profile 1.118, heatmap 0, traceability 1
- spark <-> cross-examiner: field distance 1.63, profile 1.538, heatmap 0, traceability 1
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
- swap_matrix: bilateral 12/72, one-sided 26/72, flagship 4/8
- representative_pairs: bilateral visible 3/4, bilateral non-trivial 3/4, average score 27.5

## Private EO-RFD Representative Pairs

- building-access-rushed-mobile -> performance-review-professional-message: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- customer-support-formal-record -> building-access-rushed-mobile: score 6, outcomes rejected / structural, bilateral visible no, bilateral non-trivial no
- overwork-debrief-formal-record -> clinic-scheduling-rushed-mobile: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- school-coordination-tangled-followup -> building-access-rushed-mobile: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
