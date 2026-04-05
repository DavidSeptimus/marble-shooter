import * as THREE from 'three';

interface Particle {
  velocity: THREE.Vector3;
  life: number;
}

export class ParticleExplosion {
  private scene: THREE.Scene;
  private systems: { points: THREE.Points; particles: Particle[]; elapsed: number; duration: number }[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  explode(position: THREE.Vector3, color1: number, color2: number, count = 60) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const particles: Particle[] = [];

    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      // Random mix of the two colors
      const c = Math.random() > 0.5 ? c1 : c2;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      // Random velocity in all directions
      const speed = 0.5 + Math.random() * 2.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      particles.push({
        velocity: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed,
          Math.cos(phi) * speed
        ),
        life: 0.8 + Math.random() * 0.7,
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.systems.push({ points, particles, elapsed: 0, duration: 1.5 });
  }

  update(dt: number) {
    for (let s = this.systems.length - 1; s >= 0; s--) {
      const system = this.systems[s];
      system.elapsed += dt;

      if (system.elapsed >= system.duration) {
        this.scene.remove(system.points);
        system.points.geometry.dispose();
        (system.points.material as THREE.PointsMaterial).dispose();
        this.systems.splice(s, 1);
        continue;
      }

      const positions = system.points.geometry.attributes.position as THREE.BufferAttribute;
      const progress = system.elapsed / system.duration;

      for (let i = 0; i < system.particles.length; i++) {
        const p = system.particles[i];
        positions.setXYZ(
          i,
          positions.getX(i) + p.velocity.x * dt,
          positions.getY(i) + p.velocity.y * dt - 2.0 * dt * system.elapsed, // gravity
          positions.getZ(i) + p.velocity.z * dt
        );
      }

      positions.needsUpdate = true;
      (system.points.material as THREE.PointsMaterial).opacity = 1 - progress;
    }
  }

  clear() {
    for (const system of this.systems) {
      this.scene.remove(system.points);
      system.points.geometry.dispose();
      (system.points.material as THREE.PointsMaterial).dispose();
    }
    this.systems = [];
  }

  get active(): boolean {
    return this.systems.length > 0;
  }
}
