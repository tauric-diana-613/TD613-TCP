import assert from 'node:assert/strict';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from '../app/dome-world/previews/a15-r0/finite-task-topology-rigidity-birkhoff-dual.js';
import { finiteTopologicalProbeSeparationRedundancyCertificate } from '../app/dome-world/previews/a15-r0/finite-topological-probe-separation-redundancy.js';

const ROLES=['A','B','T','M','R'];
const expectedProbes=['RTAM','BRTM','RTM','BRM','BRT','RM','RT','BR','M','R'];
const topology=finiteTaskTopologyRigidityBirkhoffCertificate();
const parent878=finiteTopologicalProbeSeparationRedundancyCertificate();
assert.equal(topology.passed,true);
assert.equal(parent878.passed,true);
assert.equal(parent878.family_census.exact_identifying_families,795);
assert.equal(topology.rigidity.preserving_automorphism_count,1);

// HOSTILE RULE: derive every finite target before importing the child certificate.
const opens=[...topology.topology.open_states];
const inheritedProbes=opens.filter(id=>id!=='EMPTY'&&id!=='BRTAM');
assert.equal(inheritedProbes.length,10);
assert.deepEqual([...inheritedProbes].sort(),[...expectedProbes].sort());
const probes=[...expectedProbes];
const probeSet=Object.fromEntries(probes.map(probe=>[probe,new Set(ROLES.filter(role=>probe.includes(role)))]));
const popcount=n=>{ let x=n,count=0; while(x){ count+=x&1; x>>>=1; } return count; };
const familyOf=mask=>probes.filter((_,i)=>mask&(1<<i));
const signature=(mask,role)=>probes.map((probe,i)=>(mask&(1<<i))?(probeSet[probe].has(role)?'1':'0'):'').join('');
const roleClasses=mask=>new Set(ROLES.map(role=>signature(mask,role))).size;
function distance(mask){
  const out={};
  for(const a of ROLES){
    out[a]={};
    for(const b of ROLES){
      let n=0;
      for(let i=0;i<probes.length;i+=1) if(mask&(1<<i)) n+=probeSet[probes[i]].has(a)!==probeSet[probes[i]].has(b)?1:0;
      out[a][b]=n;
    }
  }
  return out;
}
const minDistance=d=>Math.min(...ROLES.flatMap((a,i)=>ROLES.slice(i+1).map(b=>d[a][b])));
const diameter=d=>Math.max(...ROLES.flatMap((a,i)=>ROLES.slice(i+1).map(b=>d[a][b])));
function pseudoAudit(d){
  for(const a of ROLES){ assert.equal(d[a][a],0); }
  for(const a of ROLES) for(const b of ROLES){ assert.equal(d[a][b],d[b][a]); assert.ok(d[a][b]>=0); }
  for(const a of ROLES) for(const b of ROLES) for(const c of ROLES) assert.ok(d[a][c]<=d[a][b]+d[b][c]);
}
function permutations(items){
  const out=[];
  function walk(prefix,remaining){
    if(!remaining.length){ out.push([...prefix]); return; }
    for(let i=0;i<remaining.length;i+=1){ prefix.push(remaining[i]); walk(prefix,[...remaining.slice(0,i),...remaining.slice(i+1)]); prefix.pop(); }
  }
  walk([],items); return out;
}
const rolePermutations=permutations(ROLES);
assert.equal(rolePermutations.length,120);
const roleSetKey=set=>ROLES.filter(role=>set.has(role)).join('');
function metricIsometries(d){
  const out=[];
  for(const permutation of rolePermutations){
    const map=Object.fromEntries(ROLES.map((role,index)=>[role,permutation[index]]));
    let ok=true;
    for(const a of ROLES) for(const b of ROLES) if(d[a][b]!==d[map[a]][map[b]]) ok=false;
    if(ok) out.push(map);
  }
  return out;
}
function incidenceAutomorphisms(family){
  const selected=new Set(family.map(probe=>roleSetKey(probeSet[probe])));
  const out=[];
  for(const permutation of rolePermutations){
    const map=Object.fromEntries(ROLES.map((role,index)=>[role,permutation[index]]));
    const image=new Set(family.map(probe=>roleSetKey(new Set([...probeSet[probe]].map(role=>map[role])))));
    if(image.size===selected.size&&[...image].every(key=>selected.has(key))) out.push(map);
  }
  return out;
}
const mapKey=map=>ROLES.map(role=>map[role]).join('');
const familySetKey=family=>[...family].sort().join('|');

