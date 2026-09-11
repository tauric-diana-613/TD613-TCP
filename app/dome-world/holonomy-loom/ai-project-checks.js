import { LOOM_AI_PROJECTS } from './ai-projects.js';

// A deliberately narrow arithmetic witness for the fictional vendor task.
// It never gates output, authorizes an action, or grades an arbitrary AI task.
const money = value => Number(value.toFixed(2));
const numeral = '((?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d{1,2})?)';
const numeric = value => Number(value.replaceAll(',', ''));
const finiteMatch = (text, pattern, index = 1) => {
  const match = pattern.exec(text);
  return match ? numeric(match[index]) : NaN;
};
function vendorOracle() {
  const source = LOOM_AI_PROJECTS.find(project => project.id === 'vendor-diligence');
  const get = id => source.documents.find(document => document.id === id).text;
  const requirements = get('requirements'), offer = get('offer'), comparison = get('comparison');
  const inputs = {
    accounts: finiteMatch(requirements, /migrate (\d+) service accounts/),
    archive_gb_per_account: finiteMatch(requirements, /(\d+) GB of archived content/),
    vendor_a_monthly_account: finiteMatch(offer, /accounts at ([\d.]+) credits per account per month/),
    vendor_a_base_migration: finiteMatch(offer, /Migration service: ([\d,]+) credits once/),
    vendor_a_included_accounts: finiteMatch(offer, /covering up to (\d+) accounts/),
    vendor_a_additional_account: finiteMatch(offer, /each additional account costs ([\d.]+) credits/),
    vendor_a_archive_monthly_gb: finiteMatch(offer, /storage is listed as ([\d.]+) credits per GB per month/),
    vendor_b_monthly_account: finiteMatch(comparison, /accounts at ([\d.]+) credits per account per month/),
    vendor_b_migration: finiteMatch(comparison, /migration at ([\d,]+) credits once/),
    vendor_b_archive_monthly_gb: finiteMatch(comparison, /archive storage at ([\d.]+) credits per GB per month/)
  };
  if (!Object.values(inputs).every(Number.isFinite) || inputs.accounts < inputs.vendor_a_included_accounts) return null;
  const archive = inputs.accounts * inputs.archive_gb_per_account;
  const a = { annual_subscription: money(inputs.accounts * inputs.vendor_a_monthly_account * 12),
    migration: money(inputs.vendor_a_base_migration + (inputs.accounts - inputs.vendor_a_included_accounts) * inputs.vendor_a_additional_account),
    annual_archive: money(archive * inputs.vendor_a_archive_monthly_gb * 12) };
  const b = { annual_subscription: money(inputs.accounts * inputs.vendor_b_monthly_account * 12),
    migration: inputs.vendor_b_migration, annual_archive: money(archive * inputs.vendor_b_archive_monthly_gb * 12) };
  return { inputs, expected: { vendor_a_12_month_credits: money(a.annual_subscription+a.migration+a.annual_archive),
    vendor_b_12_month_credits: money(b.annual_subscription+b.migration+b.annual_archive) }, components: { vendor_a: a, vendor_b: b } };
}
function reportedTotals(answer) {
  const candidates = { vendor_a: [], vendor_b: [] };
  // Observed provider form: '* **Total Vendor-A Cost**: 137,591.52 credits.'
  // Require the entire leading total label, a monetary value and currency. This
  // does not promote bare numeric presence or an unrelated quoted amount.
  const labelledTotal = new RegExp(`^[ \t]*(?:[-*+][ \t]+)?(?:\\*\\*|__)?Total[ \t]+Vendor[- ]([AB])[ \t]+Cost(?:\\*\\*|__)?[ \t]*[:=][ \t]*${numeral}[ \t]+credits[ \t]*(?:[.;]|$)`, 'gmi');
  for (const match of answer.matchAll(labelledTotal)) {
    const key = match[1].toUpperCase() === 'A' ? 'vendor_a' : 'vendor_b';
    candidates[key].push(numeric(match[2]));
  }
  // Keep each candidate attached to its explicit vendor-labelled passage. Never
  // infer a total merely because an expected number occurs elsewhere in prose.
  for (const segment of answer.matchAll(/\bVendor[- ]([AB])\b([\s\S]*?)(?=\bVendor[- ][AB]\b|$)/gi)) {
    const body = segment[2].slice(0,2400), key = segment[1].toUpperCase() === 'A' ? 'vendor_a' : 'vendor_b';
    const patterns = [
      new RegExp(`(?:12[- ](?:mo(?:nth)?s?)|annual)[^\\n.;]{0,35}?(?:cost|total)\\s*[:=]?\\s*${numeral}(?:\\s*credits)?`, 'gi'),
      new RegExp(`total\\s*(?:=|:|is|of)\\s*${numeral}(?=\\s*(?:credits|[.;]|$))`, 'gi')
    ];
    for (const pattern of patterns) for (const match of body.matchAll(pattern)) {
      if (/credits|subscription|migration|cost/i.test(body)) candidates[key].push(numeric(match[1]));
    }
    // Explicit comparator: 'Vendor-A (12-mo cost: X credits) ... Vendor-B (Y credits)'.
    // Y inherits the declared cost comparison only within that same sentence.
    const prefix = answer.slice(Math.max(0, segment.index - 320), segment.index);
    const directComparison = new RegExp(`^\\s*\\(\\s*${numeral}\\s+credits\\)`, 'i').exec(body);
    if (directComparison && /(?:12[- ](?:mo(?:nth)?s?)|annual)[^\n.]{0,180}(?:cost|total)[^\n.]*$/i.test(prefix)) candidates[key].push(numeric(directComparison[1]));
    // A compact Markdown/table row such as `Vendor A | **137,591.52 credits**`
    // is explicit attribution only when its nearby heading/header declares a
    // twelve-month/annual fee or cost comparison. A nearby vendor label or bare
    // expected number alone still earns nothing.
    const scopedContext = `${prefix}\n${body.slice(0,260)}`;
    const scopedFeeContext = /(?:12[- ](?:mo(?:nth)?s?)|annual|stated[- ]fees?|cost[ \t]+comparison|total[ \t]+cost|fees?[ \t]+comparison)/i.test(scopedContext);
    const directRow = new RegExp(`^[\\s|:*_–—-]*${numeral}\\s+credits\\b`, 'i').exec(body);
    if (scopedFeeContext && directRow) candidates[key].push(numeric(directRow[1]));
  }
  return Object.fromEntries(Object.entries(candidates).map(([key, values]) => {
    const distinct = [...new Set(values)];
    return [key, { value: distinct.length === 1 ? distinct[0] : null, candidates: distinct,
      extraction: distinct.length === 1 ? 'explicit_vendor_total' : distinct.length ? 'ambiguous' : 'not_found' }];
  }));
}
export function assessLoomProjectAnswer(projectId, response) {
  const base = { applicable: projectId === 'vendor-diligence', status: 'needs_review',
    scope: 'Two stated-fee totals in the fictional vendor project only; no general correctness or action approval.',
    blocks_output: false, release_authority: false };
  if (!base.applicable) return { ...base, expected: {}, reported: {}, checks: [] };
  const oracle = vendorOracle();
  if (!oracle) return { ...base, expected: {}, reported: {}, checks: [], reason: 'Fixture source could not be read by this arithmetic witness.' };
  const answer = typeof response?.answer === 'string' ? response.answer : '';
  const reported = reportedTotals(answer);
  const checks = ['vendor_a','vendor_b'].map(vendor => {
    const expected = oracle.expected[`${vendor}_12_month_credits`], report = reported[vendor];
    return { id: `${vendor}_12_month_credits`, expected, reported: report.value,
      expected_numeric_presence: answer.includes(expected.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})) || answer.includes(expected.toFixed(2)),
      status: report.value === null ? report.extraction : money(report.value) === expected ? 'matched' : 'mismatch' };
  });
  return { ...base, ...oracle, reported, checks, status: checks.every(check => check.status === 'matched') ? 'matched' : 'needs_review',
    assumptions: ['All 240 accounts and the full stated archive volume are billed for twelve months.', 'Only explicitly stated subscription, migration and archive charges are included; unpriced connector work and other omitted costs remain open.'],
    reason: checks.every(check => check.status === 'matched') ? 'Both explicit vendor totals match the stated-fee calculation.' : 'Check the stated-fee totals against the source documents; this answer remains available for review.' };
}
