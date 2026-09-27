export type GameState = 
  | 'TITLE'
  | 'STAGE_TRANSITION'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAMEOVER'
  | 'VICTORY';

export type StageId = 1 | 2 | 3;

export interface ControllerKeys {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean; // B button (空氣砲)
  jump: boolean;  // A button (跳躍)
  select: boolean;
  start: boolean;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  oxygen: number;
  facing: 'left' | 'right' | 'up' | 'down';
  invincibleTimer: number;
  isGrounded: boolean;
  hasHopter: boolean;
  hopterTimer: number;
  walkFrame: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
  isEnemy?: boolean;
}

export type EnemyType = 
  | 'alien' 
  | 'crawler' 
  | 'bat' 
  | 'golem' 
  | 'skull' 
  | 'jellyfish' 
  | 'shark' 
  | 'boss';

export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  type: EnemyType;
  radius: number;
  baseY?: number;
  shootTimer?: number;
  patternTimer?: number;
}

export type ItemType = 'dorayaki' | 'hopter' | 'oxygen' | 'friend' | '1up';

export interface Item {
  id: number;
  x: number;
  y: number;
  type: ItemType;
  name?: string;
  radius: number;
  bobOffset: number;
}

export interface Block {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  destructible: boolean;
  containsItem?: ItemType;
  type: 'brick' | 'rock' | 'ruins' | 'coral';
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  vx?: number;
  minX?: number;
  maxX?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface Goal {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  unlocked: boolean;
}

export interface FriendRescueInfo {
  name: string;
  character: string;
  dialog: string;
  color: string;
  rescued: boolean;
}
