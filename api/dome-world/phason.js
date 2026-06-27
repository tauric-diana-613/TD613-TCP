import { sendJson, simulatePhasonGate } from './_core.js';

export default function handler(req, res) {
  return sendJson(res, 200, simulatePhasonGate({}));
}
