import { _givingPracticeSearchNoise } from './giving-practice-search-noise.js';
import { _givingPracticeDiscoveryGraph } from './giving-practice-discovery-graph.js';
import { _givingPracticeReferendumCluster } from './giving-practice-referendum-cluster.js';
import { _givingPracticeTemporalClusterExtension } from './giving-practice-temporal-cluster-extension.js';
import { _givingPracticeInKind } from './giving-practice-in-kind.js';
import { _givingPracticeLocalCampaignRules } from './giving-practice-local-campaign-rules.js';
import { _givingPracticeKrabsCheapskate } from './giving-practice-krabs-cheapskate.js';
import { _givingPracticeLocalAlignment } from './giving-practice-local-alignment.js';
import { _givingPracticeCampaignHistory } from './giving-practice-campaign-history.js';

const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const normalizeCommitteeName = (value) => value === 'Mrs. Puff for Bikini Bottom School District #67'
  ? 'Puff for Bikini Bottom School District #67'
  : compact(value);

function baseRows() {
  const rows = [];
  for (const name of _givingPracticeSearchNoise.CANONICAL_NAMES) {
    for (const record of _givingPracticeSearchNoise.canonicalRecordsFor(name)) {
      rows.push({
        contributor_name: compact(record.contributor_name_raw || record.contributor_name || name),
        committee_name: normalizeCommitteeName(record.committee_name || record.committee),
        amount_cents: record.amount_cents,
        practice_data_class: record.practice_name_quality || 'CANONICAL',
        contribution_type: record.contribution_type || null,
        transaction_class: record.transaction_class || null,
        date: record.contribution_date || null,
        lineage: record.lineage || null
      });
    }
  }

  for (const [name, transactions] of Object.entries(_givingPracticeSearchNoise.NOISE_TX)) {
    for (const [date, amountCents, committee] of transactions) {
      rows.push({
        contributor_name: name,
        committee_name: normalizeCommitteeName(committee),
        amount_cents: amountCents,
        practice_data_class: _givingPracticeSearchNoise.NOISE_PEOPLE[name]?.quality || 'AMBIGUITY',
        contribution_type: 'FICTIONAL CONTRIBUTION',
        transaction_class: null,
        date,
        lineage: null
      });
    }
  }

  for (const [name, transactions] of Object.entries(_givingPracticeDiscoveryGraph.DISCOVERY_TX)) {
    for (const [date, amountCents, committee] of transactions) {
      rows.push({
        contributor_name: name,
        committee_name: normalizeCommitteeName(committee),
        amount_cents: amountCents,
        practice_data_class: _givingPracticeDiscoveryGraph.DISCOVERY_PEOPLE[name]?.data_class || 'DISCOVERY',
        contribution_type: 'FICTIONAL CONTRIBUTION',
        transaction_class: null,
        date,
        lineage: null
      });
    }
  }
  return rows;
}

function supplementalRows() {
  return [
    ..._givingPracticeReferendumCluster.allTemporalClusterRows(),
    ..._givingPracticeTemporalClusterExtension.allRows(),
    ..._givingPracticeInKind.allRows(),
    ..._givingPracticeLocalCampaignRules.allLarryLoanRows(),
    ..._givingPracticeLocalAlignment.allRows(),
    ..._givingPracticeCampaignHistory.allRows()
  ].map((record) => ({
    contributor_name: compact(record.contributor_name_raw || record.contributor_name),
    committee_name: normalizeCommitteeName(record.committee_name || record.committee),
    amount_cents: record.amount_cents,
    practice_data_class: record.practice_data_class || record.lineage?.data_class || 'SUPPLEMENTAL',
    contribution_type: record.contribution_type || null,
    transaction_class: record.transaction_class || null,
    practice_over_limit_anomaly: record.practice_over_limit_anomaly === true,
    practice_compliance_review_required: record.practice_compliance_review_required === true,
    candidate_self_financing: record.candidate_self_financing === true,
    practice_candidate_loan: record.practice_candidate_loan === true,
    practice_local_campaign_rule: record.practice_local_campaign_rule || null,
    date: record.contribution_date || null,
    lineage: record.lineage || null
  }));
}

