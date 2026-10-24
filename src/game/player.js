import { Entity } from './entities.js';
import { clamp } from '../core/math.js';
import { FistManager } from './fists/fistManager.js';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 16, 28);
    this.type = 'player';
    this.facing = 1;

    // Movimiento base
    this.moveSpeed = 250;
    this.accel = 2000;
    this.jumpForce = 680;
    this.maxAirJumps = 0;
    this.airJumps = 0;

    // Jump feel
    this.coyoteTime = 0.12;
    this.coyoteTimer = 0;
    this.jumpBuffer = 0.12;
    this.jumpBufferTimer = 0;

    // Dash
    this.canDash = true;
    this.dashSpeed = 760;
    this.dashTime = 0.2;
    this.dashCooldown = 0.26;
    this.dashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.dashDir = 1;
    this.iFrames = 0;
    this.dashIFrames = 0.28;

    // Ataque
    this.attacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.5;
    this.attackCooldown = 0.28;
    this.attackCooldownTimer = 0;
    this.attackRange = 28;
    this.attackWidth = 22;
    this.attackDamage = 1;
    this.combo = 0;
    this.aimingUp = false;
    this.attackDirection = 'forward';
    this.attackMode = 'elemental';
    this.attackFired = false;

    // Salud
    this.maxHp = 5;
    this.hp = 5;
    this.invuln = 0;

    // Sistema de Puños
    this.fistManager = new FistManager();
    this.fistEffects = [];
    this.damageBonus = 0;
    this.isFlying = false;
    this.flightCapacity = 1.6;
    this.flightFuel = this.flightCapacity;
    this.flightThrust = 245;
    this.flightLevel = 0;
    this.speedLevel = 0;
    this.powerLevel = 0;
    this.reachLevel = 0;
    this.focusLevel = 0;
    this.dashLevel = 0;
    this.warCosmetics = [];
    this.armorLevel = 0;
    this.healLevel = 0;
    this.healAmount = 1;
    this.healCharges = 1;
    this.maxHealCharges = 1;
    this.healHitCount = 0;
    this.healHitsRequired = 6;
    this.healFlashTimer = 0;

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
    this.attackFired = false;
    this.attackCooldownTimer = 0;
    this.iFrames = 0;
    this.invuln = 0;
    this.onGround = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.isFlying = false;
    this.aimingUp = false;
    this.attackDirection = 'forward';
  }

  getCurrentFist() {
    return this.fistManager.getCurrentFist();
  }

  getActiveFists() {
    return this.fistManager.getActiveFists();
  }

  canUseAbility() {
    return this.fistManager.canUseAbility();
  }

  useAbility() {
    return this.fistManager.useAbility();
  }

  useHealing() {
    if (this.healCharges <= 0 || this.hp >= this.maxHp) return false;
    this.healCharges -= 1;
    this.heal(this.healAmount);
    this.healFlashTimer = 0.55;
    return true;
  }

  registerHealHit() {
    if (this.healCharges >= this.maxHealCharges) return false;
    this.healHitCount += 1;
    if (this.healHitCount < this.healHitsRequired) return false;
    this.healHitCount = 0;
    this.healCharges = Math.min(this.maxHealCharges, this.healCharges + 1);
    return true;
  }

  upgradeHealing() {
    this.healLevel += 1;
    this.healAmount += 1;
    this.maxHealCharges += 1;
    this.healCharges = this.maxHealCharges;
    this.healHitsRequired = Math.max(4, this.healHitsRequired - 2);
    this.healHitCount = 0;
  }

  getAttackStats() {
    if (this.attackMode === 'basic') {
      const fire = this.getActiveFists().some((fist) => fist.element === 'fuego');
      return fire
        ? { damage: 1 + this.damageBonus, range: 88, width: 38, speed: 1 }
        : { damage: 1, range: 40, width: 30, speed: 1 };
    }
    const fists = this.getActiveFists();
    if (!fists.length) {
      return { damage: 1, range: 40, width: 30, speed: 1 };
    }
    const average = (key) => fists.reduce((total, fist) => total + fist.stats[key], 0) / fists.length;
    const range = Math.max(...fists.map((fist) => fist.stats.range)) * (1 + Math.min(0.6, this.reachLevel * 0.12));
    return {
      damage: Number(((1 + this.damageBonus) * average('damage')).toFixed(2)),
      range: Math.round(40 * range),
      width: Math.round(30 * (range * 0.8 + 0.2) * (1 + Math.min(0.3, this.reachLevel * 0.05))),
      speed: average('speed')
    };
  }

  getAttackRect() {
    const stats = this.getAttackStats();
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const attackUp = this.attacking ? this.attackDirection === 'up' : this.aimingUp;
    if (attackUp) return { x: cx - stats.width / 2, y: this.y - stats.range, w: stats.width, h: stats.range };
    if (this.facing === 1) {
      return { x: cx, y: cy - stats.width / 2, w: stats.range, h: stats.width };
    }
    return { x: cx - stats.range, y: cy - stats.width / 2, w: stats.range, h: stats.width };
  }

  beginDash(direction = this.facing) {
    this.dashing = true;
    this.dashTimer = this.dashTime;
    this.dashCooldownTimer = this.dashCooldown;
    this.dashDir = direction || this.facing;
    this.iFrames = this.dashIFrames;
    this.vx = this.dashDir * this.dashSpeed;
    this.vy = 0;
  }

  update(input, dt, solids, onAttack, onAbility, onHeal) {
    this.animTimer += dt;
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.iFrames > 0) this.iFrames -= dt;
    this.fistManager.update(dt);
    if (this.healFlashTimer > 0) this.healFlashTimer = Math.max(0, this.healFlashTimer - dt);
    this.aimingUp = input.isDown('up');

    if (input.wasPressed('heal') && this.useHealing() && onHeal) onHeal();

    if (input.wasPressed('jump')) {
      this.jumpBufferTimer = this.jumpBuffer;
    }
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;

    if (this.onGround) {
      this.coyoteTimer = this.coyoteTime;
      this.airJumps = 0;
    } else {
      if (this.coyoteTimer > 0) this.coyoteTimer -= dt;
    }

    const activeFists = this.getActiveFists();
    if (input.wasPressed('ability')) {
      const flightFist = activeFists.find((fist) => fist.ability.type === 'flight');
      if (flightFist && this.flightFuel > 0) {
        this.attacking = false;
        this.attackTimer = 0;
        this.dashing = false;
        this.dashTimer = 0;
      }
      for (const fist of activeFists) {
        if (fist.ability.type === 'flight') {
          if (this.flightFuel > 0 && onAbility) onAbility({ fist, ability: fist.ability });
        } else {
          const power = this.fistManager.useAbility(fist);
          if (power && onAbility) onAbility(power);
        }
      }
    }
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
      if (input.wasPressed('dash') && this.canDash && this.dashCooldownTimer <= 0) {
        const escapeDir = (input.isDown('left') ? -1 : 0) + (input.isDown('right') ? 1 : 0);
        this.attacking = false;
        this.beginDash(escapeDir || this.facing);
        this.setAnim('dash');
        return;
      }
      this.attackTimer -= dt;
      this.vx *= 0.6;
      const progress = Math.max(0, Math.min(1, 1 - this.attackTimer / this.attackDuration));
      if (!this.attackFired && progress >= 0.4) {
        this.attackFired = true;
        if (onAttack) onAttack(this.getAttackRect(), this.getAttackStats().damage);
      }
      if (this.attackTimer <= 0) {
        this.attacking = false;
      }
      this.setAnim('attack');
      const sustainingFlight = this.getActiveFists().some((fist) => fist.ability.type === 'flight')
        && input.isDown('ability') && this.flightFuel > 0;
      this.isFlying = sustainingFlight;
      this.moveX(dt, solids);
      if (sustainingFlight) {
        this.flightFuel = Math.max(0, this.flightFuel - dt);
        this.vy = -this.flightThrust;
        this.moveY(dt, solids);
      } else {
        this.moveY(dt, solids);
      }
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
    if (this.jumpBufferTimer > 0 && (this.onGround || this.coyoteTimer > 0)) {
      this.vy = -this.jumpForce;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.airJumps = 0;
    }

    // Dash
    if (input.wasPressed('dash') && this.canDash && this.dashCooldownTimer <= 0) {
      this.beginDash(dir || this.facing);
    }

    // Ataque
    const fist = this.getCurrentFist();
    const stats = this.getAttackStats();
    const attackCd = fist ? this.attackCooldown * (1 / stats.speed) : this.attackCooldown;
    const basicAttackPressed = input.wasPressed('basicAttack');
    const attackPressed = input.wasPressed('attack') || basicAttackPressed;
    if (attackPressed && this.attackCooldownTimer <= 0) {
      this.attackMode = basicAttackPressed ? 'basic' : 'elemental';
      this.attackDirection = this.aimingUp ? 'up' : 'forward';
      this.attacking = true;
      this.attackTimer = this.attackDuration = 0.5;
      this.attackCooldownTimer = attackCd;
      this.attackFired = false;
    }

    const flying = this.getActiveFists().some((fist) => fist.ability.type === 'flight') && input.isDown('ability') && this.flightFuel > 0;
    this.isFlying = flying;
    if (flying) {
      this.flightFuel = Math.max(0, this.flightFuel - dt);
      const airDir = (input.isDown('left') ? -1 : 0) + (input.isDown('right') ? 1 : 0);
      if (airDir) {
        this.facing = airDir;
        this.vx = clamp(this.vx + airDir * this.accel * dt * 0.72, -this.moveSpeed * 0.88, this.moveSpeed * 0.88);
      } else {
        this.vx *= Math.pow(0.94, dt * 60);
      }
      // El impulso levanta a Ardan de inmediato y sostiene el ascenso mientras dura el poder.
      this.vy = -this.flightThrust;
      this.moveX(dt, solids);
      this.moveY(dt, solids);
    } else {
      this.isFlying = false;
      this.step(dt, solids);
      if (this.onGround && !input.isDown('ability')) {
        this.flightFuel = Math.min(this.flightCapacity, this.flightFuel + dt * 0.6);
      }
    }
    if (this.onGround) {
      this.coyoteTimer = this.coyoteTime;
      this.airJumps = 0;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= dt;
    }

    if (flying) this.setAnim('flight');
    else if (!this.onGround) this.setAnim('jump');
    else if (Math.abs(this.vx) > 20) this.setAnim('run');
    else this.setAnim('idle');
  }

  hurt(amount, knockbackX = 0, { knockbackY = -200, invulnerability = 0.9 } = {}) {
    if (this.invuln > 0 || this.iFrames > 0 || this.dashing) return false;
    this.hp -= amount;
    this.invuln = invulnerability;
    this.vx += knockbackX;
    this.vy = knockbackY;
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
    return this.invuln <= 0 && this.iFrames <= 0 && !this.dashing;
  }
}
