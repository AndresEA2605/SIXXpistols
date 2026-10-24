import { WAR_RELICS } from '../game/rooms/warLore.js';

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
    this.cosmeticSlotsEl = this.inventoryEl?.querySelector('[data-cosmetic-slots]');
    this.cosmeticHintEl = this.inventoryEl?.querySelector('[data-cosmetic-hint]');
    this.cosmeticCountEl = this.inventoryEl?.querySelector('[data-cosmetic-count]');
    this.inventorySignature = '';
    this.cosmeticSignature = '';
    this.inventoryTab = 'arms';
    this.gameManager = null;
    this.inventoryEl?.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-inventory-tab]');
      if (tab) {
        this.setInventoryTab(tab.dataset.inventoryTab);
        return;
      }
      const button = event.target.closest('[data-fist-select]');
      if (button && this.gameManager) {
        this.gameManager.player.fistManager.toggleFist(Number(button.dataset.fistSelect));
        this.updateInventory(this.gameManager);
        return;
      }
      const cosmetic = event.target.closest('[data-cosmetic-select]');
      if (cosmetic && this.gameManager) {
        const player = this.gameManager.player;
        const id = cosmetic.dataset.cosmeticSelect;
        if (!player.collectedWarCosmetics.includes(id)) return;
        const index = player.equippedWarCosmetics.indexOf(id);
        if (index >= 0) player.equippedWarCosmetics.splice(index, 1);
        else player.equippedWarCosmetics.push(id);
        try { localStorage.setItem('sixxpistols-equipped-cosmetics', JSON.stringify(player.equippedWarCosmetics)); } catch {}
        this.updateInventory(this.gameManager);
      }
    });
    this.setInventoryTab('arms');
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
    const player = gm.player;
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

    const cosmeticSignature = WAR_RELICS.map((relic) => relic.id).join(',');
    if (this.cosmeticSlotsEl && cosmeticSignature !== this.cosmeticSignature) {
      this.cosmeticSignature = cosmeticSignature;
      this.cosmeticSlotsEl.innerHTML = WAR_RELICS.map((relic) => `
        <button class="fist-inventory-cosmetic is-locked" type="button" data-cosmetic-select="${relic.id}" title="${relic.description}" aria-label="${relic.name}" disabled>
          <span class="fist-inventory-cosmetic__glyph" style="--cosmetic-color:${relic.color}">${relic.glyph}</span>
          <b>${relic.name}</b>
          <small data-cosmetic-state></small>
        </button>`).join('');
    }
    const owned = player.collectedWarCosmetics || [];
    const equipped = player.equippedWarCosmetics || [];
    if (this.cosmeticCountEl) this.cosmeticCountEl.textContent = `${owned.length}/${WAR_RELICS.length}`;
    if (this.cosmeticHintEl) {
      this.cosmeticHintEl.textContent = owned.length
        ? 'SELECCIONA UNA PIEZA PARA EQUIPARLA O QUITARLA · SE GUARDA ENTRE PARTIDAS'
        : 'ENCUENTRA RELIQUIAS DE GUERRA PARA DESBLOQUEAR ADORNOS';
    }
    this.cosmeticSlotsEl?.querySelectorAll('[data-cosmetic-select]').forEach((button) => {
      const id = button.dataset.cosmeticSelect;
      const isOwned = owned.includes(id);
      const isEquipped = equipped.includes(id);
      button.disabled = !isOwned;
      button.classList.toggle('is-locked', !isOwned);
      button.classList.toggle('is-equipped', isEquipped);
      button.setAttribute('aria-pressed', String(isEquipped));
      const state = button.querySelector('[data-cosmetic-state]');
      if (state) state.textContent = isEquipped ? 'EQUIPADO' : isOwned ? 'ENCONTRADO' : 'POR DESCUBRIR';
    });
  }

  setInventoryTab(tab) {
    this.inventoryTab = tab === 'cosmetics' ? 'cosmetics' : 'arms';
    this.inventoryEl?.querySelectorAll('[data-inventory-tab]').forEach((button) => {
      const active = button.dataset.inventoryTab === this.inventoryTab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    this.inventoryEl?.querySelectorAll('[data-inventory-view]').forEach((view) => {
      view.classList.toggle('hidden', view.dataset.inventoryView !== this.inventoryTab);
    });
  }
}
