# Delfín estilo Ecco the Dolphin, animado con el scroll

## Contexto

Rosaura quiere una página aparte con un delfín que nade y salte, al estilo *Ecco the Dolphin*, animado mientras se scrollea. Ella dibuja todo a mano: un fondo, un diamante y el delfín en distintas posiciones, usando los sprites de Ecco como **referencia de poses**. Yo los recorto, los armo como secuencia de cuadros (animación cuadro a cuadro, como un flipbook) y los muevo con el scroll (GSAP ScrollTrigger, igual que la galería de v2).

**Sí tiene sentido.** Los sprites de Ecco son una guía ideal: ya resuelven qué poses hacen falta para que el nado y el salto se lean bien con pocos cuadros. Un detalle: los sprites originales son de Sega, así que **no los publicamos**; los usás solo para copiar las poses, y en la página van tus dibujos.

---

## Etapa 1 — Prueba de concepto (lo justo y necesario)

Arrancamos chico y, si funciona, sumamos dibujos de la Parte 1.

**Dibujos para la prueba (6 en total):**
1. **swim E, 4 cuadros**: el 1º, 2º, 4º y 5º de la fila. Siguen valiendo los tips de "Para que los cuadros encajen": mismo cuadrado, mismo tamaño y una crucecita en el centro.
2. **Un fondo**, apaisado y en una sola hoja. Puede incluir algas dibujadas en el mismo fondo: en esta etapa no se mueven.
3. **El diamante**, uno solo.

**Qué hace la prueba:**
- Botones **pelos / delfín** en v2, como se describe en la Parte 2.
- Al scrollear hacia abajo, el delfín nada hacia la derecha con los 4 cuadros en loop y el fondo se desplaza.
- Al scrollear hacia arriba, **se espeja** y nada hacia la izquierda. El volteo lo hago en código con un giro rápido, sin dibujos de vuelta.
- **Salto:** en un tramo del recorrido, el delfín sigue una parábola y rota según la dirección del vuelo, usando los mismos cuadros de nado. No lleva salpicaduras.
- **Superficie del agua:** la hago en código, con una línea ondulada que se mueve, a modo de placeholder. Más adelante la reemplaza tu dibujo.
- **Final:** el delfín llega al diamante, que gira y brilla.

**Después de la prueba**, se suman en este orden si te gusta cómo va: turn E to W (vuelta de verdad), speed boost E (salto arqueado), algas sueltas que ondulan, superficie del agua dibujada, burbujas, sonar. No hace falta conseguir sprites de agua entrando y saliendo: las salpicaduras las dibujás a ojo cuando lleguemos, o las hago en código.

---

## Parte 1 — Todo lo que se puede dibujar (para etapas siguientes)

Todo con tinta negra gruesa sobre papel blanco liso, como los pies. Foto de frente, buena luz, sin sombras, nada más en la hoja.

### 1. El delfín — cuadros de animación (lo más importante)

Mirando siempre hacia la **derecha** (E). Para nadar hacia la izquierda lo espejo yo.

