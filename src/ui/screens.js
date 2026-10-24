import { WAR_RELIC_BY_ID } from '../game/rooms/warLore.js';

export class Screens {
  constructor(doc) {
    this.doc = doc;
    this.menu = doc.getElementById('menu-screen');
    this.upgrade = doc.getElementById('upgrade-screen');
    this.gameover = doc.getElementById('gameover-screen');
    this.victory = doc.getElementById('victory-screen');
    this.pause = doc.getElementById('pause-screen');
    this.bossIntro = doc.getElementById('boss-intro');
    this.fistPickup = doc.getElementById('fist-pickup-screen');
    this.fistIndicator = doc.getElementById('fist-indicator');
    this.storyIntro = doc.getElementById('story-intro-screen');
    this.tutorial = doc.getElementById('tutorial-screen');
    this.fistInventory = doc.getElementById('fist-inventory-screen');

    this.onStart = null;
    this.onRetry = null;
    this.onMenu = null;
    this.onResume = null;
    this.onFistPickupContinue = null;
    this.onItemPickupContinue = null;
    this.onIntroContinue = null;
    this.pickupKind = 'fist';
    this.pickupKey = null;

    const btnStart = doc.getElementById('btn-start');
    if (btnStart) btnStart.onclick = () => { if (this.onStart) this.onStart(); };

    const btnRetry = doc.getElementById('btn-retry');
    if (btnRetry) btnRetry.onclick = () => { if (this.onRetry) this.onRetry(); };

    const btnMenu = doc.getElementById('btn-menu');
    if (btnMenu) btnMenu.onclick = () => { if (this.onMenu) this.onMenu(); };

    const btnVictoryMenu = doc.getElementById('btn-victory-menu');
    if (btnVictoryMenu) btnVictoryMenu.onclick = () => { if (this.onMenu) this.onMenu(); };

    const btnResume = doc.getElementById('btn-resume');
    if (btnResume) btnResume.onclick = () => { if (this.onResume) this.onResume(); };

    const btnFistContinue = doc.getElementById('btn-fist-continue');
    if (btnFistContinue) btnFistContinue.onclick = () => {
      if (this.pickupKind === 'item') {
        if (this.onItemPickupContinue) this.onItemPickupContinue();
      } else if (this.onFistPickupContinue) this.onFistPickupContinue();
    };

    const btnIntroContinue = doc.getElementById('btn-intro-continue');
    if (btnIntroContinue) btnIntroContinue.onclick = () => { this.hideIntro(); this.showTutorial(); };

    const btnTutorialContinue = doc.getElementById('btn-tutorial-continue');
    if (btnTutorialContinue) btnTutorialContinue.onclick = () => { if (this.onIntroContinue) this.onIntroContinue(); };

    const btnInstructions = doc.getElementById('btn-instructions');
    if (btnInstructions) btnInstructions.onclick = () => alert('SIXXPISTOLS · LA GUERRA DE 1878\n\nArdan perdió sus seis brazos al defender su ciudad de Moro. Despierta en una sala segura y recupera el brazo del altar. Después, supera dos salas de combate para enfrentarte a un guardián: cada guardián derrotado entrega uno de los brazos restantes.\n\nA/D o ←/→: mover · W/↑: mirar arriba y apuntar · Espacio: saltar · X: golpe básico sin animación · C: habilidad del brazo · K/Shift: dash · H: cura · E: abrir/cerrar inventario. Elige hasta dos brazos; se usan juntos y combinan sus poderes.\n\nLa cura restaura 1 punto y vuelve a cargarse cada 6 impactos. Mantén C para volar mientras tengas reserva; se recarga al tocar el suelo y soltar el poder. Busca mejoras para ampliar la reserva, acelerar el vuelo y fortalecer los ataques. Recupera los seis brazos y derrota a Moro al final de las 17 salas.');

    const btnCredits = doc.getElementById('btn-credits');
    if (btnCredits) btnCredits.onclick = () => alert('SIXXPISTOLS\nUna historia de Ardan y la guerra de 1878.\nSeis brazos elementales: fuego, agua, tierra, aire, rayo y vacío.');
  }

  showMenu() {
    this.hideAll();
    if (this.menu) this.menu.classList.remove('hidden');
  }

  showPlaying() {
    this.hideAll();
    if (this.menu) this.menu.classList.add('hidden');
  }

  showFistInventory() {
    if (this.fistInventory) this.fistInventory.classList.remove('hidden');
  }

  hideFistInventory() {
    if (this.fistInventory) this.fistInventory.classList.add('hidden');
  }

  showIntro() {
    this.hideAll();
    if (this.storyIntro) this.storyIntro.classList.remove('hidden');
  }