const classSpectrum={};
const isoSpectrum={};
const jointSpectrum={};
const rows=[];
let pseudoFamilies=0,metricFamilies=0,metricEquivalenceMismatches=0,metricPermutationChecks=0,incidencePermutationChecks=0;
let equalSymmetry=0,extraSymmetry=0;
const maxSymmetry=[];
for(let mask=0;mask<1024;mask+=1){
  const family=familyOf(mask),classes=roleClasses(mask),d=distance(mask);
  pseudoAudit(d); pseudoFamilies+=1;
  classSpectrum[classes]=(classSpectrum[classes]||0)+1;
  const minimum=minDistance(d),metric=minimum>0;
  if(metric!==(classes===5)) metricEquivalenceMismatches+=1;
  let isoCount=0,incCount=0;
  if(metric){
    metricFamilies+=1;
    const iso=metricIsometries(d); metricPermutationChecks+=120;
    const inc=incidenceAutomorphisms(family); incidencePermutationChecks+=120;
    isoCount=iso.length; incCount=inc.length;
    isoSpectrum[isoCount]=(isoSpectrum[isoCount]||0)+1;
    jointSpectrum[`${isoCount},${incCount}`]=(jointSpectrum[`${isoCount},${incCount}`]||0)+1;
    if(isoCount===incCount) equalSymmetry+=1; else if(isoCount>incCount) extraSymmetry+=1;
    if(isoCount===24) maxSymmetry.push(family);
  }
  rows.push({mask,family,width:popcount(mask),classes,d,minimum,metric,isoCount,incCount});
}
assert.equal(pseudoFamilies,1024);
assert.equal(metricFamilies,795);
assert.equal(metricEquivalenceMismatches,0);
assert.equal(metricPermutationChecks,95400);
assert.equal(incidencePermutationChecks,95400);
assert.deepEqual(classSpectrum,{'1':1,'2':10,'3':44,'4':174,'5':795});
assert.deepEqual(isoSpectrum,{'1':372,'2':360,'4':40,'6':10,'8':8,'12':4,'24':1});
assert.deepEqual(jointSpectrum,{
  '1,1':372,'2,1':192,'2,2':168,'4,1':9,'4,2':21,'4,4':10,'6,2':2,'6,6':8,
  '8,1':2,'8,2':5,'8,4':1,'12,6':4,'24,4':1,
});
assert.equal(equalSymmetry,558);
assert.equal(extraSymmetry,237);
assert.equal(maxSymmetry.length,1);
assert.equal(familySetKey(maxSymmetry[0]),familySetKey(['RTAM','BRTM','M','R']));

const fullMask=(1<<10)-1,full=distance(fullMask);
assert.deepEqual(full,{
  A:{A:0,B:5,T:4,M:5,R:8},B:{A:5,B:0,T:5,M:6,R:5},T:{A:4,B:5,T:0,M:5,R:4},
  M:{A:5,B:6,T:5,M:0,R:5},R:{A:8,B:5,T:4,M:5,R:0},
});
assert.equal(minDistance(full),4);
assert.equal(diameter(full),8);
const profiles=Object.fromEntries(ROLES.map(role=>[role,ROLES.filter(other=>other!==role).map(other=>full[role][other]).sort((a,b)=>a-b)]));
assert.deepEqual(profiles,{A:[4,5,5,8],B:[5,5,5,6],T:[4,4,5,5],M:[5,5,5,6],R:[4,5,5,8]});
const triangleSlack={}; const zeroSlack=[]; let triangleChecks=0;
for(const a of ROLES) for(const b of ROLES) for(const c of ROLES){
  if(new Set([a,b,c]).size<3) continue;
  triangleChecks+=1;
  const slack=full[a][b]+full[b][c]-full[a][c];
  triangleSlack[slack]=(triangleSlack[slack]||0)+1;
  if(slack===0) zeroSlack.push([a,b,c]);
}
assert.equal(triangleChecks,60);
assert.deepEqual(triangleSlack,{'0':2,'2':4,'4':22,'6':20,'8':12});
assert.deepEqual(zeroSlack,[['A','T','R'],['R','T','A']]);
const fullIso=metricIsometries(full),fullInc=incidenceAutomorphisms(probes);
assert.equal(fullIso.length,4);
assert.equal(fullInc.length,1);
const fullIsoKeys=new Set(fullIso.map(mapKey));
for(const map of [
  {A:'A',B:'B',T:'T',M:'M',R:'R'},
  {A:'R',B:'B',T:'T',M:'M',R:'A'},
  {A:'A',B:'M',T:'T',M:'B',R:'R'},
  {A:'R',B:'M',T:'T',M:'B',R:'A'},
]) assert.equal(fullIsoKeys.has(mapKey(map)),true);
assert.equal(mapKey(fullInc[0]),mapKey({A:'A',B:'B',T:'T',M:'M',R:'R'}));

