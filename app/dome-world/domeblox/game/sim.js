import { CANONICAL, G, SAVE_KEY, clamp, lerp, distance, format, capitalize, objectives, appendLedger, message, saveState } from './core.js';
import { drawMap } from './render.js';

const seasons = ['spring', 'summer', 'autumn', 'winter'];

export function needsEfficiency() { const needs = G.state.player.needs; return clamp((needs.hunger + needs.thirst + needs.rest + needs.release) / 4); }
function strengthen(name, amount) { G.state.world.tendencies[name] = clamp((G.state.world.tendencies[name] || .1) + amount); }
function advanceObjective(index) { if (G.state.player.objective === index) G.state.player.objective = Math.min(objectives.length - 1, index + 1); }

export function update(delta) {
  if (!G.running || G.mapOpen || G.springaldOpen) return;
  const move = { x: 0, y: 0 };
  if (G.keys.has('w') || G.keys.has('arrowup')) move.y -= 1;
  if (G.keys.has('s') || G.keys.has('arrowdown')) move.y += 1;
  if (G.keys.has('a') || G.keys.has('arrowleft')) move.x -= 1;
  if (G.keys.has('d') || G.keys.has('arrowright')) move.x += 1;
  move.x += G.pointer.x; move.y += G.pointer.y;
  const length = Math.hypot(move.x, move.y);
  if (length > .05) {
    const speed = 115 * (.55 + needsEfficiency() * .45);
    move.x /= Math.max(1, length); move.y /= Math.max(1, length);
    G.state.player.x += move.x * speed * delta; G.state.player.y += move.y * speed * delta;
    G.state.player.facing = Math.atan2(move.y, move.x);
    const radius = Math.hypot(G.state.player.x / 1.12, G.state.player.y / .82);
    if (radius > 460) { G.state.player.x *= 460 / radius; G.state.player.y *= 460 / radius; }
  }
  G.camera.x = lerp(G.camera.x, G.state.player.x, clamp(delta * 3));
  G.camera.y = lerp(G.camera.y, G.state.player.y, clamp(delta * 3));
  updateAnimals(delta); updateParticles(delta); findInteraction();
  G.accumulator += delta; G.autosaveTimer += delta; G.weatherTimer += delta;
  if (G.accumulator >= 1) { tickSecond(G.accumulator); G.accumulator = 0; }
  if (G.autosaveTimer >= 30) { saveState('autosave'); G.autosaveTimer = 0; }
  renderHud();
}

function tickSecond(delta) {
  const world = G.state.world; const player = G.state.player;
  world.clock += delta * (24 / 1440);
  if (world.clock >= 24) { world.clock -= 24; world.day += 1; world.fullDayCount += 1; if (world.fullDayCount % 7 === 0) world.season = seasons[(seasons.indexOf(world.season) + 1) % seasons.length]; }
  player.needs.hunger = clamp(player.needs.hunger - .0007 * delta);
  player.needs.thirst = clamp(player.needs.thirst - .001 * delta);
  player.needs.rest = clamp(player.needs.rest - .00055 * delta);
  player.needs.release = clamp(player.needs.release - .00045 * delta);
  world.garden = Math.min(18, world.garden + (.006 + world.hydration * .012) * delta);
  world.nest = Math.min(14, world.nest + .008 * delta * ({ spring: 1.4, summer: 1.1, autumn: .7, winter: .3 }[world.season] || 1));
  world.bamboo.standing = Math.min(24, world.bamboo.standing + .004 * delta);
  world.hydration = clamp(world.hydration + (world.water > 8 ? .0007 : -.0008) * delta);
  world.integrity = clamp(world.integrity + ((world.tendencies.care + world.tendencies.rest + world.tendencies.attention) / 3 - .35) * .0008 * delta);
  world.phasonicReserve = clamp(1 - world.observabilityDeficit * .55 - Math.max(0, .55 - world.integrity) * .6);
  world.routeHolonomy = clamp(world.routeHolonomy + (world.folds * .0004 + world.observabilityDeficit * .0006 - world.tendencies.rest * .00035) * delta);
  world.reflux = clamp(world.reflux + (world.routeHolonomy * .0011 + world.observabilityDeficit * .0008 - world.tendencies.care * .00045 - world.tendencies.rest * .0004) * delta);
  world.folds = Math.max(0, world.folds + (world.weather === 'storm' ? .002 : -.00025) * delta);
  for (const key of Object.keys(world.tendencies)) world.tendencies[key] = clamp(world.tendencies[key] - .00005 * delta, .05, 1);
  if (G.weatherTimer >= 12) { G.weatherTimer = 0; updateWeather(); }
  if (!world.springald.candidate && world.reflux >= .68 && world.tendencies.attention >= .38) { world.springald.candidate = true; message('The Ash Keep signals a Springald candidate.'); }
  if (world.springald.armedUntil && Date.now() > world.springald.armedUntil) world.springald.armedUntil = 0;
  const loom = player.loom;
  if (loom.mode && !loom.ready) { loom.progress = clamp(loom.progress + delta / (loom.mode === 'deep' ? 70 : 35)); if (loom.progress >= 1) { loom.ready = true; message('The Loom has finished a cloth.'); } }
}

