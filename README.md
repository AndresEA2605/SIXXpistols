# SIXXPISTOLS

Roguelike de acción y plataformas 2D sobre Ardan, un guerrero de seis brazos que defendió su ciudad de Moro durante la guerra de 1878. Tras perder sus brazos, despierta en una sala segura y encuentra el brazo de fuego en un altar antes de entrar en combate.

## Concepto

- **Seis brazos elementales**: Fuego permite volar mientras mantienes el poder y tengas reserva, que se recarga en el suelo; agua dispara proyectiles; tierra invoca súbditos vegetales; aire aturde con ráfagas; rayo encadena impactos; vacío permite atravesar el espacio y herir en el trayecto.
- **Búsqueda con progresión**: Ardan despierta desarmado en una sala de introducción segura y recoge el brazo de fuego de un altar. Después de cada dos salas de combate aparece un guardián; al vencerlo, entrega uno de los otros cinco brazos.
- **Mejoras**: Encuentra corazones, placas de vitalidad, esquirlas de daño, grebas de velocidad y núcleos propulsores que amplían y aceleran el vuelo. Las mejoras también alteran físicamente la armadura de Ardan.
- **Salas consistentes y enemigos variables**: La ruta tiene 17 salas: introducción, combates, cinco guardianes y Moro. Los escenarios mantienen sus diseños, mientras que varían la cantidad, el tipo y la posición de los enemigos.
- **Exploración**: 17 salas conectadas con plataformas colocadas a mano. Las cinco salas de guardián culminan cada tramo de progresión y entregan un brazo elemental.
- **Combate**: Grunts, crawlers, cargadores, tiradores, voladores y Moro. Cada brazo añade un estilo de ataque y una habilidad propia.
- **Curación**: H restaura 1 punto con una carga inicial. Cada seis impactos recarga una carga; la Esencia Vital aumenta la curación y las cargas disponibles.
- **Acción y plataformas**: Salto con tolerancia al borde, dash con invulnerabilidad, ataques, poderes elementales, esquiva de proyectiles y mejoras permanentes para la partida.

## Controles

| Acción | Teclado | Móvil |
| --- | --- | --- |
| Mover | `A` / `D` o `←` / `→` | Botones ◀ / ▶ |
| Mirar arriba / golpe vertical | `W` / `↑` + atacar | Botón ⌃ + ataque |
| Saltar | `Espacio` | Botón ▲ |
| Atacar | `J` o `X` | Botón ⚔ |
| Dash | `K` o `Shift` | Botón » |
| Cura pequeña | `H` | Botón ♥ |
| Habilidad del brazo | `L` o `C` | Botón ✦ |
| Cambiar brazo | `Q` o `Tab` | Botón ↻ |
| Pausa | `ESC` o `P` | — |
| Silenciar | `M` | — |

## Cómo Ejecutar

Abrir `index.html` con un servidor local (requerido por ES Modules).

```bash
# Con Python
python -m http.server 8000
# O con Node
npx serve .
```

Luego abrir `http://localhost:8000`

## Estructura

```text
SIXXPISTOLS/
├── index.html
├── style.css
├── src/
│   ├── core/      # Utilidades, input, audio, cámara
│   ├── game/      # Lógica del juego
│   │   ├── fists/ # Sistema de 6 puños con elementos
│   │   ├── loot/  # Recolección de puños
│   │   ├── rooms/ # Escenarios fijos y encuentros variables
│   │   └── ...
│   ├── render/    # Renderer monocromático
│   └── ui/        # HUD y pantallas
└── docs/          # Documentación
```
