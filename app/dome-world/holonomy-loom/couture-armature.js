// Static, original vector scenery. The open centre reveals the real Flow-Core
// field. This surface has no clock, event meaning, controls, or request state.
export const coutureArmature = `<div class="loom-armature" aria-hidden="true">
<svg viewBox="0 0 1000 1000" focusable="false">
  <defs>
    <linearGradient id="loomChrome" x1="0" y1="0" x2="1" y2=".35">
      <stop stop-color="#161b23"/><stop offset=".14" stop-color="#7b8394"/><stop offset=".23" stop-color="#f2f0ed"/><stop offset=".28" stop-color="#9fabb8"/><stop offset=".36" stop-color="#242738"/><stop offset=".57" stop-color="#080c16"/><stop offset=".7" stop-color="#697185"/><stop offset=".78" stop-color="#e2e0ed"/><stop offset=".84" stop-color="#7a7f98"/><stop offset="1" stop-color="#191724"/>
    </linearGradient>
    <linearGradient id="loomEdge" x1="0" y1="0" x2=".7" y2="1">
      <stop stop-color="#faf0e1"/><stop offset=".31" stop-color="#a5a8d2"/><stop offset=".52" stop-color="#202834"/><stop offset=".73" stop-color="#a6e2e5"/><stop offset="1" stop-color="#c0a9ce"/>
    </linearGradient>
    <linearGradient id="loomWing" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#bdccd2" stop-opacity=".32"/><stop offset=".4" stop-color="#6b518e" stop-opacity=".08"/><stop offset=".75" stop-color="#7bb4bf" stop-opacity=".2"/><stop offset="1" stop-color="#101321" stop-opacity="0"/>
    </linearGradient>
    <path id="loomBlade" d="M478 88C368 57 207 133 84 231C213 213 297 274 350 360C391 427 405 482 383 542C349 638 231 751 173 894L316 816C350 735 444 644 467 551C492 449 458 353 425 282C397 219 426 142 478 88Z"/>
    <path id="loomVein" d="M474 93C360 101 188 199 109 224M444 129C340 157 275 212 257 250M425 174C364 214 335 248 331 313M425 283C455 365 479 456 455 549C431 641 344 738 312 806M383 545C372 652 269 770 187 878"/>
  </defs>
  <g class="loom-armature-wings" fill="url(#loomWing)" stroke="url(#loomEdge)" stroke-width=".8">
    <path d="M440 280C317 217 171 97 24 77C61 247 219 393 402 454C322 428 222 424 108 467C207 555 321 579 389 538Z"/>
    <path d="M560 280C683 217 829 97 976 77C939 247 781 393 598 454C678 428 778 424 892 467C793 555 679 579 611 538Z"/>
  </g>
  <g fill="url(#loomChrome)" stroke="url(#loomEdge)" stroke-width="1.3">
    <use href="#loomBlade"/><use href="#loomBlade" transform="translate(1000 0) scale(-1 1)"/>
  </g>
  <g fill="none" stroke="url(#loomEdge)" stroke-width="1.5" opacity=".85">
    <use href="#loomVein"/><use href="#loomVein" transform="translate(1000 0) scale(-1 1)"/>
    <path d="M477 88L500 39L523 88M469 556Q500 579 531 556M448 603Q500 644 552 603M418 660Q500 707 582 660"/>
  </g>
  <path d="M500 235C560 350 574 438 500 562C426 438 440 350 500 235Z" fill="none" stroke="url(#loomEdge)" stroke-width=".7" opacity=".45"/>
</svg></div>`;
