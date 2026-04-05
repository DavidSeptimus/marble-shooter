import type * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';

export enum GameStateType {
  TITLE = 'TITLE',
  AIMING_X = 'AIMING_X',
  AIMING_Y = 'AIMING_Y',
  SHOOTING = 'SHOOTING',
  ROLLING = 'ROLLING',
  RESULT = 'RESULT',
  NEXT_MARBLE = 'NEXT_MARBLE',
  ROUND_TRANSITION = 'ROUND_TRANSITION',
  GAME_OVER = 'GAME_OVER',
  WIN = 'WIN',
}

export interface MarblePair {
  mesh: THREE.Mesh;
  body: RAPIER.RigidBody;
  colliderHandle: number;
}
