import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const state=JSON.parse(fs.readFileSync('work/provider-private/authenticated-runtime-session.json','utf8'));
const profile='forced_login_method = "chatgpt"\ncli_auth_credentials_store = "file"\nweb_search = "disabled"\ncheck_for_update_on_startup = false\n[analytics]\nenabled = false\n[features]\napps = false\nplugins = false\nmulti_agent = false\nmemories = false\ncode_mode_host = false\nshell_tool = false\nbrowser_use = false\n';
const code="const fs=require('fs');const text=Buffer.from(process.argv[1],'base64');const fd=fs.openSync('/custody/native/config.toml','wx',0o600);try{fs.writeFileSync(fd,text);fs.fsyncSync(fd)}finally{fs.closeSync(fd)}console.log(JSON.stringify({metadataProfileWritten:true,credentialContentsRead:false}))";
const r=spawnSync('docker',['run','--rm','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges=true','--user','65534:65534','--mount','type=volume,src='+state.authVolume+',dst=/custody','--entrypoint','node',state.image,'-e',code,Buffer.from(profile).toString('base64')],{encoding:'utf8',windowsHide:true,timeout:30000,stdio:['ignore','pipe','ignore']});
if(r.status!==0){console.log('METADATA_PROFILE_NOT_WRITTEN');process.exit(1);}console.log(r.stdout.trim());
