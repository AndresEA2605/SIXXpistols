import { Input } from './core/input.js';
import { AudioManager } from './core/audio.js';
import { Camera } from './core/camera.js';
import { GameManager } from './game/gameManager.js';
import { Renderer } from './render/renderer.js';
import { HUD } from './ui/hud.js';
import { Screens } from './ui/screens.js';
import { Projectile } from './game/projectiles.js';

const canvas = document.getElementById('game');
const input = new Input(window);
const audio = new AudioManager();
const camera = new Camera(canvas.width, canvas.height);
const gm = new GameManager();
const renderer = new Renderer(canvas);
const hud = new HUD(document.getElementById('hud'));
const screens = new Screens(document);

const touchContainer = document.getElementById('touch-controls');
if (touchContainer) {
  try { input.bindTouchControls(touchContainer); } catch(e) {}
}

let last = performance.now();
let acc = 0;
const dtFixed = 1 / 60;
let flightWasActive = false;
let flightSoundTimer = 0;

function vibrate(duration = 8) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(duration);
}

function resetCamera() {
  camera.x = 0;
  camera.y = 0;
  camera.targetX = 0;
  camera.targetY = 0;
  camera.ox = 0;
  camera.oy = 0;
  camera.flightOffset = 0;
  camera.flightActive = false;
  flightWasActive = false;
  flightSoundTimer = 0;
}

screens.onStart = () => {
  try { audio.unlock(); } catch(e) {}
  try { audio.play('click'); } catch(e) {}
  resetCamera();
  gm.startRun();
  screens.showIntro();
};

screens.onRetry = () => {
  try { audio.unlock(); } catch(e) {}
  try { audio.play('click'); } catch(e) {}
  resetCamera();
  gm.startRun();
  screens.showIntro();
};

screens.onMenu = () => {
  try { audio.play('click'); } catch(e) {}
  gm.state = 'menu';
  screens.showMenu();
};

screens.onResume = () => {
  try { audio.play('click'); } catch(e) {}
  gm.state = 'playing';
  screens.hidePause();
};

function openFistInventory() {
  if (gm.state !== 'playing') return;
  gm.state = 'inventory';
  acc = 0;
  screens.showFistInventory();
  hud.updateInventory(gm);
}

function closeFistInventory() {
  if (gm.state !== 'inventory') return;
  gm.state = 'playing';
  acc = 0;
  last = performance.now();
  screens.hideFistInventory();
}

document.getElementById('btn-inventory-close')?.addEventListener('click', closeFistInventory);

screens.onFistPickupContinue = () => {
  try { audio.play('click'); } catch(e) {}
  if (gm.continueAfterFistPickup) gm.continueAfterFistPickup();
  if (screens.hideFistPickup) screens.hideFistPickup();
};

screens.onItemPickupContinue = () => {
  try { audio.play('click'); } catch(e) {}
  gm.continueAfterItemPickup();
  screens.hideFistPickup();
};

screens.onIntroContinue = () => {
  try { audio.play('click'); } catch(e) {}
  gm.continueAfterIntro();
  try { audio.play('world'); } catch(e) {}
  screens.hideTutorial();
};

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (gm.state === 'inventory') {
      closeFistInventory();
    } else if (gm.state === 'playing') {
      gm.state = 'paused';
      acc = 0;
      screens.showPause();
    } else if (gm.state === 'paused') {
      gm.state = 'playing';
      acc = 0;
      last = performance.now();
      screens.hidePause();
    }
  }
  if (e.code === 'KeyM') {
    try {
      const muted = audio.toggleMuted();
      const btn = document.getElementById('btn-mute');
      if (btn) btn.textContent = muted ? '🔇 SILENCIADO' : '🔊 SONIDO';
    } catch(e) {}
  }
});

function tryDoorTransition() {
  if (gm.state !== 'playing') return;
  if (gm.checkDoorTransition) {
    if (gm.checkDoorTransition()) {
      try { audio.play('door'); } catch(e) {}
    }
  }
}

