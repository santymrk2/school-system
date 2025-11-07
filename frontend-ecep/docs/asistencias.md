# Asistencias

## 1. Introducción
La sección **Asistencias** le permite consultar, registrar y editar la asistencia diaria de los alumnos. La vista se adapta automáticamente a su rol (docente, personal directivo, familia/estudiante) mostrando sólo las herramientas y datos que le corresponden.



## 2. Roles y Permisos
- **Administración**: no tiene acceso; verá un mensaje 403 al intentar ingresar.


- **Docentes**: acceden a las secciones asignadas, pueden crear jornadas nuevas, revisar historiales rápidos y abrir la vista completa de jornada.


- **Personal directivo (staff)**: visualiza todas las secciones del período, navega a los historiales completos pero no crea jornadas desde la vista general.


- **Familias y estudiantes**: consultan el resumen de asistencia de los alumnos vinculados y el calendario del período activo.


- **Restricciones adicionales**: la vista de historial de sección sólo permite acceso a docentes asignados o personal; perfiles no autorizados reciben mensajes 403 específicos.



## 3. Acceso a la Sección
### Paso 1: Abrir el módulo Asistencias
- **Acción**: Seleccione “Asistencia” en el menú principal del panel.
- **FOTO-ADJUNTA**: Captura del panel con el menú lateral resaltando “Asistencia”.
- **Resultado esperado**: Se muestra la portada de Asistencias con el encabezado adaptado a su rol.



## 4. Funcionalidades

### 4.1 Consultar secciones asignadas (Docentes)
**Descripción**: Visualiza tarjetas por sección con resumen de alumnos y accesos rápidos.
**Ubicación**: Portada de Asistencias → pestañas “Primario” o “Inicial”.



#### Procedimiento:
**Paso 1: Elegir nivel**
- **Acción**: Use las pestañas “Primario” o “Inicial”.
- **Ubicación**: Barra de pestañas sobre las tarjetas.
- **Datos requeridos**: N/A.
- **Validaciones**: N/A.
- **FOTO-ADJUNTA**: Pestañas de nivel con la activa resaltada.
- **Resultado esperado**: Se actualiza la grilla de tarjetas según el nivel.

**Paso 2: Revisar tarjeta de sección**
- **Acción**: Lea título, turno y cantidad de alumnos.
- **Ubicación**: Cada tarjeta dentro de la grilla.
- **Datos requeridos**: N/A.
- **Validaciones**: Si no hay datos, se mostrará “Sin datos” o mensajes de carga.


- **FOTO-ADJUNTA**: Tarjeta mostrando grado/división y badges de turno/alumnos.
- **Resultado esperado**: Visualiza información resumida para decidir la acción siguiente.

#### Mensajes del Sistema:
- ✅ **Éxito**: Contadores de alumnos cargados correctamente.


- ❌ **Error**: “No se pudo obtener el recuento de alumnos...” cuando hay fallas parciales o totales.


- ⚠️ **Advertencia**: “No tenés secciones asignadas.” si la lista está vacía.


#### Casos Especiales:
- Las pestañas cambian automáticamente si sólo hay secciones de un nivel.



### 4.2 Crear nueva jornada desde tarjeta docente
**Descripción**: Inicia una jornada de asistencia para una sección y fecha específicas.
**Ubicación**: Botón “Nueva jornada” dentro de cada tarjeta docente.



#### Procedimiento:
**Paso 1: Abrir diálogo**
- **Acción**: Presione “Nueva jornada”.
- **Ubicación**: Botón dentro de la tarjeta.
- **Datos requeridos**: N/A.
- **Validaciones**: El botón se deshabilita si el trimestre no está activo (ver tooltip).


- **FOTO-ADJUNTA**: Tarjeta con el botón “Nueva jornada” resaltado.
- **Resultado esperado**: Se abre el diálogo “Nueva asistencia — [Sección]”.



**Paso 2: Seleccionar fecha**
- **Acción**: Abra el selector, elija una fecha hábil dentro del trimestre activo.
- **Ubicación**: Campo “Fecha” del diálogo.
- **Datos requeridos**: Fecha (YYYY-MM-DD).
- **Validaciones**: 
  - Debe existir un trimestre activo que contenga la fecha.
  - No se aceptan fines de semana.
  - No puede repetirse un día con jornada existente.


