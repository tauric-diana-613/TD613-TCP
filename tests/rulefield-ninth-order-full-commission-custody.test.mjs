import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const source=resolve(root,"packages/rulefield/rulefields/research/NINTH_ORDER_ARGON_COMMISSION_RESEARCH_ESTATE.md");
const math=resolve(root,"packages/rulefield/lab/ninth_order_hidalgo_stokes_research.mjs");
const main=resolve(root,"packages/rulefield/lab/ninth_order_confluence.mjs");
const general=resolve(root,"packages/rulefield/lab/ninth_order_generalization.mjs");
const ancestral=resolve(root,"packages/rulefield/sources/wolfram-rule-atlas-20261107/");
const originalCode=resolve(root,"packages/rulefield/rulefields/research/ARGON_NINTH_ORDER_CANDIDATE_V_ORIGINAL_CODE_TRANSCRIPTION.mjs");
const originalTests=resolve(root,"packages/rulefield/rulefields/research/ARGON_NINTH_ORDER_CANDIDATE_V_ORIGINAL_TESTS_TRANSCRIPTION.md");
const ancestry=[
  "THE_CATASTROPHE_OF_CONFLUENCE_A_VWB_FREESTYLE_MANIFESTO.md",
  "VIRILIAN_WOLFRAMIAN_BERLANTIAN_RELATIONAL_GEOMETRY.md",
  "VIRILIAN_WOLFRAMIAN_BERLANTIAN_PHASONIC_OBSERVATORY.html",
  "TD613_NKS_Rule_Atlas_Convergence_Edition.json"
];
test("source historical estate and restored scientific inquiry are co-present",()=>{
 for(const p of [source,math,main,general,originalCode,originalTests,...ancestry.map(x=>resolve(ancestral,x))])
   assert.ok(existsSync(p),"Historical or Ninth-Order source omitted from portable ZIP: "+p);
});
test("full-size researcher commission preserves named crossings and candidate distinctions",()=>{
 const c=readFileSync(source,"utf8");
 assert.ok(c.length>20000,"Research estate suspiciously compressed to "+c.length+" characters");
 for(const token of ["Hidalgo","Hägerstrand","Berlant","Wolfram","Stokes","Virilio",
   "Glissant","Sedgwick","GIS","time–space compression","Geographical Impasse Basin",
   "Synchronic Capability Tensor","Synchronization Prism Rank","SO(3)",
   "Autopoietic Counter-Holonomy","Ω_SCR","Delta-Elite",
   "Argon candidate I","Argon candidate II","Argon candidate III","Argon candidate IV","Argon candidate V",
   "X-086","X-095","C-25","C-30",
   "ΣA","ΣB","ΣC","ΣD","ΣR",
   "Human closure RESERVED","not a byte-exact transcript"])
   assert.ok(c.toLowerCase().includes(token.toLowerCase()),"Missing commissioned topic: "+token);
});
test("research source identifies analysis rather than claiming to have preserved exact conversations",()=>{
 const c=readFileSync(source,"utf8");
 assert.match(c,/not a byte-exact transcript/i);
 assert.match(c,/original source claim|source claim/i);
 assert.match(c,/counterexample/i);
 assert.match(c,/human scientific decision/i);
});

test("Original Candidate V source is independently retained with its mathematically falsifiable prediction",async()=>{
 const sourceCode=readFileSync(originalCode,"utf8");
 const historicTests=readFileSync(originalTests,"utf8");
 for(const phrase of ["HIDALGO_CAPABILITY_MATRIX","evaluateSynchronizedCapabilityRank","auditGeographicImpasseAndAffect","runHolonomyResearchChamber"])assert.ok(sourceCode.includes(phrase));
 assert.match(historicTests,/rank 4 -> 2/);
 const original=await import("../packages/rulefield/rulefields/research/ARGON_NINTH_ORDER_CANDIDATE_V_ORIGINAL_CODE_TRANSCRIPTION.mjs");
 assert.equal(original.matrixRank(original.HIDALGO_CAPABILITY_MATRIX),5);
 assert.equal(original.evaluateSynchronizedCapabilityRank("World_Alpha_Centralization").synchronizedCapabilityRank,4);
 assert.equal(original.NINTH_ORDER_CONTRACT.humanScientificClosure,"STRICTLY_RESERVED");
});
