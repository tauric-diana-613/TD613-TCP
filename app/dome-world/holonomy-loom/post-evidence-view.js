/* TD613 Loom · finished empirical proof card / staged product artwork.
 * This module is intentionally absent from the production import graph.
 * PREVIEW_ONLY: no candidate, self-report, CI pass, synthetic test, Neon row,
 * or local digest authorizes mounting the success presentation.
 * A future independently adjudicated same-episode L/R/J/G/C receipt, with
 * source-bound backend admission and operator approval, must unlock it.
 */
import { LOOM_POST_EVIDENCE_COPY } from './post-evidence-copy.js';

export const LOOM_EVIDENCE_ART_DIRECTION = Object.freeze({
  schema:'td613.loom.evidence-art-direction/v0.1',
  activation:'STAGED_UNMOUNTED',
  title:'The work held up. The privacy test did too.',
  placement:'After review and independent adjudication; never as a tutorial simulation.',
  visual_family:'couture-glass / restrained typographic lead / concise test scope',
  prohibited:['unqualified security guarantee','self-attested unlock','synthetic pass used as real-world measurement','automatic issue-405 release']
});
const EVIDENCE_ROWS=Object.freeze([
  Object.freeze({id:'L',title:'What outsiders could learn',caption:'Measured information exposure'}),
  Object.freeze({id:'R',title:'How well the work survived',caption:'Authorized task reconstructed'}),
  Object.freeze({id:'J',title:'What combined clues revealed',caption:'Joined-information exposure'}),
  Object.freeze({id:'G',title:'How the route behaved',caption:'Geometry and measurement calibration'}),
  Object.freeze({id:'C',title:'Both journeys returned',caption:'Matched control and protected results'})
]);
function element(doc,name,cls,content){
  const node=doc.createElement(name);
  if(cls)node.className=cls;
  if(content!==undefined)node.textContent=content;
  return node;
}
/**
 * Finished visual construction, not released proof. Always returns hidden.
 * Display must be authorized by a future provenance-backed review integration,
 * never by this module receiving a truthy flag from arbitrary client data.
 */
export function createStagedLoomEvidenceView(doc){
  if(!doc?.createElement)throw new TypeError('Document required');
  const section=element(doc,'section','loom-empirical-evidence');
  section.hidden=true;
  section.dataset.claimStatus='STAGED_UNAUTHORIZED';
  section.setAttribute('aria-labelledby','loomEvidenceHeadline');
  section.append(element(doc,'p','loom-evidence-eyebrow','INDEPENDENT PRIVACY TEST'));
  const title=element(doc,'h2','loom-evidence-title',LOOM_POST_EVIDENCE_COPY.evidence_headline);
  title.id='loomEvidenceHeadline';section.append(title);
  section.append(element(doc,'p','loom-evidence-intro',LOOM_POST_EVIDENCE_COPY.evidence_body));
  const grid=element(doc,'div','loom-evidence-grid');
  for(const item of EVIDENCE_ROWS){
    const card=element(doc,'div','loom-evidence-metric');
    card.dataset.surface=item.id;
    card.append(element(doc,'span','loom-evidence-coordinate',item.id));
    card.append(element(doc,'h3','loom-evidence-label',item.title));
    card.append(element(doc,'p','loom-evidence-caption',item.caption));
    const value=element(doc,'output','loom-evidence-value','—');
    value.dataset.evidenceValue=item.id;
    card.append(value);grid.append(card);
  }
  section.append(grid);
  const foot=element(doc,'div','loom-evidence-footer');
  foot.append(element(doc,'p','loom-evidence-scope',LOOM_POST_EVIDENCE_COPY.scope));
  foot.append(element(doc,'span','loom-evidence-action',LOOM_POST_EVIDENCE_COPY.evidence_action));
  section.append(foot);
  return section;
}
