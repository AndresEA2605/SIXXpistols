# Guía para Diseñar los Wireframes en Figma (Escala de Grises)

Objetivo: Crear wireframes low-fidelity en **escala de grises** siguiendo el concepto *Hollow Knight*-like para el proyecto SIXXPISTOLS.

## Configuración Inicial en Figma
1. Crear nuevo archivo: `SIXXPISTOLS_WIREFRAMES`
2. Crear Frame: `Desktop 16:9` (1024 × 576) o `Web 1280 × 720`
3. Paleta de grises sugerida:
   - Fondo: `#101010`
   - Superficies/Panels: `#151515`
   - Bordes/Lines: `#2A2A2A`
   - Texto Primario: `#E6E6E6`
   - Texto Secundario: `#B9B9B9`
   - Texto Deshabilitado: `#8A8A8A`
   - Elementos activos: `#F5F5F5`
   - Vacío/Deshabilitado: `#4A4A4A`

## 1. Pantalla de Menú Principal
**Frame:** 1024 × 576

### Layout
- **Logo** (Arriba-Centro): `SIXXPISTOLS` con tracking amplio (800). Subtítulo `ROGUELIKE · HACK & SLASH · 2D SIDE-SCROLLER`
- **Menú Vertical** (Centro): Botones
  1. `INICIAR JUEGO` (estilo primario - borde visible)
  2. `INSTRUCCIONES`
  3. `CRÉDITOS`
  4. `SONIDO ON/OFF`
- **Footer** (Abajo): `ENTREGA #4 - FINAL JUEGO | UNIVERSITARIO | INSPIRADO EN HOLLOW KNIGHT`

### Notas de Diseño
- Fondo con gradiente radial sutil (oscuridad céntrica)
- Sin iconos decorativos. Solo tipografía geométrica/monoespaciada
- Botones minimalistas, sin sombras, con borde fino

### Componentes Figma
- `Component/MenuButton` (Default/Hover)
- `Component/Logo`

## 2. Interfaz en Juego (HUD)
**Frame:** 1024 × 576 (Overlay sobre gameplay)

### Elementos
| Zona | Elemento | Descripción |
| --- | --- | --- |
| Superior Izquierda | **Salud - Corazones** | Conjunto de corazones: lleno `♥` (#F5F5F5), vacío `♥` (#4A4A4A). Texto `SALUD` + `X / Y` |
| Superior Centro | **Timer Sala** | Etiqueta `TIEMPO SALA`. Valor `00:00` en formato monoespaciado con letter-spacing amplio |
| Superior Derecha | **Sala Actual** | `SALA 1 · ENTRENAMIENTO` / `SALA 2 · DESAFÍO` / `SALA 3 · JEFE`. Texto `ELIMINADOS: N` |
| Inferior Centro | **Hint de Controles** | `J / X ATACAR · K / SHIFT DASH · A/D MOVER · ESPACIO SALTAR · ESC PAUSA` (texto tenue) |

### Guía
- Paneles con fondo semitransparente `#141414CC` y borde `#2A2A2A`
- Sin barras de degradado coloridas. Únicamente tonos grises
- Máxima legibilidad sobre fondo oscuro

### Componentes
- `HUD/HealthGroup`
- `HUD/TimerGroup`
- `HUD/RoomGroup`

## 3. Pantalla de Selección de Ítems / Puerta (Modal entre Salas)
**Frame:** 1024 × 576

### Layout
- **Backdrop** semioscuro que atenúa el gameplay
- **Header** (Centro-Superior): `PUERTA DESBLOQUEADA` + `ELIGE UNA MEJORA PARA TU PRÓXIMA SALA`
- **Grid de 3 Cards** (Centro): Horizontal
  - Icono geométrico (espada, flecha/alcance, rayo)
  - Título: `HOJA AFILADA`, `ESTOCADA LARGA`, etc.
  - Descripción corta: `+1 DAÑO \| +ALCANCE`
  - CTA: `SELECCIONAR`

### Comportamiento Visual
- Card base: borde `#2A2A2A`, fondo `#181818`
- Hover: borde `#3F3F3f`
- Sin animaciones exageradas. Solo cambio de borde/brillo sutil

### Componentes
- `Modal/UpgradeCard` (Default/Selected/Hover)

## 4. Pantalla de Game Over y Pantalla de Victoria
**Frame:** 1024 × 576

### Game Over
- Título: `GAME OVER` (letter-spacing 600)
- Subtítulo: `HAS CAÍDO EN EL SUBSUELO`
- Panel de estadísticas:
  - `TIEMPO TOTAL` — `00:00.00`
  - `SALAS COMPLETADAS` — `0`
  - `ENEMIGOS ELIMINADOS` — `0`
  - `DAÑO INFLIGIDO` — `0`
- Botones: `REINTENTAR` (primario), `VOLVER AL MENÚ`

### Victoria
- Título: `VICTORIA` (más claro/brillante que Game Over)
- Subtítulo: `EL JEFE HA SADO DERROTADO`
- Mismas estadísticas, con `SALAS COMPLETADAS: 3`
- Botón: `VOLVER AL MENÚ`

### Notas
- Game Over: backdrop más oscuro
- Victoria: backdrop ligeramente más claro/atenuado
- Líneas divisorias entre estadísticas `#2A2A2A`

### Componentes
- `Screen/StatsPanel`
- `Screen/ResultHeader`

## Sugerencias para Auto Layout y Variantes
- Usar **Auto Layout** en todos los botones/paneles
- Crear **Component Sets** con variantes: `State=Default|Hover|Pressed`
- Usar **Grid** 12px para espaciados consistentes
- Usar fuente monoespaciada (JetBrains Mono, Roboto Mono, IBM Plex Mono)
- Mantener todo en **Frame 1024×576** para coincidir exactamente avec el prototipo Canvas

## Checklist Wireframe
- [ ] Menú Principal completo
- [ ] HUD Overlay
- [ ] Modal de Mejoras
- [ ] Game Over
- [ ] Victoria
- [ ] Vista de pausa opcional
- [ ] Paleta de grises aplicada
- [ ] Tipografía monoespaciada
- [ ] Espaciados consistentes
- [ ] Sin colores saturados
- [ ] Coincide con estructura UI del código
