import * as THREE from 'three';
import { PhysicsWorld } from '../core/PhysicsWorld';
import {
  PLAYER_MARBLE_RADIUS, PLAYER_MARBLE_DENSITY,
  PLAYER_MARBLE_FRICTION, PLAYER_MARBLE_RESTITUTION,
  PLAYER_LINEAR_DAMPING, PLAYER_ANGULAR_DAMPING,
  TARGET_MARBLE_DENSITY, TARGET_MARBLE_FRICTION,
  TARGET_MARBLE_RESTITUTION, TARGET_LINEAR_DAMPING,
  TARGET_ANGULAR_DAMPING, TABLE_Y, TABLE_HALF_HEIGHT,
} from '../constants';
import type { MarblePair } from '../types';

const marbleGeometryCache = new Map<number, THREE.SphereGeometry>();

function getGeometry(radius: number): THREE.SphereGeometry {
  if (!marbleGeometryCache.has(radius)) {
    marbleGeometryCache.set(radius, new THREE.SphereGeometry(radius, 32, 32));
  }
  return marbleGeometryCache.get(radius)!;
}

let envMap: THREE.Texture | null = null;

export function setMarbleEnvMap(texture: THREE.Texture) {
  envMap = texture;
}

function rgba(color: THREE.Color, alpha: number): string {
  return `rgba(${(color.r * 255) | 0}, ${(color.g * 255) | 0}, ${(color.b * 255) | 0}, ${alpha})`;
}

function createSwirlTexture(baseColor: number, size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  const base = new THREE.Color(baseColor);
  const light = base.clone().lerp(new THREE.Color(0xffffff), 0.55);
  const dark = base.clone().lerp(new THREE.Color(0x000000), 0.35);
  const accent = base.clone().offsetHSL(0.15, 0.1, 0.05);

  // Radial gradient base
  const grad = ctx.createRadialGradient(cx * 0.8, cy * 0.7, 0, cx, cy, size * 0.55);
  grad.addColorStop(0, rgba(light, 1));
  grad.addColorStop(0.5, `#${base.getHexString()}`);
  grad.addColorStop(1, rgba(dark, 1));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'overlay';

  // Thick primary swirl — wide ribbon
  ctx.strokeStyle = rgba(light, 0.7);
  ctx.lineWidth = size * 0.14;
  ctx.beginPath();
  for (let t = 0; t < Math.PI * 5; t += 0.04) {
    const r = (t / (Math.PI * 5)) * size * 0.42;
    const x = cx + r * Math.cos(t * 1.3);
    const y = cy + r * Math.sin(t * 1.3);
    t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Counter-rotating accent swirl
  ctx.strokeStyle = rgba(accent, 0.6);
  ctx.lineWidth = size * 0.09;
  ctx.beginPath();
  for (let t = 0; t < Math.PI * 4; t += 0.04) {
    const r = (t / (Math.PI * 4)) * size * 0.38;
    const x = cx + r * Math.cos(-t * 1.1 + 1.5);
    const y = cy + r * Math.sin(-t * 1.1 + 1.5);
    t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Thin dark veins
  ctx.globalCompositeOperation = 'multiply';
  ctx.strokeStyle = rgba(dark, 0.5);
  ctx.lineWidth = size * 0.03;
  for (let i = 0; i < 3; i++) {
    const phase = i * 2.1;
    const speed = 1.4 + i * 0.3;
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 4; t += 0.04) {
      const r = (t / (Math.PI * 4)) * size * 0.4;
      const x = cx + r * Math.cos(t * speed + phase);
      const y = cy + r * Math.sin(t * speed + phase);
      t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Central bright spot (cat's eye highlight)
  ctx.globalCompositeOperation = 'screen';
  const spot = ctx.createRadialGradient(cx * 0.75, cy * 0.65, 0, cx * 0.75, cy * 0.65, size * 0.18);
  spot.addColorStop(0, 'rgba(255,255,255,0.5)');
  spot.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMarbleMaterial(color: number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    map: createSwirlTexture(color),
    roughness: 0.08,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    reflectivity: 0.9,
    envMap: envMap,
    envMapIntensity: 0.8,
  });
}

export function createPlayerMarble(
  scene: THREE.Scene,
  physics: PhysicsWorld,
  x: number, z: number
): MarblePair {
  const y = TABLE_Y + TABLE_HALF_HEIGHT + PLAYER_MARBLE_RADIUS + 0.001;

  const geo = getGeometry(PLAYER_MARBLE_RADIUS);
  const mat = createMarbleMaterial(0x3366ff);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  scene.add(mesh);

  const { body, colliderHandle } = physics.createDynamicSphere(
    PLAYER_MARBLE_RADIUS, x, y, z,
    {
      density: PLAYER_MARBLE_DENSITY,
      friction: PLAYER_MARBLE_FRICTION,
      restitution: PLAYER_MARBLE_RESTITUTION,
      linearDamping: PLAYER_LINEAR_DAMPING,
      angularDamping: PLAYER_ANGULAR_DAMPING,
      ccdEnabled: true,
      activeEvents: true,
    }
  );

  return { mesh, body, colliderHandle };
}

export function createTargetMarble(
  scene: THREE.Scene,
  physics: PhysicsWorld,
  x: number, z: number,
  radius: number,
  color: number = 0xff3333
): MarblePair {
  const y = TABLE_Y + TABLE_HALF_HEIGHT + radius + 0.001;

  const geo = getGeometry(radius);
  const mat = createMarbleMaterial(color);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  scene.add(mesh);

  const { body, colliderHandle } = physics.createDynamicSphere(
    radius, x, y, z,
    {
      density: TARGET_MARBLE_DENSITY,
      friction: TARGET_MARBLE_FRICTION,
      restitution: TARGET_MARBLE_RESTITUTION,
      linearDamping: TARGET_LINEAR_DAMPING,
      angularDamping: TARGET_ANGULAR_DAMPING,
      ccdEnabled: false,
      activeEvents: true,
    }
  );

  return { mesh, body, colliderHandle };
}
