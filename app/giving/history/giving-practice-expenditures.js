export const PRACTICE_EXPENDITURE_SCHEMA = 'td613.giving.practice-expenditures/v0.1';

export const PRACTICE_COMMITTEES = Object.freeze([
  { id: 'BBV-C001', name: 'King Neptune for King', candidate: 'King Neptune', office: 'King of Bikini Bottom' },
  { id: 'BBV-C002', name: 'Puff for Bikini Bottom School District #67', candidate: 'Mrs. Puff', office: 'Bikini Bottom School District #67' },
  { id: 'BBV-C003', name: 'Every Villain Is Lemons PAC', candidate: null, office: null },
  { id: 'BBV-C004', name: 'Sheldon Plankton for Bikini Bottom Campaign', candidate: 'Sheldon Plankton', office: 'Mayor of Bikini Bottom' },
  { id: 'BBV-C005', name: 'Larry Lobster for Mayor of Bikini Bottom', candidate: 'Larry Lobster', office: 'Mayor of Bikini Bottom' },
  { id: 'BBV-C006', name: 'Fishocratic Executive Committee', candidate: null, office: null },
  { id: 'BBV-C007', name: 'Friends of Aquaman PC', candidate: null, office: null },
  { id: 'BBV-C008', name: 'Krusty Krab Parking Expansion Referendum Committee', candidate: null, office: 'Parking expansion referendum' },
  { id: 'BBV-C009', name: 'Larry Lobster for Bikini Bottom Board of Public Health, Soil & Water District 2', candidate: 'Larry Lobster', office: 'Bikini Bottom Board of Public Health, Soil & Water District 2' },
  { id: 'BBV-C010', name: 'Aquaman for Bikini Bottom County Sheriff', candidate: 'Aquaman', office: 'Bikini Bottom County Sheriff' }
]);

// Four payees deliberately also occur in the contribution-side practice graph.
// The overlap belongs in the evidence ecology, not in each transaction label:
// learners discover that one name can occupy donor and payee roles without
// either role proving identity, wrongdoing, or transaction equivalence.
export const CROSS_LANE_PAYEES = Object.freeze([
  'Krusty Krab LLC',
  'Sandy Cheeks',
  'Squidward Q. Tentacles',
  'Eugene H. Krabs'
]);

const BLUEPRINTS = Object.freeze({
  'BBV-C001': [
    ['2024-01-19', 'Conch Street Print & Mail', 186500, 'Ballot mail and printing'],
    ['2024-02-12', 'Krusty Krab LLC', 92500, 'Volunteer event catering'],
    ['2024-03-08', 'Sandy Cheeks', 240000, 'Survey methodology consulting'],
    ['2024-04-02', 'Bikini Bottom Gazette', 315000, 'Print advertising']
  ],
  'BBV-C002': [
    ['2024-02-03', 'Mrs. Puff’s Boating School', 125000, 'Community room rental'],
    ['2024-02-17', 'Squidward Q. Tentacles', 87500, 'Event music services'],
    ['2024-03-10', 'Conch Street Print & Mail', 142000, 'Door literature printing'],
    ['2024-03-27', 'Krusty Krab LLC', 68500, 'Volunteer meal service']
  ],
  'BBV-C003': [
    ['2024-05-06', 'Chum Bucket Media Lab', 410000, 'Digital creative production'],
    ['2024-05-21', 'Sandy Cheeks', 325000, 'Polling data analysis'],
    ['2024-06-09', 'Krusty Krab LLC', 118000, 'Fundraising event catering'],
    ['2024-06-28', 'Bikini Bottom Gazette', 555000, 'Issue advertising']
  ],
  'BBV-C004': [
    ['2024-07-12', 'Chum Bucket Corp', 275000, 'Campaign office rent'],
    ['2024-07-24', 'Squidward Q. Tentacles', 95000, 'Audio production services'],
    ['2024-08-15', 'Conch Street Print & Mail', 198000, 'Voter contact printing'],
    ['2024-09-03', 'Sandy Cheeks', 360000, 'Survey and modeling services']
  ],
  'BBV-C005': [
    ['2024-08-02', 'Jellyfish Fields Events', 164000, 'Town hall venue and equipment'],
    ['2024-08-16', 'Krusty Krab LLC', 132500, 'Volunteer event catering'],
    ['2024-09-04', 'Sandy Cheeks', 285000, 'Public opinion research'],
    ['2024-09-19', 'Bikini Bottom Gazette', 475000, 'Local advertising']
  ],
  'BBV-C006': [
    ['2024-10-05', 'Conch Street Print & Mail', 225000, 'Party mail program'],
    ['2024-10-18', 'Eugene H. Krabs', 70000, 'Event expense reimbursement'],
    ['2024-11-01', 'Krusty Krab LLC', 154000, 'Volunteer meal service'],
    ['2024-11-12', 'Sandy Cheeks', 440000, 'Voter file analytics consulting']
  ],
  'BBV-C007': [
    ['2025-01-11', 'Bikini Bottom Gazette', 305000, 'Issue education advertising'],
    ['2025-01-25', 'Squidward Q. Tentacles', 102500, 'Creative production services'],
    ['2025-02-08', 'Krusty Krab LLC', 88000, 'Member meeting catering'],
    ['2025-02-22', 'Sandy Cheeks', 265000, 'Research consulting']
  ],
  'BBV-C008': [
    ['2025-04-03', 'Bikini Bottom Planning Maps', 210000, 'Site map reproduction'],
    ['2025-04-17', 'Eugene H. Krabs', 62500, 'Petition event reimbursement'],
    ['2025-05-01', 'Conch Street Print & Mail', 189000, 'Referendum mail pieces'],
    ['2025-05-15', 'Krusty Krab LLC', 111000, 'Community meeting catering']
  ],
  'BBV-C009': [
    ['2025-07-09', 'Jellyfish Fields Events', 172000, 'Public forum venue'],
    ['2025-07-23', 'Sandy Cheeks', 315000, 'District survey analysis'],
    ['2025-08-06', 'Squidward Q. Tentacles', 84500, 'Forum audio services'],
    ['2025-08-20', 'Krusty Krab LLC', 96500, 'Volunteer meal service']
  ],
  'BBV-C010': [
    ['2026-02-14', 'Bikini Bottom Gazette', 390000, 'Public safety advertising'],
    ['2026-02-28', 'Krusty Krab LLC', 121000, 'Volunteer kickoff catering'],
    ['2026-03-14', 'Sandy Cheeks', 350000, 'Voter opinion research'],
    ['2026-03-28', 'Squidward Q. Tentacles', 99000, 'Event production services']
  ]
});

