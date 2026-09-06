import { compileInformationDomeField } from '../engine/information-dome-field.js';

const FIXTURES = Object.freeze([
  '../dome-world/fixtures/pedagogue/gluing-soft-fold.json',
  '../dome-world/fixtures/pedagogue/phason-content-invariant.json',
  '../dome-world/fixtures/pedagogue/moire-pair-emergence.json'
]);

const QUESTS = Object.freeze({
  GLUING_OBSTRUCTION: {
    badge: 'Doorway quest',
    title: 'Find the sticky doorway',
    blurb: 'Two rooms can look connected while the seam still matters.'
  },
  CONTENT_INVARIANT_PHASON: {
    badge: 'Window quest',
    title: 'Same toy, different window',
    blurb: 'The source can stay put while the way you see it changes.'
  },
  PAIR_EMERGENT_MOIRE: {
    badge: 'Friendship quest',
    title: 'Spot the pair-only pattern',
    blurb: 'Sometimes a relation appears only when two views meet.'
  }
});

const ROOMS = Object.freeze({
  EXPERIENTIAL: {
    icon: '☀',
    badge: 'Sunroom',
    title: 'What happened?',
    blurb: 'Start with the visible consequence before any technical names.'
  },
  CUSTODIAL: {
    icon: '🔑',
    badge: 'Key Room',
    title: 'Who holds what?',
    blurb: 'See which station holds the scene, and which powers stay closed.'
  },
  AUDIT: {
    icon: '🔎',
    badge: 'Detective Attic',
    title: 'What does not add up yet?',
    blurb: 'Look for missing pieces, contradictions, and claim limits.'
  },
  IMPLEMENTATION: {
    icon: '🧰',
    badge: 'Workshop',
    title: 'How is it built?',
    blurb: 'Open the mechanism only after you already know the consequence.'
  }
});

const state = {
  field: null,
  questIndex: 0,
  route: null,
  resting: false,
  routeTrail: []
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}

function listCard(title, values) {
  const card = el('section', 'grownup-drawer__card');
  card.append(el('h3', null, title));
  const list = el('ul');
  for (const value of values || []) list.append(el('li', null, typeof value === 'string' ? value : JSON.stringify(value)));
  if (!list.childElementCount) list.append(el('li', null, 'None declared.'));
  card.append(list);
  return card;
}

function currentPackage() {
  return state.field.scene_packages[state.questIndex];
}

function questMeta(sceneKind) {
  return QUESTS[sceneKind] || { badge: 'Practice quest', title: sceneKind, blurb: 'A governed Pedagogue practice scene.' };
}

function setPressed(root, selector, predicate) {
  for (const node of root.querySelectorAll(selector)) node.setAttribute('aria-pressed', String(predicate(node)));
}

function renderRouteTrail(root) {
  const trail = root.querySelector('[data-route-memory]');
  if (!state.routeTrail.length) {
    trail.textContent = 'You have not entered a room yet.';
    return;
  }
  const labels = state.routeTrail.map(route => ROOMS[route]?.badge || route);
  trail.textContent = `Your path: Front porch → ${labels.join(' → ')}. Same quest, route history kept.`;
}

function renderWorldAnswer(root, packageView) {
  const meta = questMeta(packageView.scene_kind);
  root.querySelector('[data-quest-title]').textContent = meta.title;
  const answer = packageView.phase_sequence[3]?.name?.plain_language
    || packageView.phase_sequence[2]?.static_equivalent?.summary
    || 'The practice scene answered.';
  root.querySelector('[data-world-answer]').textContent = state.resting
    ? 'Nap nook is holding this consequence. Nothing new is being asked of you.'
    : answer;
  root.querySelector('[data-required-nonclaim]').textContent = packageView.required_nonclaim;
}

function beat(title, value) {
  const section = el('section', 'room-panel__beat');
  section.append(el('h3', null, title));
  section.append(el('p', null, value));
  return section;
}

