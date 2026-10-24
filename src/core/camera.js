export class Camera {
  constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.targetX = 0;
    this.targetY = 0;
    this.lerp = 0.14;
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
    this.flightOffset = 0;
    this.flightActive = false;
    this.motionTime = 0;
  }

  follow(target, world) {
    const deadX = world.width * 0.38;
    const deadY = world.height * 0.34;
    const cx = target.x + target.w / 2 - this.width / 2;
    const cy = target.y + target.h / 2 - this.height / 2 + target.h * 0.4 + this.flightOffset;
    this.flightActive = !!target.isFlying;

    if (Math.abs(cx - this.targetX) > deadX) this.targetX = cx;
    if (Math.abs(cy - this.targetY) > deadY) this.targetY = cy;

    this.targetX = Math.max(0, Math.min(world.width - this.width, this.targetX));
    this.targetY = Math.max(world.height - this.height - 220, Math.min(world.height - this.height, this.targetY));
  }

  update(dt) {
    const smooth = 1 - Math.pow(1 - this.lerp, dt * 60);
    this.x += (this.targetX - this.x) * smooth;
    this.y += (this.targetY - this.y) * smooth;
    this.flightOffset += ((this.flightActive ? -24 : 0) - this.flightOffset) * (1 - Math.exp(-dt * 4.5));
    this.motionTime += dt;

    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const power = this.shakeMagnitude * (this.shakeTime / Math.max(0.0001, this._shakeDuration || this.shakeTime));
      this.ox = (Math.random() * 2 - 1) * power;
      this.oy = (Math.random() * 2 - 1) * power;
    } else {
      this.ox = 0;
      this.oy = 0;
      this.shakeTime = 0;
    }
    if (this.flightActive) {
      this.ox = (this.ox || 0) + Math.sin(this.motionTime * 16) * 0.65;
      this.oy = (this.oy || 0) + Math.sin(this.motionTime * 10) * 0.9;
    }
  }

  shake(magnitude = 6, duration = 0.22) {
    this.shakeMagnitude = magnitude;
    this.shakeTime = duration;
    this._shakeDuration = duration;
  }

  apply(ctx) {
    ctx.translate(-(this.x + (this.ox || 0)), -(this.y + (this.oy || 0)));
  }

  screen() {
    return { x: this.x + (this.ox || 0), y: this.y + (this.oy || 0) };
  }
}
