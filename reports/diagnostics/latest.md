# Diagnostics Battery

Generated: 2026-04-01T06:15:45.027Z

Corpus: 48 samples across 12 families
Promoted deck subset: 16 samples
Total diagnostics cases: 160

## Failure Buckets

- semantic_drift: 42
- over_flattened_output: 36
- one_sided_swap: 34
- false_neighbor_convergence: 23
- register_miss: 20
- sentence_span_miss: 19
- trainer_retrieval_fail: 19
- mask_near_home_hold: 11
- surface_close_under_large_gap: 10
- punctuation_only_shift: 0
- anchor_break: 0
- both_rejected_swap: 0

## Worst Families

- tenant-leak: 34
- package-handoff: 32
- school-coordination: 28
- building-access: 26
- overwork-debrief: 24
- committee-budget: 16
- archive-grant: 16
- clinic-scheduling: 14

## Worst Cases

- tenant-leak-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- package-handoff-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- school-coordination-mask-same-family: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- building-access-formal-to-rushed: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- package-handoff-rushed-to-formal: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-formal-to-rushed: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- tenant-leak-mask-same-family: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- committee-budget-mask-same-family: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- overwork-debrief-under-performance-review-mask-cross-family: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap // Buckets: mask_near_home_hold, over_flattened_output, sentence_span_miss, surface_close_under_large_gap.
- tenant-leak-under-school-coordination-mask-cross-family: mask_near_home_hold, over_flattened_output, register_miss, semantic_drift // Buckets: mask_near_home_hold, over_flattened_output, register_miss, semantic_drift.
- school-coordination-trainer-sibling: over_flattened_output, register_miss, sentence_span_miss, trainer_retrieval_fail // Buckets: over_flattened_output, register_miss, sentence_span_miss, trainer_retrieval_fail.
