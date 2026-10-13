export const ASH_A6_REST_WORLD_ANSWER_VERSION = 'td613.ash.a6-rest-world-answer/v0.1';

const host = globalThis.window;
const doc = globalThis.document;
let installed = false;

const REST_COPY = '𝄐 Structural Rest: new lesson, route, task, and Play demands are held. The current consequence, exact inspection, continuity, return, exit, and human closure posture remain available.';
const RETURN_COPY = 'Returned from structural Rest. The same case and consequence remain; explicit explanation controls are available again.';

function reconcile(source = 'REFRESH') {
  const status = doc?.getElementById?.('ashA6LessonStatus');
  if (!status) return false;
  const resting = doc.body?.dataset?.ashAiaResting === 'true';
  if (resting) status.textContent = REST_COPY;
  else if (source === 'RETURN_GESTURE') status.textContent = RETURN_COPY;
  doc.documentElement.dataset.ashA6RestWorldAnswer = resting ? 'STRUCTURAL_REST_VISIBLE' : 'AVAILABLE';
  host.dispatchEvent(new CustomEvent('td613:ash:a6-rest-world-answer', {
    detail:Object.freeze({
      version:ASH_A6_REST_WORLD_ANSWER_VERSION,
      source,
      resting,
      visible_answer:status.textContent,
      authority_changed:false,
      source_bytes_moved:false,
      custody_changed:false,
      release_posture_changed:false,
      closure_changed:false,
      human_closure_required:true
    })
  }));
  return true;
}

export function installAshA6RestWorldAnswer() {
  if (!host || !doc?.body || installed) return false;
  installed = true;
  host.addEventListener('td613:ash:a6-affordance-refreshed', () => reconcile('A6_REFRESHED'));
  doc.addEventListener('click', event => {
    const control = event.target?.closest?.('[data-aia-rest],[data-aia-return]');
    if (!control) return;
    queueMicrotask(() => reconcile(control.matches('[data-aia-return]') ? 'RETURN_GESTURE' : 'REST_GESTURE'));
  });
  host.__td613AshA6RestWorldAnswer = Object.freeze({
    version:ASH_A6_REST_WORLD_ANSWER_VERSION,
    refresh:reconcile,
    current:() => Object.freeze({
      resting:doc.body?.dataset?.ashAiaResting === 'true',
      visible_answer:doc.getElementById('ashA6LessonStatus')?.textContent || null,
      authority_changed:false,
      source_bytes_moved:false,
      human_closure_required:true
    })
  });
  queueMicrotask(() => reconcile('INSTALL'));
  return true;
}

if (host && doc) installAshA6RestWorldAnswer();
