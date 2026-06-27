import { computeFlowCoreWeatherFromAperture, sendJson } from './_core.js';

export default function handler(req, res) {
  return sendJson(res, 200, computeFlowCoreWeatherFromAperture({ scan_family: 'dome_world_compatibility_scan' }));
}
