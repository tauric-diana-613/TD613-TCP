// Opt-in new native call for an independent reviewer. This was NOT run as part of evidence verification.
// Uses existing ChatGPT auth. No API keys are forwarded; no source files are read for the model.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
if(!process.argv.includes('--execute-new-native-call'))throw Error('Explicit --execute-new-native-call required; offline verify-recorded-evidence.mjs makes no calls.');
const exe=process.env.CODEX_BIN||'codex';
const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'td613-source-free-review-'));
const input='SOURCE-FREE SYNTHETIC ONLY. Use no tools, files, search, or delegation. An invented relay has observations 5,8,11. Is increment 3 for all future steps proved? Give only the conditional next value and a limitation.';
const keys=['PATH','HOME','USERPROFILE','CODEX_HOME','TMPDIR','TMP','TEMP','LANG','LC_ALL','SystemRoot','SYSTEMROOT'];
const env=Object.fromEntries(keys.filter(k=>typeof process.env[k]==='string').map(k=>[k,process.env[k]]));
const login=spawnSync(exe,['login','status'],{encoding:'utf8',env,timeout:10000,windowsHide:true});
if(login.status!==0||!((login.stdout||'')+(login.stderr||'')).includes('Logged in using ChatGPT'))throw Error('Existing ChatGPT CLI authentication required; no API-key fallback permitted.');
const args=['exec','--json','--ephemeral','--ignore-user-config','--sandbox','read-only','--skip-git-repo-check','--cd',cwd,'--model','gpt-6.1-sol','-c','model_provider="openai"','-c','model_reasoning_effort="medium"','-c','web_search="disabled"','-c','features.shell_tool=false','-c','project_doc_max_bytes=0','-'];
const r=spawnSync(exe,args,{cwd,input,encoding:'utf8',timeout:90000,maxBuffer:16*1024*1024,env,windowsHide:true});
process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');
if(r.error)process.stderr.write(r.error.message+'\n');process.exitCode=r.status??1;
// Keep synthetic scratch directory for review; no recursive deletion or repository writes.
