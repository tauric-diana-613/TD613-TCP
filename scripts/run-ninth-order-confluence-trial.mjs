import {ninthOrderTrial} from '../packages/rulefield/lab/ninth_order_confluence.mjs';
const result=ninthOrderTrial();
if(result.staticRank!==5 || result.scientificClosure!=='HELD_OPERATOR_RESERVED')throw Error('NINTH_ORDER_SOURCE_FREE_GATE_FAILED');
process.stdout.write(JSON.stringify(result,null,2)+'\n');
