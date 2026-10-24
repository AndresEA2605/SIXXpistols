# SIXXPISTOLS

Prototipo jugable en **HTML5 Canvas (JavaScript ES Modules)** del proyecto universitario **"ENTREGA #4 - FINAL JUEGO"**. Inspirado en la estética monocromática y jugabilidad fluida de *Hollow Knight*, orientado a un **Roguelike / Hack & Slash 2D Side-Scroller**.

## Objetivo
Superar las 3 salas consecutivas conectadas por puertas. Derrotar enemigos para desbloquear la puerta, elegir entre mejoras aleatorias al pasar de sala y vencer al **Guardián de Hierro** en la sala final.

## Requerimientos Académicos Cumplidos
- [x] **Sistema de Niveles/Habitaciones**: 3 niveles/salas consecutivas conectadas por puertas.
- [x] **Sistema de Vidas / Salud**: Corazones/HP que se reducen al recibir daño.
- [x] **Sistema de Tiempo / Timer**: Contador de tiempo por sala (HUD) y tiempo total en estadísticas finales.
- [x] **Progreso Roguelike**: Tras salas 1 y 2 se presenta un modal con 3 ítems/power-ups aleatorios que potencian al jugador.

## Mecánicas Implementadas
- Movimiento lateral, salto, ataque con espada, dash con invulnerabilidad breve.
- Detección de suelo/plataformas con físicas 2D propias.
- Enemigos: Grunt, Charger. Jefe: Guardián de Hierro (dos fases).
- Sistema de habitaciones con `GameManager`.
- Sistema de mejoras/buffs (`blade`, `reach`, `swiftness`, `momentum`, `heart`).
- HUD (salud, timer, sala, eliminados), menús, Game Over, Victoria con estadísticas.
- Audio sintetizado con WebAudio API.
- Controles táctiles para dispositivos móviles.

## Controles
| Acción | Teclado | Móvil |
| --- | --- | --- |
| Mover | `A` / `D` o `←` / `→` | Botones ◀ / ▶ |
| Saltar | `W`, `Espacio`, `↑` | Botón ▲ |
| Atacar | `J` o `X` | Botón ⚔ |
| Dash | `K` o `Shift` | Botón » |
| Pausa | `ESC` o `P` | — |
| Silenciar | `M` | — |

## Estructura del Proyecto
```text
SIXXPISTOLS/
├── index.html
├── style.css
├── README.md
├── docs/
│   ├── WIREFRAMES_FIGMA.md
│   └── ARQUITECTURA_TECNICA.md
└── src/
    ├── core/
    │   ├── audio.js
    │   ├── camera.js
    │   ├── input.js
    │   └── math.js
    ├── game/
    │   ├── enemies.js
    │   ├── entities.js
    │   ├── gameManager.js
    │   └── player.js
    ├── render/
    │   └── renderer.js
    ├── ui/
    │   ├── hud.js
    │   └── screens.js
    └── main.js
```

## Cómo Ejecutar
Este proyecto usa **módulos ES**. No es posible abrir `index.html` directamente con `file://` en algunos navegadores por restricciones CORS. Usa un servidor local:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .

# VS Code Live Server
# Abrir index.html con Live Server
```

Abrir [http://localhost:8080](http://localhost:8080).

## GitHub
Repositorio: [https://github.com/AndresEA2605/SIXXpistols](https://github.com/AndresEA2605/SIXXpistols)

## Créditos
- Inspirado en *Hollow Knight* (Team Cherry).
- Prototipo creado con fines académicos para **ENTREGA #4 - FINAL JUEGO**.
- Diseño en escala de grises, sin assets externos.
