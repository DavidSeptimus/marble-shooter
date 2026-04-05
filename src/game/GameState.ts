import * as THREE from 'three';
import { GameStateType, type MarblePair } from '../types';
import {
  RESULT_DISPLAY_TIME, ROUND_TRANSITION_TIME,
  TARGET_COLORS,
} from '../constants';
import { getTableConfig } from '../core/TableConfig';
import { InputManager } from '../core/InputManager';
import { PhysicsWorld } from '../core/PhysicsWorld';
import { AimingSystem } from './AimingSystem';
import { ShootingSystem } from './ShootingSystem';
import { CollisionHandler, type RollingResult } from './CollisionHandler';
import { RoundManager } from './RoundManager';
import { createPlayerMarble, createTargetMarble } from '../scene/Marble';
import { randomTargetPosition } from '../utils/MathHelpers';
import { PhysicsSync } from '../utils/PhysicsSync';
import { HUD } from '../ui/HUD';
import { AimIndicator } from '../ui/AimIndicator';
import { ParticleExplosion } from '../ui/ParticleExplosion';
import { Fireworks } from '../ui/Fireworks';
import { GameOverEffect } from '../ui/GameOverEffect';
import { SoundManager } from '../ui/SoundManager';

export class GameController {
  private state = GameStateType.TITLE;
  private input: InputManager;
  private physics: PhysicsWorld;
  private scene: THREE.Scene;
  private aiming: AimingSystem;
  private shooting: ShootingSystem;
  private collision: CollisionHandler;
  readonly roundManager: RoundManager;
  private physicsSync: PhysicsSync;
  private hud: HUD;
  private aimIndicator: AimIndicator;
  private particles: ParticleExplosion;
  private fireworks: Fireworks;
  private gameOverEffect: GameOverEffect;
  private sound: SoundManager;

  private playerMarble: MarblePair | null = null;
  private targetMarble: MarblePair | null = null;
  private timer = 0;
  private lastResult: 'hit' | 'miss' = 'miss';

  constructor(
    scene: THREE.Scene,
    physics: PhysicsWorld,
    input: InputManager,
    physicsSync: PhysicsSync,
  ) {
    this.scene = scene;
    this.physics = physics;
    this.input = input;
    this.physicsSync = physicsSync;
    this.aiming = new AimingSystem();
    this.shooting = new ShootingSystem();
    this.collision = new CollisionHandler();
    this.roundManager = new RoundManager();
    this.hud = new HUD();
    this.aimIndicator = new AimIndicator(scene);
    this.particles = new ParticleExplosion(scene);
    this.fireworks = new Fireworks(scene);
    this.gameOverEffect = new GameOverEffect(scene);
    this.sound = new SoundManager();

    // Wire collision events
    this.physics.setCollisionCallback((h1, h2) => {
      this.collision.onCollision(h1, h2);
    });

    this.hud.showPersistentMessage('MARBLE SHOOTER');
    this.hud.setInstruction('Press SPACE to start');
  }

  getState(): GameStateType {
    return this.state;
  }

  update(dt: number) {
    // Always update visual effects
    this.particles.update(dt);
    this.fireworks.update(dt);
    this.gameOverEffect.update(dt);

    switch (this.state) {
      case GameStateType.TITLE:
        this.updateTitle();
        break;
      case GameStateType.AIMING_X:
        this.updateAimingX(dt);
        break;
      case GameStateType.AIMING_Y:
        this.updateAimingY(dt);
        break;
      case GameStateType.SHOOTING:
        this.updateShooting();
        break;
      case GameStateType.ROLLING:
        this.updateRolling();
        break;
      case GameStateType.RESULT:
        this.updateResult(dt);
        break;
      case GameStateType.NEXT_MARBLE:
        this.updateNextMarble();
        break;
      case GameStateType.ROUND_TRANSITION:
        this.updateRoundTransition(dt);
        break;
      case GameStateType.GAME_OVER:
      case GameStateType.WIN:
        this.updateEndScreen();
        break;
    }
  }

  private updateTitle() {
    if (this.input.consumeSpace()) {
      this.roundManager.reset();
      this.fireworks.stop();
      this.gameOverEffect.stop();
      this.particles.clear();
      this.sound.stopBgMusic();
      this.sound.startBgMusic();
      this.hud.hideMessage();
      this.startNewMarble();
      this.enterAimingX();
    }
  }

  private enterAimingX() {
    this.state = GameStateType.AIMING_X;
    this.aiming.start(this.roundManager.getAimSpeed());
    this.aimIndicator.show();
    this.hud.setInstruction('Press SPACE to aim');
    this.updateHUD();
  }

  private updateAimingX(dt: number) {
    this.aiming.update(dt);
    this.aimIndicator.update(this.aiming.currentValue);

    if (this.input.consumeSpace()) {
      this.aiming.lockX();
      this.aimIndicator.lock(this.aiming.getLockedX()!);
      this.state = GameStateType.AIMING_Y;
      this.hud.setInstruction('Press SPACE to set power');
    }
  }

  private updateAimingY(dt: number) {
    this.aiming.update(dt);
    // Update power segment on the aim line
    this.aimIndicator.updatePower(this.aiming.currentValue);

    if (this.input.consumeSpace()) {
      const { aimX, aimY } = this.aiming.lockY();
      this.aimIndicator.hide();
      this.state = GameStateType.SHOOTING;
      this.sound.playShoot();
      this.shootMarble(aimX, aimY);
    }
  }

