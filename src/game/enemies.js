import { Entity } from './entities.js';
import { rand } from '../core/math.js';

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

  update(dt, solids, player) {
    if (this.dead) return;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.attackTimer > 0) this.attackTimer -= dt;

    const dx = player.x - this.x;
    const dist = Math.abs(dx);

    if (dist < this.chaseRange) {
      this.facing = dx > 0 ? 1 : -1;
      if (dist > this.attackRange + 4) {
        this.vx = this.facing * this.speed;
      } else {
        this.vx *= 0.7;
      }
    } else {
      // patrulla
      this.vx = this.facing * (this.speed * 0.6);
      // reversa si va a caer fuera del soporte (simple)
    }

    this.step(dt, solids);
  }
}

export class Grunt extends Enemy {
  constructor(x, y) {
    super(x, y, 'grunt');
    this.hp = 2;
    this.maxHp = 2;
    this.speed = 80;
    this.damage = 1;
    this.w = 16;
    this.h = 24;
  }
}

export class Charger extends Enemy {
  constructor(x, y) {
    super(x, y, 'charger');
    this.hp = 3;
    this.maxHp = 3;
    this.speed = 140;
    this.chaseRange = 220;
    this.damage = 1;
    this.w = 18;
    this.h = 26;
  }

  update(dt, solids, player) {
    if (this.dead) return;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.attackTimer > 0) this.attackTimer -= dt;

    const dx = player.x - this.x;
    const dist = Math.abs(dx);
    if (dist < this.chaseRange && this.onGround) {
      this.facing = dx > 0 ? 1 : -1;
      this.vx = this.facing * this.speed;
    } else if (this.onGround) {
      this.vx = this.facing * 40;
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
        this.vx = this.facing * this.speed;
      } else {
        this.vx = -this.facing * (this.speed * 0.4);
      }
      this.actionTimer = this.phase === 2 ? 0.7 : 1.0;
    } else {
      if (this.attackTimer <= 0) {
        this.vx = this.facing * (this.speed * 0.8);
      } else {
        this.vx = 0;
      }
    }

    this.step(dt, solids);
  }

  getHitbox() {
    if (this.attackTimer > 0) {
      const cx = this.x + this.w / 2;
      if (this.facing === 1) return { x: cx, y: this.y + 10, w: 42, h: 26 };
      return { x: cx - 42, y: this.y + 10, w: 42, h: 26 };
    }
    return null;
  }
}
