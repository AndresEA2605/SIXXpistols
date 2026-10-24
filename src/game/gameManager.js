import { Player } from './player.js';
import { Dungeon } from './rooms/dungeon.js';
import { FistPickup } from './loot/fistPickup.js';
import { FistManager } from './fists/fistManager.js';
import { Projectile } from './projectiles.js';
import { aabb } from '../core/math.js';

export class GameManager {
  constructor() {
    this.state = 'menu';
    this.player = new Player(0, 0);
    this.dungeon = new Dungeon();
    this.currentRoom = null;
    this.solids = [];
    this.enemies = [];
    this.projectiles = [];
    this.fistPickups = [];
    this.items = [];
    this.minions = [];
    this.combatEffects = [];
    this.pickedFist = null;
    this.pickedItem = null;
    
    this.runTime = 0;
    this.kills = 0;
    this.totalDamageDealt = 0;
  }

  startRun() {
    this.state = 'intro';
    this.runTime = 0;
    this.kills = 0;
    this.totalDamageDealt = 0;
    this.pickedFist = null;
    this.pickedItem = null;
    this.projectiles = [];
    this.items = [];
    this.minions = [];
    this.combatEffects = [];
    
    this.player = new Player(0, 0);
    this.player.fistManager = new FistManager();
    this.player.maxHp = 5;
    this.player.hp = 5;
    
    this.dungeon = new Dungeon();
    this.dungeon.generateDungeon();
    this.loadCurrentRoom();
  }

  continueAfterIntro() {
    if (this.state === 'intro') this.state = 'playing';
  }

  loadCurrentRoom() {
    const room = this.dungeon.getCurrentRoom();
    if (!room) return;
    
    this.currentRoom = room;
    this.solids = [...room.solids];
    this.enemies = room.enemies.map(e => {
      e.dead = false;
      e.hitFlash = 0;
      if (e._hitThisSwing !== undefined) e._hitThisSwing = false;
      return e;
    });
    this.projectiles = [];
    this.fistPickups = [];
    this.items = room.items || [];
    this.minions = [];
    this.combatEffects = [];
    
    if (room.fistPickup && !room.fistPickup.collected) {
      this.fistPickups.push(new FistPickup(room.fistPickup.x, room.fistPickup.y, room.fistPickup.fist));
    }
    
    this.player.reset(60, room.height - 48 - 30);
  }

  checkDoorTransition() {
    const room = this.currentRoom;
    if (!room || !room.door || !room.doorOpen) return false;
    
    const pb = this.player.bounds();
    const d = room.door;
    if (pb.x + pb.w > d.x && pb.x < d.x + d.w && pb.y + pb.h > d.y && pb.y < d.y + d.h) {
      if (d.isExit || d.nextRoom === -1) {
        if (!this.player.fistManager.hasAllFists()) return false;
        this.state = 'victory';
        return true;
      } else {
        const nextIndex = d.nextRoom;
        this.dungeon.currentRoomIndex = nextIndex;
        this.loadCurrentRoom();
        return true;
      }
    }
    return false;
  }

  tryCollectFists() {
    for (let i = this.fistPickups.length - 1; i >= 0; i--) {
      const pickup = this.fistPickups[i];
      if (pickup.tryCollect(this.player)) {
        const collected = this.player.fistManager.collectFist(pickup.fist);
        if (collected) {
          this.dungeon.collectedFists.push(pickup.fist.id);
          this.pickedFist = pickup.fist;
          this.state = 'fistPickup';
          if (this.currentRoom.fistPickup) {
            this.currentRoom.fistPickup.collected = true;
          }
          this.fistPickups.splice(i, 1);
          return true;
        }
        // Una repetición generada por un mapa viejo no bloquea la salida.
        if (this.currentRoom.fistPickup) this.currentRoom.fistPickup.collected = true;
        this.fistPickups.splice(i, 1);
      }
    }
    return false;
  }

  continueAfterFistPickup() {
    this.state = 'playing';
    this.pickedFist = null;
  }

  continueAfterItemPickup() {
    this.state = 'playing';
    this.pickedItem = null;
  }

