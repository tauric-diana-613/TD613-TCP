import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const rail = `<button class="mobile-prompt-rail" data-flight-lane-target="output" type="button">
<span>Seal payload to begin Flight</span>
<span class="mobile-prompt-rail-pill">Sealed Output &rarr;</span>
</button>
`;

html = html.replace(rail, '');
const devMarker = '</div><div class="dev-divider"></div><details class="dev-drawer" id="devSettingsDrawer">';
if (!html.split(devMarker, 1)[0].includes('mobile-prompt-rail') && html.includes(devMarker)) {
  html = html.replace(devMarker, `</div>\n${rail}<div class="dev-divider"></div><details class="dev-drawer" id="devSettingsDrawer">`);
}

html = html.replace('>Copy from output</button>', '>Copy</button>');
html = html.replace('>Clear output</button>', '>Clear</button>');

const override = `

/* === TD613 Flight mobile output visibility patch === */
@media (max-width: 820px) {
  .page-wrap { padding: .42rem; gap: .34rem; }
  .grid { gap: .16rem; scroll-padding-inline: 0; }
  .grid > div:first-child,
  .grid > div:last-child {
    flex: 0 0 100%;
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    padding: .16rem .44rem 3rem;
  }
  .card { padding: .58rem .6rem .62rem .78rem; border-radius: 14px; }
  .card::before { left: .43rem; }
  .mobile-prompt-rail {
    margin: .2rem 0 .38rem;
    padding: .34rem .48rem;
    gap: .34rem;
    min-height: 2.05rem;
    border-radius: 14px;
    box-shadow: 0 10px 28px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,239,196,0.08);
  }
  .mobile-prompt-rail span:first-child { font-size: .46rem; line-height: 1.1; }
  .mobile-prompt-rail-pill { padding: .16rem .32rem; font-size: .36rem; }
  .dev-divider { margin: .36rem 0 .3rem; padding-top: .38rem; }
  .output-card { padding: .58rem .6rem .64rem .78rem; border-radius: 16px; }
  .output-card h2 { font-size: .66rem; margin-bottom: .18rem; }
  .output-card .module-marker { margin-bottom: .24rem; }
  .output {
    min-height: 4.1rem;
    height: clamp(4.2rem, 14dvh, 5.6rem);
    max-height: 16dvh;
    overflow: auto;
    resize: vertical;
    padding: .5rem .54rem;
    font-size: .61rem;
    line-height: 1.36;
  }
  .status-bar { align-items: center; gap: .2rem; margin-top: .18rem; font-size: .40rem; }
  .output-auth-toggle { margin-left: auto; gap: .16rem; font-size: .37rem; }
  .output-auth-toggle input[type="checkbox"] { width: .68rem; height: .68rem; }
  .output-toolbar { flex-direction: row; align-items: center; justify-content: space-between; gap: .2rem; margin-top: .24rem; padding-top: .2rem; }
  .output-toolbar .row { width: auto; gap: .18rem; flex: 0 1 auto; }
  .output-toolbar .row .btn { flex: 0 0 auto; min-height: 1.42rem; padding: .14rem .38rem; font-size: .42rem; letter-spacing: .08em; }
  .payload-stepper { align-self: auto; margin-left: 0; padding: 0; gap: .08rem; border: 0; background: transparent; clip-path: none; }
  .payload-stepper-label { display: none; }
  .payload-stepper-value { min-width: .72rem; font-size: .46rem; }
  .payload-stepper-btn { width: 1rem; min-width: 1rem; height: 1rem; border: 0; background: transparent; box-shadow: none; font-size: .68rem; }
  .seal-card { margin-top: .34rem; padding: .62rem .6rem .68rem .78rem; border-radius: 16px; }
  .seal-card h2 { font-size: .68rem; }
}
`;

if (!html.includes('TD613 Flight mobile output visibility patch')) {
  html = html.replace('</style>', `${override}\n</style>`);
}

fs.writeFileSync(path, html);
console.log('patched TD613 Flight mobile output layout');
