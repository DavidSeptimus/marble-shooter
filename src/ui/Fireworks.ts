import * as THREE from 'three';

interface FireworkParticle {
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface FireworkBurst {
  points: THREE.Points;
  particles: FireworkParticle[];
  elapsed: number;
}

const FIREWORK_COLORS = [
  0xff0000, 0xff6600, 0xffff00, 0x00ff00,
  0x00ffff, 0x0066ff, 0xff00ff, 0xffffff,
];

export class Fireworks {
  private scene: THREE.Scene;
  private bursts: FireworkBurst[] = [];
  private spawnTimer = 0;
  private running = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  start() {
    this.running = true;
    this.spawnTimer = 0;
  }

  stop() {
    this.running = false;
    for (const burst of this.bursts) {
      this.scene.remove(burst.points);
      burst.points.geometry.dispose();
      (burst.points.material as THREE.PointsMaterial).dispose();
    }
    this.bursts = [];
  }

  private spawnBurst() {
    const count = 80 + Math.floor(Math.random() * 60);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const particles: FireworkParticle[] = [];

    // Random position above the table
    const cx = (Math.random() - 0.5) * 3;
    const cy = 1.5 + Math.random() * 1.5;
    const cz = (Math.random() - 0.5) * 2;

    const color = new THREE.Color(
      FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)]
    );
    // Add a secondary shimmer color
    const color2 = new THREE.Color(
      FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)]
    );

    for (let i = 0; i < count; i++) {
      positions[i * 3] = cx;
      positions[i * 3 + 1] = cy;
      positions[i * 3 + 2] = cz;

      const c = Math.random() > 0.3 ? color : color2;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      const speed = 1.0 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const maxLife = 1.0 + Math.random() * 1.0;

      particles.push({
        velocity: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed,
          Math.cos(phi) * speed
        ),
        life: maxLife,
        maxLife,
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.bursts.push({ points, particles, elapsed: 0 });
  }

  update(dt: number) {
    if (!this.running) return;

    // Spawn new bursts periodically
    this.spawnTimer += dt;
    if (this.spawnTimer > 0.4) {
      this.spawnTimer = 0;
      this.spawnBurst();
    }

    // Update existing bursts
    for (let b = this.bursts.length - 1; b >= 0; b--) {
      const burst = this.bursts[b];
      burst.elapsed += dt;

      const positions = burst.points.geometry.attributes.position as THREE.BufferAttribute;
      let allDead = true;

      for (let i = 0; i < burst.particles.length; i++) {
        const p = burst.particles[i];
        p.life -= dt;
        if (p.life <= 0) continue;
        allDead = false;

        // Slow down over time (drag) and apply gravity
        const drag = 0.98;
        p.velocity.x *= drag;
        p.velocity.y *= drag;
        p.velocity.z *= drag;
        p.velocity.y -= 3.0 * dt; // gravity

        positions.setXYZ(
          i,
          positions.getX(i) + p.velocity.x * dt,
          positions.getY(i) + p.velocity.y * dt,
          positions.getZ(i) + p.velocity.z * dt
        );
      }

      positions.needsUpdate = true;

      // Fade out
      const maxLife = burst.particles[0].maxLife;
      const avgProgress = burst.elapsed / (maxLife + 0.5);
      (burst.points.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - avgProgress);

      if (allDead || burst.elapsed > 3) {
        this.scene.remove(burst.points);
        burst.points.geometry.dispose();
        (burst.points.material as THREE.PointsMaterial).dispose();
        this.bursts.splice(b, 1);
      }
    }
  }
}
