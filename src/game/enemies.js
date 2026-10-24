import { Entity } from './entities.js';
import { clamp } from '../core/math.js';
import { Projectile } from './projectiles.js';

export class Enemy extends Entity {
  constructor(x, y, type = 'grunt') {
    super(x, y, 16, 24);
    this.type = 'enemy';
    this.enemyType = type;
    this.facing = -1;
    this.hp = 1;
    this.maxHp = 1;
    this.damage = 1;
    this.speed = 70;
    this.chaseRange = 160;
    this.attackRange = 18;
    this.attackCooldown = 1.2;
    this.attackTimer = 0;
    this.hitFlash = 0;
    this.knockbackResist = 0.6;
    this.dead = false;
    this.patrolDir = -1;
    this.turnTimer = 0;
    this.avoidGaps = true;
    this.stunTimer = 0;
  }

  hurt(amount, dir) {
    this.hp -= amount;
    this.hitFlash = 0.12;
    this.vx += dir * 160 * (1 - this.knockbackResist);
    this.vy = -140;
    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  // Detecta si hay hueco delante para evitar caerse
  willFall(solids) {
    if (!this.onGround || !this.avoidGaps) return false;
    const lookAhead = 10;
    const footX = this.facing === 1 ? this.x + this.w + lookAhead : this.x - lookAhead;
    const footY = this.y + this.h + 2;
    // buscar plataforma justo debajo
    for (let i = 0; i < solids.length; i += 1) {
      const s = solids[i];
      if (footX + 2 > s.x && footX < s.x + s.w && footY < s.y + s.h && footY > s.y - 4) {
        return false;
      }
    }
    return true;
  }

  hasLineOfSight(target, solids) {
    const x1 = this.x + this.w / 2;
    const y1 = this.y + this.h / 2;
    const x2 = target.x + target.w / 2;
    const y2 = target.y + target.h / 2;
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 16);
    for (let i = 1; i < steps; i += 1) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      if (solids.some((solid) => px > solid.x && px < solid.x + solid.w && py > solid.y && py < solid.y + solid.h)) return false;
    }
    return true;
  }

  update(dt, solids, player) {
    if (this.dead) return;
    if (this.stunTimer > 0) { this.stunTimer -= dt; this.vx *= 0.85; this.step(dt, solids); return; }
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.attackTimer > 0) this.attackTimer -= dt;
    if (this.turnTimer > 0) this.turnTimer -= dt;

    const dx = player.x - this.x;
    const dist = Math.abs(dx);

    if (dist < this.chaseRange) {
      this.facing = dx > 0 ? 1 : -1;
      if (this.willFall(solids)) {
        this.vx = 0;
      } else if (dist > this.attackRange + 4) {
        this.vx = this.facing * this.speed;
      } else {
        this.vx *= 0.7;
      }
    } else {
      // patrulla
      if (this.turnTimer <= 0 && this.willFall(solids)) {
        this.facing *= -1;
        this.patrolDir = this.facing;
        this.turnTimer = 0.4;
      }
      this.vx = this.facing * (this.speed * 0.6);
    }

    this.step(dt, solids);
  }
}

export class Grunt extends Enemy {
  constructor(x, y) {
    super(x, y, 'grunt');
    this.hp = 2;
    this.maxHp = 2;
    this.speed = 92;
    this.damage = 1;
    this.w = 16;
    this.h = 24;
    this.attackRange = 18;
    this.chaseRange = 150;
    this.attackRange = 34;
    this.attackCooldownTimer = 0.35;
    this.windupTimer = 0;
  }

  update(dt, solids, player) {
    if (this.dead) return;
    if (this.stunTimer > 0) { this.stunTimer -= dt; this.attackTimer = 0; this.step(dt, solids); return; }
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - dt);

