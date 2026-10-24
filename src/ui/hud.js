export class HUD {
  constructor(root) {
    this.root = root;
    this.heartsEl = root.querySelector('[data-hearts]');
    this.hpText = root.querySelector('[data-hp-text]');
    this.roomEl = root.querySelector('[data-room]');
    this.locationEl = root.querySelector('[data-location]');
    this.fistEl = root.querySelector('[data-fist]');
    this.fistNameEl = root.querySelector('[data-fist-name]');
    this.flightEl = root.querySelector('[data-flight]');
    this.flightFillEl = root.querySelector('[data-flight-fill]');
    this.flightValueEl = root.querySelector('[data-flight-value]');
    this.statPowerEl = root.querySelector('[data-stat-power]');
    this.statFlightEl = root.querySelector('[data-stat-flight]');
    this.statSpeedEl = root.querySelector('[data-stat-speed]');
    this.statReachEl = root.querySelector('[data-stat-reach]');
    this.statFocusEl = root.querySelector('[data-stat-focus]');
    this.statDashEl = root.querySelector('[data-stat-dash]');
    this.statHealthEl = root.querySelector('[data-stat-health]');
    this.healStatusEl = root.querySelector('[data-heal-status]');
    this.healFillEl = root.querySelector('[data-heal-fill]');
    this.inventoryEl = root.ownerDocument.querySelector('[data-fist-inventory]');
    this.inventorySlotsEl = this.inventoryEl?.querySelector('[data-fist-slots]');
    this.inventoryHintEl = this.inventoryEl?.querySelector('[data-fist-inventory-hint]');
    this.inventorySignature = '';
    this.gameManager = null;
    this.inventoryEl?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-fist-select]');
      if (!button || !this.gameManager) return;
      this.gameManager.player.fistManager.toggleFist(Number(button.dataset.fistSelect));
      this.updateInventory(this.gameManager);
    });
  }

  update(gm) {
    this.gameManager = gm;
    if (gm.state !== 'playing') {
      this.root.classList.add('hidden');
      return;
    }
    this.root.classList.remove('hidden');

    // Corazones
    if (this.heartsEl) {
      this.heartsEl.innerHTML = '';
      const max = gm.player.maxHp;
      const hp = gm.player.hp;
      for (let i = 0; i < max; i++) {
        const span = document.createElement('span');
        span.className = i < hp ? 'heart heart--full' : 'heart heart--empty';
        span.textContent = '♥';
        this.heartsEl.appendChild(span);
      }
    }
    if (this.hpText) this.hpText.textContent = `${gm.player.hp} / ${gm.player.maxHp}`;
    if (this.statPowerEl) this.statPowerEl.textContent = gm.player.powerLevel || 0;
    if (this.statFlightEl) this.statFlightEl.textContent = gm.player.flightLevel || 0;
    if (this.statSpeedEl) this.statSpeedEl.textContent = gm.player.speedLevel || 0;
    if (this.statReachEl) this.statReachEl.textContent = gm.player.reachLevel || 0;
    if (this.statFocusEl) this.statFocusEl.textContent = gm.player.focusLevel || 0;
    if (this.statDashEl) this.statDashEl.textContent = gm.player.dashLevel || 0;
    if (this.statHealthEl) this.statHealthEl.textContent = Math.max(0, gm.player.maxHp - 5);
    if (this.healStatusEl) this.healStatusEl.textContent = `N${gm.player.healLevel} · ${gm.player.healCharges}/${gm.player.maxHealCharges}`;
    if (this.healFillEl) {
      const progress = gm.player.healCharges >= gm.player.maxHealCharges ? 1 : gm.player.healHitCount / gm.player.healHitsRequired;
      this.healFillEl.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    }

    // Sala
    if (this.roomEl && gm.dungeon) {
      const p = gm.dungeon.getProgress();
      this.roomEl.textContent = `SALA ${p.current} / ${p.total}`;
      if (this.locationEl) this.locationEl.textContent = gm.currentRoom?.location?.name || 'RUINAS';
    }

    const manager = gm.player.fistManager;
    this.updateInventory(gm);

    // Puño actual
    if (this.fistEl && this.fistNameEl) {
      const fist = gm.player.getCurrentFist();
      const activeFists = manager.getActiveFists();
      if (fist) {
        this.fistEl.style.color = fist.color;
        this.fistNameEl.textContent = activeFists.map((arm) => arm.name.replace(/^Brazo (de |del )?/, '').toUpperCase()).join(' + ');
        this.fistEl.classList.remove('hidden');
      } else {
        this.fistEl.classList.add('hidden');
      }
      const hasFlight = activeFists.some((arm) => arm.ability.type === 'flight');
      if (this.flightEl) this.flightEl.classList.toggle('hidden', !hasFlight);
      if (hasFlight) {
        const capacity = gm.player.flightCapacity || 1;
        const fuel = Math.max(0, gm.player.flightFuel || 0);
        if (this.flightFillEl) this.flightFillEl.style.transform = `scaleX(${Math.min(1, fuel / capacity)})`;
        if (this.flightValueEl) this.flightValueEl.textContent = `${fuel.toFixed(1)} / ${capacity.toFixed(1)}`;
      }
    }
  }

  updateInventory(gm) {
    if (!this.inventorySlotsEl || !gm?.player?.fistManager) return;
    const manager = gm.player.fistManager;
    const activeCount = manager.getActiveFists().length;
    if (this.inventoryHintEl) {
      this.inventoryHintEl.textContent = activeCount === 2
        ? 'DOS EQUIPADOS · LIBERA UNO PARA CAMBIAR'
        : 'ELIGE UN SEGUNDO BRAZO PARA COMBINAR';
    }
    const signature = manager.collected.map((fist) => fist.id).join(',');
    if (signature !== this.inventorySignature) {
      this.inventorySignature = signature;
      this.inventorySlotsEl.innerHTML = manager.collected.map((fist) => {
        const symbols = { fuego: '♨', agua: '≈', tierra: '◆', aire: '≋', rayo: 'ϟ', vacío: '◉' };
        const shortName = fist.name.replace(/^Brazo (de |del )?/, '').toUpperCase();
        return `<button class="hud__inventory-arm" type="button" data-fist-select="${fist.id}" title="${fist.name}" aria-label="Equipar ${fist.name}" style="--arm-color:${fist.color}"><span>${symbols[fist.element] || '◆'}</span><b>${shortName}</b><i></i></button>`;
      }).join('');
    }
    this.inventorySlotsEl.querySelectorAll('[data-fist-select]').forEach((button) => {
      const id = Number(button.dataset.fistSelect);
      const equipped = manager.isEquipped(id);
      button.classList.toggle('is-equipped', equipped);
      button.setAttribute('aria-pressed', String(equipped));
      const slot = manager.activeIds.indexOf(id);
      button.querySelector('i').textContent = slot >= 0 ? String(slot + 1) : '';
    });
  }
}
