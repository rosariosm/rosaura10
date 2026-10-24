# Plan: la esencia hecha a mano

Inspiración: [kevinzeta.com](https://www.kevinzeta.com/). No copiamos su temblor de líneas (los dibujos que alternan versiones casi iguales); eso es de él. Lo que tomamos es la esencia: que la página se sienta dibujada a mano, viva y tocable, con mi trazo y mis dibujos.

## Etapas

Estados de los tickets: `todo` (pendiente), `doing` (en curso), `done` (hecho).

| Etapa | Tickets | Necesita dibujos nuevos |
|---|---|---|
| 1 | RZ-1 Pelos que tiemblan · RZ-2 Cursor de dedo | No |
| 2 | RZ-3 Menú dibujado a mano · RZ-4 Botón de pelos | No |
| 3 | RZ-5 Dibujo del botón del delfín · RZ-6 Botón del delfín | Sí (RZ-5) |
| 4 | RZ-7 Dibujos del delfín · RZ-8 Botones pelos/delfín (navegación) · RZ-9 Animación del delfín con el scroll | Sí (RZ-7) |

El detalle del delfín (referencias, qué dibujar y cómo se anima) está en [plan-delfin.md](./plan-delfin.md). Los tickets RZ-7 a RZ-9 cubren su etapa 1, la prueba de concepto.

La etapa 3 se puede hacer antes que la 4: el botón del delfín existe como "próximamente" hasta que esté la página.

---

## RZ-1 · Pelos que tiemblan

**Estado:** `todo`

**Qué:** que los pelos tiemblen como piel de gallina: una vibración física, rápida y chiquita, que se suma al baile que ya tienen. No cambia el dibujo de cada pelo; solo cómo se mueve.

**Por qué:** es el gesto propio de v2. En kevinzeta tiembla la línea del dibujo; acá tiembla el pelo, como un cuerpo.

**Cómo:**
- Pelos de las piernas (`v2/src/Feet.jsx`): además del vaivén, una vibración de alta frecuencia y poca amplitud en rotación y escala. Se activa sola cada tanto, en ráfagas cortas, y siempre cuando el cursor está cerca, donde ya se erizan.
- Pelos de la galería (`v2/src/HairField.jsx`): la misma vibración en ráfagas, con un desfase entre pelos para que el temblor se propague como una ola y no tiemblen todos a la vez.
- Con `prefers-reduced-motion`, sin temblor: solo el vaivén lento.

**Listo cuando:**
- [ ] Los pelos de las piernas tiemblan en ráfagas y al acercar el cursor.
- [ ] Los pelos de la galería tiemblan en ola.
- [ ] Se nota distinto del baile actual (rápido y chiquito, no un balanceo).
- [ ] Con movimiento reducido no hay temblor.
- [ ] Probado en computadora y celular.

**Dibujos:** ninguno.

---

## RZ-2 · Cursor de dedo en v2

**Estado:** `doing`

**Qué:** reemplazar el cursor por el dedo de la pintura de la mano, el mismo del favicon.

**Cómo:**
- Recortar el dedo de `v2/src/paintings/p1.jpg` con **fondo transparente**. El favicon tiene fondo negro y para cursor no sirve, porque se vería un cuadrado.
- Rotarlo para que la punta quede arriba a la izquierda, donde apunta un cursor, y fijar ahí el punto activo (hotspot).
- Exportar en 32 × 32 y 64 × 64 (pantallas retina) con `image-set`, y dejar el cursor normal como respaldo.
- Ponerle un borde fino oscuro: el dedo es blanco y tiene que verse sobre fondo negro y sobre las pinturas blancas.
- Sobre links y botones, una variante: el dedo apenas inclinado, como apretando.
- En celular no aplica.

**Listo cuando:**
- [ ] En v2 el cursor es el dedo, con la punta como punto activo.
- [ ] Se ve sobre negro y sobre blanco.
- [ ] Sobre links y botones cambia a la variante.
- [ ] Si la imagen no carga, aparece el cursor normal.

**Dibujos:** ninguno, sale de la pintura. Si después querés un dedo dibujado especialmente para el cursor, se reemplaza el archivo.

---

## RZ-3 · Menú dibujado a mano

**Estado:** `todo`

**Qué:** un menú fijo arriba en v2 con botones que son dibujos, no texto: hoy **pelos** y **delfín**, después lo que se sume.

**Cómo:**
- Arriba a la izquierda, chico, sin fondo, sobre negro.
- Cada botón es un dibujo en blanco sobre transparente, procesado igual que los pies.
- Estados:
  - Normal: un poco apagado.
  - Hover: en el de pelos, los pelos se erizan, reusando la lógica de `Feet.jsx`.
  - Activo: blanco pleno, con un subrayado hecho a mano, que es un trazo dibujado y no un borde de CSS.
- Accesibilidad: botones de verdad (`<button>`/`<a>`), con `aria-label` ("pelos", "delfín") y navegables con teclado.
- La navegación entre páginas (`#pelos` / `#delfin`) sale del plan del delfín. Mientras la página del delfín no exista, su botón queda como "próximamente", sin link.

**Listo cuando:**
- [ ] El menú se ve en v2 en computadora y celular, sin tapar el contenido.
- [ ] Hover, activo y foco con teclado funcionan.
- [ ] Lectores de pantalla anuncian "pelos" y "delfín".

**Dibujos:** los de RZ-4 y RZ-5.

**Depende de:** RZ-4. Para que el botón del delfín lleve a algún lado, también de la página del delfín.

---

## RZ-4 · Botón de pelos (pierna con pelos)

**Estado:** `todo`

**Qué:** el botón de pelos es una pierna con pelos, sacada del dibujo de los pies que ya está.

**Cómo:**
- Recortar la pierna izquierda de `v2/src/feet/pie1.png` (base) junto con sus pelos (`pie1-hair-*.png`).
- Armarlo como un mini componente: la pierna fija y sus pelos con el mismo vaivén y el erizado al pasar el mouse.
- Tamaño de botón: unos 48–64 px de alto.

**Listo cuando:**
- [ ] El botón muestra la pierna con pelos que se mueven.
- [ ] Al pasar el mouse los pelos se erizan.
- [ ] A ese tamaño se lee como una pierna.

**Dibujos:** ninguno, ya está hecho.

---

## RZ-5 · Dibujo del botón del delfín (Rosaura)

**Estado:** `todo`

**Qué:** un delfín chiquito para el botón, en el mismo estilo que la pierna.

**Pautas:**
- Tinta negra gruesa sobre papel blanco, de perfil, mirando a la derecha.
- Simple y con pocos detalles: se va a ver a unos 48–64 px. Mejor contorno grueso que líneas finas adentro.
- Opcional: un segundo dibujo, el mismo delfín con la cola en otra posición, para que aletee al pasar el mouse (como los pelos que se erizan).
- Foto de frente, buena luz, a Downloads como siempre.

**Listo cuando:**
- [ ] Hay foto del dibujo en Downloads.

---

## RZ-6 · Botón del delfín

**Estado:** `todo`

**Qué:** procesar el dibujo de RZ-5 y sumarlo al menú.

**Cómo:**
- Mismo proceso que los pies: recorte, blanco y negro, transparente.
- Hover: si hay segundo dibujo, aletea alternando los dos; si no, un pequeño salto.
- Mientras no exista la página del delfín, "próximamente" y sin link.

**Listo cuando:**
- [ ] El botón aparece en el menú con su hover.
- [ ] Cuando exista la página del delfín, lleva a `#delfin`.

**Depende de:** RZ-3 y RZ-5.

---

## RZ-7 · Dibujos del delfín (Rosaura)

**Estado:** `todo`

**Qué:** los dibujos para la prueba de concepto del delfín. Referencias y pautas en [plan-delfin.md](./plan-delfin.md#etapa-1--prueba-de-concepto-lo-justo-y-necesario).

**Dibujos (6):**
- [ ] **swim E**: 4 cuadros (1º, 2º, 4º y 5º de la fila), mirando a la derecha. Todos dentro de cuadrados del mismo tamaño, con una crucecita en el centro y el delfín ocupando lo mismo.
- [ ] **Fondo:** una hoja apaisada; las algas pueden ir dibujadas ahí mismo.
- [ ] **Diamante:** uno solo, de frente.

**Listo cuando:**
- [ ] Están las fotos en Downloads.

---

## RZ-8 · Páginas pelos / delfín

**Estado:** `todo`

**Qué:** v2 pasa a tener dos páginas, **pelos** (lo actual) y **delfín**, que se eligen desde el menú de RZ-3.

**Cómo:**
- Lo actual se mueve a `v2/src/Pelos.jsx` y la página nueva va en `v2/src/Delfin.jsx`. `App.jsx` queda como selector.
- La página elegida se guarda en el hash (`#pelos` / `#delfin`), así se puede compartir el link directo y recargar sin perderla. Sin hash, abre pelos.
- Al cambiar de página se limpian las animaciones de la anterior y el scroll vuelve arriba.

**Listo cuando:**
- [ ] Ir y volver entre las dos páginas varias veces no deja animaciones colgadas.
- [ ] Pelos funciona igual que hoy: zoom, galería y pelitos.
- [ ] `#delfin` abre directo la página del delfín.

**Depende de:** RZ-3.

---

## RZ-9 · Animación del delfín con el scroll (prueba de concepto)

**Estado:** `todo`

**Qué:** el delfín nada y salta mientras se scrollea, estilo *Ecco the Dolphin*, con los dibujos de RZ-7.

**Cómo** (detalle en [plan-delfin.md](./plan-delfin.md#parte-2--implementación-cuando-lleguen-los-dibujos)):
- Recortar y alinear los 4 cuadros de nado como sprite sheet, con el mismo proceso que las pinturas y los pies.
- Escena fija durante el recorrido (GSAP ScrollTrigger, como `v2/src/Gallery.jsx`): el fondo se desplaza y el delfín avanza.
- **Nado:** los 4 cuadros en loop según el scroll, con un vaivén suave.
- **Dirección:** scroll hacia abajo, nada a la derecha; hacia arriba, se espeja con un giro rápido y nada a la izquierda.
- **Salto:** en un tramo, una parábola por encima del agua, rotando según la dirección del vuelo, con los mismos cuadros de nado.
- **Superficie del agua:** línea ondulada en código, como placeholder.
- **Final:** llega al diamante, que gira y brilla.

**Listo cuando:**
- [ ] El recorrido completo funciona hacia abajo y hacia arriba (se espeja).
- [ ] El salto se ve bien en computadora y celular.
- [ ] `npm run serve` muestra todo bien en `/rosaura10/v2/#delfin`.

**Depende de:** RZ-7 y RZ-8.

**Después** (fuera de esta etapa, ver [plan-delfin.md](./plan-delfin.md)): vuelta de verdad (turn E to W), salto arqueado (speed boost E), algas que ondulan, superficie del agua dibujada, burbujas y sonar.