function handleCombat() {
  if (gm.state !== 'playing' || !gm.player) return;
  
  const attackProgress = gm.player.attacking ? 1 - gm.player.attackTimer / gm.player.attackDuration : 0;
  if (gm.player.attacking && attackProgress >= 0.4 && attackProgress <= 0.58) {
    const rect = gm.player.getAttackRect();
    const stats = gm.player.getAttackStats ? gm.player.getAttackStats() : { damage: 1 };
    const activeFists = gm.player.getActiveFists();
    const hasWater = activeFists.some((fist) => fist.element === 'agua');
    if (gm.enemies) {
      for (let i = 0; i < gm.enemies.length; i++) {
        const enemy = gm.enemies[i];
        if (!enemy || enemy.dead || (hasWater && activeFists.length === 1 && gm.player.attackMode !== 'basic')) continue;
        if (rect.x < enemy.x + enemy.w && rect.x + rect.w > enemy.x && rect.y < enemy.y + enemy.h && rect.y + rect.h > enemy.y) {
          if (!enemy._hitThisSwing) {
            enemy._hitThisSwing = true;
            if (enemy.hurt) enemy.hurt(stats.damage, gm.player.facing);
            gm.player.registerHealHit();
            const hasFire = activeFists.some((fist) => fist.element === 'fuego');
            if (hasFire) {
              enemy.burnTimer = Math.max(enemy.burnTimer || 0, gm.player.attackMode === 'basic' ? 1.2 : 2.6);
              enemy.burnTickTimer = Math.min(enemy.burnTickTimer || 0.35, 0.35);
            }
            if (gm.player.attackMode !== 'basic' && activeFists.some((fist) => fist.element === 'aire')) {
              enemy.vx += gm.player.facing * 75;
              enemy.stunTimer = Math.max(enemy.stunTimer || 0, 0.18);
            }
            const lightningFist = gm.player.attackMode === 'basic' ? null : activeFists.find((fist) => fist.element === 'rayo');
            if (lightningFist) {
              const origin = { x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h / 2 };
              const nearby = gm.enemies
                .filter((target) => target && target !== enemy && !target.dead && !target._hitThisSwing)
                .map((target) => ({
                  target,
                  distance: Math.hypot(target.x + target.w / 2 - origin.x, target.y + target.h / 2 - origin.y),
                }))
                .filter(({ distance }) => distance <= 165)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 3);
              const chain = {
                type: 'chain', x: origin.x, y: origin.y, facing: gm.player.facing,
                color: lightningFist.color, time: 0, duration: 0.3, range: 165, points: [],
              };
              for (const { target } of nearby) {
                target._hitThisSwing = true;
                const chainDamage = Math.max(0.35, stats.damage * 0.65);
                target.hurt(chainDamage, gm.player.facing);
                target.stunTimer = Math.max(target.stunTimer || 0, 0.28);
                gm.player.registerHealHit();
                gm.totalDamageDealt += chainDamage;
                if (target.dead) gm.kills += 1;
                chain.points.push({ x: target.x + target.w / 2, y: target.y + target.h / 2 });
              }
              if (chain.points.length) gm.combatEffects.push(chain);
            }
            gm.totalDamageDealt = (gm.totalDamageDealt || 0) + stats.damage;
            try { audio.play('hit'); } catch(e) {}
            camera.shake(2.4, 0.11);
            vibrate(7);
            if (enemy.dead) {
              gm.kills = (gm.kills || 0) + 1;
              try { audio.play('kill'); } catch(e) {}
            }
          }
        }
      }
    }
  } else if (!gm.player.attacking && gm.enemies) {
    for (let i = 0; i < gm.enemies.length; i++) {
      if (gm.enemies[i]) gm.enemies[i]._hitThisSwing = false;
    }
  }

  if (gm.projectiles) {
    for (let i = gm.projectiles.length - 1; i >= 0; i--) {
      const proj = gm.projectiles[i];
      if (proj?.impactType && !proj.impactSoundPlayed) {
        proj.impactSoundPlayed = true;
        try { audio.play('impact'); } catch(e) {}
        if (proj.impactType === 'wall') camera.shake(1.2, 0.08);
      }
      // Si un disparo y el jugador tocan el borde de un sólido en el mismo
      // paso, procesa primero el impacto contra Ardan.
      if (!proj || (proj.dead && !(proj.owner !== 'player' && (proj.solidHit || proj.hitPlayer)))) continue;
      if (proj.owner === 'player') {
        for (const enemy of gm.enemies || []) {
          if (!enemy || enemy.dead || proj.hitEnemies.has(enemy)) continue;
          if (proj.x < enemy.x + enemy.w && proj.x + proj.w > enemy.x && proj.y < enemy.y + enemy.h && proj.y + proj.h > enemy.y) {
            enemy.hurt(proj.damage, gm.player.facing);
            if (proj.windPush) {
              enemy.vx += proj.facing * proj.windPush;
              enemy.stunTimer = Math.max(enemy.stunTimer || 0, proj.windStun || 0);
            }
            gm.player.registerHealHit();
            proj.hitEnemies.add(enemy);
            gm.totalDamageDealt += proj.damage;
            if (enemy.dead) gm.kills += 1;
            if (!proj.piercing) proj.dead = true;
            break;
          }
        }
        continue;
      }
      const pb = gm.player.bounds();
      if (proj.hitPlayer || (pb.x < proj.x + proj.w && pb.x + pb.w > proj.x && pb.y < proj.y + proj.h && pb.y + pb.h > proj.y)) {
        if (gm.player.isVulnerable && gm.player.isVulnerable()) {
          const dir = proj.x + proj.w / 2 > gm.player.x + gm.player.w / 2 ? 1 : -1;
          if (gm.player.hurt) {
            if (gm.player.hurt(proj.damage || 1, dir * 100)) {
              try { audio.play('hurt'); } catch(e) {}
              camera.shake(5, 0.16);
              proj.dead = true;
              if (gm.player.hp <= 0) {
                gm.state = 'gameover';
                try { audio.play('hurt'); } catch(e) {}
                if (screens.showGameOver) screens.showGameOver(gm);
              }
            } else {
              proj.dead = true;
            }
          }
        }
        proj.dead = true;
      }
    }
  }

  if (gm.enemies) {
    for (let i = 0; i < gm.enemies.length; i++) {
      const enemy = gm.enemies[i];
      if (!enemy || enemy.dead) continue;
      const pb = gm.player.bounds();
      const hitbox = enemy.getHitbox?.();
      const bounds = hitbox || enemy.bounds();
      const overlap = pb.x < bounds.x + bounds.w && pb.x + pb.w > bounds.x && pb.y < bounds.y + bounds.h && pb.y + pb.h > bounds.y;
      const attacking = enemy.attackTimer > 0 || enemy.chargeState === 'dash' || enemy.contactDamageAlways;
      if (attacking && overlap) {
        if (gm.player.isVulnerable && gm.player.isVulnerable()) {
          const dir = enemy.x + enemy.w / 2 > gm.player.x + gm.player.w / 2 ? 1 : -1;
          if (gm.player.hurt) {
            const flyerContact = enemy.enemyType === 'flyer';
            if (gm.player.hurt(enemy.damage || 1, flyerContact ? 0 : dir * 120, flyerContact
              ? { knockbackY: 0, invulnerability: 0.85 }
              : undefined)) {
              try { audio.play('hurt'); } catch(e) {}
              camera.shake(6, 0.18);
              if (gm.player.hp <= 0) {
                gm.state = 'gameover';
                try { audio.play('hurt'); } catch(e) {}
                if (screens.showGameOver) screens.showGameOver(gm);
              }
            }
          }
        }
      }
    }
  }
}

