import { PHYSICS_TIMESTEP } from '../constants';
import { SceneSetup } from '../scene/SceneSetup';
import { PhysicsWorld } from './PhysicsWorld';
import { InputManager } from './InputManager';
import { Table } from '../scene/Table';
import { Environment } from '../scene/Environment';
import { GameController } from '../game/GameState';
import { PhysicsSync } from '../utils/PhysicsSync';

export class Engine {
  private sceneSetup: SceneSetup;
  private physics: PhysicsWorld;
  private input: InputManager;
  private physicsSync: PhysicsSync;
  private gameController: GameController;
  private accumulator = 0;
  private lastTime = 0;

  constructor() {
    this.sceneSetup = new SceneSetup();
    this.physics = new PhysicsWorld();
    this.input = new InputManager();
    this.physicsSync = new PhysicsSync();

    // Create scene objects
    new Table(this.sceneSetup.scene, this.physics);
    new Environment(this.sceneSetup.scene);

    // Create game controller
    this.gameController = new GameController(
      this.sceneSetup.scene,
      this.physics,
      this.input,
      this.physicsSync,
    );
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  private loop = (now: number) => {
    requestAnimationFrame(this.loop);

    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Cap delta to avoid spiral of death
    const cappedDt = Math.min(dt, 0.1);

    // Fixed timestep physics
    this.accumulator += cappedDt;
    while (this.accumulator >= PHYSICS_TIMESTEP) {
      this.physics.step();
      this.accumulator -= PHYSICS_TIMESTEP;
    }

    // Sync physics to rendering
    this.physicsSync.sync();

    // Update game logic
    this.gameController.update(cappedDt);

    // Render
    this.sceneSetup.render();
  };
}