function updateWeather() {
  const world = G.state.world; const target = { spring: .55, summer: .78, autumn: .48, winter: .25 }[world.season] || .5;
  world.warmth = clamp(lerp(world.warmth, target, .08)); world.moisture = clamp(world.moisture + (Math.random() - .5) * .18);
  if (world.moisture > .72 && world.warmth > .63) { world.weather = 'storm'; world.phase = 'crisis'; }
  else if (world.moisture > .68) { world.weather = 'rain'; world.phase = 'gathering'; }
  else if (world.warmth > .72 && world.moisture < .34) { world.weather = 'sun'; world.phase = 'clarity'; }
  else if (world.moisture > .56 && world.warmth < .38) { world.weather = 'mist'; world.phase = 'ambiguity'; }
  else { world.weather = 'clear'; world.phase = 'ambiguity'; }
}

function updateAnimals(delta) {
  for (const animal of G.animals) {
    animal.turn -= delta;
    if (animal.turn <= 0) { const angle = Math.random() * Math.PI * 2; animal.vx = Math.cos(angle) * (7 + Math.random() * 10); animal.vy = Math.sin(angle) * (5 + Math.random() * 8); animal.turn = 1.5 + Math.random() * 4; }
    animal.x += animal.vx * delta; animal.y += animal.vy * delta; animal.vx *= .985; animal.vy *= .985;
    const radius = Math.hypot(animal.x / 1.1, animal.y / .85);
    if (radius > 390) { animal.x *= 390 / radius; animal.y *= 390 / radius; animal.vx *= -1; animal.vy *= -1; }
  }
}
function updateParticles(delta) {
  if (['rain', 'storm'].includes(G.state.world.weather) && G.particles.length < 180) for (let index = 0; index < 6; index += 1) G.particles.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * 60, speed: 420 + Math.random() * 260 });
  for (let index = G.particles.length - 1; index >= 0; index -= 1) { const particle = G.particles[index]; particle.y += particle.speed * delta; particle.x -= particle.speed * .24 * delta; if (particle.y > innerHeight + 30 || particle.x < -30) G.particles.splice(index, 1); }
  if (!['rain', 'storm'].includes(G.state.world.weather)) G.particles.length = 0;
}

export function findInteraction() {
  let nearest = null; let best = Infinity;
  for (const object of G.objects) { const value = distance(G.state.player, object); if (value < object.radius + 38 && value < best) { nearest = object; best = value; } }
  G.currentInteraction = nearest;
  G.ui.interactionCard.classList.toggle('active', Boolean(nearest));
  G.ui.interactionGlyph.textContent = nearest?.glyph || '米';
  G.ui.interactionTitle.textContent = nearest?.name || 'Walk the village';
  G.ui.interactionHint.textContent = nearest?.detail || 'Approach a station';
  G.ui.interactButton.textContent = nearest ? 'Interact' : '—'; G.ui.interactButton.disabled = !nearest;
}

