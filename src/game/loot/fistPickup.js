export class FistPickup {
  constructor(x, y, fist) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 28;
    this.fist = fist;
    this.collected = false;
    this.bob = Math.random() * Math.PI * 2;
    this.bobTime = 0;
    this.glow = 0;
    this.active = true;
  }

  update(dt) {
    if (this.collected) {
      this.active = false;
      return;
    }
    this.bobTime += dt * 3;
    this.glow = (Math.sin(this.bobTime) + 1) * 0.5;
  }

  getDrawY() {
    return this.y + Math.sin(this.bobTime) * 6;
  }

  tryCollect(player) {
    if (this.collected) return false;
    const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
    if (pb.x < this.x + this.w && pb.x + pb.w > this.x && 
        pb.y < this.getDrawY() + this.h && pb.y + pb.h > this.getDrawY()) {
      this.collected = true;
      this.active = false;
      return true;
    }
    return false;
  }
}
