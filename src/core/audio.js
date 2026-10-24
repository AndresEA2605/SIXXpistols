// Audio sintetizado con WebAudio: sin archivos externos y con bajo peso.
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.ambientGain = null;
    this.muted = localStorage.getItem('sixx-muted') === 'true';
    this.started = false;
  }

  /** Debe llamarse tras el primer gesto del usuario (política de autoplay). */
  unlock() {
    if (this.started) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.55;
    this.master.connect(this.ctx.destination);
    this.started = true;
    this.startAmbient();
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('sixx-muted', String(muted));
    if (this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.55, this.ctx.currentTime, 0.08);
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  startAmbient() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.035;
    this.ambientGain.connect(this.master);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 2;
    filter.connect(this.ambientGain);

    [55, 82.41, 110.2].forEach((frequency, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = index === 2 ? 'triangle' : 'sine';
      osc.frequency.value = frequency;
      gain.gain.value = index === 2 ? 0.35 : 0.6;
      osc.connect(gain);
      gain.connect(filter);
      osc.start(now + index * 0.4);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.05 + index * 0.017;
      lfoGain.gain.value = 0.2;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start(now);
    });
  }

  tone({ frequency = 220, endFrequency = frequency, type = 'sine', duration = 0.15, volume = 0.2, delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const start = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  noise({ duration = 0.18, volume = 0.2, filterFrequency = 1200 } = {}) {
    if (!this.ctx || this.muted) return;
    const sampleRate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const decay = 1 - i / data.length;
      data[i] = (Math.random() * 2 - 1) * decay * decay;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFrequency;
    filter.Q.value = 0.8;

    const gain = this.ctx.createGain();
    gain.gain.value = volume;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start();
  }

  play(name) {
    if (!this.ctx) return;
    switch (name) {
      case 'jump':
        this.tone({ frequency: 300, endFrequency: 560, type: 'triangle', duration: 0.16, volume: 0.12 });
        break;
      case 'dash':
        this.noise({ duration: 0.22, volume: 0.16, filterFrequency: 900 });
        this.tone({ frequency: 180, endFrequency: 90, type: 'sawtooth', duration: 0.18, volume: 0.07 });
        break;
      case 'slash':
        this.noise({ duration: 0.12, volume: 0.16, filterFrequency: 2600 });
        this.tone({ frequency: 520, endFrequency: 260, type: 'triangle', duration: 0.1, volume: 0.06 });
        break;
      case 'heal':
        [440, 554, 659, 880].forEach((frequency, i) => {
          this.tone({ frequency, endFrequency: frequency * 1.08, type: 'sine', duration: 0.42, volume: 0.075, delay: i * 0.055 });
        });
        this.noise({ duration: 0.16, volume: 0.035, filterFrequency: 1800 });
        break;
      case 'world':
        this.noise({ duration: 0.9, volume: 0.09, filterFrequency: 280 });
        [110, 164.81, 220].forEach((frequency, i) => {
          this.tone({ frequency, endFrequency: frequency * 1.5, type: 'sine', duration: 1.1, volume: 0.08, delay: i * 0.12 });
        });
        break;
      case 'impact':
        this.noise({ duration: 0.09, volume: 0.1, filterFrequency: 780 });
        this.tone({ frequency: 180, endFrequency: 75, type: 'triangle', duration: 0.12, volume: 0.045 });
        break;
      case 'enemyShot':
        this.noise({ duration: 0.13, volume: 0.075, filterFrequency: 1450 });
        this.tone({ frequency: 260, endFrequency: 120, type: 'triangle', duration: 0.15, volume: 0.035 });
        break;
      case 'flight':
        this.noise({ duration: 0.24, volume: 0.08, filterFrequency: 1150 });
        this.tone({ frequency: 125, endFrequency: 270, type: 'sawtooth', duration: 0.28, volume: 0.045 });
        break;
      case 'hit':
        this.tone({ frequency: 160, endFrequency: 60, type: 'square', duration: 0.18, volume: 0.12 });
        this.noise({ duration: 0.1, volume: 0.14, filterFrequency: 700 });
        break;
      case 'hurt':
        this.tone({ frequency: 220, endFrequency: 70, type: 'sawtooth', duration: 0.36, volume: 0.18 });
        break;
      case 'kill':
        this.tone({ frequency: 320, endFrequency: 40, type: 'square', duration: 0.32, volume: 0.14 });
        break;
      case 'door':
        this.tone({ frequency: 110, endFrequency: 220, type: 'sine', duration: 0.7, volume: 0.2 });
        [330, 440, 550].forEach((frequency, i) => {
          this.tone({ frequency, type: 'sine', duration: 0.9, volume: 0.05, delay: 0.15 + i * 0.08 });
        });
        break;
      case 'pick':
        [523, 659, 784].forEach((frequency, i) => {
          this.tone({ frequency, type: 'triangle', duration: 0.35, volume: 0.09, delay: i * 0.07 });
        });
        break;
      case 'boss':
        this.tone({ frequency: 80, endFrequency: 45, type: 'sawtooth', duration: 1.4, volume: 0.22 });
        this.noise({ duration: 0.8, volume: 0.15, filterFrequency: 300 });
        break;
      case 'victory':
        [392, 523, 659, 784].forEach((frequency, i) => {
          this.tone({ frequency, type: 'triangle', duration: 1.1, volume: 0.11, delay: i * 0.16 });
        });
        break;
      case 'click':
        this.tone({ frequency: 700, endFrequency: 500, type: 'sine', duration: 0.06, volume: 0.07 });
        break;
      default:
        break;
    }
  }
}