function renderRoom(root, packageView) {
  const stage = root.querySelector('[data-room-stage]');
  stage.replaceChildren();

  if (!state.route) {
    const empty = el('div', 'room-stage__empty');
    empty.append(el('span', null, '✦'));
    empty.append(el('h2', null, 'Front porch'));
    empty.append(el('p', null, 'See the consequence first. Then choose a room when you want another view.'));
    stage.append(empty);
    return;
  }

  const view = packageView.aia_views[state.route];
  const meta = ROOMS[state.route];

  const panel = el('article', 'room-panel');
  const header = el('header', 'room-panel__header');
  header.append(el('div', 'room-panel__icon', meta.icon));
  const headerText = el('div');
  headerText.append(el('h2', null, `${meta.badge} · ${meta.title}`));
  headerText.append(el('p', null, meta.blurb));
  header.append(headerText);
  panel.append(header);

  const beats = el('div', 'room-panel__beats');
  const consequence = packageView.phase_sequence[2]?.static_equivalent?.summary
    || packageView.phase_sequence[3]?.name?.plain_language
    || 'Observed consequence preserved.';
  beats.append(beat('NOW', consequence));
  beats.append(beat('WHY', view.purpose));
  beats.append(beat('NEXT', 'Visit another room, replay the quest, rest, or leave through the front door.'));
  panel.append(beats);

  const details = el('details', 'grownup-drawer');
  details.append(el('summary', null, 'Open the grown-up drawer'));
  const grid = el('div', 'grownup-drawer__grid');
  grid.append(listCard('Route order', view.surface.order));
  grid.append(listCard('Missing pieces', view.invariants.missingness));
  grid.append(listCard('Contradictions', view.invariants.contradictions));
  grid.append(listCard('Allowed claims', view.claim_ceiling.allowed_claims));
  grid.append(listCard('Forbidden claims', view.claim_ceiling.forbidden_claims));
  grid.append(listCard('Alternative explanations', packageView.research_frame.alternative_explanations));
  grid.append(listCard('Falsifier', packageView.research_frame.falsifier));

  const exact = el('section', 'grownup-drawer__card');
  exact.append(el('h3', null, 'EXACT'));
  exact.append(el('pre', null, JSON.stringify({
    scene_kind: packageView.scene_kind,
    route: view.route,
    station_owner: view.station_owner,
    authorized_actions: view.authorized_actions,
    closure: view.closure,
    authority: view.authority
  }, null, 2)));
  grid.append(exact);
  details.append(grid);
  panel.append(details);
  stage.append(panel);
}

function render() {
  const root = document.querySelector('[data-pedagogue-playhouse]');
  const packageView = currentPackage();
  setPressed(root, '[data-quest-index]', node => Number(node.dataset.questIndex) === state.questIndex);
  setPressed(root, '[data-route]', node => node.dataset.route === state.route);
  root.dataset.resting = String(state.resting);
  renderWorldAnswer(root, packageView);
  renderRouteTrail(root);
  renderRoom(root, packageView);

  const speech = root.querySelector('[data-guide-speech]');
  if (state.resting) {
    speech.textContent = 'Nap nook is open. The last consequence stays visible; return and exit still work.';
  } else if (state.route) {
    speech.textContent = `${ROOMS[state.route].badge} is open. I keep the path, but I do not turn your path into a score.`;
  } else {
    speech.textContent = 'I’m fictional on purpose. Pick a room only when you want another angle.';
  }
}

function chooseQuest(index) {
  state.questIndex = index;
  state.route = null;
  state.resting = false;
  state.routeTrail = [];
  render();
}

function chooseRoom(route) {
  state.route = route;
  state.resting = false;
  if (state.routeTrail.at(-1) !== route) state.routeTrail.push(route);
  render();
}

async function load() {
  const responses = await Promise.all(FIXTURES.map(path => fetch(path)));
  for (const response of responses) if (!response.ok) throw new Error(`Practice quest could not load: ${response.url}`);
  const fixtures = await Promise.all(responses.map(response => response.json()));
  state.field = await compileInformationDomeField(fixtures, { cryptoImpl: globalThis.crypto });

  const root = document.querySelector('[data-pedagogue-playhouse]');
  const questNav = root.querySelector('[data-quest-nav]');
  state.field.scene_packages.forEach((scene, index) => {
    const meta = questMeta(scene.scene_kind);
    const button = el('button', 'quest-card');
    button.type = 'button';
    button.dataset.questIndex = String(index);
    button.setAttribute('aria-pressed', String(index === state.questIndex));
    button.append(el('span', 'quest-card__badge', meta.badge));
    button.append(el('strong', null, meta.title));
    button.append(el('p', null, meta.blurb));
    button.addEventListener('click', () => chooseQuest(index));
    questNav.append(button);
  });

  const roomNav = root.querySelector('[data-room-nav]');
  for (const [route, meta] of Object.entries(ROOMS)) {
    const button = el('button', 'room-card');
    button.type = 'button';
    button.dataset.route = route;
    button.setAttribute('aria-pressed', 'false');
    button.append(el('span', 'room-card__badge', `${meta.icon} ${meta.badge}`));
    button.append(el('strong', null, meta.title));
    button.append(el('p', null, meta.blurb));
    button.addEventListener('click', () => chooseRoom(route));
    roomNav.append(button);
  }

  root.querySelector('[data-rest]').addEventListener('click', () => {
    state.resting = true;
    render();
  });
  root.querySelector('[data-return]').addEventListener('click', () => {
    state.resting = false;
    render();
  });
  root.querySelector('[data-replay]').addEventListener('click', () => chooseQuest(state.questIndex));

  root.removeAttribute('aria-busy');
  render();
}

function hold(error) {
  const root = document.querySelector('[data-pedagogue-playhouse]');
  root.removeAttribute('aria-busy');
  root.dataset.held = 'true';
  root.querySelector('[data-world-answer]').textContent = `Playhouse held: ${error.message}`;
  root.querySelector('[data-guide-speech]').textContent = 'I stopped instead of guessing. The front door still works.';
}

load().catch(hold);
