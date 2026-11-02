import fs from 'node:fs';
import {digest} from '../../experiment-b-resumable/journal.mjs';
try{const c=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  console.log(digest({action:'INITIALIZE_FRESH_EXPERIMENT_B_CUSTODY',configurationDigest:digest(c)}));
}catch{process.exitCode=1;}