function loop(now) {
  if (input.wasPressed('inventory')) {
    if (gm.state === 'playing') openFistInventory();
    else if (gm.state === 'inventory') closeFistInventory();
  }
  const frame = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (gm.state === 'playing') acc += frame;
  else acc = 0;

  if (gm.state === 'playing') {
    while (acc >= dtFixed) {
      if (gm.player && gm.solids) {
        gm.player.update(input, dtFixed, gm.solids, (_rect, damage) => {
          try { audio.play('slash'); } catch(e) {}
          const activeFists = gm.player.getActiveFists();
          const waterFist = gm.player.attackMode === 'basic' ? null : activeFists.find((fist) => fist.element === 'agua');
          if (waterFist) {
            const player = gm.player;
            const lookUp = player.attackDirection === 'up';
            const spread = activeFists.length > 1 ? [-0.16, 0, 0.16] : [0];
            for (const angle of spread) {
              const shot = new Projectile(player.x + player.w / 2, player.y + player.h / 2,
                lookUp ? Math.sin(angle) * 180 : player.facing * 420,
                lookUp ? -420 : Math.sin(angle) * 180,
                damage * (activeFists.length > 1 ? 0.72 : 1), 1.6);
              shot.owner = 'player';
              shot.w = 9; shot.h = 6; shot.color = waterFist.color;
              shot.piercing = true;
              gm.projectiles.push(shot);
            }
          }
          const airFist = gm.player.attackMode === 'basic' ? null : activeFists.find((fist) => fist.element === 'aire');
          if (airFist) {
            const player = gm.player;
            const blade = new Projectile(player.x + player.w / 2 + player.facing * 9, player.y + player.h / 2 - 3,
              player.facing * 520, 0, damage * 0.65, 0.62);
            blade.owner = 'player';
            blade.w = 24; blade.h = 14; blade.color = airFist.color;
            blade.piercing = true; blade.windBlade = true;
            blade.windPush = 95; blade.windStun = 0.32;
            gm.projectiles.push(blade);
          }
          const voidFist = gm.player.attackMode === 'basic' ? null : activeFists.find((fist) => fist.element === 'vacío');
          if (voidFist) {
            const player = gm.player;
            const shade = new Projectile(player.x + player.w / 2 + player.facing * 8, player.y + player.h / 2 - 5,
              player.facing * 440, 0, damage * 0.72, 0.48);
            shade.owner = 'player';
            shade.w = 20; shade.h = 18; shade.color = voidFist.color;
            shade.piercing = true; shade.voidBlade = true; shade.windPush = 35; shade.windStun = 0.12;
            gm.projectiles.push(shade);
          }
        }, (power) => gm.useFistAbility(power), () => {
          try { audio.play('heal'); } catch(e) {}
          camera.shake(1.4, 0.14);
          vibrate(12);
        });
        const flightActive = gm.player.isFlying;
        if (flightActive) {
          flightSoundTimer -= dtFixed;
          if (flightSoundTimer <= 0) {
            try { audio.play('flight'); } catch(e) {}
            flightSoundTimer = 0.32;
          }
          if (!flightWasActive) vibrate(10);
        } else {
          flightSoundTimer = 0;
        }
        flightWasActive = flightActive;
      }
      const enemyShotsBefore = gm.projectiles?.filter((projectile) => projectile.owner !== 'player').length || 0;
      if (gm.update) gm.update(dtFixed);
      const enemyShotsAfter = gm.projectiles?.filter((projectile) => projectile.owner !== 'player').length || 0;
      if (enemyShotsAfter > enemyShotsBefore) {
        try { audio.play('enemyShot'); } catch(e) {}
      }
      if (gm.player && gm.player.hp <= 0 && gm.state === 'playing') {
        gm.state = 'gameover';
        screens.showGameOver(gm);
      }
      handleCombat();
      tryDoorTransition();
      acc -= dtFixed;
    }
    if (gm.currentRoom && gm.player) {
      camera.follow(gm.player, { width: gm.currentRoom.width, height: gm.currentRoom.height });
    }
    camera.update(frame);
    if (hud.update) hud.update(gm);
    if (screens.showFistIndicator) screens.showFistIndicator(gm.player);
  } else if (gm.state === 'fistPickup') {
    if (screens.showFistPickup) screens.showFistPickup(gm.pickedFist);
  } else if (gm.state === 'itemPickup') {
    if (screens.showItemPickup) screens.showItemPickup(gm.pickedItem);
  } else if (gm.state === 'inventory') {
    hud.updateInventory(gm);
  }

  if (gm.state === 'victory') screens.showVictory(gm);

  renderer.clear(camera);
  if (gm.state === 'menu') {
    renderer.rect(0, 0, canvas.width, canvas.height, '#080808');
    renderer.text('SIXXPISTOLS', canvas.width / 2, 200, '#e6e6e6', 42, 'center');
    renderer.text('ARDAN · LOS SEIS BRAZOS ELEMENTALES', canvas.width / 2, 235, '#9f9f9f', 12, 'center');
    renderer.text('LA GUERRA DE 1878 · ENFRENTAMIENTO CONTRA MORO', canvas.width / 2, 260, '#7f7f7f', 10, 'center');
  } else {
    renderer.drawWorld(gm);
  }
  renderer.restore();

  input.endFrame();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
