const DIAGNOSTIC_STRESS_TAGS = Object.freeze([
  'literal-anchors',
  'same-facts',
  'adjacent-lexicon',
  'sentence-span',
  'contraction',
  'punctuation',
  'fragmentation',
  'tangle',
  'directness',
  'abstraction',
  'hedging',
  'recurrence',
  'list-structure',
  'register-shift'
]);

const VARIANT_BASE = Object.freeze({
  'formal-record': Object.freeze({
    register: 'formal-record',
    cleanliness: 'clean',
    anchorMode: 'protected-literal',
    stressTags: Object.freeze(['literal-anchors', 'same-facts', 'sentence-span', 'directness', 'list-structure'])
  }),
  'professional-message': Object.freeze({
    register: 'professional-message',
    cleanliness: 'mostly-clean',
    anchorMode: 'mixed-literal',
    stressTags: Object.freeze(['same-facts', 'register-shift', 'directness', 'contraction', 'list-structure'])
  }),
  'rushed-mobile': Object.freeze({
    register: 'rushed-mobile',
    cleanliness: 'noisy',
    anchorMode: 'compressed-literal',
    stressTags: Object.freeze(['same-facts', 'punctuation', 'fragmentation', 'contraction', 'recurrence', 'literal-anchors'])
  }),
  'tangled-followup': Object.freeze({
    register: 'tangled-followup',
    cleanliness: 'messy',
    anchorMode: 'repair-literal',
    stressTags: Object.freeze(['same-facts', 'tangle', 'hedging', 'recurrence', 'register-shift', 'sentence-span'])
  })
});

function sortUnique(values = []) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function freezeRecord(record) {
  return Object.freeze(record);
}

function sampleId(familyId, variant) {
  return `${familyId}-${variant}`;
}

function buildSample(family, variant, payload) {
  const base = VARIANT_BASE[variant];
  if (!base) {
    throw new Error(`Unknown variant: ${variant}`);
  }
  return freezeRecord({
    id: sampleId(family.id, variant),
    familyId: family.id,
    variant,
    name: payload.name,
    context: payload.context,
    intention: payload.intention,
    register: payload.register || base.register,
    cleanliness: payload.cleanliness || base.cleanliness,
    anchorMode: payload.anchorMode || base.anchorMode,
    stressTags: freezeRecord(sortUnique([...(base.stressTags || []), ...(payload.stressTags || [])])),
    deckVisible: false,
    text: payload.text.trim()
  });
}

