export const ELEMENTS = {
  FIRE: 'fuego', WATER: 'agua', EARTH: 'tierra', AIR: 'aire',
  LIGHTNING: 'rayo', VOID: 'vacío',
};

// Los seis brazos perdidos de Ardan. Cada poder resuelve un problema distinto.
export const FISTS = [
  {
    id: 0, name: 'Brazo de Fuego', element: ELEMENTS.FIRE, color: '#ef7545',
    desc: 'El primer brazo que Ardan recuperó al despertar entre las ruinas de 1878. Su llama puede sostenerlo en el aire y abrasar a quienes lo rodean.',
    primaryDesc: 'Golpe ígneo de alcance amplio', abilityDesc: 'ASCENSO — Mantén el poder para volar mientras quede reserva; la llamarada abrasa a los enemigos cercanos',
    stats: { damage: 1.3, range: 2.35, knockback: 1.25, speed: 1.05 },
    ability: { type: 'flight', cooldown: 5, duration: 0.28, damage: 1.2, radius: 48 },
  },
  {
    id: 1, name: 'Brazo de Agua', element: ELEMENTS.WATER, color: '#56b9e9',
    desc: 'Un brazo sereno que concentra el agua en proyectiles precisos. Su alcance permite atacar sin acercarse al enemigo.',
    primaryDesc: 'Dispara una bala de agua veloz', abilityDesc: 'MAREA — Ráfaga de tres proyectiles perforantes',
    stats: { damage: 1, range: 1, knockback: 0.8, speed: 1.15 },
    ability: { type: 'water_burst', cooldown: 2.2, damage: 1.4, speed: 460, count: 3 },
  },
  {
    id: 2, name: 'Brazo de Tierra', element: ELEMENTS.EARTH, color: '#9b7953',
    desc: 'La tierra recuerda a quienes cayeron por la ciudad. Este brazo despierta súbditos vegetales que luchan junto a Ardan.',
    primaryDesc: 'Golpe pesado que empuja a los enemigos', abilityDesc: 'SEMILLA — Invoca un súbdito vegetal que ataca durante 14 segundos',
    stats: { damage: 1.55, range: 1.15, knockback: 1.6, speed: 0.82 },
    ability: { type: 'summon', cooldown: 8, duration: 14, damage: 0.72 },
  },
  {
    id: 3, name: 'Brazo de Aire', element: ELEMENTS.AIR, color: '#d7e4e8',
    desc: 'El viento abre paso entre los restos de la guerra. Sus golpes lanzan cuchillas de aire que atraviesan a varios enemigos.',
    primaryDesc: 'Golpe rápido seguido de una cuchilla de viento', abilityDesc: 'VENDAVAL — Una ráfaga amplia daña y aturde a varios enemigos',
    stats: { damage: 1, range: 1.25, knockback: 1.35, speed: 1.35 },
    ability: { type: 'gust', cooldown: 3.2, damage: 1.55, range: 225, height: 108, stun: 1.4, push: 340 },
  },
  {
    id: 4, name: 'Brazo del Rayo', element: ELEMENTS.LIGHTNING, color: '#e8d66a',
    desc: 'La energía de la tormenta salta entre los adversarios y alcanza a quienes se agrupan.',
    primaryDesc: 'El golpe encadena descargas a enemigos cercanos', abilityDesc: 'CADENA — El rayo salta entre hasta seis enemigos',
    stats: { damage: 1.05, range: 1.15, knockback: 0.9, speed: 1.45 },
    ability: { type: 'chain', cooldown: 2.5, damage: 2, bounces: 6, range: 245 },
  },
  {
    id: 5, name: 'Brazo del Vacío', element: ELEMENTS.VOID, color: '#c6a6ed',
    desc: 'El último brazo guarda el silencio de Moro. Ardan atraviesa el espacio y deja una herida oscura a su paso.',
    primaryDesc: 'Golpe que atraviesa las defensas', abilityDesc: 'DESGARRO — Teletranspórtate y daña a los enemigos en el trayecto',
    stats: { damage: 1.3, range: 1.5, knockback: 1.2, speed: 1.05 },
    ability: { type: 'blink', cooldown: 2.6, distance: 175, damage: 1.55, radius: 46 },
  },
];

export function getRandomFist(exclude = []) {
  const available = FISTS.filter((fist) => !exclude.includes(fist.id));
  return available[Math.floor(Math.random() * available.length)] || null;
}

export function shuffleFists() {
  return [...FISTS].sort(() => Math.random() - 0.5);
}
