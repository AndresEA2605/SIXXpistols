import { Entity } from './entities.js';
import { clamp, rand } from '../core/math.js';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 16, 28);
    this.type = 'player';
    this.facing = 1;

    // Movimiento base
    this.moveSpeed = 230;
    this.accel = 1800;
    this.jumpForce = 620;
    this.maxAirJumps = 0;
    this.airJumps = 0;

    // Dash
    this.canDash = true;
    this.dashSpeed = 680;
    this.dashTime = 0.16;
    this.dashCooldown = 0.42;
    this.dashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.dashDir = 1;
    this.iFrames = 0;
    this.dashIFrames = 0.14;

    // Ataque
    this.attacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.16;
    this.attackCooldown = 0.28;
    this.attackCooldownTimer = 0;
    this.attackRange = 28;
    this.attackWidth = 22;
    this.attackDamage = 1;
    this.combo = 0;

    // Salud
    this.maxHp = 5;
    this.hp = 5;
    this.invuln = 0;

    // Progreso/buffs acumulados
    this.buffs = [];

    this.anim = 'idle';
    this.animTimer = 0;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.dashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.attacking = false;
    this.attackTimer = 0;
    this.attackCooldownTimer = 0;
    this.iFrames = 0;
    this.invuln = 0;
    this.hp = this.maxHp;
    this.onGround = false;
  }

  applyBuff(buff) {
    this.buffs.push(buff);
    switch (buff.id) {
      case 'heart':
        this.maxHp += 1;
        this.hp = this.maxHp;
        break;
      case 'blade':
        this.attackDamage += 1;
        this.attackRange += 4;
        break;
      case 'swiftness':
        this.moveSpeed += 38;
        this.dashCooldown *= 0.88;
        break;
      case 'momentum':
        this.jumpForce += 36;
        this.dashSpeed += 70;
        break;
      case 'reach':
        this.attackRange += 10;
        this.attackWidth += 6;
        break;
      default:
        break;
    }
  }

  getAttackRect() {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    if (this.facing === 1) {
      return { x: cx, y: cy - this.attackWidth / 2, w: this.attackRange, h: this.attackWidth };
    }
    return { x: cx - this.attackRange, y: cy - this.attackWidth / 2, w: this.attackRange, h: this.attackWidth };
  }

  update(input, dt, solids, onAttack) {
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.iFrames > 0) this.iFrames -= dt;

    if (this.dashing) {
      this.dashTimer -= dt;
      this.vx = this.dashDir * this.dashSpeed;
      this.vy = 0;
      this.moveX(dt, solids);
      this.moveY(dt, solids);
      if (this.dashTimer <= 0) {
        this.dashing = false;
        this.vx *= 0.4;
      }
      this.setAnim('dash');
      return;
    }

    if (this.attacking) {
      this.attackTimer -= dt;
      this.vx *= 0.6;
      if (this.attackTimer <= 0) {
        this.attacking = false;
      }
      this.setAnim('attack');
      this.moveX(dt, solids);
      this.moveY(dt, solids);
      return;
    }

    // Movimiento horizontal
    let dir = 0;
    if (input.isDown('left')) dir -= 1;
    if (input.isDown('right')) dir += 1;
    if (dir !== 0) {
      this.facing = dir;
      this.vx += dir * this.accel * dt;
      this.vx = clamp(this.vx, -this.moveSpeed, this.moveSpeed);
    } else {
      this.vx *= Math.pow(0.82, dt * 60);
    }

    // Salto
    if (input.wasPressed('jump')) {
      if (this.onGround) {
        this.vy = -this.jumpForce;
        this.airJumps = 0;
      } else if (this.airJumps < this.maxAirJumps) {
        this.vy = -this.jumpForce * 0.9;
        this.airJumps += 1;
      }
    }

    // Dash
    if (input.wasPressed('dash') && this.canDash && this.dashCooldownTimer <= 0 && dir !== 0) {
      this.dashing = true;
      this.dashTimer = this.dashTime;
      this.dashCooldownTimer = this.dashCooldown;
      this.dashDir = dir;
      this.iFrames = this.dashIFrames;
      this.vx = dir * this.dashSpeed;
      this.vy = 0;
    }

    // Ataque
    if (input.wasPressed('attack') && this.attackCooldownTimer <= 0) {
      this.attacking = true;
      this.attackTimer = this.attackDuration;
      this.attackCooldownTimer = this.attackCooldown;
      const rect = this.getAttackRect();
      if (onAttack) onAttack(rect, this.attackDamage);
    }

    this.step(dt, solids);

    if (!this.onGround) this.setAnim('jump');
    else if (Math.abs(this.vx) > 20) this.setAnim('run');
    else this.setAnim('idle');
  }

  hurt(amount, knockbackX = 0) {
    if (this.invuln > 0 || this.iFrames > 0 || this.dashing) return false;
    this.hp -= amount;
    this.invuln = 0.9;
    this.vx += knockbackX;
    this.vy = -200;
    if (this.hp <= 0) this.hp = 0;
    return true;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  setAnim(name) {
    if (this.anim === name) return;
    this.anim = name;
    this.animTimer = 0;
  }

  isVulnerable() {
    return this.invuln <= 0 && !this.dashing;
  }
}
