import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(process.argv[2] ?? path.join(import.meta.dirname,'candidate'));
const file=path.join(root,'instance/index.html');
const original=fs.readFileSync(file,'utf8');
const sha=x=>createHash('sha256').update(x).digest('hex');
const expected='e5f643dc527dc3673cc9d719517f5b32bbda56aa25a80b5257ab5d38d78689eb';
if(sha(Buffer.from(original))!==expected)throw Error('Unexpected presentation predecessor');
const css=`
/* Em instance presentation: pink reading architecture; unchanged mathematical artwork. */
:root{--vixen-pink:#FF91AF;--arc-flash:#F9F36D;--graphite:#24282A;--nickel:#667078;--porcelain:#F6F4F0;--bg:var(--vixen-pink);--surface:var(--vixen-pink);--surface-2:var(--porcelain);--text:var(--graphite);--muted:var(--graphite);--dim:var(--graphite);--ice:var(--graphite);--gold:var(--arc-flash);--rose:var(--graphite);--violet:var(--graphite);--signal:var(--graphite);--paper:var(--porcelain);--red:var(--graphite);--line:#24282A40;--line-strong:#24282A80}
.site-header,body[data-view="overview"] .site-header{background:#FF91AFF5;color:var(--graphite)}
.brand-name .project-math,.brand-sub,.nav-btn:hover,.footer strong{color:var(--graphite)}
.mobile-nav{background:var(--vixen-pink);color:var(--graphite)}
.archive-directory,.procession-section{background:var(--vixen-pink);color:var(--graphite);--text:var(--graphite);--muted:var(--graphite);--dim:var(--graphite);--signal:var(--graphite);--ice:var(--graphite);--line:#24282A40;--line-strong:#24282A80}
.archive-directory .stat-value,.archive-directory .stat-label,.archive-directory .stat-label small,.directory-title h2 em,.stat-btn>.icon{color:var(--graphite)}
.editorial-questions,.lexicon-reader,.dialog{--text:var(--graphite);--muted:var(--graphite);--dim:var(--graphite);--ice:var(--graphite);--rose:var(--graphite);--gold:var(--graphite);--violet:var(--graphite);--signal:var(--graphite)}
.editorial-caption,.path-index,.research-path p,.research-path:hover{color:var(--graphite)}
.source-row:hover h2{color:var(--graphite);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.15em}
.search-dialog{background:var(--graphite);color:var(--porcelain);--text:var(--porcelain);--muted:var(--porcelain);--dim:var(--porcelain);--ice:var(--vixen-pink);--signal:var(--vixen-pink);--line:#F6F4F040;--line-strong:#F6F4F080}
::selection{background:var(--graphite);color:var(--porcelain)}
.hero-art figcaption{color:var(--porcelain);background:var(--graphite)}
.procession-header>p:last-child,.procession-section .stage-label,.procession-section .reader-notice{color:var(--graphite)}
.cover-title{color:var(--vixen-pink)}
.cover-word-two{font-size:.55em}
.cover-serial{display:block;font-size:.34em;color:var(--arc-flash);margin:.4em 0 0;text-align:right}
.cover-marginalia{max-width:29ch;color:var(--porcelain)}
[data-subtitle-status]{color:var(--porcelain)}
.brand-name .project-math{display:block;font:italic 500 11px/1.4 var(--font-serif);letter-spacing:0;color:var(--graphite)}
.instance-math{font-family:var(--font-serif);font-size:1em;color:inherit}
.source-text{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.8 var(--font-mono);max-height:60vh;overflow:auto}
.scope-line{font:11px/1.6 var(--font-mono);color:var(--muted);margin:12px 0}
.tag.gold{color:var(--arc-flash);border-color:var(--arc-flash);background:var(--graphite)}
@media(max-width:680px){.brand-name{max-width:52vw;white-space:normal}.cover-word-two{font-size:.64em}.cover-serial{font-size:.32em}.cover-marginalia{max-width:22ch}.brand-name .project-math{font-size:10px}}
@media(forced-colors:active){.cover-title,.cover-serial,.cover-marginalia{color:CanvasText}}
`;
const re=/<style id="manifest-instance-theme">[\s\S]*?<\/style>/;
if(!re.test(original))throw Error('Theme layer missing');
const revised=original.replace(re,()=>'<style id="manifest-instance-theme">'+css+'</style>');
if(original.replace(re,'')!==revised.replace(re,''))throw Error('Change escaped presentation layer');
fs.writeFileSync(file,revised);
const receipt={author:'𝌋',scope:'EM_PRESENTATION_RENDERED_REVIEW',basis:['Actual Edge cover screenshot','Actual Edge Corpus screenshot'],demonstrated_defect:'Graphite dominated both header and Corpus reading architecture despite dominant Baker–Miller commission.',change:'Pink reading surfaces/header/mobile menu, graphite text and borders, legible hover; preserve monochrome artwork and pink title; Arc Flash reserved for title math and rare tagged accents.',before_sha256:expected,after_sha256:sha(Buffer.from(revised)),only_theme_layer_changed:true,corpus_changes:0,original_fonts_changed:false,original_artwork_changed:false,native_code_changed:false,rendered_after_status:'NOT_YET_OBSERVED',scientific_authority:false,operator_closure:'RESERVED'};
fs.writeFileSync(path.join(import.meta.dirname,'presentation-correction.json'),JSON.stringify(receipt,null,2));
console.log(JSON.stringify(receipt));
