import { oscillate } from '../utils/MathHelpers';

export class AimingSystem {
  private elapsed = 0;
  private speed = 3.0;
  private lockedX: number | null = null;

  currentValue = 0;
  phase: 'x' | 'y' = 'x';

  start(speed: number) {
    this.elapsed = 0;
    this.speed = speed;
    this.lockedX = null;
    this.phase = 'x';
    this.currentValue = 0;
  }

  update(dt: number) {
    this.elapsed += dt;
    this.currentValue = oscillate(this.elapsed, this.speed);
  }

  lockX(): number {
    this.lockedX = this.currentValue;
    this.phase = 'y';
    this.elapsed = 0;
    this.currentValue = 0;
    return this.lockedX;
  }

  lockY(): { aimX: number; aimY: number } {
    return {
      aimX: this.lockedX!,
      aimY: this.currentValue,
    };
  }

  getLockedX(): number | null {
    return this.lockedX;
  }
}
