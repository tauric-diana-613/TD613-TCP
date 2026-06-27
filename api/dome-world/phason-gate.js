import { sendJson, simulatePhasonGate } from './_core.js';

export default function handler(req, res) {
  return sendJson(res, 200, simulatePhasonGate({ previous_projection: 'public-weather', new_projection: 'quarantine' }));
}