  useFistAbility({ fist, ability }) {
    const player = this.player;
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    const facing = player.facing;
    const enemies = this.enemies.filter((enemy) => !enemy.dead);
    const effect = { type: ability.type, x: cx, y: cy, facing, color: fist.color, time: 0, duration: ability.type === 'summon' ? 0.65 : 0.42, range: ability.range || ability.distance || ability.radius || 150, points: [] };
    this.combatEffects.push(effect);
    const hit = (enemy, damage, push = 0, stun = 0) => {
      enemy.hurt(damage, facing);
      player.registerHealHit();
      enemy.vx += facing * push;
      enemy.stunTimer = Math.max(enemy.stunTimer || 0, stun);
      this.totalDamageDealt += damage;
      if (enemy.dead) this.kills += 1;
    };

    if (ability.type === 'flight') {
      // El botón sostiene el ascenso; el propulsor gasta reserva de forma continua.
      enemies.forEach((enemy) => {
        if (aabb({ x: cx - ability.radius, y: cy - ability.radius, w: ability.radius * 2, h: ability.radius * 2 }, enemy.bounds())) hit(enemy, ability.damage);
      });
    } else if (ability.type === 'water_burst') {
      for (let i = -1; i <= 1; i += 1) {
        const shot = new Projectile(cx + facing * 8, cy - 2, facing * ability.speed, i * 110, ability.damage, 1.6);
        shot.w = 12; shot.h = 8; shot.color = fist.color; shot.owner = 'player'; shot.piercing = true;
        this.projectiles.push(shot);
      }
    } else if (ability.type === 'summon') {
      this.minions.push({ x: cx, y: player.y + player.h - 14, w: 18, h: 14, time: ability.duration, cooldown: 0, damage: ability.damage, color: fist.color });
    } else if (ability.type === 'gust') {
      const area = { x: facing > 0 ? cx : cx - ability.range, y: cy - ability.height / 2, w: ability.range, h: ability.height };
      enemies.forEach((enemy) => { if (aabb(area, enemy.bounds())) hit(enemy, ability.damage, ability.push, ability.stun); });
    } else if (ability.type === 'chain') {
      let origin = { x: cx, y: cy };
      const hitEnemies = new Set();
      for (let i = 0; i < ability.bounces; i += 1) {
        const target = enemies.filter((enemy) => !hitEnemies.has(enemy) && Math.hypot(enemy.x + enemy.w / 2 - origin.x, enemy.y + enemy.h / 2 - origin.y) <= ability.range)
          .sort((a, b) => Math.hypot(a.x + a.w / 2 - origin.x, a.y + a.h / 2 - origin.y) - Math.hypot(b.x + b.w / 2 - origin.x, b.y + b.h / 2 - origin.y))[0];
        if (!target) break;
        hitEnemies.add(target); hit(target, ability.damage, 50, 0.2);
        origin = { x: target.x + target.w / 2, y: target.y + target.h / 2 };
        effect.points.push(origin);
      }
    } else if (ability.type === 'blink') {
      const oldX = player.x;
      const step = facing * 8;
      for (let moved = 0; moved < ability.distance; moved += 8) {
        player.x += step;
        if (this.solids.some((solid) => player.collidesWith(solid))) {
          player.x -= step;
          break;
        }
      }
      effect.x = oldX + player.w / 2;
      effect.range = Math.abs(player.x - oldX);
      const area = { x: Math.min(oldX, player.x) - ability.radius, y: cy - ability.radius, w: Math.abs(player.x - oldX) + ability.radius * 2, h: ability.radius * 2 };
      enemies.forEach((enemy) => { if (aabb(area, enemy.bounds())) hit(enemy, ability.damage, 100); });
      player.iFrames = Math.max(player.iFrames, 0.2);
    }
  }

