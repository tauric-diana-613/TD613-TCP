import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const lockedViewport = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" />';
if (html.includes('<meta name="viewport"')) {
  html = html.replace(/<meta name="viewport"[^>]*>/i, lockedViewport);
} else {
  html = html.replace('<head>', `<head>\n${lockedViewport}`);
}

const css = `
/* === TD613 Flight mobile viewport zoom guard === */
@media (max-width: 820px) {
  textarea,
  input,
  select {
    font-size: 16px !important;
  }
  textarea:focus,
  input:focus,
  select:focus {
    font-size: 16px !important;
  }
  .output,
  #taskText {
    font-size: 16px !important;
  }
}
`;

if (!html.includes('TD613 Flight mobile viewport zoom guard')) {
  html = html.replace('</style>', `${css}\n</style>`);
}

if (!html.includes('maximum-scale=1') || !html.includes('user-scalable=no')) {
  throw new Error('mobile viewport zoom lock missing');
}
if (!html.includes('font-size: 16px !important')) {
  throw new Error('mobile form-field zoom guard missing');
}
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) {
  throw new Error('wrapper regression detected');
}

fs.writeFileSync(path, html);
console.log('patched TD613 Flight mobile viewport zoom guard');
