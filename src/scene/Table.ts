import * as THREE from 'three';
import { PhysicsWorld } from '../core/PhysicsWorld';
import {
  TABLE_HALF_WIDTH, TABLE_HALF_DEPTH, TABLE_HALF_HEIGHT, TABLE_Y,
  LIP_HEIGHT, LIP_THICKNESS,
} from '../constants';

export class Table {
  readonly mesh: THREE.Group;

  constructor(scene: THREE.Scene, physics: PhysicsWorld) {
    this.mesh = new THREE.Group();

    // Outer dimensions include bumper thickness
    const outerHalfWidth = TABLE_HALF_WIDTH + LIP_THICKNESS * 2;
    const outerHalfDepth = TABLE_HALF_DEPTH + LIP_THICKNESS * 2;

    // Table surface extends to outer edge of bumpers
    const surfaceGeo = new THREE.BoxGeometry(
      outerHalfWidth * 2,
      TABLE_HALF_HEIGHT * 2,
      outerHalfDepth * 2
    );
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x1a6b3c, // green felt
      roughness: 0.9,
      metalness: 0.0,
    });
    const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
    surface.position.set(0, TABLE_Y, 0);
    surface.receiveShadow = true;
    surface.castShadow = true;
    this.mesh.add(surface);

    // Physics: table surface (full outer extent)
    physics.createStaticBox(
      outerHalfWidth, TABLE_HALF_HEIGHT, outerHalfDepth,
      0, TABLE_Y, 0,
      0.5, 0.2
    );

    // Edge lips (low bumpers) — front/back span full outer width for complete corners
    const lipMat = new THREE.MeshStandardMaterial({
      color: 0x5c3317, // dark wood
      roughness: 0.7,
    });

    const lipY = TABLE_Y + TABLE_HALF_HEIGHT + LIP_HEIGHT;
    const lips: { hx: number; hy: number; hz: number; x: number; y: number; z: number }[] = [
      // Front lip (-Z) — full outer width
      { hx: outerHalfWidth, hy: LIP_HEIGHT, hz: LIP_THICKNESS, x: 0, y: lipY, z: -(TABLE_HALF_DEPTH + LIP_THICKNESS) },
      // Back lip (+Z) — full outer width
      { hx: outerHalfWidth, hy: LIP_HEIGHT, hz: LIP_THICKNESS, x: 0, y: lipY, z: TABLE_HALF_DEPTH + LIP_THICKNESS },
      // Left lip (-X) — inner depth (between front and back lips)
      { hx: LIP_THICKNESS, hy: LIP_HEIGHT, hz: TABLE_HALF_DEPTH, x: -(TABLE_HALF_WIDTH + LIP_THICKNESS), y: lipY, z: 0 },
      // Right lip (+X) — inner depth (between front and back lips)
      { hx: LIP_THICKNESS, hy: LIP_HEIGHT, hz: TABLE_HALF_DEPTH, x: TABLE_HALF_WIDTH + LIP_THICKNESS, y: lipY, z: 0 },
    ];

    for (const lip of lips) {
      const geo = new THREE.BoxGeometry(lip.hx * 2, lip.hy * 2, lip.hz * 2);
      const mesh = new THREE.Mesh(geo, lipMat);
      mesh.position.set(lip.x, lip.y, lip.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.mesh.add(mesh);

      physics.createStaticBox(
        lip.hx, lip.hy, lip.hz,
        lip.x, lip.y, lip.z,
        0.3, 0.5
      );
    }

    // Table legs (visual only)
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, TABLE_Y - TABLE_HALF_HEIGHT, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.7 });
    const legOffsets = [
      [-(outerHalfWidth - 0.1), -(outerHalfDepth - 0.1)],
      [outerHalfWidth - 0.1, -(outerHalfDepth - 0.1)],
      [-(outerHalfWidth - 0.1), outerHalfDepth - 0.1],
      [outerHalfWidth - 0.1, outerHalfDepth - 0.1],
    ];
    for (const [lx, lz] of legOffsets) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, (TABLE_Y - TABLE_HALF_HEIGHT) / 2, lz);
      leg.castShadow = true;
      this.mesh.add(leg);
    }

    scene.add(this.mesh);
  }
}
