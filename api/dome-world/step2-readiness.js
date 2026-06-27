import { sendJson, step2Readiness } from './_core.js';

export default function handler(req, res) {
  return sendJson(res, 200, step2Readiness());
}
