import { Entity } from './entities.js';
import { aabb } from '../core/math.js';

function segmentIntersectsRect(x1, y1, x2, y2, rect) {
  let minT = 0;
  let maxT = 1;
  const axes = [
    [x1, x2 - x1, rect.x, rect.x + rect.w],
    [y1, y2 - y1, rect.y, rect.y + rect.h],
  ];
  for (const [start, delta, min, max] of axes) {
    if (Math.abs(delta) < 0.00001) {
      if (start < min || start > max) return false;
      continue;
    }
    let t1 = (min - start) / delta;
    let t2 = (max - start) / delta;
    if (t1 > t2) [t1, t2] = [t2, t1];
    minT = Math.max(minT, t1);
    maxT = Math.min(maxT, t2);
    if (minT > maxT) return false;
  }
  return true;
}

export class Projectile extends Entity {
  constructor(x, y, vx, vy, damage = 1, life = 2.4) {
    super(x, y, 6, 4);
    this.type = 'projectile';
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.life = life;
    this.maxLife = life;
    this.age = 0;
    this.facing = vx >= 0 ? 1 : -1;
    this.gravity = 0;
    this.friction = 1;
    this.solidHit = false;
    this.owner = 'enemy';
    this.color = '#e6e6e6';
    this.piercing = false;
    this.pierceWalls = false;
    this.hitEnemies = new Set();
    this.hitPlayer = false;
  }

  update(dt, solids, target = null) {
    if (this.dead) return;
    this.age += dt;
    this.life -= dt;
    if (this.life <= 0) {
      this.dead = true;
      return;
    }

    const oldX = this.x;
    const oldY = this.y;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (target && this.owner !== 'player') {
      const bounds = target.bounds();
      const expanded = { x: bounds.x - this.w, y: bounds.y - this.h, w: bounds.w + this.w, h: bounds.h + this.h };
      if (segmentIntersectsRect(oldX, oldY, this.x, this.y, expanded)) {
        this.hitPlayer = true;
        this.impactType = 'player';
        this.dead = true;
        return;
      }
    }

    // destruir al chocar con sólidos
    const rect = this.bounds();
    for (let i = 0; i < solids.length; i += 1) {
      const s = solids[i];
      if (aabb(rect, s)) {
        if (!this.pierceWalls) this.dead = true;
        this.solidHit = true;
        this.impactType = 'wall';
        break;
      }
    }
  }

  bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
