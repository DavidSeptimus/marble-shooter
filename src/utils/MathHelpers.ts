import { getTableConfig } from '../core/TableConfig';

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomTargetPosition(): { x: number; z: number } {
  const cfg = getTableConfig();
  return {
    x: randomRange(cfg.targetMinX, cfg.targetMaxX),
    z: randomRange(cfg.targetMinZ, cfg.targetMaxZ),
  };
}

export function oscillate(time: number, speed: number): number {
  return Math.sin(time * speed);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
