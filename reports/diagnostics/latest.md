# Diagnostics Battery

Generated: 2026-04-22T15:58:11.009Z

Corpus: 72 samples across 18 families
Promoted deck subset: 24 samples
Total diagnostics cases: 270

## Failure Buckets

- register_miss: 60
- sentence_span_miss: 54
- false_neighbor_convergence: 36
- trainer_retrieval_fail: 34
- one_sided_swap: 30
- over_flattened_output: 28
- semantic_drift: 24
- surface_close_under_large_gap: 3
- generator_hold: 2
- punctuation_only_shift: 0
- anchor_break: 0
- generator_unbounded_semantics: 0
- both_rejected_swap: 0
- mask_near_home_hold: 0

## Worst Families

- building-access: 31
- customer-support: 29
- clinic-scheduling: 24
- package-handoff: 22
- tenant-leak: 20
- school-coordination: 18
- model-safety: 17
- committee-budget: 16

## Worst Cases

- clinic-scheduling-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap.
- customer-support-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap.
- building-access-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, sentence_span_miss, surface_close_under_large_gap.
- tenant-leak-to-package-handoff-false-neighbor: one_sided_swap, over_flattened_output, register_miss, semantic_drift // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift.
- building-access-trainer-sibling: over_flattened_output, register_miss, sentence_span_miss, trainer_retrieval_fail // Buckets: over_flattened_output, register_miss, sentence_span_miss, trainer_retrieval_fail.
- museum-fog-alarm-trainer-under-building-access: over_flattened_output, register_miss, sentence_span_miss, trainer_retrieval_fail // Buckets: over_flattened_output, register_miss, sentence_span_miss, trainer_retrieval_fail.
- package-handoff-rushed-mobile-under-formal-record: over_flattened_output, register_miss, semantic_drift, sentence_span_miss // Buckets: over_flattened_output, register_miss, semantic_drift, sentence_span_miss.
- tenant-leak-to-package-handoff-false-neighbor: one_sided_swap, over_flattened_output, register_miss, semantic_drift // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift.
- customer-support-rushed-to-formal: one_sided_swap, semantic_drift, sentence_span_miss // Buckets: one_sided_swap, semantic_drift, sentence_span_miss.
- package-handoff-to-tenant-leak-false-neighbor: false_neighbor_convergence, one_sided_swap, register_miss // Buckets: false_neighbor_convergence, one_sided_swap, register_miss.
- customer-support-to-clinic-scheduling-false-neighbor: one_sided_swap, over_flattened_output, register_miss // Buckets: one_sided_swap, over_flattened_output, register_miss.
- performance-review-to-committee-budget-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.

## Generator Audit

- case_count: 52
- landed_count: 50
- held_count: 2
- structural_count: 47
- surface_count: 2
- semantic_bounded_rate: 1
- unsafe_structural_count: 0
- protected_anchor_integrity_min: 1
- average_candidate_count: 3.1154
- average_selected_candidate_score: 0.815
- generator_versions: v2:52
- source_classes: procedural-record:19, formal-correspondence:30, narrative-scene:3
- hold_classes: aperture-route-pressure:2

### Generator Misses

- building-access-mask-same-family: mask, procedural-record, transfer held, registered generator-hold, hold held/aperture-route-pressure, bounded yes, selected score 0
- package-handoff-rushed-mobile-under-formal-record: transfer, formal-correspondence, transfer held, registered n/a, hold held/aperture-route-pressure, bounded yes, selected score 0
- model-safety-mask-same-family: mask, formal-correspondence, transfer surface, registered surface-only, hold landed/none, bounded yes, selected score 0.3961
- model-safety-rushed-mobile-under-professional-message: transfer, formal-correspondence, transfer surface, registered n/a, hold landed/none, bounded yes, selected score 0.4823

## Ontology Integrity

- case_count: 52
- temporal_postures: synced:50, preemptive:1, drift:1
- closure_classes: closed:46, drift:6
- drift_classes: none:46, active:2, watch:4
- route_floors: play:46, buffer:2, warning:4
- high_historical_crease_rate: 0
- high_unfolding_energy_rate: 0
- beacon_active_sustained_rate: 0
- held_by_aperture_route_pressure_count: 2
- source_class_mismatch_count: 8
- anchor_loss_count: 0
- proposition_coverage_floor_failures: 0
- action_coverage_floor_failures: 0
- aperture_changed_route_count: 22

### Ontology Pressure Cases

