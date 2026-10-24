import { formatTime } from '../core/math.js';

export class Screens {
  constructor(document) {
    this.doc = document;
    this.menu = document.getElementById('menu-screen');
    this.hud = document.getElementById('hud');
    this.upgrade = document.getElementById('upgrade-screen');
    this.gameover = document.getElementById('gameover-screen');
    this.victory = document.getElementById('victory-screen');
    this.pause = document.getElementById('pause-screen');
    this.bossIntro = document.getElementById('boss-intro');
    this.touch = document.getElementById('touch-controls');

    this.upgradeCards = Array.from(document.querySelectorAll('.upgrade-card'));
    this.onUpgradePick = null;
    this.upgradeCards.forEach((card) => {
      card.addEventListener('click', () => {
        const idx = Number(card.dataset.index);
        if (this.onUpgradePick) this.onUpgradePick(idx);
      });
    });

    // botones menú
    document.getElementById('btn-start').addEventListener('click', () => this.onStart && this.onStart());
    document.getElementById('btn-instructions').addEventListener('click', () => this.showInstructions());
    document.getElementById('btn-credits').addEventListener('click', () => this.showCredits());
    document.getElementById('btn-retry').addEventListener('click', () => this.onRetry && this.onRetry());
    document.getElementById('btn-menu').addEventListener('click', () => this.onMenu && this.onMenu());
    document.getElementById('btn-victory-menu').addEventListener('click', () => this.onMenu && this.onMenu());
    document.getElementById('btn-resume').addEventListener('click', () => this.onResume && this.onResume());
  }

  showMenu() {
    this.hideAll();
    if (this.menu) this.menu.classList.remove('hidden');
    if (this.touch) this.touch.classList.add('hidden');
  }

  showPlaying() {
    this.hideAll();
    if (this.hud) this.hud.classList.remove('hidden');
    if (this.touch) this.touch.classList.remove('hidden');
  }

  showUpgrade(options) {
    this.hideAll();
    if (this.hud) this.hud.classList.remove('hidden');
    if (this.upgrade) this.upgrade.classList.remove('hidden');
    options.forEach((opt, idx) => {
      const card = this.upgradeCards[idx];
      if (!card) return;
      card.querySelector('.upgrade-card__title').textContent = opt.name;
      card.querySelector('.upgrade-card__desc').textContent = opt.desc;
    });
  }

  showGameOver(gm) {
    this.hideAll();
    if (this.gameover) this.gameover.classList.remove('hidden');
    const time = document.getElementById('go-time');
    const rooms = document.getElementById('go-rooms');
    const kills = document.getElementById('go-kills');
    const dmg = document.getElementById('go-dmg');
    if (time) time.textContent = formatTime(gm.runTime);
    if (rooms) rooms.textContent = String(gm.roomsCleared);
    if (kills) kills.textContent = String(gm.kills);
    if (dmg) dmg.textContent = String(Math.floor(gm.totalDamageDealt));
  }

  showVictory(gm) {
    this.hideAll();
    if (this.victory) this.victory.classList.remove('hidden');
    const time = document.getElementById('v-time');
    const rooms = document.getElementById('v-rooms');
    const kills = document.getElementById('v-kills');
    const dmg = document.getElementById('v-dmg');
    if (time) time.textContent = formatTime(gm.runTime);
    if (rooms) rooms.textContent = String(gm.roomsCleared);
    if (kills) kills.textContent = String(gm.kills);
    if (dmg) dmg.textContent = String(Math.floor(gm.totalDamageDealt));
  }

  showPause() {
    if (this.pause) this.pause.classList.remove('hidden');
  }

  hidePause() {
    if (this.pause) this.pause.classList.add('hidden');
  }

  showBossIntro(show) {
    if (!this.bossIntro) return;
    if (show) this.bossIntro.classList.remove('hidden');
    else this.bossIntro.classList.add('hidden');
  }

  showInstructions() {
    alert('CONTROLES\n\nMovimiento: A/D o Flechas\nSalto: W/Espacio/Flecha Arriba\nAtaque: J o X\nDash: K o Shift\nPausar: ESC o P\n\nObjetivo: Supera 3 salas. Derrota enemigos para abrir puertas. Al pasar puerta elige una mejora. Vence al jefe de la Sala 3.');
  }

  showCredits() {
    alert('SIXXPISTOLS\nProyecto Universitario - ENTREGA #4 - FINAL JUEGO\n\nInspirado en Hollow Knight (Team Cherry).\nPrototipo HTML5 Canvas - Escala de grises.\nDesarrollado con fines académicos.');
  }

  hideAll() {
    if (this.menu) this.menu.classList.add('hidden');
    if (this.hud) this.hud.classList.add('hidden');
    if (this.upgrade) this.upgrade.classList.add('hidden');
    if (this.gameover) this.gameover.classList.add('hidden');
    if (this.victory) this.victory.classList.add('hidden');
    if (this.pause) this.pause.classList.add('hidden');
    if (this.bossIntro) this.bossIntro.classList.add('hidden');
    if (this.touch) this.touch.classList.add('hidden');
  }
}