export function interact() { if (G.running && G.currentInteraction) performAction(G.currentInteraction); }
function performAction(item) {
  const player = G.state.player; const world = G.state.world; const inventory = player.inventory;
  switch (item.action) {
    case 'play': world.water += 7 * (.7 + needsEfficiency() * .8); player.stats.play += 1; player.needs.thirst = clamp(player.needs.thirst - .01); strengthen('care', .03); advanceObjective(0); message('Play lifts water into the battery pool.'); break;
    case 'care': if (world.garden >= 1) { const amount = Math.min(3, Math.floor(world.garden)); world.garden -= amount; inventory.produce += amount; message(`You harvest ${amount} produce.`); } else { strengthen('care', .08); player.stats.tending += 1; message('You tend care.'); } break;
    case 'rest': player.needs.rest = clamp(player.needs.rest + .42); strengthen('rest', .07); message(`${CANONICAL} You rest without disappearing from the village.`); break;
    case 'attention': strengthen('attention', .09); world.observabilityDeficit = clamp(world.observabilityDeficit - .06); message('Attention settles the local observability deficit.'); break;
    case 'bamboo': { const amount = Math.min(3, Math.floor(world.bamboo.standing)); if (amount < 1) message('The bamboo is still growing.'); else { world.bamboo.standing -= amount; inventory.bamboo += amount; message(`You harvest ${amount} bamboo.`); advanceObjective(1); } break; }
    case 'workbench': if (inventory.bamboo > 0) { inventory.bamboo -= 1; inventory.pulp += 1; message('Bamboo becomes pulp. Interact again to spin thread.'); } else if (inventory.pulp > 0) { inventory.pulp -= 1; inventory.thread += 1; message('Pulp becomes thread.'); advanceObjective(1); } else message('Bring bamboo or pulp to the bench.'); break;
    case 'loom': loomAction(); break;
    case 'nest': { const amount = Math.min(3, Math.floor(world.nest)); if (amount < 1) message('The duck nest is quiet.'); else { world.nest -= amount; inventory.eggs += amount; message(`You gather ${amount} egg${amount === 1 ? '' : 's'}.`); } break; }
    case 'cleanse': if (player.dirt.dishes > 0) { player.dirt.dishes = clamp(player.dirt.dishes - .45); message('The cascade washes the dishes.'); } else if (player.dirt.body > .1) { player.dirt.body = clamp(player.dirt.body - .6); message('You bathe in the third pool.'); } else if (inventory.cloth > 0) message('Cloth airs above the cascade.'); else message('The cascade is ready when cleansing work arrives.'); break;
    case 'release': player.needs.release = clamp(player.needs.release + .6); message('出 Release restores room for the next cycle.'); break;
    case 'home': homeAction(item); break;
    case 'springald': G.springaldOpen = true; G.ui.springaldPanel.hidden = false; updateSpringaldPanel(); break;
    case 'battery': window.open('./forward-battery/', '_blank', 'noopener'); message('Forward Battery opened in a separate tab.'); break;
  }
  renderHud();
}

function loomAction() {
  const loom = G.state.player.loom; const inventory = G.state.player.inventory;
  if (loom.ready) { loom.ready = false; loom.mode = null; loom.progress = 0; loom.glyph = null; inventory.cloth += 1; G.state.player.stats.woven += 1; message('You take one finished cloth from the Loom.'); return; }
  if (!loom.glyph) { loom.glyph = '米'; message('You offer 米 to the Loom. Interact again to begin weaving.'); return; }
  if (!loom.mode) { if (inventory.thread > 0) { inventory.thread -= 1; loom.mode = 'deep'; message('Thread enters a deep weave.'); } else { loom.mode = 'quick'; message('The Loom begins a quick weave.'); } advanceObjective(2); return; }
  message(`The Loom is ${Math.round(loom.progress * 100)}% complete.`);
}
function homeAction(item) {
  const inventory = G.state.player.inventory; const needs = G.state.player.needs;
  if (inventory.eggs + inventory.produce >= 2) { if (inventory.produce > 0) inventory.produce -= 1; else inventory.eggs -= 1; if (inventory.eggs > 0) inventory.eggs -= 1; else inventory.produce -= 1; inventory.food += 2; message(`${item.name}: you cook two village meals.`); advanceObjective(3); }
  else if (inventory.food > 0 && needs.hunger < .82) { inventory.food -= 1; needs.hunger = clamp(needs.hunger + .55); G.state.player.dirt.dishes = clamp(G.state.player.dirt.dishes + .3); message('You eat a prepared meal.'); }
  else { needs.rest = clamp(needs.rest + .35); strengthen('rest', .04); message(`${item.name}: you rest beside the hearth.`); }
}

