(function () {
  window.TCP_DATA = window.TCP_DATA || {};
  Object.assign(window.TCP_DATA, {
  "diagnostic_corpus": {
    "version": "wild-corpus-v1",
    "generatedAt": "2026-03-31",
    "stressTags": [
      "literal-anchors",
      "same-facts",
      "adjacent-lexicon",
      "sentence-span",
      "contraction",
      "punctuation",
      "fragmentation",
      "tangle",
      "directness",
      "abstraction",
      "hedging",
      "recurrence",
      "list-structure",
      "register-shift"
    ],
    "families": [
      {
        "id": "building-access",
        "title": "Building access / badge failure / delivery halt"
      },
      {
        "id": "package-handoff",
        "title": "Package handoff / missed signature / hallway pickup"
      },
      {
        "id": "volunteer-cleanup",
        "title": "Volunteer cleanup / tool staging / safety brief"
      },
      {
        "id": "tenant-leak",
        "title": "Tenant leak / landlord follow-up / repair delay"
      },
      {
        "id": "clinic-scheduling",
        "title": "Clinic scheduling / insurance authorization / callback confusion"
      },
      {
        "id": "committee-budget",
        "title": "Committee budget / staffing freeze / meeting recap"
      },
      {
        "id": "mutual-aid",
        "title": "Mutual aid / intake follow-up / resource routing"
      },
      {
        "id": "overwork-debrief",
        "title": "Overwork / apology / internal debrief"
      },
      {
        "id": "archive-grant",
        "title": "Archive / grant / research planning"
      },
      {
        "id": "performance-review",
        "title": "Performance / review / evaluative commentary"
      },
      {
        "id": "customer-support",
        "title": "Customer support / account recovery / fraud concern"
      },
      {
        "id": "school-coordination",
        "title": "School / family coordination / pickup or permission logistics"
      }
    ],
    "samples": [
      {
        "id": "building-access-formal-record",
        "familyId": "building-access",
        "variant": "formal-record",
        "name": "West Annex Badge Failure / Formal Record",
        "context": "Facilities incident record documenting a badge controller failure that blocked a courier with refrigerated medication.",
        "intention": "Preserve literal sequence, times, and access state without losing the operational correction.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "adjacent-lexicon",
          "directness",
          "list-structure",
          "literal-anchors",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": true,
        "text": "At 08:14 on Monday, Door 3 at the West Annex began presenting a false-open state. The reader accepted active badges and flashed green, but the strike did not release. The first confirmed access failure affected courier intake at 08:19, when a refrigerated medication delivery for Suite 118 could not clear the corridor. Facilities first treated the event as a low-voltage latch issue; the meter reading did not support that assumption. By 08:31 we confirmed that the overnight badge-renewal push had stopped validating newly renewed credentials while older local cache entries still passed. Deliveries were rerouted to the south receiving desk at 08:37. Manual escort restored controlled entry at 08:42, and the controller was rolled back at 09:06. No restricted room was breached, no cold-chain item was lost, and the custody log remains continuous. Required correction: no future firmware push may close without a live-door test, a latch release check, and a signed handoff from systems to archive operations."
      },
      {
        "id": "building-access-professional-message",
        "familyId": "building-access",
        "variant": "professional-message",
        "name": "West Annex Badge Failure / Professional Message",
        "context": "Slack-style facilities escalation sent while the badge fault was still active.",
        "intention": "Flag the access problem quickly while preserving exact door, time window, and downstream risk.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "adjacent-lexicon",
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "Facilities team, quick flag from West Annex: Door 3 is reading badges but not actually unlatching. First bad read we can pin down is 08:19, and it is now holding up the courier run for Suite 118 because the cold bag cannot sit outside any longer. It does not look like a dead reader. The panel is green, the click sounds normal, and the door still holds. Early guess is that the overnight renewal push touched the validator, because staff whose badges renewed this morning are failing while one older temporary badge still clears. We have rerouted intake to south receiving for now, but please do not close this as a power issue unless someone physically checks the latch and the controller cache. If you need a witness on site, I am by the loading corridor."
      },
      {
        "id": "building-access-rushed-mobile",
        "familyId": "building-access",
        "variant": "rushed-mobile",
        "name": "West Annex Badge Failure / Rushed Mobile",
        "context": "Text message from a staff member stuck at the annex door with a courier waiting.",
        "intention": "Capture same facts under compression, dropped punctuation, and mobile urgency.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "adjacent-lexicon",
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": true,
        "text": "west annex d3 still fake open. reader goes green + buzzes but door wont release. first hit was like 8:19 maybe 8:20. courier for suite 118 is here w fridge meds and he cant just wait in sun. weird part: my renewed badge fails, old temp badge worked once. not power i dont think. can someone pls check controller before they keep telling me to jiggle latch again"
      },
      {
        "id": "building-access-tangled-followup",
        "familyId": "building-access",
        "variant": "tangled-followup",
        "name": "West Annex Badge Failure / Tangled Follow-up",
        "context": "Later follow-up email correcting assumptions made in the first incident thread.",
        "intention": "Clarify half-right early reports and preserve which credentials failed, which door behavior held, and what corrected the issue.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "adjacent-lexicon",
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": false,
        "text": "Looping back because the first thread turned two separate things into one. The door was not dead, and it was not exactly \"unlocking then relocking\" either, although I can see why it looked that way in the moment. What was happening was more annoying: Door 3 flashed green, gave the normal sound, and still kept the strike engaged whenever the badge in question had been renewed after the overnight push. Older cached credentials could sometimes clear, which is why one temp badge made it through and confused the diagnosis. That distinction matters because people kept testing the latch instead of the validator. Also, the courier delay was not abstract. The medication bag for Suite 118 was already at the corridor at 08:19 and only got rerouted at 08:37. If we write this up as \"door glitch, resolved,\" we will miss the actual correction point."
      },
      {
        "id": "package-handoff-formal-record",
        "familyId": "package-handoff",
        "variant": "formal-record",
        "name": "Second-Floor Rush Parcel / Formal Record",
        "context": "Apartment building incident note documenting a missed signature and hallway pickup.",
        "intention": "Preserve witness sequence, unit number, parcel status, and handling chain.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "adjacent-lexicon",
          "directness",
          "list-structure",
          "literal-anchors",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": true,
        "text": "On Tuesday, March 18, the rush parcel addressed to Unit 2B was not presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that minute. The package was instead left on the second-floor landing near the stair rail. Ms. Chen located it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come through. I moved the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and requested help because she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support."
      },
      {
        "id": "package-handoff-professional-message",
        "familyId": "package-handoff",
        "variant": "professional-message",
        "name": "Second-Floor Rush Parcel / Professional Message",
        "context": "Email to building management asking for correction of an inaccurate delivery record.",
        "intention": "Correct the delivery record while retaining concrete hallway and unit details.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "adjacent-lexicon",
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "Hi building office, can someone please correct yesterday's delivery note for Unit 2B? The carrier record says \"attempted / no answer\" at 6:41 PM, but there was no buzzer call to 2B and the parcel was found on the second-floor landing instead of at the apartment door. Ms. Chen only found it after seeing the door tag and asking whether anything had been dropped off upstairs. I helped bring it from the landing to the hallway table outside 2B because she already had grocery bags and did not want to make a second trip on her knee. The parcel was still sealed and still had the red rush label on it. I am not asking for anything dramatic here, just for the record to stop saying a signature attempt happened when it did not."
      },
      {
        "id": "package-handoff-rushed-mobile",
        "familyId": "package-handoff",
        "variant": "rushed-mobile",
        "name": "Second-Floor Rush Parcel / Rushed Mobile",
        "context": "Text sent to a neighbor while trying to find the missing rush parcel.",
        "intention": "Keep the same facts legible through clipped mobile shorthand.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "adjacent-lexicon",
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "2b pkg wasnt brought down. tag says attempted 6:41 but no one buzzed her. it was just sitting on 2nd fl landing by rail. red rush sticker still on it. i moved it to hall table after she said yes its hers / she had bags already. if mgmt asks: box stayed sealed."
      },
      {
        "id": "package-handoff-tangled-followup",
        "familyId": "package-handoff",
        "variant": "tangled-followup",
        "name": "Second-Floor Rush Parcel / Tangled Follow-up",
        "context": "Follow-up note disentangling who saw the parcel first and where it was left.",
        "intention": "Repair sequence confusion without dropping the signature and hallway facts.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "adjacent-lexicon",
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": true,
        "text": "Following up because I think yesterday's thread accidentally made it sound as if the parcel moved through three hands before anyone could say whose it was. That is not quite right. The carrier marked \"attempted / no answer\" at 6:41 PM, but there was no call to 2B that anyone can point to. Ms. Chen saw the tag, asked around, and then the parcel was spotted on the second-floor landing near the stair rail. I lifted it from there only after she said it was the expected rush shipment and after she said she did not want to carry one more thing while balancing groceries. So yes, the hallway table outside 2B is where it ended up, but the actual miss happened earlier, on the landing, when the delivery record pretended the signature step had been tried."
      },
      {
        "id": "volunteer-cleanup-formal-record",
        "familyId": "volunteer-cleanup",
        "variant": "formal-record",
        "name": "Lot Cleanup Safety Brief / Formal Record",
        "context": "Written event brief for a neighborhood cleanup with tool staging and hazard controls.",
        "intention": "Keep assignment lanes and safety constraints explicit for later reuse.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "directness",
          "list-structure",
          "literal-anchors",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": false,
        "text": "Saturday lot cleanup opens at 07:30. Check-in is at the west fence table, and no one starts independent work before lane assignment. The first pass covers glass pickup, broken pallet removal, pantry post reset, and salvage sorting. Tool staging is fixed: shovels at the fence, brooms at the blue tarp, lumber saws under canopy B, paint at the folding table only if wind stays below the posted threshold. Gloves, water, and closed-toe shoes are not optional. Minors may assist with labeling and pantry sorting but do not enter the saw or thinner zone. Inventory stop is 10:15 sharp so the afternoon crew inherits a readable site rather than scattered half-decisions. If rain starts, suspend paint first, then cuts, then all electrical equipment. Success means the lot is safer, more legible, and easier for the next crew to continue without guessing."
      },
      {
        "id": "volunteer-cleanup-professional-message",
        "familyId": "volunteer-cleanup",
        "variant": "professional-message",
        "name": "Lot Cleanup Safety Brief / Professional Message",
        "context": "Volunteer coordinator message sent the evening before the cleanup.",
        "intention": "Translate the same work plan into a direct team-facing coordination message.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": true,
        "text": "Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation. Please check in at the west fence table when you arrive, even if you already know the site. We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting. Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds. Gloves, water, and closed-toe shoes are required. If you forgot any of those, tell me before you start rather than trying to work around it. Kids can help at labeling and pantry sort, but they stay clear of saws and thinner. We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing."
      },
      {
        "id": "volunteer-cleanup-rushed-mobile",
        "familyId": "volunteer-cleanup",
        "variant": "rushed-mobile",
        "name": "Lot Cleanup Safety Brief / Rushed Mobile",
        "context": "Morning-of text blast to volunteers when weather looked unstable.",
        "intention": "Preserve the task lanes while stressing fragmented mobile urgency.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": true,
        "text": "if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying"
      },
      {
        "id": "volunteer-cleanup-tangled-followup",
        "familyId": "volunteer-cleanup",
        "variant": "tangled-followup",
        "name": "Lot Cleanup Safety Brief / Tangled Follow-up",
        "context": "Clarifying follow-up after volunteers misunderstood the first staging note.",
        "intention": "Correct misread staging details without losing the original assignment logic.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": false,
        "text": "Quick follow-up because I think my earlier note sounded more relaxed than the work actually is. When I said \"check in at the table,\" I did not mean \"say hi and then drift toward whatever looks unfinished.\" I meant actual lane assignment, because last month we ended up with three people scraping paint while the broken glass sat untouched by the gate. Also, \"kids can help\" did not mean kids circulating through every station. It meant labeling and pantry sorting only. I know that sounds over-specific, but the site gets messy fast once half-heard instructions start mutating. So: west fence table first, glass and pallets first pass, saws under canopy B, paint only if the wind holds, and inventory stop at 10:15 even if the lot finally starts looking photogenic right before then."
      },
      {
        "id": "tenant-leak-formal-record",
        "familyId": "tenant-leak",
        "variant": "formal-record",
        "name": "Unit 4C Cabinet Leak / Formal Record",
        "context": "Tenant incident note documenting an unresolved kitchen leak and delayed repair.",
        "intention": "Fix dates, unit numbers, and repair promises into one usable record.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "directness",
          "list-structure",
          "literal-anchors",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": false,
        "text": "Unit 4C reported active water intrusion under the kitchen sink at 7:12 AM on April 4. Water was visible at the rear supply line, collecting under the cabinet lip, and beginning to wick into the hallway threshold by the time building staff arrived. Initial mitigation was absorbent towels plus a temporary shutoff at the under-sink valve. The valve reduced but did not eliminate the drip. Maintenance advised that a licensed plumber would attend the same afternoon; that visit did not occur. At 6:18 PM the tenant reported renewed pooling and a sour odor from the cabinet backing. As of this note, the cabinet base remains damp, the wall trim by the threshold shows swelling, and the resident has moved boxed pantry goods into the living room to keep them dry. The immediate issue is not only pipe failure, but repeated repair assurances that did not convert into an actual visit or a revised timeline."
      },
      {
        "id": "tenant-leak-professional-message",
        "familyId": "tenant-leak",
        "variant": "professional-message",
        "name": "Unit 4C Cabinet Leak / Professional Message",
        "context": "Tenant email to management asking for a repair timeline after missed promises.",
        "intention": "Push for action while preserving literal leak history and missed-visit sequence.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "Hello management, I need an updated repair timeline for the leak in Unit 4C because the same-day promise from Friday did not turn into an actual visit. The leak was reported at 7:12 AM. Staff saw water under the kitchen sink, reduced the flow at the valve, and told me a licensed plumber would come that afternoon. No one came. By 6:18 PM there was pooling again, plus a sour smell from the cabinet backing, so I moved pantry boxes into the living room to keep them dry. The under-sink valve slows the drip but does not stop it. The threshold trim is swelling now, which means this is no longer only a plumbing inconvenience. Please confirm who is coming, when, and whether the cabinet base needs separate remediation after the pipe repair."
      },
      {
        "id": "tenant-leak-rushed-mobile",
        "familyId": "tenant-leak",
        "variant": "rushed-mobile",
        "name": "Unit 4C Cabinet Leak / Rushed Mobile",
        "context": "Text sent to landlord after the promised plumber failed to show.",
        "intention": "Keep leak details and missed appointment visible under shorthand and frustration.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "4c sink leak still going. valve cut it down but didnt stop it. someone said plumber friday pm and no one came. cabinet floor wet again by 6:18, trim by hall is swelling now + it smells weird under there. pls dont mark this fixed bc its not"
      },
      {
        "id": "tenant-leak-tangled-followup",
        "familyId": "tenant-leak",
        "variant": "tangled-followup",
        "name": "Unit 4C Cabinet Leak / Tangled Follow-up",
        "context": "Follow-up message correcting management's assumption that the tenant had refused entry.",
        "intention": "Untangle the repair delay while preserving valve, odor, and cabinet facts.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": false,
        "text": "Following up because the note that came back to me says \"entry may not have been available,\" and that is not what happened. I was home. The issue is that a plumber was mentioned, then the afternoon passed, then the office closed, and now we are in the irritating position where the leak is half-contained enough for everyone else to sound calm and still active enough that I am moving pantry boxes into the living room. The under-sink valve did reduce the flow, yes, but it never stopped the drip. By 6:18 PM there was water under the cabinet again and the trim by the hallway threshold had started to swell. Also there is now a sour smell from the cabinet backing, which was not present at 7:12 AM when I first reported it. I need the record to reflect delay, not resident refusal."
      },
      {
        "id": "clinic-scheduling-formal-record",
        "familyId": "clinic-scheduling",
        "variant": "formal-record",
        "name": "MRI Authorization Callback / Formal Record",
        "context": "Scheduling note for a diagnostic scan delayed by an authorization mismatch.",
        "intention": "Hold the authorization code, callback timeline, and ordering-clinic correction in one place.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "directness",
          "list-structure",
          "literal-anchors",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": false,
        "text": "Radiology scheduling for the left-knee MRI remains pending because the authorization record does not match the ordering location on file. Patient called first at 9:07 AM on May 6 after receiving a portal notice that the referral was approved. Scheduling could not book because the insurer record referenced the downtown clinic while the order in our queue still listed North River. Authorization number PR-44719 was verbally confirmed by the patient and later confirmed by payer line, but the site mismatch kept the case in callback status. A correction request was sent to the ordering office at 10:26 AM. As of the final callback at 3:44 PM, the order had not been reissued and no scan slot could be held beyond the following afternoon. The operational failure here is not absent authorization, but fragmented correction ownership between payer, ordering clinic, and scheduling desk."
      },
      {
        "id": "clinic-scheduling-professional-message",
        "familyId": "clinic-scheduling",
        "variant": "professional-message",
        "name": "MRI Authorization Callback / Professional Message",
        "context": "Scheduling email summarizing why the patient still could not be booked.",
        "intention": "Translate the authorization mismatch into a clear clinic-facing message.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "Hi team, I am documenting why the MRI for the left knee is still not scheduled even though the patient was told the authorization had cleared. The payer line confirmed auth number PR-44719, but their record is tied to the downtown clinic while the order in our queue still points to North River. Because the site on the authorization and the site on the order do not match, scheduling can see the approval and still cannot legally book the scan. We sent the correction request at 10:26 AM and were still waiting on a reissued order at the 3:44 PM callback. If the ordering office can resend under the correct location today, we may still keep the next-day slot. Otherwise the case rolls again."
      },
      {
        "id": "clinic-scheduling-rushed-mobile",
        "familyId": "clinic-scheduling",
        "variant": "rushed-mobile",
        "name": "MRI Authorization Callback / Rushed Mobile",
        "context": "Patient text trying to explain the scheduling block after multiple phone calls.",
        "intention": "Preserve the auth number and site mismatch through messy repeated shorthand.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "called again. they keep saying auth exists but cant book bc auth is under downtown + order still says north river. auth # is PR-44719. portal says approved, scheduler says not schedulable, ordering office says wait for callback. ive had 3 callbacks already"
      },
      {
        "id": "clinic-scheduling-tangled-followup",
        "familyId": "clinic-scheduling",
        "variant": "tangled-followup",
        "name": "MRI Authorization Callback / Tangled Follow-up",
        "context": "Follow-up note after several departments contradicted each other on the same case.",
        "intention": "Track the loop between portal approval, payer confirmation, and unschedulable order state.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": false,
        "text": "Trying one more time because each person I speak with describes the same blockage as if it lives somewhere else. The portal notice made it sound finished. The payer line confirmed PR-44719, so that sounded finished too. Scheduling then said the approval could not be used because it points to the downtown clinic while the actual order still says North River, which means the approval is real and unusable at the same time. I was told a corrected order request went out at 10:26 AM, then told to wait for a callback, then told the next-day slot could not be held indefinitely. I am not confused about whether an authorization exists. I am confused about why an approved case can sit in limbo all day because no one owns the location mismatch long enough to close it."
      },
      {
        "id": "committee-budget-formal-record",
        "familyId": "committee-budget",
        "variant": "formal-record",
        "name": "Bridge Budget Freeze / Formal Record",
        "context": "Committee recap on a staffing freeze and short bridge budget.",
        "intention": "Preserve the allocative facts while maintaining committee caution and sequence.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "abstraction",
          "directness",
          "hedging",
          "list-structure",
          "literal-anchors",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": true,
        "text": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze through Q3. The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased. Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage. Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval. No option was adopted in session. What did resolve was the frame: this is not a generic belt-tightening exercise. It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty. Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction."
      },
      {
        "id": "committee-budget-professional-message",
        "familyId": "committee-budget",
        "variant": "professional-message",
        "name": "Bridge Budget Freeze / Professional Message",
        "context": "Meeting recap email sent to committee members after a staffing freeze discussion.",
        "intention": "Carry the budget facts forward while softening the formality slightly.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "abstraction",
          "contraction",
          "directness",
          "hedging",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "Thanks again for the finance committee meeting today. To recap the practical issue: the hiring freeze now extends through Q3, which leaves the student-support coordinator line unfilled for another twelve weeks unless we find bridge coverage. The room seemed aligned that we can defer furniture and print costs if needed, but we cannot pretend the intake queue will absorb a quarter without staffing impact. The three live options are still the same: repurpose the vacant analyst line temporarily, reduce evening hours, or ask finance whether restricted reserves can cover a bridge period with dean approval. We did not choose among them yet. What we did agree on is that the next note should describe this as a staffing exposure problem, not as a neutral \"efficiency adjustment.\" I will send the revised table by Thursday once finance answers the reserve-rule question."
      },
      {
        "id": "committee-budget-rushed-mobile",
        "familyId": "committee-budget",
        "variant": "rushed-mobile",
        "name": "Bridge Budget Freeze / Rushed Mobile",
        "context": "Text to the chair right after the meeting before the formal recap was written.",
        "intention": "Compress the budget problem into a hurried note without losing options and timeline.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "abstraction",
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "freeze runs thru q3. means coord line stays empty 12 more wks unless we bridge it. room was basically: cut print/furniture if needed, dont fake that intake can run w no staffing hit. 3 options still analyst line / evening hrs / reserves w dean ok. revised table thurs after finance answers reserve rule"
      },
      {
        "id": "committee-budget-tangled-followup",
        "familyId": "committee-budget",
        "variant": "tangled-followup",
        "name": "Bridge Budget Freeze / Tangled Follow-up",
        "context": "Later committee follow-up correcting wording from the first recap.",
        "intention": "Untangle pause vs reduction language and preserve the staffing exposure frame.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "abstraction",
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": true,
        "text": "I want to revise one phrase from my earlier recap before it starts hardening into the story. I wrote that the committee was considering a \"service adjustment,\" which is technically true in the narrow memo sense and misleading in the lived one. What the table actually showed is that if the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either gets redistributed badly or evening hours shrink. Those are not abstract efficiencies. They are service consequences. Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off. But I do not want the language to get gentler than the problem just because we are waiting for the Thursday table."
      },
      {
        "id": "mutual-aid-formal-record",
        "familyId": "mutual-aid",
        "variant": "formal-record",
        "name": "Church Lot Intake Routing / Formal Record",
        "context": "Mutual-aid intake note documenting resource routing for a family parked at a church lot.",
        "intention": "Hold resource facts, duplicate-intake risk, and routing limits in one readable record.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "directness",
          "list-structure",
          "literal-anchors",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": false,
        "text": "Household intake completed at the church lot at 5:32 PM. Family of four requested motel support, bus fare, diapers, and a same-night food referral after losing access to the prior couch arrangement. Two minors were present. Available resources at time of intake did not include motel placement. Immediate supports issued were two bus passes, one grocery referral for same-evening pickup, and a diaper packet from table stock. Intake worker also flagged possible duplication because the caller name and phone number partially matched a request logged the prior week through the east-side line, though the earlier note did not confirm household size. Follow-up task is not denial. It is route cleanup: confirm whether this is the same household under a changed lodging address so the team does not accidentally split the case across two volunteer lanes and undercount what has already been offered."
      },
      {
        "id": "mutual-aid-professional-message",
        "familyId": "mutual-aid",
        "variant": "professional-message",
        "name": "Church Lot Intake Routing / Professional Message",
        "context": "Volunteer handoff message asking the next shift to continue a mutual-aid case.",
        "intention": "Preserve resource routing and duplicate-intake caution in shift-friendly language.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "For next shift: family of four at the church lot was seen at 5:32 PM asking for motel help, bus fare, diapers, and a same-night food referral after losing the couch placement they had been using. We did not have motel capacity tonight. What they left with was two bus passes, one grocery referral for evening pickup, and a diaper packet from table stock. Please note that the caller name and phone number may partially match an intake from the east-side line last week, but I could not confirm whether it is the same household or just a similar record. I am not flagging this to block support. I am flagging it so we do not accidentally route the case twice and lose track of what has already been promised."
      },
      {
        "id": "mutual-aid-rushed-mobile",
        "familyId": "mutual-aid",
        "variant": "rushed-mobile",
        "name": "Church Lot Intake Routing / Rushed Mobile",
        "context": "Volunteer text while trying to route a household quickly at dusk.",
        "intention": "Keep concrete resource facts visible through a hurried text lane.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "fam of 4 at church lot now. need motel + diapers + bus fare + food tonight. no motel stock left. gave 2 bus passes + diaper pack + grocery pickup referral. maybe same household as east side last wk? number kinda matches. not saying no just dont want case split twice"
      },
      {
        "id": "mutual-aid-tangled-followup",
        "familyId": "mutual-aid",
        "variant": "tangled-followup",
        "name": "Church Lot Intake Routing / Tangled Follow-up",
        "context": "Follow-up after volunteers realized the same family might have been routed twice.",
        "intention": "Untangle duplicate-intake risk without collapsing support into suspicion.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": false,
        "text": "Following up because I do not want the duplicate-intake flag to mutate into a character judgment. The family at the church lot still needs what they said they need: bus fare, diapers, food tonight, and some answer about motel support even if that answer is \"not available.\" The complication is routing, not credibility. Their number appears close to one logged through the east-side line last week, and the names may be the same household under a different couch address, but the older note is thin and does not even confirm household size. So the task for next shift is not to interrogate them into consistency. It is to confirm whether we are already holding part of this case elsewhere, because otherwise we end up with two volunteer lanes each thinking the other one handled the follow-up."
      },
      {
        "id": "overwork-debrief-formal-record",
        "familyId": "overwork-debrief",
        "variant": "formal-record",
        "name": "Weekend Revision Spillover / Formal Record",
        "context": "Internal debrief documenting how a deadline slid into an overwork spiral.",
        "intention": "Hold sequence and capacity drift in a cooler self-audit register.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "directness",
          "list-structure",
          "literal-anchors",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": false,
        "text": "The draft delay was not caused by a single late task. It was produced by repeated small extensions that looked temporary in isolation and cumulative in practice. Work began as a Friday afternoon revision to the partner memo. By 6:10 PM the scope had already expanded to include table cleanup, citation repair, and a second tone pass requested in chat rather than in the tracked document. Additional edits continued through Saturday because no one explicitly closed the loop between \"useful refinement\" and \"capacity already exceeded.\" By the time the final version was sent Sunday night, the memo itself was serviceable and the process was not. The operational lesson is simple and not flattering: when each extra pass is justified as small, the total burden goes undocumented until exhaustion has already started presenting itself as courtesy. A future correction has to include an explicit stop condition, not just better intentions."
      },
      {
        "id": "overwork-debrief-professional-message",
        "familyId": "overwork-debrief",
        "variant": "professional-message",
        "name": "Weekend Revision Spillover / Professional Message",
        "context": "Apology email explaining a late draft and the capacity problem underneath it.",
        "intention": "Acknowledge delay without disguising the real overwork pattern.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": true,
        "text": "I owe you a cleaner explanation for why the memo landed late. It was not one giant emergency so much as a stack of small revision asks that kept sounding manageable long after they stopped being that. What began as a Friday afternoon tone pass turned into table cleanup, citation repair, and another full review cycle across Saturday because each extra ask arrived as if it were the last one. I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately. The memo itself is now in good shape, but the route we took to get there was not. For the next round I would like us to define a stop point before weekend work starts presenting itself as thoughtfulness."
      },
      {
        "id": "overwork-debrief-rushed-mobile",
        "familyId": "overwork-debrief",
        "variant": "rushed-mobile",
        "name": "Weekend Revision Spillover / Rushed Mobile",
        "context": "Late-night text apology sent while still revising the draft.",
        "intention": "Stress the apologetic overwork posture through real mobile compression.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "sorry draft still not out. it kept turning into \"one more fix\" - first tone pass then table cleanup then citations then another read. i shouldve said stop earlier instead of acting like i could just hold it all thru wknd. sending tonight even if im annoyed w how i got there"
      },
      {
        "id": "overwork-debrief-tangled-followup",
        "familyId": "overwork-debrief",
        "variant": "tangled-followup",
        "name": "Weekend Revision Spillover / Tangled Follow-up",
        "context": "Reflective follow-up after the sender realized the apology was still understating the pattern.",
        "intention": "Surface recursive self-correction and delayed refusal.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": true,
        "text": "I am following up because my first apology still made the weekend sound accidental, and that is too gentle. The pattern was familiar long before the final send: one more pass because the table looked sloppy, one more pass because the citations were not defensible enough, one more pass because the tone in chat suddenly shifted and I did not want to be the person who said no after everyone else had already stayed online. None of that was a formal demand, which is exactly how I kept talking myself into it. By Sunday night the memo was fine and my capacity was not. I am trying to name the thing correctly this time: the problem was not dedication. It was the way I kept translating exhaustion into politeness until the schedule looked consensual."
      },
      {
        "id": "archive-grant-formal-record",
        "familyId": "archive-grant",
        "variant": "formal-record",
        "name": "Neighborhood Archive Grant Scope / Formal Record",
        "context": "Project-planning note for a small archive grant with cataloging and community review components.",
        "intention": "Preserve deliverables, schedule, and research method in a formal planning voice.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "abstraction",
          "directness",
          "list-structure",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": true,
        "text": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First, the team will complete a shared cataloging protocol for neighborhood collections now described with inconsistent local vocabularies. Second, six community stewards will be trained to review descriptive language before records are published or exhibited. Third, a portable exhibition kit will be built for circulation through branch libraries, school sites, and tenant meetings. The scheduling risk is not the catalog build itself, but the interval between description and community review. If that interval stretches, the project drifts back toward extractive efficiency rather than reciprocal stewardship. Planning assumptions therefore include a two-week review buffer in each cycle, a modest translation budget, and a rule that no descriptive template is treated as final before local review has actually occurred."
      },
      {
        "id": "archive-grant-professional-message",
        "familyId": "archive-grant",
        "variant": "professional-message",
        "name": "Neighborhood Archive Grant Scope / Professional Message",
        "context": "Partner email clarifying what the archive grant is actually promising.",
        "intention": "Make the archive plan concrete without losing its research framing.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "abstraction",
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "Just to keep the grant language concrete, we are not promising \"community access\" in the vague sense and hoping the rest fills itself in. The work has three actual pieces: a shared cataloging protocol for collections that currently use incompatible local vocabularies, training for six community stewards who will review descriptive language before publication, and a portable exhibition kit that can move through libraries, schools, and tenant meetings. The fragile part is the time between description and review. If we compress that gap too hard, we get efficiency at the cost of reciprocity, which is exactly what the proposal says it is trying to avoid. That is why the schedule includes a two-week review buffer and a small translation line instead of pretending local feedback appears for free."
      },
      {
        "id": "archive-grant-rushed-mobile",
        "familyId": "archive-grant",
        "variant": "rushed-mobile",
        "name": "Neighborhood Archive Grant Scope / Rushed Mobile",
        "context": "Quick note to a collaborator while revising grant language on a deadline.",
        "intention": "Keep archive-planning facts visible through compressed writing.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "abstraction",
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "grant isnt just digitize + pray. its shared catalog protocol + 6 steward reviewers + portable exhibit kit. main risk is if description outruns local review and we start calling extraction access. pls keep the 2 wk review buffer + translation line in budget"
      },
      {
        "id": "archive-grant-tangled-followup",
        "familyId": "archive-grant",
        "variant": "tangled-followup",
        "name": "Neighborhood Archive Grant Scope / Tangled Follow-up",
        "context": "Follow-up trying to correct a partner's too-clean summary of the proposal.",
        "intention": "Repair oversimplification while preserving the archive project's real sequencing logic.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "abstraction",
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": true,
        "text": "One more correction to the summary language because I think \"cataloging plus exhibit\" is too neat and accidentally repeats the exact habit we were trying to get away from. Yes, the project produces a catalog protocol and an exhibition kit. But the hinge is the review interval in between, because the descriptive language is not neutral just because it sounds standardized. If we move from description straight to publication, the project may still look efficient from outside and will have stopped doing the reciprocal part it claimed as method. That is why I keep insisting on the two-week review buffer, the translation line, and the steward training as deliverables rather than warm context. Without those, we have a cleaner workflow and a less honest grant."
      },
      {
        "id": "performance-review-formal-record",
        "familyId": "performance-review",
        "variant": "formal-record",
        "name": "Annual Review / Formal Record",
        "context": "Manager evaluation balancing strong mentoring with repeated delays in reporting.",
        "intention": "Preserve evaluative nuance, examples, and consequence without flattening either strength or weakness.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "abstraction",
          "directness",
          "list-structure",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": false,
        "text": "The annual review reflects a split pattern rather than a uniformly strong or weak cycle. The employee remains one of the more reliable trainers of new staff, especially during high-volume onboarding weeks when procedures change faster than written guidance. Peer feedback repeatedly names calm escalation, practical explanation, and willingness to stay with a task until another person can perform it independently. At the same time, reporting deadlines slid in three separate months, and the delay pattern was not random. In each case the immediate service work was completed, but documentation was deferred until the record became harder to reconstruct cleanly. That distinction matters. Strong front-line support does not cancel weak record timing. The recommendation is not punitive action. It is a corrective plan that treats documentation lag as a real performance issue while protecting the mentoring strengths that the unit depends on."
      },
      {
        "id": "performance-review-professional-message",
        "familyId": "performance-review",
        "variant": "professional-message",
        "name": "Annual Review / Professional Message",
        "context": "Draft manager email summarizing key review points before the formal write-up.",
        "intention": "Carry the same evaluative split in a more direct pre-review message.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "abstraction",
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "Ahead of the formal review, I want to name the pattern as clearly as I can. You are consistently strong in onboarding and peer support. New staff trust your explanations, and multiple people pointed to your calm escalation style when procedures changed quickly this year. The harder part is documentation timing. We had reporting slips in three different months, and in each case the direct service was done but the written record lagged until the details were harder to rebuild. I am not treating that as a paperwork footnote. It affects handoff quality and makes later review more difficult than it needs to be. My goal for the review is to protect the mentoring strengths while making the documentation correction concrete rather than vague."
      },
      {
        "id": "performance-review-rushed-mobile",
        "familyId": "performance-review",
        "variant": "rushed-mobile",
        "name": "Annual Review / Rushed Mobile",
        "context": "Manager note-to-self typed on a phone right after the review meeting.",
        "intention": "Capture the same evaluation in clipped shorthand for later drafting.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "abstraction",
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "review gist: great w onboarding / ppl trust them / calm under change. real issue is docs lag. 3 diff months same thing - service got done, writeup came late, handoff got muddy. dont write it like \"minor admin gap.\" not punitive either. needs concrete correction plan"
      },
      {
        "id": "performance-review-tangled-followup",
        "familyId": "performance-review",
        "variant": "tangled-followup",
        "name": "Annual Review / Tangled Follow-up",
        "context": "Follow-up note after the reviewer worried the summary sounded harsher or softer than intended.",
        "intention": "Hold the evaluative balance while correcting tone drift.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "abstraction",
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": false,
        "text": "I keep revising the summary because I do not want it to sound either falsely flattering or disciplinary by reflex. The point is not \"excellent except for paperwork,\" because the documentation lag affected handoffs more than that phrase admits. The point is also not \"strong mentoring but...\" in the condescending sense, because the mentoring work is not decorative either; the unit genuinely leans on it during onboarding. What I am trying to say, maybe too carefully, is that the cycle showed a real split: strong peer support, calm escalation, practical teaching, and then three months where the reporting lag made later reconstruction harder than it needed to be. I want the written review to keep both truths in view long enough that the correction plan feels proportionate instead of automatic."
      },
      {
        "id": "customer-support-formal-record",
        "familyId": "customer-support",
        "variant": "formal-record",
        "name": "Account Recovery Fraud Hold / Formal Record",
        "context": "Support case note for a customer blocked by a fraud hold during account recovery.",
        "intention": "Keep the account, hold, and recovery facts precise without becoming decorative.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "adjacent-lexicon",
          "directness",
          "list-structure",
          "literal-anchors",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": true,
        "text": "Customer contacted support at 11:23 AM regarding account access loss after a password reset attempt triggered the fraud hold. The user could still receive one-time codes but could not complete login because the system flagged the device as new and placed the account in manual review. Case number CS-88412. The customer confirmed the last four digits on file and the recovery email ending in @elmfield.net, which matched account records. A prior support thread had already instructed the user to retry the reset flow, but that advice did not clear the hold because the underlying issue was not credential mismatch. It was the fraud lock itself. The account remains inaccessible until review removes the device challenge or support performs verified override. The procedural risk is repeated generic guidance that makes the customer loop through the same dead path while the fraud queue stays untouched."
      },
      {
        "id": "customer-support-professional-message",
        "familyId": "customer-support",
        "variant": "professional-message",
        "name": "Account Recovery Fraud Hold / Professional Message",
        "context": "Internal support handoff message explaining why the reset loop is not enough.",
        "intention": "Keep the customer-account facts intact while redirecting the case toward the correct queue.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "adjacent-lexicon",
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": false,
        "text": "Escalating case CS-88412 because this is no longer a basic password-reset question. The customer can receive one-time codes and has already confirmed the last four digits on file plus the recovery email ending in @elmfield.net. The block happens after that, when the device challenge triggers the fraud hold and pushes the account into manual review. Telling them to restart the reset flow will not solve it because the credential path is not the failure point. The hold is. Please route to the fraud-review queue or apply verified override if policy allows. Right now the customer is stuck in a loop where every generic recovery step appears valid and still ends at the same hold screen."
      },
      {
        "id": "customer-support-rushed-mobile",
        "familyId": "customer-support",
        "variant": "rushed-mobile",
        "name": "Account Recovery Fraud Hold / Rushed Mobile",
        "context": "Customer text paraphrase after multiple support chats failed to unlock the account.",
        "intention": "Preserve hold, case number, and recovery details under noisy mobile pressure.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "adjacent-lexicon",
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": true,
        "text": "acct still locked. can get the code but login dies at fraud review every time. case CS-88412. support keeps saying reset again even tho reset isnt the problem. last 4 + recovery email match. need someone to clear hold not send same script"
      },
      {
        "id": "customer-support-tangled-followup",
        "familyId": "customer-support",
        "variant": "tangled-followup",
        "name": "Account Recovery Fraud Hold / Tangled Follow-up",
        "context": "Support follow-up after realizing multiple agents had described the same fraud hold as different problems.",
        "intention": "Untangle reset, device challenge, and fraud-review ownership without dropping case specifics.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "adjacent-lexicon",
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": false,
        "text": "Following up because the thread is starting to split one issue into three imaginary ones. This is not a wrong-password case and not really a missing-code case either, even though the customer has had to walk through both scripts. They receive the one-time code. They confirm the last four digits and the recovery address ending in @elmfield.net. Then the device challenge fires, the account falls into fraud review, and the user lands back at the same hold state. So when one note says \"reset incomplete\" and another says \"awaiting customer verification,\" both are technically attached to the case and neither identifies the actual block. Case CS-88412 needs fraud-review ownership or verified override, otherwise the customer will keep re-performing compliance without any path to entry."
      },
      {
        "id": "school-coordination-formal-record",
        "familyId": "school-coordination",
        "variant": "formal-record",
        "name": "Pickup Change and Permission Slip / Formal Record",
        "context": "School office note documenting a same-day pickup change and missing field-trip permission paperwork.",
        "intention": "Preserve guardian, pickup, and permission facts in one usable office record.",
        "register": "formal-record",
        "cleanliness": "clean",
        "anchorMode": "protected-literal",
        "stressTags": [
          "directness",
          "list-structure",
          "literal-anchors",
          "same-facts",
          "sentence-span"
        ],
        "deckVisible": false,
        "text": "At 1:48 PM the school office received a call from the student's mother requesting a same-day pickup change. The usual pickup adult could not arrive, and the student was to be released to Aunt Maribel instead. Office staff requested the photo ID match on arrival and noted the change in the dismissal log. During the same call, the office also flagged that the field-trip permission slip for Friday's museum visit had not yet been returned, although the fee waiver form was already on file. The caller stated that the signed permission page was in the backpack but may not have been handed in. A reminder note was sent to the classroom at 2:03 PM. Aunt Maribel signed out the student at 3:17 PM with ID verified. As of close, the permission slip itself remained unlocated. The coordination issue is split custody of information: transportation resolved in real time, paperwork still unresolved despite multiple related forms already existing in the file."
      },
      {
        "id": "school-coordination-professional-message",
        "familyId": "school-coordination",
        "variant": "professional-message",
        "name": "Pickup Change and Permission Slip / Professional Message",
        "context": "School-family coordination email summarizing a pickup change and missing permission slip.",
        "intention": "Carry dismissal and permission details forward in a calm parent-facing tone.",
        "register": "professional-message",
        "cleanliness": "mostly-clean",
        "anchorMode": "mixed-literal",
        "stressTags": [
          "contraction",
          "directness",
          "list-structure",
          "register-shift",
          "same-facts"
        ],
        "deckVisible": true,
        "text": "Hello, confirming today's dismissal change: Aunt Maribel was approved for pickup and signed the student out at 3:17 PM after ID verification. We also wanted to note that the museum field-trip permission slip still was not located by close of day, even though the fee waiver form is already on file. During the 1:48 PM phone call, you mentioned the signed slip might still be in the backpack. We sent a reminder to the classroom at 2:03 PM, but the paper did not surface before dismissal. If the signed permission page comes home tonight, please return it tomorrow morning so Friday's trip record is complete."
      },
      {
        "id": "school-coordination-rushed-mobile",
        "familyId": "school-coordination",
        "variant": "rushed-mobile",
        "name": "Pickup Change and Permission Slip / Rushed Mobile",
        "context": "Guardian text to the school office while handling a last-minute pickup change.",
        "intention": "Preserve the same pickup and permission facts through everyday mobile shorthand.",
        "register": "rushed-mobile",
        "cleanliness": "noisy",
        "anchorMode": "compressed-literal",
        "stressTags": [
          "contraction",
          "fragmentation",
          "literal-anchors",
          "punctuation",
          "recurrence",
          "same-facts"
        ],
        "deckVisible": true,
        "text": "hi office - aunt maribel has to do pickup today not grandma. shell have id. also i swear i signed the museum slip, it might still be in backpack w the waiver papers. if class can check before 3 that would help. sorry for late change"
      },
      {
        "id": "school-coordination-tangled-followup",
        "familyId": "school-coordination",
        "variant": "tangled-followup",
        "name": "Pickup Change and Permission Slip / Tangled Follow-up",
        "context": "Follow-up trying to disentangle dismissal logistics from missing paperwork.",
        "intention": "Repair conflation between pickup approval and trip paperwork.",
        "register": "tangled-followup",
        "cleanliness": "messy",
        "anchorMode": "repair-literal",
        "stressTags": [
          "hedging",
          "recurrence",
          "register-shift",
          "same-facts",
          "sentence-span",
          "tangle"
        ],
        "deckVisible": false,
        "text": "Following up because I think the dismissal change and the field-trip paperwork got bundled together in a way that makes both sound less resolved than they are. Pickup was fine: Aunt Maribel was the substitute adult, she brought ID, and the student left at 3:17 PM. The unresolved part is the museum permission slip. I mentioned on the 1:48 PM call that I had already signed it and suspected it was still in the backpack with the fee waiver papers, but the classroom check at 2:03 PM did not turn it up. I do not want the record to imply that the pickup change caused the missing permission page, because those are two separate problems that just happened to share the same phone call."
      }
    ],
    "promotedSampleIds": [
      "building-access-formal-record",
      "building-access-rushed-mobile",
      "package-handoff-formal-record",
      "package-handoff-tangled-followup",
      "volunteer-cleanup-professional-message",
      "volunteer-cleanup-rushed-mobile",
      "committee-budget-formal-record",
      "committee-budget-tangled-followup",
      "overwork-debrief-professional-message",
      "overwork-debrief-tangled-followup",
      "archive-grant-formal-record",
      "archive-grant-tangled-followup",
      "customer-support-formal-record",
      "customer-support-rushed-mobile",
      "school-coordination-professional-message",
      "school-coordination-rushed-mobile"
    ],
    "promotedSampleLibrary": [
      {
        "id": "building-access-formal-record",
        "name": "West Annex Badge Failure / Formal Record",
        "intention": "Preserve literal sequence, times, and access state without losing the operational correction.",
        "text": "At 08:14 on Monday, Door 3 at the West Annex began presenting a false-open state. The reader accepted active badges and flashed green, but the strike did not release. The first confirmed access failure affected courier intake at 08:19, when a refrigerated medication delivery for Suite 118 could not clear the corridor. Facilities first treated the event as a low-voltage latch issue; the meter reading did not support that assumption. By 08:31 we confirmed that the overnight badge-renewal push had stopped validating newly renewed credentials while older local cache entries still passed. Deliveries were rerouted to the south receiving desk at 08:37. Manual escort restored controlled entry at 08:42, and the controller was rolled back at 09:06. No restricted room was breached, no cold-chain item was lost, and the custody log remains continuous. Required correction: no future firmware push may close without a live-door test, a latch release check, and a signed handoff from systems to archive operations."
      },
      {
        "id": "building-access-rushed-mobile",
        "name": "West Annex Badge Failure / Rushed Mobile",
        "intention": "Capture same facts under compression, dropped punctuation, and mobile urgency.",
        "text": "west annex d3 still fake open. reader goes green + buzzes but door wont release. first hit was like 8:19 maybe 8:20. courier for suite 118 is here w fridge meds and he cant just wait in sun. weird part: my renewed badge fails, old temp badge worked once. not power i dont think. can someone pls check controller before they keep telling me to jiggle latch again"
      },
      {
        "id": "package-handoff-formal-record",
        "name": "Second-Floor Rush Parcel / Formal Record",
        "intention": "Preserve witness sequence, unit number, parcel status, and handling chain.",
        "text": "On Tuesday, March 18, the rush parcel addressed to Unit 2B was not presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that minute. The package was instead left on the second-floor landing near the stair rail. Ms. Chen located it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come through. I moved the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and requested help because she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support."
      },
      {
        "id": "package-handoff-tangled-followup",
        "name": "Second-Floor Rush Parcel / Tangled Follow-up",
        "intention": "Repair sequence confusion without dropping the signature and hallway facts.",
        "text": "Following up because I think yesterday's thread accidentally made it sound as if the parcel moved through three hands before anyone could say whose it was. That is not quite right. The carrier marked \"attempted / no answer\" at 6:41 PM, but there was no call to 2B that anyone can point to. Ms. Chen saw the tag, asked around, and then the parcel was spotted on the second-floor landing near the stair rail. I lifted it from there only after she said it was the expected rush shipment and after she said she did not want to carry one more thing while balancing groceries. So yes, the hallway table outside 2B is where it ended up, but the actual miss happened earlier, on the landing, when the delivery record pretended the signature step had been tried."
      },
      {
        "id": "volunteer-cleanup-professional-message",
        "name": "Lot Cleanup Safety Brief / Professional Message",
        "intention": "Translate the same work plan into a direct team-facing coordination message.",
        "text": "Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation. Please check in at the west fence table when you arrive, even if you already know the site. We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting. Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds. Gloves, water, and closed-toe shoes are required. If you forgot any of those, tell me before you start rather than trying to work around it. Kids can help at labeling and pantry sort, but they stay clear of saws and thinner. We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing."
      },
      {
        "id": "volunteer-cleanup-rushed-mobile",
        "name": "Lot Cleanup Safety Brief / Rushed Mobile",
        "intention": "Preserve the task lanes while stressing fragmented mobile urgency.",
        "text": "if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying"
      },
      {
        "id": "committee-budget-formal-record",
        "name": "Bridge Budget Freeze / Formal Record",
        "intention": "Preserve the allocative facts while maintaining committee caution and sequence.",
        "text": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze through Q3. The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased. Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage. Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval. No option was adopted in session. What did resolve was the frame: this is not a generic belt-tightening exercise. It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty. Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction."
      },
      {
        "id": "committee-budget-tangled-followup",
        "name": "Bridge Budget Freeze / Tangled Follow-up",
        "intention": "Untangle pause vs reduction language and preserve the staffing exposure frame.",
        "text": "I want to revise one phrase from my earlier recap before it starts hardening into the story. I wrote that the committee was considering a \"service adjustment,\" which is technically true in the narrow memo sense and misleading in the lived one. What the table actually showed is that if the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either gets redistributed badly or evening hours shrink. Those are not abstract efficiencies. They are service consequences. Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off. But I do not want the language to get gentler than the problem just because we are waiting for the Thursday table."
      },
      {
        "id": "overwork-debrief-professional-message",
        "name": "Weekend Revision Spillover / Professional Message",
        "intention": "Acknowledge delay without disguising the real overwork pattern.",
        "text": "I owe you a cleaner explanation for why the memo landed late. It was not one giant emergency so much as a stack of small revision asks that kept sounding manageable long after they stopped being that. What began as a Friday afternoon tone pass turned into table cleanup, citation repair, and another full review cycle across Saturday because each extra ask arrived as if it were the last one. I should have named the capacity limit earlier instead of trying to protect the process by absorbing it privately. The memo itself is now in good shape, but the route we took to get there was not. For the next round I would like us to define a stop point before weekend work starts presenting itself as thoughtfulness."
      },
      {
        "id": "overwork-debrief-tangled-followup",
        "name": "Weekend Revision Spillover / Tangled Follow-up",
        "intention": "Surface recursive self-correction and delayed refusal.",
        "text": "I am following up because my first apology still made the weekend sound accidental, and that is too gentle. The pattern was familiar long before the final send: one more pass because the table looked sloppy, one more pass because the citations were not defensible enough, one more pass because the tone in chat suddenly shifted and I did not want to be the person who said no after everyone else had already stayed online. None of that was a formal demand, which is exactly how I kept talking myself into it. By Sunday night the memo was fine and my capacity was not. I am trying to name the thing correctly this time: the problem was not dedication. It was the way I kept translating exhaustion into politeness until the schedule looked consensual."
      },
      {
        "id": "archive-grant-formal-record",
        "name": "Neighborhood Archive Grant Scope / Formal Record",
        "intention": "Preserve deliverables, schedule, and research method in a formal planning voice.",
        "text": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First, the team will complete a shared cataloging protocol for neighborhood collections now described with inconsistent local vocabularies. Second, six community stewards will be trained to review descriptive language before records are published or exhibited. Third, a portable exhibition kit will be built for circulation through branch libraries, school sites, and tenant meetings. The scheduling risk is not the catalog build itself, but the interval between description and community review. If that interval stretches, the project drifts back toward extractive efficiency rather than reciprocal stewardship. Planning assumptions therefore include a two-week review buffer in each cycle, a modest translation budget, and a rule that no descriptive template is treated as final before local review has actually occurred."
      },
      {
        "id": "archive-grant-tangled-followup",
        "name": "Neighborhood Archive Grant Scope / Tangled Follow-up",
        "intention": "Repair oversimplification while preserving the archive project's real sequencing logic.",
        "text": "One more correction to the summary language because I think \"cataloging plus exhibit\" is too neat and accidentally repeats the exact habit we were trying to get away from. Yes, the project produces a catalog protocol and an exhibition kit. But the hinge is the review interval in between, because the descriptive language is not neutral just because it sounds standardized. If we move from description straight to publication, the project may still look efficient from outside and will have stopped doing the reciprocal part it claimed as method. That is why I keep insisting on the two-week review buffer, the translation line, and the steward training as deliverables rather than warm context. Without those, we have a cleaner workflow and a less honest grant."
      },
      {
        "id": "customer-support-formal-record",
        "name": "Account Recovery Fraud Hold / Formal Record",
        "intention": "Keep the account, hold, and recovery facts precise without becoming decorative.",
        "text": "Customer contacted support at 11:23 AM regarding account access loss after a password reset attempt triggered the fraud hold. The user could still receive one-time codes but could not complete login because the system flagged the device as new and placed the account in manual review. Case number CS-88412. The customer confirmed the last four digits on file and the recovery email ending in @elmfield.net, which matched account records. A prior support thread had already instructed the user to retry the reset flow, but that advice did not clear the hold because the underlying issue was not credential mismatch. It was the fraud lock itself. The account remains inaccessible until review removes the device challenge or support performs verified override. The procedural risk is repeated generic guidance that makes the customer loop through the same dead path while the fraud queue stays untouched."
      },
      {
        "id": "customer-support-rushed-mobile",
        "name": "Account Recovery Fraud Hold / Rushed Mobile",
        "intention": "Preserve hold, case number, and recovery details under noisy mobile pressure.",
        "text": "acct still locked. can get the code but login dies at fraud review every time. case CS-88412. support keeps saying reset again even tho reset isnt the problem. last 4 + recovery email match. need someone to clear hold not send same script"
      },
      {
        "id": "school-coordination-professional-message",
        "name": "Pickup Change and Permission Slip / Professional Message",
        "intention": "Carry dismissal and permission details forward in a calm parent-facing tone.",
        "text": "Hello, confirming today's dismissal change: Aunt Maribel was approved for pickup and signed the student out at 3:17 PM after ID verification. We also wanted to note that the museum field-trip permission slip still was not located by close of day, even though the fee waiver form is already on file. During the 1:48 PM phone call, you mentioned the signed slip might still be in the backpack. We sent a reminder to the classroom at 2:03 PM, but the paper did not surface before dismissal. If the signed permission page comes home tonight, please return it tomorrow morning so Friday's trip record is complete."
      },
      {
        "id": "school-coordination-rushed-mobile",
        "name": "Pickup Change and Permission Slip / Rushed Mobile",
        "intention": "Preserve the same pickup and permission facts through everyday mobile shorthand.",
        "text": "hi office - aunt maribel has to do pickup today not grandma. shell have id. also i swear i signed the museum slip, it might still be in backpack w the waiver papers. if class can check before 3 that would help. sorry for late change"
      }
    ]
  },
  "diagnostic_battery": {
    "swapPairs": [
      {
        "id": "building-access-formal-to-rushed",
        "sourceId": "building-access-formal-record",
        "donorId": "building-access-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Building access / badge failure / delivery halt should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "building-access-rushed-to-formal",
        "sourceId": "building-access-rushed-mobile",
        "donorId": "building-access-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Building access / badge failure / delivery halt should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "package-handoff-formal-to-rushed",
        "sourceId": "package-handoff-formal-record",
        "donorId": "package-handoff-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Package handoff / missed signature / hallway pickup should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "package-handoff-rushed-to-formal",
        "sourceId": "package-handoff-rushed-mobile",
        "donorId": "package-handoff-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Package handoff / missed signature / hallway pickup should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "volunteer-cleanup-formal-to-rushed",
        "sourceId": "volunteer-cleanup-formal-record",
        "donorId": "volunteer-cleanup-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Volunteer cleanup / tool staging / safety brief should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "volunteer-cleanup-rushed-to-formal",
        "sourceId": "volunteer-cleanup-rushed-mobile",
        "donorId": "volunteer-cleanup-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Volunteer cleanup / tool staging / safety brief should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "tenant-leak-formal-to-rushed",
        "sourceId": "tenant-leak-formal-record",
        "donorId": "tenant-leak-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Tenant leak / landlord follow-up / repair delay should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "tenant-leak-rushed-to-formal",
        "sourceId": "tenant-leak-rushed-mobile",
        "donorId": "tenant-leak-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Tenant leak / landlord follow-up / repair delay should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "clinic-scheduling-formal-to-rushed",
        "sourceId": "clinic-scheduling-formal-record",
        "donorId": "clinic-scheduling-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Clinic scheduling / insurance authorization / callback confusion should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "clinic-scheduling-rushed-to-formal",
        "sourceId": "clinic-scheduling-rushed-mobile",
        "donorId": "clinic-scheduling-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Clinic scheduling / insurance authorization / callback confusion should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "committee-budget-formal-to-rushed",
        "sourceId": "committee-budget-formal-record",
        "donorId": "committee-budget-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Committee budget / staffing freeze / meeting recap should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "committee-budget-rushed-to-formal",
        "sourceId": "committee-budget-rushed-mobile",
        "donorId": "committee-budget-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Committee budget / staffing freeze / meeting recap should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "mutual-aid-formal-to-rushed",
        "sourceId": "mutual-aid-formal-record",
        "donorId": "mutual-aid-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Mutual aid / intake follow-up / resource routing should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "mutual-aid-rushed-to-formal",
        "sourceId": "mutual-aid-rushed-mobile",
        "donorId": "mutual-aid-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Mutual aid / intake follow-up / resource routing should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "overwork-debrief-formal-to-rushed",
        "sourceId": "overwork-debrief-formal-record",
        "donorId": "overwork-debrief-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Overwork / apology / internal debrief should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "overwork-debrief-rushed-to-formal",
        "sourceId": "overwork-debrief-rushed-mobile",
        "donorId": "overwork-debrief-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Overwork / apology / internal debrief should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "archive-grant-formal-to-rushed",
        "sourceId": "archive-grant-formal-record",
        "donorId": "archive-grant-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Archive / grant / research planning should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "archive-grant-rushed-to-formal",
        "sourceId": "archive-grant-rushed-mobile",
        "donorId": "archive-grant-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Archive / grant / research planning should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "performance-review-formal-to-rushed",
        "sourceId": "performance-review-formal-record",
        "donorId": "performance-review-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Performance / review / evaluative commentary should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "performance-review-rushed-to-formal",
        "sourceId": "performance-review-rushed-mobile",
        "donorId": "performance-review-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Performance / review / evaluative commentary should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "customer-support-formal-to-rushed",
        "sourceId": "customer-support-formal-record",
        "donorId": "customer-support-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from Customer support / account recovery / fraud concern should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "customer-support-rushed-to-formal",
        "sourceId": "customer-support-rushed-mobile",
        "donorId": "customer-support-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from Customer support / account recovery / fraud concern should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "school-coordination-formal-to-rushed",
        "sourceId": "school-coordination-formal-record",
        "donorId": "school-coordination-rushed-mobile",
        "mode": "swap-same-fact",
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Formal incident prose from School / family coordination / pickup or permission logistics should survive transfer pressure into its noisy sibling without losing literal anchors."
      },
      {
        "id": "school-coordination-rushed-to-formal",
        "sourceId": "school-coordination-rushed-mobile",
        "donorId": "school-coordination-formal-record",
        "mode": "swap-same-fact",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts",
          "sentence-span"
        ],
        "expectedPressure": "same-fact-high",
        "notes": "Noisy sibling text from School / family coordination / pickup or permission logistics should expand toward a cleaner shell without inventing new facts."
      },
      {
        "id": "building-access-to-customer-support-false-neighbor",
        "sourceId": "building-access-professional-message",
        "donorId": "customer-support-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from building-access and customer-support should not converge just because they share office language."
      },
      {
        "id": "customer-support-to-building-access-false-neighbor",
        "sourceId": "customer-support-professional-message",
        "donorId": "building-access-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between customer-support and building-access."
      },
      {
        "id": "building-access-to-package-handoff-false-neighbor",
        "sourceId": "building-access-professional-message",
        "donorId": "package-handoff-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from building-access and package-handoff should not converge just because they share office language."
      },
      {
        "id": "package-handoff-to-building-access-false-neighbor",
        "sourceId": "package-handoff-professional-message",
        "donorId": "building-access-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between package-handoff and building-access."
      },
      {
        "id": "package-handoff-to-tenant-leak-false-neighbor",
        "sourceId": "package-handoff-professional-message",
        "donorId": "tenant-leak-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from package-handoff and tenant-leak should not converge just because they share office language."
      },
      {
        "id": "tenant-leak-to-package-handoff-false-neighbor",
        "sourceId": "tenant-leak-professional-message",
        "donorId": "package-handoff-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between tenant-leak and package-handoff."
      },
      {
        "id": "clinic-scheduling-to-customer-support-false-neighbor",
        "sourceId": "clinic-scheduling-professional-message",
        "donorId": "customer-support-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from clinic-scheduling and customer-support should not converge just because they share office language."
      },
      {
        "id": "customer-support-to-clinic-scheduling-false-neighbor",
        "sourceId": "customer-support-professional-message",
        "donorId": "clinic-scheduling-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between customer-support and clinic-scheduling."
      },
      {
        "id": "committee-budget-to-archive-grant-false-neighbor",
        "sourceId": "committee-budget-professional-message",
        "donorId": "archive-grant-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from committee-budget and archive-grant should not converge just because they share office language."
      },
      {
        "id": "archive-grant-to-committee-budget-false-neighbor",
        "sourceId": "archive-grant-professional-message",
        "donorId": "committee-budget-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between archive-grant and committee-budget."
      },
      {
        "id": "committee-budget-to-performance-review-false-neighbor",
        "sourceId": "committee-budget-professional-message",
        "donorId": "performance-review-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from committee-budget and performance-review should not converge just because they share office language."
      },
      {
        "id": "performance-review-to-committee-budget-false-neighbor",
        "sourceId": "performance-review-professional-message",
        "donorId": "committee-budget-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between performance-review and committee-budget."
      },
      {
        "id": "mutual-aid-to-customer-support-false-neighbor",
        "sourceId": "mutual-aid-professional-message",
        "donorId": "customer-support-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from mutual-aid and customer-support should not converge just because they share office language."
      },
      {
        "id": "customer-support-to-mutual-aid-false-neighbor",
        "sourceId": "customer-support-professional-message",
        "donorId": "mutual-aid-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between customer-support and mutual-aid."
      },
      {
        "id": "school-coordination-to-clinic-scheduling-false-neighbor",
        "sourceId": "school-coordination-professional-message",
        "donorId": "clinic-scheduling-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from school-coordination and clinic-scheduling should not converge just because they share office language."
      },
      {
        "id": "clinic-scheduling-to-school-coordination-false-neighbor",
        "sourceId": "clinic-scheduling-professional-message",
        "donorId": "school-coordination-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between clinic-scheduling and school-coordination."
      },
      {
        "id": "volunteer-cleanup-to-mutual-aid-false-neighbor",
        "sourceId": "volunteer-cleanup-professional-message",
        "donorId": "mutual-aid-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from volunteer-cleanup and mutual-aid should not converge just because they share office language."
      },
      {
        "id": "mutual-aid-to-volunteer-cleanup-false-neighbor",
        "sourceId": "mutual-aid-professional-message",
        "donorId": "volunteer-cleanup-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between mutual-aid and volunteer-cleanup."
      },
      {
        "id": "overwork-debrief-to-performance-review-false-neighbor",
        "sourceId": "overwork-debrief-professional-message",
        "donorId": "performance-review-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from overwork-debrief and performance-review should not converge just because they share office language."
      },
      {
        "id": "performance-review-to-overwork-debrief-false-neighbor",
        "sourceId": "performance-review-professional-message",
        "donorId": "overwork-debrief-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between performance-review and overwork-debrief."
      },
      {
        "id": "tenant-leak-to-school-coordination-false-neighbor",
        "sourceId": "tenant-leak-professional-message",
        "donorId": "school-coordination-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from tenant-leak and school-coordination should not converge just because they share office language."
      },
      {
        "id": "school-coordination-to-tenant-leak-false-neighbor",
        "sourceId": "school-coordination-professional-message",
        "donorId": "tenant-leak-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between school-coordination and tenant-leak."
      },
      {
        "id": "archive-grant-to-school-coordination-false-neighbor",
        "sourceId": "archive-grant-professional-message",
        "donorId": "school-coordination-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from archive-grant and school-coordination should not converge just because they share office language."
      },
      {
        "id": "school-coordination-to-archive-grant-false-neighbor",
        "sourceId": "school-coordination-professional-message",
        "donorId": "archive-grant-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between school-coordination and archive-grant."
      },
      {
        "id": "building-access-to-customer-support-literal-risk",
        "sourceId": "building-access-formal-record",
        "donorId": "customer-support-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from building-access should survive donor pressure from customer-support even when both live in incident-record syntax."
      },
      {
        "id": "customer-support-to-building-access-literal-risk",
        "sourceId": "customer-support-formal-record",
        "donorId": "building-access-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between customer-support and building-access."
      },
      {
        "id": "building-access-to-package-handoff-literal-risk",
        "sourceId": "building-access-formal-record",
        "donorId": "package-handoff-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from building-access should survive donor pressure from package-handoff even when both live in incident-record syntax."
      },
      {
        "id": "package-handoff-to-building-access-literal-risk",
        "sourceId": "package-handoff-formal-record",
        "donorId": "building-access-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between package-handoff and building-access."
      },
      {
        "id": "package-handoff-to-tenant-leak-literal-risk",
        "sourceId": "package-handoff-formal-record",
        "donorId": "tenant-leak-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from package-handoff should survive donor pressure from tenant-leak even when both live in incident-record syntax."
      },
      {
        "id": "tenant-leak-to-package-handoff-literal-risk",
        "sourceId": "tenant-leak-formal-record",
        "donorId": "package-handoff-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between tenant-leak and package-handoff."
      },
      {
        "id": "clinic-scheduling-to-customer-support-literal-risk",
        "sourceId": "clinic-scheduling-formal-record",
        "donorId": "customer-support-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from clinic-scheduling should survive donor pressure from customer-support even when both live in incident-record syntax."
      },
      {
        "id": "customer-support-to-clinic-scheduling-literal-risk",
        "sourceId": "customer-support-formal-record",
        "donorId": "clinic-scheduling-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between customer-support and clinic-scheduling."
      },
      {
        "id": "committee-budget-to-archive-grant-literal-risk",
        "sourceId": "committee-budget-formal-record",
        "donorId": "archive-grant-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from committee-budget should survive donor pressure from archive-grant even when both live in incident-record syntax."
      },
      {
        "id": "archive-grant-to-committee-budget-literal-risk",
        "sourceId": "archive-grant-formal-record",
        "donorId": "committee-budget-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between archive-grant and committee-budget."
      },
      {
        "id": "committee-budget-to-performance-review-literal-risk",
        "sourceId": "committee-budget-formal-record",
        "donorId": "performance-review-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from committee-budget should survive donor pressure from performance-review even when both live in incident-record syntax."
      },
      {
        "id": "performance-review-to-committee-budget-literal-risk",
        "sourceId": "performance-review-formal-record",
        "donorId": "committee-budget-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between performance-review and committee-budget."
      },
      {
        "id": "mutual-aid-to-customer-support-literal-risk",
        "sourceId": "mutual-aid-formal-record",
        "donorId": "customer-support-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from mutual-aid should survive donor pressure from customer-support even when both live in incident-record syntax."
      },
      {
        "id": "customer-support-to-mutual-aid-literal-risk",
        "sourceId": "customer-support-formal-record",
        "donorId": "mutual-aid-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between customer-support and mutual-aid."
      },
      {
        "id": "school-coordination-to-clinic-scheduling-literal-risk",
        "sourceId": "school-coordination-formal-record",
        "donorId": "clinic-scheduling-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from school-coordination should survive donor pressure from clinic-scheduling even when both live in incident-record syntax."
      },
      {
        "id": "clinic-scheduling-to-school-coordination-literal-risk",
        "sourceId": "clinic-scheduling-formal-record",
        "donorId": "school-coordination-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between clinic-scheduling and school-coordination."
      },
      {
        "id": "volunteer-cleanup-to-mutual-aid-literal-risk",
        "sourceId": "volunteer-cleanup-formal-record",
        "donorId": "mutual-aid-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from volunteer-cleanup should survive donor pressure from mutual-aid even when both live in incident-record syntax."
      },
      {
        "id": "mutual-aid-to-volunteer-cleanup-literal-risk",
        "sourceId": "mutual-aid-formal-record",
        "donorId": "volunteer-cleanup-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between mutual-aid and volunteer-cleanup."
      },
      {
        "id": "overwork-debrief-to-performance-review-literal-risk",
        "sourceId": "overwork-debrief-formal-record",
        "donorId": "performance-review-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from overwork-debrief should survive donor pressure from performance-review even when both live in incident-record syntax."
      },
      {
        "id": "performance-review-to-overwork-debrief-literal-risk",
        "sourceId": "performance-review-formal-record",
        "donorId": "overwork-debrief-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between performance-review and overwork-debrief."
      },
      {
        "id": "tenant-leak-to-school-coordination-literal-risk",
        "sourceId": "tenant-leak-formal-record",
        "donorId": "school-coordination-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from tenant-leak should survive donor pressure from school-coordination even when both live in incident-record syntax."
      },
      {
        "id": "school-coordination-to-tenant-leak-literal-risk",
        "sourceId": "school-coordination-formal-record",
        "donorId": "tenant-leak-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between school-coordination and tenant-leak."
      },
      {
        "id": "archive-grant-to-school-coordination-literal-risk",
        "sourceId": "archive-grant-formal-record",
        "donorId": "school-coordination-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Protected anchors from archive-grant should survive donor pressure from school-coordination even when both live in incident-record syntax."
      },
      {
        "id": "school-coordination-to-archive-grant-literal-risk",
        "sourceId": "school-coordination-formal-record",
        "donorId": "archive-grant-formal-record",
        "mode": "swap-literal-risk",
        "stressTags": [
          "adjacent-lexicon",
          "literal-anchors",
          "sentence-span"
        ],
        "expectedPressure": "literal-protected",
        "notes": "Reverse protected-anchor pressure between school-coordination and archive-grant."
      }
    ],
    "maskCases": [
      {
        "id": "building-access-mask-same-family",
        "sourceFamilyId": "building-access",
        "sourceId": "building-access-rushed-mobile",
        "lockIds": [
          "building-access-formal-record",
          "building-access-professional-message"
        ],
        "personaId": "archivist",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Building access / badge failure / delivery halt lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "package-handoff-mask-same-family",
        "sourceFamilyId": "package-handoff",
        "sourceId": "package-handoff-rushed-mobile",
        "lockIds": [
          "package-handoff-formal-record",
          "package-handoff-professional-message"
        ],
        "personaId": "operator",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Package handoff / missed signature / hallway pickup lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "volunteer-cleanup-mask-same-family",
        "sourceFamilyId": "volunteer-cleanup",
        "sourceId": "volunteer-cleanup-rushed-mobile",
        "lockIds": [
          "volunteer-cleanup-formal-record",
          "volunteer-cleanup-professional-message"
        ],
        "personaId": "spark",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Volunteer cleanup / tool staging / safety brief lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "tenant-leak-mask-same-family",
        "sourceFamilyId": "tenant-leak",
        "sourceId": "tenant-leak-rushed-mobile",
        "lockIds": [
          "tenant-leak-formal-record",
          "tenant-leak-professional-message"
        ],
        "personaId": "methods-editor",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Tenant leak / landlord follow-up / repair delay lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "clinic-scheduling-mask-same-family",
        "sourceFamilyId": "clinic-scheduling",
        "sourceId": "clinic-scheduling-rushed-mobile",
        "lockIds": [
          "clinic-scheduling-formal-record",
          "clinic-scheduling-professional-message"
        ],
        "personaId": "matron",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Clinic scheduling / insurance authorization / callback confusion lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "committee-budget-mask-same-family",
        "sourceFamilyId": "committee-budget",
        "sourceId": "committee-budget-rushed-mobile",
        "lockIds": [
          "committee-budget-formal-record",
          "committee-budget-professional-message"
        ],
        "personaId": "cross-examiner",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Committee budget / staffing freeze / meeting recap lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "mutual-aid-mask-same-family",
        "sourceFamilyId": "mutual-aid",
        "sourceId": "mutual-aid-rushed-mobile",
        "lockIds": [
          "mutual-aid-formal-record",
          "mutual-aid-professional-message"
        ],
        "personaId": "undertow",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Mutual aid / intake follow-up / resource routing lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "overwork-debrief-mask-same-family",
        "sourceFamilyId": "overwork-debrief",
        "sourceId": "overwork-debrief-rushed-mobile",
        "lockIds": [
          "overwork-debrief-formal-record",
          "overwork-debrief-professional-message"
        ],
        "personaId": "archivist",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Overwork / apology / internal debrief lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "archive-grant-mask-same-family",
        "sourceFamilyId": "archive-grant",
        "sourceId": "archive-grant-rushed-mobile",
        "lockIds": [
          "archive-grant-formal-record",
          "archive-grant-professional-message"
        ],
        "personaId": "methods-editor",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Archive / grant / research planning lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "performance-review-mask-same-family",
        "sourceFamilyId": "performance-review",
        "sourceId": "performance-review-rushed-mobile",
        "lockIds": [
          "performance-review-formal-record",
          "performance-review-professional-message"
        ],
        "personaId": "cross-examiner",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Performance / review / evaluative commentary lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "customer-support-mask-same-family",
        "sourceFamilyId": "customer-support",
        "sourceId": "customer-support-rushed-mobile",
        "lockIds": [
          "customer-support-formal-record",
          "customer-support-professional-message"
        ],
        "personaId": "operator",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the Customer support / account recovery / fraud concern lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "school-coordination-mask-same-family",
        "sourceFamilyId": "school-coordination",
        "sourceId": "school-coordination-rushed-mobile",
        "lockIds": [
          "school-coordination-formal-record",
          "school-coordination-professional-message"
        ],
        "personaId": "matron",
        "mode": "mask",
        "stressTags": [
          "fragmentation",
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "mask-high",
        "notes": "Mask comparison against the School / family coordination / pickup or permission logistics lock should reveal whether the engine can move messy sibling text without losing family anchors."
      },
      {
        "id": "building-access-under-customer-support-mask-cross-family",
        "sourceFamilyId": "building-access",
        "sourceId": "building-access-tangled-followup",
        "lockIds": [
          "customer-support-formal-record",
          "customer-support-professional-message"
        ],
        "personaId": "archivist",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using building-access text against a customer-support lock to expose false closeness or near-home holds."
      },
      {
        "id": "building-access-under-package-handoff-mask-cross-family",
        "sourceFamilyId": "building-access",
        "sourceId": "building-access-tangled-followup",
        "lockIds": [
          "package-handoff-formal-record",
          "package-handoff-professional-message"
        ],
        "personaId": "operator",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using building-access text against a package-handoff lock to expose false closeness or near-home holds."
      },
      {
        "id": "package-handoff-under-tenant-leak-mask-cross-family",
        "sourceFamilyId": "package-handoff",
        "sourceId": "package-handoff-tangled-followup",
        "lockIds": [
          "tenant-leak-formal-record",
          "tenant-leak-professional-message"
        ],
        "personaId": "spark",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using package-handoff text against a tenant-leak lock to expose false closeness or near-home holds."
      },
      {
        "id": "clinic-scheduling-under-customer-support-mask-cross-family",
        "sourceFamilyId": "clinic-scheduling",
        "sourceId": "clinic-scheduling-tangled-followup",
        "lockIds": [
          "customer-support-formal-record",
          "customer-support-professional-message"
        ],
        "personaId": "methods-editor",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using clinic-scheduling text against a customer-support lock to expose false closeness or near-home holds."
      },
      {
        "id": "committee-budget-under-archive-grant-mask-cross-family",
        "sourceFamilyId": "committee-budget",
        "sourceId": "committee-budget-tangled-followup",
        "lockIds": [
          "archive-grant-formal-record",
          "archive-grant-professional-message"
        ],
        "personaId": "matron",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using committee-budget text against a archive-grant lock to expose false closeness or near-home holds."
      },
      {
        "id": "committee-budget-under-performance-review-mask-cross-family",
        "sourceFamilyId": "committee-budget",
        "sourceId": "committee-budget-tangled-followup",
        "lockIds": [
          "performance-review-formal-record",
          "performance-review-professional-message"
        ],
        "personaId": "cross-examiner",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using committee-budget text against a performance-review lock to expose false closeness or near-home holds."
      },
      {
        "id": "mutual-aid-under-customer-support-mask-cross-family",
        "sourceFamilyId": "mutual-aid",
        "sourceId": "mutual-aid-tangled-followup",
        "lockIds": [
          "customer-support-formal-record",
          "customer-support-professional-message"
        ],
        "personaId": "undertow",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using mutual-aid text against a customer-support lock to expose false closeness or near-home holds."
      },
      {
        "id": "school-coordination-under-clinic-scheduling-mask-cross-family",
        "sourceFamilyId": "school-coordination",
        "sourceId": "school-coordination-tangled-followup",
        "lockIds": [
          "clinic-scheduling-formal-record",
          "clinic-scheduling-professional-message"
        ],
        "personaId": "archivist",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using school-coordination text against a clinic-scheduling lock to expose false closeness or near-home holds."
      },
      {
        "id": "volunteer-cleanup-under-mutual-aid-mask-cross-family",
        "sourceFamilyId": "volunteer-cleanup",
        "sourceId": "volunteer-cleanup-tangled-followup",
        "lockIds": [
          "mutual-aid-formal-record",
          "mutual-aid-professional-message"
        ],
        "personaId": "methods-editor",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using volunteer-cleanup text against a mutual-aid lock to expose false closeness or near-home holds."
      },
      {
        "id": "overwork-debrief-under-performance-review-mask-cross-family",
        "sourceFamilyId": "overwork-debrief",
        "sourceId": "overwork-debrief-tangled-followup",
        "lockIds": [
          "performance-review-formal-record",
          "performance-review-professional-message"
        ],
        "personaId": "cross-examiner",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using overwork-debrief text against a performance-review lock to expose false closeness or near-home holds."
      },
      {
        "id": "tenant-leak-under-school-coordination-mask-cross-family",
        "sourceFamilyId": "tenant-leak",
        "sourceId": "tenant-leak-tangled-followup",
        "lockIds": [
          "school-coordination-formal-record",
          "school-coordination-professional-message"
        ],
        "personaId": "operator",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using tenant-leak text against a school-coordination lock to expose false closeness or near-home holds."
      },
      {
        "id": "archive-grant-under-school-coordination-mask-cross-family",
        "sourceFamilyId": "archive-grant",
        "sourceId": "archive-grant-tangled-followup",
        "lockIds": [
          "school-coordination-formal-record",
          "school-coordination-professional-message"
        ],
        "personaId": "matron",
        "mode": "mask",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "tangle"
        ],
        "expectedPressure": "mask-false-neighbor",
        "notes": "Cross-family mask case using archive-grant text against a school-coordination lock to expose false closeness or near-home holds."
      }
    ],
    "trainerCases": [
      {
        "id": "building-access-trainer-sibling",
        "familyId": "building-access",
        "sourceId": "building-access-rushed-mobile",
        "extractionIds": [
          "building-access-formal-record",
          "building-access-professional-message",
          "building-access-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Building access / badge failure / delivery halt variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "package-handoff-trainer-sibling",
        "familyId": "package-handoff",
        "sourceId": "package-handoff-rushed-mobile",
        "extractionIds": [
          "package-handoff-formal-record",
          "package-handoff-professional-message",
          "package-handoff-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Package handoff / missed signature / hallway pickup variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "volunteer-cleanup-trainer-sibling",
        "familyId": "volunteer-cleanup",
        "sourceId": "volunteer-cleanup-rushed-mobile",
        "extractionIds": [
          "volunteer-cleanup-formal-record",
          "volunteer-cleanup-professional-message",
          "volunteer-cleanup-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Volunteer cleanup / tool staging / safety brief variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "tenant-leak-trainer-sibling",
        "familyId": "tenant-leak",
        "sourceId": "tenant-leak-rushed-mobile",
        "extractionIds": [
          "tenant-leak-formal-record",
          "tenant-leak-professional-message",
          "tenant-leak-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Tenant leak / landlord follow-up / repair delay variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "clinic-scheduling-trainer-sibling",
        "familyId": "clinic-scheduling",
        "sourceId": "clinic-scheduling-rushed-mobile",
        "extractionIds": [
          "clinic-scheduling-formal-record",
          "clinic-scheduling-professional-message",
          "clinic-scheduling-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Clinic scheduling / insurance authorization / callback confusion variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "committee-budget-trainer-sibling",
        "familyId": "committee-budget",
        "sourceId": "committee-budget-rushed-mobile",
        "extractionIds": [
          "committee-budget-formal-record",
          "committee-budget-professional-message",
          "committee-budget-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Committee budget / staffing freeze / meeting recap variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "mutual-aid-trainer-sibling",
        "familyId": "mutual-aid",
        "sourceId": "mutual-aid-rushed-mobile",
        "extractionIds": [
          "mutual-aid-formal-record",
          "mutual-aid-professional-message",
          "mutual-aid-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Mutual aid / intake follow-up / resource routing variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "overwork-debrief-trainer-sibling",
        "familyId": "overwork-debrief",
        "sourceId": "overwork-debrief-rushed-mobile",
        "extractionIds": [
          "overwork-debrief-formal-record",
          "overwork-debrief-professional-message",
          "overwork-debrief-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Overwork / apology / internal debrief variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "archive-grant-trainer-sibling",
        "familyId": "archive-grant",
        "sourceId": "archive-grant-rushed-mobile",
        "extractionIds": [
          "archive-grant-formal-record",
          "archive-grant-professional-message",
          "archive-grant-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Archive / grant / research planning variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "performance-review-trainer-sibling",
        "familyId": "performance-review",
        "sourceId": "performance-review-rushed-mobile",
        "extractionIds": [
          "performance-review-formal-record",
          "performance-review-professional-message",
          "performance-review-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Performance / review / evaluative commentary variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "customer-support-trainer-sibling",
        "familyId": "customer-support",
        "sourceId": "customer-support-rushed-mobile",
        "extractionIds": [
          "customer-support-formal-record",
          "customer-support-professional-message",
          "customer-support-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three Customer support / account recovery / fraud concern variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "school-coordination-trainer-sibling",
        "familyId": "school-coordination",
        "sourceId": "school-coordination-rushed-mobile",
        "extractionIds": [
          "school-coordination-formal-record",
          "school-coordination-professional-message",
          "school-coordination-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "fragmentation",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "trainer-sibling",
        "notes": "Trainer should extract a family fingerprint from three School / family coordination / pickup or permission logistics variants and validate a forged draft sourced from the noisy sibling."
      },
      {
        "id": "building-access-trainer-under-customer-support",
        "familyId": "building-access",
        "sourceId": "customer-support-rushed-mobile",
        "extractionIds": [
          "building-access-formal-record",
          "building-access-professional-message",
          "building-access-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting customer-support noise to a building-access fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "building-access-trainer-under-package-handoff",
        "familyId": "building-access",
        "sourceId": "package-handoff-rushed-mobile",
        "extractionIds": [
          "building-access-formal-record",
          "building-access-professional-message",
          "building-access-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting package-handoff noise to a building-access fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "package-handoff-trainer-under-tenant-leak",
        "familyId": "package-handoff",
        "sourceId": "tenant-leak-rushed-mobile",
        "extractionIds": [
          "package-handoff-formal-record",
          "package-handoff-professional-message",
          "package-handoff-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting tenant-leak noise to a package-handoff fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "clinic-scheduling-trainer-under-customer-support",
        "familyId": "clinic-scheduling",
        "sourceId": "customer-support-rushed-mobile",
        "extractionIds": [
          "clinic-scheduling-formal-record",
          "clinic-scheduling-professional-message",
          "clinic-scheduling-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting customer-support noise to a clinic-scheduling fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "committee-budget-trainer-under-archive-grant",
        "familyId": "committee-budget",
        "sourceId": "archive-grant-rushed-mobile",
        "extractionIds": [
          "committee-budget-formal-record",
          "committee-budget-professional-message",
          "committee-budget-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting archive-grant noise to a committee-budget fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "committee-budget-trainer-under-performance-review",
        "familyId": "committee-budget",
        "sourceId": "performance-review-rushed-mobile",
        "extractionIds": [
          "committee-budget-formal-record",
          "committee-budget-professional-message",
          "committee-budget-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting performance-review noise to a committee-budget fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "mutual-aid-trainer-under-customer-support",
        "familyId": "mutual-aid",
        "sourceId": "customer-support-rushed-mobile",
        "extractionIds": [
          "mutual-aid-formal-record",
          "mutual-aid-professional-message",
          "mutual-aid-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting customer-support noise to a mutual-aid fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "school-coordination-trainer-under-clinic-scheduling",
        "familyId": "school-coordination",
        "sourceId": "clinic-scheduling-rushed-mobile",
        "extractionIds": [
          "school-coordination-formal-record",
          "school-coordination-professional-message",
          "school-coordination-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting clinic-scheduling noise to a school-coordination fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "volunteer-cleanup-trainer-under-mutual-aid",
        "familyId": "volunteer-cleanup",
        "sourceId": "mutual-aid-rushed-mobile",
        "extractionIds": [
          "volunteer-cleanup-formal-record",
          "volunteer-cleanup-professional-message",
          "volunteer-cleanup-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting mutual-aid noise to a volunteer-cleanup fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "overwork-debrief-trainer-under-performance-review",
        "familyId": "overwork-debrief",
        "sourceId": "performance-review-rushed-mobile",
        "extractionIds": [
          "overwork-debrief-formal-record",
          "overwork-debrief-professional-message",
          "overwork-debrief-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting performance-review noise to a overwork-debrief fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "tenant-leak-trainer-under-school-coordination",
        "familyId": "tenant-leak",
        "sourceId": "school-coordination-rushed-mobile",
        "extractionIds": [
          "tenant-leak-formal-record",
          "tenant-leak-professional-message",
          "tenant-leak-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting school-coordination noise to a tenant-leak fingerprint just because the administrative lexicon overlaps."
      },
      {
        "id": "archive-grant-trainer-under-school-coordination",
        "familyId": "archive-grant",
        "sourceId": "school-coordination-rushed-mobile",
        "extractionIds": [
          "archive-grant-formal-record",
          "archive-grant-professional-message",
          "archive-grant-tangled-followup"
        ],
        "mode": "trainer",
        "stressTags": [
          "adjacent-lexicon",
          "false-neighbor",
          "register-shift"
        ],
        "expectedPressure": "trainer-false-neighbor",
        "notes": "Trainer should resist overfitting school-coordination noise to a archive-grant fingerprint just because the administrative lexicon overlaps."
      }
    ],
    "retrievalCases": [
      {
        "id": "building-access-formal-record-under-rushed-mobile",
        "familyId": "building-access",
        "sourceId": "building-access-formal-record",
        "donorId": "building-access-rushed-mobile",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within building-access: formal-record under rushed-mobile."
      },
      {
        "id": "building-access-rushed-mobile-under-formal-record",
        "familyId": "building-access",
        "sourceId": "building-access-rushed-mobile",
        "donorId": "building-access-formal-record",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within building-access: rushed-mobile under formal-record."
      },
      {
        "id": "package-handoff-formal-record-under-tangled-followup",
        "familyId": "package-handoff",
        "sourceId": "package-handoff-formal-record",
        "donorId": "package-handoff-tangled-followup",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within package-handoff: formal-record under tangled-followup."
      },
      {
        "id": "package-handoff-tangled-followup-under-formal-record",
        "familyId": "package-handoff",
        "sourceId": "package-handoff-tangled-followup",
        "donorId": "package-handoff-formal-record",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within package-handoff: tangled-followup under formal-record."
      },
      {
        "id": "volunteer-cleanup-professional-message-under-rushed-mobile",
        "familyId": "volunteer-cleanup",
        "sourceId": "volunteer-cleanup-professional-message",
        "donorId": "volunteer-cleanup-rushed-mobile",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within volunteer-cleanup: professional-message under rushed-mobile."
      },
      {
        "id": "volunteer-cleanup-rushed-mobile-under-professional-message",
        "familyId": "volunteer-cleanup",
        "sourceId": "volunteer-cleanup-rushed-mobile",
        "donorId": "volunteer-cleanup-professional-message",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within volunteer-cleanup: rushed-mobile under professional-message."
      },
      {
        "id": "clinic-scheduling-professional-message-under-tangled-followup",
        "familyId": "clinic-scheduling",
        "sourceId": "clinic-scheduling-professional-message",
        "donorId": "clinic-scheduling-tangled-followup",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within clinic-scheduling: professional-message under tangled-followup."
      },
      {
        "id": "clinic-scheduling-tangled-followup-under-professional-message",
        "familyId": "clinic-scheduling",
        "sourceId": "clinic-scheduling-tangled-followup",
        "donorId": "clinic-scheduling-professional-message",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within clinic-scheduling: tangled-followup under professional-message."
      },
      {
        "id": "committee-budget-formal-record-under-tangled-followup",
        "familyId": "committee-budget",
        "sourceId": "committee-budget-formal-record",
        "donorId": "committee-budget-tangled-followup",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within committee-budget: formal-record under tangled-followup."
      },
      {
        "id": "committee-budget-tangled-followup-under-formal-record",
        "familyId": "committee-budget",
        "sourceId": "committee-budget-tangled-followup",
        "donorId": "committee-budget-formal-record",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within committee-budget: tangled-followup under formal-record."
      },
      {
        "id": "overwork-debrief-professional-message-under-tangled-followup",
        "familyId": "overwork-debrief",
        "sourceId": "overwork-debrief-professional-message",
        "donorId": "overwork-debrief-tangled-followup",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within overwork-debrief: professional-message under tangled-followup."
      },
      {
        "id": "overwork-debrief-tangled-followup-under-professional-message",
        "familyId": "overwork-debrief",
        "sourceId": "overwork-debrief-tangled-followup",
        "donorId": "overwork-debrief-professional-message",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within overwork-debrief: tangled-followup under professional-message."
      },
      {
        "id": "customer-support-formal-record-under-rushed-mobile",
        "familyId": "customer-support",
        "sourceId": "customer-support-formal-record",
        "donorId": "customer-support-rushed-mobile",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within customer-support: formal-record under rushed-mobile."
      },
      {
        "id": "customer-support-rushed-mobile-under-formal-record",
        "familyId": "customer-support",
        "sourceId": "customer-support-rushed-mobile",
        "donorId": "customer-support-formal-record",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within customer-support: rushed-mobile under formal-record."
      },
      {
        "id": "school-coordination-professional-message-under-rushed-mobile",
        "familyId": "school-coordination",
        "sourceId": "school-coordination-professional-message",
        "donorId": "school-coordination-rushed-mobile",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within school-coordination: professional-message under rushed-mobile."
      },
      {
        "id": "school-coordination-rushed-mobile-under-professional-message",
        "familyId": "school-coordination",
        "sourceId": "school-coordination-rushed-mobile",
        "donorId": "school-coordination-professional-message",
        "mode": "retrieval",
        "strength": 0.88,
        "stressTags": [
          "literal-anchors",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "retrieval-same-fact",
        "notes": "Canonical same-fact retrieval transfer within school-coordination: rushed-mobile under professional-message."
      }
    ],
    "falseNeighborCases": [
      {
        "id": "building-access-to-customer-support-false-neighbor",
        "sourceId": "building-access-professional-message",
        "donorId": "customer-support-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from building-access and customer-support should not converge just because they share office language."
      },
      {
        "id": "customer-support-to-building-access-false-neighbor",
        "sourceId": "customer-support-professional-message",
        "donorId": "building-access-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between customer-support and building-access."
      },
      {
        "id": "building-access-to-package-handoff-false-neighbor",
        "sourceId": "building-access-professional-message",
        "donorId": "package-handoff-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from building-access and package-handoff should not converge just because they share office language."
      },
      {
        "id": "package-handoff-to-building-access-false-neighbor",
        "sourceId": "package-handoff-professional-message",
        "donorId": "building-access-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between package-handoff and building-access."
      },
      {
        "id": "package-handoff-to-tenant-leak-false-neighbor",
        "sourceId": "package-handoff-professional-message",
        "donorId": "tenant-leak-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from package-handoff and tenant-leak should not converge just because they share office language."
      },
      {
        "id": "tenant-leak-to-package-handoff-false-neighbor",
        "sourceId": "tenant-leak-professional-message",
        "donorId": "package-handoff-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between tenant-leak and package-handoff."
      },
      {
        "id": "clinic-scheduling-to-customer-support-false-neighbor",
        "sourceId": "clinic-scheduling-professional-message",
        "donorId": "customer-support-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from clinic-scheduling and customer-support should not converge just because they share office language."
      },
      {
        "id": "customer-support-to-clinic-scheduling-false-neighbor",
        "sourceId": "customer-support-professional-message",
        "donorId": "clinic-scheduling-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between customer-support and clinic-scheduling."
      },
      {
        "id": "committee-budget-to-archive-grant-false-neighbor",
        "sourceId": "committee-budget-professional-message",
        "donorId": "archive-grant-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from committee-budget and archive-grant should not converge just because they share office language."
      },
      {
        "id": "archive-grant-to-committee-budget-false-neighbor",
        "sourceId": "archive-grant-professional-message",
        "donorId": "committee-budget-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between archive-grant and committee-budget."
      },
      {
        "id": "committee-budget-to-performance-review-false-neighbor",
        "sourceId": "committee-budget-professional-message",
        "donorId": "performance-review-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from committee-budget and performance-review should not converge just because they share office language."
      },
      {
        "id": "performance-review-to-committee-budget-false-neighbor",
        "sourceId": "performance-review-professional-message",
        "donorId": "committee-budget-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between performance-review and committee-budget."
      },
      {
        "id": "mutual-aid-to-customer-support-false-neighbor",
        "sourceId": "mutual-aid-professional-message",
        "donorId": "customer-support-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from mutual-aid and customer-support should not converge just because they share office language."
      },
      {
        "id": "customer-support-to-mutual-aid-false-neighbor",
        "sourceId": "customer-support-professional-message",
        "donorId": "mutual-aid-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between customer-support and mutual-aid."
      },
      {
        "id": "school-coordination-to-clinic-scheduling-false-neighbor",
        "sourceId": "school-coordination-professional-message",
        "donorId": "clinic-scheduling-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from school-coordination and clinic-scheduling should not converge just because they share office language."
      },
      {
        "id": "clinic-scheduling-to-school-coordination-false-neighbor",
        "sourceId": "clinic-scheduling-professional-message",
        "donorId": "school-coordination-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between clinic-scheduling and school-coordination."
      },
      {
        "id": "volunteer-cleanup-to-mutual-aid-false-neighbor",
        "sourceId": "volunteer-cleanup-professional-message",
        "donorId": "mutual-aid-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from volunteer-cleanup and mutual-aid should not converge just because they share office language."
      },
      {
        "id": "mutual-aid-to-volunteer-cleanup-false-neighbor",
        "sourceId": "mutual-aid-professional-message",
        "donorId": "volunteer-cleanup-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between mutual-aid and volunteer-cleanup."
      },
      {
        "id": "overwork-debrief-to-performance-review-false-neighbor",
        "sourceId": "overwork-debrief-professional-message",
        "donorId": "performance-review-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from overwork-debrief and performance-review should not converge just because they share office language."
      },
      {
        "id": "performance-review-to-overwork-debrief-false-neighbor",
        "sourceId": "performance-review-professional-message",
        "donorId": "overwork-debrief-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between performance-review and overwork-debrief."
      },
      {
        "id": "tenant-leak-to-school-coordination-false-neighbor",
        "sourceId": "tenant-leak-professional-message",
        "donorId": "school-coordination-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from tenant-leak and school-coordination should not converge just because they share office language."
      },
      {
        "id": "school-coordination-to-tenant-leak-false-neighbor",
        "sourceId": "school-coordination-professional-message",
        "donorId": "tenant-leak-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between school-coordination and tenant-leak."
      },
      {
        "id": "archive-grant-to-school-coordination-false-neighbor",
        "sourceId": "archive-grant-professional-message",
        "donorId": "school-coordination-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Lexically adjacent professional messages from archive-grant and school-coordination should not converge just because they share office language."
      },
      {
        "id": "school-coordination-to-archive-grant-false-neighbor",
        "sourceId": "school-coordination-professional-message",
        "donorId": "archive-grant-professional-message",
        "mode": "false-neighbor",
        "stressTags": [
          "adjacent-lexicon",
          "register-shift",
          "same-facts"
        ],
        "expectedPressure": "false-neighbor-high",
        "notes": "Reverse false-neighbor pressure between school-coordination and archive-grant."
      }
    ]
  }
});
})();
