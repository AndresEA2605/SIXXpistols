export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  }

  clear(camera) {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    camera.apply(this.ctx);
  }

  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  strokeRect(x, y, w, h, color, width = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));
  }

  line(x1, y1, x2, y2, color, width = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(Math.round(x1), Math.round(y1));
    this.ctx.lineTo(Math.round(x2), Math.round(y2));
    this.ctx.stroke();
  }

  poly(points, color) {
    if (points.length < 3) return;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(Math.round(points[0].x), Math.round(points[0].y));
    for (let i = 1; i < points.length; i += 1) this.ctx.lineTo(Math.round(points[i].x), Math.round(points[i].y));
    this.ctx.closePath();
    this.ctx.fill();
  }

  text(text, x, y, color = '#eee', size = 12, align = 'left') {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px monospace`;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, Math.round(x), Math.round(y));
  }

  drawPlayer(player) {
    if (player.invuln > 0 && Math.floor(player.invuln * 18) % 2 === 0) return;
    const { x, y, w, h, facing } = player;

    // capa base
    this.rect(x, y + 6, w, h - 6, '#bfbfbf');
    // cabeza
    this.rect(x + 2, y, w - 4, 10, '#d9d9d9');
    // bufanda/hombros
    this.rect(x + 1, y + 8, w - 2, 4, '#8f8f8f');
    // ojos
    const ex = facing === 1 ? x + w - 5 : x + 2;
    this.rect(ex, y + 4, 2, 2, '#1a1a1a');
    // capa
    if (player.dashing) {
      this.rect(x, y + 10, w, 4, '#f5f5f5');
    }
    // espada
    if (player.attacking) {
      const rect = player.getAttackRect();
      this.rect(rect.x, rect.y, rect.w, rect.h, '#f0f0f0');
      this.rect(rect.x + (facing === 1 ? rect.w - 3 : 0), rect.y + 2, 3, rect.h - 4, '#ffffff');
    }
  }

  drawEnemy(enemy) {
    if (enemy.dead) return;
    const { x, y, w, h, hitFlash } = enemy;
    const base = hitFlash > 0 ? '#ffffff' : '#9c9c9c';
    if (enemy.enemyType === 'boss') {
      this.rect(x, y + 8, w, h - 8, base);
      this.rect(x + 4, y, w - 8, 14, hitFlash > 0 ? '#ffffff' : '#b5b5b5');
      this.rect(x + 10, y + 4, 4, 4, '#1a1a1a');
      this.rect(x + w - 14, y + 4, 4, 4, '#1a1a1a');
      if (enemy.attackTimer > 0) {
        const hb = enemy.getHitbox();
        if (hb) this.rect(hb.x, hb.y, hb.w, hb.h, '#e6e6e6');
      }
      return;
    }
    if (enemy.enemyType === 'charger') {
      this.rect(x, y + 6, w, h - 6, base);
      this.rect(x + 2, y, w - 4, 10, hitFlash > 0 ? '#ffffff' : '#c2c2c2');
      this.rect(x + (enemy.facing === 1 ? w - 5 : 2), y + 4, 3, 2, '#1a1a1a');
      return;
    }
    this.rect(x, y + 5, w, h - 5, base);
    this.rect(x + 2, y, w - 4, 9, hitFlash > 0 ? '#ffffff' : '#bcbcbc');
    this.rect(x + (enemy.facing === 1 ? w - 4 : 2), y + 4, 2, 2, '#1a1a1a');
  }

  drawWorld(gm) {
    // fondo degradado
    const grad = this.ctx.createLinearGradient(0, 0, 0, gm.solids.length ? 576 : 576);
    grad.addColorStop(0, '#151515');
    grad.addColorStop(1, '#101010');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, 1400, 576);

    // decorado estático geométrico
    this.ctx.fillStyle = '#1d1d1d';
    for (let i = 0; i < 6; i += 1) {
      this.ctx.fillRect(40 + i * 180, 80 + (i % 2) * 40, 120, 260);
    }

    // sólidos
    for (let i = 0; i < gm.solids.length; i += 1) {
      const s = gm.solids[i];
      this.rect(s.x, s.y, s.w, s.h, '#6f6f6f');
      this.rect(s.x, s.y, s.w, 2, '#9f9f9f');
    }

    // puerta
    if (gm.door) {
      const d = gm.door;
      const color = gm.doorOpen ? '#c9c9c9' : '#4a4a4a';
      this.rect(d.x, d.y, d.w, d.h, color);
      this.rect(d.x + 4, d.y + 6, d.w - 8, d.h - 10, gm.doorOpen ? '#e6e6e6' : '#303030');
      if (gm.doorOpen) {
        this.text('>', d.x + d.w / 2, d.y + d.h / 2 + 3, '#1a1a1a', 14, 'center');
      }
    }

    // enemigos
    for (let i = 0; i < gm.enemies.length; i += 1) this.drawEnemy(gm.enemies[i]);
    // jugador
    this.drawPlayer(gm.player);
  }

  restore() {
    this.ctx.restore();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