export function closeSpringald() { G.springaldOpen = false; G.ui.springaldPanel.hidden = true; }
export function updateSpringaldPanel() {
  const springald = G.state.world.springald; const remaining = Math.max(0, Math.ceil((springald.armedUntil - Date.now()) / 1000));
  G.ui.springaldStatus.textContent = !springald.candidate ? 'The chamber is quiet. Accumulated reflux has not crossed the local threshold.' : !springald.witnessed ? 'A candidate is waiting for a local witness.' : springald.armedUntil ? `Release armed for ${remaining} seconds. A separate confirmation is required.` : 'Witness recorded. The local release may be armed.';
  G.ui.witnessSpringald.disabled = !springald.candidate || springald.witnessed;
  G.ui.armSpringald.disabled = !springald.candidate || !springald.witnessed || springald.armedUntil > Date.now();
  G.ui.releaseSpringald.disabled = !springald.armedUntil || springald.armedUntil <= Date.now();
}
export function witnessSpringald() { const springald = G.state.world.springald; if (!springald.candidate) return; springald.witnessed = true; G.state.player.stats.springaldWitnesses += 1; message('Springald candidate witnessed locally.'); updateSpringaldPanel(); }
export function armSpringald() { const springald = G.state.world.springald; if (!springald.witnessed) return; springald.armedUntil = Date.now() + 15000; appendLedger('springald_armed', 'Local Springald release armed for fifteen seconds.'); updateSpringaldPanel(); }
export function releaseSpringald() { const springald = G.state.world.springald; if (!springald.armedUntil || Date.now() > springald.armedUntil) return updateSpringaldPanel(); springald.releases += 1; springald.candidate = false; springald.witnessed = false; springald.armedUntil = 0; G.state.world.reflux = clamp(G.state.world.reflux - .36); G.state.world.routeHolonomy = clamp(G.state.world.routeHolonomy - .18); G.state.world.integrity = clamp(G.state.world.integrity + .09); appendLedger('springald_release', 'Springald released locally.', { schema: 'td613.domeblox.local-springald/v1', at: new Date().toISOString(), canonical: CANONICAL, release: springald.releases, result: 'local contradiction pressure settled; no transmission' }); message('𝌋 The Springald releases a local replay receipt. No external route was opened. ⟐'); updateSpringaldPanel(); }

export function renderHud() {
  const world = G.state.world; const player = G.state.player; const needs = player.needs;
  const phase = world.clock < 6 ? 'night' : world.clock < 8 ? 'dawn' : world.clock < 18 ? 'day' : world.clock < 20 ? 'dusk' : 'night';
  G.ui.worldClock.textContent = `Day ${world.day} · ${capitalize(world.season)} · ${capitalize(world.weather)} · ${phase}`;
  for (const key of ['hunger', 'thirst', 'rest', 'release']) { G.ui[`${key}Meter`].value = needs[key]; G.ui[`${key}Text`].textContent = `${Math.round(needs[key] * 100)}%`; }
  G.ui.integrityText.textContent = format(world.integrity); G.ui.hydrationText.textContent = format(world.hydration); G.ui.reserveText.textContent = format(world.phasonicReserve); G.ui.refluxText.textContent = format(world.reflux);
  const entries = Object.entries(player.inventory).filter(([, value]) => value > 0);
  G.ui.inventory.replaceChildren(...entries.map(([key, value]) => { const span = document.createElement('span'); span.textContent = `${capitalize(key)} ${value}`; return span; }));
  G.ui.objectiveText.textContent = objectives[player.objective] || objectives.at(-1);
  if (G.springaldOpen) updateSpringaldPanel();
}

export function toggleHud() { G.hudCollapsed = !G.hudCollapsed; G.ui.hudBody.hidden = G.hudCollapsed; G.ui.toggleHud.textContent = G.hudCollapsed ? '+' : '−'; }
export function toggleMap() { G.mapOpen = !G.mapOpen; G.ui.mapPanel.hidden = !G.mapOpen; if (G.mapOpen) drawMap(); }
export function resetWorld() { localStorage.removeItem(SAVE_KEY); location.reload(); }
