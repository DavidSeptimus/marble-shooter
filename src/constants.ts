// Table dimensions (half-extents)
export const TABLE_HALF_WIDTH = 1.5;
export const TABLE_HALF_DEPTH = 1.0;
export const TABLE_HALF_HEIGHT = 0.05;
export const TABLE_Y = 0.75;

// Table lip
export const LIP_HEIGHT = 0.02;
export const LIP_THICKNESS = 0.02;

// Player marble
export const PLAYER_MARBLE_RADIUS = 0.04;
export const PLAYER_MARBLE_DENSITY = 2500;
export const PLAYER_MARBLE_FRICTION = 0.3;
export const PLAYER_MARBLE_RESTITUTION = 0.6;
export const PLAYER_LINEAR_DAMPING = 1.5;
export const PLAYER_ANGULAR_DAMPING = 1.0;

// Target marble radii per round
export const TARGET_RADII = [0.08, 0.05, 0.03];
export const TARGET_MARBLE_DENSITY = 2500;
export const TARGET_MARBLE_FRICTION = 0.3;
export const TARGET_MARBLE_RESTITUTION = 0.6;
export const TARGET_LINEAR_DAMPING = 2.0;
export const TARGET_ANGULAR_DAMPING = 1.0;

// Shooting
export const SHOOTER_POSITION_X = 0;
export const SHOOTER_POSITION_Z = -(TABLE_HALF_DEPTH - 0.15); // near front edge
export const AIM_ANGLE_MAX = Math.PI / 2; // 90 degrees each side = 180 total
export const POWER_MIN = 0.5;
export const POWER_MAX = 10;

// Aiming oscillation
export const BASE_AIM_SPEED = 1.5;
export const ROUND_SPEED_BONUS = 0;
export const MARBLE_SPEED_BONUS = 0.1;

// Target placement (back 80% of table)
export const TARGET_MIN_X = -(TABLE_HALF_WIDTH - 0.15);
export const TARGET_MAX_X = TABLE_HALF_WIDTH - 0.15;
export const TARGET_MIN_Z = -(TABLE_HALF_DEPTH * 0.6);
export const TARGET_MAX_Z = TABLE_HALF_DEPTH - 0.15;

// Game rules
export const MARBLES_PER_ROUND = 10;
export const TOTAL_ROUNDS = 3;
export const ATTEMPTS_PER_MARBLE = 3;

// Physics
export const PHYSICS_TIMESTEP = 1 / 60;
export const FELL_OFF_Y = 0.3;
export const SETTLED_VELOCITY_THRESHOLD = 0.05;
export const SETTLED_FRAMES_REQUIRED = 30;

// Timing
export const RESULT_DISPLAY_TIME = 1.5;
export const ROUND_TRANSITION_TIME = 2.0;

// 10 target marble colors (cycled per marble index)
export const TARGET_COLORS = [
  0xff3333, // red
  0xff9900, // orange
  0xffee00, // yellow
  0x33cc33, // green
  0x00cccc, // teal
  0x3366ff, // blue
  0x9933ff, // purple
  0xff33cc, // pink
  0xffffff, // white
  0x222222, // black
];
