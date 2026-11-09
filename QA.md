# Verificación del rediseño

Fecha: 9 de noviembre de 2026.

## Contenido y recursos

- Cinco niveles: Maternal, Preescolar, Primaria, Secundaria y Bachillerato.
- Se conservaron los talleres por nivel, las 14 preguntas frecuentes, los contactos y los destinos relevantes del original.
- La auditoría de 64 referencias de recursos y enlaces no encontró rutas locales ni fragmentos rotos o identificadores duplicados. Todas las imágenes conservan atributo `alt`.
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

## Tarjetas que se superponen

- Seis tarjetas: Inicio, Proyecto, Niveles, Talleres, Preguntas y Contacto.
- Superposición y oscurecimiento progresivo inspeccionados en escritorio (1440 × 1000) y móvil (390 × 844), sin desbordamiento horizontal.
- En móvil se comprobó una transición con la nueva tarjeta a 532 px del borde superior y la tarjeta anterior oscurecida al 23%; la capa no intercepta clics.
- Las tarjetas largas se fijan por su parte inferior después de permitir recorrer todo su contenido.
- Salto Contacto → Proyecto → Niveles y navegación a Bachillerato comprobados. Las secciones quedan bajo el encabezado y el nivel elegido bajo su navegación interna.
- Se revisó que el cambio de altura, el modo oscuro y movimiento reducido mantengan el comportamiento accesible. Movimiento reducido conserva las tarjetas estáticas, sin fijación ni oscurecimiento.
- `node --check stack.js` pasó. Sin JavaScript se conserva la lectura normal de las tarjetas.