- **FOTO-ADJUNTA**: Selector de fecha mostrando días válidos y mensajes de error en rojo.
- **Resultado esperado**: La fecha se marca y cualquier error desaparece.

**Paso 3: Confirmar creación**
- **Acción**: Pulse “Crear”.
- **Ubicación**: Barra inferior del diálogo.
- **Datos requeridos**: N/A.
- **Validaciones**: Botón deshabilitado si hay error activo o proceso en curso.


- **FOTO-ADJUNTA**: Botones “Cancelar” y “Crear” con el mensaje de éxito emergente.
- **Resultado esperado**: Se crea la jornada, aparece un toast de éxito y se cierra el diálogo.



#### Mensajes del Sistema:
- ✅ **Éxito**: “Jornada creada — [Sección] — [Fecha]”.


- ❌ **Error**: “Error creando jornada” o mensaje del servidor al fallar la creación.


- ⚠️ **Advertencia**: 
  - “No se pueden crear jornadas los fines de semana.”
  - “Ya existe una jornada para este día.”
  - “La fecha seleccionada no pertenece a un trimestre activo.”


#### Casos Especiales:
- Si no hay trimestres activos, el calendario queda bloqueado dentro del rango anual configurado.



### 4.3 Consultar historial rápido y editar desde Vista Docente
**Descripción**: Desde la tarjeta docente, abra el historial resumido del trimestre y edite una jornada puntual.
**Ubicación**: Botón “Historial” dentro de cada tarjeta.



#### Procedimiento:
**Paso 1: Abrir historial resumido**
- **Acción**: Pulse “Historial”.
- **Ubicación**: Botón secundario de la tarjeta.
- **Datos requeridos**: N/A.
- **Validaciones**: N/A.
- **FOTO-ADJUNTA**: Diálogo con lista de jornadas y porcentajes.
- **Resultado esperado**: Aparece un diálogo con jornadas del período indicado y porcentajes por día.



**Paso 2: Abrir edición rápida**
- **Acción**: Seleccione “Ver / Editar” en la jornada deseada.
- **Ubicación**: Botón dentro de cada fila del diálogo.
- **Datos requeridos**: N/A.
- **Validaciones**: N/A.
- **FOTO-ADJUNTA**: Botón “Ver / Editar” resaltado en la fila.
- **Resultado esperado**: Se abre el diálogo “Asistencia del [fecha]” para marcar presentes/ausentes.



#### Mensajes del Sistema:
- ✅ **Éxito**: El porcentaje se actualiza y puede verse el progreso en el diálogo.


- ❌ **Error**: “No se pudo guardar” si falla la actualización; “No se pudo cargar el detalle” al abrir el diálogo.


- ⚠️ **Advertencia**: Estado “Guardando…” mientras se persiste cada cambio.


#### Casos Especiales:
- Si no hay alumnos activos en la fecha seleccionada, se muestra un mensaje informativo en el diálogo.



### 4.4 Registrar asistencia masiva (Diálogo Nueva Asistencia)
**Descripción**: Crea jornada y carga asistencia para todos los alumnos de una sección en modo paso a paso o tabla.
**Ubicación**: Se abre desde el botón “Nueva Asistencia” en la vista docente cuando exista trimestre activo.



#### Procedimiento:
**Paso 1: Configurar fecha**
- **Acción**: Seleccione la fecha dentro del rango del trimestre.
- **Ubicación**: Campo “Fecha”.
- **Datos requeridos**: Fecha (YYYY-MM-DD).
- **Validaciones**: Dentro del trimestre, sin duplicados ni fines de semana.


- **FOTO-ADJUNTA**: Campo de fecha con mensaje de validación visible.
- **Resultado esperado**: Fecha válida sin errores.

**Paso 2: Elegir modo de carga**
- **Acción**: Seleccione “Paso a paso” o “Tabla”.
- **Ubicación**: Selector “Modo”.
- **Datos requeridos**: N/A.
- **Validaciones**: N/A.
- **FOTO-ADJUNTA**: Selector con ambas opciones visibles.
- **Resultado esperado**: Se actualiza la vista de marcación.

