# Diagnostics Battery

Generated: 2026-04-02T20:40:30.648Z

Corpus: 48 samples across 12 families
Promoted deck subset: 16 samples
Total diagnostics cases: 160

## Failure Buckets

- semantic_drift: 60
- false_neighbor_convergence: 48
- trainer_retrieval_fail: 18
- one_sided_swap: 14
- register_miss: 9
- over_flattened_output: 7
- sentence_span_miss: 6
- surface_close_under_large_gap: 2
- anchor_break: 1
- punctuation_only_shift: 0
- both_rejected_swap: 0
- mask_near_home_hold: 0

## Worst Families

- school-coordination: 25
- package-handoff: 17
- customer-support: 16
- tenant-leak: 15
- clinic-scheduling: 15
- overwork-debrief: 14
- building-access: 12
- volunteer-cleanup: 11

## Worst Cases

- school-coordination-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-rushed-to-formal: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-to-archive-grant-false-neighbor: false_neighbor_convergence, one_sided_swap, semantic_drift // Buckets: false_neighbor_convergence, one_sided_swap, semantic_drift.
- customer-support-to-clinic-scheduling-literal-risk: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- volunteer-cleanup-to-mutual-aid-literal-risk: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- school-coordination-to-archive-grant-literal-risk: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- school-coordination-to-archive-grant-false-neighbor: false_neighbor_convergence, one_sided_swap, semantic_drift // Buckets: false_neighbor_convergence, one_sided_swap, semantic_drift.
- overwork-debrief-formal-to-rushed: one_sided_swap, semantic_drift // Buckets: one_sided_swap, semantic_drift.
- building-access-to-package-handoff-false-neighbor: false_neighbor_convergence, semantic_drift // Buckets: false_neighbor_convergence, semantic_drift.
- package-handoff-to-building-access-false-neighbor: false_neighbor_convergence, semantic_drift // Buckets: false_neighbor_convergence, semantic_drift.
- package-handoff-to-tenant-leak-false-neighbor: false_neighbor_convergence, semantic_drift // Buckets: false_neighbor_convergence, semantic_drift.
- tenant-leak-to-package-handoff-false-neighbor: false_neighbor_convergence, semantic_drift // Buckets: false_neighbor_convergence, semantic_drift.

## Sample Audit

- randomizer_corpus_size: 48
- unique_resolved_sample_profile_count: 48
- deck_randomizer_size: 16
- deck_randomizer_family_count: 8
- deck_randomizer_paired_family_count: 8
- average_nearest_field_distance: 2.6819
- min_nearest_field_distance: 2.064
- exact_profile_collisions: none

### Closest Sample Pairs

- tenant-leak-rushed-mobile <-> committee-budget-rushed-mobile: field distance 0.382, profile 0.235, heatmap 0, traceability 0.807
- archive-grant-professional-message <-> school-coordination-tangled-followup: field distance 1.151, profile 0.656, heatmap 0.4, traceability 0.833
- tenant-leak-rushed-mobile <-> mutual-aid-rushed-mobile: field distance 1.198, profile 0.507, heatmap 0.4, traceability 0.687
- mutual-aid-professional-message <-> overwork-debrief-formal-record: field distance 1.279, profile 0.4, heatmap 0.571, traceability 0.827
- building-access-tangled-followup <-> tenant-leak-professional-message: field distance 1.367, profile 0.641, heatmap 0.5, traceability 0.861
- overwork-debrief-rushed-mobile <-> archive-grant-rushed-mobile: field distance 1.375, profile 0.521, heatmap 0.5, traceability 0.699

## Persona Audit

- resolved_persona_count: 7
- unique_resolved_persona_profile_count: 7
- average_nearest_field_distance: 1.7841
- min_nearest_field_distance: 1.42
- missing_recipe_sample_ids: none
- distinct_output_check: 7/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- undertow <-> matron: field distance 1.42, profile 1.051, heatmap 0, traceability 0.854
- archivist <-> methods-editor: field distance 1.573, profile 1.179, heatmap 0, traceability 0.865
- spark <-> cross-examiner: field distance 1.815, profile 1.711, heatmap 0, traceability 0.844
- archivist <-> matron: field distance 2.138, profile 1.48, heatmap 0, traceability 0.756
- archivist <-> undertow: field distance 2.272, profile 1.601, heatmap 0, traceability 0.76
- undertow <-> methods-editor: field distance 2.742, profile 2.157, heatmap 0, traceability 0.729

## Private EO-RFD Working State

- state: warning
- blocked_generative_passage: no
- donor_pressure: real
- witness_pressure: rising
- realized_passage: landing
- provenance_floor: degraded
- swap_matrix: bilateral 60/72, one-sided 12/72, flagship 8/8
- representative_pairs: bilateral visible 4/4, bilateral non-trivial 4/4, average score 36

## Private EO-RFD Representative Pairs

- building-access-rushed-mobile -> clinic-scheduling-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- customer-support-formal-record -> overwork-debrief-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- overwork-debrief-formal-record -> building-access-professional-message: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- school-coordination-tangled-followup -> building-access-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
