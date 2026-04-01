# Diagnostics Battery

Generated: 2026-04-01T22:19:14.363Z

Corpus: 48 samples across 12 families
Promoted deck subset: 16 samples
Total diagnostics cases: 160

## Failure Buckets

- semantic_drift: 49
- over_flattened_output: 25
- trainer_retrieval_fail: 22
- false_neighbor_convergence: 19
- sentence_span_miss: 14
- one_sided_swap: 14
- register_miss: 12
- mask_near_home_hold: 12
- surface_close_under_large_gap: 7
- punctuation_only_shift: 0
- anchor_break: 0
- both_rejected_swap: 0

## Worst Families

- package-handoff: 27
- school-coordination: 23
- tenant-leak: 19
- overwork-debrief: 19
- building-access: 17
- committee-budget: 17
- clinic-scheduling: 14
- customer-support: 12

## Worst Cases

- package-handoff-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- tenant-leak-mask-same-family: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- committee-budget-mask-same-family: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- mutual-aid-under-customer-support-mask-cross-family: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-under-performance-review-mask-cross-family: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- tenant-leak-under-school-coordination-mask-cross-family: mask_near_home_hold, over_flattened_output, register_miss, semantic_drift // Buckets: mask_near_home_hold, over_flattened_output, register_miss, semantic_drift.
- school-coordination-trainer-sibling: over_flattened_output, register_miss, sentence_span_miss, trainer_retrieval_fail // Buckets: over_flattened_output, register_miss, sentence_span_miss, trainer_retrieval_fail.
- building-access-trainer-under-package-handoff: over_flattened_output, register_miss, sentence_span_miss, trainer_retrieval_fail // Buckets: over_flattened_output, register_miss, sentence_span_miss, trainer_retrieval_fail.
- package-handoff-to-building-access-false-neighbor: false_neighbor_convergence, one_sided_swap, semantic_drift // Buckets: false_neighbor_convergence, one_sided_swap, semantic_drift.
- clinic-scheduling-to-school-coordination-false-neighbor: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.

## Sample Audit

- randomizer_corpus_size: 48
- unique_resolved_sample_profile_count: 48
- exact_profile_collisions: none

### Closest Sample Pairs

- customer-support-tangled-followup <-> school-coordination-formal-record: distance 0.213, similarity 0.693, traceability 0.815
- package-handoff-tangled-followup <-> clinic-scheduling-tangled-followup: distance 0.223, similarity 0.743, traceability 0.87
- tenant-leak-rushed-mobile <-> committee-budget-rushed-mobile: distance 0.235, similarity 0.666, traceability 0.807
- package-handoff-rushed-mobile <-> tenant-leak-rushed-mobile: distance 0.261, similarity 0.652, traceability 0.777
- package-handoff-rushed-mobile <-> performance-review-rushed-mobile: distance 0.323, similarity 0.601, traceability 0.728
- archive-grant-professional-message <-> performance-review-tangled-followup: distance 0.368, similarity 0.721, traceability 0.846

## Persona Audit

- resolved_persona_count: 7
- unique_resolved_persona_profile_count: 7
- missing_recipe_sample_ids: none
- distinct_output_check: 7/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- archivist <-> undertow: distance 1.073, similarity 0.713, traceability 0.821
- spark <-> cross-examiner: distance 1.192, similarity 0.661, traceability 0.772
- undertow <-> cross-examiner: distance 1.25, similarity 0.676, traceability 0.775
- spark <-> operator: distance 1.299, similarity 0.723, traceability 0.844
- archivist <-> spark: distance 1.898, similarity 0.566, traceability 0.645
- archivist <-> cross-examiner: distance 1.943, similarity 0.628, traceability 0.702

## Private EO-RFD Working State

- state: warning
- blocked_generative_passage: no
- donor_pressure: real
- witness_pressure: rising
- realized_passage: landing
- provenance_floor: maintained
- swap_matrix: bilateral 64/72, one-sided 8/72, flagship 12/12
- representative_pairs: bilateral visible 4/4, bilateral non-trivial 4/4, average score 35

## Private EO-RFD Representative Pairs

- building-access-rushed-mobile -> committee-budget-tangled-followup: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- package-handoff-formal-record -> archive-grant-tangled-followup: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- overwork-debrief-professional-message -> archive-grant-tangled-followup: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- school-coordination-rushed-mobile -> customer-support-rushed-mobile: score 34, outcomes partial / structural, bilateral visible yes, bilateral non-trivial yes
