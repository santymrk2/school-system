# Calificaciones e Informes

## 1. Introducción
La sección **Calificaciones e Informes** permite consultar los resultados trimestrales de los estudiantes y, en el caso del personal docente o administrativo, registrar o actualizar las calificaciones finales y los informes descriptivos que se entregan a las familias. La vista se adapta automáticamente al rol con el que se ingresa al sistema para mostrar únicamente las acciones habilitadas para cada perfil.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L84-L206】

## 2. Roles y Permisos
- **Familias y estudiantes**: pueden acceder en modo lectura para revisar calificaciones finales, observaciones y los informes descriptivos cargados por trimestre.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L84-L107】【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L360-L623】
- **Docentes asignados y personal administrativo**: gestionan las calificaciones de nivel primario y los informes de nivel inicial. El acceso docente se limita a las secciones asignadas; otras secciones permanecen ocultas.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L128-L207】【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/page.tsx†L17-L167】
- **Administradores**: el perfil de Administración no tiene acceso a esta sección y recibe un mensaje 403 si intenta ingresar.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L110-L118】【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/page.tsx†L78-L86】

## 3. Acceso a la Sección
### Paso 1: Abrir el menú principal
- **Acción**: Hacer clic en el menú lateral del tablero.
- **FOTO-ADJUNTA**: Captura del menú lateral expandido mostrando las opciones del tablero.
- **Resultado esperado**: Se despliega el listado de módulos disponibles.

### Paso 2: Seleccionar "Calificaciones"
- **Acción**: Seleccionar la opción **Calificaciones** del menú.
- **FOTO-ADJUNTA**: Menú lateral con la opción "Calificaciones" resaltada.
- **Resultado esperado**: El sistema redirige a `/dashboard/calificaciones`, cargando la vista correspondiente al rol del usuario.【F:frontend-ecep/src/lib/menu.ts†L49-L61】【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L84-L207】

## 4. Funcionalidades

### 4.1 Consulta familiar de calificaciones e informes
**Descripción**: Permite a familias y estudiantes revisar las calificaciones finales y los informes descriptivos publicados por trimestre.
**Ubicación**: Vista principal de `/dashboard/calificaciones` cuando se ingresa con un rol de familia o estudiante.

#### Procedimiento:
**Paso 1: Seleccionar al alumno**
- **Acción**: Elegir el nombre del alumno en la pestaña superior.
- **Ubicación**: Barra de pestañas en la parte superior de la vista.
- **Datos requeridos**: Ninguno; basta con hacer clic.
- **Validaciones**: Solo se muestran los alumnos asociados a la cuenta.
- **FOTO-ADJUNTA**: Vista con las pestañas de alumnos y uno seleccionado.
- **Resultado esperado**: Se actualiza el detalle académico del alumno elegido.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L360-L375】

**Paso 2: Revisar información de la sección**
- **Acción**: Verificar los datos de la sección, nivel, turno y período.
- **Ubicación**: Primera tarjeta informativa debajo de las pestañas.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Se muestran solo valores disponibles; si falta información, se indica "Nivel no disponible" o se omite el turno.
- **FOTO-ADJUNTA**: Tarjeta con el nombre de la sección y badges de nivel, turno y período.
- **Resultado esperado**: Confirma la sección académica a la que pertenece el alumno.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L461-L480】

**Paso 3: Consultar calificaciones por materia (Nivel primario)**
- **Acción**: Revisar cada tarjeta de materia para ver las notas por trimestre y las observaciones.
- **Ubicación**: Tarjetas dentro del bloque "Materias y calificaciones".
- **Datos requeridos**: Ninguno.
- **Validaciones**: Las calificaciones aparecen solo si la dirección cerró el trimestre; de lo contrario, se muestra "Pendiente".
- **FOTO-ADJUNTA**: Tarjeta de una materia con el listado de trimestres, badge de nota y observaciones.
- **Resultado esperado**: Se visualizan las calificaciones finales, la cantidad de registros y los comentarios por trimestre.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L484-L569】

