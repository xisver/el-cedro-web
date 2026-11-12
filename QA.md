# Verificación del rediseño

Primera revisión: 9 de noviembre de 2026. Actualización de escenas: 11 de noviembre de 2026.

## Contenido y recursos

- Cinco niveles: Maternal, Preescolar, Primaria, Secundaria y Bachillerato.
- Se conservaron los talleres por nivel, las 14 preguntas frecuentes, los contactos y los destinos relevantes del original.
- La auditoría actual de 71 referencias de recursos y enlaces no encontró rutas locales ni fragmentos rotos o identificadores duplicados. Las 26 imágenes conservan atributo `alt`.
- Los recursos visuales se sirven desde el repositorio; su procedencia está en `assets/SOURCES.md`.
- WhatsApp y teléfono fijo se conservaron como números distintos, tal como están publicados.

## Pruebas en navegador

Se usaron ventanas de 1440 × 1000 (escritorio), 768 × 1024 (tableta), 390 × 844 y 320 × 780 (móvil).

- Sin desbordamiento horizontal de la página en esos tamaños. La barra de niveles permite desplazamiento horizontal propio en móvil.
- Diseño inspeccionado visualmente en escritorio, tableta y móvil.
- Cambio claro/oscuro y persistencia tras recargar comprobados.
- Enlaces internos y resaltado de sección/nivel al desplazar comprobados.
- Pregunta frecuente abierta y respuesta visible comprobadas.
- Menú móvil: abre, mueve el foco al primer enlace, permite recorrer enlaces con Tab, cierra al elegir destino y cierra con Escape devolviendo el foco al botón.
- No se observaron errores ni advertencias de consola en la sesión de comprobación local.
- El mapa público de Google Maps cargó en la sección de contacto.

## Revisión adicional

- `node --check script.js` pasó.
- Se revisaron los contornos de foco, el enlace para saltar al contenido y los nombres de controles.
- El código y los estilos desactivan el parallax y el revelado animado cuando se solicita movimiento reducido; la prueba de esa preferencia fue revisión de implementación.
- El contenido reside en HTML; la navegación conserva una alternativa visible si JavaScript no se ejecuta.

Las pruebas de tamaño se hicieron en navegador, sin dispositivos físicos. No se enviaron mensajes ni se hicieron llamadas a los contactos del centro. El sitio original y su alojamiento no se modificaron.

## Primera versión de tarjetas (9 de noviembre)

- Seis tarjetas: Inicio, Proyecto, Niveles, Talleres, Preguntas y Contacto.
- Superposición y oscurecimiento progresivo inspeccionados en escritorio (1440 × 1000) y móvil (390 × 844), sin desbordamiento horizontal.
- En móvil se comprobó una transición con la nueva tarjeta a 532 px del borde superior y la tarjeta anterior oscurecida al 23%; la capa no intercepta clics.
- Las tarjetas largas se fijan por su parte inferior después de permitir recorrer todo su contenido.
- Salto Contacto → Proyecto → Niveles y navegación a Bachillerato comprobados. Las secciones quedan bajo el encabezado y el nivel elegido bajo su navegación interna.
- Se revisó que el cambio de altura, el modo oscuro y movimiento reducido mantengan el comportamiento accesible. Movimiento reducido conserva las tarjetas estáticas, sin fijación ni oscurecimiento.
- `node --check stack.js` pasó. Sin JavaScript se conserva la lectura normal de las tarjetas.

## Escenas ajustadas a pantalla (11 de noviembre)

- Estado previo: rama `main` sincronizada con `origin/main` en `347f8bf`, sin cambios locales pendientes. El crédito XisSoft solicitado aún no estaba implementado.
- Logo XisSoft copiado del Cotizador local y verificado sin alteraciones. Visible en el footer, sin inventar un enlace de marca.
- En 1366 × 900, cada una de las seis tarjetas mide 780 px; el nivel queda entre y=106 y y=886, bajo el encabezado.
- En 390 × 844, el nivel queda entre y=82 y y=836. Sin desbordamiento horizontal.
- Un gesto de rueda cambió Maternal → Preescolar manteniendo la misma posición de página. Solo el nivel activo queda visible y accesible; el texto largo puede leerse antes de pasar al siguiente.
- Navegación móvil Contacto → Niveles comprobada tras corregir el ajuste del viewport y la restauración del scroll.
- Carrete de 14 preguntas: escala central 1 y vecinas 0.78; gesto de rueda sobre encabezado avanza a la siguiente pregunta sin mover la sección.
- Se recorrieron los controles hasta 14/14; un nuevo gesto pasó a Contacto, con el hash y la alineación correctos.
- En 844 × 390 se desactiva el modo de escenas: los cinco niveles y las 14 preguntas nativas quedan disponibles en lectura continua, sin recortes.
- Redimensionamiento, modo oscuro, controles de teclado, enlaces profundos y lectura de contenido largo revisados. Los gestos táctiles se revisaron en el código; no se usó dispositivo físico.
- `node --check` pasó para `script.js`, `stack.js`, `levels.js` y `faq-reel.js`. No se observaron errores de la aplicación en consola durante las pruebas.

## Vista previa de cortinas y preguntas (12 de noviembre)

- Cambios locales en `preview/cortinas-preguntas`; sin publicación ni subida a GitHub por petición del usuario.
- Cortinas inspeccionadas en 1366 × 900 y 390 × 844. Cinco controles visibles y sin desbordamiento horizontal.
- Clic en Maternal abre una sola cortina; clic en Preescolar deja cuatro contenidos ocultos y uno abierto. La imagen abierta elimina el filtro de saturación/grises.
- Un gesto de rueda continuó a Talleres manteniendo Preescolar seleccionado: el scroll no cambia el nivel.
- La lista FAQ conserva las 14 preguntas, con cero respuestas abiertas al inicio. En escritorio se muestran varias filas simultáneas.
- La rueda dentro de la lista cambió su scroll de 0 a 264 px, manteniendo el scroll de página en 3216 px y cero respuestas abiertas.
- Clic en una pregunta abrió una respuesta y amplió su texto a 22.5 px frente a 15 px de las demás. Clic en otra mantuvo una sola abierta; repetir el clic dejó cero abiertas.
- Revisión independiente del foco, teclado y alcance del scroll sin bloqueos. `node --check` pasó para los scripts modificados.

## Ajuste de Talleres (vista previa del 12 de noviembre)

- Las tres fotos se alinean por arriba y por abajo, eliminando el escalonado.
- Se redujeron márgenes, altura de imagen y espaciado de listas en escritorio de poca altura.
- En 1170 × 758: contenido cerrado de 592 px dentro de una zona de 592 px, sin scroll interno; el bloque de horarios y contacto queda visible.
- En 1366 × 900: contenido de 715 px dentro de una zona de 715 px; las tres fotos comparten coordenadas superior e inferior.
- La galería desplegable mantiene la zona de lectura desplazable cuando se abre. No se ocultó contenido ni se desactivó el desbordamiento accesible.
- Los cambios permanecieron locales durante la revisión. El usuario aprobó su publicación el 12 de noviembre de 2026.