const FAMILY_SPECS = Object.freeze([
  freezeRecord({
    id: 'building-access',
    title: 'Building access / badge failure / delivery halt',
    samples: Object.freeze([
      buildSample(
        { id: 'building-access' },
        'formal-record',
        {
          name: 'West Annex Badge Failure / Formal Record',
          context: 'Facilities incident record documenting a badge controller failure that blocked a courier with refrigerated medication.',
          intention: 'Preserve literal sequence, times, and access state without losing the operational correction.',
          stressTags: ['adjacent-lexicon'],
          text: `At 08:14 on Monday, Door 3 at the West Annex began presenting a false-open state. The reader accepted active badges and flashed green, but the strike did not release. The first confirmed access failure affected courier intake at 08:19, when a refrigerated medication delivery for Suite 118 could not clear the corridor. Facilities first treated the event as a low-voltage latch issue; the meter reading did not support that assumption. By 08:31 we confirmed that the overnight badge-renewal push had stopped validating newly renewed credentials while older local cache entries still passed. Deliveries were rerouted to the south receiving desk at 08:37. Manual escort restored controlled entry at 08:42, and the controller was rolled back at 09:06. No restricted room was breached, no cold-chain item was lost, and the custody log remains continuous. Required correction: no future firmware push may close without a live-door test, a latch release check, and a signed handoff from systems to archive operations.`
        }
      ),
      buildSample(
        { id: 'building-access' },
        'professional-message',
        {
          name: 'West Annex Badge Failure / Professional Message',
          context: 'Slack-style facilities escalation sent while the badge fault was still active.',
          intention: 'Flag the access problem quickly while preserving exact door, time window, and downstream risk.',
          stressTags: ['adjacent-lexicon'],
          text: `Facilities team, quick flag from West Annex: Door 3 is reading badges but not actually unlatching. First bad read we can pin down is 08:19, and it is now holding up the courier run for Suite 118 because the cold bag cannot sit outside any longer. It does not look like a dead reader. The panel is green, the click sounds normal, and the door still holds. Early guess is that the overnight renewal push touched the validator, because staff whose badges renewed this morning are failing while one older temporary badge still clears. We have rerouted intake to south receiving for now, but please do not close this as a power issue unless someone physically checks the latch and the controller cache. If you need a witness on site, I am by the loading corridor.`
        }
      ),
      buildSample(
        { id: 'building-access' },
        'rushed-mobile',
        {
          name: 'West Annex Badge Failure / Rushed Mobile',
          context: 'Text message from a staff member stuck at the annex door with a courier waiting.',
          intention: 'Capture same facts under compression, dropped punctuation, and mobile urgency.',
          stressTags: ['adjacent-lexicon'],
          text: `west annex d3 still fake open. reader goes green + buzzes but door wont release. first hit was like 8:19 maybe 8:20. courier for suite 118 is here w fridge meds and he cant just wait in sun. weird part: my renewed badge fails, old temp badge worked once. not power i dont think. can someone pls check controller before they keep telling me to jiggle latch again`
        }
      ),
      buildSample(
        { id: 'building-access' },
        'tangled-followup',
        {
          name: 'West Annex Badge Failure / Tangled Follow-up',
          context: 'Later follow-up email correcting assumptions made in the first incident thread.',
          intention: 'Clarify half-right early reports and preserve which credentials failed, which door behavior held, and what corrected the issue.',
          stressTags: ['adjacent-lexicon'],
          text: `Looping back because the first thread turned two separate things into one. The door was not dead, and it was not exactly "unlocking then relocking" either, although I can see why it looked that way in the moment. What was happening was more annoying: Door 3 flashed green, gave the normal sound, and still kept the strike engaged whenever the badge in question had been renewed after the overnight push. Older cached credentials could sometimes clear, which is why one temp badge made it through and confused the diagnosis. That distinction matters because people kept testing the latch instead of the validator. Also, the courier delay was not abstract. The medication bag for Suite 118 was already at the corridor at 08:19 and only got rerouted at 08:37. If we write this up as "door glitch, resolved," we will miss the actual correction point.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'package-handoff',
    title: 'Package handoff / missed signature / hallway pickup',
    samples: Object.freeze([
      buildSample(
        { id: 'package-handoff' },
        'formal-record',
        {
          name: 'Second-Floor Rush Parcel / Formal Record',
          context: 'Apartment building incident note documenting a missed signature and hallway pickup.',
          intention: 'Preserve witness sequence, unit number, parcel status, and handling chain.',
          stressTags: ['adjacent-lexicon'],
          text: `On Tuesday, March 18, the rush parcel addressed to Unit 2B was not presented for signature at the apartment door. The carrier scan marked "attempted / no answer" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that minute. The package was instead left on the second-floor landing near the stair rail. Ms. Chen located it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come through. I moved the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and requested help because she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support.`
        }
      ),
      buildSample(
        { id: 'package-handoff' },
        'professional-message',
        {
          name: 'Second-Floor Rush Parcel / Professional Message',
          context: 'Email to building management asking for correction of an inaccurate delivery record.',
          intention: 'Correct the delivery record while retaining concrete hallway and unit details.',
          stressTags: ['adjacent-lexicon'],
          text: `Hi building office, can someone please correct yesterday's delivery note for Unit 2B? The carrier record says "attempted / no answer" at 6:41 PM, but there was no buzzer call to 2B and the parcel was found on the second-floor landing instead of at the apartment door. Ms. Chen only found it after seeing the door tag and asking whether anything had been dropped off upstairs. I helped bring it from the landing to the hallway table outside 2B because she already had grocery bags and did not want to make a second trip on her knee. The parcel was still sealed and still had the red rush label on it. I am not asking for anything dramatic here, just for the record to stop saying a signature attempt happened when it did not.`
        }
      ),
      buildSample(
        { id: 'package-handoff' },
        'rushed-mobile',
        {
          name: 'Second-Floor Rush Parcel / Rushed Mobile',
          context: 'Text sent to a neighbor while trying to find the missing rush parcel.',
          intention: 'Keep the same facts legible through clipped mobile shorthand.',
          stressTags: ['adjacent-lexicon', 'fragmentation'],
          text: `2b pkg wasnt brought down. tag says attempted 6:41 but no one buzzed her. it was just sitting on 2nd fl landing by rail. red rush sticker still on it. i moved it to hall table after she said yes its hers / she had bags already. if mgmt asks: box stayed sealed.`
        }
      ),
      buildSample(
        { id: 'package-handoff' },
        'tangled-followup',
        {
          name: 'Second-Floor Rush Parcel / Tangled Follow-up',
          context: 'Follow-up note disentangling who saw the parcel first and where it was left.',
          intention: 'Repair sequence confusion without dropping the signature and hallway facts.',
          stressTags: ['adjacent-lexicon', 'hedging'],
          text: `Following up because I think yesterday's thread accidentally made it sound as if the parcel moved through three hands before anyone could say whose it was. That is not quite right. The carrier marked "attempted / no answer" at 6:41 PM, but there was no call to 2B that anyone can point to. Ms. Chen saw the tag, asked around, and then the parcel was spotted on the second-floor landing near the stair rail. I lifted it from there only after she said it was the expected rush shipment and after she said she did not want to carry one more thing while balancing groceries. So yes, the hallway table outside 2B is where it ended up, but the actual miss happened earlier, on the landing, when the delivery record pretended the signature step had been tried.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'volunteer-cleanup',
    title: 'Volunteer cleanup / tool staging / safety brief',
    samples: Object.freeze([
      buildSample(
        { id: 'volunteer-cleanup' },
        'formal-record',
        {
          name: 'Lot Cleanup Safety Brief / Formal Record',
          context: 'Written event brief for a neighborhood cleanup with tool staging and hazard controls.',
          intention: 'Keep assignment lanes and safety constraints explicit for later reuse.',
          text: `Saturday lot cleanup opens at 07:30. Check-in is at the west fence table, and no one starts independent work before lane assignment. The first pass covers glass pickup, broken pallet removal, pantry post reset, and salvage sorting. Tool staging is fixed: shovels at the fence, brooms at the blue tarp, lumber saws under canopy B, paint at the folding table only if wind stays below the posted threshold. Gloves, water, and closed-toe shoes are not optional. Minors may assist with labeling and pantry sorting but do not enter the saw or thinner zone. Inventory stop is 10:15 sharp so the afternoon crew inherits a readable site rather than scattered half-decisions. If rain starts, suspend paint first, then cuts, then all electrical equipment. Success means the lot is safer, more legible, and easier for the next crew to continue without guessing.`
        }
      ),
      buildSample(
        { id: 'volunteer-cleanup' },
        'professional-message',
        {
          name: 'Lot Cleanup Safety Brief / Professional Message',
          context: 'Volunteer coordinator message sent the evening before the cleanup.',
          intention: 'Translate the same work plan into a direct team-facing coordination message.',
          text: `Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation. Please check in at the west fence table when you arrive, even if you already know the site. We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting. Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds. Gloves, water, and closed-toe shoes are required. If you forgot any of those, tell me before you start rather than trying to work around it. Kids can help at labeling and pantry sort, but they stay clear of saws and thinner. We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing.`
        }
      ),
      buildSample(
        { id: 'volunteer-cleanup' },
        'rushed-mobile',
        {
          name: 'Lot Cleanup Safety Brief / Rushed Mobile',
          context: 'Morning-of text blast to volunteers when weather looked unstable.',
          intention: 'Preserve the task lanes while stressing fragmented mobile urgency.',
          text: `if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying`
        }
      ),
      buildSample(
        { id: 'volunteer-cleanup' },
        'tangled-followup',
        {
          name: 'Lot Cleanup Safety Brief / Tangled Follow-up',
          context: 'Clarifying follow-up after volunteers misunderstood the first staging note.',
          intention: 'Correct misread staging details without losing the original assignment logic.',
          text: `Quick follow-up because I think my earlier note sounded more relaxed than the work actually is. When I said "check in at the table," I did not mean "say hi and then drift toward whatever looks unfinished." I meant actual lane assignment, because last month we ended up with three people scraping paint while the broken glass sat untouched by the gate. Also, "kids can help" did not mean kids circulating through every station. It meant labeling and pantry sorting only. I know that sounds over-specific, but the site gets messy fast once half-heard instructions start mutating. So: west fence table first, glass and pallets first pass, saws under canopy B, paint only if the wind holds, and inventory stop at 10:15 even if the lot finally starts looking photogenic right before then.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'tenant-leak',
    title: 'Tenant leak / landlord follow-up / repair delay',
    samples: Object.freeze([
      buildSample(
        { id: 'tenant-leak' },
        'formal-record',
        {
          name: 'Unit 4C Cabinet Leak / Formal Record',
          context: 'Tenant incident note documenting an unresolved kitchen leak and delayed repair.',
          intention: 'Fix dates, unit numbers, and repair promises into one usable record.',
          text: `Unit 4C reported active water intrusion under the kitchen sink at 7:12 AM on April 4. Water was visible at the rear supply line, collecting under the cabinet lip, and beginning to wick into the hallway threshold by the time building staff arrived. Initial mitigation was absorbent towels plus a temporary shutoff at the under-sink valve. The valve reduced but did not eliminate the drip. Maintenance advised that a licensed plumber would attend the same afternoon; that visit did not occur. At 6:18 PM the tenant reported renewed pooling and a sour odor from the cabinet backing. As of this note, the cabinet base remains damp, the wall trim by the threshold shows swelling, and the resident has moved boxed pantry goods into the living room to keep them dry. The immediate issue is not only pipe failure, but repeated repair assurances that did not convert into an actual visit or a revised timeline.`
        }
      ),
      buildSample(
        { id: 'tenant-leak' },
        'professional-message',
        {
          name: 'Unit 4C Cabinet Leak / Professional Message',
          context: 'Tenant email to management asking for a repair timeline after missed promises.',
          intention: 'Push for action while preserving literal leak history and missed-visit sequence.',
          text: `Hello management, I need an updated repair timeline for the leak in Unit 4C because the same-day promise from Friday did not turn into an actual visit. The leak was reported at 7:12 AM. Staff saw water under the kitchen sink, reduced the flow at the valve, and told me a licensed plumber would come that afternoon. No one came. By 6:18 PM there was pooling again, plus a sour smell from the cabinet backing, so I moved pantry boxes into the living room to keep them dry. The under-sink valve slows the drip but does not stop it. The threshold trim is swelling now, which means this is no longer only a plumbing inconvenience. Please confirm who is coming, when, and whether the cabinet base needs separate remediation after the pipe repair.`
        }
      ),
      buildSample(
        { id: 'tenant-leak' },
        'rushed-mobile',
        {
          name: 'Unit 4C Cabinet Leak / Rushed Mobile',
          context: 'Text sent to landlord after the promised plumber failed to show.',
          intention: 'Keep leak details and missed appointment visible under shorthand and frustration.',
          text: `4c sink leak still going. valve cut it down but didnt stop it. someone said plumber friday pm and no one came. cabinet floor wet again by 6:18, trim by hall is swelling now + it smells weird under there. pls dont mark this fixed bc its not`
        }
      ),
      buildSample(
        { id: 'tenant-leak' },
        'tangled-followup',
        {
          name: 'Unit 4C Cabinet Leak / Tangled Follow-up',
          context: 'Follow-up message correcting management\'s assumption that the tenant had refused entry.',
          intention: 'Untangle the repair delay while preserving valve, odor, and cabinet facts.',
          text: `Following up because the note that came back to me says "entry may not have been available," and that is not what happened. I was home. The issue is that a plumber was mentioned, then the afternoon passed, then the office closed, and now we are in the irritating position where the leak is half-contained enough for everyone else to sound calm and still active enough that I am moving pantry boxes into the living room. The under-sink valve did reduce the flow, yes, but it never stopped the drip. By 6:18 PM there was water under the cabinet again and the trim by the hallway threshold had started to swell. Also there is now a sour smell from the cabinet backing, which was not present at 7:12 AM when I first reported it. I need the record to reflect delay, not resident refusal.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'clinic-scheduling',
    title: 'Clinic scheduling / insurance authorization / callback confusion',
    samples: Object.freeze([
      buildSample(
        { id: 'clinic-scheduling' },
        'formal-record',
        {
          name: 'MRI Authorization Callback / Formal Record',
          context: 'Scheduling note for a diagnostic scan delayed by an authorization mismatch.',
          intention: 'Hold the authorization code, callback timeline, and ordering-clinic correction in one place.',
          text: `Radiology scheduling for the left-knee MRI remains pending because the authorization record does not match the ordering location on file. Patient called first at 9:07 AM on May 6 after receiving a portal notice that the referral was approved. Scheduling could not book because the insurer record referenced the downtown clinic while the order in our queue still listed North River. Authorization number PR-44719 was verbally confirmed by the patient and later confirmed by payer line, but the site mismatch kept the case in callback status. A correction request was sent to the ordering office at 10:26 AM. As of the final callback at 3:44 PM, the order had not been reissued and no scan slot could be held beyond the following afternoon. The operational failure here is not absent authorization, but fragmented correction ownership between payer, ordering clinic, and scheduling desk.`
        }
      ),
      buildSample(
        { id: 'clinic-scheduling' },
        'professional-message',
        {
          name: 'MRI Authorization Callback / Professional Message',
          context: 'Scheduling email summarizing why the patient still could not be booked.',
          intention: 'Translate the authorization mismatch into a clear clinic-facing message.',
          text: `Hi team, I am documenting why the MRI for the left knee is still not scheduled even though the patient was told the authorization had cleared. The payer line confirmed auth number PR-44719, but their record is tied to the downtown clinic while the order in our queue still points to North River. Because the site on the authorization and the site on the order do not match, scheduling can see the approval and still cannot legally book the scan. We sent the correction request at 10:26 AM and were still waiting on a reissued order at the 3:44 PM callback. If the ordering office can resend under the correct location today, we may still keep the next-day slot. Otherwise the case rolls again.`
        }
      ),
      buildSample(
        { id: 'clinic-scheduling' },
        'rushed-mobile',
        {
          name: 'MRI Authorization Callback / Rushed Mobile',
          context: 'Patient text trying to explain the scheduling block after multiple phone calls.',
          intention: 'Preserve the auth number and site mismatch through messy repeated shorthand.',
          text: `called again. they keep saying auth exists but cant book bc auth is under downtown + order still says north river. auth # is PR-44719. portal says approved, scheduler says not schedulable, ordering office says wait for callback. ive had 3 callbacks already`
        }
      ),
      buildSample(
        { id: 'clinic-scheduling' },
        'tangled-followup',
        {
          name: 'MRI Authorization Callback / Tangled Follow-up',
          context: 'Follow-up note after several departments contradicted each other on the same case.',
          intention: 'Track the loop between portal approval, payer confirmation, and unschedulable order state.',
          text: `Trying one more time because each person I speak with describes the same blockage as if it lives somewhere else. The portal notice made it sound finished. The payer line confirmed PR-44719, so that sounded finished too. Scheduling then said the approval could not be used because it points to the downtown clinic while the actual order still says North River, which means the approval is real and unusable at the same time. I was told a corrected order request went out at 10:26 AM, then told to wait for a callback, then told the next-day slot could not be held indefinitely. I am not confused about whether an authorization exists. I am confused about why an approved case can sit in limbo all day because no one owns the location mismatch long enough to close it.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'committee-budget',
    title: 'Committee budget / staffing freeze / meeting recap',
    samples: Object.freeze([
      buildSample(
        { id: 'committee-budget' },
        'formal-record',
        {
          name: 'Bridge Budget Freeze / Formal Record',
          context: 'Committee recap on a staffing freeze and short bridge budget.',
          intention: 'Preserve the allocative facts while maintaining committee caution and sequence.',
          stressTags: ['abstraction', 'hedging'],
          text: `The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze through Q3. The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased. Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage. Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval. No option was adopted in session. What did resolve was the frame: this is not a generic belt-tightening exercise. It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty. Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.`
        }
      ),
      buildSample(
        { id: 'committee-budget' },
        'professional-message',
        {
          name: 'Bridge Budget Freeze / Professional Message',
          context: 'Meeting recap email sent to committee members after a staffing freeze discussion.',
          intention: 'Carry the budget facts forward while softening the formality slightly.',
          stressTags: ['abstraction', 'hedging'],
          text: `Thanks again for the finance committee meeting today. To recap the practical issue: the hiring freeze now extends through Q3, which leaves the student-support coordinator line unfilled for another twelve weeks unless we find bridge coverage. The room seemed aligned that we can defer furniture and print costs if needed, but we cannot pretend the intake queue will absorb a quarter without staffing impact. The three live options are still the same: repurpose the vacant analyst line temporarily, reduce evening hours, or ask finance whether restricted reserves can cover a bridge period with dean approval. We did not choose among them yet. What we did agree on is that the next note should describe this as a staffing exposure problem, not as a neutral "efficiency adjustment." I will send the revised table by Thursday once finance answers the reserve-rule question.`
        }
      ),
      buildSample(
        { id: 'committee-budget' },
        'rushed-mobile',
        {
          name: 'Bridge Budget Freeze / Rushed Mobile',
          context: 'Text to the chair right after the meeting before the formal recap was written.',
          intention: 'Compress the budget problem into a hurried note without losing options and timeline.',
          stressTags: ['abstraction', 'fragmentation'],
          text: `freeze runs thru q3. means coord line stays empty 12 more wks unless we bridge it. room was basically: cut print/furniture if needed, dont fake that intake can run w no staffing hit. 3 options still analyst line / evening hrs / reserves w dean ok. revised table thurs after finance answers reserve rule`
        }
      ),
      buildSample(
        { id: 'committee-budget' },
        'tangled-followup',
        {
          name: 'Bridge Budget Freeze / Tangled Follow-up',
          context: 'Later committee follow-up correcting wording from the first recap.',
          intention: 'Untangle pause vs reduction language and preserve the staffing exposure frame.',
          stressTags: ['abstraction', 'hedging', 'tangle'],
          text: `I want to revise one phrase from my earlier recap before it starts hardening into the story. I wrote that the committee was considering a "service adjustment," which is technically true in the narrow memo sense and misleading in the lived one. What the table actually showed is that if the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either gets redistributed badly or evening hours shrink. Those are not abstract efficiencies. They are service consequences. Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off. But I do not want the language to get gentler than the problem just because we are waiting for the Thursday table.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'mutual-aid',
    title: 'Mutual aid / intake follow-up / resource routing',
    samples: Object.freeze([
      buildSample(
        { id: 'mutual-aid' },
        'formal-record',
        {
          name: 'Church Lot Intake Routing / Formal Record',
          context: 'Mutual-aid intake note documenting resource routing for a family parked at a church lot.',
          intention: 'Hold resource facts, duplicate-intake risk, and routing limits in one readable record.',
          text: `Household intake completed at the church lot at 5:32 PM. Family of four requested motel support, bus fare, diapers, and a same-night food referral after losing access to the prior couch arrangement. Two minors were present. Available resources at time of intake did not include motel placement. Immediate supports issued were two bus passes, one grocery referral for same-evening pickup, and a diaper packet from table stock. Intake worker also flagged possible duplication because the caller name and phone number partially matched a request logged the prior week through the east-side line, though the earlier note did not confirm household size. Follow-up task is not denial. It is route cleanup: confirm whether this is the same household under a changed lodging address so the team does not accidentally split the case across two volunteer lanes and undercount what has already been offered.`
        }
      ),
      buildSample(
        { id: 'mutual-aid' },
        'professional-message',
        {
          name: 'Church Lot Intake Routing / Professional Message',
          context: 'Volunteer handoff message asking the next shift to continue a mutual-aid case.',
          intention: 'Preserve resource routing and duplicate-intake caution in shift-friendly language.',
          text: `For next shift: family of four at the church lot was seen at 5:32 PM asking for motel help, bus fare, diapers, and a same-night food referral after losing the couch placement they had been using. We did not have motel capacity tonight. What they left with was two bus passes, one grocery referral for evening pickup, and a diaper packet from table stock. Please note that the caller name and phone number may partially match an intake from the east-side line last week, but I could not confirm whether it is the same household or just a similar record. I am not flagging this to block support. I am flagging it so we do not accidentally route the case twice and lose track of what has already been promised.`
        }
      ),
      buildSample(
        { id: 'mutual-aid' },
        'rushed-mobile',
        {
          name: 'Church Lot Intake Routing / Rushed Mobile',
          context: 'Volunteer text while trying to route a household quickly at dusk.',
          intention: 'Keep concrete resource facts visible through a hurried text lane.',
          text: `fam of 4 at church lot now. need motel + diapers + bus fare + food tonight. no motel stock left. gave 2 bus passes + diaper pack + grocery pickup referral. maybe same household as east side last wk? number kinda matches. not saying no just dont want case split twice`
        }
      ),
      buildSample(
        { id: 'mutual-aid' },
        'tangled-followup',
        {
          name: 'Church Lot Intake Routing / Tangled Follow-up',
          context: 'Follow-up after volunteers realized the same family might have been routed twice.',
          intention: 'Untangle duplicate-intake risk without collapsing support into suspicion.',
          text: `Following up because I do not want the duplicate-intake flag to mutate into a character judgment. The family at the church lot still needs what they said they need: bus fare, diapers, food tonight, and some answer about motel support even if that answer is "not available." The complication is routing, not credibility. Their number appears close to one logged through the east-side line last week, and the names may be the same household under a different couch address, but the older note is thin and does not even confirm household size. So the task for next shift is not to interrogate them into consistency. It is to confirm whether we are already holding part of this case elsewhere, because otherwise we end up with two volunteer lanes each thinking the other one handled the follow-up.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'overwork-debrief',
    title: 'Overwork / apology / internal debrief',
    samples: Object.freeze([
      buildSample(
        { id: 'overwork-debrief' },
        'formal-record',
        {
          name: 'Weekend Revision Spillover / Formal Record',
          context: 'Internal debrief documenting how a deadline slid into an overwork spiral.',
          intention: 'Hold sequence and capacity drift in a cooler self-audit register.',
          text: `The draft delay was not caused by a single late task. It was produced by repeated small extensions that looked temporary in isolation and cumulative in practice. Work began as a Friday afternoon revision to the partner memo. By 6:10 PM the scope had already expanded to include table cleanup, citation repair, and a second tone pass requested in chat rather than in the tracked document. Additional edits continued through Saturday because no one explicitly closed the loop between "useful refinement" and "capacity already exceeded." By the time the final version was sent Sunday night, the memo itself was serviceable and the process was not. The operational lesson is simple and not flattering: when each extra pass is justified as small, the total burden goes undocumented until exhaustion has already started presenting itself as courtesy. A future correction has to include an explicit stop condition, not just better intentions.`
        }
      ),
      buildSample(
        { id: 'overwork-debrief' },
        'professional-message',
        {
          name: 'Weekend Revision Spillover / Professional Message',
          context: 'Apology email explaining a late draft and the capacity problem underneath it.',
          intention: 'Acknowledge delay without disguising the real overwork pattern.',
          text: `I owe you a cleaner explanation for why the memo landed late. It was not one giant emergency so much as a stack of small revision asks that kept sounding manageable long after they stopped being that. What began as a Friday afternoon tone pass turned into table cleanup, citation repair, and another full review cycle across Saturday because each extra ask arrived as if it were the last one. I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately. The memo itself is now in good shape, but the route we took to get there was not. For the next round I would like us to define a stop point before weekend work starts presenting itself as thoughtfulness.`
        }
      ),
      buildSample(
        { id: 'overwork-debrief' },
        'rushed-mobile',
        {
          name: 'Weekend Revision Spillover / Rushed Mobile',
          context: 'Late-night text apology sent while still revising the draft.',
          intention: 'Stress the apologetic overwork posture through real mobile compression.',
          text: `sorry draft still not out. it kept turning into "one more fix" - first tone pass then table cleanup then citations then another read. i shouldve said stop earlier instead of acting like i could just hold it all thru wknd. sending tonight even if im annoyed w how i got there`
        }
      ),
      buildSample(
        { id: 'overwork-debrief' },
        'tangled-followup',
        {
          name: 'Weekend Revision Spillover / Tangled Follow-up',
          context: 'Reflective follow-up after the sender realized the apology was still understating the pattern.',
          intention: 'Surface recursive self-correction and delayed refusal.',
          text: `I am following up because my first apology still made the weekend sound accidental, and that is too gentle. The pattern was familiar long before the final send: one more pass because the table looked sloppy, one more pass because the citations were not defensible enough, one more pass because the tone in chat suddenly shifted and I did not want to be the person who said no after everyone else had already stayed online. None of that was a formal demand, which is exactly how I kept talking myself into it. By Sunday night the memo was fine and my capacity was not. I am trying to name the thing correctly this time: the problem was not dedication. It was the way I kept translating exhaustion into politeness until the schedule looked consensual.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'archive-grant',
    title: 'Archive / grant / research planning',
    samples: Object.freeze([
      buildSample(
        { id: 'archive-grant' },
        'formal-record',
        {
          name: 'Neighborhood Archive Grant Scope / Formal Record',
          context: 'Project-planning note for a small archive grant with cataloging and community review components.',
          intention: 'Preserve deliverables, schedule, and research method in a formal planning voice.',
          stressTags: ['abstraction', 'register-shift'],
          text: `The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First, the team will complete a shared cataloging protocol for neighborhood collections now described with inconsistent local vocabularies. Second, six community stewards will be trained to review descriptive language before records are published or exhibited. Third, a portable exhibition kit will be built for circulation through branch libraries, school sites, and tenant meetings. The scheduling risk is not the catalog build itself, but the interval between description and community review. If that interval stretches, the project drifts back toward extractive efficiency rather than reciprocal stewardship. Planning assumptions therefore include a two-week review buffer in each cycle, a modest translation budget, and a rule that no descriptive template is treated as final before local review has actually occurred.`
        }
      ),
      buildSample(
        { id: 'archive-grant' },
        'professional-message',
        {
          name: 'Neighborhood Archive Grant Scope / Professional Message',
          context: 'Partner email clarifying what the archive grant is actually promising.',
          intention: 'Make the archive plan concrete without losing its research framing.',
          stressTags: ['abstraction', 'register-shift'],
          text: `Just to keep the grant language concrete, we are not promising "community access" in the vague sense and hoping the rest fills itself in. The work has three actual pieces: a shared cataloging protocol for collections that currently use incompatible local vocabularies, training for six community stewards who will review descriptive language before publication, and a portable exhibition kit that can move through libraries, schools, and tenant meetings. The fragile part is the time between description and review. If we compress that gap too hard, we get efficiency at the cost of reciprocity, which is exactly what the proposal says it is trying to avoid. That is why the schedule includes a two-week review buffer and a small translation line instead of pretending local feedback appears for free.`
        }
      ),
      buildSample(
        { id: 'archive-grant' },
        'rushed-mobile',
        {
          name: 'Neighborhood Archive Grant Scope / Rushed Mobile',
          context: 'Quick note to a collaborator while revising grant language on a deadline.',
          intention: 'Keep archive-planning facts visible through compressed writing.',
          stressTags: ['abstraction', 'fragmentation'],
          text: `grant isnt just digitize + pray. its shared catalog protocol + 6 steward reviewers + portable exhibit kit. main risk is if description outruns local review and we start calling extraction access. pls keep the 2 wk review buffer + translation line in budget`
        }
      ),
      buildSample(
        { id: 'archive-grant' },
        'tangled-followup',
        {
          name: 'Neighborhood Archive Grant Scope / Tangled Follow-up',
          context: 'Follow-up trying to correct a partner\'s too-clean summary of the proposal.',
          intention: 'Repair oversimplification while preserving the archive project\'s real sequencing logic.',
          stressTags: ['abstraction', 'tangle', 'hedging'],
          text: `One more correction to the summary language because I think "cataloging plus exhibit" is too neat and accidentally repeats the exact habit we were trying to get away from. Yes, the project produces a catalog protocol and an exhibition kit. But the hinge is the review interval in between, because the descriptive language is not neutral just because it sounds standardized. If we move from description straight to publication, the project may still look efficient from outside and will have stopped doing the reciprocal part it claimed as method. That is why I keep insisting on the two-week review buffer, the translation line, and the steward training as deliverables rather than warm context. Without those, we have a cleaner workflow and a less honest grant.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'performance-review',
    title: 'Performance / review / evaluative commentary',
    samples: Object.freeze([
      buildSample(
        { id: 'performance-review' },
        'formal-record',
        {
          name: 'Annual Review / Formal Record',
          context: 'Manager evaluation balancing strong mentoring with repeated delays in reporting.',
          intention: 'Preserve evaluative nuance, examples, and consequence without flattening either strength or weakness.',
          stressTags: ['abstraction', 'register-shift'],
          text: `The annual review reflects a split pattern rather than a uniformly strong or weak cycle. The employee remains one of the more reliable trainers of new staff, especially during high-volume onboarding weeks when procedures change faster than written guidance. Peer feedback repeatedly names calm escalation, practical explanation, and willingness to stay with a task until another person can perform it independently. At the same time, reporting deadlines slid in three separate months, and the delay pattern was not random. In each case the immediate service work was completed, but documentation was deferred until the record became harder to reconstruct cleanly. That distinction matters. Strong front-line support does not cancel weak record timing. The recommendation is not punitive action. It is a corrective plan that treats documentation lag as a real performance issue while protecting the mentoring strengths that the unit depends on.`
        }
      ),
      buildSample(
        { id: 'performance-review' },
        'professional-message',
        {
          name: 'Annual Review / Professional Message',
          context: 'Draft manager email summarizing key review points before the formal write-up.',
          intention: 'Carry the same evaluative split in a more direct pre-review message.',
          stressTags: ['abstraction', 'register-shift'],
          text: `Ahead of the formal review, I want to name the pattern as clearly as I can. You are consistently strong in onboarding and peer support. New staff trust your explanations, and multiple people pointed to your calm escalation style when procedures changed quickly this year. The harder part is documentation timing. We had reporting slips in three different months, and in each case the direct service was done but the written record lagged until the details were harder to rebuild. I am not treating that as a paperwork footnote. It affects handoff quality and makes later review more difficult than it needs to be. My goal for the review is to protect the mentoring strengths while making the documentation correction concrete rather than vague.`
        }
      ),
      buildSample(
        { id: 'performance-review' },
        'rushed-mobile',
        {
          name: 'Annual Review / Rushed Mobile',
          context: 'Manager note-to-self typed on a phone right after the review meeting.',
          intention: 'Capture the same evaluation in clipped shorthand for later drafting.',
          stressTags: ['abstraction', 'fragmentation'],
          text: `review gist: great w onboarding / ppl trust them / calm under change. real issue is docs lag. 3 diff months same thing - service got done, writeup came late, handoff got muddy. dont write it like "minor admin gap." not punitive either. needs concrete correction plan`
        }
      ),
      buildSample(
        { id: 'performance-review' },
        'tangled-followup',
        {
          name: 'Annual Review / Tangled Follow-up',
          context: 'Follow-up note after the reviewer worried the summary sounded harsher or softer than intended.',
          intention: 'Hold the evaluative balance while correcting tone drift.',
          stressTags: ['abstraction', 'hedging', 'tangle'],
          text: `I keep revising the summary because I do not want it to sound either falsely flattering or disciplinary by reflex. The point is not "excellent except for paperwork," because the documentation lag affected handoffs more than that phrase admits. The point is also not "strong mentoring but..." in the condescending sense, because the mentoring work is not decorative either; the unit genuinely leans on it during onboarding. What I am trying to say, maybe too carefully, is that the cycle showed a real split: strong peer support, calm escalation, practical teaching, and then three months where the reporting lag made later reconstruction harder than it needed to be. I want the written review to keep both truths in view long enough that the correction plan feels proportionate instead of automatic.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'customer-support',
    title: 'Customer support / account recovery / fraud concern',
    samples: Object.freeze([
      buildSample(
        { id: 'customer-support' },
        'formal-record',
        {
          name: 'Account Recovery Fraud Hold / Formal Record',
          context: 'Support case note for a customer blocked by a fraud hold during account recovery.',
          intention: 'Keep the account, hold, and recovery facts precise without becoming decorative.',
          stressTags: ['adjacent-lexicon'],
          text: `Customer contacted support at 11:23 AM regarding account access loss after a password reset attempt triggered the fraud hold. The user could still receive one-time codes but could not complete login because the system flagged the device as new and placed the account in manual review. Case number CS-88412. The customer confirmed the last four digits on file and the recovery email ending in @elmfield.net, which matched account records. A prior support thread had already instructed the user to retry the reset flow, but that advice did not clear the hold because the underlying issue was not credential mismatch. It was the fraud lock itself. The account remains inaccessible until review removes the device challenge or support performs verified override. The procedural risk is repeated generic guidance that makes the customer loop through the same dead path while the fraud queue stays untouched.`
        }
      ),
      buildSample(
        { id: 'customer-support' },
        'professional-message',
        {
          name: 'Account Recovery Fraud Hold / Professional Message',
          context: 'Internal support handoff message explaining why the reset loop is not enough.',
          intention: 'Keep the customer-account facts intact while redirecting the case toward the correct queue.',
          stressTags: ['adjacent-lexicon'],
          text: `Escalating case CS-88412 because this is no longer a basic password-reset question. The customer can receive one-time codes and has already confirmed the last four digits on file plus the recovery email ending in @elmfield.net. The block happens after that, when the device challenge triggers the fraud hold and pushes the account into manual review. Telling them to restart the reset flow will not solve it because the credential path is not the failure point. The hold is. Please route to the fraud-review queue or apply verified override if policy allows. Right now the customer is stuck in a loop where every generic recovery step appears valid and still ends at the same hold screen.`
        }
      ),
      buildSample(
        { id: 'customer-support' },
        'rushed-mobile',
        {
          name: 'Account Recovery Fraud Hold / Rushed Mobile',
          context: 'Customer text paraphrase after multiple support chats failed to unlock the account.',
          intention: 'Preserve hold, case number, and recovery details under noisy mobile pressure.',
          stressTags: ['adjacent-lexicon', 'fragmentation'],
          text: `acct still locked. can get the code but login dies at fraud review every time. case CS-88412. support keeps saying reset again even tho reset isnt the problem. last 4 + recovery email match. need someone to clear hold not send same script`
        }
      ),
      buildSample(
        { id: 'customer-support' },
        'tangled-followup',
        {
          name: 'Account Recovery Fraud Hold / Tangled Follow-up',
          context: 'Support follow-up after realizing multiple agents had described the same fraud hold as different problems.',
          intention: 'Untangle reset, device challenge, and fraud-review ownership without dropping case specifics.',
          stressTags: ['adjacent-lexicon', 'tangle', 'hedging'],
          text: `Following up because the thread is starting to split one issue into three imaginary ones. This is not a wrong-password case and not really a missing-code case either, even though the customer has had to walk through both scripts. They receive the one-time code. They confirm the last four digits and the recovery address ending in @elmfield.net. Then the device challenge fires, the account falls into fraud review, and the user lands back at the same hold state. So when one note says "reset incomplete" and another says "awaiting customer verification," both are technically attached to the case and neither identifies the actual block. Case CS-88412 needs fraud-review ownership or verified override, otherwise the customer will keep re-performing compliance without any path to entry.`
        }
      )
    ])
  }),
  freezeRecord({
    id: 'school-coordination',
    title: 'School / family coordination / pickup or permission logistics',
    samples: Object.freeze([
      buildSample(
        { id: 'school-coordination' },
        'formal-record',
        {
          name: 'Pickup Change and Permission Slip / Formal Record',
          context: 'School office note documenting a same-day pickup change and missing field-trip permission paperwork.',
          intention: 'Preserve guardian, pickup, and permission facts in one usable office record.',
          text: `At 1:48 PM the school office received a call from the student's mother requesting a same-day pickup change. The usual pickup adult could not arrive, and the student was to be released to Aunt Maribel instead. Office staff requested the photo ID match on arrival and noted the change in the dismissal log. During the same call, the office also flagged that the field-trip permission slip for Friday's museum visit had not yet been returned, although the fee waiver form was already on file. The caller stated that the signed permission page was in the backpack but may not have been handed in. A reminder note was sent to the classroom at 2:03 PM. Aunt Maribel signed out the student at 3:17 PM with ID verified. As of close, the permission slip itself remained unlocated. The coordination issue is split custody of information: transportation resolved in real time, paperwork still unresolved despite multiple related forms already existing in the file.`
        }
      ),
      buildSample(
        { id: 'school-coordination' },
        'professional-message',
        {
          name: 'Pickup Change and Permission Slip / Professional Message',
          context: 'School-family coordination email summarizing a pickup change and missing permission slip.',
          intention: 'Carry dismissal and permission details forward in a calm parent-facing tone.',
          text: `Hello, confirming today's dismissal change: Aunt Maribel was approved for pickup and signed the student out at 3:17 PM after ID verification. We also wanted to note that the museum field-trip permission slip still was not located by close of day, even though the fee waiver form is already on file. During the 1:48 PM phone call, you mentioned the signed slip might still be in the backpack. We sent a reminder to the classroom at 2:03 PM, but the paper did not surface before dismissal. If the signed permission page comes home tonight, please return it tomorrow morning so Friday's trip record is complete.`
        }
      ),
      buildSample(
        { id: 'school-coordination' },
        'rushed-mobile',
        {
          name: 'Pickup Change and Permission Slip / Rushed Mobile',
          context: 'Guardian text to the school office while handling a last-minute pickup change.',
          intention: 'Preserve the same pickup and permission facts through everyday mobile shorthand.',
          text: `hi office - aunt maribel has to do pickup today not grandma. shell have id. also i swear i signed the museum slip, it might still be in backpack w the waiver papers. if class can check before 3 that would help. sorry for late change`
        }
      ),
      buildSample(
        { id: 'school-coordination' },
        'tangled-followup',
        {
          name: 'Pickup Change and Permission Slip / Tangled Follow-up',
          context: 'Follow-up trying to disentangle dismissal logistics from missing paperwork.',
          intention: 'Repair conflation between pickup approval and trip paperwork.',
          text: `Following up because I think the dismissal change and the field-trip paperwork got bundled together in a way that makes both sound less resolved than they are. Pickup was fine: Aunt Maribel was the substitute adult, she brought ID, and the student left at 3:17 PM. The unresolved part is the museum permission slip. I mentioned on the 1:48 PM call that I had already signed it and suspected it was still in the backpack with the fee waiver papers, but the classroom check at 2:03 PM did not turn it up. I do not want the record to imply that the pickup change caused the missing permission page, because those are two separate problems that just happened to share the same phone call.`
        }
      )
    ])
  })
]);

const CORPUS_SAMPLES = FAMILY_SPECS.flatMap((family) => family.samples);

const PROMOTED_SAMPLE_IDS = Object.freeze([
  sampleId('building-access', 'formal-record'),
  sampleId('building-access', 'rushed-mobile'),
  sampleId('package-handoff', 'formal-record'),
  sampleId('package-handoff', 'tangled-followup'),
  sampleId('volunteer-cleanup', 'professional-message'),
  sampleId('volunteer-cleanup', 'rushed-mobile'),
  sampleId('committee-budget', 'formal-record'),
  sampleId('committee-budget', 'tangled-followup'),
  sampleId('overwork-debrief', 'professional-message'),
  sampleId('overwork-debrief', 'tangled-followup'),
  sampleId('archive-grant', 'formal-record'),
  sampleId('archive-grant', 'tangled-followup'),
  sampleId('customer-support', 'formal-record'),
  sampleId('customer-support', 'rushed-mobile'),
  sampleId('school-coordination', 'professional-message'),
  sampleId('school-coordination', 'rushed-mobile')
]);

const DECK_RANDOMIZER_SAMPLE_IDS = Object.freeze([
  sampleId('building-access', 'formal-record'),
  sampleId('building-access', 'rushed-mobile'),
  sampleId('customer-support', 'formal-record'),
  sampleId('customer-support', 'rushed-mobile'),
  sampleId('volunteer-cleanup', 'professional-message'),
  sampleId('volunteer-cleanup', 'rushed-mobile'),
  sampleId('school-coordination', 'professional-message'),
  sampleId('school-coordination', 'rushed-mobile'),
  sampleId('package-handoff', 'formal-record'),
  sampleId('package-handoff', 'tangled-followup'),
  sampleId('committee-budget', 'formal-record'),
  sampleId('committee-budget', 'tangled-followup'),
  sampleId('overwork-debrief', 'professional-message'),
  sampleId('overwork-debrief', 'tangled-followup'),
  sampleId('archive-grant', 'formal-record'),
  sampleId('archive-grant', 'tangled-followup')
]);

const CORPUS_BY_ID = Object.freeze(CORPUS_SAMPLES.reduce((acc, sample) => {
  acc[sample.id] = freezeRecord({
    ...sample,
    deckVisible: PROMOTED_SAMPLE_IDS.includes(sample.id)
  });
  return acc;
}, {}));

const DIAGNOSTIC_SAMPLE_LIBRARY = Object.freeze(Object.values(CORPUS_BY_ID));

const PROMOTED_SAMPLE_LIBRARY = Object.freeze(
  PROMOTED_SAMPLE_IDS.map((id) => {
    const sample = CORPUS_BY_ID[id];
    return freezeRecord({
      id: sample.id,
      name: sample.name,
      intention: sample.intention,
      text: sample.text
    });
  })
);

const DECK_RANDOMIZER_SAMPLE_LIBRARY = Object.freeze(
  DECK_RANDOMIZER_SAMPLE_IDS.map((id) => {
    const sample = CORPUS_BY_ID[id];
    return freezeRecord({
      id: sample.id,
      familyId: sample.familyId,
      variant: sample.variant,
      name: sample.name,
      intention: sample.intention,
      text: sample.text
    });
  })
);

function orderedPair(id, sourceId, donorId, mode, stressTags, expectedPressure, notes) {
  return freezeRecord({
    id,
    sourceId,
    donorId,
    mode,
    stressTags: freezeRecord(sortUnique(stressTags)),
    expectedPressure,
    notes
  });
}

function maskCase(id, sourceId, lockIds, personaId, stressTags, expectedPressure, notes, sourceFamilyId) {
  return freezeRecord({
    id,
    sourceFamilyId,
    sourceId,
    lockIds: freezeRecord([...lockIds]),
    personaId,
    mode: 'mask',
    stressTags: freezeRecord(sortUnique(stressTags)),
    expectedPressure,
    notes
  });
}

function trainerCase(id, familyId, sourceId, extractionIds, stressTags, expectedPressure, notes) {
  return freezeRecord({
    id,
    familyId,
    sourceId,
    extractionIds: freezeRecord([...extractionIds]),
    mode: 'trainer',
    stressTags: freezeRecord(sortUnique(stressTags)),
    expectedPressure,
    notes
  });
}

function retrievalCase(id, familyId, sourceId, donorId, stressTags, expectedPressure, notes, strength = 0.88) {
  return freezeRecord({
    id,
    familyId,
    sourceId,
    donorId,
    mode: 'retrieval',
    strength,
    stressTags: freezeRecord(sortUnique(stressTags)),
    expectedPressure,
    notes
  });
}

const FALSE_NEIGHBOR_FAMILY_PAIRS = Object.freeze([
  freezeRecord(['building-access', 'customer-support']),
  freezeRecord(['building-access', 'package-handoff']),
  freezeRecord(['package-handoff', 'tenant-leak']),
  freezeRecord(['clinic-scheduling', 'customer-support']),
  freezeRecord(['committee-budget', 'archive-grant']),
  freezeRecord(['committee-budget', 'performance-review']),
  freezeRecord(['mutual-aid', 'customer-support']),
  freezeRecord(['school-coordination', 'clinic-scheduling']),
  freezeRecord(['volunteer-cleanup', 'mutual-aid']),
  freezeRecord(['overwork-debrief', 'performance-review']),
  freezeRecord(['tenant-leak', 'school-coordination']),
  freezeRecord(['archive-grant', 'school-coordination'])
]);

const SAME_FACT_SWAP_PAIRS = FAMILY_SPECS.flatMap((family) => {
  const cleanId = sampleId(family.id, 'formal-record');
  const messyId = sampleId(family.id, 'rushed-mobile');
  return [
    orderedPair(
      `${family.id}-formal-to-rushed`,
      cleanId,
      messyId,
      'swap-same-fact',
      ['same-facts', 'register-shift', 'sentence-span', 'literal-anchors'],
      'same-fact-high',
      `Formal incident prose from ${family.title} should survive transfer pressure into its noisy sibling without losing literal anchors.`
    ),
    orderedPair(
      `${family.id}-rushed-to-formal`,
      messyId,
      cleanId,
      'swap-same-fact',
      ['same-facts', 'register-shift', 'fragmentation', 'sentence-span', 'literal-anchors'],
      'same-fact-high',
      `Noisy sibling text from ${family.title} should expand toward a cleaner shell without inventing new facts.`
    )
  ];
});

const FALSE_NEIGHBOR_CASES = FALSE_NEIGHBOR_FAMILY_PAIRS.flatMap(([leftFamily, rightFamily]) => [
  orderedPair(
    `${leftFamily}-to-${rightFamily}-false-neighbor`,
    sampleId(leftFamily, 'professional-message'),
    sampleId(rightFamily, 'professional-message'),
    'false-neighbor',
    ['adjacent-lexicon', 'register-shift', 'same-facts'],
    'false-neighbor-high',
    `Lexically adjacent professional messages from ${leftFamily} and ${rightFamily} should not converge just because they share office language.`
  ),
  orderedPair(
    `${rightFamily}-to-${leftFamily}-false-neighbor`,
    sampleId(rightFamily, 'professional-message'),
    sampleId(leftFamily, 'professional-message'),
    'false-neighbor',
    ['adjacent-lexicon', 'register-shift', 'same-facts'],
    'false-neighbor-high',
    `Reverse false-neighbor pressure between ${rightFamily} and ${leftFamily}.`
  )
]);

const LITERAL_HIGH_RISK_PAIRS = FALSE_NEIGHBOR_FAMILY_PAIRS.flatMap(([leftFamily, rightFamily]) => [
  orderedPair(
    `${leftFamily}-to-${rightFamily}-literal-risk`,
    sampleId(leftFamily, 'formal-record'),
    sampleId(rightFamily, 'formal-record'),
    'swap-literal-risk',
    ['literal-anchors', 'adjacent-lexicon', 'sentence-span'],
    'literal-protected',
    `Protected anchors from ${leftFamily} should survive donor pressure from ${rightFamily} even when both live in incident-record syntax.`
  ),
  orderedPair(
    `${rightFamily}-to-${leftFamily}-literal-risk`,
    sampleId(rightFamily, 'formal-record'),
    sampleId(leftFamily, 'formal-record'),
    'swap-literal-risk',
    ['literal-anchors', 'adjacent-lexicon', 'sentence-span'],
    'literal-protected',
    `Reverse protected-anchor pressure between ${rightFamily} and ${leftFamily}.`
  )
]);

const MASK_PERSONA_SEQUENCE = Object.freeze([
  'archivist',
  'operator',
  'spark',
  'methods-editor',
  'matron',
  'cross-examiner',
  'undertow',
  'archivist',
  'methods-editor',
  'cross-examiner',
  'operator',
  'matron'
]);

const SAME_FAMILY_MASK_CASES = FAMILY_SPECS.map((family, index) => maskCase(
  `${family.id}-mask-same-family`,
  sampleId(family.id, 'rushed-mobile'),
  [sampleId(family.id, 'formal-record'), sampleId(family.id, 'professional-message')],
  MASK_PERSONA_SEQUENCE[index],
  ['same-facts', 'fragmentation', 'register-shift', 'literal-anchors'],
  'mask-high',
  `Mask comparison against the ${family.title} lock should reveal whether the engine can move messy sibling text without losing family anchors.`,
  family.id
));

const CROSS_FAMILY_MASK_CASES = FALSE_NEIGHBOR_FAMILY_PAIRS.map(([leftFamily, rightFamily], index) => maskCase(
  `${leftFamily}-under-${rightFamily}-mask-cross-family`,
  sampleId(leftFamily, 'tangled-followup'),
  [sampleId(rightFamily, 'formal-record'), sampleId(rightFamily, 'professional-message')],
  MASK_PERSONA_SEQUENCE[index % MASK_PERSONA_SEQUENCE.length],
  ['adjacent-lexicon', 'tangle', 'register-shift'],
  'mask-false-neighbor',
  `Cross-family mask case using ${leftFamily} text against a ${rightFamily} lock to expose false closeness or near-home holds.`,
  leftFamily
));

const SIBLING_TRAINER_CASES = FAMILY_SPECS.map((family) => trainerCase(
  `${family.id}-trainer-sibling`,
  family.id,
  sampleId(family.id, 'rushed-mobile'),
  [sampleId(family.id, 'formal-record'), sampleId(family.id, 'professional-message'), sampleId(family.id, 'tangled-followup')],
  ['same-facts', 'fragmentation', 'register-shift'],
  'trainer-sibling',
  `Trainer should extract a family fingerprint from three ${family.title} variants and validate a forged draft sourced from the noisy sibling.`
));

const FALSE_NEIGHBOR_TRAINER_CASES = FALSE_NEIGHBOR_FAMILY_PAIRS.map(([leftFamily, rightFamily]) => trainerCase(
  `${leftFamily}-trainer-under-${rightFamily}`,
  leftFamily,
  sampleId(rightFamily, 'rushed-mobile'),
  [sampleId(leftFamily, 'formal-record'), sampleId(leftFamily, 'professional-message'), sampleId(leftFamily, 'tangled-followup')],
  ['false-neighbor', 'adjacent-lexicon', 'register-shift'],
  'trainer-false-neighbor',
  `Trainer should resist overfitting ${rightFamily} noise to a ${leftFamily} fingerprint just because the administrative lexicon overlaps.`
));

const RETRIEVAL_CASE_BLUEPRINTS = Object.freeze([
  freezeRecord(['building-access', 'formal-record', 'rushed-mobile']),
  freezeRecord(['package-handoff', 'formal-record', 'tangled-followup']),
  freezeRecord(['volunteer-cleanup', 'professional-message', 'rushed-mobile']),
  freezeRecord(['clinic-scheduling', 'professional-message', 'tangled-followup']),
  freezeRecord(['committee-budget', 'formal-record', 'tangled-followup']),
  freezeRecord(['overwork-debrief', 'professional-message', 'tangled-followup']),
  freezeRecord(['customer-support', 'formal-record', 'rushed-mobile']),
  freezeRecord(['school-coordination', 'professional-message', 'rushed-mobile'])
]);

const RETRIEVAL_CASES = RETRIEVAL_CASE_BLUEPRINTS.flatMap(([familyId, leftVariant, rightVariant]) => [
  retrievalCase(
    `${familyId}-${leftVariant}-under-${rightVariant}`,
    familyId,
    sampleId(familyId, leftVariant),
    sampleId(familyId, rightVariant),
    ['same-facts', 'register-shift', 'literal-anchors'],
    'retrieval-same-fact',
    `Canonical same-fact retrieval transfer within ${familyId}: ${leftVariant} under ${rightVariant}.`
  ),
  retrievalCase(
    `${familyId}-${rightVariant}-under-${leftVariant}`,
    familyId,
    sampleId(familyId, rightVariant),
    sampleId(familyId, leftVariant),
    ['same-facts', 'register-shift', 'literal-anchors'],
    'retrieval-same-fact',
    `Canonical same-fact retrieval transfer within ${familyId}: ${rightVariant} under ${leftVariant}.`
  )
]);

export const DIAGNOSTIC_BATTERY = freezeRecord({
  swapPairs: freezeRecord([...SAME_FACT_SWAP_PAIRS, ...FALSE_NEIGHBOR_CASES, ...LITERAL_HIGH_RISK_PAIRS]),
  maskCases: freezeRecord([...SAME_FAMILY_MASK_CASES, ...CROSS_FAMILY_MASK_CASES]),
  trainerCases: freezeRecord([...SIBLING_TRAINER_CASES, ...FALSE_NEIGHBOR_TRAINER_CASES]),
  retrievalCases: freezeRecord(RETRIEVAL_CASES),
  falseNeighborCases: freezeRecord(FALSE_NEIGHBOR_CASES)
});

export const DIAGNOSTIC_CORPUS = freezeRecord({
  version: 'wild-corpus-v1',
  generatedAt: '2026-03-31',
  stressTags: DIAGNOSTIC_STRESS_TAGS,
  families: freezeRecord(FAMILY_SPECS.map((family) => freezeRecord({
    id: family.id,
    title: family.title
  }))),
  samples: DIAGNOSTIC_SAMPLE_LIBRARY,
  promotedSampleIds: PROMOTED_SAMPLE_IDS,
  promotedSampleLibrary: PROMOTED_SAMPLE_LIBRARY,
  deckRandomizerSampleIds: DECK_RANDOMIZER_SAMPLE_IDS,
  deckRandomizerSampleLibrary: DECK_RANDOMIZER_SAMPLE_LIBRARY
});

export {
  CORPUS_BY_ID as DIAGNOSTIC_CORPUS_BY_ID,
  DECK_RANDOMIZER_SAMPLE_IDS,
  DECK_RANDOMIZER_SAMPLE_LIBRARY,
  DIAGNOSTIC_SAMPLE_LIBRARY,
  DIAGNOSTIC_STRESS_TAGS,
  PROMOTED_SAMPLE_IDS,
  PROMOTED_SAMPLE_LIBRARY
};

export default {
  diagnostic_corpus: DIAGNOSTIC_CORPUS,
  diagnostic_battery: DIAGNOSTIC_BATTERY
};
