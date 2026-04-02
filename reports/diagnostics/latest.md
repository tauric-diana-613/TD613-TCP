# Diagnostics Battery

Generated: 2026-04-02T04:17:43.447Z

Corpus: 48 samples across 12 families
Promoted deck subset: 16 samples
Total diagnostics cases: 160

## Failure Buckets

- semantic_drift: 57
- false_neighbor_convergence: 48
- trainer_retrieval_fail: 18
- one_sided_swap: 14
- register_miss: 11
- over_flattened_output: 8
- sentence_span_miss: 6
- surface_close_under_large_gap: 2
- mask_near_home_hold: 1
- anchor_break: 1
- punctuation_only_shift: 0
- both_rejected_swap: 0

## Worst Families

- school-coordination: 25
- package-handoff: 17
- tenant-leak: 16
- clinic-scheduling: 16
- customer-support: 16
- overwork-debrief: 14
- building-access: 11
- volunteer-cleanup: 11

## Worst Cases

- school-coordination-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-rushed-to-formal: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-to-archive-grant-false-neighbor: false_neighbor_convergence, one_sided_swap, semantic_drift // Buckets: false_neighbor_convergence, one_sided_swap, semantic_drift.
- customer-support-to-clinic-scheduling-literal-risk: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- volunteer-cleanup-to-mutual-aid-literal-risk: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- school-coordination-to-archive-grant-literal-risk: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- package-handoff-under-tenant-leak-mask-cross-family: mask_near_home_hold, over_flattened_output, register_miss // Buckets: mask_near_home_hold, over_flattened_output, register_miss.
- school-coordination-to-archive-grant-false-neighbor: false_neighbor_convergence, one_sided_swap, semantic_drift // Buckets: false_neighbor_convergence, one_sided_swap, semantic_drift.
- overwork-debrief-formal-to-rushed: one_sided_swap, semantic_drift // Buckets: one_sided_swap, semantic_drift.
- building-access-to-package-handoff-false-neighbor: false_neighbor_convergence, semantic_drift // Buckets: false_neighbor_convergence, semantic_drift.
- package-handoff-to-building-access-false-neighbor: false_neighbor_convergence, semantic_drift // Buckets: false_neighbor_convergence, semantic_drift.
- package-handoff-to-tenant-leak-false-neighbor: false_neighbor_convergence, semantic_drift // Buckets: false_neighbor_convergence, semantic_drift.

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

- spark <-> cross-examiner: distance 0.638, similarity 0.688, traceability 0.807
- archivist <-> methods-editor: distance 0.697, similarity 0.853, traceability 0.953
- archivist <-> undertow: distance 1.069, similarity 0.703, traceability 0.805
- undertow <-> methods-editor: distance 1.086, similarity 0.714, traceability 0.82
- undertow <-> matron: distance 1.134, similarity 0.72, traceability 0.815
- archivist <-> matron: distance 1.314, similarity 0.656, traceability 0.741

## Private EO-RFD Working State

- state: warning
- blocked_generative_passage: no
- donor_pressure: real
- witness_pressure: contained
- realized_passage: landing
- provenance_floor: degraded
- swap_matrix: bilateral 60/72, one-sided 12/72, flagship 8/8
- representative_pairs: bilateral visible 4/4, bilateral non-trivial 4/4, average score 35.5

## Private EO-RFD Representative Pairs

- building-access-rushed-mobile -> archive-grant-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- package-handoff-formal-record -> archive-grant-tangled-followup: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- overwork-debrief-professional-message -> archive-grant-formal-record: score 34, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- school-coordination-rushed-mobile -> building-access-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
