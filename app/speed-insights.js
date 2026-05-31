// Vercel Speed Insights initialization
// This script initializes Vercel Speed Insights for the TD613-TCP project
// Documentation: https://vercel.com/docs/speed-insights/quickstart

// Initialize the Speed Insights queue
window.si = window.si || function(...params) {
  (window.siq = window.siq || []).push(params);
};

// Load the Vercel Speed Insights script
// When deployed to Vercel, Speed Insights will automatically track performance metrics
// The script is loaded from Vercel's CDN at /_vercel/speed-insights/script.js
(function() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  document.head.appendChild(script);
})();
