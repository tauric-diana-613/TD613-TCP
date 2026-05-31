// Vercel Web Analytics initialization
// This script initializes Vercel Analytics for the TD613-TCP project
// Documentation: https://vercel.com/docs/analytics/quickstart

import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics
// When deployed to Vercel, analytics will automatically track page views
// In development, events are logged to the console (when debug is enabled)
inject({
  mode: 'auto', // Auto-detect environment (production/development)
  debug: true   // Enable debug logging in development
});
