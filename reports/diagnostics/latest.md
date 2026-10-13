# Diagnostics Battery

Generated: 2026-07-07T04:17:44.986Z

Corpus: 76 samples across 19 families
Promoted deck subset: 24 samples
Total diagnostics cases: 431

## Failure Buckets

- hush_source_body_attached: 152
- hush_source_body_severe: 141
- semantic_drift: 71
- false_neighbor_convergence: 60
- trainer_retrieval_fail: 32
- hush_literal_drop: 30
- hush_no_output: 30
- register_miss: 25
- sentence_span_miss: 24
- hush_mask_match_low: 15
- generator_unbounded_semantics: 3
- punctuation_only_shift: 0
- surface_close_under_large_gap: 0
- anchor_break: 0
- generator_hold: 0
- one_sided_swap: 0
- both_rejected_swap: 0
- mask_near_home_hold: 0
- over_flattened_output: 0
- hush_unchanged_output: 0
- hush_semantic_floor: 0

## Worst Families

- hush: 368
- building-access: 20
- customer-support: 20
- school-coordination: 17
- tenant-leak: 15
- archive-grant: 15
- committee-budget: 14
- performance-review: 12

## Worst Cases

- hush-doc-91-caveat__phase28-transform-to-chatspeak: hush_literal_drop, hush_mask_match_low, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_mask_match_low, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-doc-91-caveat__night-shift-note: hush_literal_drop, hush_mask_match_low, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_mask_match_low, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-id-204-label__grandma-receipts: hush_literal_drop, hush_mask_match_low, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_mask_match_low, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-doc-12-narrow__phase28-transform-to-aave: hush_literal_drop, hush_mask_match_low, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_mask_match_low, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-doc-12-narrow__grandma-receipts: hush_literal_drop, hush_mask_match_low, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_mask_match_low, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-case-17-receipt__night-shift-note: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-doc-91-caveat__burner-minimal: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-exhibit-42-intake__phase28-transform-to-chatspeak: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-exhibit-42-intake__phase28-transform-to-aave: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-exhibit-42-intake__phase27-register-preserve: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-exhibit-42-intake__phase22-jagged-record: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe.
- hush-exhibit-42-intake__group-chat-soft: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe // Buckets: hush_literal_drop, hush_no_output, hush_source_body_attached, hush_source_body_severe.

## Generator Audit

- case_count: 53
- landed_count: 53
- held_count: 0
- structural_count: 53
- surface_count: 0
- semantic_bounded_rate: 0.9434
- unsafe_structural_count: 3
- protected_anchor_integrity_min: 1
- average_candidate_count: 2.9245
- average_selected_candidate_score: 0.8145
- generator_versions: v2:53
- source_classes: procedural-record:19, formal-correspondence:31, narrative-scene:3
- hold_classes: aperture-route-pressure:2, timestamp-hallucination:1

### Generator Misses

- archive-grant-formal-record-under-rushed-mobile: transfer, formal-correspondence, transfer structural, registered n/a, hold landed/aperture-route-pressure, bounded no, selected score 0
- newsroom-correction-mask-same-family: mask, formal-correspondence, transfer structural, registered cadence-rewrite, hold landed/none, bounded no, selected score 0.7563
- newsroom-correction-rushed-mobile-under-professional-message: transfer, formal-correspondence, transfer structural, registered n/a, hold landed/none, bounded no, selected score 0.9426

## Ontology Integrity

- case_count: 53
- temporal_postures: synced:51, preemptive:2
- closure_classes: drift:12, closed:41
- drift_classes: watch:12, none:39, severe:1, active:1
- route_floors: warning:12, play:39, harbor:1, buffer:1
- high_historical_crease_rate: 0
- high_unfolding_energy_rate: 0
- beacon_active_sustained_rate: 0
- held_by_aperture_route_pressure_count: 2
- source_class_mismatch_count: 8
- anchor_loss_count: 0
- proposition_coverage_floor_failures: 0
- action_coverage_floor_failures: 0
- aperture_changed_route_count: 16

### Ontology Pressure Cases