const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const key = (value) => compact(value).toLocaleLowerCase('en-US');

function buildRecord(committee, [date, payee, amountCents, purpose], index) {
  return Object.freeze({
    schema: PRACTICE_EXPENDITURE_SCHEMA,
    transaction_id: `${committee.id}-EXP-${String(index + 1).padStart(2, '0')}`,
    committee_id: committee.id,
    committee_name: committee.name,
    candidate_name: committee.candidate,
    office: committee.office,
    activity_type: 'EXPENDITURE',
    expenditure_date: date,
    payee_name: payee,
    amount_cents: amountCents,
    purpose,
    source_family: 'FICTIONAL_PRACTICE',
    source_instance_id: 'practice-bikini-bottom-votes',
    evidence_status: 'FICTIONAL_SAMPLE',
    cross_lane_overlap_candidate: CROSS_LANE_PAYEES.includes(payee),
    lineage: Object.freeze({
      schema: 'td613.giving.practice-expenditure-lineage/v1',
      practice_fixture_id: 'giving.bikini-bottom-practice/v0.1',
      manifestly_fictional: true,
      external_retrieval: false,
      evidence_authority: false,
      consequence_authority: false,
      lane: 'EXPENDITURES'
    })
  });
}

const LEDGER = new Map(PRACTICE_COMMITTEES.map((committee) => [
  committee.id,
  Object.freeze((BLUEPRINTS[committee.id] || []).map((row, index) => buildRecord(committee, row, index)))
]));

export function practiceCommittee(value) {
  const needle = key(value);
  return PRACTICE_COMMITTEES.find((committee) => key(committee.id) === needle || key(committee.name) === needle) || null;
}

export function expendituresForCommittee(value) {
  const committee = practiceCommittee(value);
  return committee ? [...(LEDGER.get(committee.id) || [])] : [];
}

export function allPracticeExpenditures() {
  return PRACTICE_COMMITTEES.flatMap((committee) => expendituresForCommittee(committee.id));
}

export function expenditureCoverageAudit() {
  const missing = PRACTICE_COMMITTEES.filter((committee) => !(LEDGER.get(committee.id)?.length)).map((committee) => committee.id);
  const observedPayees = new Set(allPracticeExpenditures().map((record) => record.payee_name));
  const overlapPayees = CROSS_LANE_PAYEES.filter((payee) => observedPayees.has(payee));
  return Object.freeze({
    schema: 'td613.giving.practice-expenditure-audit/v0.1',
    committee_count: PRACTICE_COMMITTEES.length,
    expenditure_count: allPracticeExpenditures().length,
    missing_committee_ids: Object.freeze(missing),
    cross_lane_payees: Object.freeze(overlapPayees),
    all_committees_have_expenditures: missing.length === 0,
    contribution_expenditure_equivalence_forbidden: true,
    same_name_same_identity_inference_forbidden: true,
    learner_must_compare_lane_role: true
  });
}