    const dx = player.x + player.w / 2 - (this.x + this.w / 2);
    const distance = Math.abs(dx);
    this.facing = dx >= 0 ? 1 : -1;
    if (this.windupTimer > 0) {
      this.windupTimer -= dt;
      this.vx = 0;
      if (this.windupTimer <= 0) {
        this.attackTimer = 0.26;
        this.attackCooldownTimer = 1.65;
        this.vx = this.facing * 275;
      }
    } else if (this.attackTimer > 0) {
      this.attackTimer = Math.max(0, this.attackTimer - dt);
      this.vx = this.facing * 275;
    } else if (this.attackCooldownTimer <= 0 && distance < 54 && this.onGround) {
      this.windupTimer = 0.54;
      this.vx = 0;
    } else if (distance < this.chaseRange && this.hasLineOfSight(player, solids)) {
      this.vx = distance > this.attackRange ? this.facing * this.speed : 0;
    } else if (this.onGround) {
      this.vx = this.facing * this.speed * 0.45;
    }
    this.step(dt, solids);
  }
}

export class Charger extends Enemy {
  constructor(x, y) {
    super(x, y, 'charger');
    this.hp = 3;
    this.maxHp = 3;
    this.speed = 155;
    this.chaseRange = 260;
    this.damage = 1;
    this.w = 18;
    this.h = 26;
    this.avoidGaps = true;
    this.chargeState = 'idle';
    this.chargeTimer = 0;
    this.windupTimer = 0;
    this.chargeCooldown = 0;
  }

  update(dt, solids, player) {
    if (this.dead) return;
    if (this.stunTimer > 0) { this.stunTimer -= dt; this.chargeState = 'idle'; this.attackTimer = 0; this.vx *= 0.85; this.step(dt, solids); return; }
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.chargeCooldown = Math.max(0, this.chargeCooldown - dt);

    const dx = player.x - this.x;
    const dist = Math.abs(dx);
    this.facing = dx >= 0 ? 1 : -1;
    if (this.chargeState === 'windup') {
      this.windupTimer -= dt;
      this.vx = 0;
      if (this.windupTimer <= 0) {
        this.chargeState = 'dash';
        this.chargeTimer = 0.4;
      }
    } else if (this.chargeState === 'dash') {
      this.chargeTimer -= dt;
      this.attackTimer = Math.max(0, this.chargeTimer);
      this.vx = this.facing * this.speed * 2.25;
      if (this.chargeTimer <= 0) {
        this.attackTimer = 0;
        this.chargeState = 'recover';
        this.chargeTimer = 0.68;
        this.chargeCooldown = 1.8;
      }
    } else if (this.chargeState === 'recover') {
      this.chargeTimer -= dt;
      this.attackTimer = 0;
      this.vx = 0;
      if (this.chargeTimer <= 0) this.chargeState = 'idle';
    } else if (dist < this.chaseRange && this.onGround && this.chargeCooldown <= 0) {
      this.chargeState = 'windup';
      this.windupTimer = 0.68;
      this.vx = 0;
    } else if (this.onGround) {
      this.vx = dist < this.chaseRange ? this.facing * this.speed * 0.72 : this.facing * 36;
    }
    this.step(dt, solids);
  }
}

export class Ranged extends Enemy {
  constructor(x, y) {
    super(x, y, 'ranged');
    this.hp = 2;
    this.maxHp = 2;
    this.speed = 68;
    this.chaseRange = 280;
    this.attackRange = 190;
    this.damage = 1;
    this.w = 16;
    this.h = 24;
    this.shootCooldown = 2.2;
    this.shootTimer = 1.1;
    this.windupTimer = 0;
    this.projectiles = [];
    this.preferredDistance = 155;
  }

  update(dt, solids, player, projectiles) {
    if (this.dead) return;
    if (this.stunTimer > 0) { this.stunTimer -= dt; this.step(dt, solids); return; }
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.shootTimer > 0) this.shootTimer -= dt;
    if (this.turnTimer > 0) this.turnTimer -= dt;

    const dx = player.x + player.w / 2 - (this.x + this.w / 2);
    const dist = Math.abs(dx);
    this.facing = dx > 0 ? 1 : -1;
    const clearShot = this.hasLineOfSight(player, solids);

    if (this.windupTimer > 0) {
      this.windupTimer -= dt;
      this.vx = 0;
      if (this.windupTimer <= 0) {
        this.windupTimer = 0;
        if (this.onGround && clearShot) this.shoot(player, projectiles);
        this.shootTimer = this.shootCooldown;
      }
    }