  hideIntro() {
    if (this.storyIntro) this.storyIntro.classList.add('hidden');
  }

  showTutorial() {
    this.hideAll();
    if (this.tutorial) this.tutorial.classList.remove('hidden');
  }

  hideTutorial() {
    if (this.tutorial) this.tutorial.classList.add('hidden');
  }

  showPause() {
    if (this.pause) this.pause.classList.remove('hidden');
  }

  hidePause() {
    if (this.pause) this.pause.classList.add('hidden');
  }

  showGameOver(gm) {
    this.hideAll();
    if (this.gameover) {
      this.gameover.classList.remove('hidden');
      const r = document.getElementById('go-rooms');
      const d = document.getElementById('go-dmg');
      if (r) r.textContent = gm.dungeon ? gm.dungeon.currentRoomIndex + 1 : 0;
      if (d) d.textContent = Math.round(gm.totalDamageDealt || 0).toLocaleString('es-CO');
    }
  }

  showVictory(gm) {
    this.hideAll();
    if (this.victory) {
      this.victory.classList.remove('hidden');
      const r = document.getElementById('v-rooms');
      const d = document.getElementById('v-dmg');
      if (r) r.textContent = gm.dungeon ? gm.dungeon.totalRooms : 0;
      if (d) d.textContent = Math.round(gm.totalDamageDealt || 0).toLocaleString('es-CO');
    }
  }

  showFistPickup(fist) {
    if (!this.fistPickup || !fist) return;
    this.pickupKind = 'fist';
    const glyphs = { fuego: '🔥', agua: '💧', tierra: '🌱', aire: '〰', rayo: '⚡', 'vacío': '◉' };
    this.renderPickup({
      key: `fist-${fist.id}`,
      label: 'BRAZO RECUPERADO',
      name: fist.name,
      element: `ELEMENTO: ${fist.element.toUpperCase()}`,
      description: fist.desc,
      primary: `ATAQUE: ${fist.primaryDesc}`,
      ability: `PODER: ${fist.abilityDesc}`,
      color: fist.color,
      glyph: glyphs[fist.element] || '✦',
    });
  }

  showItemPickup(item) {
    if (!this.fistPickup || !item) return;
    this.pickupKind = 'item';
    const rewards = {
      heart: { name: 'NÚCLEO DE VIDA', glyph: '♥', color: '#e36a77', description: 'Un latido antiguo responde a tu presencia.', effect: 'CURA 2 PUNTOS; CON LA VIDA COMPLETA, AÑADE 1 CORAZÓN MÁXIMO.' },
      vitality: { name: 'ESENCIA VITAL', glyph: '✦', color: '#81bd78', description: 'La energía de la tierra fortalece tu cuerpo y tu rito de curación.', effect: 'AUMENTA TU SALUD MÁXIMA; MEJORA LA CURA A 2 PUNTOS, AÑADE UN USO Y LA RECARGA REQUIERE MENOS GOLPES.' },
      power: { name: 'ESQUIRLA DE GUERRA', glyph: '◆', color: '#e39e53', description: 'Un fragmento del campo de batalla se funde con tu armadura.', effect: 'AUMENTA EL DAÑO DE TUS ATAQUES.' },
      flight: { name: 'NÚCLEO PROPULSOR', glyph: '✧', color: '#a98bd4', description: 'Una cámara de energía violeta se acopla a la espalda de Ardan.', effect: 'AMPLÍA LA RESERVA Y AUMENTA LA FUERZA DE VUELO.' },
      swift: { name: 'GREBAS DEL VIENTO', glyph: '⌁', color: '#9eadd4', description: 'El metal ligero deja correr a Ardan con mayor velocidad.', effect: 'AUMENTA LA VELOCIDAD Y ACELERA LOS GOLPES.' },
      reach: { name: 'BRAZALES DEL ALCANCE', glyph: '⟡', color: '#79d7d0', description: 'Runas antiguas prolongan el vínculo entre Ardan y sus brazos.', effect: 'AMPLÍA EL ALCANCE Y EL ÁREA DE LOS ATAQUES.' },
      focus: { name: 'NÚCLEO DE SINTONÍA', glyph: '✺', color: '#b996ef', description: 'Una piedra violeta se enlaza con la energía de los brazos.', effect: 'REDUCE EL TIEMPO DE RECARGA DE LAS HABILIDADES.' },
      dash: { name: 'GREBAS DEL DESGARRO', glyph: '»', color: '#c4d5f2', description: 'Sus placas ligeras convierten cada impulso en una esquiva más larga.', effect: 'ACELERA LA RECARGA DEL DASH Y ALARGA SU IMPULSO.' },
    };
    const relic = item.type === 'cosmetic' ? WAR_RELIC_BY_ID[item.cosmeticId] : null;
    const reward = relic
      ? { name: relic.name, glyph: relic.glyph, color: relic.color, description: relic.description, effect: 'NUEVO ADORNO DE GUERRA · SU ASPECTO YA SE HA AÑADIDO A ARDAN.' }
      : rewards[item.type];
    if (!reward) return;
    this.renderPickup({
      key: `item-${item.type}-${item.x}`,
      label: relic ? 'RECUERDO DE LA GUERRA' : 'RELIQUIA DESCUBIERTA',
      name: reward.name,
      element: relic ? 'ORNAMENTO COSMÉTICO' : 'MEJORA PERMANENTE',
      description: reward.description,
      primary: reward.effect,
      ability: relic ? 'UNA MARCA DE LOS DEFENSORES DE LA CIUDAD.' : 'EL HALLAZGO SE HA AÑADIDO A TU PARTIDA.',
      color: reward.color,
      glyph: reward.glyph,
    });
  }

