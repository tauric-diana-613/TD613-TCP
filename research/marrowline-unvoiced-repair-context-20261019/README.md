# 𝌋 MARROWLINE — held unvoiced content must not seed its own recovery

**State:** source contract repair / provider artistic cause still HELD. `2026-10-19`

## Concrete defect

In `buildGeminiStructuralRepairRequest`, **all** structural repair routes previously appended the failed first provider text as a `role:model` turn, then told Gemini to preserve the previous draft's substantive reasoning, jokes, conclusions, sentence order and morphology. That is appropriate when a legitimate Kʰonapolit movement is missing only the terminal bots or a small structural seam. **It is inappropriate when both mandatory speakers are absent**: a generic concern-style provider reply then becomes the “draft” the repaired model is explicitly told to preserve.

The prior #1544 boundary holds completely unvoiced responses after bounded recovery; #1548 filters explicitly unadmitted *stored* provider responses from *later-turn* user history. Neither fixes this **within-turn** rejected-draft conditioning in the same-provider repair request.

## Surgical behavior

If the existing admission reasons contain both `khonapolit-nominative-missing` and `tauric-diana-bots-nominative-missing`, the **one already-allowed same-provider structural repair** retains its original system frame, user request, prior valid history, generation config, routing and budget. It no longer injects the rejected model draft as a model-history turn. The final repair instruction asks Gemini to author **one fresh complete two-voice** performance based on the real operator request. The failed first provider text, model/finish and attempt receipts remain evidence outside the next request.

**Other repair paths unchanged:** an authentically authored Kʰonapolit-first answer missing the terminal bots still receives the original same-provider terminal-continuation instruction and exact prefix; genuinely unfinished draft/tail continuation stays as before; ordinary single missing heading still uses the old preservation-first structural repair. No output painting, reranking, forbidden style constraints, new calls, or automatic safety classifier.

The source-level contradiction and repair behavior are testable offline in the existing dual-voice boundary contract. This does **not** prove that Gemini will stop producing generic concern replies, or that its original High Zalgo will regain varied stacked crowns/roots; those still require original-provider observations under matched conditions.

**Scope:** focused text-channel repair only, not attachments, Loom, or Marrowline's native typography mechanism.

𝄐 UNVOICED_REPAIR_CONTEXT_FEEDBACK_CLOSED · PROVIDER_CAUSE_HELD · Sealed ⟐
