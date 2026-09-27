import { Player, Bullet, Enemy, Item, Block, Platform, Particle, Goal, FriendRescueInfo } from './types';

export class GameRenderer {
  // Draw Doraemon with detailed 8-bit FC aesthetics
  public static drawDoraemon(
    ctx: CanvasRenderingContext2D,
    player: Player,
    time: number
  ) {
    // Invincibility flashing
    if (player.invincibleTimer > 0 && Math.floor(time / 70) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    const isHopter = player.hasHopter && player.hopterTimer > 0;
    // Hopter hover bob
    if (isHopter) {
      ctx.translate(0, Math.sin(time * 0.01) * 3);
    }

    // Direction flip
    if (player.facing === 'left') {
      ctx.scale(-1, 1);
    }

    const walkOffset = (player.vx !== 0 || player.vy !== 0) 
      ? Math.sin(player.walkFrame * 0.3) * 2 
      : 0;

    // --- Take-copter on top of head if active ---
    if (isHopter) {
      ctx.fillStyle = '#facc15'; // Yellow
      // Shaft
      ctx.fillRect(-1.5, -23, 3, 7);
      // Spinning blades
      const bladeW = Math.abs(Math.sin(time * 0.03)) * 14 + 3;
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-bladeW, -25, bladeW * 2, 3);
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, -23.5, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Feet (White) ---
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // Left foot
    ctx.beginPath();
    ctx.roundRect(-10, 14 + walkOffset, 9, 6, [3]);
    ctx.fill();
    ctx.stroke();

    // Right foot
    ctx.beginPath();
    ctx.roundRect(1, 14 - walkOffset, 9, 6, [3]);
    ctx.fill();
    ctx.stroke();

    // --- Red Tail ---
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(-11, 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // --- Body (Doraemon Blue) ---
    ctx.fillStyle = '#0284c7'; // Classic Cyan-Blue
    ctx.beginPath();
    ctx.roundRect(-11, 2, 22, 14, [4]);
    ctx.fill();
    ctx.stroke();

    // --- Head (Blue) ---
    ctx.beginPath();
    ctx.arc(0, -7, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // --- Face (White Oval) ---
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(3, -6, 11, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- Eyes (White + Black pupils) ---
    // Left eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(1, -12, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right eye
    ctx.beginPath();
    ctx.ellipse(6, -12, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils (looking forward/right)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(2.5, -12, 1.5, 0, Math.PI * 2);
    ctx.arc(7.5, -12, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // --- Nose (Red) ---
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(5, -7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Nose highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, -8.5, 1.5, 1.5);

    // --- Whiskers & Mouth line ---
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    // Center vertical groove
    ctx.beginPath();
    ctx.moveTo(5, -4);
    ctx.lineTo(5, 0);
    // Smiling mouth arc
    ctx.arc(4, -1, 4.5, 0.1 * Math.PI, 0.8 * Math.PI);
    // 3 Whiskers on right
    ctx.moveTo(6, -6);
    ctx.lineTo(13, -8);
    ctx.moveTo(7, -4);
    ctx.lineTo(14, -4);
    ctx.moveTo(6, -2);
    ctx.lineTo(13, 0);
    // 2 Whiskers on left
    ctx.moveTo(-1, -6);
    ctx.lineTo(-6, -7);
    ctx.moveTo(-1, -3);
    ctx.lineTo(-6, -3);
    ctx.stroke();

    // --- Red Collar ---
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-10, 1, 20, 3.5);
    ctx.strokeRect(-10, 1, 20, 3.5);

    // --- Yellow Bell (鈴鐺) ---
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(2, 4.5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0.5, 4, 3, 0.8);
    ctx.beginPath();
    ctx.arc(2, 5.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // --- White Belly & 4D Pocket (四次元口袋) ---
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(1, 8, 7.5, 0, Math.PI * 2);
    ctx.fill();
    // Pocket outline
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(1, 7.5, 5.5, 0, Math.PI);
    ctx.lineTo(-4.5, 7.5);
    ctx.stroke();

    // --- Hands (Round white fists / Air Cannon) ---
    // Left hand
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-9, 7 - walkOffset, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right hand (Air Cannon)
    ctx.beginPath();
    ctx.arc(11, 8 + walkOffset, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Air cannon muzzle ring
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(13, 6 + walkOffset, 2.5, 4);

    ctx.restore();
  }

  // Draw Air Cannon Sonic Blast Bullets
  public static drawBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[], time: number) {
    bullets.forEach((b) => {
      ctx.save();
      ctx.translate(b.x, b.y);

      if (b.isEnemy) {
        // Red/Purple enemy projectile
        ctx.fillStyle = Math.floor(time / 60) % 2 === 0 ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Doraemon Air Cannon: Concentric sonic shockwave rings
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // Draw Items (Dorayaki, Hopter, Oxygen Tank, Rescue Friends)
  public static drawItem(ctx: CanvasRenderingContext2D, item: Item, time: number) {
    ctx.save();
    const bob = Math.sin(time * 0.006 + item.bobOffset) * 3;
    ctx.translate(item.x, item.y + bob);

    if (item.type === 'dorayaki') {
      // Dorayaki (どら焼き)
      // Top pancake
      ctx.fillStyle = '#b45309'; // Golden brown
      ctx.beginPath();
      ctx.ellipse(0, -2, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Red bean filling
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-9, -1, 18, 3.5);
      // Bottom pancake
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(0, 2, 11, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Sparkle
      if (Math.floor(time / 200) % 2 === 0) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(4, -6, 2.5, 2.5);
      }
    } else if (item.type === 'hopter') {
      // Take-copter pickup
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-2, -3, 4, 10);
      const bladeW = Math.abs(Math.sin(time * 0.015)) * 13 + 4;
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-bladeW, -5, bladeW * 2, 3.5);
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1;
      ctx.strokeRect(-bladeW, -5, bladeW * 2, 3.5);
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, -3.5, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'oxygen') {
      // Oxygen tank (O2)
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.roundRect(-7, -10, 14, 20, [4]);
      ctx.fill();
      ctx.strokeStyle = '#cffafe';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Valve cap
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-4, -13, 8, 3.5);

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('O₂', 0, 4);
    } else if (item.type === 'friend') {
      // Friend trapped inside underwater bubble shield / capsule
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fill();

      // Friend Avatar Inside
      this.drawFriendAvatar(ctx, item.name || '大雄', 0, 2);

      // Floating call sign
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(item.name || '夥伴', 0, -18);
    } else if (item.type === '1up') {
      // Mini Doraemon 1UP
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(2, 1, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(4, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, -3, 2, 2);
    }

    ctx.restore();
  }

  // Draw 8-bit Friend Avatars (Nobita, Shizuka, Suneo, Gian)
  public static drawFriendAvatar(ctx: CanvasRenderingContext2D, name: string, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    if (name === '大雄') {
      // Nobita: Black hair, glasses, yellow shirt
      ctx.fillStyle = '#fde047'; // Yellow shirt
      ctx.fillRect(-5, 4, 10, 8);
      // Skin
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -2, 7, 0, Math.PI * 2);
      ctx.fill();
      // Black Hair
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, -5, 7.5, Math.PI, 0);
      ctx.fill();
      // Glasses (round circles)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-2.5, -2, 2.8, 0, Math.PI * 2);
      ctx.arc(2.5, -2, 2.8, 0, Math.PI * 2);
      ctx.stroke();
    } else if (name === '靜香') {
      // Shizuka: Pink dress, brown pigtails
      ctx.fillStyle = '#f472b6'; // Pink dress
      ctx.fillRect(-5, 4, 10, 8);
      // Skin
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -2, 7, 0, Math.PI * 2);
      ctx.fill();
      // Brown hair & Pigtails
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, -4, 7.5, Math.PI, 0);
      ctx.fill();
      // Left/Right pigtails
      ctx.fillRect(-8, -2, 2.5, 6);
      ctx.fillRect(5.5, -2, 2.5, 6);
    } else if (name === '小夫') {
      // Suneo: Blue shirt, fox face / sharp hair
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-5, 4, 10, 8);
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(-1, -2, 7, 0, Math.PI * 2);
      ctx.fill();
      // Spiky black hair pointing forward
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(-7, -4);
      ctx.lineTo(8, -7);
      ctx.lineTo(3, 0);
      ctx.fill();
    } else if (name === '胖虎') {
      // Gian: Orange shirt with dark stripe, stout head
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-7, 3, 14, 10);
      ctx.fillStyle = '#431407';
      ctx.fillRect(-7, 6, 14, 2.5); // stripe
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -3, 8.5, 0, Math.PI * 2);
      ctx.fill();
      // Black crop hair
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-7, -10, 14, 5);
    }

    ctx.restore();
  }