**Paso 4: Consultar informes descriptivos (Nivel inicial)**
- **Acción**: Revisar cada bloque trimestral para verificar si el informe está disponible.
- **Ubicación**: Tarjeta "Informes trimestrales".
- **Datos requeridos**: Ninguno.
- **Validaciones**: El badge indica "Disponible" solo cuando existe un informe cargado.
- **FOTO-ADJUNTA**: Tarjeta con un trimestre disponible mostrando la descripción del informe.
- **Resultado esperado**: Se leen los informes descriptivos o se identifica si están pendientes.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L583-L615】

#### Mensajes del Sistema:
- ✅ **Éxito**: Visualización normal de las tarjetas cuando existen datos cargados.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L484-L615】
- ❌ **Error**: "No se pudo cargar la información académica." cuando la carga en segundo plano falla.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L307-L314】
- ⚠️ **Advertencia**:
  - "Cargando calificaciones…" mientras se obtienen los datos iniciales.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L344-L346】
  - "No hay alumnos asociados a esta cuenta." si la familia no tiene estudiantes vinculados.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L352-L357】
  - "Las calificaciones estarán disponibles una vez que la dirección cierre el trimestre." cuando aún no se publicaron los resultados.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L543-L549】

#### Casos Especiales:
- Si la cuenta tiene varios alumnos, cada pestaña mantiene los datos cargados incluso al cambiar entre perfiles, salvo que se refresque la página.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L360-L619】
- Para secciones sin materias registradas, se muestra un mensaje informativo en lugar de tarjetas.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L493-L579】

### 4.2 Selección de secciones para personal docente
**Descripción**: Presenta el listado de secciones disponibles para gestionar calificaciones (primario) o informes (inicial) según las asignaciones del usuario docente o staff.
**Ubicación**: Vista principal de `/dashboard/calificaciones` cuando se ingresa con un rol docente o staff.

#### Procedimiento:
**Paso 1: Elegir el nivel educativo**
- **Acción**: Seleccionar la pestaña **Primario** o **Inicial**.
- **Ubicación**: Controles de pestañas al inicio de la sección.
- **Datos requeridos**: Ninguno.
- **Validaciones**: El sistema recuerda la última pestaña seleccionada durante la sesión.
- **FOTO-ADJUNTA**: Vista con las pestañas de niveles y la pestaña activa resaltada.
- **Resultado esperado**: Se actualiza el listado de secciones mostradas.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L128-L207】

**Paso 2: Seleccionar una sección**
- **Acción**: Hacer clic en la tarjeta de la sección que desea gestionar.
- **Ubicación**: Tarjetas listadas en la grilla del nivel elegido.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Solo se muestran las secciones permitidas; si no hay resultados, aparece un mensaje informativo.
- **FOTO-ADJUNTA**: Tarjeta de sección con grado, división, turno y descripción.
- **Resultado esperado**: El sistema abre la página de gestión de la sección seleccionada.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L160-L207】

#### Mensajes del Sistema:
- ✅ **Éxito**: Navegación a la página de sección correspondiente.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L165-L207】
- ❌ **Error**: Si se produce un error al cargar las secciones se muestra un mensaje en rojo con el detalle devuelto por el sistema.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L145-L149】
- ⚠️ **Advertencia**:
  - "Cargando secciones…" durante la carga inicial.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L145-L146】
  - "No hay secciones de Primario/Inicial disponibles." cuando la lista está vacía.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L189-L206】

#### Casos Especiales:
- Los docentes sin asignaciones reciben un mensaje 403 indicando que la sección no pertenece a sus asignaciones al intentar abrir un acceso directo externo.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/page.tsx†L106-L114】

### 4.3 Gestión de calificaciones trimestrales (Nivel primario)
**Descripción**: Permite registrar o actualizar la nota conceptual y las observaciones finales de cada alumno por trimestre y materia.
**Ubicación**: Página `/dashboard/calificaciones/seccion/{id}` cuando la sección es de nivel primario.

#### Procedimiento:
**Paso 1: Definir el trimestre de trabajo**
- **Acción**: Seleccionar el trimestre en la pestaña superior del panel "Configurar calificaciones".
- **Ubicación**: Pestañas horizontales bajo el encabezado de la sección.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Solo se listan trimestres configurados; si el trimestre está cerrado o inactivo, se muestra una alerta de solo lectura.
- **FOTO-ADJUNTA**: Panel de configuración con la pestaña de trimestre seleccionada y la alerta de estado.
- **Resultado esperado**: Se establece el trimestre activo para cargar notas.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L600-L663】

