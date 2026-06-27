import { computeAshReadiness, sendJson } from './_core.js';

export default function handler(req, res) {
  return sendJson(res, 200, computeAshReadiness({ artifact_class: 'sensitive-document', route: 'public-weather', stewardship_status: 'pending-review', export_target: 'dome-world-dev' }));
}
