import { Input } from './core/input.js';
import { AudioManager } from './core/audio.js';
import { Camera } from './core/camera.js';
import { GameManager } from './game/gameManager.js';
import { Renderer } from './render/renderer.js';
import { HUD } from './ui/hud.js';
import { Screens } from './ui/screens.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = new Input(window);
const audio = new AudioManager();
const camera = new Camera(canvas.width, canvas.height);
const gm = new GameManager();
const renderer = new Renderer(canvas);
const hud = new HUD(document.getElementById('hud'));
const screens = new Screens(document);

// Controles táctiles
const touchContainer = document.getElementById('touch-controls');
if (touchContainer) input.bindTouchControls(touchContainer);

// Estado
let last = performance.now();
let acc = 0;
const dtFixed = 1 / 60;

// UI callbacks
screens.onStart = () => {
  audio.unlock();
  audio.play('click');
  gm.startRun();
  screens.showPlaying();
  audio.play('door');
};

screens.onRetry = () => {
  audio.unlock();
  audio.play('click');
  gm.startRun();
  screens.showPlaying();
};

screens.onMenu = () => {
  audio.play('click');
  gm.state = 'menu';
  screens.showMenu();
};

screens.onResume = () => {
  audio.play('click');
  gm.state = 'playing';
  screens.hidePause();
};

screens.onUpgradePick = (idx) => {
  const opt = gm.upgradeOptions[idx];
  if (!opt) return;
  audio.play('pick');
  gm.applyUpgrade(opt);
  if (gm.pendingRoom !== null && gm.pendingRoom !== undefined) {
    const next = gm.pendingRoom;
    gm.pendingRoom = null;
    if (next === -1) {
      // victoria
      gm.roomsCleared = 3;
      gm.state = 'victory';
      audio.play('victory');
      screens.showVictory(gm);
      return;
    }
    gm.roomsCleared = next;
    gm.loadRoom(next);
    screens.showPlaying();
    return;
  }
  screens.showPlaying();
};

// Pausa
document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (gm.state === 'playing') {
      gm.state = 'paused';
      screens.showPause();
    } else if (gm.state === 'paused') {
      gm.state = 'playing';
      screens.hidePause();
    }
  }
  if (e.code === 'KeyM') {
    const muted = audio.toggleMuted();
    const btn = document.getElementById('btn-mute');
    if (btn) btn.textContent = muted ? '🔇 SILENCIADO' : '🔊 SONIDO';
  }
});

function tryDoorTransition() {
  if (gm.tryEnterDoor(gm.player) && gm.doorOpen) {
    if (gm.roomIndex === 0 || gm.roomIndex === 1) {
      // mostrar mejoras antes de cambiar
      gm.pendingRoom = gm.door.next;
      gm.generateUpgrades();
      gm.state = 'upgrade';
      audio.play('door');
      screens.showUpgrade(gm.upgradeOptions);
      return;
    }
    if (gm.roomIndex === 2) {
      // boss derrotado
      gm.roomsCleared = 3;
      gm.state = 'victory';
      audio.play('victory');
      screens.showVictory(gm);
      return;
    }
  }
}

function handleCombat() {
  // ataque jugador -> enemigos
  if (gm.player.attacking && gm.player.attackTimer > gm.player.attackDuration - 0.05) {
    const rect = gm.player.getAttackRect();
    for (let i = 0; i < gm.enemies.length; i += 1) {
      const enemy = gm.enemies[i];
      if (enemy.dead) continue;
      if (rect.x < enemy.x + enemy.w && rect.x + rect.w > enemy.x && rect.y < enemy.y + enemy.h && rect.y + rect.h > enemy.y) {
        if (!enemy._hitThisSwing) {
          enemy._hitThisSwing = true;
          enemy.hurt(gm.player.attackDamage, gm.player.facing);
          gm.totalDamageDealt += gm.player.attackDamage;
          audio.play('hit');
          camera.shake(4, 0.14);
          if (enemy.dead) {
            gm.kills += 1;
            audio.play('kill');
          }
        }
      }
    }
  } else if (!gm.player.attacking) {
    for (let i = 0; i < gm.enemies.length; i += 1) gm.enemies[i]._hitThisSwing = false;
  }

  // enemigo -> jugador
  for (let i = 0; i < gm.enemies.length; i += 1) {
    const enemy = gm.enemies[i];
    if (enemy.dead) continue;
    const pb = gm.player.bounds();
    // contacto
    if (pb.x < enemy.x + enemy.w && pb.x + pb.w > enemy.x && pb.y < enemy.y + enemy.h && pb.y + pb.h > enemy.y) {
      if (gm.player.isVulnerable()) {
        const dir = enemy.x + enemy.w / 2 > gm.player.x + gm.player.w / 2 ? 1 : -1;
        if (gm.player.hurt(enemy.damage || 1, dir * 120)) {
          audio.play('hurt');
          camera.shake(6, 0.18);
          if (gm.player.hp <= 0) {
            gm.state = 'gameover';
            audio.play('hurt');
            screens.showGameOver(gm);
          }
        }
      }
    }
    // boss hitbox
    if (enemy.enemyType === 'boss') {
      const hb = enemy.getHitbox();
      if (hb && pb.x < hb.x + hb.w && pb.x + pb.w > hb.x && pb.y < hb.y + hb.h && pb.y + pb.h > hb.y) {
        if (gm.player.isVulnerable()) {
          if (gm.player.hurt(1, gm.player.facing * -1 * 140)) {
            audio.play('hurt');
            camera.shake(8, 0.22);
            if (gm.player.hp <= 0) {
              gm.state = 'gameover';
              audio.play('hurt');
              screens.showGameOver(gm);
            }
          }
        }
      }
    }
  }
}

function loop(now) {
  const frame = (now - last) / 1000;
  last = now;
  acc += frame;

  if (gm.state === 'playing') {
    while (acc >= dtFixed) {
      gm.player.update(input, dtFixed, gm.solids, (rect, damage) => {
        // callback usado para feedback; el hitbox real se procesa en handleCombat
      });
      gm.update(dtFixed);
      handleCombat();
      tryDoorTransition();
      acc -= dtFixed;
    }
    camera.follow(gm.player, { width: 1400, height: 576 });
    camera.update(frame);
    hud.update(gm);
    screens.showBossIntro(gm.bossIntro);
  }

  renderer.clear(camera);
  if (gm.state === 'menu') {
    // fondo estático
    renderer.rect(0, 0, canvas.width, canvas.height, '#101010');
    renderer.text('SIXXPISTOLS', canvas.width / 2, 200, '#e6e6e6', 42, 'center');
    renderer.text('ROGUELIKE | HACK & SLASH | 2D SIDE-SCROLLER', canvas.width / 2, 235, '#9f9f9f', 12, 'center');
  } else {
    renderer.drawWorld(gm);
  }
  renderer.restore();

  input.endFrame();
  requestAnimationFrame(loop);
}

screens.showMenu();
requestAnimationFrame(loop);
