// Non-inferential concurrent-process fixture. All roots are published synthetic literals.
import {open,binding} from './experiment-b-custodian-fixture.mjs';
let text='';for await(const b of process.stdin)text+=b;
const paths=JSON.parse(text),store=open(paths);
try{console.log(JSON.stringify(await store.authorizeAndConsume('SYNTHETIC_MANDATE',binding())));}
catch{console.log('{"status":"HOLD"}');}
finally{store.close();}
