# Centro Educativo El Cedro

Recreación del sitio público del Centro Educativo El Cedro, Cuautla, Morelos, con una presentación moderna, adaptable y accesible. Conserva el proyecto educativo, los cinco niveles de Maternal a Bachillerato CCH UNAM, los talleres, las preguntas frecuentes y los canales de contacto.

## Ver el sitio localmente

Desde esta carpeta, con Python instalado:

```sh
python -m http.server 4173
```

Abre [http://localhost:4173](http://localhost:4173). Detén el servidor con `Ctrl+C`.

El sitio usa HTML, CSS y JavaScript nativos. No necesita instalación de paquetes, compilación ni servicios de servidor.

## Experiencia e interacción

- Paleta institucional basada en verde cedro, marfil y dorado.
- Modo claro y oscuro: al iniciar sigue la preferencia del sistema; la elección del visitante se guarda en el navegador mediante `localStorage`.
- Revelado al desplazar, movimiento sutil de la imagen de portada e indicador de avance de lectura.
- Respeto de la preferencia de movimiento reducido; el contenido también puede consultarse cuando JavaScript no está disponible.
- Navegación móvil, enlace para saltar al contenido, controles con nombres accesibles y preguntas desplegables nativas.

## Estructura

- `index.html`: contenido y estructura de la página.
- `styles.css`: diseño, temas y adaptaciones de tamaño.
- `script.js`: navegación, tema e interacciones de desplazamiento.
- `assets/`: fotografías, escudo, distintivos y fuentes recuperados de rutas públicas.
- `assets/SOURCES.md`: procedencia de los recursos.
- `content-audit.md`: inventario del contenido y los enlaces del original.

## Contacto y servicios externos

No hay backend, registro de usuarios ni formulario que almacene datos. Los botones de contacto abren WhatsApp, el correo o la llamada telefónica del visitante. Facebook, Google Maps y el aviso de privacidad mantienen sus destinos públicos relevantes. El mapa incrustado carga contenido de Google Maps.

WhatsApp: `+52 735 200 0745`. Teléfono: `+52 735 398 7070`. Correo: `contacto@cedro.edu.mx`. Se respetó la diferencia entre el número de WhatsApp y el teléfono publicados por el centro.

## Publicación en GitHub Pages

Repositorio previsto: [xisver/el-cedro-web](https://github.com/xisver/el-cedro-web).

En **Settings → Pages**, seleccionar **Deploy from a branch**, rama **main**, carpeta **/ (root)**. El archivo `.nojekyll` permite servir directamente los archivos estáticos. Las rutas relativas admiten la publicación bajo la subruta del repositorio.

URL prevista: [https://xisver.github.io/el-cedro-web/](https://xisver.github.io/el-cedro-web/). Su estado de publicación debe comprobarse después del despliegue.

## Fuentes y actualización del contenido

Fuente inspeccionada el 9 de noviembre de 2026: [sitio público original](https://www.cedro.edu.mx/index.html). Las fotografías y la identidad conservan los derechos de sus titulares; su disponibilidad pública no implica una licencia abierta. La fuente Comic Neue incluye su licencia SIL Open Font License en `assets/fonts/OFL.txt`.

La promoción de Bachillerato de **25% de descuento en inscripción y 20% en colegiatura** proviene del original y no indica vigencia. La página invita a confirmar disponibilidad y condiciones directamente con el colegio. Las afirmaciones institucionales, incluida la antigüedad de 15 años, reproducen la información publicada en la fecha de revisión y deben actualizarse cuando corresponda.

Este proyecto es una nueva implementación independiente. No se modificó el sitio original ni su alojamiento.
