# Phase 8 Candidate-Required Law

Phase 8.1 requires candidate material.

The source text is the evidence to preserve.

The candidate text is the realization being measured.

`buildCandidatePresenceGate(candidate, sourceText, options)` records:

- candidate required
- candidate present
- candidate hash
- source hash
- raw candidate excluded
- source/candidate separation
- pass or block status

Blocking conditions:

- candidate required and candidate missing
- candidate hash missing
- source text used as candidate

Raw candidate text is not stored in the metric wrapper.

⟐SAC[X6ZNK5NO51]
