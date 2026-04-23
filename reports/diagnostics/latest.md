# Diagnostics Battery

Generated: 2026-04-23T02:09:36.315Z

Corpus: 72 samples across 18 families
Promoted deck subset: 24 samples
Total diagnostics cases: 270

## Failure Buckets

- sentence_span_miss: 56
- semantic_drift: 51
- register_miss: 47
- false_neighbor_convergence: 39
- trainer_retrieval_fail: 33
- over_flattened_output: 20
- one_sided_swap: 10
- anchor_break: 10
- surface_close_under_large_gap: 2
- generator_unbounded_semantics: 1
- generator_hold: 1
- punctuation_only_shift: 0
- both_rejected_swap: 0
- mask_near_home_hold: 0

## Worst Families

- package-handoff: 29
- clinic-scheduling: 24
- school-coordination: 23
- committee-budget: 20
- building-access: 18
- model-safety: 18
- archive-grant: 16
- tenant-leak: 15

## Worst Cases

- package-handoff-rushed-to-formal: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap.
- clinic-scheduling-formal-to-rushed: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap // Buckets: one_sided_swap, over_flattened_output, register_miss, semantic_drift, sentence_span_miss, surface_close_under_large_gap.
- model-safety-trainer-sibling: register_miss, semantic_drift, sentence_span_miss, trainer_retrieval_fail // Buckets: register_miss, semantic_drift, sentence_span_miss, trainer_retrieval_fail.
- package-handoff-to-tenant-leak-false-neighbor: anchor_break, over_flattened_output, register_miss // Buckets: anchor_break, over_flattened_output, register_miss.
- committee-budget-to-archive-grant-false-neighbor: over_flattened_output, register_miss, semantic_drift // Buckets: over_flattened_output, register_miss, semantic_drift.
- performance-review-to-committee-budget-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.
- school-coordination-to-clinic-scheduling-false-neighbor: anchor_break, over_flattened_output, register_miss // Buckets: anchor_break, over_flattened_output, register_miss.
- performance-review-to-overwork-debrief-false-neighbor: false_neighbor_convergence, register_miss, semantic_drift // Buckets: false_neighbor_convergence, register_miss, semantic_drift.
- school-coordination-to-tenant-leak-false-neighbor: anchor_break, over_flattened_output, register_miss // Buckets: anchor_break, over_flattened_output, register_miss.
- newsroom-correction-to-model-safety-false-neighbor: false_neighbor_convergence, one_sided_swap, register_miss // Buckets: false_neighbor_convergence, one_sided_swap, register_miss.
- building-access-to-museum-fog-alarm-false-neighbor: false_neighbor_convergence, register_miss, sentence_span_miss // Buckets: false_neighbor_convergence, register_miss, sentence_span_miss.
- clinic-scheduling-to-school-coordination-literal-risk: over_flattened_output, register_miss, semantic_drift // Buckets: over_flattened_output, register_miss, semantic_drift.

## Generator Audit

- case_count: 52
- landed_count: 51
- held_count: 1
- structural_count: 49
- surface_count: 2
- semantic_bounded_rate: 0.9808
- unsafe_structural_count: 1
- protected_anchor_integrity_min: 1
- average_candidate_count: 3.1346
- average_selected_candidate_score: 0.8778
- generator_versions: v2:52
- source_classes: procedural-record:19, formal-correspondence:30, narrative-scene:3
- hold_classes: aperture-route-pressure:1

### Generator Misses

- package-handoff-mask-same-family: mask, formal-correspondence, transfer held, registered generator-hold, hold held/aperture-route-pressure, bounded yes, selected score 0
- package-handoff-formal-record-under-rushed-mobile: transfer, procedural-record, transfer structural, registered n/a, hold landed/none, bounded no, selected score 1.2192
- model-safety-mask-same-family: mask, formal-correspondence, transfer surface, registered surface-only, hold landed/none, bounded yes, selected score 0.3961
- model-safety-rushed-mobile-under-professional-message: transfer, formal-correspondence, transfer surface, registered n/a, hold landed/none, bounded yes, selected score 0.4823