**Paso 2: Elegir la materia**
- **Acción**: Abrir el selector de materia y elegir la asignatura correspondiente.
- **Ubicación**: Desplegable en el panel "Configurar calificaciones".
- **Datos requeridos**: Ninguno.
- **Validaciones**: Solo se muestran materias asignadas; si no hay materias cargadas, se informa al usuario.
- **FOTO-ADJUNTA**: Selector de materia desplegado mostrando la lista disponible.
- **Resultado esperado**: Se carga la grilla de alumnos para la materia seleccionada.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L669-L744】

**Paso 3: Completar la nota conceptual y observaciones**
- **Acción**: Seleccionar la nota conceptual en el desplegable y escribir observaciones si corresponde.
- **Ubicación**: Columnas "Nota conceptual" y "Observaciones" de la tabla de alumnos (o tarjetas en dispositivos móviles).
- **Datos requeridos**: Nota conceptual (opcional) y observaciones (opcional).
- **Validaciones**: El sistema permite dejar valores en blanco; cuando el trimestre está cerrado o inactivo, los campos se deshabilitan y se muestra el estado correspondiente.
- **FOTO-ADJUNTA**: Fila de alumno con los campos de nota conceptual y observaciones listos para editar.
- **Resultado esperado**: Los valores se guardan temporalmente en la vista a la espera de confirmación.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L700-L990】

**Paso 4: Guardar los cambios**
- **Acción**: Presionar el botón **Guardar cambios**.
- **Ubicación**: Pie de la tarjeta de listado de alumnos.
- **Datos requeridos**: Haber completado la edición deseada.
- **Validaciones**: El botón solo aparece cuando el trimestre está activo y hay registros para mostrar.
- **FOTO-ADJUNTA**: Botón "Guardar cambios" habilitado al pie de la tarjeta.
- **Resultado esperado**: El sistema envía los cambios, recarga la información desde el servidor y muestra un mensaje de confirmación.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L994-L1000】【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L560-L567】

#### Mensajes del Sistema:
- ✅ **Éxito**: "Calificaciones guardadas." tras una actualización correcta.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L560-L563】
- ❌ **Error**: "No se pudo guardar." o el mensaje devuelto por el servidor cuando falla la operación.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L563-L566】
- ⚠️ **Advertencia**:
  - "Cargando calificaciones…" mientras se cargan las filas o la tabla.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L718-L726】
  - Alertas en color ámbar cuando el trimestre está cerrado o inactivo, indicando que la vista es solo de lectura.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L652-L663】【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L710-L737】
  - Etiquetas "Calculando…" mientras se obtienen promedios de asistencia o exámenes.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L762-L820】

#### Casos Especiales:
- Si no hay trimestres o materias configuradas, se muestra un mensaje orientativo y no se habilita la edición.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L610-L678】
- Los indicadores de asistencia y promedio pueden quedar en blanco si no hay datos cargados; en ese caso se muestra "Sin registros".【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L762-L804】
- Cuando no existen alumnos inscriptos para la materia en el trimestre seleccionado, se muestra un mensaje y no aparece el botón de guardado.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L988-L1000】

### 4.4 Gestión de informes descriptivos (Nivel inicial)
**Descripción**: Facilita la carga y actualización de informes cualitativos para alumnos de nivel inicial por trimestre.
**Ubicación**: Página `/dashboard/calificaciones/seccion/{id}` cuando la sección es de nivel inicial.

#### Procedimiento:
**Paso 1: Elegir al alumno y trimestre**
- **Acción**: Ubicar la tarjeta del alumno y seleccionar el bloque correspondiente al trimestre.
- **Ubicación**: Tarjetas organizadas en grilla dentro de la página de la sección.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Se muestra el estado del trimestre (activo, inactivo, cerrado) mediante un badge de color.
- **FOTO-ADJUNTA**: Tarjeta de alumno con bloques de trimestre y badge de estado.
- **Resultado esperado**: Se visualiza el contenido existente o las opciones para cargar un informe.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L102-L214】

