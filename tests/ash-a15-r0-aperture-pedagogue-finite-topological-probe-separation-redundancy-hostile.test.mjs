import assert from 'node:assert/strict';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from '../app/dome-world/previews/a15-r0/finite-task-topology-rigidity-birkhoff-dual.js';
import { finiteTaskHomotopyAmnesiaRoleTomographyCertificate } from '../app/dome-world/previews/a15-r0/finite-task-homotopy-amnesia-role-tomography.js';

const ROLES=['A','B','T','M','R'];
const parent876=finiteTaskHomotopyAmnesiaRoleTomographyCertificate();
const topology=finiteTaskTopologyRigidityBirkhoffCertificate();
assert.equal(parent876.passed,true);
assert.equal(topology.passed,true);
assert.deepEqual(parent876.aperture_ladder.role_class_counts,[5,3,2,1]);

// HOSTILE RULE: reconstruct all finite targets before importing the child certificate.
const opens=[...topology.topology.open_states];
assert.equal(opens.length,12);
const probes=opens.filter(id=>id!=='EMPTY'&&id!=='BRTAM');
assert.deepEqual(probes,['RTAM','BRTM','RTM','BRM','BRT','RM','RT','BR','M','R']);
assert.equal(probes.length,10);
const probeHas=Object.fromEntries(probes.map(probe=>[probe,Object.fromEntries(ROLES.map(role=>[role,probe.includes(role)]))]));

const popcount=n=>{ let x=n,count=0; while(x){ count+=x&1; x>>>=1; } return count; };
const maskFamily=mask=>probes.filter((_,index)=>mask&(1<<index));
const familyKey=family=>[...family].sort().join('|');
const familyListKey=families=>families.map(familyKey).sort().join('||');
const signature=(mask,role)=>{
  let out='';
  for(let i=0;i<probes.length;i+=1) if(mask&(1<<i)) out+=probeHas[probes[i]][role]?'1':'0';
  return out;
};
const roleClasses=mask=>new Set(ROLES.map(role=>signature(mask,role))).size;
const pairCounts=mask=>{
  const out={};
  for(let i=0;i<ROLES.length;i+=1) for(let j=i+1;j<ROLES.length;j+=1){
    const a=ROLES[i],b=ROLES[j]; let n=0;
    for(let p=0;p<probes.length;p+=1) if(mask&(1<<p)) n+=probeHas[probes[p]][a]!==probeHas[probes[p]][b]?1:0;
    out[`${a}-${b}`]=n;
  }
  return out;
};
const muOf=mask=>Math.min(...Object.values(pairCounts(mask)));
function choosePositions(positions,k){
  if(k===0) return [0];
  const out=[];
  function walk(start,depth,eraseMask){
    if(depth===k){ out.push(eraseMask); return; }
    for(let i=start;i<positions.length;i+=1) walk(i+1,depth+1,eraseMask|(1<<positions[i]));
  }
  walk(0,0,0); return out;
}
const eraseMasks=(mask,e)=>choosePositions([...Array(10).keys()].filter(i=>mask&(1<<i)),e);

const classSpectrum={};
const muSpectrum={};
const widthMu={};
const maskRows=[];
let familyPairRows=0;
for(let mask=0;mask<1024;mask+=1){
  const width=popcount(mask),classes=roleClasses(mask),pairs=pairCounts(mask),mu=Math.min(...Object.values(pairs));
  classSpectrum[classes]=(classSpectrum[classes]||0)+1;
  muSpectrum[mu]=(muSpectrum[mu]||0)+1;
  widthMu[width]??={}; widthMu[width][mu]=(widthMu[width][mu]||0)+1;
  familyPairRows+=Object.keys(pairs).length;
  maskRows.push({mask,width,classes,pairs,mu,family:maskFamily(mask)});
}
assert.equal(maskRows.length,1024);
assert.equal(familyPairRows,10240);
assert.deepEqual(classSpectrum,{'1':1,'2':10,'3':44,'4':174,'5':795});
assert.deepEqual(muSpectrum,{'0':229,'1':446,'2':288,'3':57,'4':4});
assert.deepEqual(widthMu,{
  '0':{'0':1},'1':{'0':10},'2':{'0':45},'3':{'0':92,'1':28},
  '4':{'0':61,'1':144,'2':5},'5':{'0':18,'1':188,'2':46},
  '6':{'0':2,'1':78,'2':129,'3':1},'7':{'1':8,'2':96,'3':16},
  '8':{'2':12,'3':32,'4':1},'9':{'3':8,'4':2},'10':{'4':1},
});

const erasureCases={};
const robustCounts={};
const minimumWidths={};
const minimumFamilies={};
let totalDeletionCases=0,criterionComparisons=0,criterionMismatches=0;
for(let e=0;e<=4;e+=1){
  let cases=0,robust=0,minWidth=Infinity; const minima=[];
  for(const row of maskRows){
    if(row.width<e) continue;
    const deletions=eraseMasks(row.mask,e); cases+=deletions.length; totalDeletionCases+=deletions.length;
    let direct=true;
    for(const erased of deletions){
      const retained=row.mask&~erased;
      if(roleClasses(retained)!==5) direct=false;
    }
    const multiplicityCriterion=row.mu>=e+1;
    criterionComparisons+=1;
    if(direct!==multiplicityCriterion) criterionMismatches+=1;
    if(direct){
      robust+=1;
      if(row.width<minWidth){ minWidth=row.width; minima.length=0; minima.push(row.family); }
      else if(row.width===minWidth) minima.push(row.family);
    }
  }
  erasureCases[e]=cases;
  robustCounts[e]=robust;
  minimumWidths[e]=Number.isFinite(minWidth)?minWidth:null;
  minimumFamilies[e]=minima;
}

