import pathlib,json
r=pathlib.Path('/workspace/scratch/26d2ceda3f9e/continuation-a17')
p=json.loads((r/'POLICY.json').read_bytes());f=json.loads((r/'FREEZE_COMMIT.json').read_bytes());c=json.loads((r/'CREDENTIAL_BINDING.json').read_bytes())
q=lambda s:"'"+s.replace("'","''")+"'"
guard="""DO $$ BEGIN
IF EXISTS (SELECT 1 FROM td613_assay_runs WHERE run_id='portable-loom-first-receiver-20261009-a17')
OR EXISTS (SELECT 1 FROM td613_assay_runs WHERE status='ACTIVE' AND run_id LIKE 'portable-loom-first-receiver-20261009%')
OR (SELECT COALESCE(sum(calls_reserved),0) FROM td613_assay_runs WHERE run_id LIKE 'portable-loom-first-receiver-20261009%') <> 76
OR (SELECT COALESCE(sum(reserved_cost_nanos),0) FROM td613_assay_runs WHERE run_id LIKE 'portable-loom-first-receiver-20261009%') <> 8698567500
OR (SELECT count(*) FROM td613_assay_runs WHERE (run_id,status,calls_reserved,reserved_cost_nanos) IN (('portable-loom-first-receiver-20261009-a12','HELD',0,0),('portable-loom-first-receiver-20261009-a13','HELD',5,551226000),('portable-loom-first-receiver-20261009-a14','HELD',1,110168250),('portable-loom-first-receiver-20261009-a15','HELD',9,996168000),('portable-loom-first-receiver-20261009-a16','HELD',1,110195250))) <> 5
THEN RAISE EXCEPTION 'A17_ENROLLMENT_PRECONDITION_CHANGED'; END IF;
END $$"""
insert='INSERT INTO td613_assay_runs(run_id,credential_sha256,policy,status,policy_sha256) VALUES ('+','.join([q(p['run_id']),q(c['relay_access_sha256']),q(json.dumps(p,ensure_ascii=False,separators=(',',':')))+'::jsonb',"'ACTIVE'",q(f['policy_sha256'])])+') RETURNING run_id,status,policy_sha256,calls_reserved,reserved_cost_nanos'
assert p['binding']['limits']['max_calls']==3 and p['binding']['limits']['max_cost_usd']==.54216 and p['program']['max_calls']==80 and p['program']['max_cost_usd']==10
(r/'ENROLLMENT_SQL_STATEMENTS.json').write_text(json.dumps(['LOCK TABLE td613_assay_runs IN SHARE ROW EXCLUSIVE MODE',guard,insert],indent=2,ensure_ascii=False)+'\n')
