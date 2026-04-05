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

export function createPlayerMarble(
  scene: THREE.Scene,
  physics: PhysicsWorld,
  x: number, z: number
): MarblePair {
  const y = TABLE_Y + TABLE_HALF_HEIGHT + PLAYER_MARBLE_RADIUS + 0.001;

  const geo = getGeometry(PLAYER_MARBLE_RADIUS);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x3366ff,
    roughness: 0.2,
    metalness: 0.3,
  });
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
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.2,
    metalness: 0.3,
  });
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
