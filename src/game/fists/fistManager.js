export class FistManager {
  constructor() {
    this.collected = []; // array of fist objects
    this.activeIds = [];
    this.abilityCooldowns = [0, 0, 0, 0, 0, 0];
    this.cooldownMultiplier = 1;
    this.effects = []; // efectos activos
  }

  collectFist(fist) {
    // evitar duplicados
    if (this.collected.find(f => f.id === fist.id)) return false;
    this.collected.push(fist);
    if (this.activeIds.length < 2) this.activeIds.push(fist.id);
    return true;
  }

  getActiveFists() {
    const active = this.activeIds.map((id) => this.collected.find((fist) => fist.id === id)).filter(Boolean);
    if (active.length) return active;
    return this.collected.length ? [this.collected[0]] : [];
  }

  isEquipped(id) {
    return this.getActiveFists().some((fist) => fist.id === id);
  }

  toggleFist(id) {
    if (!this.collected.some((fist) => fist.id === id)) return false;
    const index = this.activeIds.indexOf(id);
    if (index >= 0) {
      if (this.activeIds.length === 1) return false;
      this.activeIds.splice(index, 1);
    } else if (this.activeIds.length < 2) {
      this.activeIds.push(id);
    } else {
      return false;
    }
    return true;
  }

  getCurrentFist() {
    return this.getActiveFists()[0] || null;
  }

  getSecondaryFist() {
    return this.getActiveFists()[1] || null;
  }

  canUseAbility(fist = this.getCurrentFist()) {
    if (!fist) return false;
    return (this.abilityCooldowns[fist.id] || 0) <= 0;
  }

  useAbility(fist = this.getCurrentFist()) {
    if (!fist || !this.canUseAbility(fist)) return null;
    this.abilityCooldowns[fist.id] = fist.ability.cooldown * this.cooldownMultiplier;
    return { fist, ability: fist.ability };
  }

  update(dt) {
    for (let i = 0; i < this.abilityCooldowns.length; i++) {
      if (this.abilityCooldowns[i] > 0) {
        this.abilityCooldowns[i] -= dt;
      }
    }
    // actualizar efectos
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const eff = this.effects[i];
      eff.time -= dt;
      if (eff.time <= 0) {
        this.effects.splice(i, 1);
      }
    }
  }

  getAbilityCooldownProgress() {
    const fist = this.getCurrentFist();
    if (!fist) return 0;
    const cd = fist.ability.cooldown;
    const left = this.abilityCooldowns[fist.id] || 0;
    if (left <= 0) return 1;
    return 1 - (left / cd);
  }

  hasAllFists() {
    return this.collected.length >= 6;
  }
}
