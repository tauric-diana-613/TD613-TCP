import fs from 'node:fs';

const targets = [
  'app/safe-harbor/td613-flight.html',
  'scripts/patch-td613-flight-mobile-pr85-final.mjs'
];

const markers = [
  '/* PR98_SENTINEL TD613 Flight symmetric lane swipe lock */',
  '/* PR99_SENTINEL TD613 Flight rollback PR98 swipe lock to native lanes */',
  '/* PR100_SENTINEL TD613 Flight native lane touch repair */