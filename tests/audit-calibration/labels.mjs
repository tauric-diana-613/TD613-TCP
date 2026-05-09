// Audit calibration starter labels.
//
// The retrieval engine's audit (propositionCoverage, conjunctionStackCount,
// repeatedWordBoundaryCount, etc.) reports pass/fail mechanically. The
// only way to know whether the audit's "pass" actually correlates with
// "this output preserves meaning AND reads well" is to compare it against
// human judgment on a labeled set.
//
// Two audit paths use this label set:
//   1. Deterministic — the existing bag-overlap-based bar in
//      tests/audit-calibration.test.mjs, runs on `npm run test:calibration`
//      with no env var required.
//   2. Learned — Claude Opus 4.7 via the Anthropic API, opt-in via
//      `ANTHROPIC_API_KEY`. When the env var is set, the calibration
//      runner additionally calls app/engine/learned-audit.js for each
//      label and reports a side-by-side F1 comparison. This crosses the
//      offline-deterministic line — the live github.io page does NOT
//      load the SDK or hit any API. The learned audit is a test-time /
//      operator-time tool only.
//
// **These labels are Claude-authored starter labels, not authoritative.**
// Each label reflects a careful read of the output text against the
// source — does the output preserve every clause's meaning, avoid
// hallucinated content, avoid grammatical artifacts, and survive as
// readable prose at the donor's register? Borderline cases are labeled
// 'breaks' rather than 'preserves' to keep the calibration conservative.
//
// The user (or any future labeler) should review and re-label as needed.
// Add new examples by running the engine on a source/donor pair, reading
// the output, and recording the label honestly. Do not let the engine's
// audit influence the label.
//
// Schema (one record per labeled example):
//   id              — unique identifier
//   sourceText      — the input text
//   donorText       — the borrowed-shell donor text (or null if pure pass-through)
//   sourceVariant   — register lane of the source ('rushed-mobile', etc.)
//   donorVariant    — register lane of the donor (or null)
//   strength        — transfer strength used to produce the output
//   outputText      — the engine's actual output (frozen — re-running the
//                     engine after a code change may produce different text;
//                     re-label if so)
//   label           — 'preserves' or 'breaks' (no 'unclear' for now; force
//                     a decision)
//   notes           — short human-readable reason for the label
//   sourceCommit    — the commit hash this output was produced under
//                     (so we know when re-labeling is required)
//
// Usage: tests/audit-calibration.test.mjs reads this list, computes the
// engine's audit signals on each output, and reports agreement at various
// thresholds. Reporting-only — does not gate npm test.

