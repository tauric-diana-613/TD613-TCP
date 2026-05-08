// Held-out retrieval-lane cases. Brand-new families and source texts the
// engine has never been tuned on, written in the four register lanes the
// engine recognizes (formal-record, professional-message, rushed-mobile,
// tangled-followup).
//
// **Do not tune the engine to these fixtures.** If a case here fails, fix
// the engine in a way that generalizes — or move the case to the canonical
// set (app/data/diagnostics.js) and replace it with a new held-out one.
// The whole point of this module is that it stays adversarial to overfit;
// the moment it becomes another regression target, it stops being held-out.
//
// Pass criteria are scored in tests/heldout-eval.test.mjs.

const LAB_FREEZER_FORMAL = `At 02:18 on Tuesday, the -80°C freezer in B Wing logged a temperature excursion above the -70°C alarm threshold and held there for 47 minutes before the on-call technician arrived. The unit holds 312 patient-derived sample tubes from the long COVID cohort, including the only available aliquots from three withdrawn donors. Initial inspection found the door fully sealed and the gasket undamaged; the compressor cycled but did not return the chamber to setpoint. Backup CO2 injection was triggered at 02:34. The samples were transferred to the spare -80°C unit on the third floor by 03:42 with no detected thaw event longer than four minutes per box. Required correction: the seasonal compressor service window must be advanced to before September, and the alarm must page two on-call technicians, not one.`;

const LAB_FREEZER_RUSHED = `freezer alarm B wing started at like 218am went over -70 and stayed there till maria got there at 305. door was fine gasket fine compressor running but not pulling temp down. switched on co2 backup around 234 i think. moved everything to the spare freezer 3rd floor took till like 342, no box was out more than 4min. its the long covid samples too the ones we cant get back from the 3 withdrawn donors. compressor service was supposed to be sept anyway we def need to do it now. also alarm should page 2 ppl not 1, maria almost didnt see hers`;

const RIDESHARE_PROFESSIONAL = `Quick note before the standup: I left my work phone in the rideshare last night around 11:40 — the driver dropped me at the side entrance and I'm pretty sure it slid into the seat pocket when I shifted bags. I've already pinged the app's lost-item flow and the driver responded that he's seen it but is finishing his shift across town. He'll bring it to the dispatch lot by noon. The phone has my MFA tokens for the ops dashboard and my draft of the Q3 board memo, both of which I need before the 2pm review. If anyone has a backup MFA seed I can borrow temporarily, please let me know — otherwise I'll just push the review by an hour.`;

const RIDESHARE_RUSHED = `hey - left my work phone in the lyft last night, like 1140 when he dropped me at side door. think it slid out when i moved my bags. used the app lost thing already, driver msgd back, says he has it but needs to finish his shift across town wont be at dispatch lot till noon. mfa tokens for the ops dash are on it AND my draft of q3 board memo, need both before 2pm review. anyone got a spare mfa seed i can borrow? otherwise im pushing review back an hr`;

const CODE_REVIEW_FORMAL = `This change introduces a backwards-incompatible mutation to the public Authenticator interface and bundles it with the unrelated logging refactor. Before approving, I would like to see the interface change extracted into its own pull request with a deprecation period for the old method signature. The logging changes are fine in isolation, but coupling them obscures the semantic break for anyone reviewing the diff later. There is also no migration note for the three downstream services that import Authenticator directly. Specifically, the billing-gateway and audit-log workers both rely on the previous signature, and we should not roll this through without a coordinated upgrade plan with their owners. I am willing to fast-track an isolated logging pull request today if it is split out.`;

const CODE_REVIEW_PROFESSIONAL = `Hey, looked at the PR and I'm going to ask you to split it. The Authenticator interface change is breaking and it's bundled in with the logging refactor, which makes the diff hide the actual semantic break. Two issues here: I want the interface change in its own PR with a deprecation window for the old signature, and there's no migration note for the downstream services that import Authenticator directly. Billing-gateway and audit-log workers both rely on the old signature, so we would need to coordinate with their owners before this lands. Logging changes are fine on their own — if you split that out today I will fast-track the review.`;

const PHARMACY_TANGLED = `Coming back to this because the first thread mixed two events and made it sound worse than it was. The two patients with similar last names did not actually receive each other's medications. What happened was that their bagged prescriptions were placed on the same pickup shelf in the wrong slots after the consultation room reset, and the tech who pulled them at counter 3 caught the slot mismatch before either patient signed for them. So the controlled-substance log shows no transfer, no countersignature on the wrong bag, and no patient took medication that wasn't prescribed to them. The reason this took so long to clarify is that the initial incident report referred to "patient mix-up" without specifying that the catch happened at the counter and not after dispensing. The bagging procedure clearly needs the post-consultation reset checklist, but we should not be writing this up as a near-miss dispense.`;

const PHARMACY_RUSHED = `hey real quick about the lopez/lopez thing. nobody got the wrong meds!! tech at counter 3 caught it BEFORE either pt signed. the bags got put on the wrong slots after the consult room reset is all. controlled substance log clean, no countersign on wrong bag, no pt left with anything not theirs. incident report said 'patient mix-up' without saying we caught it at counter so its been getting passed around like its worse. yes bagging needs the post-consult reset checklist, agreed. but pls dont call this a near-miss dispense in the writeup that's not what it was`;

function pair(familyId, sourceVariant, donorVariant, sourceText, donorText) {
  return Object.freeze({
    id: `${familyId}-${sourceVariant}-under-${donorVariant}`,
    familyId,
    category: 'held-out',
    sourceVariant,
    donorVariant,
    sourceText,
    donorText,
    strength: 0.88
  });
}

export const HELDOUT_CASES = Object.freeze([
  pair('lab-freezer-alarm', 'formal-record', 'rushed-mobile', LAB_FREEZER_FORMAL, LAB_FREEZER_RUSHED),
  pair('lab-freezer-alarm', 'rushed-mobile', 'formal-record', LAB_FREEZER_RUSHED, LAB_FREEZER_FORMAL),
  pair('rideshare-lost-item', 'professional-message', 'rushed-mobile', RIDESHARE_PROFESSIONAL, RIDESHARE_RUSHED),
  pair('rideshare-lost-item', 'rushed-mobile', 'professional-message', RIDESHARE_RUSHED, RIDESHARE_PROFESSIONAL),
  pair('code-review-pushback', 'formal-record', 'professional-message', CODE_REVIEW_FORMAL, CODE_REVIEW_PROFESSIONAL),
  pair('code-review-pushback', 'professional-message', 'formal-record', CODE_REVIEW_PROFESSIONAL, CODE_REVIEW_FORMAL),
  pair('pharmacy-mixup', 'tangled-followup', 'rushed-mobile', PHARMACY_TANGLED, PHARMACY_RUSHED),
  pair('pharmacy-mixup', 'rushed-mobile', 'tangled-followup', PHARMACY_RUSHED, PHARMACY_TANGLED)
]);

export function buildHeldoutShell(extractCadenceProfile, testCase) {
  return {
    mode: 'borrowed',
    profile: extractCadenceProfile(testCase.donorText),
    registerLane: testCase.donorVariant || null,
    sourceText: testCase.donorText || '',
    strength: testCase.strength
  };
}
