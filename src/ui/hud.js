import { formatShortTime } from '../core/math.js';

export class HUD {
  constructor(container) {
    this.container = container;
    this.hearts = container.querySelector('[data-hearts]');
    this.timer = container.querySelector('[data-timer]');
    this.room = container.querySelector('[data-room]');
    this.kills = container.querySelector('[data-kills]');
    this.hpText = container.querySelector('[data-hp-text]');
  }

  update(gm) {
    if (!this.container) return;
    // corazones
    if (this.hearts) {
      this.hearts.innerHTML = '';
      const max = gm.player.maxHp;
      const hp = gm.player.hp;
      for (let i = 0; i < max; i += 1) {
        const span = document.createElement('span');
        span.className = `heart ${i < hp ? 'heart--full' : 'heart--empty'}`;
        span.textContent = '♥';
        this.hearts.appendChild(span);
      }
    }
    if (this.hpText) this.hpText.textContent = `${gm.player.hp} / ${gm.player.maxHp}`;
    if (this.timer) this.timer.textContent = formatShortTime(gm.roomTime);
    if (this.room) {
      const names = ['ENTRENAMIENTO', 'DESAFÍO', 'JEFE'];
      this.room.textContent = `SALA ${gm.roomIndex + 1} · ${names[gm.roomIndex] || ''}`;
    }
    if (this.kills) this.kills.textContent = `ELIMINADOS: ${gm.kills}`;
  }
}
