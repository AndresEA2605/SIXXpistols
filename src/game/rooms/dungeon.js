import { RoomGenerator } from './procedural.js';
import { FISTS } from '../fists/fistData.js';
import { Guardian, Moro } from '../enemies.js';
import { WAR_LOCATIONS, WAR_RELICS } from './warLore.js';

// Dos salas de combate preparan cada guardián. Su derrota entrega el brazo.
const RUN_PLAN = [
  { type: 'intro', layout: 0 },
  { type: 'combat', layout: 1 }, { type: 'combat', layout: 2 },
  { type: 'guardian', layout: 7 },
  { type: 'combat', layout: 3 }, { type: 'combat', layout: 4 },
  { type: 'guardian', layout: 7 },
  { type: 'combat', layout: 5 }, { type: 'combat', layout: 6 },
  { type: 'guardian', layout: 7 },
  { type: 'combat', layout: 1 }, { type: 'combat', layout: 3 },
  { type: 'guardian', layout: 7 },
  { type: 'combat', layout: 4 }, { type: 'combat', layout: 5 },
  { type: 'guardian', layout: 7 },
  { type: 'final', layout: 7 },
];

function shuffled(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class Dungeon {
  constructor() {
    this.generator = new RoomGenerator();
    this.rooms = [];
    this.currentRoomIndex = 0;
    this.totalRooms = RUN_PLAN.length;
    this.collectedFists = [];
  }

  generateDungeon(unlockedCosmetics = []) {
    this.rooms = [];
    this.collectedFists = [];
    const fistOrder = shuffled(FISTS);
    const firstFist = fistOrder[0];
    const guardianRewards = fistOrder.slice(1);
    let nextReward = 0;

    RUN_PLAN.forEach((stage, index) => {
      const width = 1024;
      const height = 576;
      const reward = stage.type === 'guardian' ? guardianRewards[nextReward++] : null;
      const starterFist = stage.type === 'intro' ? firstFist : null;
      const room = this.generator.generate(width, height, stage.layout, starterFist, reward, index);
      room.id = index;
      room.width = width;
      room.height = height;
      room.stageType = stage.type;
      room.stageNumber = index + 1;
      room.guardianRank = Math.floor((index - 3) / 3) + 1;
      room.location = WAR_LOCATIONS[index];
      room.cleared = false;
      room.doorOpen = false;

      const relicForRoom = { 2: 0, 5: 1, 8: 2, 11: 3, 14: 4 }[index];
      if (relicForRoom !== undefined) {
        const relic = WAR_RELICS[relicForRoom];
        if (!unlockedCosmetics.includes(relic.id)) {
          const position = this.generator.randomLootPosition(width, height, room.platforms,
            [...room.enemies, ...room.items], false, 18);
          room.items.push({ ...position, w: 18, h: 18, type: 'cosmetic', cosmeticId: relic.id, collected: false });
        }
      }

      if (stage.type === 'guardian') {
        const bossX = width * (0.66 + Math.random() * 0.12);
        room.enemies = [new Guardian(bossX, height - 48 - 64, room.guardianRank)];
        if (room.location?.bossTitle) room.enemies[0].displayName = room.location.bossTitle;
      } else if (stage.type === 'final') {
        room.enemies = [new Moro(width * (0.68 + Math.random() * 0.1), height - 48 - 76)];
        room.enemies[0].displayName = 'MORO, EL DESTRUCTOR';
        room.fistPickup = null;
        room.bossReward = null;
        room.items = [];
      }

      room.door = {
        x: width - 90,
        y: height - 48 - 70,
        w: 42,
        h: 70,
        open: false,
        ...(index === RUN_PLAN.length - 1 ? { isExit: true, nextRoom: -1 } : { nextRoom: index + 1 }),
      };
      this.rooms.push(room);
    });
  }

  getCurrentRoom() {
    return this.rooms[this.currentRoomIndex];
  }

  checkRoomClear(room) {
    if (!room) return false;
    const aliveEnemies = room.enemies.filter((enemy) => enemy && !enemy.dead);
    if (aliveEnemies.length === 0 && !room.cleared) {
      room.cleared = true;
      room.doorOpen = true;
      if (room.door) room.door.open = true;
      return true;
    }
    return room.cleared;
  }

  getProgress() {
    return {
      current: this.currentRoomIndex + 1,
      total: this.totalRooms,
      fistsCollected: this.collectedFists.length,
      maxFists: 6,
    };
  }
}
