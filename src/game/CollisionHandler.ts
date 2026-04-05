import { FELL_OFF_Y, SETTLED_VELOCITY_THRESHOLD, SETTLED_FRAMES_REQUIRED } from '../constants';
import type { MarblePair } from '../types';

export type RollingResult = 'hit' | 'settled' | 'fell_off' | null;

export class CollisionHandler {
  private playerHandle: number = -1;
  private targetHandle: number = -1;
  private hasHit = false;
  private settledFrames = 0;

  setup(player: MarblePair, target: MarblePair) {
    this.playerHandle = player.colliderHandle;
    this.targetHandle = target.colliderHandle;
    this.hasHit = false;
    this.settledFrames = 0;
  }

  onCollision(handle1: number, handle2: number) {
    const handles = [handle1, handle2];
    if (handles.includes(this.playerHandle) && handles.includes(this.targetHandle)) {
      this.hasHit = true;
    }
  }

  evaluate(player: MarblePair): RollingResult {
    if (this.hasHit) {
      return 'hit';
    }

    // Check if player marble fell off
    const pos = player.body.translation();
    if (pos.y < FELL_OFF_Y) {
      return 'fell_off';
    }

    // Check if player marble has settled
    const vel = player.body.linvel();
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
    if (speed < SETTLED_VELOCITY_THRESHOLD) {
      this.settledFrames++;
      if (this.settledFrames >= SETTLED_FRAMES_REQUIRED) {
        return 'settled';
      }
    } else {
      this.settledFrames = 0;
    }

    return null;
  }
}
