import * as THREE from 'three';
import {
  SHOOTER_POSITION_X, SHOOTER_POSITION_Z,
  TABLE_Y, TABLE_HALF_HEIGHT, TABLE_HALF_DEPTH,
  AIM_ANGLE_MAX, PLAYER_MARBLE_RADIUS,
} from '../constants';

export class AimIndicator {
  private line: THREE.Line;
  private geometry: THREE.BufferGeometry;
  private material: THREE.LineBasicMaterial;
  private powerLine: THREE.Line;
  private powerGeometry: THREE.BufferGeometry;
  private powerMaterial: THREE.LineBasicMaterial;
  private scene: THREE.Scene;
  private visible = false;
  private lockedAngle = 0;
  private fullLineLength: number;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.fullLineLength = TABLE_HALF_DEPTH * 2.5;

    // Aim direction line
    this.material = new THREE.LineBasicMaterial({ color: 0xff4444, linewidth: 2 });
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.line = new THREE.Line(this.geometry, this.material);
    this.line.visible = false;
    this.scene.add(this.line);

    // Power segment (blue overlay on the aim line)
    this.powerMaterial = new THREE.LineBasicMaterial({ color: 0x3388ff, linewidth: 3, depthTest: false });
    this.powerGeometry = new THREE.BufferGeometry();
    const powerPositions = new Float32Array(6);
    this.powerGeometry.setAttribute('position', new THREE.BufferAttribute(powerPositions, 3));
    this.powerLine = new THREE.Line(this.powerGeometry, this.powerMaterial);
    this.powerLine.renderOrder = 1;
    this.powerLine.visible = false;
    this.scene.add(this.powerLine);
  }

  show() {
    this.line.visible = true;
    this.visible = true;
    this.material.color.set(0xff4444);
    this.powerLine.visible = false;
  }

  hide() {
    this.line.visible = false;
    this.powerLine.visible = false;
    this.visible = false;
  }

  lock(aimX: number) {
    this.material.color.set(0x44ff44);
    this.lockedAngle = aimX * AIM_ANGLE_MAX;
    // Show power segment overlay
    this.powerLine.visible = true;
  }

  updatePower(powerValue: number) {
    // powerValue is in [-1, 1], map to [0, 1] for segment length
    const t = (powerValue + 1) / 2;
    const y = TABLE_Y + TABLE_HALF_HEIGHT + PLAYER_MARBLE_RADIUS + 0.006;
    const startX = SHOOTER_POSITION_X;
    const startZ = SHOOTER_POSITION_Z;

    const segmentLength = t * this.fullLineLength;

    const endX = startX + Math.sin(this.lockedAngle) * segmentLength;
    const endZ = startZ + Math.cos(this.lockedAngle) * segmentLength;

    const positions = this.powerGeometry.attributes.position as THREE.BufferAttribute;
    positions.setXYZ(0, startX, y, startZ);
    positions.setXYZ(1, endX, y, endZ);
    positions.needsUpdate = true;
  }

  update(aimX: number) {
    if (!this.visible) return;

    const y = TABLE_Y + TABLE_HALF_HEIGHT + PLAYER_MARBLE_RADIUS + 0.005;
    const startX = SHOOTER_POSITION_X;
    const startZ = SHOOTER_POSITION_Z;

    const angle = aimX * AIM_ANGLE_MAX;

    const endX = startX + Math.sin(angle) * this.fullLineLength;
    const endZ = startZ + Math.cos(angle) * this.fullLineLength;

    const positions = this.geometry.attributes.position as THREE.BufferAttribute;
    positions.setXYZ(0, startX, y, startZ);
    positions.setXYZ(1, endX, y, endZ);
    positions.needsUpdate = true;
  }
}
