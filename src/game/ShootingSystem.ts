import RAPIER from '@dimforge/rapier3d-compat';
import { AIM_ANGLE_MAX, POWER_MIN, POWER_MAX } from '../constants';
import { lerp } from '../utils/MathHelpers';
import type { MarblePair } from '../types';

export class ShootingSystem {
  shoot(marble: MarblePair, aimX: number, aimY: number) {
    // aimX [-1, 1] -> angle offset
    const angle = aimX * AIM_ANGLE_MAX;

    // aimY [-1, 1] -> power (map to [POWER_MIN, POWER_MAX])
    // -1 = min power, +1 = max power
    // Exponential curve: gentle at low end, aggressive ramp at high end
    const t = (aimY + 1) / 2;
    const curved = Math.pow(t, 1.8);
    const power = lerp(POWER_MIN, POWER_MAX, curved);

    // Direction: forward is +Z (toward the back of table)
    const dx = Math.sin(angle);
    const dy = 0.02; // slight upward to prevent immediate ground friction lock
    const dz = Math.cos(angle);

    const impulse = new RAPIER.Vector3(dx * power, dy * power, dz * power);
    marble.body.applyImpulse(impulse, true);
  }
}
