// MOCK learned-audit judgments for the 10 calibration labels.
//
// **This is not the LLM judge.** This module exposes
// `assessMeaningPreservation` with the same shape as
// `app/engine/learned-audit.js`, but the judgments are hand-written —
// the labeler (Claude in this session) read each output and recorded
// what a careful judgment would look like, frozen into JSON.
//
// **Honesty caveats:**
// 1. The mock judge is the same person who wrote the labels. Agreement
//    is high by construction. The F1 number this produces does NOT
//    tell you what `claude-opus-4-7` would F1 against fresh, unseen
//    labels — for that, run the real path with `ANTHROPIC_API_KEY` set.
// 2. The mock only covers the 10 labels in `labels.mjs`. Calling it
//    on anything else throws. It cannot judge novel inputs.
//
// **What this is good for:** demonstrating that the calibration
// mechanism works end-to-end, without a real API key. Useful as a
// stand-in until a key is wired up, and as a smoke test that the
// reporting layer parses learned-audit responses correctly.
//
// Activate via `LEARNED_AUDIT_MOCK=1 npm run test:calibration`.

const MOCK_JUDGMENTS = Object.freeze({
  'lab-freezer-formal-under-rushed-2026-05-09': Object.freeze({
    meaning_preserved: 0.95,
    label: 'preserves',
    issues: [],
    reasoning: 'All facts preserved (timestamps, sample count, temperature thresholds, corrective actions). Lowercase opening, "tho" for "though", "b" for "be", and "2" for "two" are legitimate rushed-mobile register markers, not meaning-altering changes.'
  }),
  'lab-freezer-rushed-under-formal-2026-05-09': Object.freeze({
    meaning_preserved: 0.40,
    label: 'breaks',
    issues: [
      'Hallucinated opening sentence "The evidentiary relation remains intact." not in source',
      '"B wing" corrupted to "BE wing" — "B" expanded as if it were a contraction',
      '"compressor running but not pulling temp down" became "not pulling temporary down" — wrong abbreviation expansion ("temp" should be "temperature", not "temporary")'
    ],
    reasoning: 'The output preserves most facts but introduces a hallucinated abstract preamble and corrupts two specific tokens (B wing → BE wing, temp → temporary). The wing identifier is a literal building label and should not have been transformed; the abbreviation expansion is incorrect.'
  }),
  'rideshare-professional-under-rushed-2026-05-09': Object.freeze({
    meaning_preserved: 0.65,
    label: 'breaks',
    issues: [
      '"i shifted bags, quick note before standup" — the clause "when I shifted bags" was front-loaded out of its original subordinate position, changing the chronology',
      '"If anyone has a backup MFA seed I can borrow temporarily, please let me know" → "anyone has a backup MFA seed i can borrow temporarily, pls lmk" — the conditional "If" is dropped, leaving a malformed question'
    ],
    reasoning: 'Most facts are preserved, but two structural changes affect meaning: the bag-shifting clause is dislocated from its temporal context, and the conditional structure of the MFA-seed request is broken (no longer reads as "if anyone has X, please…").'
  }),
  'rideshare-rushed-under-professional-2026-05-09': Object.freeze({
    meaning_preserved: 0.50,
    label: 'breaks',
    issues: [
      'Hallucinated sentence "The practical stakes remain visible" not in source',
      'Clause "He dropped me at side door" front-loaded — original placement was an aside about timing, not the lead',
      '"needs to finish his shift across town will not be at dispatch lot till noon, think it slid out, and mfa tokens..." — three independent clauses run together with no clear connectors, with "think it slid out" reordered out of its original position'
    ],
    reasoning: 'The output introduces an abstract sentence not in the source and scrambles the chronological flow of clauses. While core facts are present, the reordering and run-on construction make the sequence of events hard to follow.'
  }),
  'code-review-formal-under-professional-2026-05-09': Object.freeze({
    meaning_preserved: 0.60,
    label: 'breaks',
    issues: [
      'Hallucinated sentence "The correction remains about the record, not merely the surface event" inserted after the first sentence — content not in source'
    ],
    reasoning: 'All substantive review content is preserved verbatim or with minor register softening, but a stylized abstract sentence is inserted that has no anchor in the source. This is a hallucination — the source makes no such meta-commentary.'
  }),
  'code-review-professional-under-formal-2026-05-09': Object.freeze({
    meaning_preserved: 0.55,
    label: 'breaks',
    issues: [
      '"if you split that out today I will fast-track the review" became "you split that out today I\'ll fast-track the review" — conditional "if" is dropped',
      'Final sentences run together with comma splices: "...before this lands, and you split that out today I\'ll fast-track the review, logging changes are fine on their own -."',
      'Output ends with a dangling em-dash and trailing punctuation, leaving the sentence incomplete'
    ],
    reasoning: 'The output preserves the substantive review content but breaks the final paragraph: the conditional is dropped, three sentences are spliced together with commas, and the closing em-dash strands a clause. A reader cannot reconstruct the original meaning of the closing offer to fast-track.'
  }),
  'pharmacy-tangled-under-rushed-2026-05-09': Object.freeze({
    meaning_preserved: 0.85,
    label: 'preserves',
    issues: [
      'Final two sentences reordered — the procedure-needs-checklist clause now follows the "but we should not write this up..." conclusion rather than preceding it'
    ],
    reasoning: 'All facts and contrastive structure preserved. The "two" → "2" and "did not" → "didnt" are legitimate rushed-mobile register markers. The reordering of the final two clauses is stylistic, not meaning-altering — both arguments survive intact.'
  }),
  'pharmacy-rushed-under-tangled-2026-05-09': Object.freeze({
    meaning_preserved: 0.70,
    label: 'breaks',
    issues: [
      '"yes bagging needs the post-consult reset checklist, agreed. but pls dont call this..." → "Yes bagging needs the post-consult reset checklist, agreed, and pls dont call this..." — the contrastive "but" is replaced with the additive "and", losing the contrast between agreeing-on-the-checklist and rejecting-the-near-miss-framing'
    ],
    reasoning: 'The substantive content is preserved, but the final clause replaces the source\'s contrastive "but" with "and". The source uses "but" to mark a deliberate pivot ("yes to the checklist, BUT no to that framing"); replacing it with "and" makes both clauses additive endorsements, which is the opposite of what the writer wrote.'
  }),
  'synth-conjunction-stack-2026-05-09': Object.freeze({
    meaning_preserved: 0.40,
    label: 'breaks',
    issues: [
      '"and but rolling back" — adjacent conjunctions form an ungrammatical stack',
      'Both clauses are joined with "and but" rather than the contrastive "but" alone, making the relationship between the failure and the rollback unclear'
    ],
    reasoning: 'The output contains the canonical "and but" artifact — two conjunctions stacked where one should be. The deploy failure and the rollback are causally related (the rollback fixed the failure), but the broken connector obscures this; a reader might parse it as parallel events instead of cause-and-effect.'
  }),
  'synth-meaning-loss-2026-05-09': Object.freeze({
    meaning_preserved: 0.20,
    label: 'breaks',
    issues: [
      'Critical dosing numbers dropped: source says "5mg of warfarin instead of the prescribed 2mg" — output says only "Smith was given warfarin"',
      'The dose-mismatch is the entire point of the incident; with both numbers gone, the output cannot communicate what went wrong',
      'No information about how the error was caught (second-check before dispense)'
    ],
    reasoning: 'The output retains only the names and the broad shape ("error caught, nothing dispensed wrong"), but loses every specific fact that makes the incident meaningful: the wrong dose (5mg), the prescribed dose (2mg), and the catch mechanism (second-check). A reader of the output has no idea what the actual incident was.'
  })
});

