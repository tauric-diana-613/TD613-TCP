import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';

const workflow=readFileSync('.github/workflows/vercel-relock-safety.yml','utf8');
const gate=workflow.split('\n  atelier-inbox-sync-v2-dispatch:\n')[1] ?? '';
const expected=[[1675,'SRC'],[1676,'WENDBINE'],[1677,'EMSTD613']];

test('original four durable workflows and historical operator gates survive',()=>{
  const files=readdirSync('.github/workflows').filter(s=>s.endsWith('.yml')||s.endsWith('.yaml'));
  assert.equal(files.length,4);
  assert.match(workflow,/^  src-zenodo-sync:/m);
  assert.match(workflow,/^  wendbine-operator-sync:/m);
  assert.ok(gate,'V2 job must exist inside existing relock workflow');
  assert.doesNotMatch(gate,/cron:|schedule:|deployment:|production-release/);
});
test('each new issue maps to one estate, two distinct requested modes and ignored local inbox',()=>{
  for(const [issue,estate] of expected){
    assert.ok(gate.includes('github.event.issue.number == '+issue));
    assert.ok(gate.includes("'/atelier-sync "+estate+" '"));
    assert.ok(gate.includes("'"+issue+":/atelier-sync "+estate+" LOCAL_INBOX'"));
    assert.ok(gate.includes("'"+issue+":/atelier-sync "+estate+" PROVIDER'"));
    const base='packages/dome_world_exact/fixtures/a15-r0/'+estate+'/07-OPERATOR-INBOX';
    assert.equal(readFileSync(join(base,'.gitignore'),'utf8'),'*'+'\n'+'!.gitignore'+'\n'+'!README.md'+'\n');
  }
});
test('new issue relay does not impersonate local source access or perform provider acquisition',()=>{
  assert.match(gate,/ATELIER_SYNC_V2_LOCAL_AGENT_REQUIRED/);
  assert.match(gate,/ATELIER_SYNC_V2_PROVIDER_HELD/);
  assert.match(gate,/GitHub runner cannot read operator-local inbox files/);
  assert.match(gate,/No provider request executed/);
  assert.doesNotMatch(gate,/actions\/checkout|\.\/scripts\/.*sync|node .*auto.?sync|python .*operator-inbox-sync.*--operator-approved-this-run/);
  assert.match(gate,/cancel-in-progress: false/);
  assert.match(gate,/github.event.issue.pull_request == null/);
  assert.match(gate,/github.event.comment.user.login == github.repository_owner/);
  assert.match(gate,/chatgpt-codex-connector\[bot\]/);
});
