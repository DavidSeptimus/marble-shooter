import {
  TARGET_MIN_X, TARGET_MAX_X,
  TARGET_MIN_Z, TARGET_MAX_Z,
} from '../constants';

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomTargetPosition(): { x: number; z: number } {
  return {
    x: randomRange(TARGET_MIN_X, TARGET_MAX_X),
    z: randomRange(TARGET_MIN_Z, TARGET_MAX_Z),
  };
}

export function oscillate(time: number, speed: number): number {
  return Math.sin(time * speed);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