**Referencia: la hoja con nombres ("Incomplete Sprite Sheet", https://i.pinimg.com/1200x/a3/70/28/a37028a9cca7fe86af5008a9aec3cc85.jpg) es la mejor**, porque cada fila dice qué movimiento es. De esa hoja, dibujá solo estas filas:

**Más referencias:** https://www.spriters-resource.com/sega_genesis/ecco1/ (no la pude abrir desde acá, el sitio bloquea accesos automáticos). Ahí conviene mirar:
- la hoja de **Ecco**, por si tiene más poses o está más completa que la de Pinterest;
- los **Glyphs / cristales**: son el "diamante" de Ecco, muy buena referencia para dibujar el tuyo;
- los fondos de los niveles (por ejemplo **Home Bay**, el primero, que tiene cielo, superficie y fondo marino): referencia para componer el tuyo.

Igual que con el delfín, todo eso es solo para mirar o calcar: en la página van tus dibujos.

**Imprescindibles**
| Fila de la hoja | Cuadros | Para qué la uso |
|---|---|---|
| **swim E** | 6 (o 4: 1º, 2º, 4º, 5º) | Nado en loop mientras scrolleás. |
| **turn E to W** | 6 | Cuando cambiás a scroll hacia arriba: da la vuelta (se ve de frente en el medio) y queda mirando a la izquierda. Al volver a scrollear hacia abajo, la reproduzco al revés. |
| **speed boost E** | los 4 primeros (sin el borroso) | El salto: se arquea al salir del agua. Yo lo hago volar en parábola y lo voy rotando en código según la dirección (subiendo, arriba, cayendo). |

**Opcionales (salto más rico)**
| Fila | Cuadros | Para qué |
|---|---|---|
| **turn E to NE** | 5 | Subida hacia la superficie antes de saltar. |
| **turn E to SE** | 5 | Zambullida después de caer al agua. |
| **sonar E** | 3 | El "canto" de Ecco, por ejemplo cuando llega al diamante. Son solo arcos, muy fáciles. |

**No hacen falta:** swim N, swim S, swim NE, swim SE, idle, turn N to S, speed boost N/SE/NE, y todas las vueltas que pasan por N o S (turn N to NE, NE to N, SE to S, S to SE, NE to E, SE to E). Tampoco los cuadros borrosos de velocidad.

**Total:** 16 dibujos imprescindibles (o 14 con el nado en 4 cuadros), más hasta 13 opcionales.

Los sprites son de Sega, así que **no los publicamos**: los usás para calcar o copiar la pose con tu trazo, y en la página van solo tus dibujos.

**Para que los cuadros encajen entre sí (clave):**
- **Mismo tamaño en todos.** Lo más fácil: dibujá un cuadrado del mismo tamaño en cada hoja (o varios cuadrados iguales en una hoja) y un delfín por cuadrado, ocupando lo mismo.
- **El centro del cuerpo siempre en el centro del cuadrado** (marcá una crucecita guía con lápiz). Como en el salto el delfín va rotando, conviene que gire alrededor de ese centro; así no "salta" de lugar entre cuadros.
- **Mismo largo de delfín en todos**, aunque esté vertical o en diagonal (en la hoja de Ecco pasa igual).
- Si podés, calcá cada cuadro sobre el anterior a contraluz (ventana o pantalla del celular con brillo al máximo). Es el truco clásico de animación.

Tus referencias (solo para mirar, en la página van tus dibujos):
- Fondo: https://www.spriters-resource.com/sega_genesis/ecco1/asset/141812/
- Algas: https://www.spriters-resource.com/sega_genesis/ecco1/asset/141767/
- Diamante: https://www.spriters-resource.com/sega_genesis/ecco1/asset/141688/
- Agua (cómo se mueve): https://youtu.be/WcAHjSKcwOs?t=16

### 2. El fondo (rocas y fondo marino)

- **Horizontal y largo**, porque con el scroll el delfín avanza y el fondo se desplaza. Puede ser una tira larga, o 2–3 hojas apaisadas que **empalmen** (el borde derecho de una sigue en el izquierdo de la otra).
- **Sin las algas y sin la superficie del agua**: esas van en hojas aparte (puntos 3 y 4), para poder moverlas por separado.
- Si querés más profundidad, hacé dos capas en hojas separadas: una lejana (rocas grandes, siluetas) y una cercana. Las muevo a distinta velocidad (parallax).

### 3. Las algas

- **Cada alga en su propio dibujo**, separadas en la hoja, con la **base plana abajo** (donde se apoya en el fondo). Así las planto en el fondo y las hago ondular desde la base, como los pelitos.
- 4–6 algas de distintas alturas y formas alcanzan; las repito y espejo para que no se note.

### 4. La superficie del agua

- Una **tira horizontal de olas**, larga y finita, con el borde izquierdo y el derecho **terminando a la misma altura**, para repetirla en loop sin que se note el corte.
- El brillo y el vaivén de la superficie (como en el video) los hago en código: la tira se desplaza y ondula, y debajo agrego franjas de luz que tiemblan.
- Opcional: 2–3 versiones de la misma tira con las olas un poco corridas, para alternarlas como cuadros.

### 5. El diamante

- Uno solo, de frente, simétrico, como el cristal de la referencia. Lo hago girar y brillar en código.
- Opcional: 2–3 cuadros de brillo (destellos chicos, medianos, grandes).

### 6. Extras opcionales (lo complementan muy bien)
- Burbujas: una hoja con 6–10 de distintos tamaños, separadas.
- Salpicaduras: 2–3 cuadros, de chica a grande, para cuando sale y entra al agua.

---

## Parte 2 — Implementación (cuando lleguen los dibujos)

**Dónde:** dentro de **v2**, con **dos botones** fijos arriba: **pelos** (lo actual) y **delfín**. Cada botón muestra su página; no se crea una versión nueva.

### Botones pelos / delfín
- `v2/src/App.jsx` pasa a ser el selector: dos botones (estilo monospace de v2, el activo subrayado en hotpink como el hover de "Lo viejo funciona Juan").
- Lo actual se mueve tal cual a un componente `v2/src/Pelos.jsx` (hero con `Feet` + `Gallery`). La página nueva es `v2/src/Delfin.jsx`.
- La selección se guarda en el hash de la URL (`#pelos` / `#delfin`), así se puede compartir el link directo a cada una y recargar sin perder la página. Sin hash → pelos.
- Al cambiar de página se desmonta la anterior: sus animaciones y ScrollTriggers se limpian solos (`ctx.revert()` ya está en cada componente) y el scroll vuelve arriba (`ScrollTrigger.refresh()` después del cambio).
- "Lo viejo funciona Juan" y su degradé quedan en las dos páginas.

### Recursos del delfín
- Procesar las fotos con el mismo pipeline que las pinturas (`tools/paint.sh` en el scratchpad: perspectiva + gris + umbral) y el recorte con alfa de los pies (`tools/split.py`). Los cuadros del delfín se alinean por su cuadrado guía y se exportan todos al mismo tamaño como sprite sheet.

### Animación con el scroll (GSAP ScrollTrigger, como `v2/src/Gallery.jsx`)
- Escena fija (pin) durante todo el recorrido; el progreso del scroll mueve el fondo hacia la izquierda (parallax por capas) y el delfín avanza por el mar.
- **Nado:** los cuadros del loop avanzan según el scroll (más scroll = más aletazos), con un vaivén suave arriba/abajo.
- **Dirección:** scroll hacia abajo → nada hacia la derecha; scroll hacia arriba → el delfín se **espeja y nada hacia la izquierda**, volviendo por donde vino (uso `self.direction` de ScrollTrigger). Al cambiar de dirección se reproducen los 6 cuadros de **turn E to W** (y al revés para volver a mirar a la derecha); después nada con **swim E** espejado. Si scrolleás para arriba en medio de un salto, el salto se reproduce al revés, también espejado.
- **Salto:** en uno o dos tramos del recorrido, el delfín sigue una parábola por encima de la línea del agua usando los cuadros de **speed boost E**, rotados según la dirección del vuelo, con salpicadura al salir y al entrar. Si dibujás **turn E to NE / E to SE**, los uso para la subida y la zambullida.
- **Final:** llega al diamante, que gira y brilla; cierre con un texto (a definir con vos).
- Burbujas que suben siempre, independientes del scroll.
- Blanco y negro como v2, o con azules tipo Ecco: lo decidimos con los dibujos.

### Verificación
- `npm run dev:v2` → http://localhost:5174/#delfin ; recorrer el scroll completo hacia abajo y hacia arriba (que se espeje).
- Cambiar entre los dos botones varias veces: pelos tiene que seguir funcionando igual que hoy (zoom, galería, pelitos) y no deben quedar animaciones colgadas de la otra página.
- `npm run build && npm run serve` → http://localhost:4173/rosaura10/v2/#delfin (chequeo de base path del `CLAUDE.md`).
- Capturas con Playwright en tamaño computadora y celular, cerrando el navegador de prueba al terminar.
- Commit/push solo cuando lo pidas.
