import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const flight = fs.readFileSync('app/safe-harbor/td613-flight.html', 'utf8');
const functionStart = flight.indexOf('function rewriteBindingDateOnly');
const nextFunction = flight.indexOf('function refreshCachedFlightDates', functionStart);

assert(functionStart >= 0, 'Flight must own the binding-date rewrite');
assert(nextFunction > functionStart, 'binding-date rewrite must remain extractable');

const context = {};
vm.createContext(context);
vm.runInContext(`${flight.slice(functionStart, nextFunction).trim()}; this.rewriteBindingDateOnly = rewriteBindingDateOnly;`, context);

const oldDate = '2026-06-04';
const nextDate = '2026-06-28';
const ordinary = `Meeting date: ${oldDate}`;
const binding = `TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · SHI#:TD613-SH-9B07D8B-78C5B2F3 · payload 90 · ${oldDate}`;
const mixed = `${ordinary}\n${binding}\nArchive date: ${oldDate}`;

assert.equal(context.rewriteBindingDateOnly(ordinary, nextDate), ordinary, 'ordinary dates must remain unchanged');
assert.equal(
  context.rewriteBindingDateOnly(mixed, nextDate),
  `${ordinary}\n${binding.replace(oldDate, nextDate)}\nArchive date: ${oldDate}`,
  'only the canonical binding footer date may change'
);

for (const required of [
  'function refreshCachedFlightDates()',
  'function refreshVisibleAuthDateAndFooter()',
  'parsed.controls["id:authDate"]',
  'localStorage.setItem(FLIGHT_DRAFT_KEY',
  'window.addEventListener("pageshow"',
  'window.addEventListener("focus"',
  'document.addEventListener("visibilitychange"',
  'window.TD613FlightRewriteBindingDateOnly = rewriteBindingDateOnly'
]) {
  assert(flight.includes(required), `Flight date refresh missing ${required}`);
}

console.log('td613-flight-date-refresh.test.mjs passed');
