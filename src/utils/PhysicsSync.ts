import type * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';

interface SyncEntry {
  mesh: THREE.Mesh;
  body: RAPIER.RigidBody;
}

export class PhysicsSync {
  private entries: SyncEntry[] = [];

  add(mesh: THREE.Mesh, body: RAPIER.RigidBody) {
    this.entries.push({ mesh, body });
  }

  remove(body: RAPIER.RigidBody) {
    this.entries = this.entries.filter((e) => e.body !== body);
  }

  clear() {
    this.entries = [];
  }

  sync() {
    for (const { mesh, body } of this.entries) {
      const pos = body.translation();
      mesh.position.set(pos.x, pos.y, pos.z);
      const rot = body.rotation();
      mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    }
  }
}