    if (this.windupTimer > 0) {
      this.vx = 0;
    } else if (dist < this.chaseRange) {
      if (dist < 105) {
        this.vx = -this.facing * this.speed * 0.85;
      } else if (dist > this.attackRange || !clearShot) {
        this.vx = this.willFall(solids) ? 0 : this.facing * this.speed;
      } else {
        this.vx = 0;
        if (this.shootTimer <= 0 && this.onGround && clearShot) this.windupTimer = 0.48;
      }
    } else {
      if (this.turnTimer <= 0 && this.willFall(solids)) {
        this.facing *= -1;
        this.turnTimer = 0.4;
      }
      this.vx = this.facing * (this.speed * 0.5);
    }

    this.step(dt, solids);
  }

  shoot(player, projectiles) {
    if (!projectiles) return;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const lead = 0.24;
    const dx = player.x + player.w / 2 + player.vx * lead - cx;
    const dy = player.y + player.h / 2 + player.vy * lead - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 350;
    const vx = (dx / len) * speed;
    const vy = (dy / len) * speed;
    projectiles.push(new Projectile(cx - 3, cy - 2, vx, vy, this.damage, 2.2));
  }
}

export class Flyer extends Enemy {
  constructor(x, y) {
    super(x, y, 'flyer');
    this.hp = 2;
    this.maxHp = 2;
    this.speed = 110;
    this.chaseRange = 320;
    this.damage = 1;
    this.w = 18;
    this.h = 16;
    this.gravity = 0;
    this.avoidGaps = false;
    this.hoverBase = y;
    this.t = Math.random() * Math.PI * 2;
    this.windupTimer = 0;
    this.diveCooldown = 0.7;
  }

  applyGravity(dt) {
    // sin gravedad
  }

