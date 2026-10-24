import { Solid } from '../entities.js';
import { Grunt, Charger, Ranged, Flyer, Crawler } from '../enemies.js';

// Las siluetas de las salas se mantienen; enemigos y botín se sortean en cada run.
const ROOM_LAYOUTS = [
  { intro: true, platforms: [], enemySpawns: [], minEnemies: 0, maxEnemies: 0 },
  { platforms: [{ x: 180, y: 430, w: 100 }, { x: 390, y: 370, w: 120 }, { x: 650, y: 430, w: 110 }, { x: 820, y: 350, w: 100 }], minEnemies: 2, maxEnemies: 4 },
  { platforms: [{ x: 140, y: 360, w: 110 }, { x: 340, y: 445, w: 100 }, { x: 530, y: 345, w: 140 }, { x: 780, y: 420, w: 130 }], minEnemies: 3, maxEnemies: 5 },
  { platforms: [{ x: 190, y: 420, w: 130 }, { x: 420, y: 335, w: 100 }, { x: 610, y: 430, w: 110 }, { x: 790, y: 350, w: 120 }], minEnemies: 3, maxEnemies: 5 },
  { platforms: [{ x: 150, y: 350, w: 130 }, { x: 365, y: 420, w: 110 }, { x: 555, y: 350, w: 120 }, { x: 760, y: 430, w: 140 }], minEnemies: 4, maxEnemies: 5 },
  { platforms: [{ x: 160, y: 430, w: 100 }, { x: 340, y: 345, w: 140 }, { x: 590, y: 420, w: 100 }, { x: 760, y: 335, w: 130 }], minEnemies: 4, maxEnemies: 6 },
  { platforms: [{ x: 140, y: 370, w: 120 }, { x: 330, y: 440, w: 120 }, { x: 520, y: 355, w: 120 }, { x: 710, y: 430, w: 120 }, { x: 850, y: 345, w: 90 }], minEnemies: 4, maxEnemies: 7 },
  { boss: true, platforms: [{ x: 230, y: 420, w: 130 }, { x: 500, y: 360, w: 150 }, { x: 760, y: 420, w: 130 }], enemySpawns: [], minEnemies: 1, maxEnemies: 1 },
];

const ENEMY_TYPES = [Grunt, Charger, Ranged, Flyer, Crawler];
const ITEM_TYPES = ['heart', 'power', 'vitality', 'flight', 'swift', 'reach', 'focus', 'dash'];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function shuffled(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class RoomGenerator {
  generate(width = 1024, height = 576, roomIndex = 0, fist = null, bossReward = null, difficulty = 0) {
    const layout = ROOM_LAYOUTS[roomIndex] || ROOM_LAYOUTS[1];
    const room = {
      id: roomIndex,
      width,
      height,
      intro: Boolean(layout.intro),
      solids: [],
      enemies: [],
      platforms: [],
      doors: [],
      fistPickup: null,
      bossReward,
      rewardPosition: null,
      rewardSpawned: false,
      items: [],
      decorations: [],
      cleared: false,
      doorOpen: false,
    };

    room.solids.push(new Solid(-16, 0, 16, height));
    room.solids.push(new Solid(width, 0, 16, height));
    room.solids.push(new Solid(0, height - 48, width, 48));
    for (const platform of layout.platforms) {
      const solid = new Solid(platform.x, platform.y, platform.w, 10);
      room.solids.push(solid);
      room.platforms.push(solid);
    }

    this.generateEnemies(room, layout, height, difficulty);
    const occupied = room.enemies.map((enemy) => ({ x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h }));
    if (fist) {
      const position = this.randomLootPosition(width, height, room.platforms, occupied, layout.intro, 28);
      room.fistPickup = { ...position, w: 20, h: 28, fist, collected: false, bob: 0 };
      occupied.push(room.fistPickup);
    }
    if (bossReward) room.rewardPosition = this.randomLootPosition(width, height, room.platforms, occupied, false, 28);

    if (!layout.intro && !layout.boss && Math.random() < 0.78 + Math.min(0.17, difficulty * 0.012)) {
      const itemCount = difficulty >= 4 && Math.random() < 0.34 ? 2 : 1;
      for (let i = 0; i < itemCount; i += 1) {
        const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        const position = this.randomLootPosition(width, height, room.platforms, occupied, false, 18);
        const item = { ...position, w: 18, h: 18, type, collected: false };
        room.items.push(item);
        occupied.push(item);
      }
    }
    return room;
  }

  randomLootPosition(width, height, platforms, occupied = [], intro = false, lootHeight = 18, platformChance = 0.48) {
    const floorY = height - 48;
    for (let attempt = 0; attempt < 36; attempt += 1) {
      let x;
      let y;
      if (!intro && platforms.length && Math.random() < platformChance) {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        x = randomBetween(platform.x + 10, platform.x + platform.w - 28);
        y = platform.y - lootHeight - 2;
      } else {
        x = intro ? 502 : randomBetween(175, width - 155);
        y = floorY - lootHeight - (intro ? 0 : 2);
      }
      const candidate = { x, y, w: 20, h: lootHeight };
      const tooClose = occupied.some((other) => Math.abs((other.x + other.w / 2) - (x + 10)) < 58
        && Math.abs((other.y + other.h / 2) - (y + 12)) < 42);
      if (!tooClose && x < width - 140) return { x: Math.round(x), y: Math.round(y) };
    }
    return { x: Math.round(randomBetween(220, width - 160)), y: floorY - lootHeight - 2 };
  }

  generateEnemies(room, layout, height, difficulty = 0) {
    if (layout.intro || layout.boss) return;
    const groundY = height - 48;
    const baseCount = Math.floor(Math.random() * (layout.maxEnemies - layout.minEnemies + 1)) + layout.minEnemies;
    const escalation = Math.min(5, Math.floor(difficulty / 3));
    const count = Math.min(11, baseCount + escalation);
    const validSpawns = shuffled(Array.from({ length: 22 }, (_, index) => 190 + index * 34));
    const spawns = [];
    for (const candidate of validSpawns) {
      if (spawns.every((x) => Math.abs(x - candidate) >= 48)) spawns.push(candidate);
      if (spawns.length >= count) break;
    }

    for (const x of spawns) {
      const EnemyType = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      const enemy = new EnemyType(x, groundY - 30);
      enemy.y = groundY - enemy.h;
      if (enemy.enemyType === 'flyer') enemy.y -= 90;
      const hpBonus = Math.floor(difficulty / 5);
      enemy.hp += hpBonus;
      enemy.maxHp += hpBonus;
      enemy.speed *= 1 + Math.min(0.32, difficulty * 0.014);
      enemy.damage += Math.floor(difficulty / 12);
      for (const timer of ['attackCooldown', 'attackCooldownTimer', 'shootCooldown', 'diveCooldown', 'chargeCooldown']) {
        if (enemy[timer] > 0) enemy[timer] *= 1 - Math.min(0.22, difficulty * 0.01);
      }
      room.enemies.push(enemy);
    }
  }
}
