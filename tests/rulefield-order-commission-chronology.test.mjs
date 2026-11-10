import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base=new URL('../',import.meta.url);
const shelves=['packages/atlas-after-hours/commissions/','packages/rulefield/rulefields/research/commissions/'];
const titles=[
  {
    "order": "01",
    "title": "THE_RULE_THAT_STUDIES_ITSELF",
    "sha": null
  },
  {
    "order": "02",
    "title": "THE_INSTITUTION_THAT_LEARNED_TO_IMITATE_ITS_OWN_ERROR",
    "sha": "92fb9300f6f74fe6750a0c6230fe7caeb6a64f64"
  },
  {
    "order": "03",
    "title": "THE_NOTARY_WHO_NEVER_SAW_THE_WITNESS",
    "sha": "3c3a9ad0566bdfc616890a3523d6bf3bac3be0a4"
  },
  {
    "order": "04",
    "title": "THE_NOTARY_WHO_COULD_READ_EVERY_WORD_EXCEPT_THE_OBJECTION",
    "sha": "94b408050454f4b6b3913c2e570002412473cc89"
  },
  {
    "order": "05",
    "title": "THE_STAY_THAT_TESTIFIED_AGAINST_ITS_AUTHOR",
    "sha": "1bd6978f6756d3941de23b0ad139d8f78733cda1"
  },
  {
    "order": "06",
    "title": "THE_REMEDY_THAT_MADE_ITS_OWN_WITNESS_DISAPPEAR",
    "sha": "283e4e4da93440233cdb8a9144c0c9e166a194ac"
  },
  {
    "order": "07",
    "title": "THE_INSPECTOR_WHO_FOUND_THE_BUILDING_BUT_COULD_NOT_FIND_ITS_PEOPLE",
    "sha": "a09548fc71207125d9d1a59f18ff5b3b3f3acfb6"
  },
  {
    "order": "08",
    "title": "THE_HOME_THAT_SURVIVED_ITS_INHABITANTS",
    "sha": "b12113c4be61fd839c3160a8ee38335a28c6c88f"
  },
  {
    "order": "09",
    "title": "THE_CITY_THAT_ARRIVED_BEFORE_ITS_PEOPLE",
    "sha": "d28cafd9b53f814182f9bbbb141960f94d8b2135"
  }
];
const gitBlob=(buf)=>createHash('sha1').update(Buffer.from('blob '+buf.length+'\0')).update(buf).digest('hex');
test('nine chronological narrative entries, issued titles intact',()=>{for(const s of shelves){if(!existsSync(new URL(s,base)))continue;const f=readdirSync(new URL(s,base)).filter(x=>x.startsWith('ORDER-')&&x.endsWith('.md')).sort();assert.equal(f.length,9,s);assert.deepEqual(f,titles.map(x=>'ORDER-'+x.order+'_'+x.title+'.md'),s)}});
test('narrative dossiers retain exact original Git blobs and authoritative full IX',()=>{for(const s of shelves){if(!existsSync(new URL(s,base)))continue;for(const x of titles.slice(1)){const p=new URL(s+'ORDER-'+x.order+'_'+x.title+'.md',base);assert.equal(gitBlob(readFileSync(p)),x.sha,p.pathname)}}});
test('first order entrypoint refuses to invent a missing commission',()=>{for(const s of shelves){if(!existsSync(new URL(s,base)))continue;const v=readFileSync(new URL(s+'ORDER-01_THE_RULE_THAT_STUDIES_ITSELF.md',base),'utf8');assert.match(v,/NOT a fabricated independent Order-I commission/);assert.match(v,/SEVEN_CHAMBER|SEVEN-CHAMBER|Seven-Chamber/i);}});
