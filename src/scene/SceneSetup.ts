import * as THREE from 'three';
import { TABLE_Y } from '../constants';
import { getTableConfig } from '../core/TableConfig';

export class SceneSetup {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  private readonly fov = 50;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a1a0e);

    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.updateCameraForTable();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(this.renderer.domElement);

    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    // Directional light with shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(2, 5, -1);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -4;
    dirLight.shadow.camera.right = 4;
    dirLight.shadow.camera.top = 4;
    dirLight.shadow.camera.bottom = -4;
    this.scene.add(dirLight);

    // Warm point light above table
    const pointLight = new THREE.PointLight(0xffd699, 0.6, 10);
    pointLight.position.set(0, 2.5, 0);
    this.scene.add(pointLight);

    window.addEventListener('resize', this.onResize);
  }

  private updateCameraForTable() {
    const cfg = getTableConfig();
    const aspect = this.camera.aspect;
    const fovRad = (this.fov * Math.PI) / 180;
    const padding = 0.4; // world-unit padding around table for floor visibility

    // Compute required camera height to see full table width and depth
    const requiredForDepth = (cfg.halfDepth + padding) / Math.tan(fovRad / 2);
    const hFov = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
    const requiredForWidth = (cfg.halfWidth + padding) / Math.tan(hFov / 2);
    const dist = Math.max(requiredForWidth, requiredForDepth);

    // Position camera above and behind the table (player's perspective from -Z)
    this.camera.position.set(0, dist * 0.85, -dist * 0.5);
    this.camera.lookAt(0, TABLE_Y, cfg.halfDepth * 0.15);
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.updateCameraForTable();
  };

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
