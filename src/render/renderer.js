import { WAR_RELIC_BY_ID } from '../game/rooms/warLore.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  }

  clear(camera) {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = '#080808';
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

  text(text, x, y, color = '#eee', size = 12, align = 'left') {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px JetBrains Mono, monospace`;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, Math.round(x), Math.round(y));
  }

  drawBackground(gm) {
    const ctx = this.ctx;
    const room = gm.currentRoom;
    const w = room ? room.width : 1024;
    const h = room ? room.height : 576;
    const time = gm.runTime || 0;
    const themes = [
      { sky: '#11101a', horizon: '#242235', distant: '#191827', near: '#0b0a12', glow: '#7964a9' },
      { sky: '#17121e', horizon: '#302239', distant: '#21182c', near: '#0d0a14', glow: '#956bb4' },
      { sky: '#10171a', horizon: '#202a31', distant: '#161d25', near: '#090d12', glow: '#6f7ca4' },
      { sky: '#14111d', horizon: '#29253a', distant: '#1b192c', near: '#0b0a13', glow: '#8572bf' },
    ];
    const sceneIndex = room?.id || 0;
    const scene = room?.location?.scene || 'square';
    const locationThemes = {
      shelter: { sky: '#10121b', horizon: '#232433', distant: '#191b28', near: '#0a0b11', glow: '#8a79b5' },
      square: { sky: '#11101a', horizon: '#28243a', distant: '#1a1828', near: '#0b0a12', glow: '#8870b9' },
      trenches: { sky: '#10151a', horizon: '#202b31', distant: '#182127', near: '#090d11', glow: '#718a92' },
      bridge: { sky: '#10141e', horizon: '#25293a', distant: '#1a2030', near: '#090c14', glow: '#8b84b5' },
      hospital: { sky: '#111820', horizon: '#26313a', distant: '#1c252d', near: '#0a0f14', glow: '#86a6b0' },
      foundry: { sky: '#17121c', horizon: '#302331', distant: '#211922', near: '#0c0a10', glow: '#a36d85' },
      mill: { sky: '#17121e', horizon: '#33273a', distant: '#241b2a', near: '#0c0911', glow: '#a57cb6' },
      flooded: { sky: '#0d1720', horizon: '#202f3b', distant: '#14232d', near: '#080e15', glow: '#6d9cb0' },
      banners: { sky: '#15111d', horizon: '#30243a', distant: '#21192c', near: '#0b0912', glow: '#aa718f' },
      cathedral: { sky: '#15101d', horizon: '#33233f', distant: '#22182e', near: '#0a0810', glow: '#a17acb' },
      buried: { sky: '#111319', horizon: '#292b34', distant: '#1b1c25', near: '#090a0e', glow: '#87849c' },
      arsenal: { sky: '#11151d', horizon: '#28303a', distant: '#19212b', near: '#090c12', glow: '#8195a6' },
      bellpit: { sky: '#130f1b', horizon: '#30213a', distant: '#1f172b', near: '#09070f', glow: '#a66ec1' },
      wall: { sky: '#12131b', horizon: '#2b2c37', distant: '#1b1d27', near: '#090a10', glow: '#8985a3' },
      battlefield: { sky: '#17121c', horizon: '#302432', distant: '#211a25', near: '#0b0910', glow: '#a179a3' },
      blackgate: { sky: '#100e18', horizon: '#281b32', distant: '#1b1426', near: '#08070d', glow: '#935faf' },
      fortress: { sky: '#110d1a', horizon: '#2d1d3a', distant: '#1c1427', near: '#08060d', glow: '#a46bd1' },
    };
    const theme = locationThemes[scene] || themes[Math.floor(sceneIndex / 3) % themes.length];

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, theme.sky);
    grad.addColorStop(0.56, theme.horizon);
    grad.addColorStop(1, '#07090d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const bloom = ctx.createRadialGradient(w * 0.56, h * 0.43, 8, w * 0.56, h * 0.43, 360);
    bloom.addColorStop(0, `${theme.glow}38`);
    bloom.addColorStop(1, `${theme.glow}00`);
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, w, h);

    // Siluetas de montañas y agujas lejanas crean profundidad sin alterar el mapa.
    ctx.fillStyle = theme.distant;
    ctx.beginPath();
    ctx.moveTo(0, h - 48);
    for (let x = 0; x <= w + 120; x += 120) {
      const peak = h * 0.34 + ((Math.floor(x / 120) * 37) % 92);
      ctx.lineTo(x + 54, peak);
      ctx.lineTo(x + 120, h - 48);
    }
    ctx.closePath();
    ctx.fill();

    // Arcos de una ciudad derruida, cada uno con un vano iluminado.
    for (let i = 0; i < 7; i += 1) {
      const x = i * 158 - 18;
      const baseY = h - 48;
      const archW = 70 + (i % 3) * 12;
      const archH = 150 + (i % 2) * 58;
      ctx.fillStyle = i % 2 ? '#10151d' : '#141720';
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, baseY - archH + 36);
      ctx.quadraticCurveTo(x + archW / 2, baseY - archH - 24, x + archW, baseY - archH + 36);
      ctx.lineTo(x + archW, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `${theme.glow}18`;
      ctx.fillRect(x + archW * 0.38, baseY - archH + 42, archW * 0.24, archH - 42);

      ctx.fillStyle = theme.near;
      ctx.fillRect(x - 8, baseY - archH + 28, 10, archH - 28);
      ctx.fillRect(x + archW - 2, baseY - archH + 28, 10, archH - 28);
      ctx.fillRect(x - 13, baseY - archH + 22, archW + 26, 9);
    }

    this.drawWarLandmark(scene, theme, w, h, time);

    // Bruma baja y motas de luz suspendidas en el aire.
    const fog = ctx.createLinearGradient(0, h - 190, 0, h - 40);
    fog.addColorStop(0, `${theme.glow}00`);
    fog.addColorStop(1, `${theme.glow}1c`);
    ctx.fillStyle = fog;
    ctx.fillRect(0, h - 190, w, 150);

    for (let i = 0; i < 28; i += 1) {
      const drift = 10 + (i % 4) * 7;
      const px = (i * 173 + time * drift) % w;
      const py = 80 + ((i * 97 + Math.sin(time * 0.6 + i) * 16) % (h - 150));
      const alpha = 0.12 + (Math.sin(time * 1.4 + i * 2) + 1) * 0.16;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = i % 5 === 0 ? '#f0ce9a' : theme.glow;
      ctx.beginPath();
      ctx.arc(px, py, i % 5 === 0 ? 2.1 : 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (room?.location?.engraving) this.text(room.location.engraving, 18, h - 62, '#c6b8d022', 8, 'left');
  }

  drawWarLandmark(scene, theme, w, h, time) {
    const ctx = this.ctx;
    const floor = h - 48;
    ctx.save();
    ctx.globalAlpha = 0.48;
    ctx.fillStyle = theme.near;
    ctx.strokeStyle = `${theme.glow}66`;
    ctx.lineWidth = 2;
    if (scene === 'trenches' || scene === 'battlefield') {
      ctx.beginPath(); ctx.moveTo(0, floor - 38); ctx.lineTo(140, floor - 58); ctx.lineTo(275, floor - 32); ctx.lineTo(410, floor - 67); ctx.lineTo(570, floor - 34); ctx.lineTo(740, floor - 60); ctx.lineTo(w, floor - 32); ctx.lineTo(w, floor); ctx.lineTo(0, floor); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 8; i += 1) {
        const x = 70 + i * 132;
        ctx.beginPath(); ctx.moveTo(x, floor - 25); ctx.lineTo(x + 3, floor - 120 - (i % 3) * 15); ctx.stroke();
        ctx.fillStyle = i % 2 ? '#352537' : '#292338';
        ctx.beginPath(); ctx.moveTo(x + 3, floor - 118 - (i % 3) * 15); ctx.lineTo(x + 30, floor - 108 - (i % 3) * 15); ctx.lineTo(x + 4, floor - 94 - (i % 3) * 15); ctx.closePath(); ctx.fill();
        ctx.fillStyle = theme.near;
      }
      if (scene === 'trenches') {
        ctx.strokeStyle = '#9d8d9e66'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, floor - 138); ctx.lineTo(w - 20, floor - 138); ctx.moveTo(20, floor - 150); ctx.lineTo(w - 20, floor - 126); ctx.stroke();
      }
    } else if (scene === 'bridge') {
      ctx.fillRect(0, floor - 90, w * 0.45, 12); ctx.fillRect(w * 0.55, floor - 90, w * 0.45, 12);
      for (const x of [60, 180, 760, 900]) {
        ctx.fillRect(x, floor - 185, 22, 95);
        ctx.beginPath(); ctx.arc(x + 11, floor - 184, 43, Math.PI, 0); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(w * 0.45, floor - 88); ctx.lineTo(w * 0.49, floor - 60); ctx.lineTo(w * 0.54, floor - 88); ctx.stroke();
    } else if (scene === 'foundry' || scene === 'mill') {
      for (let i = 0; i < 5; i += 1) {
        const x = 70 + i * 195;
        const towerH = 110 + (i % 2) * 54;
        ctx.fillRect(x, floor - towerH, 56, towerH);
        ctx.fillRect(x + 12, floor - towerH - 32, 30, 34);
        ctx.fillStyle = `${theme.glow}45`; ctx.fillRect(x + 12, floor - 30, 8, 16); ctx.fillRect(x + 35, floor - 30, 8, 16);
        ctx.fillStyle = theme.near;
        ctx.globalAlpha = 0.11;
        for (let smoke = 0; smoke < 3; smoke += 1) {
          ctx.beginPath(); ctx.arc(x + 27 + Math.sin(time + i + smoke) * 8, floor - towerH - 42 - smoke * 18, 10 + smoke * 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 0.48;
      }
      if (scene === 'mill') {
        ctx.strokeStyle = `${theme.glow}88`; ctx.lineWidth = 4;
        for (const x of [260, 780]) { ctx.beginPath(); ctx.arc(x, floor - 180, 56, 0, Math.PI * 2); ctx.stroke(); for (let spoke = 0; spoke < 8; spoke += 1) { const a = spoke * Math.PI / 4; ctx.beginPath(); ctx.moveTo(x, floor - 180); ctx.lineTo(x + Math.cos(a) * 54, floor - 180 + Math.sin(a) * 54); ctx.stroke(); } }
      }
    } else if (scene === 'hospital') {
      ctx.fillRect(95, floor - 192, 180, 144); ctx.fillRect(750, floor - 224, 180, 176);
      ctx.fillStyle = '#a9bac344';
      for (const x of [125, 175, 215, 780, 830, 880]) ctx.fillRect(x, floor - 152, 20, 42);
      ctx.fillStyle = '#b6c2c544'; ctx.fillRect(500, floor - 230, 12, 70); ctx.fillRect(473, floor - 207, 66, 14);
    } else if (scene === 'flooded') {
      ctx.fillStyle = '#152734aa'; ctx.fillRect(0, floor - 40, w, 40);
      ctx.strokeStyle = `${theme.glow}55`; ctx.lineWidth = 1;
      for (let y = floor - 34; y < floor; y += 9) { ctx.beginPath(); ctx.moveTo(0, y); ctx.quadraticCurveTo(w * 0.5, y + Math.sin(time * 2 + y) * 4, w, y); ctx.stroke(); }
      for (const x of [110, 315, 710, 900]) { ctx.fillStyle = theme.near; ctx.fillRect(x, floor - 175, 14, 135); ctx.fillRect(x - 25, floor - 178, 64, 9); }
    } else if (scene === 'banners') {
      for (let i = 0; i < 7; i += 1) {
        const x = 35 + i * 150;
        ctx.fillRect(x, floor - 260, 3, 212);
        ctx.fillStyle = i % 2 ? '#673b59' : '#3e3456';
        ctx.beginPath(); ctx.moveTo(x + 3, floor - 254); ctx.lineTo(x + 54, floor - 240); ctx.lineTo(x + 4, floor - 205); ctx.lineTo(x + 22, floor - 223); ctx.closePath(); ctx.fill();
        ctx.fillStyle = theme.near;
      }
    } else if (scene === 'cathedral' || scene === 'bellpit') {
      for (let i = 0; i < 5; i += 1) {
        const x = 70 + i * 210;
        ctx.beginPath(); ctx.moveTo(x, floor); ctx.lineTo(x, floor - 220); ctx.lineTo(x + 45, floor - 292); ctx.lineTo(x + 90, floor - 220); ctx.lineTo(x + 90, floor); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `${theme.glow}77`; ctx.beginPath(); ctx.arc(x + 45, floor - 178, 22, Math.PI, 0); ctx.lineTo(x + 67, floor - 110); ctx.lineTo(x + 23, floor - 110); ctx.closePath(); ctx.stroke();
      }
      ctx.strokeStyle = '#c2a6ce77'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w / 2, floor - 245); ctx.lineTo(w / 2, floor - 165); ctx.arc(w / 2, floor - 151, 16, Math.PI, 0); ctx.stroke();
    } else if (scene === 'arsenal' || scene === 'buried') {
      for (let i = 0; i < 8; i += 1) {
        const x = 40 + i * 132;
        ctx.fillRect(x, floor - 46, 40, 34);
        ctx.fillRect(x + 8, floor - 66, 24, 20);
        if (scene === 'arsenal') { ctx.strokeStyle = '#8b91a477'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 4, floor - 42); ctx.lineTo(x + 38, floor - 84); ctx.moveTo(x + 14, floor - 40); ctx.lineTo(x + 45, floor - 77); ctx.stroke(); }
      }
    } else if (scene === 'wall' || scene === 'blackgate' || scene === 'fortress' || scene === 'shelter') {
      const towerH = scene === 'fortress' ? 330 : 245;
      ctx.fillRect(0, floor - towerH, w, towerH);
      for (let x = 0; x < w; x += 48) ctx.fillRect(x, floor - towerH - 22, 28, 24);
      ctx.fillStyle = '#09070f';
      ctx.beginPath(); ctx.moveTo(w * 0.39, floor); ctx.lineTo(w * 0.39, floor - 164); ctx.quadraticCurveTo(w / 2, floor - 250, w * 0.61, floor - 164); ctx.lineTo(w * 0.61, floor); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `${theme.glow}88`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(w * 0.39, floor); ctx.lineTo(w * 0.39, floor - 164); ctx.quadraticCurveTo(w / 2, floor - 250, w * 0.61, floor - 164); ctx.lineTo(w * 0.61, floor); ctx.stroke();
      if (scene === 'blackgate' || scene === 'fortress') { ctx.strokeStyle = '#b69ad666'; for (let i = 0; i < 9; i += 1) { const x = w * 0.41 + i * 20; ctx.beginPath(); ctx.moveTo(x, floor); ctx.lineTo(x, floor - 112); ctx.stroke(); } }
    } else {
      ctx.fillRect(0, floor - 72, w, 72);
      for (const x of [130, 330, 680, 875]) { ctx.fillRect(x, floor - 210, 44, 138); ctx.fillRect(x - 10, floor - 220, 64, 12); }
    }
    ctx.restore();
  }

  drawPlayer(player, time = 0) {
    const { x, y, w, h, facing } = player;
    const fist = player.getCurrentFist?.();
    const activeFists = player.getActiveFists?.() || (fist ? [fist] : []);
    const flightFist = activeFists.find((arm) => arm.ability.type === 'flight');
    const color = fist?.color || '#b8b7c4';
    const collected = player.fistManager?.collected || [];
    const cosmetics = new Set(player.equippedWarCosmetics || []);
    const ctx = this.ctx;
    const cx = x + w / 2;
    const phase = (player.animTimer || time) * (player.anim === 'run' ? 13 : 6);
    const running = player.anim === 'run' && player.onGround;
    const flying = player.isFlying && !!flightFist;
    const airborne = !player.onGround && !player.dashing;
    const bob = running ? Math.abs(Math.sin(phase)) * -2.4 : player.onGround ? Math.sin(time * 2.2) * 0.7 : 0;
    const attackProgress = player.attacking ? Math.max(0, Math.min(1, 1 - player.attackTimer / player.attackDuration)) : 0;
    const basicAttackVisual = player.attacking && player.attackMode === 'basic';
    const attackAnimated = player.attacking && !basicAttackVisual;
    const lookUp = player.aimingUp || (attackAnimated && player.attackDirection === 'up');
    const attackLean = attackProgress < 0.32 ? -2.2 : attackProgress < 0.56 ? 3.2 : 0.7;
    const lean = player.dashing ? facing * 4 : flying ? facing * 1.2 : running ? facing * 1.8 : attackAnimated && !lookUp ? facing * attackLean : 0;
    const top = y - 4 + bob + (airborne ? 2 : 0);
    const bottom = y + h + bob;
    const cy = top + 20;

    // Resplandor tenue: perfila la silueta sin convertirla en una esfera luminosa.
    ctx.save();
    ctx.globalAlpha = player.invuln > 0 ? 0.28 : fist ? 0.13 + Math.sin(time * 4) * 0.035 : 0.035;
    ctx.strokeStyle = player.invuln > 0 ? '#c4a7ed' : color; ctx.lineWidth = player.invuln > 0 ? 1.5 : 1;
    ctx.shadowColor = player.invuln > 0 ? '#9d78d1' : color; ctx.shadowBlur = player.invuln > 0 ? 15 : 10;
    ctx.beginPath(); ctx.ellipse(cx, cy, 15, 21, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    if (player.healFlashTimer > 0) {
      ctx.save();
      const fade = Math.min(1, player.healFlashTimer / 0.55);
      ctx.globalAlpha = fade * 0.8;
      ctx.strokeStyle = '#a9e7b2'; ctx.lineWidth = 2;
      ctx.shadowColor = '#7edb9b'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.ellipse(cx, cy, 18 + (1 - fade) * 9, 24 + (1 - fade) * 9, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // El puño ígneo despliega dos llamas ascendentes alrededor del cuerpo mientras Ardan vuela.
    if (flying && flightFist?.element === 'fuego') {
      ctx.save();
      const flutter = Math.sin(time * 22) * 3;
      const fuelRatio = Math.max(0, Math.min(1, player.flightFuel / Math.max(0.1, player.flightCapacity)));
      ctx.globalAlpha = 0.48 + fuelRatio * 0.32;
      ctx.strokeStyle = '#f18a67'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.shadowColor = '#a763df'; ctx.shadowBlur = 12 + (player.flightLevel || 0) * 3;
      for (const side of [-1, 1]) {
        const wingX = cx + side * 10;
        ctx.beginPath(); ctx.moveTo(wingX, y + h - 3);
        ctx.bezierCurveTo(wingX + side * (15 + (player.flightLevel || 0) * 3), y + h - 9, wingX + side * (13 + flutter), y + 8, wingX + side * 4, y - 7);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Capa, coraza, piernas y casco tienen silueta articulada y oscilan con la zancada.
    ctx.save(); ctx.translate(cx + lean, 0);
    const flightLevel = player.flightLevel || 0;
    const armorLevel = player.armorLevel || 0;
    const powerLevel = player.powerLevel || 0;
    const speedLevel = player.speedLevel || 0;
    if (flightLevel > 0) {
      ctx.fillStyle = '#332943'; ctx.strokeStyle = '#a98bd4'; ctx.lineWidth = 1;
      for (const side of [-1, 1]) {
        ctx.fillRect(side * 7 - 2, top + 17, 4, 8);
        ctx.strokeRect(side * 7 - 2, top + 17, 4, 8);
        ctx.fillStyle = '#bd9df0'; ctx.fillRect(side * 7 - 1, top + 19, 2, 4); ctx.fillStyle = '#332943';
      }
    }
    ctx.fillStyle = '#17151a'; ctx.strokeStyle = '#817879'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-7, top + 11); ctx.lineTo(7, top + 11);
    ctx.lineTo(11 + Math.sin(phase) * (running ? 3 : 1), bottom - 2);
    ctx.lineTo(2, bottom - 5); ctx.lineTo(-10 + Math.cos(phase) * (running ? 3 : 0), bottom + 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if (cosmetics.has('mourning_cloak') || cosmetics.has('standard_ribbon')) {
      const cloth = cosmetics.has('mourning_cloak') ? '#372d46' : '#56283d';
      const flutter = Math.sin(phase * 0.55) * (running ? 3 : 1.2);
      ctx.fillStyle = cloth; ctx.strokeStyle = cosmetics.has('mourning_cloak') ? '#85749d' : '#b05b75'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, top + 12); ctx.lineTo(-12, top + 17); ctx.lineTo(-13 - flutter, bottom - 2);
      ctx.lineTo(-5, bottom - 8); ctx.lineTo(1, top + 22); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (cosmetics.has('mourning_cloak')) {
        ctx.strokeStyle = '#9f8ab2'; ctx.beginPath(); ctx.moveTo(-10, top + 20); ctx.lineTo(-9 - flutter, bottom - 9); ctx.stroke();
      }
    }
    const stride = running ? Math.sin(phase) * 4 : flying ? Math.sin(time * 11) * 3 : airborne ? 2 : 0;
    ctx.lineCap = 'square'; ctx.lineWidth = 4; ctx.strokeStyle = '#35313a';
    ctx.beginPath(); ctx.moveTo(-3, bottom - 10); ctx.lineTo(-4 - stride, bottom - 3);
    ctx.moveTo(3, bottom - 10); ctx.lineTo(4 + stride, bottom - (airborne ? 4 : 1)); ctx.stroke();
    ctx.fillStyle = '#aaa5a4'; ctx.fillRect(-7 - stride, bottom - 4, 6, 3); ctx.fillRect(2 + stride, bottom - (airborne ? 5 : 2), 7, 3);
    ctx.fillStyle = '#625d63'; ctx.beginPath();
    ctx.moveTo(-7, top + 10); ctx.lineTo(7, top + 10); ctx.lineTo(6, top + 24); ctx.lineTo(-5, top + 24); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d0c4aa'; ctx.fillRect(-1, top + 12, 2, 9);
    ctx.fillStyle = '#28242b'; ctx.fillRect(-7, top + 22, 14, 3);
    ctx.shadowColor = color; ctx.shadowBlur = fist ? 8 : 0; ctx.fillStyle = color; ctx.fillRect(-2, top + 22, 4, 3); ctx.shadowBlur = 0;
    const focusLevel = player.focusLevel || 0;
    if (focusLevel > 0) {
      ctx.save();
      ctx.shadowColor = '#c6a6ed'; ctx.shadowBlur = 5 + focusLevel * 2;
      ctx.fillStyle = '#c6a6ed';
      ctx.beginPath(); ctx.moveTo(0, top + 12); ctx.lineTo(3, top + 15); ctx.lineTo(0, top + 18); ctx.lineTo(-3, top + 15); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    for (let plate = 0; plate < Math.min(armorLevel, 4); plate += 1) {
      ctx.fillStyle = plate % 2 ? '#817a91' : '#a19aab';
      ctx.fillRect(-6 + plate * 3, top + 17, 2, 2);
    }
    if (cosmetics.has('city_medal')) {
      ctx.save(); ctx.shadowColor = '#d6b76f'; ctx.shadowBlur = 7;
      ctx.strokeStyle = '#dbc17d'; ctx.fillStyle = '#756044'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, top + 13); ctx.lineTo(4, top + 17); ctx.lineTo(0, top + 21); ctx.lineTo(-4, top + 17); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f1d695'; ctx.beginPath(); ctx.arc(0, top + 17, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    if (cosmetics.has('moro_insignia')) {
      ctx.fillStyle = '#282330'; ctx.strokeStyle = '#a59bb3'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-7, top + 11); ctx.lineTo(-12, top + 16); ctx.lineTo(-6, top + 19); ctx.lineTo(-2, top + 14); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#d5c8e2'; ctx.beginPath(); ctx.moveTo(-9, top + 13); ctx.lineTo(-5, top + 17); ctx.moveTo(-5, top + 13); ctx.lineTo(-9, top + 17); ctx.stroke();
    }
    if (flightLevel > 0) {
      ctx.fillStyle = '#342943'; ctx.strokeStyle = '#a98bd4'; ctx.lineWidth = 0.8;
      const nozzleWidth = 3 + Math.min(flightLevel, 3);
      for (const side of [-1, 1]) {
        ctx.fillRect(side * 8 - nozzleWidth / 2, top + 20, nozzleWidth, 6);
        ctx.strokeRect(side * 8 - nozzleWidth / 2, top + 20, nozzleWidth, 6);
        ctx.fillStyle = '#c8abf0'; ctx.fillRect(side * 8 - 0.5, top + 21, 1, 3); ctx.fillStyle = '#342943';
      }
    }
    if (powerLevel > 0) {
      ctx.strokeStyle = '#d2b9f3'; ctx.lineWidth = 0.8; ctx.shadowColor = '#a983db'; ctx.shadowBlur = 2 + powerLevel * 2;
      ctx.beginPath(); ctx.moveTo(-3, top + 14); ctx.lineTo(0, top + 12); ctx.lineTo(3, top + 14); ctx.stroke();
      ctx.fillStyle = '#c5a7eb';
      for (let rune = 0; rune < Math.min(powerLevel, 4); rune += 1) ctx.fillRect(-5 + rune * 3, top + 17, 1.5, 2);
      ctx.shadowBlur = 0;
    }
    if (running && speedLevel > 0) {
      ctx.strokeStyle = '#aab8e3'; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-9 - speedLevel * 2, bottom - 3); ctx.lineTo(-5, bottom - 3); ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#b8b0a5'; ctx.strokeStyle = '#e3d7c7'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-6, top + 11); ctx.lineTo(-5, top + 3); ctx.lineTo(0, top); ctx.lineTo(5, top + 3); ctx.lineTo(6, top + 11); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#18171c'; ctx.fillRect(-4, top + (lookUp ? 4 : 6), 8, 3);
    ctx.shadowColor = color; ctx.shadowBlur = 9; ctx.fillStyle = color; ctx.fillRect(facing > 0 ? -1 : -3, top + (lookUp ? 5 : 7), 4, 1.5); ctx.shadowBlur = 0;
    ctx.fillStyle = '#ded4c5'; ctx.beginPath(); ctx.moveTo(-4, top + 3); ctx.lineTo(-8, top - 2); ctx.lineTo(-6, top + 7); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, top + 3); ctx.lineTo(8, top - 2); ctx.lineTo(6, top + 7); ctx.closePath(); ctx.fill();
    if (cosmetics.has('bell_charm')) {
      ctx.save(); ctx.shadowColor = '#9dd4da'; ctx.shadowBlur = 6;
      ctx.fillStyle = '#9fc5c4'; ctx.strokeStyle = '#d0e2d4'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(0, top - 1); ctx.lineTo(2, top + 2); ctx.lineTo(2, top + 5); ctx.lineTo(-2, top + 5); ctx.lineTo(-2, top + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, top + 6, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    const relicPaint = [
      ['red_sash', '#a74661'], ['blue_scarf', '#6f9eb4'], ['ash_hood', '#91839f'],
      ['iron_pauldron', '#8691ad'], ['cinder_crown', '#bd806b'], ['moro_halfmask', '#9385a7'],
      ['bellkeeper_chain', '#a9a2be'], ['field_medic_badge', '#8eaa91'], ['blackgate_feather', '#8e77b4'],
      ['sixfold_charm', '#c4a1e6'], ['wall_knot', '#8e758a'],
    ].filter(([id]) => cosmetics.has(id));
    for (const [id, tint] of relicPaint) {
      ctx.save(); ctx.strokeStyle = tint; ctx.fillStyle = tint; ctx.lineWidth = 1.4;
      ctx.shadowColor = tint; ctx.shadowBlur = id === 'sixfold_charm' ? 8 : 3;
      if (id === 'red_sash' || id === 'blue_scarf') {
        ctx.beginPath(); ctx.moveTo(-4, top + 14); ctx.quadraticCurveTo(-11, top + 19, -8, top + 28); ctx.lineTo(-4, top + 24); ctx.stroke();
      } else if (id === 'ash_hood') {
        ctx.beginPath(); ctx.moveTo(-7, top + 9); ctx.quadraticCurveTo(-8, top - 5, 0, top - 4); ctx.quadraticCurveTo(8, top - 5, 7, top + 9); ctx.stroke();
      } else if (id === 'iron_pauldron') {
        ctx.beginPath(); ctx.moveTo(-7, top + 12); ctx.lineTo(-12, top + 14); ctx.lineTo(-10, top + 20); ctx.lineTo(-5, top + 18); ctx.closePath(); ctx.fill();
      } else if (id === 'cinder_crown' || id === 'blackgate_feather') {
        ctx.beginPath(); ctx.moveTo(-3, top + 1); ctx.lineTo(-5, top - 7); ctx.lineTo(0, top - 3); ctx.lineTo(5, top - 8); ctx.lineTo(3, top + 1); ctx.stroke();
      } else if (id === 'moro_halfmask') {
        ctx.fillRect(-5, top + 5, 10, 4); ctx.fillStyle = '#18171c'; ctx.fillRect(-1, top + 6, 2, 1);
      } else if (id === 'bellkeeper_chain' || id === 'wall_knot') {
        ctx.beginPath(); ctx.arc(0, top + 17, 3, 0, Math.PI * 2); ctx.stroke();
      } else if (id === 'field_medic_badge') {
        ctx.fillRect(-1, top + 14, 2, 7); ctx.fillRect(-3.5, top + 16.5, 7, 2);
      } else {
        ctx.beginPath(); ctx.moveTo(0, top + 12); ctx.lineTo(4, top + 17); ctx.lineTo(0, top + 22); ctx.lineTo(-4, top + 17); ctx.closePath(); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    // Los brazos nacen del hombro. El activo acompaña la pose y no orbita como un objeto suelto.
    collected.forEach((arm, index) => {
      const active = player.fistManager?.isEquipped(arm.id) || arm.id === fist?.id;
      const side = index % 2 === 0 ? 1 : -1;
      const sx = cx + lean + side * 5;
      const sy = top + 13 + Math.floor(index / 2) * 3;
      let angle = side * 0.65 + Math.sin(phase + index * 1.8) * (running ? 0.32 : 0.08);
      let reach = 12 + Math.min(8, (player.reachLevel || 0) * 1.5);
      if (active && player.aimingUp && !player.attacking) { angle = -Math.PI / 2; reach = 17; }
      else if (active && player.dashing) { angle = facing > 0 ? 0.08 : Math.PI - 0.08; reach = 16; }
      const restHx = sx + Math.cos(angle) * reach;
      const restHy = sy + Math.sin(angle) * reach;
      let elbowX = sx + Math.cos(angle * 0.72) * 7;
      let elbowY = sy + Math.sin(angle * 0.72) * 7;
      let hx = restHx;
      let hy = restHy;
      if (active && attackAnimated) {
        const p = attackProgress;
        if (player.attackDirection === 'up') {
          const lift = Math.max(0, Math.min(1, (p - 0.3) / 0.3));
          elbowX = sx + facing * 2;
          elbowY = sy - 4 - lift * 5;
          hx = sx + facing * 3;
          hy = sy - 8 - lift * 19;
        } else if (p < 0.32) {
          const t = p / 0.32;
          const ease = t * t;
          elbowX = sx - facing * (2 + ease * 3);
          elbowY = sy + 4 + ease * 3;
          hx = restHx + (sx - facing * 9 - restHx) * ease;
          hy = restHy + (sy + 8 - restHy) * ease;
        } else if (p < 0.56) {
          const t = (p - 0.32) / 0.24;
          const ease = 1 - Math.pow(1 - t, 3);
          elbowX = sx + facing * (2 + ease * 5);
          elbowY = sy + 7 - ease * 3;
          hx = sx + facing * (-9 + ease * 39);
          hy = sy + 8 - Math.sin(ease * Math.PI) * 4;
        } else if (p < 0.74) {
          const t = (p - 0.56) / 0.18;
          elbowX = sx + facing * 7;
          elbowY = sy + 4 + t * 2;
          hx = sx + facing * (30 - t * 3);
          hy = sy + 4 + t * 4;
        } else {
          const t = (p - 0.74) / 0.26;
          const ease = t * t * (3 - 2 * t);
          elbowX = sx + facing * (7 * (1 - ease) + Math.cos(angle * 0.72) * 7 * ease);
          elbowY = sy + 6 * (1 - ease) + Math.sin(angle * 0.72) * 7 * ease;
          hx = sx + facing * 27 * (1 - ease) + restHx * ease;
          hy = sy + 8 * (1 - ease) + restHy * ease;
        }
      } else if (active && basicAttackVisual && player.attackDirection !== 'up') {
        const p = attackProgress;
        if (p < 0.28) {
          const pull = p / 0.28;
          hx = restHx - facing * pull * 4;
          hy = restHy + pull * 2;
          elbowX = sx - facing * pull * 2;
          elbowY = sy + 2 + pull * 2;
        } else if (p < 0.58) {
          const punch = (p - 0.28) / 0.3;
          const ease = 1 - Math.pow(1 - punch, 3);
          hx = sx + facing * (10 + ease * 19);
          hy = sy + 3 - Math.sin(ease * Math.PI) * 2;
          elbowX = sx + facing * (3 + ease * 5);
          elbowY = sy + 4 - ease * 2;
        } else {
          const recover = Math.min(1, (p - 0.58) / 0.24);
          hx = sx + facing * (29 * (1 - recover) + (restHx - sx) * recover);
          hy = sy + 3 * (1 - recover) + (restHy - sy) * recover;
          elbowX = sx + facing * (8 * (1 - recover) + (Math.cos(angle * 0.72) * 7) * recover);
          elbowY = sy + 2 * (1 - recover) + Math.sin(angle * 0.72) * 7 * recover;
        }
      }
      ctx.save(); ctx.globalAlpha = active ? 1 : 0.48; ctx.lineCap = 'round';
      ctx.strokeStyle = '#211e25'; ctx.lineWidth = active ? 5 : 3;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(elbowX, elbowY); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = active ? arm.color : '#918987'; ctx.lineWidth = active ? 2.6 : 1.5;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(elbowX, elbowY); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = active ? '#403746' : '#302c31';
      ctx.beginPath(); ctx.arc(elbowX, elbowY, active ? 2.7 : 2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = arm.color; ctx.shadowBlur = active ? 14 : 5;
      ctx.fillStyle = '#28242c'; ctx.strokeStyle = arm.color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(hx, hy, active ? 4.4 : 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = arm.color; ctx.beginPath(); ctx.arc(hx, hy, 1.7, 0, Math.PI * 2); ctx.fill();
      if (active) this.drawElementMark(arm, hx, hy, time);
      ctx.restore();
    });

    // Con un brazo equipado, el ataque usa su efecto elemental y no el barrido
    // genérico de un puñetazo. El golpe físico queda reservado para ir desarmado.
    if (attackAnimated && fist) {
      const progress = attackProgress;
      const swing = Math.max(0, Math.min(1, (progress - 0.28) / 0.46));
      const impact = Math.max(0, 1 - Math.abs(progress - 0.48) / 0.22);
      const attackUp = player.attackDirection === 'up';
      const reach = attackUp ? player.getAttackStats().range : 27 + Math.sin(swing * Math.PI) * 13;
      const arcY = cy + (swing - 0.42) * 8;
      ctx.save(); ctx.globalAlpha = impact * 0.88;
      ctx.globalAlpha *= 0.8; ctx.strokeStyle = fist.color; ctx.fillStyle = fist.color; ctx.lineWidth = 1.6;
      if (fist.element === 'fuego') {
        for (let i = 0; i < 3; i += 1) {
          const sx = cx + facing * (16 + i * 8);
          ctx.beginPath(); ctx.moveTo(sx, arcY + 5); ctx.quadraticCurveTo(sx + facing * 8, arcY - 13 - i * 2, sx + facing * 15, arcY - 20 + i * 5); ctx.stroke();
        }
        const attack = player.getAttackRect();
        ctx.globalAlpha *= 0.62; ctx.lineWidth = 1.8;
        for (let lane = -1; lane <= 1; lane += 1) {
          ctx.beginPath();
          for (let step = 0; step <= 12; step += 1) {
            const t = step / 12;
            const px = attackUp
              ? cx + lane * 14 + Math.sin(t * 15 - time * 22 + lane * 1.4) * (4 + t * 4)
              : cx + facing * (8 + attack.w * t);
            const py = attackUp
              ? player.y - attack.h * t
              : cy + lane * 14 + Math.sin(t * 15 - time * 22 + lane * 1.4) * (4 + t * 4);
            if (step === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      } else if (fist.element === 'agua') {
        for (let i = 0; i < 3; i += 1) {
          const dx = attackUp ? cx + (i - 1) * 6 : cx + facing * (reach * 0.45 + i * 3);
          const dy = attackUp ? cy - reach * 0.55 : arcY + (i - 1) * 7;
          ctx.beginPath(); ctx.ellipse(dx, dy, 2, 4, attackUp ? 0 : facing * 0.5, 0, Math.PI * 2); ctx.fill();
        }
      } else if (fist.element === 'tierra') {
        for (let i = 0; i < 3; i += 1) {
          const dx = attackUp ? cx + (i - 1) * 8 : cx + facing * (reach * 0.5 + i * 5);
          const dy = attackUp ? cy - reach * 0.5 : arcY;
          ctx.beginPath();
          if (attackUp) { ctx.moveTo(dx, dy + 5); ctx.lineTo(dx + 4, dy - 4); ctx.lineTo(dx + 7, dy + 5); }
          else { ctx.moveTo(dx, dy + 8); ctx.lineTo(dx + facing * 4, dy + 2 - i * 3); ctx.lineTo(dx + facing * 8, dy + 9); }
          ctx.closePath(); ctx.fill();
        }
      } else if (fist.element === 'aire') {
        for (let i = 0; i < 2; i += 1) {
          ctx.beginPath();
          if (attackUp) ctx.ellipse(cx, cy - 25, 8 + i * 5, 17 + i * 6, 0, -0.9, 0.9);
          else ctx.ellipse(cx + facing * 23, arcY, 17 + i * 6, 8 + i * 5, facing * -0.18, -0.9, 0.9);
          ctx.stroke();
        }
      } else if (fist.element === 'rayo') {
        const sparkX = attackUp ? cx : cx + facing * 30;
        const sparkY = attackUp ? top - 10 : arcY;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        if (attackUp) {
          ctx.moveTo(sparkX - 7, sparkY + 8); ctx.lineTo(sparkX - 2, sparkY + 2);
          ctx.lineTo(sparkX + 3, sparkY + 5); ctx.lineTo(sparkX + 8, sparkY - 4);
        } else {
          for (const offset of [-5, 0, 5]) {
            ctx.moveTo(sparkX - facing * 7, sparkY + offset - 2);
            ctx.lineTo(sparkX - facing * 2, sparkY + offset - 4);
            ctx.lineTo(sparkX + facing * 3, sparkY + offset);
            ctx.lineTo(sparkX + facing * 7, sparkY + offset - 3);
          }
        }
        ctx.stroke();
      } else {
        ctx.lineWidth = 4; ctx.globalAlpha *= 0.6;
        ctx.beginPath();
        if (attackUp) ctx.ellipse(cx, cy - 22, 13, 17, 0, Math.PI, Math.PI * 2);
        else ctx.arc(cx + facing * 21, arcY, 13, facing > 0 ? -1.3 : Math.PI - 1.3, facing > 0 ? 1.3 : Math.PI + 1.3);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (attackAnimated && !fist) {
      const progress = attackProgress;
      const swing = Math.max(0, Math.min(1, (progress - 0.28) / 0.46));
      const impact = Math.max(0, 1 - Math.abs(progress - 0.48) / 0.22);
      ctx.save();
      ctx.globalAlpha = impact * 0.8;
      ctx.strokeStyle = '#d8d1dc'; ctx.lineWidth = 2 + impact * 2;
      ctx.shadowColor = '#c8b9d8'; ctx.shadowBlur = 7; ctx.lineCap = 'round';
      ctx.beginPath();
      if (player.attackDirection === 'up') {
        ctx.moveTo(cx - 5, cy + 2);
        ctx.quadraticCurveTo(cx + facing * 8, cy - 14, cx + facing * 4, y - player.getAttackStats().range);
      } else {
        const reach = 18 + Math.sin(swing * Math.PI) * 9;
        const arcY = cy + (swing - 0.42) * 7;
        ctx.moveTo(cx + facing * 3, arcY + 3);
        ctx.quadraticCurveTo(cx + facing * reach * 0.65, arcY - 12, cx + facing * reach, arcY - 3);
      }
      ctx.stroke();
      ctx.restore();
    }
    if (basicAttackVisual && attackProgress > 0.12 && attackProgress < 0.82) {
      const swing = Math.max(0, Math.min(1, (attackProgress - 0.12) / 0.7));
      const fade = Math.sin(swing * Math.PI);
      const fireFist = activeFists.find((arm) => arm.element === 'fuego');
      const reach = fireFist ? player.getAttackStats().range : 31 + Math.sin(swing * Math.PI) * 9;
      const arcY = cy + (swing - 0.45) * 5;
      ctx.save();
      ctx.globalAlpha = 0.9 * fade;
      ctx.strokeStyle = fireFist?.color || '#d7c4f2'; ctx.lineWidth = fireFist ? 2 : 2.6; ctx.lineCap = 'round';
      ctx.shadowColor = fireFist?.color || '#ad83df'; ctx.shadowBlur = fireFist ? 13 : 10;
      if (fireFist) {
        for (let lane = -1; lane <= 1; lane += 1) {
          ctx.beginPath();
          for (let step = 0; step <= 12; step += 1) {
            const t = step / 12;
            const px = cx + facing * (8 + reach * t);
            const py = arcY + lane * 7 + Math.sin(t * 15 - time * 24 + lane) * (2 + t * 3);
            if (step === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(cx + facing * 8, arcY + 5);
        ctx.quadraticCurveTo(cx + facing * (reach * 0.55), arcY - 11, cx + facing * reach, arcY - 2);
        ctx.stroke();
      }
      if (swing > 0.35 && swing < 0.8) {
        const spark = Math.sin(((swing - 0.35) / 0.45) * Math.PI);
        ctx.globalAlpha = spark * 0.85;
        ctx.strokeStyle = '#f0e7ff'; ctx.lineWidth = 1.4; ctx.shadowBlur = 5;
        ctx.beginPath();
        for (const ray of [-1, 0, 1]) {
          const px = cx + facing * (reach - 3);
          const py = arcY - 2 + ray * 3;
          ctx.moveTo(px, py);
          ctx.lineTo(px + facing * (5 + Math.abs(ray) * 2), py - ray * 5 - 2);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    if (player.dashing) {
      const dashLevel = player.dashLevel || 0;
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#c4d5f2'; ctx.lineWidth = 2 + Math.min(2, dashLevel * 0.35); ctx.shadowColor = '#a9c1ef'; ctx.shadowBlur = 10 + dashLevel * 2;
      ctx.beginPath(); ctx.moveTo(cx - facing * (18 + dashLevel * 3), top + 11); ctx.lineTo(cx - facing * (33 + dashLevel * 7), top + 18); ctx.stroke();
      if (dashLevel > 1) {
        ctx.globalAlpha = 0.28;
        ctx.beginPath(); ctx.moveTo(cx - facing * 12, top + 20); ctx.lineTo(cx - facing * (25 + dashLevel * 5), top + 25); ctx.stroke();
      }
      ctx.restore();
    }
    this.drawAbilityCooldowns(player);
  }

  drawAbilityCooldowns(player) {
    const fists = player.getActiveFists?.() || [];
    if (!fists.length) return;
    const ctx = this.ctx;
    const barX = player.x + player.w + 7;
    const barY = player.y + 5 - (fists.length > 1 ? 4 : 0);
    const barW = 28;
    const barH = 4;
    ctx.save();
    fists.forEach((fist, index) => {
      const y = barY + index * 8;
      const isFlight = fist.ability.type === 'flight';
      const remaining = player.fistManager?.abilityCooldowns?.[fist.id] || 0;
      const cooldown = Math.max(0.01, fist.ability.cooldown || 1);
      const ratio = isFlight
        ? Math.max(0, Math.min(1, (player.flightFuel || 0) / Math.max(0.1, player.flightCapacity || 1)))
        : Math.max(0, Math.min(1, 1 - remaining / cooldown));
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = '#09080ed9';
      ctx.fillRect(barX - 1, y - 1, barW + 2, barH + 2);
      ctx.fillStyle = '#292432';
      ctx.fillRect(barX, y, barW, barH);
      if (ratio > 0) {
        ctx.fillStyle = fist.color;
        ctx.shadowColor = fist.color;
        ctx.shadowBlur = ratio >= 1 ? 7 : 2;
        ctx.fillRect(barX, y, Math.max(1, barW * ratio), barH);
      }
      ctx.shadowBlur = 0;
      ctx.strokeStyle = ratio >= 1 ? fist.color : '#8c8198';
      ctx.lineWidth = 0.7;
      ctx.strokeRect(barX - 1, y - 1, barW + 2, barH + 2);
    });
    ctx.restore();
  }

  drawCombatEffects(effects) {
    if (!effects?.length) return;
    const ctx = this.ctx;
    for (const fx of effects) {
      const p = Math.min(1, fx.time / fx.duration);
      const alpha = 1 - p;
      const reach = fx.range * (0.45 + p * 0.65);
      ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = fx.color; ctx.fillStyle = fx.color;
      ctx.shadowColor = fx.color; ctx.shadowBlur = 18; ctx.lineWidth = 3;
      if (fx.type === 'gust') {
        for (let i = 0; i < 4; i += 1) {
          const yy = fx.y - 20 + i * 13; ctx.beginPath();
          ctx.moveTo(fx.x, yy); ctx.quadraticCurveTo(fx.x + fx.facing * reach * 0.45, yy - 11, fx.x + fx.facing * reach, yy + 2); ctx.stroke();
        }
      } else if (fx.type === 'chain') {
        if (fx.points?.length) {
          for (let i = 0; i < fx.points.length; i += 1) {
            const point = fx.points[i];
            const pulse = 5 + Math.sin(fx.time * 38 + i * 2) * 1.5;
            ctx.beginPath(); ctx.arc(point.x, point.y, pulse + p * 2, 0, Math.PI * 2); ctx.stroke();
            for (const side of [-1, 1]) {
              const sx = point.x + side * 6;
              const sy = point.y - 2;
              ctx.beginPath(); ctx.moveTo(sx, sy + 3);
              ctx.lineTo(sx + side * 3, sy - 1); ctx.lineTo(sx + side * 5, sy + 1);
              ctx.stroke();
            }
          }
        } else {
          ctx.beginPath(); ctx.arc(fx.x, fx.y, 6 + p * 9, 0, Math.PI * 2); ctx.stroke();
          for (const angle of [-2.7, -1.9, -1.1, -0.3]) {
            const sx = fx.x + Math.cos(angle) * 5;
            const sy = fx.y + Math.sin(angle) * 5;
            ctx.beginPath(); ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(angle) * 5, sy + Math.sin(angle) * 5);
            ctx.stroke();
          }
        }
      } else if (fx.type === 'blink') {
        ctx.beginPath(); ctx.ellipse(fx.x + fx.facing * reach * 0.48, fx.y, 12 + p * 10, 27, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx.x, fx.y); ctx.lineTo(fx.x + fx.facing * reach, fx.y); ctx.stroke();
      } else if (fx.type === 'flight') {
        ctx.beginPath(); ctx.arc(fx.x, fx.y, 12 + p * 34, 0, Math.PI * 2); ctx.stroke();
        for (const side of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(fx.x + side * 6, fx.y + 9);
          ctx.quadraticCurveTo(fx.x + side * 12, fx.y - 2, fx.x + side * 7, fx.y - 15 - p * 7);
          ctx.stroke();
        }
      } else if (fx.type === 'projectileImpact') {
        const radius = 3 + p * 12;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(fx.x, fx.y, radius, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 6; i += 1) {
          const angle = (Math.PI * 2 * i) / 6 + 0.25;
          ctx.beginPath();
          ctx.moveTo(fx.x + Math.cos(angle) * radius * 0.45, fx.y + Math.sin(angle) * radius * 0.45);
          ctx.lineTo(fx.x + Math.cos(angle) * (radius + 3), fx.y + Math.sin(angle) * (radius + 3));
          ctx.stroke();
        }
      } else if (fx.type === 'summon') {
        ctx.beginPath(); ctx.moveTo(fx.x, fx.y + 20); ctx.lineTo(fx.x, fx.y - 8); ctx.moveTo(fx.x, fx.y + 5);
        ctx.lineTo(fx.x - 13, fx.y - 5); ctx.moveTo(fx.x, fx.y + 1); ctx.lineTo(fx.x + 12, fx.y - 12); ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawMinion(minion, time = 0) {
    const ctx = this.ctx;
    const bob = Math.sin(time * 8 + minion.x * 0.03) * 2;
    ctx.save();
    ctx.translate(minion.x + minion.w / 2, minion.y + minion.h / 2 + bob);
    ctx.globalAlpha = Math.min(1, minion.time / 0.6);
    ctx.shadowColor = minion.color || '#87b96a'; ctx.shadowBlur = 9;
    ctx.strokeStyle = '#5c7643'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.quadraticCurveTo(-2, 0, 0, -5); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = minion.color || '#87b96a';
    ctx.beginPath(); ctx.ellipse(-5, 1, 5, 2.5, -0.45, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -3, 5, 2.5, 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c7d68b'; ctx.beginPath(); ctx.ellipse(0, -5, 4.5, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22251d'; ctx.fillRect(-2, -6, 1, 2); ctx.fillRect(1, -6, 1, 2);
    ctx.strokeStyle = '#8e6845'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2, 7); ctx.lineTo(-5, 10); ctx.moveTo(1, 7); ctx.lineTo(4, 10); ctx.stroke();
    ctx.restore();
  }

  drawElementMark(fist, x, y, time) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    if (fist.element !== 'rayo') ctx.rotate(time * 0.7);
    ctx.strokeStyle = '#fff3d4';
    ctx.fillStyle = '#fff3d4';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (fist.element === 'fuego') {
      ctx.moveTo(0, -8); ctx.lineTo(3, -2); ctx.lineTo(1, -1); ctx.lineTo(4, 3); ctx.lineTo(0, 6); ctx.lineTo(-4, 3); ctx.lineTo(-1, -1); ctx.lineTo(-3, 1); ctx.closePath(); ctx.fill();
    } else if (fist.element === 'agua') {
      ctx.moveTo(0, -7); ctx.bezierCurveTo(2, -3, 6, 1, 5, 3); ctx.arc(0, 3, 5, 0, Math.PI); ctx.bezierCurveTo(-6, 0, -2, -4, 0, -7); ctx.fill();
    } else if (fist.element === 'tierra') {
      ctx.moveTo(-6, 3); ctx.quadraticCurveTo(-5, -5, 5, -6); ctx.quadraticCurveTo(5, 3, -6, 3); ctx.moveTo(-5, 2); ctx.lineTo(3, -4); ctx.stroke();
    } else if (fist.element === 'aire') {
      ctx.arc(-1, 0, 5, -0.8, 1.9); ctx.moveTo(-5, -5); ctx.quadraticCurveTo(2, -8, 6, -4); ctx.moveTo(0, 7); ctx.quadraticCurveTo(7, 5, 6, 1); ctx.stroke();
    } else if (fist.element === 'rayo') {
      ctx.moveTo(-5, -1); ctx.lineTo(-2, -4); ctx.lineTo(0, -1); ctx.lineTo(3, -4);
      ctx.lineTo(5, 0); ctx.lineTo(2, 3); ctx.lineTo(0, 1); ctx.lineTo(-3, 4); ctx.closePath(); ctx.fill();
    } else {
      ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.moveTo(-2, 0); ctx.lineTo(2, 0); ctx.moveTo(0, -2); ctx.lineTo(0, 2); ctx.stroke();
    }
    ctx.restore();
  }

  drawEnemy(enemy) {
    if (!enemy || enemy.dead) return;
    this.drawEnemyBody(enemy);
    if (enemy.burnTimer > 0) {
      const ctx = this.ctx;
      ctx.save(); ctx.globalAlpha = 0.35 + Math.sin(enemy.burnTimer * 18) * 0.1;
      ctx.strokeStyle = '#ef8b65'; ctx.shadowColor = '#bc69db'; ctx.shadowBlur = 10; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i += 1) {
        const px = enemy.x + 4 + i * Math.max(3, (enemy.w - 8) / 2);
        ctx.beginPath(); ctx.moveTo(px, enemy.y + enemy.h - 2);
        ctx.quadraticCurveTo(px - 4, enemy.y + enemy.h * 0.55, px + Math.sin(enemy.burnTimer * 15 + i) * 3, enemy.y + enemy.h * 0.32);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (enemy.windupTimer > 0 || enemy.chargeState === 'windup') {
      const ctx = this.ctx;
      const color = enemy.chargeState === 'windup' ? '#ff9b55' : '#ef5b64';
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin((enemy.windupTimer || 0) * 28) * 0.18;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.ellipse(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.w * 0.9, enemy.h * 0.68, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    this.drawEnemyHealthBar(enemy);
  }

  drawEnemyHealthBar(enemy) {
    if (!(enemy.maxHp > 0) || !(enemy.hp >= 0)) return;
    const boss = enemy.enemyType === 'boss';
    const width = boss ? 100 : Math.max(30, enemy.w + 10);
    const height = boss ? 6 : 4;
    const x = enemy.x + enemy.w / 2 - width / 2;
    const y = enemy.y - (boss ? 18 : 8);
    this.rect(x - 1, y - 1, width + 2, height + 2, '#d7d3d8');
    this.rect(x, y, width, height, '#321f25');
    this.rect(x, y, width * Math.max(0, Math.min(1, enemy.hp / enemy.maxHp)), height, enemy.hitFlash > 0 ? '#fff1ed' : '#e64e5c');
    if (boss) {
      this.text(enemy.displayName || 'MORO', enemy.x + enemy.w / 2, y - 3, '#f0d9d5', 9, 'center');
    }
  }

  drawEnemyBody(enemy) {
    if (enemy.dead) return;
    const { x, y, w, h, hitFlash } = enemy;
    const base = hitFlash > 0 ? '#ffffff' : '#9c9c9c';
    
    if (enemy.enemyType === 'boss') {
      const ctx = this.ctx;
      const moro = enemy.displayName === 'MORO, EL DESTRUCTOR' || !enemy.guardianRank;
      const armor = hitFlash > 0 ? '#fff' : moro ? '#332b42' : '#403747';
      const metal = hitFlash > 0 ? '#fff' : moro ? '#a889bd' : '#b39a83';
      const glow = moro ? '#d675b6' : '#d6a76e';
      const facing = enemy.facing || 1;
      const phase = enemy.phase || 1;
      ctx.save();
      ctx.shadowColor = glow; ctx.shadowBlur = phase === 2 ? 16 : 7;
      ctx.fillStyle = moro ? '#19151f' : '#211c24'; ctx.strokeStyle = metal; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + w * .25, y + h * .33); ctx.lineTo(x - 7, y + h - 1); ctx.lineTo(x + w * .46, y + h * .79); ctx.lineTo(x + w * .76, y + h); ctx.lineTo(x + w * .77, y + h * .32); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = armor; ctx.strokeStyle = metal;
      ctx.beginPath(); ctx.moveTo(x + w * .27, y + h * .2); ctx.lineTo(x + w * .73, y + h * .2); ctx.lineTo(x + w * .87, y + h * .7); ctx.lineTo(x + w * .73, y + h * .93); ctx.lineTo(x + w * .27, y + h * .93); ctx.lineTo(x + w * .13, y + h * .7); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = metal;
      for (const side of [-1, 1]) {
        const sx = x + w * (side < 0 ? .18 : .82);
        ctx.beginPath(); ctx.moveTo(sx, y + h * .27); ctx.lineTo(sx + side * 9, y + h * .18); ctx.lineTo(sx + side * 12, y + h * .42); ctx.lineTo(sx, y + h * .48); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = armor; ctx.strokeStyle = metal; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x + w * .2, y + h * .27); ctx.lineTo(x + w * .28, y + h * .04); ctx.lineTo(x + w * .5, y - 2); ctx.lineTo(x + w * .72, y + h * .04); ctx.lineTo(x + w * .8, y + h * .27); ctx.lineTo(x + w * .68, y + h * .38); ctx.lineTo(x + w * .32, y + h * .38); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#130f19'; ctx.fillRect(x + w * .27, y + h * .17, w * .46, h * .065);
      ctx.fillStyle = glow; ctx.shadowBlur = 12; ctx.fillRect(x + (facing > 0 ? w * .53 : w * .31), y + h * .18, w * .16, Math.max(2, h * .035));
      ctx.fillStyle = metal; ctx.beginPath(); ctx.moveTo(x + w * .5, y + h * .43); ctx.lineTo(x + w * .63, y + h * .58); ctx.lineTo(x + w * .5, y + h * .75); ctx.lineTo(x + w * .37, y + h * .58); ctx.closePath(); ctx.fill();
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x + w * .5, y + h * .58, Math.max(2, w * .055), 0, Math.PI * 2); ctx.fill();
      // Telegraph the strike in the windup, then draw a directional blade arc on impact.
      if (enemy.windupTimer > 0 || enemy.chargeState === 'windup') {
        ctx.globalAlpha = .3 + Math.sin((enemy.windupTimer || .2) * 28) * .15;
        ctx.strokeStyle = glow; ctx.lineWidth = 3; ctx.beginPath();
        ctx.arc(x + w / 2 + facing * w * .3, y + h * .66, w * .7, facing > 0 ? -.95 : Math.PI - .95, facing > 0 ? .85 : Math.PI + .85); ctx.stroke();
      }
      if (enemy.attackTimer > 0 && enemy.getHitbox) {
        const hb = enemy.getHitbox();
        if (hb) {
          ctx.globalAlpha = .82; ctx.strokeStyle = glow; ctx.lineWidth = Math.max(3, h * .06); ctx.shadowBlur = 18;
          ctx.beginPath(); ctx.arc(x + w / 2 + facing * w * .35, y + h * .57, Math.max(w, h * .58), facing > 0 ? -.85 : Math.PI - .85, facing > 0 ? .7 : Math.PI + .7); ctx.stroke();
          ctx.globalAlpha = .2; ctx.fillStyle = glow; ctx.fillRect(hb.x, hb.y + hb.h * .38, hb.w, hb.h * .28);
        }
      }
      if (phase === 2) {
        ctx.globalAlpha = .55; ctx.strokeStyle = glow; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * .52, w * .62, h * .56, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (enemy.enemyType === 'charger') {
      this.rect(x, y + 6, w, h - 6, base);
      this.rect(x + 2, y, w - 4, 10, hitFlash > 0 ? '#ffffff' : '#c2c2c2');
      this.rect(x + (enemy.facing === 1 ? w - 5 : 2), y + 4, 3, 2, '#1a1a1a');
      return;
    }
    if (enemy.enemyType === 'ranged') {
      this.rect(x, y + 6, w, h - 6, hitFlash > 0 ? '#ffffff' : '#8a8a8a');
      this.rect(x + 2, y, w - 4, 10, hitFlash > 0 ? '#ffffff' : '#b8b8b8');
      this.rect(x + (enemy.facing === 1 ? w - 5 : 2), y + 4, 2, 2, '#1a1a1a');
      this.rect(x + (enemy.facing === 1 ? w - 2 : 0), y + 12, 4, 2, '#d0d0d0');
      return;
    }
    if (enemy.enemyType === 'flyer') {
      this.rect(x + 2, y + 4, w - 4, h - 8, hitFlash > 0 ? '#ffffff' : '#a0a0a0');
      this.rect(x, y + 6, w, 4, hitFlash > 0 ? '#ffffff' : '#c0c0c0');
      this.rect(x + (enemy.facing === 1 ? w - 6 : 2), y + 7, 4, 2, '#1a1a1a');
      return;
    }
    if (enemy.enemyType === 'crawler') {
      this.rect(x, y + h - 8, w, 8, hitFlash > 0 ? '#ffffff' : '#7f7f7f');
      this.rect(x + 2, y + h - 12, w - 4, 6, hitFlash > 0 ? '#ffffff' : '#b0b0b0');
      this.rect(x + (enemy.facing === 1 ? w - 5 : 2), y + h - 11, 3, 2, '#1a1a1a');
      return;
    }
    this.rect(x, y + 5, w, h - 5, base);
    this.rect(x + 2, y, w - 4, 9, hitFlash > 0 ? '#ffffff' : '#bcbcbc');
    this.rect(x + (enemy.facing === 1 ? w - 4 : 2), y + 4, 2, 2, '#1a1a1a');
  }

  drawFistPickup(pickup) {
    if (!pickup || !pickup.active || pickup.collected) return;
    const y = pickup.getDrawY ? pickup.getDrawY() : pickup.y;
    const glow = pickup.glow || 0;
    const color = pickup.fist ? pickup.fist.color : '#ffffff';
    
    this.ctx.globalAlpha = 0.3 + glow * 0.4;
    this.rect(pickup.x - 4, y - 4, pickup.w + 8, pickup.h + 8, color);
    this.ctx.globalAlpha = 1;
    
    this.rect(pickup.x, y + 8, pickup.w, pickup.h - 8, color);
    this.rect(pickup.x + 3, y, pickup.w - 6, 12, '#e6e6e6');
    this.rect(pickup.x + 6, y + 4, 3, 3, '#1a1a1a');
    
    this.ctx.globalAlpha = 0.6 + glow * 0.4;
    this.rect(pickup.x + 2, y + 14, pickup.w - 4, 2, '#ffffff');
    this.ctx.globalAlpha = 1;
  }

  drawProjectiles(projectiles) {
    if (!projectiles) return;
    const ctx = this.ctx;
    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];
      if (p.dead) continue;
      const age = p.age || 0;
      const emergence = Math.min(1, age / 0.09);
      const angle = Math.atan2(p.vy, p.vx);
      const cx = p.x + p.w / 2;
      const cy = p.y + p.h / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.globalAlpha = 0.72;
      ctx.strokeStyle = p.color || '#e6e6e6';
      ctx.fillStyle = p.color || '#e6e6e6';
      ctx.shadowColor = p.color || '#e6e6e6';
      ctx.shadowBlur = p.owner === 'enemy' ? 9 : 6;
      ctx.lineWidth = 2;
      if (p.windBlade || p.voidBlade) {
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (p.voidBlade) {
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.ellipse(0, 0, p.w * 0.42, p.h * 0.38, 0, -0.75, 2.2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-p.w * 0.35, p.h * 0.3); ctx.lineTo(-p.w * 0.05, -p.h * 0.42); ctx.lineTo(p.w * 0.08, p.h * 0.22); ctx.lineTo(p.w * 0.42, -p.h * 0.25); ctx.stroke();
        } else {
          ctx.moveTo(-p.w * 0.55, p.h * 0.35);
          ctx.quadraticCurveTo(-p.w * 0.08, -p.h * 0.9, p.w * 0.55, -p.h * 0.12);
          ctx.moveTo(-p.w * 0.5, p.h * 0.72);
          ctx.quadraticCurveTo(0, -p.h * 0.2, p.w * 0.45, p.h * 0.12);
        }
        ctx.stroke();
        ctx.restore();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(-3 - emergence * 9, 0);
      ctx.lineTo(-p.w * (0.8 + emergence * 0.7), 0);
      ctx.stroke();
      ctx.globalAlpha = 0.35 * (1 - emergence);
      ctx.beginPath();
      ctx.arc(-2, 0, 3 + (1 - emergence) * 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 3;
      ctx.fillStyle = '#fff5e8';
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(2, p.w * (0.34 + emergence * 0.16)), Math.max(1.5, p.h * 0.48), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawDoor(door) {
    if (!door) return;
    const color = door.open ? '#d9d9d9' : '#3a3a3a';
    this.rect(door.x, door.y, door.w, door.h, color);
    this.rect(door.x + 6, door.y + 8, door.w - 12, door.h - 16, door.open ? '#e6e6e6' : '#252525');
    if (door.open) {
      this.text('>', door.x + door.w / 2, door.y + door.h / 2 + 4, '#1a1a1a', 16, 'center');
    }
  }

  drawWorld(gm) {
    const room = gm.currentRoom;
    if (!room) {
      this.ctx.fillStyle = '#080808';
      this.ctx.fillRect(0, 0, 1024, 576);
      return;
    }
    
    this.drawBackground(gm);
    
    if (gm.solids) {
      for (let i = 0; i < gm.solids.length; i++) {
        const s = gm.solids[i];
        this.rect(s.x, s.y, s.w, s.h, '#6f6f6f');
        this.rect(s.x, s.y, s.w, 2, '#9f9f9f');
      }
    }
    
    if (room.door) {
      this.drawDoor(room.door);
    }

    if (room.intro) {
      this.rect(480, 488, 8, 34, '#745c40');
      this.rect(540, 488, 8, 34, '#745c40');
      this.rect(480, 486, 68, 6, '#a88756');
      this.text('EL PRIMER BRAZO', 514, 472, '#e0c28b', 11, 'center');
      this.text('1878', 514, 459, '#8d7557', 9, 'center');
    }
    
    if (gm.fistPickups) {
      for (let i = 0; i < gm.fistPickups.length; i++) {
        this.drawFistPickup(gm.fistPickups[i]);
      }
    }

    if (gm.items) {
      const colors = { heart: '#d75b64', power: '#e39e53', vitality: '#81bd78', flight: '#a98bd4', swift: '#9eadd4', reach: '#79d7d0', focus: '#b996ef', dash: '#c4d5f2' };
      for (const item of gm.items) {
        const relic = item.type === 'cosmetic' ? WAR_RELIC_BY_ID[item.cosmeticId] : null;
        const color = relic?.color || colors[item.type] || '#ffffff';
        const bob = Math.sin((gm.runTime || 0) * 3 + item.x * 0.04) * 2;
        const centerX = item.x + item.w / 2;
        const centerY = item.y + item.h / 2 + bob;
        const ctx = this.ctx;
        const rarity = relic?.rarity || 1;
        ctx.save(); ctx.globalAlpha = (relic ? 0.3 - rarity * 0.035 : 0.25) + Math.sin((gm.runTime || 0) * 4 + item.x) * 0.04;
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = relic ? 16 : 10;
        ctx.beginPath(); ctx.ellipse(centerX, centerY, 15, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (relic) {
          ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(Math.sin((gm.runTime || 0) * 1.6) * 0.12);
          ctx.fillStyle = '#17131d'; ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.shadowColor = color; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(8, -3); ctx.lineTo(6, 7); ctx.lineTo(0, 10); ctx.lineTo(-6, 7); ctx.lineTo(-8, -3); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.restore();
          this.text(relic.glyph, centerX, centerY + 3, color, 10, 'center');
        } else {
          this.rect(centerX - 7, centerY - 7, 14, 14, color);
          this.rect(centerX - 3, centerY - 3, 6, 6, '#f0e8d8');
        }
      }
    }
    if (gm.minions) {
      for (const minion of gm.minions) {
        this.drawMinion(minion, gm.runTime || 0);
      }
    }
    
    if (gm.projectiles) {
      this.drawProjectiles(gm.projectiles);
    }
    
    if (gm.enemies) {
      for (let i = 0; i < gm.enemies.length; i++) {
        this.drawEnemy(gm.enemies[i]);
      }
    }

    this.drawCombatEffects(gm.combatEffects);
    
    if (gm.player) {
      this.drawPlayer(gm.player, gm.runTime || 0);
    }
  }

  restore() {
    this.ctx.restore();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
