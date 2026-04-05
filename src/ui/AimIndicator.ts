import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import {
  TABLE_Y, TABLE_HALF_HEIGHT,
  AIM_ANGLE_MAX, PLAYER_MARBLE_RADIUS,
} from '../constants';
import { getTableConfig } from '../core/TableConfig';

export class AimIndicator {
  private line: Line2;
  private geometry: LineGeometry;
  private material: LineMaterial;
  private powerLine: Line2;
  private powerGeometry: LineGeometry;
  private powerMaterial: LineMaterial;
  private scene: THREE.Scene;
  private visible = false;
  private lockedAngle = 0;
  private fullLineLength: number;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.fullLineLength = getTableConfig().halfDepth * 2.5;

    // Aim direction line
    this.material = new LineMaterial({
      color: 0xff4444,
      linewidth: 2,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    });
    this.geometry = new LineGeometry();
    this.geometry.setPositions([0, 0, 0, 0, 0, 0]);
    this.line = new Line2(this.geometry, this.material);
    this.line.visible = false;
    this.scene.add(this.line);

    // Power segment (blue overlay on the aim line)
    this.powerMaterial = new LineMaterial({
      color: 0x3388ff,
      linewidth: 2,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      depthTest: false,
    });
    this.powerGeometry = new LineGeometry();
    this.powerGeometry.setPositions([0, 0, 0, 0, 0, 0]);
    this.powerLine = new Line2(this.powerGeometry, this.powerMaterial);
    this.powerLine.renderOrder = 1;
    this.powerLine.visible = false;
    this.scene.add(this.powerLine);

    window.addEventListener('resize', () => {
      const res = new THREE.Vector2(window.innerWidth, window.innerHeight);
      this.material.resolution = res;
      this.powerMaterial.resolution = res;
    });
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
    const cfg = getTableConfig();
    const y = TABLE_Y + TABLE_HALF_HEIGHT + PLAYER_MARBLE_RADIUS + 0.006;
    const startX = cfg.shooterX;
    const startZ = cfg.shooterZ;

    const segmentLength = t * this.fullLineLength;

    const endX = startX + Math.sin(this.lockedAngle) * segmentLength;
    const endZ = startZ + Math.cos(this.lockedAngle) * segmentLength;

    this.powerGeometry.setPositions([startX, y, startZ, endX, y, endZ]);
  }

  update(aimX: number) {
    if (!this.visible) return;

    const cfg = getTableConfig();
    const y = TABLE_Y + TABLE_HALF_HEIGHT + PLAYER_MARBLE_RADIUS + 0.005;
    const startX = cfg.shooterX;
    const startZ = cfg.shooterZ;

    const angle = aimX * AIM_ANGLE_MAX;

    const endX = startX + Math.sin(angle) * this.fullLineLength;
    const endZ = startZ + Math.cos(angle) * this.fullLineLength;

    this.geometry.setPositions([startX, y, startZ, endX, y, endZ]);
  }
}
