# Estados de componentes

Los controles interactivos comparten un foco visible de `3px #4b3a78`, objetivos mínimos
de 44 × 44 px y nunca comunican una respuesta únicamente mediante color.

| Estado | Representación |
|---|---|
| Default | Fondo crema/blanco, borde pixel de 3 px y texto tinta. |
| Hover | Elevación de 2–4 px y cambio de superficie; no altera el significado. |
| Focus | Contorno sólido de 3 px `#4b3a78` con separación de 3 px. |
| Activo | Desplazamiento vertical de 1–2 px; navegación subrayada. |
| Deshabilitado | Opacidad 58%, tramado y cursor `not-allowed`. |
| Seleccionado | Superficie lavanda, marco interior dorado o tecla lavanda. |
| Correcto | Superficie menta, símbolo `✓` y texto “Correcto”. |
| Incorrecto | Superficie rosa, símbolo `✗` y texto “Incorrecto”. |

Las opciones de reactivos son `input[type=radio]`; el mensaje de resultado usa
`aria-live="polite"`. Las confirmaciones de examen e importación usan diálogos de alerta.

## Hadas y paisajes oficiales

- `Hada`: reposo alterna `00/01`; selección usa `05/01`; correcto usa `02/04`;
  incorrecto alterna `06/07`; nivel y fin de simulacro usan `03/04`; deshabilitado usa `08`.
- Los PNG se precargan y se intercambian completos mediante temporizador; no se recortan.
- `Escena`: la tira oficial cambia con `steps(4)` cada 320 ms. En movimiento reducido
  queda fija en el fotograma inicial y el hada permanece en reposo.
- Selector: default muestra el estado apagado; hover conserva el estado; focus y seleccionado
  muestran el contorno oficial `elegido` además del foco pixel punteado.