**Paso 3: Marcar asistencia**
- **Acción**: Según modo elegido:
  - Paso a paso: use “Presente” o “Ausente” y avance con “Siguiente”.
  - Tabla: marque cada fila con los botones disponibles.
- **Ubicación**: Sección inferior del diálogo.
- **Datos requeridos**: Estado por alumno.
- **Validaciones**: Los botones están activos aunque no haya datos previos; si no hay alumnos se muestra aviso.
- **FOTO-ADJUNTA**: Lista de alumnos con botones de marcación resaltados.
- **Resultado esperado**: Cada alumno queda con estado seleccionado (por defecto “Presente”).



**Paso 4: Guardar**
- **Acción**: Pulse “Guardar”.
- **Ubicación**: Barra inferior del diálogo.
- **Datos requeridos**: N/A.
- **Validaciones**: Botón deshabilitado si la fecha está fuera de trimestre, no hay alumnos o existe error.
- **FOTO-ADJUNTA**: Botón “Guardar” activo.
- **Resultado esperado**: Se crea la jornada y se registran los detalles en lote.



#### Mensajes del Sistema:
- ✅ **Éxito**: “Asistencia guardada”.


- ❌ **Error**: “Error al guardar” si el proceso falla; “No hay trimestre activo” cuando no existe trimestre disponible.


- ⚠️ **Advertencia**: Mensajes de duplicado o fin de semana idénticos al diálogo de jornada.


#### Casos Especiales:
- El modo paso a paso muestra contador “X / N” y botones “Anterior/Siguiente”; el modo tabla permite repasar todo el curso en paralelo.



### 4.5 Consultar historial completo de sección
**Descripción**: Muestra jornadas del trimestre, calendario interactivo y resumen por alumno.
**Ubicación**: Desde la portada (docente o staff) al pulsar “Historial” o al navegar a `/dashboard/asistencia/seccion/[id]`.



#### Procedimiento:
**Paso 1: Seleccionar trimestre**
- **Acción**: Use las pestañas de trimestres y escoja el deseado.
- **Ubicación**: Encabezado de la página de historial.
- **Datos requeridos**: N/A.
- **Validaciones**: Si el trimestre no tiene fechas se muestra instrucción para configurarlas.


- **FOTO-ADJUNTA**: Pestañas de trimestres, resaltando una activa.
- **Resultado esperado**: Se cargan datos correspondientes al trimestre.

**Paso 2: Revisar calendario**
- **Acción**: Seleccione un día resaltado en el calendario.
- **Ubicación**: Panel izquierdo “Jornadas del trimestre”.
- **Datos requeridos**: N/A.
- **Validaciones**: Sólo puede elegir días con registros; otros están deshabilitados.


- **FOTO-ADJUNTA**: Calendario con días marcados en color.
- **Resultado esperado**: Se actualiza el panel de resumen del día.

**Paso 3: Abrir jornada completa**
- **Acción**: Pulse “Ver jornada”.
- **Ubicación**: Panel “Resumen del día”.
- **Datos requeridos**: N/A.
- **Validaciones**: Botón deshabilitado si el trimestre no está activo (solo lectura).


- **FOTO-ADJUNTA**: Panel de resumen con botón activo.
- **Resultado esperado**: Navega a la vista de jornada con edición detallada.



**Paso 4: Consultar resumen por alumno**
- **Acción**: Revise las tarjetas con el porcentaje acumulado.
- **Ubicación**: Sección “Asistencia por alumno”.
- **Datos requeridos**: N/A.
- **Validaciones**: Muestra mensaje si no hay registros.
- **FOTO-ADJUNTA**: Grid de tarjetas de alumnos con donut y porcentajes.
- **Resultado esperado**: Visualiza presentes, ausentes y total de jornadas por alumno.



#### Mensajes del Sistema:
- ✅ **Éxito**: Gráficos y porcentajes cargados sin errores.
- ❌ **Error**: “Error al cargar datos.” u otros mensajes cuando la API devuelve fallos.


