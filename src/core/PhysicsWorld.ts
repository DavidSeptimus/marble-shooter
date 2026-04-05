import RAPIER from '@dimforge/rapier3d-compat';
import { PHYSICS_TIMESTEP } from '../constants';

export type CollisionCallback = (handle1: number, handle2: number) => void;

export class PhysicsWorld {
  readonly world: RAPIER.World;
  private eventQueue: RAPIER.EventQueue;
  private onCollision: CollisionCallback | null = null;

  constructor() {
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this.eventQueue = new RAPIER.EventQueue(true);
  }

  setCollisionCallback(cb: CollisionCallback) {
    this.onCollision = cb;
  }

  step() {
    this.world.timestep = PHYSICS_TIMESTEP;
    this.world.step(this.eventQueue);

    this.eventQueue.drainCollisionEvents((h1, h2, started) => {
      if (started && this.onCollision) {
        this.onCollision(h1, h2);
      }
    });
  }

  createStaticBox(
    hx: number, hy: number, hz: number,
    x: number, y: number, z: number,
    friction = 0.5, restitution = 0.2
  ): RAPIER.RigidBody {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
    const body = this.world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(hx, hy, hz)
      .setFriction(friction)
      .setRestitution(restitution);
    this.world.createCollider(colliderDesc, body);

    return body;
  }

  createDynamicSphere(
    radius: number,
    x: number, y: number, z: number,
    options: {
      density?: number;
      friction?: number;
      restitution?: number;
      linearDamping?: number;
      angularDamping?: number;
      ccdEnabled?: boolean;
      activeEvents?: boolean;
    } = {}
  ): { body: RAPIER.RigidBody; colliderHandle: number } {
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y, z)
      .setLinearDamping(options.linearDamping ?? 1.5)
      .setAngularDamping(options.angularDamping ?? 1.0)
      .setCcdEnabled(options.ccdEnabled ?? false);

    const body = this.world.createRigidBody(bodyDesc);

    let colliderDesc = RAPIER.ColliderDesc.ball(radius)
      .setDensity(options.density ?? 2500)
      .setFriction(options.friction ?? 0.3)
      .setRestitution(options.restitution ?? 0.6);

    if (options.activeEvents) {
      colliderDesc = colliderDesc.setActiveEvents(
        RAPIER.ActiveEvents.COLLISION_EVENTS
      );
    }

    const collider = this.world.createCollider(colliderDesc, body);

    return { body, colliderHandle: collider.handle };
  }

  removeBody(body: RAPIER.RigidBody) {
    this.world.removeRigidBody(body);
  }
}
