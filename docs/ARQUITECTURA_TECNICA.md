# Arquitectura Técnica - SIXXPISTOLS

## 1. Visión General
Arquitectura modular en ES6 con separación clara entre `core`, `game`, `render`, `ui`. Física propia AABB + gravedad. Loop con `requestAnimationFrame` + `fixed timestep` (60 FPS).

## 2. Estructura de Carpetas
```text
src/
├── core/      # utilidades transversales
├── game/      # lógica de juego (entidades, manager)
├── render/    # dibujo Canvas
├── ui/        # HUD y pantallas
└── main.js    # punto de entrada e integración
```

## 3. Sistema de Control del Jugador
Archivo: `src/game/player.js` - Clase `Player extends Entity`

### Propiedades Clave
- Movimiento: `moveSpeed`, `accel`, `jumpForce`
- Dash: `dashSpeed`, `dashTime`, `dashCooldown`, `iFrames`
- Ataque: `attackDamage`, `attackRange`, `attackWidth`, `attackCooldown`
- Salud: `maxHp`, `hp`, `invuln`
- Buffs: array acumulativo

### Flujo `update(input, dt, solids, onAttack)`
1. Decrementar timers (cooldowns/invuln)
2. Si `dashing`: aplicar velocidad fija, mover con colisiones, retornar
3. Si `attacking`: frenar horizontal, actualizar timer, retornar
4. Movimiento horizontal con aceleración/fricción
5. Salto en suelo
6. Dash si input y cooldown listo
7. Ataque si input y cooldown listo -> generar `getAttackRect()` y callback
8. `step(dt, solids)` (gravedad + colisiones X/Y)
9. Selección de animación

### Colisiones
`Entity.step()` aplica gravedad, `moveX()` resuelve AABB horizontal (detiene `vx`), `moveY()` resuelve vertical detectando `onGround`.

### Hitbox de Ataque
```js
getAttackRect() {
  const cx = this.x + this.w/2, cy = this.y + this.h/2;
  if (this.facing === 1) return { x: cx, y: cy - attackWidth/2, w: attackRange, h: attackWidth };
  return { x: cx - attackRange, y: cy - attackWidth/2, w: attackRange, h: attackWidth };
}
```

### Daño al Jugador
`hurt(amount, knockbackX)` verifica `invuln <= 0 && !dashing`. Aplica daño, `invuln = 0.9`, knockback vertical/horizontal.

## 4. GameManager - Estado Global
Archivo: `src/game/gameManager.js`

### Estados
`menu | playing | upgrade | gameover | victory | paused`

### Responsabilidades
- Inicializar/cargar habitaciones (`loadRoom`)
- Controlar apertura de puerta al limpiar sala
- Generar 3 mejoras aleatorias con `shuffle`
- Aplicar mejoras al jugador
- Tracking: `runTime`, `roomTime`, `roomsCleared`, `kills`, `totalDamageDealt`
- Gestión de boss intro

### Habitaciones
| Sala | Tipo | Enemigos | Notas |
| --- | --- | --- | --- |
| 0 | TRAINING | 2x Grunt | Tutorial/plataformas, desbloquea mejoras al limpiar |
| 1 | CHALLENGE | Grunt, Charger, Grunt | Más vertical, presión, desbloquea mejoras al limpiar |
| 2 | BOSS | Boss | Intro 2s, Victoria al derrotar |

### Generación de Mejora
```js
generateUpgrades() {
  const pool = shuffle(UPGRADE_POOL);
  this.upgradeOptions = pool.slice(0, 3);
}
```

### Aplicación de Buff
Delegado a `Player.applyBuff(buff)`. Modifica stats in-place y para `heart` cura al máximo.

## 5. Sistema de Ítems/Buffs
`UPGRADE_POOL`:
| id | Efecto |
| --- | --- |
| blade | +1 daño, +4 rango |
| reach | +10 rango, +6 ancho |
| swiftness | +38 velocidad, *0.88 cooldown dash |
| momentum | +36 salto, +70 velocidad dash |
| heart | +1 max HP, cura completa |

Patrón: **Strategy/Data-Driven**. Añadir nuevo buff = nuevo objeto en pool + caso en `applyBuff`.

## 6. Sistema de Combate e Integración
En `src/main.js`:
- **Ataque jugador**: se detecta al inicio del swing (`attackTimer > attackDuration - 0.05`) para golpear una vez por swing (`_hitThisSwing`)
- **Enemigo-Jugador**: colisión AABB directa; Boss usa `getHitbox()` durante ataque
- **Transición puerta**: si puerta abierta y colisión -> modal de mejora (salas 0-1) o Victoria (sala 2)
- **Game Over**: `player.hp <= 0` en estado `playing`

## 7. Renderizado
`Renderer` dibuja en escala de grises con primitivas (`fillRect`, `strokeRect`). Sin spritesheet. Camara con seguimiento + screen shake. `Camera.follow()` usa zona muerta.

## 8. Audio
`AudioManager` usa WebAudio sintetizado. Requiere `unlock()` tras primer input del usuario (política autoplay). Todos los SFX generados proceduralmente.

## 9. Recomendaciones para GitHub
### .gitignore sugerido
```gitignore
# Unity
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
Logs/
UserSettings/

# General
.DS_Store
Thumbs.db
*.log
node_modules/
```

### README ya generado
Ver `README.md` con estructura, controles, ejecución.

### Sugerencias de commits
```bash
git add .
git commit -m "feat: prototipo SIXXPISTOLS HTML5 Canvas (3 salas, jefe, mejoras, HUD)"
git push origin main
```

### GitHub Pages (opcional)
Settings > Pages > Deploy from branch `main` / `(root)`. Accesible en `https://<usuario>.github.io/SIXXpistols/`

## 10. Próximas Mejoras (Opcional)
- Añadir parallax con capas geométricas
- Sistema de combo ligero
- Más tipos de enemigos
- Guardado de récord por tiempo
- Efectos de partículas mínimos
- Soporte para gamepad
