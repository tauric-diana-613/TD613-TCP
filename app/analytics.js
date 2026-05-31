// Vercel Web Analytics initialization
// This script initializes Vercel Analytics for the TD613-TCP project
// Documentation: https://vercel.com/docs/analytics/quickstart

// Initialize the analytics queue
window.va = window.va || function(...params) {
  (window.vaq = window.vaq || []).push(params);
};

// Load the Vercel Analytics script
// When deployed to Vercel, analytics will be automatically tracked
// The script is loaded from Vercel's CDN at /_vercel/insights/script.js
(function() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
})();