## Ontology Integrity

- case_count: 52
- temporal_postures: synced:50, preemptive:2
- closure_classes: drift:7, closed:44, suppressed:1
- drift_classes: watch:7, none:44, severe:1
- route_floors: warning:7, play:44, harbor:1
- high_historical_crease_rate: 0
- high_unfolding_energy_rate: 0
- beacon_active_sustained_rate: 0
- held_by_aperture_route_pressure_count: 1
- source_class_mismatch_count: 8
- anchor_loss_count: 0
- proposition_coverage_floor_failures: 2
- action_coverage_floor_failures: 2
- aperture_changed_route_count: 24

### Ontology Pressure Cases

- package-handoff-mask-same-family: mask, formal-correspondence -> formal-correspondence, posture preemptive, closure suppressed, drift severe, route harbor/1, anchors 1, proposition 0.58, action 0.572, crease 0.138, unfold 0.302, beacon beacon-idle, route-shift no, hold aperture-route-pressure
- building-access-under-customer-support-mask-cross-family: mask, procedural-record -> procedural-record, posture synced, closure drift, drift watch, route warning/0.333, anchors 1, proposition 1, action 1, crease 0.02, unfold 0.027, beacon beacon-idle, route-shift yes, hold none
- building-access-under-package-handoff-mask-cross-family: mask, procedural-record -> procedural-record, posture synced, closure drift, drift watch, route warning/0.333, anchors 1, proposition 1, action 1, crease 0.021, unfold 0.029, beacon beacon-idle, route-shift yes, hold none
- clinic-scheduling-mask-same-family: mask, formal-correspondence -> formal-correspondence, posture synced, closure drift, drift watch, route warning/0.333, anchors 1, proposition 1, action 1, crease 0.032, unfold 0.032, beacon beacon-idle, route-shift yes, hold none
- archive-grant-rushed-mobile-under-formal-record: transfer, formal-correspondence -> formal-correspondence, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.012, unfold 0.014, beacon beacon-idle, route-shift yes, hold none
- archive-grant-under-school-coordination-mask-cross-family: mask, procedural-record -> reflective-prose, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.013, unfold 0.014, beacon beacon-idle, route-shift yes, hold none
- benefits-appeal-mask-same-family: mask, formal-correspondence -> formal-correspondence, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.012, unfold 0.014, beacon beacon-idle, route-shift yes, hold none
- committee-budget-formal-record-under-rushed-mobile: transfer, procedural-record -> procedural-record, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.012, unfold 0.014, beacon beacon-idle, route-shift yes, hold none
- committee-budget-rushed-mobile-under-formal-record: transfer, narrative-scene -> narrative-scene, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.013, unfold 0.015, beacon beacon-idle, route-shift yes, hold none
- newsroom-correction-mask-same-family: mask, formal-correspondence -> formal-correspondence, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.012, unfold 0.013, beacon beacon-idle, route-shift yes, hold none
- newsroom-correction-professional-message-under-rushed-mobile: transfer, procedural-record -> procedural-record, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.013, unfold 0.014, beacon beacon-idle, route-shift yes, hold none
- newsroom-correction-rushed-mobile-under-professional-message: transfer, formal-correspondence -> formal-correspondence, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.012, unfold 0.013, beacon beacon-idle, route-shift yes, hold none

## Cadence Duel Integrity

- case_count: 18
- lane_misclassification_count: 0
- syntax_only_winner_count: 0
- lexical_register_false_positive_count: 0
- artifact_repair_rescue_count: 1
- feature_family_realization_rates: orthographyNoise:1, chatspeakShorthand:0.7222, notePosture:0.2778, slangMarkers:0, vernacularMarkers:0
- false_clean_count: 7
- false_dirty_count: 0
- donor_feature_adherence_average: 1
- concealment_effectiveness_average: 0.334
- reference_to_rushed_landed_rate: 1
- probe_to_formal_landed_rate: 1
- average_realized_lexical_swap_count_by_lane_pair: formal-record->rushed-mobile:7.33, rushed-mobile->formal-record:6, professional-message->rushed-mobile:2.67, rushed-mobile->professional-message:2.17
- average_realized_structural_op_count_by_lane_pair: formal-record->rushed-mobile:2.33, rushed-mobile->formal-record:3, professional-message->rushed-mobile:2.83, rushed-mobile->professional-message:2.67
- average_realized_feature_family_count_by_lane_pair: formal-record->rushed-mobile:1.67, rushed-mobile->formal-record:2.67, professional-message->rushed-mobile:2.17, rushed-mobile->professional-message:1.67