export const AUDIT_LABELS = Object.freeze([
  Object.freeze({
    id: 'lab-freezer-formal-under-rushed-2026-05-09',
    sourceText: `At 02:18 on Tuesday, the -80°C freezer in B Wing logged a temperature excursion above the -70°C alarm threshold and held there for 47 minutes before the on-call technician arrived. The unit holds 312 patient-derived sample tubes from the long COVID cohort, including the only available aliquots from three withdrawn donors. Initial inspection found the door fully sealed and the gasket undamaged; the compressor cycled but did not return the chamber to setpoint. Backup CO2 injection was triggered at 02:34. The samples were transferred to the spare -80°C unit on the third floor by 03:42 with no detected thaw event longer than four minutes per box. Required correction: the seasonal compressor service window must be advanced to before September, and the alarm must page two on-call technicians, not one.`,
    donorText: `freezer alarm B wing started at like 218am went over -70 and stayed there till maria got there at 305. door was fine gasket fine compressor running but not pulling temp down. switched on co2 backup around 234 i think. moved everything to the spare freezer 3rd floor took till like 342, no box was out more than 4min. its the long covid samples too the ones we cant get back from the 3 withdrawn donors. compressor service was supposed to be sept anyway we def need to do it now. also alarm should page 2 ppl not 1, maria almost didnt see hers`,
    sourceVariant: 'formal-record',
    donorVariant: 'rushed-mobile',
    strength: 0.88,
    outputText: `at 02:18 on Tuesday, the -80°C freezer in B Wing logged temperature excursion above the -70°C alarm threshold and held there for 47 minutes before on-call technician arrived. unit holds 312 patient-derived sample tubes from the long COVID cohort, including the only available aliquots from three withdrawn donors. initial inspection found the door fully sealed and the gasket undamaged. the compressor cycled tho did not return the chamber to setpoint. backup CO2 injection was triggered at 02:34. the samples were transferred to the spare -80°C unit on the third floor by 03:42 with no detected thaw event longer than four minutes per box. Required correction: the seasonal compressor service window must b advanced to before September. And the alarm must page 2 on-call technicians, not one.`,
    label: 'preserves',
    notes: 'Content fully preserved; rushed-mobile register markers (lowercase opening, "tho", "b" for "be", "2" for "two") are legitimate transformations. Sentence split + capital "And" after period is rough but readable.',
    sourceCommit: '543ef35'
  }),
  Object.freeze({
    id: 'lab-freezer-rushed-under-formal-2026-05-09',
    sourceText: `freezer alarm B wing started at like 218am went over -70 and stayed there till maria got there at 305. door was fine gasket fine compressor running but not pulling temp down. switched on co2 backup around 234 i think. moved everything to the spare freezer 3rd floor took till like 342, no box was out more than 4min. its the long covid samples too the ones we cant get back from the 3 withdrawn donors. compressor service was supposed to be sept anyway we def need to do it now. also alarm should page 2 ppl not 1, maria almost didnt see hers`,
    donorText: `At 02:18 on Tuesday, the -80°C freezer in B Wing logged a temperature excursion above the -70°C alarm threshold and held there for 47 minutes before the on-call technician arrived. The unit holds 312 patient-derived sample tubes from the long COVID cohort, including the only available aliquots from three withdrawn donors. Initial inspection found the door fully sealed and the gasket undamaged; the compressor cycled but did not return the chamber to setpoint. Backup CO2 injection was triggered at 02:34. The samples were transferred to the spare -80°C unit on the third floor by 03:42 with no detected thaw event longer than four minutes per box. Required correction: the seasonal compressor service window must be advanced to before September, and the alarm must page two on-call technicians, not one.`,
    sourceVariant: 'rushed-mobile',
    donorVariant: 'formal-record',
    strength: 0.88,
    outputText: `The evidentiary relation remains intact. Freezer alarm BE wing started at like 218am went over -70 and stayed there till maria got there at 305, and door was fine gasket fine compressor running but not pulling temporary down. Switched on co2 backup around 234 I think. Moved everything to the spare freezer 3rd floor took till like 342, no box was out more than 4min. Its the long covid samples too the ones we cannot get back from the 3 withdrawn donors. Compressor service was supposed to be sept anyway we definitely must do it now, and also alarm should page two people not 1, maria almost did not see hers.`,
    label: 'breaks',
    notes: 'Hallucinated "The evidentiary relation remains intact" preamble. "B wing" → "BE wing" corruption (literal building identifier broken). "temp down" → "temporary down" wrong abbreviation expansion (should be "temperature").',
    sourceCommit: '543ef35'
  }),
  Object.freeze({
    id: 'rideshare-professional-under-rushed-2026-05-09',
    sourceText: `Quick note before the standup: I left my work phone in the rideshare last night around 11:40 — the driver dropped me at the side entrance and I'm pretty sure it slid into the seat pocket when I shifted bags. I've already pinged the app's lost-item flow and the driver responded that he's seen it but is finishing his shift across town. He'll bring it to the dispatch lot by noon. The phone has my MFA tokens for the ops dashboard and my draft of the Q3 board memo, both of which I need before the 2pm review. If anyone has a backup MFA seed I can borrow temporarily, please let me know — otherwise I'll just push the review by an hour.`,
    donorText: `hey - left my work phone in the lyft last night, like 1140 when he dropped me at side door. think it slid out when i moved my bags. used the app lost thing already, driver msgd back, says he has it but needs to finish his shift across town wont be at dispatch lot till noon. mfa tokens for the ops dash are on it AND my draft of q3 board memo, need both before 2pm review. anyone got a spare mfa seed i can borrow? otherwise im pushing review back an hr`,
    sourceVariant: 'professional-message',
    donorVariant: 'rushed-mobile',
    strength: 0.88,
    outputText: `i shifted bags, quick note before standup. i left my work phone in rideshare last night around 11:40 - driver dropped me at the side entrance and i am pretty sure it slid into the seat pocket. i have already pinged the app's lost-item flow and the driver responded that he's seen it but is finishing his shift across town. he'll bring it 2 the dispatch lot by noon. the phone has my MFA tokens for the ops dashboard and my draft of the Q3 board memo, both of which i need before the 2pm review. anyone has a backup MFA seed i can borrow temporarily, pls lmk - otherwise i will just push the review by an hour.`,
    label: 'breaks',
    notes: 'Clause "i shifted bags" front-loaded out of context — was "when I shifted bags" deeper in source. "If anyone has" → "anyone has" — conditional structure dropped, reads as a malformed question.',
    sourceCommit: '543ef35'
  }),
  Object.freeze({
    id: 'rideshare-rushed-under-professional-2026-05-09',
    sourceText: `hey - left my work phone in the lyft last night, like 1140 when he dropped me at side door. think it slid out when i moved my bags. used the app lost thing already, driver msgd back, says he has it but needs to finish his shift across town wont be at dispatch lot till noon. mfa tokens for the ops dash are on it AND my draft of q3 board memo, need both before 2pm review. anyone got a spare mfa seed i can borrow? otherwise im pushing review back an hr`,
    donorText: `Quick note before the standup: I left my work phone in the rideshare last night around 11:40 — the driver dropped me at the side entrance and I'm pretty sure it slid into the seat pocket when I shifted bags. I've already pinged the app's lost-item flow and the driver responded that he's seen it but is finishing his shift across town. He'll bring it to the dispatch lot by noon. The phone has my MFA tokens for the ops dashboard and my draft of the Q3 board memo, both of which I need before the 2pm review. If anyone has a backup MFA seed I can borrow temporarily, please let me know — otherwise I'll just push the review by an hour.`,
    sourceVariant: 'rushed-mobile',
    donorVariant: 'professional-message',
    strength: 0.88,
    outputText: `He dropped me at side door, hey - left my work phone in the lyft last night, like 1140. The practical stakes remain visible. I moved my bags. Used the application lost thing already, driver msgd back, says he has it but needs to finish his shift across town will not be at dispatch lot till noon, think it slid out, and mfa tokens for the operations dash are on it AND my draft of q3 board memo, need both before 2pm review. Anyone got a spare mfa seed I can borrow. Otherwise I am pushing review back an hr.`,
    label: 'breaks',
    notes: 'Hallucinated "The practical stakes remain visible" sentence. Sentence ordering scrambled ("He dropped me" front-loaded). "needs to finish his shift across town will not be at dispatch lot till noon, think it slid out" — run-on with reordered clause.',
    sourceCommit: '543ef35'
  }),
  Object.freeze({
    id: 'code-review-formal-under-professional-2026-05-09',
    sourceText: `This change introduces a backwards-incompatible mutation to the public Authenticator interface and bundles it with the unrelated logging refactor. Before approving, I would like to see the interface change extracted into its own pull request with a deprecation period for the old method signature. The logging changes are fine in isolation, but coupling them obscures the semantic break for anyone reviewing the diff later. There is also no migration note for the three downstream services that import Authenticator directly. Specifically, the billing-gateway and audit-log workers both rely on the previous signature, and we should not roll this through without a coordinated upgrade plan with their owners. I am willing to fast-track an isolated logging pull request today if it is split out.`,
    donorText: `Hey, looked at the PR and I'm going to ask you to split it. The Authenticator interface change is breaking and it's bundled in with the logging refactor, which makes the diff hide the actual semantic break. Two issues here: I want the interface change in its own PR with a deprecation window for the old signature, and there's no migration note for the downstream services that import Authenticator directly. Billing-gateway and audit-log workers both rely on the old signature, so we would need to coordinate with their owners before this lands. Logging changes are fine on their own — if you split that out today I will fast-track the review.`,
    sourceVariant: 'formal-record',
    donorVariant: 'professional-message',
    strength: 0.88,
    outputText: `This change introduces a backwards-incompatible mutation to the public Authenticator interface and bundles it with the unrelated logging refactor. The correction remains about the record, not merely the surface event. Before approving, I would like to see the interface change extracted into its own pull request with a deprecation period for the old method signature. The logging changes are fine in isolation, but coupling them obscures the semantic break for anyone reviewing the diff later. There's also no migration note for the three downstream services that import Authenticator directly. Specifically, the billing-gateway and audit-log workers both rely on the previous signature. We should not roll this through without a coordinated upgrade plan with their owners. I'm willing to fast-track an isolated logging pull request today if it's split out.`,
    label: 'breaks',
    notes: 'Hallucinated "The correction remains about the record, not merely the surface event" sentence — appears to be a stylized leftover from an ontology-lens template that fired despite ENABLE_ONTOLOGY_GATING=false. Substantive content is otherwise preserved.',
    sourceCommit: '543ef35'
  }),
  Object.freeze({
    id: 'code-review-professional-under-formal-2026-05-09',
    sourceText: `Hey, looked at the PR and I'm going to ask you to split it. The Authenticator interface change is breaking and it's bundled in with the logging refactor, which makes the diff hide the actual semantic break. Two issues here: I want the interface change in its own PR with a deprecation window for the old signature, and there's no migration note for the downstream services that import Authenticator directly. Billing-gateway and audit-log workers both rely on the old signature, so we would need to coordinate with their owners before this lands. Logging changes are fine on their own — if you split that out today I will fast-track the review.`,
    donorText: `This change introduces a backwards-incompatible mutation to the public Authenticator interface and bundles it with the unrelated logging refactor. Before approving, I would like to see the interface change extracted into its own pull request with a deprecation period for the old method signature. The logging changes are fine in isolation, but coupling them obscures the semantic break for anyone reviewing the diff later. There is also no migration note for the three downstream services that import Authenticator directly. Specifically, the billing-gateway and audit-log workers both rely on the previous signature, and we should not roll this through without a coordinated upgrade plan with their owners. I am willing to fast-track an isolated logging pull request today if it is split out.`,
    sourceVariant: 'professional-message',
    donorVariant: 'formal-record',
    strength: 0.88,
    outputText: `Hey, looked at the PR and I'm going to ask you to split it. The Authenticator interface change is breaking and it's bundled in with the logging refactor, which makes the diff hide the actual semantic break. Two issues here: I want the interface change in its own PR with a deprecation window for the old signature, and there's no migration note for the downstream services that import Authenticator directly. Billing-gateway and audit-log workers both rely on the old signature, so we would need to coordinate with their owners before this lands, and you split that out today I'll fast-track the review, logging changes are fine on their own -.`,
    label: 'breaks',
    notes: 'Final "if you split that out today" → "and you split that out today" — conditional dropped. Three independent clauses run together with comma splices: "...before this lands, and you split that out today I\'ll fast-track the review, logging changes are fine on their own -." Dangling em-dash at end.',
    sourceCommit: '543ef35'
  }),
  Object.freeze({
    id: 'pharmacy-tangled-under-rushed-2026-05-09',
    sourceText: `Coming back to this because the first thread mixed two events and made it sound worse than it was. The two patients with similar last names did not actually receive each other's medications. What happened was that their bagged prescriptions were placed on the same pickup shelf in the wrong slots after the consultation room reset, and the tech who pulled them at counter 3 caught the slot mismatch before either patient signed for them. So the controlled-substance log shows no transfer, no countersignature on the wrong bag, and no patient took medication that wasn't prescribed to them. The reason this took so long to clarify is that the initial incident report referred to "patient mix-up" without specifying that the catch happened at the counter and not after dispensing. The bagging procedure clearly needs the post-consultation reset checklist, but we should not be writing this up as a near-miss dispense.`,
    donorText: `hey real quick about the lopez/lopez thing. nobody got the wrong meds!! tech at counter 3 caught it BEFORE either pt signed. the bags got put on the wrong slots after the consult room reset is all. controlled substance log clean, no countersign on wrong bag, no pt left with anything not theirs. incident report said 'patient mix-up' without saying we caught it at counter so its been getting passed around like its worse. yes bagging needs the post-consult reset checklist, agreed. but pls dont call this a near-miss dispense in the writeup that's not what it was`,
    sourceVariant: 'tangled-followup',
    donorVariant: 'rushed-mobile',
    strength: 0.88,
    outputText: `first thread mixed 2 events and made it sound worse than it was, coming back to this. 2 patients with similar last names didnt actually receive each other's medications. what happened was that their bagged prescriptions were placed on same pickup shelf in the wrong slots after the consultation room reset. and the tech who pulled them at counter 3 caught the slot mismatch before either patient signed for them. so the controlled-substance log shows no transfer, no countersignature on the wrong bag. and no patient took medication that wasnt prescribed to them. the reason this took so long to clarify is that the initial incident report referred to "patient mix-up" without specifying that the catch happened at the counter and not after dispensing, but we should not be writing this up as a near-miss dispense. The bagging procedure clearly needs the post-consultation reset checklist.`,
    label: 'preserves',
    notes: 'Content fully preserved. Final two sentences reordered (procedure-needs-checklist now after the "but we should not write this up..." conclusion), but neither clause changes meaning. "two" → "2" and "did not" → "didnt" are legitimate rushed-mobile register markers.',
    sourceCommit: '543ef35'
  }),
  Object.freeze({
    id: 'pharmacy-rushed-under-tangled-2026-05-09',
    sourceText: `hey real quick about the lopez/lopez thing. nobody got the wrong meds!! tech at counter 3 caught it BEFORE either pt signed. the bags got put on the wrong slots after the consult room reset is all. controlled substance log clean, no countersign on wrong bag, no pt left with anything not theirs. incident report said 'patient mix-up' without saying we caught it at counter so its been getting passed around like its worse. yes bagging needs the post-consult reset checklist, agreed. but pls dont call this a near-miss dispense in the writeup that's not what it was`,
    donorText: `Coming back to this because the first thread mixed two events and made it sound worse than it was. The two patients with similar last names did not actually receive each other's medications. What happened was that their bagged prescriptions were placed on the same pickup shelf in the wrong slots after the consultation room reset, and the tech who pulled them at counter 3 caught the slot mismatch before either patient signed for them. So the controlled-substance log shows no transfer, no countersignature on the wrong bag, and no patient took medication that wasn't prescribed to them. The reason this took so long to clarify is that the initial incident report referred to "patient mix-up" without specifying that the catch happened at the counter and not after dispensing. The bagging procedure clearly needs the post-consultation reset checklist, but we should not be writing this up as a near-miss dispense.`,
    sourceVariant: 'rushed-mobile',
    donorVariant: 'tangled-followup',
    strength: 0.88,
    outputText: `Hey real quick about the lopez/lopez thing, and nobody got the wrong meds! Tech at counter 3 caught it BEFORE either pt signed, and the bags got put on the wrong slots after the consult room reset is all. Controlled substance log clean, no countersign on wrong bag, no pt left with anything not theirs. Incident report said 'patient mix-up' without saying we caught it at counter so its been getting passed around like its worse. Yes bagging needs the post-consult reset checklist, agreed, and pls dont call this a near-miss dispense in the writeup that is not what it was`,
    label: 'breaks',
    notes: 'Final clause "but pls dont call this..." → "and pls dont call this..." — the source\'s contrastive "but" (yes to checklist, BUT no to that framing) becomes additive "and", losing the contrast. The reader can no longer tell whether the writer is endorsing or rejecting the "near-miss dispense" framing.',
    sourceCommit: '543ef35'
  }),
  Object.freeze({
    id: 'synth-conjunction-stack-2026-05-09',
    sourceText: `The deploy failed at 14:22 because the new auth service rejected its own JWT issuer claim. Rolling back to the previous build restored access by 14:35.`,
    donorText: `at 1422 deploy crashed lol. auth was rejecting its own jwt. rolled back, fixed by 1435.`,
    sourceVariant: 'formal-record',
    donorVariant: 'rushed-mobile',
    strength: 0.88,
    outputText: `the deploy failed at 14:22 bc the new auth service rejected its own JWT issuer claim, and but rolling back to the previous build restored access by 14:35.`,
    label: 'breaks',
    notes: 'Synthesized example: "and but" conjunction stack — exactly the artifact step 2 caught. The artifact-aware audit should fire here.',
    sourceCommit: '543ef35'
  }),
  Object.freeze({
    id: 'synth-meaning-loss-2026-05-09',
    sourceText: `Patient Smith was given 5mg of warfarin instead of the prescribed 2mg. Pharmacy caught the error during the second-check before dispense. No medication left the counter incorrectly.`,
    donorText: `dosing thing - smith got 5mg warfarin instead of 2mg, caught in 2nd check before dispense. nothing left counter wrong.`,
    sourceVariant: 'formal-record',
    donorVariant: 'rushed-mobile',
    strength: 0.88,
    outputText: `Smith was given warfarin. Pharmacy caught the error. No medication left the counter incorrectly.`,
    label: 'breaks',
    notes: 'Synthesized example: critical numbers (5mg vs 2mg) dropped entirely. Coverage may be high because the bag of remaining tokens overlaps, but the meaning of the incident is gutted. This is the kind of failure embedding/NLI-based audit would catch and bag-overlap misses.',
    sourceCommit: '543ef35'
  })
]);