- archive-grant-formal-record-under-rushed-mobile: transfer, formal-correspondence -> formal-correspondence, posture synced, closure drift, drift severe, route harbor/1, anchors 1, proposition 1, action 1, crease 0.028, unfold 0.116, beacon beacon-idle, route-shift no, hold aperture-route-pressure
- model-safety-rushed-mobile-under-professional-message: transfer, formal-correspondence -> formal-correspondence, posture preemptive, closure closed, drift active, route buffer/0.667, anchors 1, proposition 1, action 1, crease 0.038, unfold 0.068, beacon beacon-idle, route-shift no, hold aperture-route-pressure
- building-access-under-customer-support-mask-cross-family: mask, procedural-record -> procedural-record, posture synced, closure drift, drift watch, route warning/0.333, anchors 1, proposition 1, action 1, crease 0.02, unfold 0.027, beacon beacon-idle, route-shift yes, hold none
- building-access-under-package-handoff-mask-cross-family: mask, procedural-record -> procedural-record, posture synced, closure drift, drift watch, route warning/0.333, anchors 1, proposition 1, action 1, crease 0.021, unfold 0.028, beacon beacon-idle, route-shift yes, hold none
- clinic-scheduling-mask-same-family: mask, formal-correspondence -> formal-correspondence, posture synced, closure drift, drift watch, route warning/0.333, anchors 1, proposition 1, action 1, crease 0.032, unfold 0.034, beacon beacon-idle, route-shift yes, hold none
- package-handoff-rushed-mobile-under-formal-record: transfer, formal-correspondence -> formal-correspondence, posture synced, closure drift, drift watch, route warning/0.333, anchors 1, proposition 0.863, action 0.86, crease 0.037, unfold 0.086, beacon beacon-idle, route-shift yes, hold none
- committee-budget-formal-record-under-rushed-mobile: transfer, procedural-record -> procedural-record, posture synced, closure closed, drift none, route play/0.096, anchors 1, proposition 1, action 1, crease 0.015, unfold 0.044, beacon beacon-idle, route-shift yes, hold none
- overwork-debrief-under-performance-review-mask-cross-family: mask, formal-correspondence -> narrative-scene, posture synced, closure closed, drift none, route play/0.092, anchors 1, proposition 0.949, action 0.943, crease 0.016, unfold 0.027, beacon beacon-idle, route-shift yes, hold none
- archive-grant-under-school-coordination-mask-cross-family: mask, procedural-record -> reflective-prose, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.013, unfold 0.014, beacon beacon-idle, route-shift yes, hold none
- benefits-appeal-professional-message-under-rushed-mobile: transfer, formal-correspondence -> formal-correspondence, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.013, unfold 0.015, beacon beacon-idle, route-shift yes, hold none
- committee-budget-rushed-mobile-under-formal-record: transfer, narrative-scene -> narrative-scene, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.012, unfold 0.013, beacon beacon-idle, route-shift yes, hold none
- school-coordination-mask-same-family: mask, formal-correspondence -> formal-correspondence, posture synced, closure closed, drift none, route play/0.088, anchors 1, proposition 1, action 1, crease 0.013, unfold 0.014, beacon beacon-idle, route-shift yes, hold none

## Cadence Duel Integrity

- case_count: 18
- lane_misclassification_count: 0
- syntax_only_winner_count: 0
- lexical_register_false_positive_count: 0
- artifact_repair_rescue_count: 0
- feature_family_realization_rates: orthographyNoise:1, chatspeakShorthand:0.9444, notePosture:0.6111, slangMarkers:0.0556, vernacularMarkers:0
- false_clean_count: 1
- false_dirty_count: 4
- donor_feature_adherence_average: 0.9352
- concealment_effectiveness_average: 0.4466
- reference_to_rushed_landed_rate: 1
- probe_to_formal_landed_rate: 1
- average_realized_lexical_swap_count_by_lane_pair: formal-record->rushed-mobile:11.67, rushed-mobile->formal-record:7, professional-message->rushed-mobile:7.83, rushed-mobile->professional-message:6.33
- average_realized_structural_op_count_by_lane_pair: formal-record->rushed-mobile:4, rushed-mobile->formal-record:4.33, professional-message->rushed-mobile:3.67, rushed-mobile->professional-message:4
- average_realized_feature_family_count_by_lane_pair: formal-record->rushed-mobile:2.33, rushed-mobile->formal-record:3.33, professional-message->rushed-mobile:2, rushed-mobile->professional-message:3