**Paso 2: Cargar un nuevo informe**
- **Acción**: Hacer clic en **Cargar informe**, redactar la descripción y presionar **Guardar**.
- **Ubicación**: Botón disponible en el bloque del trimestre cuando no hay informe cargado y el trimestre está activo.
- **Datos requeridos**: Descripción del desempeño (texto libre).
- **Validaciones**: El botón Guardar se habilita solo cuando se escribe al menos un carácter; el campo admite saltos de línea.
- **FOTO-ADJUNTA**: Diálogo de carga con el campo de texto completado.
- **Resultado esperado**: El informe se guarda y el bloque pasa a mostrar la descripción registrada.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L260-L288】

**Paso 3: Editar un informe existente**
- **Acción**: Hacer clic en **Editar informe**, actualizar el texto y guardar.
- **Ubicación**: Botón dentro del bloque del trimestre cuando ya existe un informe.
- **Datos requeridos**: Descripción actualizada.
- **Validaciones**: Si el trimestre está cerrado o inactivo, el botón no se muestra y la tarjeta queda en solo lectura.
- **FOTO-ADJUNTA**: Diálogo de edición con el texto del informe listo para actualizar.
- **Resultado esperado**: Se actualiza la descripción y se cierra el diálogo. Si el backend no soporta la actualización, se muestra una advertencia indicando que se debe habilitar el endpoint correspondiente.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L210-L247】【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L182-L196】

#### Mensajes del Sistema:
- ✅ **Éxito**: El bloque muestra inmediatamente el texto guardado después de crear o actualizar un informe.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L167-L189】【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L210-L290】
- ❌ **Error**: "Tu backend aún no expone UPDATE para informes. Pedilo o habilítalo." cuando el servidor no permite editar informes existentes.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L182-L195】
- ⚠️ **Advertencia**:
  - "Cargando informes…" durante la carga inicial.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L100-L103】
  - Mensajes "Sin informe." o "Trimestre inactivo. Aún no habilitado." cuando el trimestre está cerrado o inactivo.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L253-L258】

#### Casos Especiales:
- Si el trimestre está cerrado, los datos se muestran en modo lectura y no es posible crear ni editar informes.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L253-L258】
- Cada vez que se guarda un informe, la lista se actualiza en memoria para mantener la información visible sin recargar la página.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L118-L135】

## 5. Preguntas Frecuentes
- **¿Por qué veo "Pendiente" en lugar de una nota?**: Significa que la dirección aún no cerró el trimestre, por lo que las calificaciones todavía no están publicadas.【F:frontend-ecep/src/app/dashboard/calificaciones/_components/FamilyCalificacionesView.tsx†L540-L549】
- **¿Cómo sé si puedo editar una calificación o informe?**: Los botones de edición solo aparecen cuando el trimestre está activo; si se muestra un badge con estado cerrado o inactivo, la vista es de solo lectura.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L652-L663】【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L253-L258】
- **¿Qué información adicional se muestra a los docentes?**: Para cada alumno se incluye el promedio de asistencia y de exámenes cuando hay datos disponibles, ayudando a contextualizar la calificación final.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L762-L820】

## 6. Solución de Problemas
- **Mensaje 403 al ingresar**: Verifique que su rol tenga acceso. Los administradores no pueden utilizar esta sección y los docentes solo ven las secciones asignadas.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L110-L126】【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/page.tsx†L78-L114】
- **No aparecen secciones en el listado**: Puede deberse a que aún no se configuraron secciones para su rol o nivel. Si el problema persiste, comuníquese con la administración para revisar sus permisos.【F:frontend-ecep/src/app/dashboard/calificaciones/page.tsx†L160-L206】
- **Error al guardar calificaciones**: Revise la conexión y vuelva a intentar. Si el mensaje persiste, informe el detalle mostrado en pantalla para que soporte pueda revisarlo en el backend.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/CierrePrimarioView.tsx†L563-L566】
- **No se pueden editar informes existentes**: Si aparece el aviso sobre la falta de endpoint de actualización, solicite al equipo técnico habilitar el método PUT en el backend antes de reintentar.【F:frontend-ecep/src/app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx†L182-L195】