### Cadence Duel Cases

- package-handoff-rushed-mobile-under-formal-record: rushed-mobile -> formal-record, selected hybrid, suppressed syntax-shape, repaired yes, syntax-only no, lexical-register-fp no, overstated no, realized orthographyNoise|chatspeakShorthand|notePosture, false-clean none, false-dirty none, donor-adherence 1, concealment 0.9091
- package-handoff-formal-record-under-rushed-mobile: formal-record -> rushed-mobile, selected hybrid, suppressed none, repaired no, syntax-only no, lexical-register-fp no, overstated no, realized orthographyNoise|chatspeakShorthand, false-clean none, false-dirty none, donor-adherence 1, concealment 0

## Toolability

- expected_case_count: 34
- landed_rate: 0.9706
- hold_rate: 0.0294
- artifact_rate: 0.4242
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
- average_nearest_field_distance: 3.0472
- min_nearest_field_distance: 2.766
- deck_randomizer_library_average_nearest_field_distance: 1.7497
- deck_randomizer_library_min_nearest_field_distance: 0.903
- exact_profile_collisions: none

### Closest Sample Pairs

- tenant-leak-rushed-mobile <-> committee-budget-rushed-mobile: field distance 0.478, profile 0.331, heatmap 0, traceability 0.889
- tenant-leak-rushed-mobile <-> mutual-aid-rushed-mobile: field distance 0.903, profile 0.287, heatmap 0.467, traceability 0.836
- committee-budget-rushed-mobile <-> mutual-aid-rushed-mobile: field distance 0.958, profile 0.357, heatmap 0.467, traceability 0.792
- archive-grant-professional-message <-> school-coordination-tangled-followup: field distance 1.074, profile 0.579, heatmap 0.4, traceability 0.975
- benefits-appeal-formal-record <-> museum-fog-alarm-formal-record: field distance 1.144, profile 0.45, heatmap 0.286, traceability 0.972
- mutual-aid-professional-message <-> overwork-debrief-formal-record: field distance 1.248, profile 0.369, heatmap 0.571, traceability 0.967

## Persona Audit

- resolved_persona_count: 7
- unique_resolved_persona_profile_count: 7
- average_nearest_field_distance: 2.3007
- min_nearest_field_distance: 2.077
- missing_recipe_sample_ids: none
- distinct_output_check: 6/7 distinct on customer-support-formal-record

### Closest Persona Pairs

- archivist <-> methods-editor: field distance 2.077, profile 0.879, heatmap 1.11, traceability 1
- undertow <-> matron: field distance 2.096, profile 0.537, heatmap 1.2, traceability 1
- operator <-> methods-editor: field distance 2.127, profile 0.651, heatmap 1.305, traceability 1
- operator <-> cross-examiner: field distance 2.284, profile 0.855, heatmap 1, traceability 0.883
- archivist <-> operator: field distance 2.514, profile 1.304, heatmap 1.001, traceability 1
- operator <-> matron: field distance 2.859, profile 0.985, heatmap 1.5, traceability 0.973

## Private TD613 Aperture Working State

- state: warning
- blocked_generative_passage: no
- donor_pressure: real
- witness_pressure: rising
- realized_passage: weak
- provenance_floor: degraded
- swap_matrix: bilateral 40/104, one-sided 8/104, flagship 6/8
- representative_pairs: bilateral visible 5/6, bilateral non-trivial 6/6, average score 33.67

## Private TD613 Aperture Representative Pairs

- building-access-rushed-mobile -> adversarial-hearing-formal-record: score 36, outcomes structural / structural, bilateral visible yes, bilateral non-trivial yes
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