  update(dt, solids, player) {
    if (this.dead) return;
    if (this.stunTimer > 0) { this.stunTimer -= dt; this.step(dt, solids); return; }
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.diveCooldown = Math.max(0, this.diveCooldown - dt);
    this.t += dt * 2.4;

    const dx = player.x + player.w / 2 - (this.x + this.w / 2);
    const dy = player.y + player.h / 2 - (this.y + this.h / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.facing = dx > 0 ? 1 : -1;

    if (this.windupTimer > 0) {
      this.windupTimer -= dt;
      this.vx *= 0.8;
      this.vy *= 0.8;
      if (this.windupTimer <= 0) {
        this.attackTimer = 0.58;
        this.diveCooldown = 1.75;
      }
    } else if (this.attackTimer > 0) {
      this.vx = clamp(dx * 3.2, -this.speed * 2.2, this.speed * 2.2);
      this.vy = clamp(dy * 3.1, -250, 250);
    } else if (dist < 205 && this.diveCooldown <= 0) {
      this.windupTimer = 0.36;
      this.vx = 0;
      this.vy = 0;
    } else if (dist < this.chaseRange) {
      const desiredX = player.x + player.w / 2 - this.facing * 28 - (this.x + this.w / 2);
      const desiredY = player.y - 8 - this.y;
      this.vx = clamp(desiredX * 2.1, -this.speed * 1.45, this.speed * 1.45) + Math.sin(this.t) * 12;
      this.vy = clamp(desiredY * 2.4, -135, 135) + Math.sin(this.t * 1.7) * 14;
    } else {
      this.vx = this.facing * (this.speed * 0.4);
      this.vy = Math.sin(this.t) * 30;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // mantener dentro de límites razonables con sólidos
    // evitar atravesar muros laterales simples
    for (let i = 0; i < solids.length; i += 1) {
      const s = solids[i];
      if (this.collidesWith(s)) {
        // empujar fuera
        if (this.vx > 0 && this.x + this.w > s.x && this.x < s.x) this.x = s.x - this.w;
        if (this.vx < 0 && this.x < s.x + s.w && this.x + this.w > s.x + s.w) this.x = s.x + s.w;
        if (this.vy > 0 && this.y + this.h > s.y && this.y < s.y) this.y = s.y - this.h;
        if (this.vy < 0 && this.y < s.y + s.h && this.y + this.h > s.y + s.h) this.y = s.y + s.h;
        this.vx *= -0.3;
        this.vy *= -0.3;
      }
    }
  }
}

export class Crawler extends Enemy {
  constructor(x, y) {
    super(x, y, 'crawler');
    this.hp = 2;
    this.maxHp = 2;
    this.speed = 52;
    this.chaseRange = 120;
    this.damage = 1;
    this.w = 20;
    this.h = 14;
    this.avoidGaps = true;
    this.attackCooldownTimer = 0.5;
    this.windupTimer = 0;
  }

  update(dt, solids, player) {
    if (this.dead) return;
    if (this.stunTimer > 0) { this.stunTimer -= dt; this.step(dt, solids); return; }
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - dt);
    if (this.turnTimer > 0) this.turnTimer -= dt;

    const dx = player.x - this.x;
    const dist = Math.abs(dx);
    if (this.windupTimer > 0) {
      this.windupTimer -= dt;
      this.vx = 0;
      if (this.windupTimer <= 0) {
        this.windupTimer = 0;
        this.vx = this.facing * 215;
        this.vy = -340;
        this.attackTimer = 0.3;
        this.attackCooldownTimer = 1.8;
      }
    } else if (this.attackTimer <= 0 && this.onGround && dist < 54 && this.attackCooldownTimer <= 0) {
      this.facing = dx >= 0 ? 1 : -1;
      this.windupTimer = 0.46;
      this.vx = 0;
    }

    if (this.windupTimer <= 0 && this.attackTimer <= 0 && this.onGround && dist < this.chaseRange) {
      this.facing = dx > 0 ? 1 : -1;
      if (this.willFall(solids)) {
        this.vx = 0;
      } else {
        this.vx = this.facing * this.speed;
      }
    } else if (this.windupTimer <= 0 && this.attackTimer <= 0 && this.onGround) {
      if (this.turnTimer <= 0 && this.willFall(solids)) {
        this.facing *= -1;
        this.turnTimer = 0.4;
      }
      this.vx = this.facing * (this.speed * 0.6);
    }

    this.step(dt, solids);
  }
}

// Moro, comandante enemigo de la guerra de 1878 y adversario final de Ardan.
export class Moro extends Enemy {
  constructor(x, y) {
    super(x, y, 'boss');
    this.w = 54; this.h = 76;
    this.chaseRange = 700; this.attackRange = 220;
    this.damage = 2; this.shootCooldown = 1.95; this.shootTimer = 0.9;
    this.hp = 32; this.maxHp = 32; this.speed = 118;
    this.windupTimer = 0;
    this.knockbackResist = 0.9;
    this.contactDamageAlways = true;
  }
  update(dt, solids, player, projectiles) {
    if (this.dead) return;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.stunTimer > 0) { this.stunTimer -= dt; this.step(dt, solids); return; }
    this.shootTimer -= dt;
    const dx = player.x - this.x;
    this.facing = dx >= 0 ? 1 : -1;
    if (this.windupTimer > 0) {
      this.windupTimer -= dt;
      this.vx = 0;
      if (this.windupTimer <= 0) {
        const cx = this.x + this.w / 2;
        const cy = this.y + 28;
        const targetX = player.x + player.w / 2 + player.vx * 0.2;
        const targetY = player.y + player.h / 2 + player.vy * 0.2;
        const aim = Math.atan2(targetY - cy, targetX - cx);
        for (const spread of [-0.18, 0, 0.18]) {
          const angle = aim + spread;
          const shot = new Projectile(cx - 6, cy - 5, Math.cos(angle) * 350, Math.sin(angle) * 350, 1, 2.2);
          shot.owner = 'enemy'; shot.color = '#c86a92'; shot.w = 12; shot.h = 10;
          projectiles.push(shot);
        }
        this.shootTimer = this.shootCooldown;
      }
    } else if (Math.abs(dx) > this.attackRange) {
      this.vx = this.facing * this.speed;
    } else {
      this.vx = 0;
      if (this.shootTimer <= 0 && projectiles) this.windupTimer = 0.56;
    }
    this.step(dt, solids);
  }
}

