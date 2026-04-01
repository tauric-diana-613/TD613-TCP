# Diagnostics Battery

Generated: 2026-04-01T04:40:09.122Z

Corpus: 48 samples across 12 families
Promoted deck subset: 16 samples
Total diagnostics cases: 160

## Failure Buckets

- over_flattened_output: 65
- one_sided_swap: 60
- register_miss: 38
- sentence_span_miss: 33
- semantic_drift: 23
- false_neighbor_convergence: 23
- surface_close_under_large_gap: 17
- mask_near_home_hold: 15
- trainer_retrieval_fail: 11
- both_rejected_swap: 4
- punctuation_only_shift: 0
- anchor_break: 0

## Worst Families

- school-coordination: 36
- package-handoff: 34
- building-access: 31
- clinic-scheduling: 29
- committee-budget: 26
- tenant-leak: 25
- mutual-aid: 24
- volunteer-cleanup: 21

## Worst Cases

- clinic-scheduling-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- mutual-aid-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- archive-grant-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- package-handoff-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- mutual-aid-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- building-access-formal-to-rushed: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- package-handoff-rushed-to-formal: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- volunteer-cleanup-formal-to-rushed: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- committee-budget-formal-to-rushed: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
