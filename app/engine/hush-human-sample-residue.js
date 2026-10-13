export const HUSH_HUMAN_SAMPLE_RESIDUE_VERSION = 'pr151-human-sample-residue/v1';

export const PROCEDURAL_SAMPLE_IDS = Object.freeze([
  'formal-record',
  'legal-intake',
  'hr-portal',
  'academic-caveat',
  'clipboard',
  'burner-minimal'
]);

export const HUMAN_SAMPLE_RESIDUE = Object.freeze({
  'plain-witness': 'Saw it Monday. Saved the file after, not fancy. Date still there — name too. I left that part alone.',
  'busy-admin': 'Received. File attached. Label stays for now; remaining items after the meeting, assuming this form behaves.',
  'group-chat-soft': 'ok yall, putting this here before the thread eats it. date still on it, name still the same, pls dont make me find it twice.',
  'forum-regular': 'This is probably the boring detail that matters later, imo. Date lines up. I would keep both pieces together before page three eats it.',
  'mutual-aid-coordinator': 'I can keep the next steps in one place. Easier that way, so nobody has to repeat the whole thing again on three different calls.',
  'quirky-orbit': 'Tiny paperwork comet, unfortunately still relevant. I kept the label on it so it would not float off into nonsense.',
  'grandma-receipts': 'I kept it because somebody was absolutely going to ask later. Date was right there too, so I left the paper alone.',
  'night-shift-note': 'Leaving this here before I log off. File attached. Date still visible. didnt change the name, too tired to make this prettier.',
  'library-ghost': 'The document remains where it was placed. Its label is still legible, though the folder feels like it is remembering more than we are.',
  'soft-snark': 'Interesting how the boring file name became important. Anyway, date stayed where it was, which apparently mattered after all.',
  'phase22-jagged-record': 'not polished bc this is a rushed note. maybe normal / maybe not. still writing it down before the sequence gets mushy.',
  'phase27-register-preserve': 'keep the note how it moves. maybe template, cool, but dont clean the mismatch into nothing just to make it behave.',
  'phase28-transform-to-chatspeak': 'idk maybe normal but same minute + one footer / one no footer is the thing. dont erase it fr.'
});

const PROCEDURAL_SET = new Set(PROCEDURAL_SAMPLE_IDS);

export function hasHumanSampleResidue(id = '') {
  return Object.prototype.hasOwnProperty.call(HUMAN_SAMPLE_RESIDUE, String(id || '').trim());
}

export function isProceduralSampleId(id = '') {
  return PROCEDURAL_SET.has(String(id || '').trim());
}

export function withHumanSampleResidue(id = '', profile = null) {
  const key = String(id || '').trim();
  if (!profile || isProceduralSampleId(key) || !hasHumanSampleResidue(key)) return profile;
  const avoid = Array.isArray(profile.avoid) ? profile.avoid : [];
  return {
    ...profile,
    sample: HUMAN_SAMPLE_RESIDUE[key],
    humanSampleResidueVersion: HUSH_HUMAN_SAMPLE_RESIDUE_VERSION,
    avoid: [...new Set([...avoid, 'sample-sentence mannequin posture', 'perfect demo one-liner geometry', 'symmetrical sample closure'])]
  };
}