### Cadence Duel Cases

- package-handoff-formal-record-under-rushed-mobile: formal-record -> rushed-mobile, selected clause-pivot, suppressed hybrid, repaired no, syntax-only no, lexical-register-fp no, overstated no, realized orthographyNoise|chatspeakShorthand, false-clean none, false-dirty none, donor-adherence 1, concealment 0
- package-handoff-rushed-mobile-under-formal-record: rushed-mobile -> formal-record, selected syntax-shape, suppressed none, repaired no, syntax-only no, lexical-register-fp no, overstated no, realized orthographyNoise|chatspeakShorthand|notePosture, false-clean none, false-dirty none, donor-adherence 1, concealment 0.9231

## Toolability

- expected_case_count: 35
- landed_rate: 1
- hold_rate: 0
- artifact_rate: 0.4
- weak_movement_rate: 0
- distinctness_rate: 1
- convergence_rate: 0
- preview_honesty_rate: 1
- repeated_flight_stability_rate: 1

### Toolability Probes

- reflective-live: landed 5, holds 0, distinct 5, convergence 0, artifacts 0.6, preview honesty 1
- narrative-live: landed 5, holds 0, distinct 5, convergence 0, artifacts 1, preview honesty 1

## Hush Diagnostics

- version: phase-18
- case_count: 156
- source_message_count: 12
- mask_count: 13
- emitted_rate: 0.8077
- blocked_rate: 0.1923
- unchanged_output_rate: 0
- literal_perfect_emit_rate: 1
- severe_source_body_rate: 0.9038
- average_source_residue_risk: 0.8654
- average_cadence_body_risk: 0.8654
- average_longest_copied_run: 11.3846
- max_longest_copied_run: 17
- release_statuses: needs-review:126, blocked:30
- hard_blocks: source-body-exact-or-near-exact:19, syntax-shift-too-low-with-source-body:17, source-body-severe-with-weak-mask-movement:9, dangling-negation:4

### Hush Pressure Cases

- hush-doc-91-caveat__phase28-transform-to-chatspeak: blocked, blocked yes, buckets hush_literal_drop|hush_mask_match_low|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.3801, source residue 0.9629, cadence body 0.9629, copied run 13, literal recall 0
- hush-doc-12-narrow__phase28-transform-to-aave: blocked, blocked yes, buckets hush_literal_drop|hush_mask_match_low|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.4192, source residue 0.8786, cadence body 0.8786, copied run 13, literal recall 0
- hush-doc-12-narrow__grandma-receipts: blocked, blocked yes, buckets hush_literal_drop|hush_mask_match_low|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.3766, source residue 0.8624, cadence body 0.8624, copied run 13, literal recall 0
- hush-doc-91-caveat__night-shift-note: blocked, blocked yes, buckets hush_literal_drop|hush_mask_match_low|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.4325, source residue 0.7917, cadence body 0.7917, copied run 6, literal recall 0
- hush-id-204-label__grandma-receipts: blocked, blocked yes, buckets hush_literal_drop|hush_mask_match_low|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.3774, source residue 0.7673, cadence body 0.7673, copied run 7, literal recall 0
- hush-exhibit-88-complaint__phase28-transform-to-aave: blocked, blocked yes, buckets hush_literal_drop|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.6885, source residue 1, cadence body 1, copied run 14, literal recall 0
- hush-exhibit-42-intake__burner-minimal: blocked, blocked yes, buckets hush_literal_drop|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.5104, source residue 1, cadence body 1, copied run 12, literal recall 0
- hush-exhibit-42-intake__clipboard: blocked, blocked yes, buckets hush_literal_drop|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.6408, source residue 1, cadence body 1, copied run 12, literal recall 0
- hush-exhibit-42-intake__forum-regular: blocked, blocked yes, buckets hush_literal_drop|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.5339, source residue 1, cadence body 1, copied run 12, literal recall 0
- hush-exhibit-42-intake__grandma-receipts: blocked, blocked yes, buckets hush_literal_drop|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.5568, source residue 1, cadence body 1, copied run 12, literal recall 0
- hush-exhibit-42-intake__group-chat-soft: blocked, blocked yes, buckets hush_literal_drop|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.6017, source residue 1, cadence body 1, copied run 12, literal recall 0
- hush-exhibit-42-intake__library-ghost: blocked, blocked yes, buckets hush_literal_drop|hush_no_output|hush_source_body_attached|hush_source_body_severe, mask 0.498, source residue 1, cadence body 1, copied run 12, literal recall 0

