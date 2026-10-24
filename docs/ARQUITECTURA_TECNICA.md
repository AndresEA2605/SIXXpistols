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

### Flujo `update(input, dt, solids, onAttack, onAbility)`
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
`menu | intro | playing | fistPickup | gameover | victory | paused`

### Responsabilidades
- Inicializar/cargar salas (`loadCurrentRoom`)
- Controlar apertura de puerta al limpiar sala
- Recorrer 17 salas con escenarios fijos y encuentros de cantidad, tipo y posición de enemigos variables
- Gestionar recolección de brazos elementales y mejoras de partida
- Tracking: `runTime`, `kills`, `totalDamageDealt`
- Presentar el prólogo, la recuperación del brazo y el combate final contra Moro

### Habitaciones
| Sala | Tipo | Enemigos | Notas |
| --- | --- | --- | --- |
| 0 | INTRO | Ninguno | Escenario seguro; recoge el brazo de fuego del altar |
| 1-2, 4-5, 7-8, 10-11, 13-14 | COMBATE | Cantidad y tipos variables | Dos encuentros antes de cada guardián |
| 3, 6, 9, 12, 15 | GUARDIÁN | Un guardián escalado | Al derrotarlo aparece el siguiente brazo elemental |
| 16 | JEFE | Moro | Encuentro final fijo |

## 5. Sistema de Ítems/Buffs
Las mejoras fijas de cada sala se recogen al tocarlas:
| id | Efecto |
| --- | --- |
| heart | Recupera hasta 2 puntos de salud |
| vitality | Aumenta 1 punto de salud máxima y cura 1 |
| power | Aumenta el daño de los ataques durante la partida |

## 6. Sistema de Combate e Integración
En `src/main.js`:
- **Ataque jugador**: se detecta al inicio del swing (`attackTimer > attackDuration - 0.05`) para golpear una vez por swing (`_hitThisSwing`)
- **Enemigo-Jugador**: colisión AABB directa y proyectiles enemigos; Moro es el jefe final
- **Brazos**: seis poderes distintos se activan con `L/C`; cambiar brazo usa `Q/Tab`
- **Transición puerta**: requiere limpiar el encuentro; las salas con un brazo también requieren recogerlo
- **Game Over**: `player.hp <= 0` en estado `playing`

## 7. Renderizado
`Renderer` dibuja escenarios, enemigos, brazos e ítems con primitivas Canvas. Sin spritesheet. Cámara con seguimiento y screen shake.

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
git commit -m "feat: aventura de Ardan con seis brazos y salas de combate"
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