export class Boss extends Enemy {
  constructor(x, y) {
    super(x, y, 'boss');
    this.w = 36;
    this.h = 46;
    this.hp = 14;
    this.maxHp = 14;
    this.speed = 95;
    this.chaseRange = 420;
    this.attackRange = 46;
    this.damage = 1;
    this.phase = 1;
    this.combo = 0;
    this.actionTimer = 1.6;
    this.roar = false;
  }

  update(dt, solids, player) {
    if (this.dead) return;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.attackTimer > 0) this.attackTimer -= dt;
    if (this.actionTimer > 0) this.actionTimer -= dt;

    if (this.hp < this.maxHp * 0.4 && this.phase === 1) {
      this.phase = 2;
      this.speed = 125;
      this.actionTimer = 0.9;
    }

    const dx = player.x - this.x;
    const dist = Math.abs(dx);
    this.facing = dx > 0 ? 1 : -1;

    if (this.actionTimer <= 0) {
      if (dist < this.attackRange && this.onGround) {
        this.vx = 0;
        this.attackTimer = 0.6;
        this.actionTimer = this.phase === 2 ? 0.8 : 1.2;
        return;
      }
      if (dist > 80) {
        if (this.willFall(solids)) {
          this.vx = 0;
        } else {
          this.vx = this.facing * this.speed;
        }
      } else {
        this.vx = -this.facing * (this.speed * 0.4);
      }
      this.actionTimer = this.phase === 2 ? 0.7 : 1.0;
    } else {
      if (this.attackTimer <= 0) {
        if (this.willFall(solids)) {
          this.vx = 0;
        } else {
          this.vx = this.facing * (this.speed * 0.8);
        }
      } else {
        this.vx = 0;
      }
    }

    this.step(dt, solids);
  }

  getHitbox() {
    if (this.attackTimer > 0) {
      const cx = this.x + this.w / 2;
      const reach = this.attackReach || 42;
      if (this.facing === 1) return { x: cx, y: this.y + 10, w: reach, h: this.h - 20 };
      return { x: cx - reach, y: this.y + 10, w: reach, h: this.h - 20 };
    }
    return null;
  }
}

export class Guardian extends Boss {
  constructor(x, y, rank = 1) {
    super(x, y);
    this.w = 52;
    this.h = 64;
    this.guardianRank = rank;
    this.displayName = `GUARDIÁN ${rank}`;
    this.maxHp = 12 + rank * 4;
    this.hp = this.maxHp;
    this.speed = 96 + rank * 6;
    this.chaseRange = 560;
    this.attackRange = 62;
    this.attackReach = 58;
    this.damage = rank >= 4 ? 2 : 1;
    this.windupTimer = 0;
    this.recoverTimer = 0;
    this.attackCooldown = Math.max(0.72, 1.45 - rank * 0.11);
    this.attackCooldownTimer = 1.1;
    this.knockbackResist = 0.82;
  }

  update(dt, solids, player) {
    if (this.dead) return;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      this.attackTimer = 0;
      this.vx *= 0.8;
      this.step(dt, solids);
      return;
    }

    const dx = player.x + player.w / 2 - (this.x + this.w / 2);
    const distance = Math.abs(dx);
    this.facing = dx >= 0 ? 1 : -1;
    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - dt);

    if (this.hp <= this.maxHp * 0.4 && this.phase === 1) {
      this.phase = 2;
      this.speed += 28;
      this.attackCooldown = Math.max(0.65, this.attackCooldown - 0.3);
    }

    if (this.windupTimer > 0) {
      this.windupTimer -= dt;
      this.vx = 0;
      if (this.windupTimer <= 0) {
        this.attackTimer = this.phase === 2 ? 0.34 : 0.28;
        this.attackCooldownTimer = this.attackCooldown;
      }
    } else if (this.attackTimer > 0) {
      this.attackTimer -= dt;
      this.vx = 0;
    } else if (distance <= this.attackRange && this.attackCooldownTimer <= 0 && this.onGround) {
      this.windupTimer = this.phase === 2 ? 0.4 : 0.58;
      this.vx = 0;
    } else if (distance > this.attackRange - 8) {
      this.vx = this.willFall(solids) ? 0 : this.facing * this.speed;
    } else {
      this.vx = -this.facing * this.speed * 0.35;
    }

    this.step(dt, solids);
  }
}
