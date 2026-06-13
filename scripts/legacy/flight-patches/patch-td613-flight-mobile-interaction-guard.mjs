import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

if (!html.includes('td613-flight-mobile-lane-access-script')) {
  throw new Error('lane access script missing before interaction guard');
}

html = html.replace(
  '  var gridTransformWasSet = false;\n  function gridWidth() {',
  `  var gridTransformWasSet = false;
  var ignoreSwipeTouch = false;
  function isInteractiveSwipeZone(target) {
    return Boolean(target && target.closest && target.closest('textarea, input, select, button, label, [contenteditable="true"], .output, #taskText, .output-card, .copy-grid, .payload-stepper, .mobile-lane-tab'));
  }
  function gridWidth() {`
);

html = html.replace(
  `  document.addEventListener('touchstart', function (event) {
    if (!event.touches || !event.touches[0]) return;
    touchStartX = event.touches[0].clientX;`,
  `  document.addEventListener('touchstart', function (event) {
    ignoreSwipeTouch = isInteractiveSwipeZone(event.target);
    if (ignoreSwipeTouch) return;
    if (!event.touches || !event.touches[0]) return;
    touchStartX = event.touches[0].clientX;`
);

html = html.replace(
  `  document.addEventListener('touchmove', function (event) {
    var touch = event.touches && event.touches[0];`,
  `  document.addEventListener('touchmove', function (event) {
    if (ignoreSwipeTouch) return;
    var touch = event.touches && event.touches[0];`
);

html = html.replace(
  `  document.addEventListener('touchend', function (event) {
    var touch = event.changedTouches && event.changedTouches[0];`,
  `  document.addEventListener('touchend', function (event) {
    if (ignoreSwipeTouch) { ignoreSwipeTouch = false; return; }
    var touch = event.changedTouches && event.changedTouches[0];`
);

if (!html.includes('isInteractiveSwipeZone')) throw new Error('interactive swipe guard missing');
if (!html.includes('ignoreSwipeTouch')) throw new Error('ignore swipe touch state missing');
if (!html.includes('#taskText')) throw new Error('task textarea swipe immunity missing');
if (!html.includes('.output-card')) throw new Error('output-card swipe immunity missing');
if (!html.includes('textarea, input, select')) throw new Error('form-field swipe immunity missing');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight mobile interaction guard');
