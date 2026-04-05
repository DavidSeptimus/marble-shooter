import RAPIER from '@dimforge/rapier3d-compat';
import { Engine } from './core/Engine';

async function init() {
  await RAPIER.init();
  const engine = new Engine();
  engine.start();
}

init().catch(console.error);
