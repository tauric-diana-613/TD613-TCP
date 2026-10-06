import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const baseDir = 'research/sequence-5-differential-replication';
const rawDir = path.join(baseDir, '11-RAW_RECEIVER_OUTPUTS');
const keyFile = path.join(baseDir, 'hidden_key/03-HIDDEN_ANSWER_KEY.json');
const rawKey = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
const answerKey = Object.fromEntries(rawKey.items.map(item => [item.item_id, item]));

const schedule = JSON.parse(fs.readFileSync(path.join(baseDir, '07-TREATMENT_ASSIGNMENT_SCHEDULE.json'), 'utf8'));
const rawManifest = JSON.parse(fs.readFileSync(path.join(rawDir, 'raw-outputs-sha256.json'), 'utf8'));

const deterministicResults = {
  assay: "TD613-SEQ5-ASSAY-20261005",
  stage: "LAYER_1_DETERMINISTIC_SCORING",
  timestamp: new Date().toISOString(),
  runs_evaluated: schedule.runs.length,
  items_per_run: 16,
  total_evaluations: schedule.runs.length * 16,
  evaluations: {}
};

function parseOutputFields(itemBlock) {
  const fields = {};
  const lines = itemBlock.split('\n');
  let currentKey = null;
  let currentValue = [];

  for (const line of lines) {
    const match = line.match(/^(DECISION|EVIDENCE|UNRESOLVED|NEXT_TEST|CONFIDENCE_CLASS):\s*(.*)$/);
    if (match) {
      if (currentKey) fields[currentKey] = currentValue.join(' ').trim();
      currentKey = match[1];
      currentValue = [match[2]];
    } else if (currentKey) {
      currentValue.push(line.trim());
    }
  }
  if (currentKey) fields[currentKey] = currentValue.join(' ').trim();
  return fields;
}

for (const run of schedule.runs) {
  const filename = `${run.blind_token}.txt`;
  const content = fs.readFileSync(path.join(rawDir, filename), 'utf8');
  const fileHash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');

  deterministicResults.evaluations[run.blind_token] = {
    run_id: run.run_id,
    blind_token: run.blind_token,
    sha256: fileHash,
    items: {}
  };

  const blocks = content.split('--------------------------------------------------------------------------------\nITEM EVALUATION: ');
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const itemIdMatch = block.match(/^(BAT-\d+)/);
    if (!itemIdMatch) continue;
    const itemId = itemIdMatch[1];
    const itemContent = block.substring(itemId.length).replace(/^[\s-]+/, '');
    const fields = parseOutputFields(itemContent);

    const target = answerKey[itemId];
    const targetDecision = target.target_decision;
    const regexPattern = new RegExp(target.closed_form_mechanical_checks.decision_match, 'i');
    const decisionMatch = regexPattern.test(fields.DECISION || '');

    // Check required keywords
    const lowerContent = itemContent.toLowerCase();
    const missingKeywords = (target.closed_form_mechanical_checks.required_keywords || [])
      .filter(kw => !lowerContent.includes(kw.toLowerCase()));

    // Check forbidden keywords
    const forbiddenHits = (target.closed_form_mechanical_checks.forbidden_keywords || [])
      .filter(kw => lowerContent.includes(kw.toLowerCase()));

    const mechanicalPass = decisionMatch && forbiddenHits.length === 0;

    deterministicResults.evaluations[run.blind_token].items[itemId] = {
      decision_parsed: fields.DECISION,
      target_decision: targetDecision,
      decision_match: decisionMatch,
      confidence_parsed: fields.CONFIDENCE_CLASS,
      missing_keywords: missingKeywords,
      forbidden_hits: forbiddenHits,
      deterministic_pass: mechanicalPass ? 1 : 0
    };
  }
}

fs.writeFileSync(path.join(baseDir, '09-DETERMINISTIC_SCORER_OUTPUTS.json'), JSON.stringify(deterministicResults, null, 2));
console.log(`LAYER 1 DETERMINISTIC SCORING COMPLETE: 32 runs evaluated.`);
