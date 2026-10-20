// 𝌋 TD613 · original Google SSE terminal-status introspection (inert, offline).
// A HTTP-200 stream may contain model text yet terminate with provider feedback
// instead of a candidate STOP. Preserve the distinction; no text repair/retry.
import assert from 'node:assert/strict';

export function observeGoogleSseTerminal(input){
  const raw=Buffer.isBuffer(input)?input.toString('utf8'):input;
  assert.equal(typeof raw,'string','SSE_RAW_STRING_REQUIRED');
  let events=0,hasCandidate=false,latestCandidateFinish=null,
      terminalKind='NONE',terminalBlockReason=null,terminalFeedbackAt=null;
  for(const block of raw.split(/\r?\n\r?\n/)){
    const rows=block.split(/\r?\n/).filter(line=>line.startsWith('data:'))
      .map(line=>line.slice(5).trimStart());
    if(!rows.length)continue;
    if(rows[0]==='[DONE]'){terminalKind='DONE_SENTINEL';continue;}
    const data=JSON.parse(rows.join('\n'));
    events++;
    if(data.candidates?.length){
      hasCandidate=true;
      for(const c of data.candidates){
        if(typeof c.finishReason==='string' && c.finishReason)
          latestCandidateFinish=c.finishReason;
      }
      terminalKind='CANDIDATE';
    }
    if(data.promptFeedback){
      terminalKind='PROMPT_FEEDBACK';
      terminalBlockReason=data.promptFeedback.blockReason??null;
      terminalFeedbackAt=events;
    }
  }
  const completed=hasCandidate&&latestCandidateFinish==='STOP'
    &&terminalBlockReason===null;
  return Object.freeze({events,hasCandidate,latestCandidateFinish,
    terminalKind,terminalBlockReason,terminalFeedbackAt,completed,
    interpretation:completed?'CANDIDATE_STOP_OBSERVED':'UNFINISHED_OR_BLOCKED_HOLD'});
}