assert.deepEqual(erasureCases,{'0':1024,'1':5120,'2':11520,'3':15360,'4':13440});
assert.equal(totalDeletionCases,46464);
assert.equal(criterionComparisons,4876);
assert.equal(criterionMismatches,0);
assert.deepEqual(robustCounts,{'0':795,'1':349,'2':61,'3':4,'4':0});
assert.deepEqual(minimumWidths,{'0':3,'1':4,'2':6,'3':8,'4':null});
assert.equal(minimumFamilies[0].length,28);
assert.equal(minimumFamilies[1].length,5);
assert.equal(minimumFamilies[2].length,1);
assert.equal(minimumFamilies[3].length,1);
assert.equal(minimumFamilies[4].length,0);

const expectedE1=[
  ['BRTM','RM','RT','BR'],['RTM','BRM','BRT','R'],['RTM','BRM','RT','BR'],
  ['RTM','BRT','RM','BR'],['BRM','BRT','RM','RT'],
];
assert.equal(familyListKey(minimumFamilies[1]),familyListKey(expectedE1));
assert.equal(familyKey(minimumFamilies[2][0]),familyKey(['RTM','BRM','BRT','RM','RT','BR']));
assert.equal(familyKey(minimumFamilies[3][0]),familyKey(['BRTM','RTM','BRM','BRT','RM','RT','BR','R']));

const fullMask=(1<<10)-1;
const fullPairs=pairCounts(fullMask);
assert.deepEqual(fullPairs,{'A-B':5,'A-T':4,'A-M':5,'A-R':8,'B-T':5,'B-M':6,'B-R':5,'T-M':5,'T-R':4,'M-R':5});
assert.equal(muOf(fullMask),4);
const bottlenecks=Object.entries(fullPairs).filter(([,n])=>n===4).map(([key])=>key.split('-'));
assert.equal(familyListKey(bottlenecks),familyListKey([['A','T'],['T','R']]));

// Explicit impossibility witness: erase the four probes that separate a bottleneck pair.
for(const [a,b] of bottlenecks){
  let distinguishingMask=0;
  for(let i=0;i<probes.length;i+=1) if(probeHas[probes[i]][a]!==probeHas[probes[i]][b]) distinguishingMask|=(1<<i);
  assert.equal(popcount(distinguishingMask),4);
  const retained=fullMask&~distinguishingMask;
  assert.equal(signature(retained,a),signature(retained,b));
  assert.notEqual(roleClasses(retained),5);
}

// Only after the independent reconstruction is complete may the hostile inspect child output.
const childModule=await import('../app/dome-world/previews/a15-r0/finite-topological-probe-separation-redundancy.js');
const child=childModule.finiteTopologicalProbeSeparationRedundancyCertificate();
assert.equal(child.passed,true);
assert.equal(child.parent_receipt,'3662f48ed7ad1345dc013fa6eb50bc4835a15e10');
assert.deepEqual(child.probes.nontrivial,probes);
assert.deepEqual(child.family_census.role_class_spectrum,classSpectrum);
assert.deepEqual(child.family_census.separation_multiplicity_spectrum,muSpectrum);
assert.deepEqual(child.family_census.width_mu_spectrum,widthMu);
assert.deepEqual(child.erasure_redundancy.exact_erasure_case_counts,erasureCases);
assert.equal(child.erasure_redundancy.total_erasure_cases,totalDeletionCases);
assert.equal(child.erasure_redundancy.criterion_family_order_comparisons,criterionComparisons);
assert.equal(child.erasure_redundancy.criterion_mismatches,criterionMismatches);
assert.deepEqual(child.erasure_redundancy.robust_family_counts,robustCounts);
assert.deepEqual(child.erasure_redundancy.minimum_width_by_erasure_order,minimumWidths);
assert.equal(child.erasure_redundancy.minimum_families_by_erasure_order['0'].length,minimumFamilies[0].length);
assert.equal(familyListKey(child.erasure_redundancy.minimum_families_by_erasure_order['1']),familyListKey(minimumFamilies[1]));
assert.equal(familyListKey(child.erasure_redundancy.minimum_families_by_erasure_order['2']),familyListKey(minimumFamilies[2]));
assert.equal(familyListKey(child.erasure_redundancy.minimum_families_by_erasure_order['3']),familyListKey(minimumFamilies[3]));
assert.deepEqual(child.full_family_wall.pair_separations,fullPairs);
assert.equal(child.full_family_wall.mu,4);
assert.equal(familyListKey(child.full_family_wall.bottleneck_pairs),familyListKey(bottlenecks));
assert.equal(child.full_family_wall.four_erasure_recovery_possible,false);
for(const value of Object.values(child.authority)) assert.equal(value,false);

console.log('Ash A15-R0 independent hostile finite topological probe separation reconstruction passed: 1,024 families / 46,464 erasure cases / sharp e=3 wall.');