  renderPickup(reveal) {
    const freshReveal = this.pickupKey !== reveal.key || this.fistPickup.classList.contains('hidden');
    this.pickupKey = reveal.key;
    const labelEl = document.getElementById('fp-label');
    const nameEl = document.getElementById('fp-name');
    const elemEl = document.getElementById('fp-element');
    const descEl = document.getElementById('fp-desc');
    const primEl = document.getElementById('fp-primary');
    const abilEl = document.getElementById('fp-ability');
    const iconEl = document.getElementById('fp-icon');
    
    if (labelEl) labelEl.textContent = reveal.label;
    if (nameEl) nameEl.textContent = reveal.name.toUpperCase();
    if (elemEl) elemEl.textContent = reveal.element;
    if (descEl) descEl.textContent = reveal.description;
    if (primEl) primEl.textContent = reveal.primary;
    if (abilEl) abilEl.textContent = reveal.ability;
    if (iconEl) {
      iconEl.textContent = reveal.glyph;
      iconEl.style.setProperty('--reveal-color', reveal.color);
      iconEl.style.background = `${reveal.color}22`;
      iconEl.style.boxShadow = `0 0 0 8px ${reveal.color}22, 0 0 46px ${reveal.color}99`;
      iconEl.style.color = reveal.color;
    }
    if (freshReveal) {
      this.fistPickup.classList.remove('is-revealing');
      this.fistPickup.classList.remove('hidden');
      void this.fistPickup.offsetWidth;
      this.fistPickup.classList.add('is-revealing');
      const button = document.getElementById('btn-fist-continue');
      if (button) {
        button.disabled = true;
        window.setTimeout(() => {
          if (this.pickupKey === reveal.key) button.disabled = false;
        }, 1350);
      }
    }
  }

  hideFistPickup() {
    if (this.fistPickup) this.fistPickup.classList.add('hidden');
    if (this.fistPickup) this.fistPickup.classList.remove('is-revealing');
    this.pickupKey = null;
    const button = document.getElementById('btn-fist-continue');
    if (button) button.disabled = false;
  }

  showFistIndicator(player) {
    if (!this.fistIndicator) return;
    const fist = player.getCurrentFist();
    if (fist && player.fistManager.collected.length > 0) {
      this.fistIndicator.classList.remove('hidden');
      const nameEl = document.getElementById('fi-name');
      const countEl = document.getElementById('fi-count');
      const activeFists = player.getActiveFists();
      if (nameEl) {
        nameEl.textContent = activeFists.map((arm) => arm.name.replace(/^Brazo (de |del )?/, '')).join(' + ');
        nameEl.style.color = fist.color;
      }
      if (countEl) countEl.textContent = 'PODERES COMBINADOS · C';
    } else {
      this.fistIndicator.classList.add('hidden');
    }
  }

  showBossIntro(show) {
    if (!this.bossIntro) return;
    if (show) this.bossIntro.classList.remove('hidden');
    else this.bossIntro.classList.add('hidden');
  }

  hideAll() {
    this.hideFistInventory();
    if (this.menu) this.menu.classList.add('hidden');
    if (this.upgrade) this.upgrade.classList.add('hidden');
    if (this.gameover) this.gameover.classList.add('hidden');
    if (this.victory) this.victory.classList.add('hidden');
    if (this.pause) this.pause.classList.add('hidden');
    if (this.bossIntro) this.bossIntro.classList.add('hidden');
    if (this.fistPickup) this.fistPickup.classList.add('hidden');
    if (this.storyIntro) this.storyIntro.classList.add('hidden');
    if (this.tutorial) this.tutorial.classList.add('hidden');
    if (this.fistIndicator) this.fistIndicator.classList.add('hidden');
  }
}
