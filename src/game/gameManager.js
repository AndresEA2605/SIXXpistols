import { Player } from './player.js';
import { Grunt, Charger, Boss } from './enemies.js';
import { Solid } from './entities.js';
import { shuffle } from '../core/math.js';

export const ROOM_TYPES = {
  TRAINING: 'training',
  CHALLENGE: 'challenge',
  BOSS: 'boss',
};

export const UPGRADE_POOL = [
  { id: 'blade', name: 'Hoja Afilada', desc: '+1 Daño | +Alcance', icon: 'blade' },
  { id: 'reach', name: 'Estocada Larga', desc: '+Alcance de ataque', icon: 'reach' },
  { id: 'swiftness', name: 'Ligereza', desc: '+Velocidad | Menor CD de Dash', icon: 'swiftness' },
  { id: 'momentum', name: 'Impulso', desc: '+Salto | +Velocidad de Dash', icon: 'momentum' },
  { id: 'heart', name: 'Vaso Vital', desc: '+1 Corazón Máximo y Cura', icon: 'heart' },
];

export class GameManager {
  constructor() {
    this.state = 'menu'; // menu | playing | upgrade | gameover | victory | paused
    this.roomIndex = 0;
    this.roomsCleared = 0;
    this.totalDamageDealt = 0;
    this.roomTime = 0;
    this.runTime = 0;
    this.enemiesLeft = 0;
    this.kills = 0;

    this.player = new Player(0, 0);
    this.solids = [];
    this.enemies = [];
    this.door = null;
    this.doorOpen = false;

    this.upgradeOptions = [];
    this.pendingRoom = null;

    this.bossIntro = false;
    this.bossIntroTimer = 0;
  }

  startRun() {
    this.state = 'playing';
    this.roomIndex = 0;
    this.roomsCleared = 0;
    this.totalDamageDealt = 0;
    this.runTime = 0;
    this.kills = 0;
    this.player = new Player(0, 0);
    this.player.maxHp = 5;
    this.player.hp = 5;
    this.player.buffs = [];
    // reset buffs base
    this.player.attackDamage = 1;
    this.player.attackRange = 28;
    this.player.attackWidth = 22;
    this.player.moveSpeed = 230;
    this.player.jumpForce = 620;
    this.player.dashSpeed = 680;
    this.player.dashCooldown = 0.42;

    this.loadRoom(0);
  }

  loadRoom(index) {
    this.roomIndex = index;
    this.roomTime = 0;
    this.solids = [];
    this.enemies = [];
    this.doorOpen = false;
    this.door = null;
    this.bossIntro = false;

    if (index === 0) this.buildTraining();
    else if (index === 1) this.buildChallenge();
    else if (index === 2) this.buildBoss();
    else {
      // loop defensivo
      this.buildBoss();
    }
  }

  buildTraining() {
    const w = 1024, h = 576;
    // suelo
    this.solids.push(new Solid(0, h - 48, w, 48));
    // plataformas más accesibles
    this.solids.push(new Solid(150, h - 130, 110, 10));
    this.solids.push(new Solid(360, h - 150, 120, 10));
    this.solids.push(new Solid(620, h - 140, 130, 10));
    // paredes laterales
    this.solids.push(new Solid(-16, 0, 16, h));
    this.solids.push(new Solid(w, 0, 16, h));

    this.player.reset(80, h - 48 - 30);
    // menos enemigos para aprender
    this.enemies.push(new Grunt(460, h - 48 - 24));
    this.door = { x: w - 64, y: h - 48 - 56, w: 32, h: 56, open: false, next: 1 };
    this.enemiesLeft = this.enemies.filter((e) => !e.dead).length;
  }

  buildChallenge() {
    const w = 1180, h = 576;
    this.solids.push(new Solid(0, h - 48, 320, 48));
    this.solids.push(new Solid(420, h - 48, 760, 48));
    // plataformas en escalera
    this.solids.push(new Solid(200, h - 130, 80, 10));
    this.solids.push(new Solid(320, h - 200, 90, 10));
    this.solids.push(new Solid(480, h - 160, 90, 10));
    this.solids.push(new Solid(620, h - 230, 110, 10));
    this.solids.push(new Solid(820, h - 170, 100, 10));
    this.solids.push(new Solid(980, h - 240, 90, 10));
    // laterales
    this.solids.push(new Solid(-16, 0, 16, h));
    this.solids.push(new Solid(w, 0, 16, h));

    this.player.reset(48, h - 48 - 30);
    this.enemies.push(new Grunt(520, h - 48 - 24));
    this.enemies.push(new Charger(760, h - 48 - 26));
    this.enemies.push(new Grunt(940, h - 240 - 24));
    this.door = { x: w - 72, y: h - 48 - 56, w: 32, h: 56, open: false, next: 2 };
    this.enemiesLeft = this.enemies.filter((e) => !e.dead).length;
  }

  buildBoss() {
    const w = 1280, h = 576;
    this.solids.push(new Solid(0, h - 48, w, 48));
    // columnas/plataformas pequeñas
    this.solids.push(new Solid(260, h - 150, 70, 10));
    this.solids.push(new Solid(560, h - 180, 80, 10));
    this.solids.push(new Solid(880, h - 150, 70, 10));
    this.solids.push(new Solid(-16, 0, 16, h));
    this.solids.push(new Solid(w, 0, 16, h));

    this.player.reset(80, h - 48 - 30);
    const boss = new Boss(w - 220, h - 48 - 46);
    this.enemies.push(boss);
    this.door = { x: w - 80, y: h - 48 - 56, w: 32, h: 56, open: false, next: -1 }; // victoria
    this.enemiesLeft = 1;
    this.bossIntro = true;
    this.bossIntroTimer = 2.0;
  }

  openDoor() {
    if (this.doorOpen) return;
    this.doorOpen = true;
    if (this.door) this.door.open = true;
  }

  tryEnterDoor(player) {
    if (!this.doorOpen || !this.door) return false;
    const pb = player.bounds();
    const d = this.door;
    if (pb.x + pb.w > d.x && pb.x < d.x + d.w && pb.y + pb.h > d.y && pb.y < d.y + d.h) {
      return true;
    }
    return false;
  }

  generateUpgrades() {
    const pool = shuffle(UPGRADE_POOL);
    this.upgradeOptions = pool.slice(0, 3);
  }

  applyUpgrade(option) {
    this.player.applyBuff(option);
    this.state = 'playing';
  }

  checkRoomClear() {
    const alive = this.enemies.filter((e) => !e.dead);
    this.enemiesLeft = alive.length;
    if (alive.length === 0 && !this.doorOpen) {
      this.openDoor();
      // oferta de mejora al completar sala (sala 0 y 1)
      if (this.roomIndex === 0 || this.roomIndex === 1) {
        this.pendingRoom = this.door.next;
        this.generateUpgrades();
        // se muestra modal en update/UI
      }
    }
  }

  update(dt) {
    if (this.state === 'menu') return;
    if (this.state === 'gameover' || this.state === 'victory') return;
    if (this.state === 'upgrade') return;
    if (this.state === 'paused') return;

    this.runTime += dt;
    this.roomTime += dt;

    if (this.bossIntro) {
      this.bossIntroTimer -= dt;
      if (this.bossIntroTimer <= 0) this.bossIntro = false;
    }

    // actualizar enemigos
    for (let i = 0; i < this.enemies.length; i += 1) {
      const enemy = this.enemies[i];
      if (enemy.dead) continue;
      enemy.update(dt, this.solids, this.player);
    }

    this.checkRoomClear();
  }
}
