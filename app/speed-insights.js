// Vercel Speed Insights initialization
// This script initializes Vercel Speed Insights for the TD613-TCP project
// Documentation: https://vercel.com/docs/speed-insights/quickstart

// Initialize the Speed Insights queue
window.si = window.si || function () {
  (window.siq = window.siq || []).push(arguments);
};

(function loadTrainerPolishStylesheet() {
  const trainerPage = document.body && document.body.getAttribute('data-page-kind') === 'trainer';
  if (!trainerPage || document.getElementById('td613TrainerPolishCss')) return;
  const link = document.createElement('link');
  link.id = 'td613TrainerPolishCss';
  link.rel = 'stylesheet';
  link.href = './trainer-simple.css';
  document.head.appendChild(link);
})();

// Load the Vercel Speed Insights script
// When deployed to Vercel, Speed Insights will automatically track performance metrics
// The script is loaded from Vercel's CDN at /_vercel/speed-insights/script.js
(function() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  document.head.appendChild(script);
})();
