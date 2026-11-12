# Vista previa pendiente de aprobación

12 de noviembre de 2026.

- Niveles: http://127.0.0.1:4173/#niveles
- Preguntas: http://127.0.0.1:4173/#faq
- Talleres con fotos alineadas y espacio compacto: http://127.0.0.1:4173/#talleres
- Rama local: `preview/cortinas-preguntas`.
- Los cambios de esta vista previa no se han subido ni publicado.

Las cinco cortinas se abren con clic, Enter o Espacio. Se puede cambiar de control con Tab o las flechas izquierda/derecha; Escape cierra la cortina abierta. Las imágenes cerradas conservan un filtro de color y la abierta se aclara.

La lista de preguntas se desplaza al colocar el puntero encima y usar la rueda. Ese movimiento no selecciona ni abre respuestas. Al pulsar una pregunta, se amplía y muestra su respuesta; al pulsar otra, la anterior se cierra. Repetir el clic cierra la seleccionada.

El servidor de vista previa debe mantenerse abierto durante la revisión. Para iniciarlo de nuevo desde esta carpeta: `python -m http.server 4173 --bind 127.0.0.1`.