  // Draw Enemies with authentic 1986 FC sprites
  public static drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    if (enemy.type === 'alien') {
      // Cosmo Bug / Alien (Stage 1)
      const flash = Math.floor(time / 150) % 2 === 0;
      ctx.fillStyle = flash ? '#9333ea' : '#7e22ce';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d8b4fe';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glowing Eyes
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-6, -4, 4, 4);
      ctx.fillRect(2, -4, 4, 4);

      // Antennae
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -12);
      ctx.lineTo(-8, -17);
      ctx.moveTo(4, -12);
      ctx.lineTo(8, -17);
      ctx.stroke();
    } else if (enemy.type === 'crawler') {
      // Fast mechanical patrol bug
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(-10, -7, 20, 14, [4]);
      ctx.fill();
      // Legs
      const legW = Math.sin(time * 0.02) * 3;
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, 7);
      ctx.lineTo(-10 + legW, 12);
      ctx.moveTo(7, 7);
      ctx.lineTo(10 - legW, 12);
      ctx.stroke();
    } else if (enemy.type === 'bat') {
      // Swooping Cave Bat (Stage 2)
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Flapping wings
      const wingY = Math.sin(time * 0.015) * 8;
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(-18, wingY);
      ctx.lineTo(-9, 5);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(18, wingY);
      ctx.lineTo(9, 5);
      ctx.fill();

      // Red eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-3, -2, 2, 2);
      ctx.fillRect(1, -2, 2, 2);
    } else if (enemy.type === 'golem') {
      // Heavy Stone Golem (Stage 2)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-13, -15, 26, 30, [4]);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Stone cracks
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(3, -2);
      ctx.lineTo(-2, 8);
      ctx.stroke();

      // Glowing menacing eye
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-4, -6, 8, 4);
    } else if (enemy.type === 'jellyfish') {
      // Deep sea electric jellyfish (Stage 3)
      ctx.fillStyle = 'rgba(236, 72, 153, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -4, 12, Math.PI, 0);
      ctx.lineTo(12, 2);
      ctx.lineTo(-12, 2);
      ctx.fill();

      // Trailing tentacles
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.5;
      for (let k = -8; k <= 8; k += 4) {
        const wave = Math.sin(time * 0.01 + k) * 3;
        ctx.beginPath();
        ctx.moveTo(k, 2);
        ctx.lineTo(k + wave, 14);
        ctx.stroke();
      }
    } else if (enemy.type === 'shark') {
      // Subsea robotic shark
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(16, -6);
      ctx.lineTo(16, 6);
      ctx.fill();
      // Dorsal fin
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(6, -14);
      ctx.lineTo(8, -6);
      ctx.fill();
      // Glowing red sensor
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-10, -2, 3, 3);
    } else if (enemy.type === 'boss') {
      // Poseidon Flagship Battle Core (Stage 3 Final Boss)
      const flash = enemy.hp < enemy.maxHp * 0.3 && Math.floor(time / 100) % 2 === 0;

      // Outer hull armor
      ctx.fillStyle = flash ? '#dc2626' : '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Armor plating facets
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      // Rotating energy cannons
      for (let a = 0; a < 4; a++) {
        const angle = (time * 0.002) + (a * Math.PI / 2);
        const cx = Math.cos(angle) * 34;
        const cy = Math.sin(angle) * 34;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central glowing core (Eye of Poseidon)
      const coreHue = Math.floor(time / 80) % 2 === 0 ? '#ef4444' : '#f97316';
      ctx.fillStyle = coreHue;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Boss HP Bar above boss
      const barW = 70;
      const barH = 7;
      ctx.fillStyle = '#000000';
      ctx.fillRect(-barW / 2 - 1, -50, barW + 2, barH + 2);
      ctx.fillStyle = '#ef4444';
      const pct = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillRect(-barW / 2, -49, barW * pct, barH);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barW / 2 - 1, -50, barW + 2, barH + 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`POSEIDON CORE: ${enemy.hp}/${enemy.maxHp}`, 0, -54);
    }

    ctx.restore();
  }

  // Draw Dokodemo Door / Goal Gates
  public static drawGoal(ctx: CanvasRenderingContext2D, goal: Goal, stage: number, time: number) {
    ctx.save();
    ctx.translate(goal.x, goal.y);

    if (stage === 1) {
      // Dokodemo Door (どこでもドア / Anywhere Door)
      // Pink Frame
      ctx.fillStyle = '#ec4899'; // Vibrant Doraemon Pink
      ctx.fillRect(0, 0, goal.w, goal.h);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, goal.w, goal.h);

      // Inner panel
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(4, 4, goal.w - 8, goal.h - 8);

      // Door panels relief
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(7, 7, goal.w - 14, (goal.h - 18) / 2);
      ctx.strokeRect(7, 10 + (goal.h - 18) / 2, goal.w - 14, (goal.h - 18) / 2);

      // Golden doorknob
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(8, goal.h / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shining aura
      if (Math.floor(time / 250) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(goal.w - 10, 8, 3, 3);
      }
    } else if (stage === 2) {
      // Golden Giant God Ruins Gate (巨神像神殿入口)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, goal.w, goal.h);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, goal.w, goal.h);

      // Sun emblem / mystic portal inside
      const glow = Math.sin(time * 0.008) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(250, 204, 21, ${glow})`;
      ctx.beginPath();
      ctx.arc(goal.w / 2, goal.h / 2, 12, 0, Math.PI * 2);
      ctx.fill();
    } else if (stage === 3) {
      // Dimensional Warp Exit Gate
      ctx.strokeStyle = goal.unlocked ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, goal.w, goal.h);

      if (goal.unlocked) {
        // Swirling vortex
        const grad = ctx.createRadialGradient(
          goal.w / 2, goal.h / 2, 2,
          goal.w / 2, goal.h / 2, 22
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#38bdf8');
        grad.addColorStop(1, '#0284c7');
        ctx.fillStyle = grad;
        ctx.fillRect(2, 2, goal.w - 4, goal.h - 4);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 2, goal.w - 4, goal.h - 4);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LOCKED', goal.w / 2, goal.h / 2 + 3);
      }
    }

    // Label tag above goal
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(goal.label, goal.w / 2, -6);

    ctx.restore();
  }

  // Draw Environment Blocks (Destructible rocks, ancient bricks, corals)
  public static drawBlock(ctx: CanvasRenderingContext2D, block: Block) {
    ctx.save();
    if (block.type === 'rock') {
      // Stage 1 Pioneer Rock
      ctx.fillStyle = '#3f6212';
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.strokeStyle = '#1a2e05';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(block.x, block.y, block.w, block.h);

      // Texture mark
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(block.x + 3, block.y + 3, 6, 6);
    } else if (block.type === 'ruins') {
      // Stage 2 Ancient Stone Brick
      ctx.fillStyle = '#78350f';
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(block.x, block.y, block.w, block.h);

      ctx.fillStyle = '#92400e';
      ctx.fillRect(block.x + 2, block.y + 2, block.w - 4, 3);
    } else if (block.type === 'coral') {
      // Stage 3 Sea Coral Reef
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(block.x, block.y, block.w, block.h);
    } else {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(block.x, block.y, block.w, block.h);
    }
    ctx.restore();
  }

  // Draw Stage 2 Floating Platforms
  public static drawPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[]) {
    platforms.forEach((p) => {
      ctx.save();
      // Stone platform body
      ctx.fillStyle = '#573315';
      ctx.fillRect(p.x, p.y, p.w, p.h);

      // Mossy grass surface
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(p.x, p.y, p.w, 4);

      // Edge border
      ctx.strokeStyle = '#38200d';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x, p.y, p.w, p.h);

      // Stone lines
      ctx.strokeStyle = '#7c4a22';
      ctx.lineWidth = 1;
      for (let sx = p.x + 16; sx < p.x + p.w; sx += 18) {
        ctx.beginPath();
        ctx.moveTo(sx, p.y + 5);
        ctx.lineTo(sx, p.y + p.h - 2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // Draw Particles (Dust, Bubbles, Explosions)
  public static drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    particles.forEach((pt) => {
      ctx.save();
      const alpha = pt.life / pt.maxLife;
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // Draw Classic FC HUD Bar
  public static drawHUD(
    ctx: CanvasRenderingContext2D,
    player: Player,
    score: number,
    stage: number,
    canvasW: number,
    friends: FriendRescueInfo[]
  ) {
    ctx.save();
    // Top Black Band
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasW, 36);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.lineTo(canvasW, 36);
    ctx.stroke();

    // 1UP & SCORE
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 13px 'Press Start 2P', monospace, sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText('1UP', 12, 16);
    ctx.fillStyle = '#facc15';
    ctx.fillText(String(score).padStart(6, '0'), 12, 30);

    // STAGE TITLE
    const titles = ['', 'STAGE 1 開拓篇', 'STAGE 2 魔境篇', 'STAGE 3 海底篇'];
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(titles[stage] || '', 190, 23);

    // HP HEARTS
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('HP', 290, 23);

    for (let h = 0; h < player.maxHp; h++) {
      if (h < player.hp) {
        ctx.fillStyle = '#ef4444'; // Red
      } else {
        ctx.fillStyle = '#475569'; // Grey
      }
      ctx.fillRect(320 + h * 13, 14, 10, 11);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(320 + h * 13, 14, 10, 11);
    }

    // Stage 3 Oxygen Tank Bar or Stage 1 Hopter Indicator
    if (stage === 3) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('O₂', 400, 23);

      const o2W = 65;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(432, 13, o2W, 12);

      const o2Pct = Math.max(0, player.oxygen / 100);
      ctx.fillStyle = o2Pct < 0.25 ? '#ef4444' : '#06b6d4';
      ctx.fillRect(432, 13, o2W * o2Pct, 12);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(432, 13, o2W, 12);
    } else if (player.hasHopter && player.hopterTimer > 0) {
      ctx.fillStyle = '#facc15';
      ctx.fillText('COPTER', 400, 23);
      const hopterSec = Math.ceil(player.hopterTimer / 60);
      ctx.fillText(`${hopterSec}s`, 475, 23);
    } else {
      // Show saved friends icons if in later stages
      const savedCount = friends.filter(f => f.rescued).length;
      ctx.fillStyle = '#ec4899';
      ctx.fillText(`救援:${savedCount}/4`, 400, 23);
    }

    ctx.restore();
  }
}
