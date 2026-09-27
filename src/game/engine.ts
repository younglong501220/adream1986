import { 
  GameState, 
  StageId, 
  ControllerKeys, 
  Player, 
  Bullet, 
  Enemy, 
  Item, 
  Block, 
  Platform, 
  Particle, 
  Goal, 
  FriendRescueInfo 
} from './types';
import { GameRenderer } from './renderer';
import { retroAudio } from './sound';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number) => void;
  onStateChange: (state: GameState, stage: StageId) => void;
  onFriendRescued: (friend: FriendRescueInfo) => void;
  onBossEncounter: (active: boolean) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  public state: GameState = 'TITLE';
  public stage: StageId = 1;
  public score: number = 0;
  public highScore: number = 0;

  // Timers
  private transitionTimer: number = 0;
  private dialogTimer: number = 0;
  private currentDialog: { title: string; text: string; color: string } | null = null;

  // Controllers
  public keys: ControllerKeys = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    jump: false,
    select: false,
    start: false,
  };

  // Game Objects
  public player: Player = {
    x: 60,
    y: 220,
    vx: 0,
    vy: 0,
    hp: 5,
    maxHp: 5,
    oxygen: 100,
    facing: 'right',
    invincibleTimer: 0,
    isGrounded: false,
    hasHopter: false,
    hopterTimer: 0,
    walkFrame: 0,
  };

  public bullets: Bullet[] = [];
  public enemies: Enemy[] = [];
  public items: Item[] = [];
  public blocks: Block[] = [];
  public platforms: Platform[] = [];
  public particles: Particle[] = [];
  public goal: Goal | null = null;

  public friends: FriendRescueInfo[] = [
    { name: '大雄', character: '野比大雄', dialog: '哆啦A夢！救救我啊！我差點以為再也回不去了！', color: '#fde047', rescued: false },
    { name: '靜香', character: '源靜香', dialog: '哆啦A夢，太好了！我就知道你一定會來拯救大家的！', color: '#f472b6', rescued: false },
    { name: '小夫', character: '骨川小夫', dialog: '我就知道我的好朋友哆啦A夢最靠得住了！', color: '#38bdf8', rescued: false },
    { name: '胖虎', character: '剛田武', dialog: '幹得好！哆啦A夢！接下來換我大顯身手了！', color: '#f97316', rescued: false },
  ];

  private animFrameId: number | null = null;
  private enemyIdCounter: number = 1;
  private itemIdCounter: number = 1;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2d context');
    this.ctx = context;
    this.callbacks = callbacks;

    // Load saved highscore
    const saved = localStorage.getItem('doraemon1986_high_score');
    if (saved) {
      this.highScore = parseInt(saved, 10) || 0;
    }
  }

  public start() {
    if (this.animFrameId === null) {
      this.loop = this.loop.bind(this);
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    retroAudio.stopBGM();
  }

  public newGame(selectedStage: StageId = 1) {
    retroAudio.init();
    this.score = 0;
    this.stage = selectedStage;
    this.friends.forEach(f => f.rescued = false);
    this.loadStage(selectedStage);
  }

  public loadStage(stageNum: StageId) {
    this.stage = stageNum;
    this.state = 'STAGE_TRANSITION';
    this.transitionTimer = 90; // ~1.5s
    this.callbacks.onStateChange(this.state, this.stage);

    this.bullets = [];
    this.enemies = [];
    this.items = [];
    this.blocks = [];
    this.platforms = [];
    this.particles = [];
    this.currentDialog = null;

    this.player.hp = Math.min(this.player.maxHp, Math.max(3, this.player.hp));
    this.player.oxygen = 100;
    this.player.invincibleTimer = 0;
    this.player.hasHopter = false;
    this.player.hopterTimer = 0;

    retroAudio.stopBGM();

    if (stageNum === 1) {
      this.setupStage1();
    } else if (stageNum === 2) {
      this.setupStage2();
    } else if (stageNum === 3) {
      this.setupStage3();
    }
  }

  // --- STAGE 1: 開拓篇 (Top-Down 8-directional exploration & Air Cannon) ---
  private setupStage1() {
    this.player.x = 60;
    this.player.y = 240;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 'right';

    // Destructible blocks & hidden treats
    const rockLocations = [
      { x: 140, y: 120, item: 'dorayaki' as const },
      { x: 220, y: 280, item: 'hopter' as const },
      { x: 300, y: 150, item: 'dorayaki' as const },
      { x: 180, y: 360, item: '1up' as const },
      { x: 360, y: 320, item: 'dorayaki' as const },
      { x: 260, y: 80, item: undefined },
      { x: 380, y: 180, item: undefined },
    ];

    rockLocations.forEach((r, idx) => {
      this.blocks.push({
        id: idx + 1,
        x: r.x,
        y: r.y,
        w: 28,
        h: 28,
        destructible: true,
        containsItem: r.item,
        type: 'rock',
      });
    });

    // Wandering Aliens and patrol bugs
    for (let i = 0; i < 7; i++) {
      this.enemies.push({
        id: this.enemyIdCounter++,
        x: 180 + Math.random() * 260,
        y: 80 + Math.random() * 290,
        hp: 2,
        maxHp: 2,
        type: i % 2 === 0 ? 'alien' : 'crawler',
        radius: 14,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
      });
    }

    // Dokodemo Door (Pink Door)
    this.goal = {
      x: 456,
      y: 200,
      w: 36,
      h: 56,
      label: '任意門',
      unlocked: true,
    };

    // Free initial Dorayaki
    this.items.push({
      id: this.itemIdCounter++,
      x: 200,
      y: 200,
      type: 'dorayaki',
      radius: 12,
      bobOffset: 0,
    });
  }

  // --- STAGE 2: 魔境篇 (Side-scrolling 2D Platformer) ---
  private setupStage2() {
    this.player.x = 40;
    this.player.y = 300;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 'right';
    this.player.isGrounded = false;

    // Platforms
    this.platforms = [
      { x: 0, y: 380, w: 170, h: 68 },
      { x: 130, y: 310, w: 90, h: 22 },
      { x: 235, y: 250, w: 85, h: 22 },
      { x: 340, y: 190, w: 85, h: 22 },
      { x: 190, y: 380, w: 140, h: 68 },
      { x: 350, y: 360, w: 162, h: 88 },
    ];

    // Ancient ruins blocks
    this.blocks.push({
      id: 101,
      x: 270,
      y: 190,
      w: 24,
      h: 24,
      destructible: true,
      containsItem: 'dorayaki',
      type: 'ruins',
    });

    // Items
    this.items.push({
      id: this.itemIdCounter++,
      x: 380,
      y: 155,
      type: 'dorayaki',
      radius: 12,
      bobOffset: 1,
    });

    // Enemies (Bats & heavy Golem)
    this.enemies.push({
      id: this.enemyIdCounter++,
      x: 280,
      y: 130,
      hp: 1,
      maxHp: 1,
      type: 'bat',
      radius: 10,
      vx: -1.6,
      vy: 0,
      baseY: 130,
    });

    this.enemies.push({
      id: this.enemyIdCounter++,
      x: 420,
      y: 100,
      hp: 1,
      maxHp: 1,
      type: 'bat',
      radius: 10,
      vx: -2.0,
      vy: 0,
      baseY: 100,
    });

    this.enemies.push({
      id: this.enemyIdCounter++,
      x: 230,
      y: 355,
      hp: 3,
      maxHp: 3,
      type: 'golem',
      radius: 16,
      vx: -0.9,
      vy: 0,
    });

    this.enemies.push({
      id: this.enemyIdCounter++,
      x: 430,
      y: 330,
      hp: 4,
      maxHp: 4,
      type: 'golem',
      radius: 16,
      vx: 1.0,
      vy: 0,
    });

    // Sun God Temple Goal
    this.goal = {
      x: 456,
      y: 295,
      w: 42,
      h: 65,
      label: '巨神像神殿',
      unlocked: true,
    };
  }

  // --- STAGE 3: 海底篇 (Deep Sea Rescue & Poseidon Boss) ---
  private setupStage3() {
    this.player.x = 50;
    this.player.y = 220;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 'right';

    // Underwater Corals
    this.blocks.push({ id: 201, x: 160, y: 160, w: 32, h: 32, destructible: false, type: 'coral' });
    this.blocks.push({ id: 202, x: 260, y: 280, w: 32, h: 32, destructible: false, type: 'coral' });

    // Oxygen tanks to replenish O2
    this.items.push({ id: this.itemIdCounter++, x: 120, y: 90, type: 'oxygen', radius: 12, bobOffset: 0.5 });
    this.items.push({ id: this.itemIdCounter++, x: 380, y: 370, type: 'oxygen', radius: 12, bobOffset: 1.5 });
    this.items.push({ id: this.itemIdCounter++, x: 230, y: 90, type: 'oxygen', radius: 12, bobOffset: 2.2 });

    // Dorayaki treats
    this.items.push({ id: this.itemIdCounter++, x: 320, y: 200, type: 'dorayaki', radius: 12, bobOffset: 0.8 });

    // 4 Rescue Friends hidden across the deep ocean!
    const friendPositions = [
      { x: 120, y: 350, name: '大雄' },
      { x: 240, y: 110, name: '靜香' },
      { x: 340, y: 340, name: '小夫' },
      { x: 280, y: 210, name: '胖虎' },
    ];

    friendPositions.forEach((fp) => {
      this.items.push({
        id: this.itemIdCounter++,
        x: fp.x,
        y: fp.y,
        type: 'friend',
        name: fp.name,
        radius: 16,
        bobOffset: Math.random() * 3,
      });
    });

    // Underwater enemies (Jellyfish & Subsea Shark)
    for (let j = 0; j < 4; j++) {
      this.enemies.push({
        id: this.enemyIdCounter++,
        x: 140 + Math.random() * 200,
        y: 80 + Math.random() * 260,
        hp: 2,
        maxHp: 2,
        type: 'jellyfish',
        radius: 14,
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.6,
      });
    }

    this.enemies.push({
      id: this.enemyIdCounter++,
      x: 310,
      y: 130,
      hp: 3,
      maxHp: 3,
      type: 'shark',
      radius: 16,
      vx: -1.8,
      vy: 0.8,
    });

    // Poseidon Dreadnought Core (Final Boss)
    this.enemies.push({
      id: 999,
      x: 430,
      y: 230,
      hp: 16,
      maxHp: 16,
      type: 'boss',
      radius: 36,
      vx: 0,
      vy: 1.4,
      shootTimer: 0,
    });

    // Goal: Dimensional Exit (unlocked when all 4 friends saved + Boss dead)
    this.goal = {
      x: 456,
      y: 200,
      w: 42,
      h: 56,
      label: '時空裂縫',
      unlocked: false,
    };
  }

  // --- CONTROLLER ACTION: B BUTTON (Shoot Air Cannon) ---
  public shootAction() {
    if (this.state !== 'PLAYING') return;
    retroAudio.playShoot();

    let spd = 7.5;
    let vx = 0;
    let vy = 0;

    if (this.stage === 1) {
      // 8-directional shooting
      if (this.keys.up && this.keys.right) { vx = spd * 0.707; vy = -spd * 0.707; }
      else if (this.keys.up && this.keys.left) { vx = -spd * 0.707; vy = -spd * 0.707; }
      else if (this.keys.down && this.keys.right) { vx = spd * 0.707; vy = spd * 0.707; }
      else if (this.keys.down && this.keys.left) { vx = -spd * 0.707; vy = spd * 0.707; }
      else if (this.keys.left) { vx = -spd; }
      else if (this.keys.right) { vx = spd; }
      else if (this.keys.up) { vy = -spd; }
      else if (this.keys.down) { vy = spd; }
      else {
        vx = this.player.facing === 'left' ? -spd : spd;
      }
    } else {
      // Horizontal forward shooting for Stage 2 & 3
      vx = this.player.facing === 'left' ? -spd : spd;
      if (this.stage === 3 && this.keys.up) vy = -2;
      if (this.stage === 3 && this.keys.down) vy = 2;
    }

    const muzzleX = this.player.x + (this.player.facing === 'right' ? 14 : -14);
    const muzzleY = this.player.y + 7;

    this.bullets.push({
      x: muzzleX,
      y: muzzleY,
      vx,
      vy,
      life: 55,
      radius: 6,
    });
  }

  // --- CONTROLLER ACTION: A BUTTON (Jump) ---
  public jumpAction() {
    if (this.state !== 'PLAYING') return;

    if (this.stage === 2 && this.player.isGrounded) {
      this.player.vy = -9.6;
      this.player.isGrounded = false;
      retroAudio.playJump();
    } else if (this.stage === 3) {
      // Underwater upward kick burst
      this.player.vy = -3.8;
      retroAudio.playJump();
      // Bubble kick
      this.particles.push({
        x: this.player.x,
        y: this.player.y + 16,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.5,
        color: '#cffafe',
        size: 3,
        life: 25,
        maxLife: 25,
      });
    }
  }

  // --- MAIN LOOP ---
  private loop() {
    this.update();
    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  // --- UPDATE LOGIC ---
  private update() {
    // Stage Transition Countdown
    if (this.state === 'STAGE_TRANSITION') {
      this.transitionTimer--;
      if (this.transitionTimer <= 0) {
        this.state = 'PLAYING';
        this.callbacks.onStateChange(this.state, this.stage);
        // Start Stage BGM
        retroAudio.startStageBGM(this.stage);
      }
      return;
    }

    if (this.state !== 'PLAYING') return;

    // Invincibility countdown
    if (this.player.invincibleTimer > 0) {
      this.player.invincibleTimer--;
    }

    // Hopter timer
    if (this.player.hasHopter) {
      this.player.hopterTimer--;
      if (this.player.hopterTimer <= 0) {
        this.player.hasHopter = false;
      }
    }

    // Friend rescued dialog timer
    if (this.dialogTimer > 0) {
      this.dialogTimer--;
      if (this.dialogTimer <= 0) {
        this.currentDialog = null;
      }
    }

    // ==========================================
    // STAGE 1: 開拓篇 UPDATE
    // ==========================================
    if (this.stage === 1) {
      let speed = this.player.hasHopter ? 4.2 : 3.2;
      this.player.vx = 0;
      this.player.vy = 0;

      if (this.keys.left) { this.player.vx = -speed; this.player.facing = 'left'; }
      if (this.keys.right) { this.player.vx = speed; this.player.facing = 'right'; }
      if (this.keys.up) { this.player.vy = -speed; }
      if (this.keys.down) { this.player.vy = speed; }

      // Diagonal normalization
      if (this.player.vx !== 0 && this.player.vy !== 0) {
        this.player.vx *= 0.707;
        this.player.vy *= 0.707;
      }

      if (this.player.vx !== 0 || this.player.vy !== 0) {
        this.player.walkFrame++;
      }

      // Check block collision (if not flying with Hopter)
      let nextX = this.player.x + this.player.vx;
      let nextY = this.player.y + this.player.vy;

      if (!this.player.hasHopter) {
        for (const b of this.blocks) {
          if (this.circleRectCollide(nextX, this.player.y, 13, b.x, b.y, b.w, b.h)) {
            this.player.vx = 0;
          }
          if (this.circleRectCollide(this.player.x, nextY, 13, b.x, b.y, b.w, b.h)) {
            this.player.vy = 0;
          }
        }
      }

      this.player.x += this.player.vx;
      this.player.y += this.player.vy;

      // Arena boundaries
      this.player.x = Math.max(18, Math.min(this.canvas.width - 18, this.player.x));
      this.player.y = Math.max(52, Math.min(this.canvas.height - 24, this.player.y));

      // Reached Dokodemo Door
      if (this.goal && this.goal.unlocked) {
        if (this.rectOverlap(
          this.player.x - 12, this.player.y - 12, 24, 24,
          this.goal.x, this.goal.y, this.goal.w, this.goal.h
        )) {
          retroAudio.playClear();
          this.addScore(1500);
          this.loadStage(2);
          return;
        }
      }
    }

    // ==========================================
    // STAGE 2: 魔境篇 UPDATE
    // ==========================================
    if (this.stage === 2) {
      const moveSpd = 3.2;
      this.player.vx = 0;

      if (this.keys.left) { this.player.vx = -moveSpd; this.player.facing = 'left'; }
      if (this.keys.right) { this.player.vx = moveSpd; this.player.facing = 'right'; }

      if (this.player.vx !== 0) {
        this.player.walkFrame++;
      }

      // Apply Gravity
      this.player.vy += 0.46;
      if (this.player.vy > 9) this.player.vy = 9;

      this.player.x += this.player.vx;
      this.player.y += this.player.vy;

      // Platform Collisions (one-way top landing)
      this.player.isGrounded = false;
      for (const p of this.platforms) {
        if (
          this.player.x + 10 > p.x &&
          this.player.x - 10 < p.x + p.w
        ) {
          const feetY = this.player.y + 19;
          if (feetY >= p.y && feetY <= p.y + p.h && this.player.vy >= 0) {
            this.player.y = p.y - 19;
            this.player.vy = 0;
            this.player.isGrounded = true;
          }
        }
      }

      // Fell into the bottomless pit
      if (this.player.y > this.canvas.height + 25) {
        retroAudio.playHit();
        this.player.hp -= 2;
        this.player.x = 40;
        this.player.y = 280;
        this.player.vy = 0;
        this.player.invincibleTimer = 60;
        if (this.player.hp <= 0) {
          this.triggerGameOver();
          return;
        }
      }

      // Screen horizontal boundaries
      this.player.x = Math.max(16, Math.min(this.canvas.width - 16, this.player.x));

      // Reached Ancient Temple Gate
      if (this.goal && this.goal.unlocked) {
        if (this.rectOverlap(
          this.player.x - 12, this.player.y - 12, 24, 24,
          this.goal.x, this.goal.y, this.goal.w, this.goal.h
        )) {
          retroAudio.playClear();
          this.addScore(2000);
          this.loadStage(3);
          return;
        }
      }
    }

    // ==========================================
    // STAGE 3: 海底篇 UPDATE
    // ==========================================
    if (this.stage === 3) {
      const swimSpd = 2.6;
      if (this.keys.left) { this.player.vx = -swimSpd; this.player.facing = 'left'; }
      if (this.keys.right) { this.player.vx = swimSpd; this.player.facing = 'right'; }
      if (this.keys.up) { this.player.vy = -swimSpd; }
      if (this.keys.down) { this.player.vy = swimSpd; }

      // Subsea Drag & Inertia
      this.player.vx *= 0.93;
      this.player.vy *= 0.93;

      this.player.x += this.player.vx;
      this.player.y += this.player.vy;

      if (Math.abs(this.player.vx) > 0.2 || Math.abs(this.player.vy) > 0.2) {
        this.player.walkFrame++;
      }

      // Oxygen Depletion (O2 gauge)
      this.player.oxygen -= 0.055;
      if (this.player.oxygen <= 0) {
        this.player.oxygen = 45;
        this.player.hp--;
        retroAudio.playHit();
        if (this.player.hp <= 0) {
          this.triggerGameOver();
          return;
        }
      }

      // Ambient underwater bubbles
      if (Math.random() < 0.12) {
        this.particles.push({
          x: this.player.x + (Math.random() - 0.5) * 10,
          y: this.player.y + 8,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -1.2 - Math.random() * 1.2,
          color: 'rgba(207, 250, 254, 0.75)',
          size: 2.5 + Math.random() * 2,
          life: 45,
          maxLife: 45,
        });
      }

      // Screen boundaries
      this.player.x = Math.max(18, Math.min(this.canvas.width - 18, this.player.x));
      this.player.y = Math.max(52, Math.min(this.canvas.height - 24, this.player.y));

      // Check if Boss is destroyed & all friends rescued
      const bossAlive = this.enemies.some(e => e.type === 'boss');
      const allFriendsSaved = this.friends.every(f => f.rescued);

      if (this.goal) {
        this.goal.unlocked = !bossAlive && allFriendsSaved;
        if (this.goal.unlocked && this.rectOverlap(
          this.player.x - 12, this.player.y - 12, 24, 24,
          this.goal.x, this.goal.y, this.goal.w, this.goal.h
        )) {
          this.triggerVictory();
          return;
        }
      }
    }

    // ==========================================
    // BULLETS UPDATE & BLOCK INTERACTION
    // ==========================================
    for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = this.bullets[bIdx];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      let removed = false;

      // Hit Screen Edge
      if (b.life <= 0 || b.x < 0 || b.x > this.canvas.width || b.y < 36 || b.y > this.canvas.height) {
        this.bullets.splice(bIdx, 1);
        continue;
      }

      // Doraemon Bullets destroy blocks
      if (!b.isEnemy) {
        for (let k = this.blocks.length - 1; k >= 0; k--) {
          const blk = this.blocks[k];
          if (this.circleRectCollide(b.x, b.y, b.radius, blk.x, blk.y, blk.w, blk.h)) {
            this.bullets.splice(bIdx, 1);
            removed = true;

            if (blk.destructible) {
              retroAudio.playExplosion();
              this.createBlockRubble(blk.x + blk.w / 2, blk.y + blk.h / 2, blk.type);
              this.addScore(150);

              // Spawn contained item if any
              if (blk.containsItem) {
                this.items.push({
                  id: this.itemIdCounter++,
                  x: blk.x + blk.w / 2,
                  y: blk.y + blk.h / 2,
                  type: blk.containsItem,
                  radius: 12,
                  bobOffset: Math.random() * 2,
                });
              }
              this.blocks.splice(k, 1);
            }
            break;
          }
        }
      }

      if (removed) continue;

      // Enemy projectile hitting player
      if (b.isEnemy) {
        const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
        if (dist < 14 && this.player.invincibleTimer === 0) {
          this.bullets.splice(bIdx, 1);
          this.playerHit(1);
        }
      }
    }

    // ==========================================
    // ENEMIES UPDATE & COMBAT
    // ==========================================
    for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
      const e = this.enemies[eIdx];

      // Bat motion (wave swooping)
      if (e.type === 'bat') {
        e.x += e.vx;
        e.y = (e.baseY || 130) + Math.sin(Date.now() * 0.005 + e.id) * 22;
        if (e.x < 40 || e.x > this.canvas.width - 40) e.vx *= -1;
      } else if (e.type === 'golem') {
        // Golem patrol on platform
        e.x += e.vx;
        if (e.x < 190 || e.x > this.canvas.width - 30) e.vx *= -1;
      } else if (e.type === 'boss') {
        // Poseidon Flagship Boss AI
        e.y += e.vy;
        if (e.y < 120 || e.y > 330) e.vy *= -1;

        // Shoot laser rings
        e.shootTimer = (e.shootTimer || 0) + 1;
        if (e.shootTimer % 110 === 0) {
          retroAudio.playShoot();
          // Aim at Doraemon
          const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
          this.bullets.push({
            x: e.x - 32,
            y: e.y,
            vx: Math.cos(angle) * 4.2,
            vy: Math.sin(angle) * 4.2,
            life: 90,
            radius: 5,
            isEnemy: true,
          });
        }
      } else {
        // Standard wander & bounce
        e.x += e.vx;
        e.y += e.vy;
        if (e.x < 30 || e.x > this.canvas.width - 30) e.vx *= -1;
        if (e.y < 60 || e.y > this.canvas.height - 30) e.vy *= -1;
      }

      // Check player bullets hitting enemy
      for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
        const b = this.bullets[bIdx];
        if (b.isEnemy) continue;

        const hitDist = Math.hypot(b.x - e.x, b.y - e.y);
        if (hitDist < e.radius + b.radius) {
          this.bullets.splice(bIdx, 1);
          e.hp--;
          retroAudio.playHit();
          this.addScore(100);

          // Spark particle
          this.particles.push({
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            color: '#facc15',
            size: 4,
            life: 15,
            maxLife: 15,
          });

          if (e.hp <= 0) {
            retroAudio.playExplosion();
            this.createExplosionParticles(e.x, e.y, e.type === 'boss' ? '#ef4444' : '#a855f7');
            this.addScore(e.type === 'boss' ? 5000 : 400);

            // Boss defeated drops 2 Dorayaki feasts
            if (e.type === 'boss') {
              this.items.push({ id: this.itemIdCounter++, x: e.x - 20, y: e.y, type: 'dorayaki', radius: 12, bobOffset: 0 });
              this.items.push({ id: this.itemIdCounter++, x: e.x + 20, y: e.y, type: 'dorayaki', radius: 12, bobOffset: 1 });
            }

            this.enemies.splice(eIdx, 1);
            break;
          }
        }
      }

      // Enemy touching Doraemon
      const contactDist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
      if (contactDist < e.radius + 12 && this.player.invincibleTimer === 0) {
        this.playerHit(e.type === 'boss' ? 2 : 1);
      }
    }

    // ==========================================
    // ITEMS PICKUP (Dorayaki, Hopter, Oxygen, Friends)
    // ==========================================
    for (let iIdx = this.items.length - 1; iIdx >= 0; iIdx--) {
      const it = this.items[iIdx];
      const dist = Math.hypot(this.player.x - it.x, this.player.y - it.y);

      if (dist < it.radius + 14) {
        if (it.type === 'dorayaki') {
          retroAudio.playItem();
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
          this.addScore(500);
        } else if (it.type === 'hopter') {
          retroAudio.playPowerup();
          this.player.hasHopter = true;
          this.player.hopterTimer = 600; // 10 seconds of flight!
          this.addScore(800);
        } else if (it.type === 'oxygen') {
          retroAudio.playItem();
          this.player.oxygen = Math.min(100, this.player.oxygen + 50);
          this.addScore(300);
        } else if (it.type === '1up') {
          retroAudio.playPowerup();
          this.player.maxHp = Math.min(6, this.player.maxHp + 1);
          this.player.hp = this.player.maxHp;
          this.addScore(1000);
        } else if (it.type === 'friend' && it.name) {
          retroAudio.playFriendSaved();
          const target = this.friends.find(f => f.name === it.name);
          if (target) {
            target.rescued = true;
            this.callbacks.onFriendRescued(target);
            this.currentDialog = {
              title: `拯救【${target.character}】！`,
              text: target.dialog,
              color: target.color,
            };
            this.dialogTimer = 180; // 3 seconds
          }
          this.addScore(2500);
        }

        // Particle sparkle on pickup
        this.particles.push({
          x: it.x,
          y: it.y,
          vx: 0,
          vy: -1.2,
          color: '#facc15',
          size: 5,
          life: 20,
          maxLife: 20,
        });

        this.items.splice(iIdx, 1);
      }
    }

    // ==========================================
    // PARTICLES UPDATE
    // ==========================================
    for (let pIdx = this.particles.length - 1; pIdx >= 0; pIdx--) {
      const pt = this.particles[pIdx];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) {
        this.particles.splice(pIdx, 1);
      }
    }
  }

  // --- DAMAGE & GAMEOVER ---
  private playerHit(damage: number) {
    retroAudio.playHit();
    this.player.hp -= damage;
    this.player.invincibleTimer = 55; // invincibility frame
    if (this.player.hp <= 0) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver() {
    this.state = 'GAMEOVER';
    this.callbacks.onStateChange(this.state, this.stage);
    retroAudio.playGameOver();
  }

  private triggerVictory() {
    this.state = 'VICTORY';
    this.callbacks.onStateChange(this.state, this.stage);
    retroAudio.playVictory();
  }

  private addScore(amount: number) {
    this.score += amount;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('doraemon1986_high_score', String(this.highScore));
    }
    this.callbacks.onScoreUpdate(this.score);
  }

  private createExplosionParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 / 14) * i;
      const spd = 1.5 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: 3 + Math.random() * 3,
        life: 30,
        maxLife: 30,
      });
    }
  }

  private createBlockRubble(x: number, y: number, type: string) {
    const col = type === 'rock' ? '#65a30d' : '#92400e';
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        color: col,
        size: 3,
        life: 25,
        maxLife: 25,
      });
    }
  }

  // --- RENDERING ---
  private render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const time = Date.now();

    this.ctx.clearRect(0, 0, w, h);

    // TITLE SCREEN
    if (this.state === 'TITLE') {
      this.renderTitleScreen(w, h, time);
      return;
    }

    // STAGE TRANSITION SCREEN
    if (this.state === 'STAGE_TRANSITION') {
      this.renderStageTransition(w, h);
      return;
    }

    // STAGE BACKGROUNDS
    if (this.stage === 1) {
      // Grassland (開拓大地)
      this.ctx.fillStyle = '#4d7c0f';
      this.ctx.fillRect(0, 36, w, h - 36);

      // Grass tile dots
      this.ctx.fillStyle = '#365314';
      for (let gx = 30; gx < w; gx += 70) {
        for (let gy = 60; gy < h; gy += 60) {
          this.ctx.fillRect(gx, gy, 8, 4);
          this.ctx.fillRect(gx + 12, gy + 4, 6, 4);
        }
      }
    } else if (this.stage === 2) {
      // Ancient Ruins Sky (魔境天際與神秘遺跡)
      const grad = this.ctx.createLinearGradient(0, 36, 0, h);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 36, w, h - 36);

      // Distant stars / temple silhouettes
      this.ctx.fillStyle = '#fde047';
      for (let s = 20; s < w; s += 85) {
        this.ctx.fillRect(s, 60 + ((s * 13) % 80), 2, 2);
      }
    } else if (this.stage === 3) {
      // Atlantis Deep Ocean (海底神殿海溝)
      const oceanGrad = this.ctx.createLinearGradient(0, 36, 0, h);
      oceanGrad.addColorStop(0, '#0369a1');
      oceanGrad.addColorStop(0.7, '#075985');
      oceanGrad.addColorStop(1, '#082f49');
      this.ctx.fillStyle = oceanGrad;
      this.ctx.fillRect(0, 36, w, h - 36);

      // Deep sea light rays
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let r = 0; r < 4; r++) {
        this.ctx.beginPath();
        this.ctx.moveTo(80 + r * 120, 36);
        this.ctx.lineTo(130 + r * 120, 36);
        this.ctx.lineTo(190 + r * 120, h);
        this.ctx.lineTo(100 + r * 120, h);
        this.ctx.fill();
      }
    }

    // DRAW PLATFORMS
    if (this.platforms.length > 0) {
      GameRenderer.drawPlatforms(this.ctx, this.platforms);
    }

    // DRAW BLOCKS
    for (const blk of this.blocks) {
      GameRenderer.drawBlock(this.ctx, blk);
    }

    // DRAW GOAL / GATES
    if (this.goal) {
      GameRenderer.drawGoal(this.ctx, this.goal, this.stage, time);
    }

    // DRAW ITEMS
    for (const it of this.items) {
      GameRenderer.drawItem(this.ctx, it, time);
    }

    // DRAW ENEMIES
    for (const enemy of this.enemies) {
      GameRenderer.drawEnemy(this.ctx, enemy, time);
    }

    // DRAW PARTICLES
    GameRenderer.drawParticles(this.ctx, this.particles);

    // DRAW BULLETS
    GameRenderer.drawBullets(this.ctx, this.bullets, time);

    // DRAW DORAEMON
    GameRenderer.drawDoraemon(this.ctx, this.player, time);

    // DRAW HUD
    GameRenderer.drawHUD(this.ctx, this.player, this.score, this.stage, w, this.friends);

    // RESCUE DIALOG POPUP
    if (this.currentDialog) {
      this.renderRescueDialog(w, h);
    }

    // GAMEOVER / VICTORY OVERLAYS
    if (this.state === 'GAMEOVER') {
      this.renderGameOver(w, h);
    } else if (this.state === 'VICTORY') {
      this.renderVictory(w, h, time);
    }
  }

  private renderTitleScreen(w: number, h: number, time: number) {
    // Classic 1986 Deep Blue FC Background
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, w, h);

    // Red Top / Bottom FC Cartridge Bands
    this.ctx.fillStyle = '#991b1b';
    this.ctx.fillRect(0, 0, w, 18);
    this.ctx.fillRect(0, h - 18, w, 18);

    // Title Logo
    this.ctx.fillStyle = '#ef4444';
    this.ctx.font = "bold 32px 'Press Start 2P', monospace, sans-serif";
    this.ctx.textAlign = 'center';
    this.ctx.fillText('★ 哆啦A夢 ★', w / 2, 115);

    // Japanese subtitle
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = "14px 'DotGothic16', monospace, sans-serif";
    this.ctx.fillText('HUDSON SOFT 1986 FC 百萬經典神作重現', w / 2, 155);

    // 3 Chapter banners
    this.ctx.fillStyle = '#fde047';
    this.ctx.font = "12px 'Press Start 2P', monospace, sans-serif";
    this.ctx.fillText('1:開拓篇  2:魔境篇  3:海底篇', w / 2, 195);

    // Doraemon Centered
    GameRenderer.drawDoraemon(this.ctx, {
      ...this.player,
      x: w / 2,
      y: 260,
      facing: 'right',
      invincibleTimer: 0,
      hasHopter: true,
      hopterTimer: 999,
      vx: 0,
      vy: 0,
    }, time);

    // Blinking Press Start
    if (Math.floor(time / 450) % 2 === 0) {
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.font = "bold 15px 'Press Start 2P', monospace, sans-serif";
      this.ctx.fillText('按 [START] 或 [空白鍵] 開始', w / 2, 345);
    }

    // High score
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.font = "11px 'Press Start 2P', monospace, sans-serif";
    this.ctx.fillText(`TOP SCORE: ${String(this.highScore).padStart(6, '0')}`, w / 2, 390);

    // Copyright
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = "10px monospace";
    this.ctx.fillText('FUJIKO-PRO / HUDSON SOFT 1986 HOMAGE', w / 2, 420);
  }

  private renderStageTransition(w: number, h: number) {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, w, h);

    const titles = [
      '',
      'STAGE 1 : 開拓篇\n尋找任意門 (AIR CANNON)',
      'STAGE 2 : 魔境篇\n巨神像神殿 (PLATFORM JUMP)',
      'STAGE 3 : 海底篇\n深海拯救夥伴與打倒 BOSS'
    ];

    this.ctx.fillStyle = '#facc15';
    this.ctx.font = "bold 18px 'Press Start 2P', monospace, sans-serif";
    this.ctx.textAlign = 'center';

    const lines = (titles[this.stage] || '').split('\n');
    lines.forEach((line, idx) => {
      this.ctx.fillText(line, w / 2, h / 2 - 20 + idx * 36);
    });
  }

  private renderRescueDialog(w: number, _h: number) {
    if (!this.currentDialog) return;

    this.ctx.save();
    const dw = 400;
    const dh = 65;
    const dx = (w - dw) / 2;
    const dy = 50;

    // Classic FC Dialog Box (Black bg, white border)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(dx, dy, dw, dh);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(dx, dy, dw, dh);

    // Title
    this.ctx.fillStyle = this.currentDialog.color;
    this.ctx.font = "bold 13px 'DotGothic16', monospace, sans-serif";
    this.ctx.textAlign = 'left';
    this.ctx.fillText(this.currentDialog.title, dx + 12, dy + 22);

    // Body
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = "12px 'DotGothic16', monospace, sans-serif";
    this.ctx.fillText(this.currentDialog.text, dx + 12, dy + 45);

    this.ctx.restore();
  }

  private renderGameOver(w: number, h: number) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.fillStyle = '#ef4444';
    this.ctx.font = "bold 34px 'Press Start 2P', monospace, sans-serif";
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', w / 2, 190);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = "14px 'DotGothic16', monospace, sans-serif";
    this.ctx.fillText('哆啦A夢的體力耗盡了！', w / 2, 235);
    this.ctx.fillText(`最終得分: ${this.score}`, w / 2, 265);

    this.ctx.fillStyle = '#38bdf8';
    this.ctx.font = "13px 'Press Start 2P', monospace, sans-serif";
    this.ctx.fillText('按 [START] 或 [空白鍵] 重試', w / 2, 320);
  }

  private renderVictory(w: number, h: number, time: number) {
    // Cosmic victory celebration
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    this.ctx.fillRect(0, 0, w, h);

    // Victory Title
    this.ctx.fillStyle = '#facc15';
    this.ctx.font = "bold 22px 'Press Start 2P', monospace, sans-serif";
    this.ctx.textAlign = 'center';
    this.ctx.fillText('★ ALL STAGES CLEAR! ★', w / 2, 110);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = "15px 'DotGothic16', monospace, sans-serif";
    this.ctx.fillText('恭喜！你成功拯救了所有的好朋友！', w / 2, 150);

    // Fireworks particles
    const fireworksColors = ['#f43f5e', '#38bdf8', '#facc15', '#a855f7', '#4ade80'];
    for (let f = 0; f < 5; f++) {
      const fx = 80 + f * 90;
      const fy = 60 + Math.sin(time * 0.005 + f) * 15;
      this.ctx.fillStyle = fireworksColors[f];
      this.ctx.beginPath();
      this.ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw Doraemon and all 4 Friends standing together in line!
    const characters = [
      { name: '大雄', x: w / 2 - 110, y: 240 },
      { name: '靜香', x: w / 2 - 55, y: 240 },
      { name: '哆啦A夢', x: w / 2, y: 240 },
      { name: '小夫', x: w / 2 + 55, y: 240 },
      { name: '胖虎', x: w / 2 + 110, y: 240 },
    ];

    characters.forEach((c) => {
      if (c.name === '哆啦A夢') {
        GameRenderer.drawDoraemon(this.ctx, {
          ...this.player,
          x: c.x,
          y: c.y,
          facing: 'right',
          invincibleTimer: 0,
          hasHopter: true,
          hopterTimer: 999,
          vx: 0,
          vy: 0,
        }, time);
      } else {
        GameRenderer.drawFriendAvatar(this.ctx, c.name, c.x, c.y);
      }

      this.ctx.fillStyle = '#fde047';
      this.ctx.font = "11px 'DotGothic16', monospace, sans-serif";
      this.ctx.textAlign = 'center';
      this.ctx.fillText(c.name, c.x, c.y + 22);
    });

    // Score Board
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = "bold 15px 'Press Start 2P', monospace, sans-serif";
    this.ctx.fillText(`TOTAL SCORE: ${String(this.score).padStart(6, '0')}`, w / 2, 330);

    // Rating Rank
    const rank = this.score > 12000 ? 'S級 超時空神隊友' : (this.score > 8000 ? 'A級 冒險王' : 'B級 勇者');
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.font = "14px 'DotGothic16', monospace, sans-serif";
    this.ctx.fillText(`評級: ${rank}`, w / 2, 365);

    this.ctx.fillStyle = '#4ade80';
    this.ctx.font = "12px 'Press Start 2P', monospace, sans-serif";
    if (Math.floor(time / 400) % 2 === 0) {
      this.ctx.fillText('按 [START] 或 [空白鍵] 再玩一次', w / 2, 410);
    }
  }

  // --- COLLISION UTILITIES ---
  private circleRectCollide(
    cx: number, cy: number, cr: number,
    rx: number, ry: number, rw: number, rh: number
  ): boolean {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (cr * cr);
  }

  private rectOverlap(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }
}