- building-access-mask-same-family: mask, procedural-record -> procedural-record, posture drift, closure drift, drift active, route buffer/0.667, anchors 1, proposition 1, action 1, crease 0.038, unfold 0.048, beacon beacon-idle, route-shift no, hold aperture-route-pressure
- package-handoff-rushed-mobile-under-formal-record: transfer, formal-correspondence -> formal-correspondence, posture preemptive, closure drift, drift active, route buffer/0.667, anchors 1, proposition 0.833, action 0.833, crease 0.069, unfold 0.12, beacon beacon-idle, route-shift no, hold aperture-route-pressure
- building-access-under-customer-support-mask-cross-family: mask, procedural-record -> procedural-record, posture synced, closure drift, drift watch, route warning/0.333, anchors 1, proposition 1, action 1, crease 0.02, unfold 0.027, beacon beacon-idle, route-shift yes, hold none
- building-access-under-package-handoff-mask-cross-family: mask, procedural-record -> procedural-record, posture synced, closure drift, drift watch, route warning/0.333, anchors 1, proposition 1, action 1, crease 0.021, unfold 0.029, beacon beacon-idle, route-shift yes, hold none
- clinic-scheduling-mask-same-family: mask, formal-correspondence -> formal-correspondence, posture synced, closure drift, drift watch, route warning/0.333, anchors 1, proposition 1, action 1, crease 0.032, unfold 0.032, beacon beacon-idle, route-shift yes, hold none
- overwork-debrief-under-performance-review-mask-cross-family: mask, formal-correspondence -> narrative-scene, posture synced, closure closed, drift none, route play/0.092, anchors 1, proposition 0.949, action 0.943, crease 0.016, unfold 0.027, beacon beacon-idle, route-shift yes, hold none
- package-handoff-formal-record-under-rushed-mobile: transfer, procedural-record -> procedural-record, posture synced, closure closed, drift none, route play/0.089, anchors 1, proposition 0.992, action 0.985, crease 0.013, unfold 0.016, beacon beacon-idle, route-shift yes, hold none
- archive-grant-rushed-mobile-under-formal-record: transfer, formal-correspondence -> formal-correspondence, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.012, unfold 0.014, beacon beacon-idle, route-shift yes, hold none
- archive-grant-under-school-coordination-mask-cross-family: mask, procedural-record -> reflective-prose, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.013, unfold 0.014, beacon beacon-idle, route-shift yes, hold none
- committee-budget-formal-record-under-rushed-mobile: transfer, procedural-record -> procedural-record, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.012, unfold 0.013, beacon beacon-idle, route-shift yes, hold none
- committee-budget-rushed-mobile-under-formal-record: transfer, narrative-scene -> narrative-scene, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.013, unfold 0.015, beacon beacon-idle, route-shift yes, hold none
- newsroom-correction-mask-same-family: mask, formal-correspondence -> formal-correspondence, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.012, unfold 0.013, beacon beacon-idle, route-shift yes, hold none

## Cadence Duel Integrity

- case_count: 18
- lane_misclassification_count: 0
- syntax_only_winner_count: 1
- lexical_register_false_positive_count: 0
- artifact_repair_rescue_count: 0
- reference_to_rushed_landed_rate: 1
- probe_to_formal_landed_rate: 0.6667
- average_realized_lexical_swap_count_by_lane_pair: formal-record->rushed-mobile:3.33, rushed-mobile->formal-record:2, professional-message->rushed-mobile:2.67, rushed-mobile->professional-message:2.17
- average_realized_structural_op_count_by_lane_pair: formal-record->rushed-mobile:1.67, rushed-mobile->formal-record:1.33, professional-message->rushed-mobile:3, rushed-mobile->professional-message:2.67

### Cadence Duel Cases

- package-handoff-rushed-mobile-under-formal-record: rushed-mobile -> formal-record, selected hybrid, suppressed syntax-shape, repaired no, syntax-only yes, lexical-register-fp no, overstated yes
- package-handoff-formal-record-under-rushed-mobile: formal-record -> rushed-mobile, selected cadence-connector, suppressed hybrid, repaired no, syntax-only no, lexical-register-fp no, overstated no

## Toolability

- expected_case_count: 34
- landed_rate: 0.9706
- hold_rate: 0.0294
- artifact_rate: 0.3636
- weak_movement_rate: 0.0303
- distinctness_rate: 1
- convergence_rate: 0
- preview_honesty_rate: 1
- repeated_flight_stability_rate: 1

### Toolability Probes

- reflective-live: landed 5, holds 0, distinct 5, convergence 0, artifacts 0.6, preview honesty 1
- narrative-live: landed 5, holds 0, distinct 5, convergence 0, artifacts 1, preview honesty 1

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
- average_nearest_field_distance: 2.3833
- min_nearest_field_distance: 2.077
- missing_recipe_sample_ids: none
- distinct_output_check: 6/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- archivist <-> methods-editor: field distance 2.077, profile 0.879, heatmap 1.11, traceability 1
- operator <-> methods-editor: field distance 2.127, profile 0.651, heatmap 1.305, traceability 1
- operator <-> cross-examiner: field distance 2.419, profile 0.836, heatmap 1, traceability 0.872
- undertow <-> matron: field distance 2.496, profile 0.639, heatmap 1.333, traceability 0.986
- archivist <-> operator: field distance 2.514, profile 1.304, heatmap 1.001, traceability 1
- operator <-> matron: field distance 2.86, profile 0.985, heatmap 1.501, traceability 0.973

## Private TD613 Aperture Working State

- state: buffered
- blocked_generative_passage: yes
- donor_pressure: real
- witness_pressure: rising
- realized_passage: weak
- provenance_floor: maintained
- swap_matrix: bilateral 36/104, one-sided 22/104, flagship 6/8
- representative_pairs: bilateral visible 4/6, bilateral non-trivial 6/6, average score 31.33

## Private TD613 Aperture Representative Pairs

- building-access-rushed-mobile -> archive-grant-rushed-mobile: score 22, outcomes surface-held / structural, bilateral visible no, bilateral non-trivial yes
- benefits-appeal-professional-message -> adversarial-hearing-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- municipal-zoning-formal-record -> adversarial-hearing-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- adversarial-hearing-rushed-mobile -> adversarial-hearing-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- museum-fog-alarm-professional-message -> adversarial-hearing-rushed-mobile: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
- model-safety-rushed-mobile -> adversarial-hearing-formal-record: score 22, outcomes surface-held / structural, bilateral visible no, bilateral non-trivial yes

## Annex Diagnostics

### TD613 Aperture

- status: passed
- version: 2.2.1
- source: app/aperture/index.html
- content_hash_sha256: 21a1498753d2dfd31821f81f92ec451b89816c68079ffc4f5f8ad7ae964ab99c
- inline_script_count: 8
- failed_checks: none