  private updateShooting() {
    this.state = GameStateType.ROLLING;
    this.hud.setInstruction('');
  }

  private updateRolling() {
    if (!this.playerMarble) return;

    const result: RollingResult = this.collision.evaluate(this.playerMarble);
    if (result === 'hit') {
      this.lastResult = 'hit';
      this.sound.playHit();
      this.sound.playExplosion();
      this.spawnHitExplosion();
      this.enterResult();
    } else if (result === 'settled' || result === 'fell_off') {
      this.lastResult = 'miss';
      this.sound.playMiss();
      this.enterResult();
    }
  }

  private spawnHitExplosion() {
    if (!this.playerMarble || !this.targetMarble) return;

    // Get collision midpoint
    const pPos = this.playerMarble.body.translation();
    const tPos = this.targetMarble.body.translation();
    const midpoint = new THREE.Vector3(
      (pPos.x + tPos.x) / 2,
      (pPos.y + tPos.y) / 2,
      (pPos.z + tPos.z) / 2
    );

    // Get colors from both marbles
    const playerColor = 0x3366ff;
    const targetColor = this.getCurrentTargetColor();

    this.particles.explode(midpoint, playerColor, targetColor, 80);

    // Hide marbles immediately for the explosion effect
    this.playerMarble.mesh.visible = false;
    this.targetMarble.mesh.visible = false;
  }

  private getCurrentTargetColor(): number {
    return TARGET_COLORS[this.roundManager.marbleIndex % TARGET_COLORS.length];
  }

  private enterResult() {
    this.state = GameStateType.RESULT;
    this.timer = 0;

    if (this.lastResult === 'hit') {
      this.hud.showMessage('Hit!', RESULT_DISPLAY_TIME * 1000);
    } else {
      this.hud.showMessage('Miss!', RESULT_DISPLAY_TIME * 1000);
    }
  }

  private updateResult(dt: number) {
    this.timer += dt;
    if (this.timer >= RESULT_DISPLAY_TIME) {
      this.state = GameStateType.NEXT_MARBLE;
    }
  }

  private updateNextMarble() {
    this.cleanupMarbles();

    if (this.lastResult === 'hit') {
      const outcome = this.roundManager.onHit();
      if (outcome === 'win') {
        this.state = GameStateType.WIN;
        this.hud.showPersistentMessage('YOU WIN!');
        this.hud.setInstruction('Press SPACE to play again');
        this.sound.stopBgMusic();
        this.sound.playWin();
        this.fireworks.start();
        return;
      }
      if (outcome === 'next_round') {
        this.state = GameStateType.ROUND_TRANSITION;
        this.timer = 0;
        this.hud.showMessage(`Round ${this.roundManager.round}!`, ROUND_TRANSITION_TIME * 1000);
        this.hud.setInstruction('');
        return;
      }
      this.startNewMarble();
      this.enterAimingX();
    } else {
      const outcome = this.roundManager.onMiss();
      if (outcome === 'game_over') {
        this.state = GameStateType.GAME_OVER;
        this.hud.showPersistentMessage('GAME OVER');
        this.hud.setInstruction('Press SPACE to try again');
        this.sound.stopBgMusic();
        this.sound.playGameOver();
        this.gameOverEffect.start();
        return;
      }
      this.startNewMarble();
      this.enterAimingX();
    }
  }

  private updateRoundTransition(dt: number) {
    this.timer += dt;
    if (this.timer >= ROUND_TRANSITION_TIME) {
      this.startNewMarble();
      this.enterAimingX();
    }
  }

  private updateEndScreen() {
    if (this.input.consumeSpace()) {
      this.fireworks.stop();
      this.gameOverEffect.stop();
      this.particles.clear();
      this.state = GameStateType.TITLE;
      this.hud.showPersistentMessage('MARBLE SHOOTER');
      this.hud.setInstruction('Press SPACE to start');
    }
  }

  private startNewMarble() {
    const pos = randomTargetPosition();
    const radius = this.roundManager.getTargetRadius();
    const color = this.getCurrentTargetColor();
    this.targetMarble = createTargetMarble(
      this.scene, this.physics, pos.x, pos.z, radius, color
    );
    this.physicsSync.add(this.targetMarble.mesh, this.targetMarble.body);
  }

  private shootMarble(aimX: number, aimY: number) {
    const cfg = getTableConfig();
    this.playerMarble = createPlayerMarble(
      this.scene, this.physics,
      cfg.shooterX, cfg.shooterZ
    );
    this.physicsSync.add(this.playerMarble.mesh, this.playerMarble.body);

    this.collision.setup(this.playerMarble, this.targetMarble!);
    this.shooting.shoot(this.playerMarble, aimX, aimY);
  }

  private cleanupMarbles() {
    if (this.playerMarble) {
      this.scene.remove(this.playerMarble.mesh);
      this.physicsSync.remove(this.playerMarble.body);
      this.physics.removeBody(this.playerMarble.body);
      this.playerMarble = null;
    }
    if (this.targetMarble) {
      this.scene.remove(this.targetMarble.mesh);
      this.physicsSync.remove(this.targetMarble.body);
      this.physics.removeBody(this.targetMarble.body);
      this.targetMarble = null;
    }
  }

  private updateHUD() {
    this.hud.updateRound(this.roundManager.round);
    this.hud.updateMarble(this.roundManager.marbleIndex);
    this.hud.updateAttempts(this.roundManager.attemptsLeft);
  }
}
