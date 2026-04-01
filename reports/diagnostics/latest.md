# Diagnostics Battery

Generated: 2026-04-01T23:08:20.224Z

Corpus: 48 samples across 12 families
Promoted deck subset: 16 samples
Total diagnostics cases: 160

## Failure Buckets

- semantic_drift: 46
- one_sided_swap: 38
- over_flattened_output: 29
- register_miss: 23
- trainer_retrieval_fail: 18
- false_neighbor_convergence: 17
- sentence_span_miss: 7
- surface_close_under_large_gap: 4
- both_rejected_swap: 4
- mask_near_home_hold: 4
- punctuation_only_shift: 0
- anchor_break: 0

## Worst Families

- customer-support: 22
- school-coordination: 22
- clinic-scheduling: 21
- package-handoff: 20
- committee-budget: 20
- building-access: 18
- tenant-leak: 18
- archive-grant: 17

## Worst Cases

- tenant-leak-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- mutual-aid-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-rushed-to-formal: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- package-handoff-to-building-access-false-neighbor: false_neighbor_convergence, one_sided_swap, semantic_drift // Buckets: false_neighbor_convergence, one_sided_swap, semantic_drift.
- customer-support-to-clinic-scheduling-false-neighbor: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- committee-budget-to-archive-grant-false-neighbor: both_rejected_swap, over_flattened_output, register_miss // Buckets: both_rejected_swap, over_flattened_output, register_miss.
- archive-grant-to-committee-budget-false-neighbor: both_rejected_swap, over_flattened_output, register_miss // Buckets: both_rejected_swap, over_flattened_output, register_miss.
- clinic-scheduling-to-school-coordination-false-neighbor: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- customer-support-to-building-access-literal-risk: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- building-access-to-package-handoff-literal-risk: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- customer-support-to-clinic-scheduling-literal-risk: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.

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

- archivist <-> undertow: distance 0.877, similarity 0.726, traceability 0.839
- spark <-> cross-examiner: distance 0.972, similarity 0.656, traceability 0.764
- archivist <-> cross-examiner: distance 1.246, similarity 0.643, traceability 0.721
- spark <-> operator: distance 1.376, similarity 0.711, traceability 0.829
- operator <-> cross-examiner: distance 1.475, similarity 0.666, traceability 0.755
- undertow <-> cross-examiner: distance 1.567, similarity 0.667, traceability 0.763

## Private EO-RFD Working State

- state: buffered
- blocked_generative_passage: yes
- donor_pressure: real
- witness_pressure: rising
- realized_passage: weak
- provenance_floor: maintained
- swap_matrix: bilateral 40/72, one-sided 30/72, flagship 8/12
- representative_pairs: bilateral visible 4/4, bilateral non-trivial 4/4, average score 35

## Private EO-RFD Representative Pairs

- building-access-rushed-mobile -> committee-budget-tangled-followup: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- package-handoff-formal-record -> archive-grant-tangled-followup: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- overwork-debrief-professional-message -> archive-grant-tangled-followup: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- school-coordination-rushed-mobile -> customer-support-rushed-mobile: score 34, outcomes partial / structural, bilateral visible yes, bilateral non-trivial yes
