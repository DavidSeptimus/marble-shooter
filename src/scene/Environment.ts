import * as THREE from 'three';

export class Environment {
  constructor(scene: THREE.Scene) {
    // Simple living room: floor, back wall, side walls
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x8b6f47,
      roughness: 0.9,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back wall
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xd4c4a8,
      roughness: 0.8,
    });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), wallMat);
    backWall.position.set(0, 4, 8);
    backWall.rotation.y = Math.PI;
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), wallMat);
    leftWall.position.set(-8, 4, 0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), wallMat);
    rightWall.position.set(8, 4, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);
  }
}
