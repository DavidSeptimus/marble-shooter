import * as THREE from 'three';

interface FallingPiece {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  life: number;
}

export class GameOverEffect {
  private scene: THREE.Scene;
  private pieces: FallingPiece[] = [];
  private running = false;
  private elapsed = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  start() {
    this.running = true;
    this.elapsed = 0;

    // Spawn shattered marble pieces falling from above
    const colors = [0xff3333, 0xff9900, 0x3366ff, 0x33cc33, 0x9933ff];
    const geo = new THREE.TetrahedronGeometry(0.04, 0);

    for (let i = 0; i < 30; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 3,
        2.0 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2
      );
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.pieces.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          -1.0 - Math.random() * 2.0,
          (Math.random() - 0.5) * 1.5
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ),
        life: 2.0 + Math.random() * 1.0,
      });
    }
  }

  stop() {
    this.running = false;
    for (const piece of this.pieces) {
      this.scene.remove(piece.mesh);
      (piece.mesh.material as THREE.MeshStandardMaterial).dispose();
    }
    this.pieces = [];
  }

  update(dt: number) {
    if (!this.running) return;
    this.elapsed += dt;

    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i];
      p.life -= dt;

      // Gravity
      p.velocity.y -= 4.0 * dt;

      p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
      p.mesh.rotation.x += p.rotSpeed.x * dt;
      p.mesh.rotation.y += p.rotSpeed.y * dt;
      p.mesh.rotation.z += p.rotSpeed.z * dt;

      // Fade out in last 30%
      const fadeStart = 0.3;
      if (p.life < fadeStart) {
        (p.mesh.material as THREE.MeshStandardMaterial).opacity = Math.max(0, p.life / fadeStart);
      }

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.MeshStandardMaterial).dispose();
        this.pieces.splice(i, 1);
      }
    }
  }
}