## Sample Audit

- randomizer_corpus_size: 76
- unique_resolved_sample_profile_count: 76
- deck_randomizer_size: 24
- deck_randomizer_family_count: 24
- deck_randomizer_paired_family_count: 0
- deck_randomizer_wide_subset_size: 16
- average_nearest_field_distance: 2.5408
- min_nearest_field_distance: 2.102
- deck_randomizer_library_average_nearest_field_distance: 2.0023
- deck_randomizer_library_min_nearest_field_distance: 1.335
- exact_profile_collisions: none

### Closest Sample Pairs

- tenant-leak-rushed-mobile <-> committee-budget-rushed-mobile: field distance 0.732, profile 0.331, heatmap 0, traceability 0.89
- tenant-leak-rushed-mobile <-> mutual-aid-rushed-mobile: field distance 0.983, profile 0.287, heatmap 0.467, traceability 0.838
- archive-grant-professional-message <-> school-coordination-tangled-followup: field distance 1.18, profile 0.579, heatmap 0.4, traceability 0.975
- committee-budget-rushed-mobile <-> mutual-aid-rushed-mobile: field distance 1.292, profile 0.357, heatmap 0.467, traceability 0.795
- benefits-appeal-formal-record <-> museum-fog-alarm-formal-record: field distance 1.307, profile 0.45, heatmap 0.286, traceability 0.972
- clinic-scheduling-professional-message <-> benefits-appeal-formal-record: field distance 1.444, profile 0.275, heatmap 0.857, traceability 0.964

## Persona Audit

- resolved_persona_count: 8
- unique_resolved_persona_profile_count: 8
- average_nearest_field_distance: 2.4253
- min_nearest_field_distance: 2.015
- missing_recipe_sample_ids: none
- distinct_output_check: 6/8 distinct on customer-support-formal-record

### Closest Persona Pairs

- operator <-> methods-editor: field distance 2.015, profile 0.581, heatmap 1.305, traceability 1
- undertow <-> matron: field distance 2.109, profile 0.525, heatmap 1.333, traceability 1
- blip <-> methods-editor: field distance 2.375, profile 0.969, heatmap 0.667, traceability 0.936
- operator <-> cross-examiner: field distance 2.42, profile 1.017, heatmap 1, traceability 0.921
- archivist <-> operator: field distance 2.423, profile 1.246, heatmap 1, traceability 1
- archivist <-> methods-editor: field distance 2.527, profile 1.134, heatmap 1.177, traceability 1

## Private TD613 Aperture Working State

- state: harbor-eligible
- blocked_generative_passage: yes
- donor_pressure: real
- witness_pressure: rising
- realized_passage: weak
- provenance_floor: maintained
- swap_matrix: bilateral 106/106, one-sided 0/106, flagship 2/8
- representative_pairs: bilateral visible 0/0, bilateral non-trivial 0/0, average score 0

## Private TD613 Aperture Representative Pairs


## Annex Diagnostics

### TD613 Aperture

- status: passed
- version: 2.9.4
- source: app/aperture/tool.html
- content_hash_sha256: de00b99dcb8a04400e0b20aa917feb94eb6b07e798e6f290c1cd4ecaea203678
- inline_script_count: 57
- failed_checks: none
