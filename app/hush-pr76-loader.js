// Emergency loader for PR76 Hush analysis surfaces.
// Restores Authorship Stylometrics and Suggested Masks render module after Analyze.

(function () {
  if (!/adversarial-bench\.html(?:$|[?#])/i.test(window.location.pathname + window.location.search + window.location.hash)) return;
  if (document.querySelector('script[src^="./hush-pr76-mask-recommender.js"]')) return;

  var script = document.createElement('script');
  script.type = 'module';
  script.src = './hush-pr76-mask-recommender.js?v=202606160040';
  document.head.appendChild(script);
}());
