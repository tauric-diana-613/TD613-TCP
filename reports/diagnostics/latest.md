# Diagnostics Battery

Generated: 2026-04-09T23:31:17.935Z

Corpus: 72 samples across 18 families
Promoted deck subset: 24 samples
Total diagnostics cases: 218

## Failure Buckets

- false_neighbor_convergence: 53
- over_flattened_output: 45
- semantic_drift: 39
- register_miss: 39
- sentence_span_miss: 32
- trainer_retrieval_fail: 25
- anchor_break: 20
- both_rejected_swap: 12
- surface_close_under_large_gap: 10
- one_sided_swap: 8
- punctuation_only_shift: 5
- mask_near_home_hold: 1

## Worst Families

- school-coordination: 33
- building-access: 28
- clinic-scheduling: 24
- package-handoff: 19
- tenant-leak: 17
- committee-budget: 17
- overwork-debrief: 17
- archive-grant: 16

## Worst Cases

- clinic-scheduling-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- clinic-scheduling-rushed-to-formal: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- mutual-aid-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-rushed-to-formal: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-formal-to-rushed: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-rushed-to-formal: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: both_rejected_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- municipal-zoning-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- package-handoff-mask-same-family: anchor_break, over_flattened_output, punctuation_only_shift, register_miss, sentence_span_miss // Buckets: anchor_break, over_flattened_output, punctuation_only_shift, register_miss, sentence_span_miss.
- clinic-scheduling-mask-same-family: anchor_break, over_flattened_output, punctuation_only_shift, register_miss, sentence_span_miss // Buckets: anchor_break, over_flattened_output, punctuation_only_shift, register_miss, sentence_span_miss.
- school-coordination-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- benefits-appeal-rushed-to-formal: over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.

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
- realized_passage: landing
- provenance_floor: degraded
- swap_matrix: bilateral 38/104, one-sided 8/104, flagship 8/8
- representative_pairs: bilateral visible 6/6, bilateral non-trivial 6/6, average score 35.83

## Private TD613 Aperture Representative Pairs

- building-access-rushed-mobile -> adversarial-hearing-formal-record: score 35, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- benefits-appeal-professional-message -> adversarial-hearing-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- municipal-zoning-formal-record -> archive-grant-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- adversarial-hearing-rushed-mobile -> adversarial-hearing-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- museum-fog-alarm-professional-message -> adversarial-hearing-professional-message: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- model-safety-rushed-mobile -> newsroom-correction-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes

## Annex Diagnostics

### TD613 Aperture

- status: passed
- version: 1.8.0
- source: app/aperture/index.html
- content_hash_sha256: f8a7a4d10d6cd62a0215ae8d0bb525183f6257829bd9cc6a4746dc0a1c28b193
- inline_script_count: 3
- failed_checks: none

