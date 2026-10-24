import { aabb } from '../core/math.js';

export class Entity {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.friction = 0.8;
    this.gravity = 1800;
    this.onGround = false;
    this.dead = false;
    this.active = true;
    this.type = 'entity';
  }

  applyGravity(dt) {
    if (!this.onGround) {
      this.vy += this.gravity * dt;
    }
    if (this.vy > 1500) this.vy = 1500;
  }

  applyFriction(dt) {
    this.vx *= Math.pow(this.friction, dt * 60);
  }

  moveX(dt, solids) {
    this.x += this.vx * dt;
    const rect = this.bounds();
    for (let i = 0; i < solids.length; i += 1) {
      const s = solids[i];
      if (!this.collidesWith(s)) continue;
      if (this.vx > 0) this.x = s.x - this.w;
      if (this.vx < 0) this.x = s.x + s.w;
      this.vx = 0;
    }
  }

  moveY(dt, solids) {
    this.onGround = false;
    this.y += this.vy * dt;
    const rect = this.bounds();
    for (let i = 0; i < solids.length; i += 1) {
      const s = solids[i];
      if (!this.collidesWith(s)) continue;
      if (this.vy > 0) {
        this.y = s.y - this.h;
        this.vy = 0;
        this.onGround = true;
      }
      if (this.vy < 0) {
        this.y = s.y + s.h;
        this.vy = 0;
      }
    }
  }

  step(dt, solids) {
    this.applyGravity(dt);
    this.moveX(dt, solids);
    this.moveY(dt, solids);
  }

  bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  collidesWith(other) {
    return aabb(this.bounds(), other);
  }

  getCenter() {
    return { x: this.x + this.w / 2, y: this.y + this.h / 2 };
  }
}

export class Solid {
  constructor(x, y, w, h, type = 'platform') {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.solid = true;
  }
  bounds() {
    return this;
  }
}