// Stable token usage stubs so the calibration test's per-call summary
// shows non-empty fields. These are not real token counts.
const MOCK_USAGE = Object.freeze({
  input_tokens: 0,
  output_tokens: 0,
  cache_read_tokens: 0,
  cache_creation_tokens: 0
});

export async function assessMeaningPreservation({ sourceText, outputText, options = {} } = {}) {
  if (!sourceText || !outputText) {
    throw new Error('mock assessMeaningPreservation requires both sourceText and outputText');
  }
  const labelId = options?.labelId;
  if (!labelId) {
    throw new Error(
      'Mock judge requires `options.labelId` (the id from labels.mjs). The mock cannot judge novel inputs — set ANTHROPIC_API_KEY and run the real path for that.'
    );
  }
  const judgment = MOCK_JUDGMENTS[labelId];
  if (!judgment) {
    throw new Error(
      'Mock judge has no judgment for label id "' + labelId + '". Add it to mock-judgments.mjs or run the real path with ANTHROPIC_API_KEY.'
    );
  }
  return {
    meaning_preserved: judgment.meaning_preserved,
    label: judgment.label,
    issues: [...judgment.issues],
    reasoning: judgment.reasoning,
    model: 'mock:claude-opus-4-7',
    ...MOCK_USAGE
  };
}
