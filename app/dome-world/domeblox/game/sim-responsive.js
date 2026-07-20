import { G } from './core.js';
import { drawMap } from './render-responsive.js';
export {
  update,
  findInteraction,
  interact,
  renderHud,
  toggleHud,
  closeSpringald,
  witnessSpringald,
  armSpringald,
  releaseSpringald,
  resetWorld,
} from './sim.js';

export function toggleMap() {
  G.mapOpen = !G.mapOpen;
  G.ui.mapPanel.hidden = !G.mapOpen;
  if (G.mapOpen) drawMap();
}