- ⚠️ **Advertencia**: Alertas cuando el trimestre está cerrado/inactivo; se muestra banner amarillo.


#### Casos Especiales:
- Si el docente no tiene asignada la sección se muestra “403 — Esta sección no pertenece a tus asignaciones.”


- Cuando no hay jornadas registradas, se muestra texto informativo y el calendario queda sin resaltados.



### 4.6 Gestionar una jornada específica
**Descripción**: Edita presencialidad alumno por alumno con guardado automático.
**Ubicación**: Página `/dashboard/asistencia/jornada/[id]`, accesible desde “Ver jornada” o enlaces directos.



#### Procedimiento:
**Paso 1: Revisar encabezado**
- **Acción**: Verifique sección, fecha, turno y cantidad de alumnos.
- **Ubicación**: Encabezado de la página.
- **Datos requeridos**: N/A.
- **Validaciones**: N/A.
- **FOTO-ADJUNTA**: Encabezado mostrando badges con fecha, turno y total.
- **Resultado esperado**: Confirma que está en la jornada correcta.



**Paso 2: Marcar estado por alumno**
- **Acción**: Use los botones “Presente” o “Ausente”.
- **Ubicación**: Lista dentro de la tarjeta “Lista de alumnos”.
- **Datos requeridos**: Selección por alumno.
- **Validaciones**: Guardado automático; evita cambios si ya está seleccionado el mismo estado.


- **FOTO-ADJUNTA**: Fila de alumno con botones y etiqueta “Guardando…” en proceso.
- **Resultado esperado**: El estado se actualiza y, si corresponde, se muestra mensaje “Guardando…”.

**Paso 3: Manejar errores**
- **Acción**: Si aparece un toast de error, reintente o vuelva atrás.
- **Ubicación**: Notificaciones (toast) y mensajes en pantalla.
- **Datos requeridos**: N/A.
- **Validaciones**: Mensajes específicos para falta de permisos o fallas de servidor.


- **FOTO-ADJUNTA**: Toast de error “No tenés permisos…” resaltado.
- **Resultado esperado**: Identifica el problema para corregirlo (p.ej., trimestre cerrado).

#### Mensajes del Sistema:
- ✅ **Éxito**: Cambios reflejados en la lista sin mensajes adicionales.
- ❌ **Error**: “No se pudo actualizar la asistencia.” o “No tenés permisos para modificar esta jornada.”


- ⚠️ **Advertencia**: Estado “Guardando…” por alumno mientras se procesa.


#### Casos Especiales:
- Si no se encuentran alumnos activos, aparece mensaje “Sin alumnos activos.” en la parte inferior.


- En caso de ID inválido, se informa “El ID de jornada no es válido.” con botón “Reintentar”.



### 4.7 Monitoreo global (Dirección)
**Descripción**: Listado completo de secciones del período con acceso al historial detallado.
**Ubicación**: Portada de Asistencias cuando su rol es staff.



#### Procedimiento:
**Paso 1: Seleccionar nivel**
- **Acción**: Use pestañas “Primario/Inical”.
- **Ubicación**: Encabezado del listado.
- **Datos requeridos**: N/A.
- **Validaciones**: Idénticas al panel docente.
- **FOTO-ADJUNTA**: Pestañas con listado completo.
- **Resultado esperado**: Se filtran las tarjetas disponibles.



**Paso 2: Abrir historial completo**
- **Acción**: Haga clic en cualquier tarjeta.
- **Ubicación**: Tarjeta de sección.
- **Datos requeridos**: N/A.
- **Validaciones**: N/A.
- **FOTO-ADJUNTA**: Tarjeta con cursor encima indicando enlace.
- **Resultado esperado**: Redirige a la vista de historial de sección correspondiente.



#### Mensajes del Sistema:
- ✅ **Éxito**: Carga correcta de tarjetas con turnos y recuentos.
- ❌ **Error**: “No se pudo cargar las secciones.” o errores de conteo de alumnos.


- ⚠️ **Advertencia**: “No hay secciones disponibles.” cuando la lista está vacía.


