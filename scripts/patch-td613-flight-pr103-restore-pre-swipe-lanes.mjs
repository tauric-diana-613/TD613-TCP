import fs from 'node:fs';
const files=['app/safe-harbor/td613-flight.html','scripts/patch-td613-flight-mobile-pr85-final.mjs'];
const bad=/(td613-pr98-swipe-lock|td613-pr100-lane-tabs|td613-pr101-state-lanes|PR9[89]_SENTINEL|PR10[0-2]_SENTINEL|function prepNoZoom|data-td613-prev-font)/;
function clean(s){s=s.replace(/\n?\/\* PR(?:9[89]|10[0-2])_SENTINEL[\s\S]*