  collectItems() {
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const item = this.items[i];
      if (item.collected || !aabb(this.player.bounds(), item)) continue;
      item.collected = true;
      if (item.type === 'heart') {
        if (this.player.hp >= this.player.maxHp) {
          this.player.maxHp += 1;
          this.player.hp += 1;
        } else {
          this.player.heal(2);
        }
      }
      else if (item.type === 'vitality') {
        this.player.maxHp += 1;
        this.player.heal(1);
        this.player.armorLevel += 1;
        this.player.upgradeHealing();
      }
      else if (item.type === 'power') { this.player.damageBonus += 0.25; this.player.powerLevel += 1; }
      else if (item.type === 'flight') {
        this.player.flightLevel += 1;
        this.player.flightCapacity += 0.4;
        this.player.flightFuel = Math.min(this.player.flightCapacity, this.player.flightFuel + 0.6);
        this.player.flightThrust += 32;
      } else if (item.type === 'swift') {
        this.player.speedLevel += 1;
        this.player.moveSpeed += 22;
        this.player.attackCooldown = Math.max(0.16, this.player.attackCooldown * 0.9);
      } else if (item.type === 'reach') this.player.reachLevel += 1;
      else if (item.type === 'focus') {
        this.player.focusLevel += 1;
        this.player.fistManager.cooldownMultiplier = Math.max(0.48, 1 - this.player.focusLevel * 0.1);
      } else if (item.type === 'dash') {
        this.player.dashLevel += 1;
        this.player.dashCooldown = Math.max(0.12, this.player.dashCooldown * 0.88);
        this.player.dashTime = Math.min(0.32, this.player.dashTime + 0.015);
        this.player.dashIFrames = Math.min(0.42, this.player.dashIFrames + 0.02);
      } else if (item.type === 'cosmetic' && item.cosmeticId && !this.player.collectedWarCosmetics.includes(item.cosmeticId)) {
        this.player.collectedWarCosmetics.push(item.cosmeticId);
        this.player.equippedWarCosmetics.push(item.cosmeticId);
      }
      this.items.splice(i, 1);
      this.pickedItem = item;
      this.state = 'itemPickup';
      return item;
    }
    return null;
  }

  update(dt) {
    if (this.state === 'menu' || this.state === 'intro') return;
    if (this.state === 'gameover' || this.state === 'victory' || this.state === 'fistPickup' || this.state === 'itemPickup' || this.state === 'paused' || this.state === 'inventory') return;
    
    this.runTime += dt;
    for (let i = this.combatEffects.length - 1; i >= 0; i -= 1) {
      this.combatEffects[i].time += dt;
      if (this.combatEffects[i].time >= this.combatEffects[i].duration) this.combatEffects.splice(i, 1);
    }

    if (this.currentRoom && this.player.y > this.currentRoom.height + 48) {
      this.player.hurt(1);
      this.player.x = 60;
      this.player.y = this.currentRoom.height - 48 - this.player.h;
      this.player.vx = 0;
      this.player.vy = 0;
    }
    
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (enemy.dead) continue;
      if (enemy.enemyType === 'ranged' || enemy.enemyType === 'boss') {
        enemy.update(dt, this.solids, this.player, this.projectiles);
      } else {
        enemy.update(dt, this.solids, this.player);
      }
      if (!enemy.dead && enemy.burnTimer > 0) {
        enemy.burnTimer = Math.max(0, enemy.burnTimer - dt);
        enemy.burnTickTimer = (enemy.burnTickTimer || 0) - dt;
        if (enemy.burnTickTimer <= 0) {
          const burn = Math.min(0.45, enemy.hp);
          enemy.hp -= burn;
          enemy.hitFlash = 0.1;
          enemy.burnTickTimer = 0.48;
          this.totalDamageDealt += burn;
          if (enemy.hp <= 0) {
            enemy.dead = true;
            this.kills += 1;
          }
        }
      }
    }
    
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      if (proj.dead) {
        this.projectiles.splice(i, 1);
        continue;
      }
      proj.update(dt, this.solids, proj.owner === 'player' ? null : this.player);
      if (proj.impactType) {
        this.combatEffects.push({
          type: 'projectileImpact',
          impactKind: proj.impactType,
          x: proj.x + proj.w / 2,
          y: proj.y + proj.h / 2,
          color: proj.color || '#e6e6e6',
          range: 18,
          time: 0,
          duration: 0.22,
        });
      }
    }
    
    for (let i = 0; i < this.fistPickups.length; i++) {
      this.fistPickups[i].update(dt);
    }

    if (this.collectItems()) return;
    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      const minion = this.minions[i];
      minion.time -= dt; minion.cooldown -= dt;
      const target = this.enemies.filter((enemy) => !enemy.dead).sort((a, b) => Math.abs(a.x - minion.x) - Math.abs(b.x - minion.x))[0];
      if (target) {
        const dx = target.x - minion.x;
        minion.x += Math.sign(dx) * Math.min(Math.abs(dx), 90 * dt);
        minion.y += Math.sign(target.y + target.h - minion.y - minion.h) * Math.min(Math.abs(target.y + target.h - minion.y - minion.h), 70 * dt);
        if (Math.abs(dx) < 30 && minion.cooldown <= 0) {
          target.hurt(minion.damage, Math.sign(dx));
          this.player.registerHealHit();
          this.totalDamageDealt += minion.damage;
          if (target.dead) this.kills += 1;
          minion.cooldown = 0.8;
        }
      }
      if (minion.time <= 0) this.minions.splice(i, 1);
    }
    
    this.tryCollectFists();
    
    if (this.currentRoom) {
      const allDead = this.enemies.every(e => e.dead);
      if (allDead && this.currentRoom.bossReward && !this.currentRoom.rewardSpawned) {
        const position = this.currentRoom.rewardPosition || { x: this.currentRoom.width / 2, y: this.currentRoom.height - 80 };
        const x = Math.max(120, Math.min(this.currentRoom.width - 180, position.x));
        const y = position.y;
        const pickup = { x, y, w: 20, h: 28, fist: this.currentRoom.bossReward, collected: false, bob: 0 };
        this.currentRoom.fistPickup = pickup;
        this.currentRoom.rewardSpawned = true;
        this.fistPickups.push(new FistPickup(pickup.x, pickup.y, pickup.fist));
      }
      const armClaimed = this.currentRoom.bossReward
        ? Boolean(this.currentRoom.fistPickup?.collected)
        : !this.currentRoom.fistPickup || this.currentRoom.fistPickup.collected;
      if (allDead && armClaimed && !this.currentRoom.cleared) {
        this.dungeon.checkRoomClear(this.currentRoom);
      }
    }
  }
}
