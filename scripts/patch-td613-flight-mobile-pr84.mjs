import fs from 'fs';
const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');
html = html.replace(/\n\/\* PR84_FINAL_CHIP_REPAIR \*\/[\s\S]*?(?=\n<\/style>)/m, '');
const css = `
/* PR84_FINAL_CHIP_REPAIR */
@media (max-width: 820px) {
  .flight-lane .checkbox-row,
  .flight-lane .radio-row,
  .flight-lane .row,
  .flight-lane .copy-grid,
  .flight-lane .seal-lozenge-row {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: flex-start !important;
    align-items: flex-start !important;
    gap: 4px 5px !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }
  .flight-lane .checkbox-row > label,
  .flight-lane .radio-row > label,
  .flight-lane .row > button,
  .flight-lane .row > .btn,
  .flight-lane .copy-chip,
  .flight-lane button.btn {
    width: auto !important;
    min-width: 0 !important;
    max-width: calc(100% - 8px) !important;
    height: auto !important;
    min-height: 15px !important;
    max-height: none !important;
    padding: 2px 6px !important;
    font-size: 6px !important;
    line-height: 1.08 !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
  }
  .flight-lane-prompt .card:not(.seal-card) .checkbox-row > label,
  .flight-lane-prompt .card:not(.seal-card) .radio-row > label,
  .flight-lane-prompt .card:not(.seal-card) .row > button,
  .flight-lane-prompt .card:not(.seal-card) .row > .btn {
    flex: 1 1 calc(50% - 5px) !important;
    max-width: calc(50% - 5px) !important;
  }
  .seal-card .checkbox-row > label,
  .seal-card .radio-row > label,
  .seal-card .seal-lozenge-row > label,
  .copy-grid > .copy-chip {
    flex: 0 1 auto !important;
    max-width: calc(100% - 8px) !important;
  }
}
`;
html = html.replace('</style>', css + '\n</style>');
fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR84 final chip repair');
