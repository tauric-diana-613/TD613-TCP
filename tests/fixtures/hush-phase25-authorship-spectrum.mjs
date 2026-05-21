export const phase25AuthorshipSpectrum = [
  {
    id: 'rushed-phone-note',
    label: 'Rushed Phone Note',
    samples: [
      'not polished bc phone note and battery low. FILE-72 was there at 8:41, then later same folder looked cleaner, maybe template / maybe tired eyes / still writing it down before the sequence gets mushy. keep order not mood.',
      'quick-before-i-forget: INV-440 at 2:18, Jordan hold resend until finance knows version. do not split those apart. tiny anchors are the whole spine. if the rewrite drops one piece it turns into fog.',
      'ROSTER-8 after 4:30 on 05/20. maybe normal, maybe not. timing still belongs with the roster. i am saying what stayed attached, not what it means. before / after / later / note.'
    ]
  },
  {
    id: 'compliance-clerk',
    label: 'Over-Organized Compliance Clerk',
    samples: [
      'For clarity, FILE-72 should remain tied to the same export minute. One copy includes the footer and one copy does not. The explanation may be ordinary, but the discrepancy should remain visible in the record.',
      'INV-440 should remain tied to 2:18, Jordan, the resend hold, finance, and the version question. Those details form one operational sequence and should not be separated into unrelated observations.',
      'ROSTER-8 should remain connected to 05/20 and the after-4:30 timing. This statement should preserve chronology without assigning intent or expanding the claim beyond the visible record.'
    ]
  },
  {
    id: 'warm-group-chat',
    label: 'Warm Group Chat Explainer',
    samples: [
      'Just to keep this clear, I am not trying to make this dramatic. FILE-72 is the one detail I would keep together: same export minute, one copy with footer, one copy without footer. Could be normal, but it belongs in the note.',
      'With INV-440, please keep 2:18 in there. Jordan being told to hold the resend until finance confirms the version is not extra color; that is the part that explains why the invoice note matters.',
      'Same thing with ROSTER-8 on 05/20 after 4:30. Maybe all normal, maybe not, but the timing belongs with the roster. I would rather sound careful than smooth away the useful part.'
    ]
  },
  {
    id: 'dry-intake',
    label: 'Dry Intake Voice',
    samples: [
      'The relevant facts should be preserved without expanding the claim. FILE-72 should remain tied to the same export minute. One copy contains the footer and one copy does not.',
      'INV-440 should remain tied to the 2:18 log time. Jordan, the resend hold, finance, and the version question should remain in the same sentence or adjacent sentences.',
      'DOC-31 should remain tied to the missing-call note and the later version where that note was not visible. This should be treated as a sequence observation, not a conclusion.'
    ]
  },
  {
    id: 'memory-anchor',
    label: 'Anxious Memory Anchor',
    samples: [
      'I remember FILE-72 because the footer thing bothered me. That sounds small, but that is how I know the order. First copy had the footer. Other copy did not. Export minute looked the same.',
      'INV-440 sticks because 2:18 was right after lunch and Jordan asked whether to resend or wait. The answer was wait until finance knew which version they were keeping. That is the whole memory hook.',
      'ROSTER-8 after 4:30 on 05/20 is the same kind of detail. Could be normal. I am not trying to be weird. I just do not want the timing washed out.'
    ]
  },
  {
    id: 'blunt-auditor',
    label: 'Blunt Internal Auditor',
    samples: [
      'Keep this narrow. FILE-72 is not just a file issue. Same export minute. One copy has the footer. One copy does not. That is the detail. Anything softer is too vague.',
      'INV-440 is not just an invoice note. It was logged at 2:18. Jordan was told to hold the resend until finance confirmed the version. Keep those parts together.',
      'DOC-31 had the missing-call note when opened. The later version did not. Write it as sequence, not accusation. Do not soften it into nothing.'
    ]
  },
  {
    id: 'spreadsheet-person',
    label: 'Neurotic Spreadsheet Person',
    samples: [
      'I would keep this in row order because otherwise the details start floating away from the thing they belong to. FILE-72 belongs with export minute and footer mismatch. Same minute, two copies, footer present in one and absent in the other.',
      'INV-440 belongs with 2:18, Jordan, resend, finance, and version. I would put those in the same row because splitting them makes Jordan look incidental when Jordan is part of the sequence.',
      'ROSTER-8 belongs with 05/20 and after 4:30. DOC-31 belongs with missing-call note visible before and not visible later. No motive column, just relationships.'
    ]
  },
  {
    id: 'poetic-precise',
    label: 'Poetic Precise Witness',
    samples: [
      'The record has little hinges, and the hinges are where the door moves. FILE-72 is one hinge: same export minute, one copy with footer, one copy without. The difference should stay audible.',
      'INV-440 has its own hinge: 2:18. Jordan, the resend hold, finance, and version all turn around that time. Pull one piece away and the sentence no longer opens correctly.',
      'ROSTER-8 belongs to 05/20 and the after-4:30 change. DOC-31 belongs to the missing-call note before and the later absence after. No thunder needs adding; sequence already speaks.'
    ]
  }
];

export const phase25HardMaskSamples = phase25AuthorshipSpectrum.flatMap((profile) => profile.samples);

export const phase25CoherentInputs = [
  'FILE-72 exported at the same minute, but one copy has the footer and one copy does not. The explanation may be a template issue.',
  'INV-440 was logged at 2:18. Jordan should hold the resend until finance confirms the version.',
  'ROSTER-8 changed after 4:30 on 05/20. The timing should remain attached to the roster note.',
  'DOC-31 had the missing-call note when opened. The later version did not.'
];

export const phase25JaggedInputs = [
  'not polished: FILE-72 same export minute / one copy footer there, one copy no footer. maybe template maybe nothing. mismatch is the thing.',
  'quick note: INV-440 at 2:18, Jordan hold resend until finance knows version. do not split those apart.',
  'ROSTER-8 after 4:30 on 05/20. maybe normal, maybe not, timing still belongs with the roster.',
  'DOC-31 had missing-call line when opened. later one did not. not accusation, sequence.'
];