function pseudoRecord(row) {
  return {
    contributor_name: row.contributor_name,
    contributor_name_raw: row.contributor_name,
    committee: row.committee_name,
    committee_name: row.committee_name,
    amount_cents: row.amount_cents,
    contribution_date: row.date,
    contribution_type: row.contribution_type,
    transaction_class: row.transaction_class,
    practice_data_class: row.practice_data_class,
    practice_over_limit_anomaly: row.practice_over_limit_anomaly,
    practice_compliance_review_required: row.practice_compliance_review_required,
    candidate_self_financing: row.candidate_self_financing,
    practice_candidate_loan: row.practice_candidate_loan,
    practice_local_campaign_rule: row.practice_local_campaign_rule,
    lineage: row.lineage || {}
  };
}

function normalizedRows() {
  const raw = [...baseRows(), ...supplementalRows()];
  const withoutPlanktonBloc = _givingPracticeLocalAlignment.removePlanktonFromKrabsBloc(raw.map(pseudoRecord));
  return withoutPlanktonBloc.map((record) => {
    const krabsNormalized = _givingPracticeKrabsCheapskate.normalizeKrabsOrdinaryRecord(record);
    const localNormalized = _givingPracticeLocalCampaignRules.normalizeLocalCampaignRecord(krabsNormalized);
    const campaignNormalized = _givingPracticeCampaignHistory.normalizePracticeRecord(localNormalized);
    return {
      contributor_name: compact(campaignNormalized.contributor_name_raw || campaignNormalized.contributor_name),
      committee_name: normalizeCommitteeName(campaignNormalized.committee_name || campaignNormalized.committee),
      amount_cents: campaignNormalized.amount_cents,
      practice_data_class: campaignNormalized.practice_data_class || campaignNormalized.lineage?.data_class || 'NORMALIZED',
      contribution_type: campaignNormalized.contribution_type || null,
      transaction_class: campaignNormalized.transaction_class || null,
      practice_over_limit_anomaly: campaignNormalized.practice_over_limit_anomaly === true,
      practice_compliance_review_required: campaignNormalized.practice_compliance_review_required === true,
      candidate_self_financing: campaignNormalized.candidate_self_financing === true,
      practice_candidate_loan: campaignNormalized.practice_candidate_loan === true,
      practice_local_campaign_rule: campaignNormalized.practice_local_campaign_rule || null,
      date: campaignNormalized.contribution_date || null,
      lineage: campaignNormalized.lineage || null
    };
  });
}

function contributorsForCommittee(committeeName) {
  const target = normalizeCommitteeName(committeeName);
  const byName = new Map();
  for (const row of normalizedRows()) {
    if (row.committee_name !== target) continue;
    const entry = byName.get(row.contributor_name) || {
      name: row.contributor_name,
      record_count: 0,
      total_cents: 0,
      data_classes: new Set(),
      transaction_classes: new Set(),
      compliance_anomaly_count: 0
    };
    entry.record_count += 1;
    entry.total_cents += Number(row.amount_cents) || 0;
    if (row.practice_data_class) entry.data_classes.add(row.practice_data_class);
    if (row.transaction_class) entry.transaction_classes.add(row.transaction_class);
    if (row.practice_over_limit_anomaly || row.practice_compliance_review_required) entry.compliance_anomaly_count += 1;
    byName.set(row.contributor_name, entry);
  }
  return [...byName.values()]
    .map((entry) => ({
      ...entry,
      data_classes: [...entry.data_classes],
      transaction_classes: [...entry.transaction_classes]
    }))
    .sort((a, b) => b.record_count - a.record_count || b.total_cents - a.total_cents || a.name.localeCompare(b.name));
}

function totalsForCommittee(committeeName) {
  const contributors = contributorsForCommittee(committeeName);
  return {
    committee_name: normalizeCommitteeName(committeeName),
    contributor_count: contributors.length,
    record_count: contributors.reduce((sum, item) => sum + item.record_count, 0),
    total_cents: contributors.reduce((sum, item) => sum + item.total_cents, 0),
    transaction_classes: [...new Set(contributors.flatMap((item) => item.transaction_classes))],
    compliance_anomaly_count: contributors.reduce((sum, item) => sum + item.compliance_anomaly_count, 0)
  };
}

export const _givingPracticeCommitteeGraph = Object.freeze({
  normalizeCommitteeName,
  baseRows,
  supplementalRows,
  normalizedRows,
  contributorsForCommittee,
  totalsForCommittee
});
