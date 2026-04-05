export interface TableConfig {
  halfWidth: number;
  halfDepth: number;
  shooterX: number;
  shooterZ: number;
  targetMinX: number;
  targetMaxX: number;
  targetMinZ: number;
  targetMaxZ: number;
}

let config: TableConfig | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function initTableConfig(screenAspect: number): void {
  // Base table area: 3.0 * 2.0 = 6.0 square units (current landscape dimensions)
  const area = 6.0;

  let halfWidth: number;
  let halfDepth: number;

  if (screenAspect >= 1) {
    // Landscape or square: use current dimensions
    halfWidth = 1.5;
    halfDepth = 1.0;
  } else {
    // Portrait: table taller than wide, scaled to match screen aspect
    const totalWidth = Math.sqrt(area * screenAspect);
    const totalDepth = area / totalWidth;
    halfWidth = clamp(totalWidth / 2, 0.7, 1.5);
    halfDepth = clamp(totalDepth / 2, 1.0, 1.8);
  }

  config = {
    halfWidth,
    halfDepth,
    shooterX: 0,
    shooterZ: -(halfDepth - 0.15),
    targetMinX: -(halfWidth - 0.15),
    targetMaxX: halfWidth - 0.15,
    targetMinZ: -(halfDepth * 0.6),
    targetMaxZ: halfDepth - 0.15,
  };
}

export function getTableConfig(): TableConfig {
  if (!config) {
    throw new Error('TableConfig not initialized. Call initTableConfig() first.');
  }
  return config;
}
