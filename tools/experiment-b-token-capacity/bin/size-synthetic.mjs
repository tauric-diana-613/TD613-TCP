import {syntheticMembers,syntheticPlan,makeZip} from '../test/fixtures.mjs';
import {parseTextZip} from '../lib/zip.mjs';
import {prepareDatasets,measureCapacity,aggregateReport} from '../lib/capacity.mjs';
import {publicError,need} from '../lib/errors.mjs';
try{
 need(process.argv.length===2,'SYNTHETIC_ENTRY_ACCEPTS_NO_ARCHIVE_ARGUMENT');
 const members=parseTextZip(makeZip(syntheticMembers(),{deflate:true})),plan=syntheticPlan();
 const measured=measureCapacity({plan,datasets:prepareDatasets(members,{AUTHENTIC:[0,1,2]},3)});
 console.log(JSON.stringify(aggregateReport(measured,{fields:['document_count','source_token_total_bucket','capacity_by_arm'],quantum:1000}),null,2));
}catch(error){console.log(JSON.stringify(publicError(error)));process.exitCode=1;}