const starMask=['RTAM','BRTM','M','R'].reduce((mask,probe)=>mask|(1<<probes.indexOf(probe)),0);
const starRow=rows[starMask];
assert.equal(starRow.metric,true);
assert.equal(starRow.isoCount,24);
assert.equal(starRow.incCount,4);
assert.deepEqual(Object.fromEntries(ROLES.map(role=>[role,signature(starMask,role)])),{A:'1000',B:'0100',T:'1100',M:'1110',R:'1101'});
for(const leaf of ['A','B','M','R']) assert.equal(starRow.d.T[leaf],1);
for(const [a,b] of [['A','B'],['A','M'],['A','R'],['B','M'],['B','R'],['M','R']]) assert.equal(starRow.d[a][b],2);

function choosePositions(positions,k){
  if(k===0) return [0];
  const out=[];
  function walk(start,depth,mask){
    if(depth===k){ out.push(mask); return; }
    for(let i=start;i<positions.length;i+=1) walk(i+1,depth+1,mask|(1<<positions[i]));
  }
  walk(0,0,0); return out;
}
const erasureCases={}; let totalErasureCases=0,comparisons=0,mismatches=0;
for(let e=0;e<=4;e+=1){
  let cases=0;
  for(const row of rows){
    if(row.width<e) continue;
    const positions=[...Array(10).keys()].filter(i=>row.mask&(1<<i));
    const erasures=choosePositions(positions,e); cases+=erasures.length; totalErasureCases+=erasures.length;
    let direct=true;
    for(const erasedMask of erasures) if(minDistance(distance(row.mask&~erasedMask))===0) direct=false;
    const criterion=row.minimum>=e+1;
    comparisons+=1;
    if(direct!==criterion) mismatches+=1;
  }
  erasureCases[e]=cases;
}
assert.deepEqual(erasureCases,{'0':1024,'1':5120,'2':11520,'3':15360,'4':13440});
assert.equal(totalErasureCases,46464);
assert.equal(comparisons,4876);
assert.equal(mismatches,0);

// Only after the complete hostile reconstruction may the child be inspected.
const childModule=await import('../app/dome-world/previews/a15-r0/finite-topological-distinguishability-metric-amnesia.js');
const child=childModule.finiteTopologicalDistinguishabilityMetricAmnesiaCertificate();
assert.equal(child.passed,true);
assert.equal(child.parent_receipt,'4ba3542aea8784586562032c57096248dc961db9');
assert.equal(child.probes.universe_matches_preregistered,true);
assert.deepEqual([...child.probes.inherited_nontrivial].sort(),[...inheritedProbes].sort());
assert.deepEqual(child.probes.presentation_order,probes);
assert.equal(child.metric_family_census.pseudometric_families,pseudoFamilies);
assert.equal(child.metric_family_census.exact_metric_families,metricFamilies);
assert.deepEqual(child.metric_family_census.role_class_spectrum,classSpectrum);
assert.deepEqual(child.metric_family_census.metric_isometry_group_size_spectrum,isoSpectrum);
assert.deepEqual(child.metric_family_census.metric_incidence_joint_spectrum,jointSpectrum);
assert.equal(child.metric_family_census.equal_symmetry_families,equalSymmetry);
assert.equal(child.metric_family_census.families_with_nonliftable_metric_symmetry,extraSymmetry);
assert.deepEqual(child.full_metric.distance_matrix,full);
assert.equal(child.full_metric.metric_isometry_count,fullIso.length);
assert.equal(child.full_metric.labelled_incidence_automorphism_count,fullInc.length);
assert.equal(child.full_metric.nonliftable_metric_isometries,3);
assert.equal(child.maximum_metric_symmetry_control.metric_isometry_count,24);
assert.equal(child.maximum_metric_symmetry_control.labelled_incidence_automorphism_count,4);
assert.equal(child.maximum_metric_symmetry_control.nonliftable_metric_isometries,20);
assert.deepEqual(child.erasure_metric_equivalence.exact_erasure_case_counts,erasureCases);
assert.equal(child.erasure_metric_equivalence.total_erasure_cases,totalErasureCases);
assert.equal(child.erasure_metric_equivalence.family_order_comparisons,comparisons);
assert.equal(child.erasure_metric_equivalence.criterion_mismatches,mismatches);
for(const value of Object.values(child.authority)) assert.equal(value,false);

console.log('Ash A15-R0 independent hostile topological distinguishability metric reconstruction passed: 1,024 pseudometrics / 795 metrics / 95,400+95,400 symmetry checks / 46,464 erasures / non-liftable isometry amnesia.');
