// Entrada unificada para teclado y controles táctiles.
const KEYMAP = {
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  KeyW: 'up',
  ArrowUp: 'up',
  Space: 'jump',
  KeyX: 'basicAttack',
  KeyK: 'dash',
  KeyH: 'heal',
  KeyC: 'ability',
  ShiftLeft: 'dash',
  ShiftRight: 'dash',
  KeyE: 'inventory',
  Enter: 'interact',
  Escape: 'pause',
  KeyP: 'pause',
  KeyM: 'mute',
  Digit1: 'option1',
  Digit2: 'option2',
  Digit3: 'option3',
  KeyR: 'restart',
  Numpad1: 'option1',
  Numpad2: 'option2',
  Numpad3: 'option3',
};

const PREVENT_DEFAULT = new Set([
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

export class Input {
  constructor(root = window) {
    this.down = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.root = root;

    this.onKeyDown = (event) => {
      if (PREVENT_DEFAULT.has(event.code)) event.preventDefault();
      if (event.repeat) return;
      const action = KEYMAP[event.code];
      if (!action) return;
      if (!this.down.has(action)) this.pressed.add(action);
      this.down.add(action);
    };

    this.onKeyUp = (event) => {
      const action = KEYMAP[event.code];
      if (!action) return;
      this.down.delete(action);
      this.released.add(action);
    };

    this.onBlur = () => {
      this.down.clear();
    };

    root.addEventListener('keydown', this.onKeyDown);
    root.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  /** Enlaza los botones táctiles (atributo data-action) al mismo mapa de acciones. */
  bindTouchControls(container) {
    if (!container) return;
    const buttons = container.querySelectorAll('[data-action]');
    buttons.forEach((button) => {
      const action = button.dataset.action;
      const press = (event) => {
        event.preventDefault();
        if (!this.down.has(action)) this.pressed.add(action);
        this.down.add(action);
        button.classList.add('is-pressed');
      };
      const release = (event) => {
        event.preventDefault();
        this.down.delete(action);
        this.released.add(action);
        button.classList.remove('is-pressed');
      };
      button.addEventListener('pointerdown', press);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('pointerleave', release);
    });
  }

  isDown(action) {
    return this.down.has(action);
  }

  wasPressed(action) {
    return this.pressed.has(action);
  }

  wasReleased(action) {
    return this.released.has(action);
  }

  /** Limpia los eventos de un frame. Llamar al final del update. */
  endFrame() {
    this.pressed.clear();
    this.released.clear();
  }
}