#### Casos Especiales:
- La lista se ordena alfabéticamente por nombre de sección y turno para facilitar la búsqueda.



### 4.8 Consulta de asistencia para familias/estudiantes
**Descripción**: Permite revisar el porcentaje individual y el calendario de asistencias del período activo.
**Ubicación**: Portada de Asistencias cuando el rol es familia o estudiante.



#### Procedimiento:
**Paso 1: Seleccionar alumno**
- **Acción**: Si hay varios, utilice las pestañas con los nombres.
- **Ubicación**: Debajo del encabezado “Mi asistencia / Asistencia por alumno”.
- **Datos requeridos**: N/A.
- **Validaciones**: El componente elige automáticamente el primer alumno disponible.
- **FOTO-ADJUNTA**: Tabs con nombres de alumnos.
- **Resultado esperado**: Se carga el resumen y calendario del alumno elegido.



**Paso 2: Revisar resumen porcentual**
- **Acción**: Observe el donut y los contadores de presentes/ausentes.
- **Ubicación**: Tarjeta a la izquierda.
- **Datos requeridos**: N/A.
- **Validaciones**: Muestra spinner de carga mientras se consultan los datos.
- **FOTO-ADJUNTA**: Tarjeta con donut y métricas resaltadas.
- **Resultado esperado**: Visualiza porcentaje actual y totales.



**Paso 3: Analizar calendario**
- **Acción**: Revise los días marcados (presente/ausente) y navegue por meses permitidos.
- **Ubicación**: Tarjeta “Calendario de asistencias”.
- **Datos requeridos**: N/A.
- **Validaciones**: Meses limitados al rango de trimestres configurado.


- **FOTO-ADJUNTA**: Calendario con leyenda de colores visible.
- **Resultado esperado**: Comprende de un vistazo la asistencia durante el período activo.

#### Mensajes del Sistema:
- ✅ **Éxito**: Calendario coloreado y resumen numérico.
- ❌ **Error**: “No se pudo obtener el historial de asistencias.” o error general al cargar.


- ⚠️ **Advertencia**: 
  - “No hay alumnos asociados...” si la cuenta no tiene vínculos.
  - Mensaje indicando que aún no hay datos en el calendario.


#### Casos Especiales:
- El componente selecciona automáticamente otro alumno si el elegido deja de estar disponible.


- Las fechas fuera del rango del período no se muestran en el calendario.



## 5. Preguntas Frecuentes
1. **¿Por qué no veo el botón “Nueva jornada”?**  
   El trimestre asociado está cerrado o inactivo; sólo se permite lectura y el botón aparece deshabilitado con un tooltip explicativo.



2. **Recibo “Ya existe una jornada para este día”, ¿qué significa?**  
   Ya se registró asistencia para esa fecha en la sección. Seleccione otra fecha válida o edite la jornada existente desde el historial.



3. **¿Qué significa el mensaje “403 — Esta sección no pertenece a tus asignaciones”?**  
   Está intentando acceder a una sección que no está asignada a su usuario docente; contacte a la coordinación para revisar permisos.



4. **¿Cómo verifico el porcentaje acumulado de un alumno?**  
   Ingrese al historial de sección o a la vista familiar: ambos muestran tarjetas con presentes, ausentes y total de jornadas.




## 6. Solución de Problemas
- **El calendario no muestra días marcados**  
  Verifique que el trimestre tenga fechas configuradas; de lo contrario, se mostrará un mensaje solicitándolo.



- **Mensaje “No tenés permisos para modificar esta jornada”**  
  Puede deberse a que la jornada pertenece a un período cerrado o su rol no tiene privilegios de edición; valide con la dirección.



- **Errores al cargar datos base en la portada**  
  Los mensajes “No se pudo cargar las secciones” o “No se pudo obtener el recuento de alumnos” indican problemas con la API; reintente más tarde o contacte soporte si persiste.



- **Diálogo de detalle tarda en mostrar alumnos**  
  Mientras se consulta la información se muestra “Cargando asistencia…”; si falla, verá “No se pudo cargar el detalle”. Cierre y vuelva a abrir o verifique conexión.

