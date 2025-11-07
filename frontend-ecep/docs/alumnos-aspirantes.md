# Alumnos – Aspirantes

## 1. Introducción
Esta sección del panel administrativo le permite seguir el ciclo completo de las solicitudes de admisión: revisar el listado de aspirantes, aplicar filtros y búsquedas, navegar entre páginas de resultados, ingresar al detalle de cada caso y convertir una solicitud aceptada en un alumno matriculado mediante el alta correspondiente.

## 2. Roles y Permisos
- **Acceso habilitado**: Personal administrativo con alcance **staff** que cuente con al menos uno de los roles **Director/a**, **Secretaría** o **Administración**.
- **Acceso restringido**: Docentes, familias y estudiantes no visualizan la pestaña “Aspirantes” ni sus herramientas.

## 3. Acceso a la Sección
### Paso 1: Ingresar al panel de alumnos
- **Acción**: Ingrese al panel “Alumnos” desde el tablero administrativo.
- **FOTO-ADJUNTA**: Vista del tablero con el encabezado “Alumnos” y el botón “Alta Manual”.
- **Resultado esperado**: Se muestra el panel general de alumnos con las pestañas disponibles según su rol.

### Paso 2: Abrir la pestaña “Aspirantes”
- **Acción**: Haga clic en la pestaña “Aspirantes”.
- **FOTO-ADJUNTA**: Pestaña “Aspirantes” resaltada dentro del componente de pestañas.
- **Resultado esperado**: Se cargan las tarjetas de aspirantes junto con el filtro por estado y la paginación.

## 4. Funcionalidades

### 4.1 Consultar el listado de aspirantes
**Descripción**: Visualiza las solicitudes recibidas, mostrando datos clave del aspirante y el estado del proceso.
**Ubicación**: Pestaña “Aspirantes” dentro del panel “Alumnos”.

#### Procedimiento:
**Paso 1: Revisar las tarjetas informativas**
- **Acción**: Lea cada tarjeta presentada en la cuadrícula.
- **Ubicación**: Centro de la pestaña “Aspirantes”.
- **Datos requeridos**: Ninguno.
- **Validaciones**: La información solo se muestra cuando la consulta de solicitudes finaliza sin errores.
- **FOTO-ADJUNTA**: Cuadrícula con varias tarjetas de aspirantes mostrando nombre, número de solicitud y fecha.
- **Resultado esperado**: Usted visualiza curso solicitado, disponibilidad, número de propuestas y alertas como “Reprogramación solicitada”.

**Paso 2: Identificar el estado de cada solicitud**
- **Acción**: Observe el distintivo de color ubicado en la tarjeta.
- **Ubicación**: Esquina superior derecha de cada tarjeta.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Los estados disponibles son Pendiente, Propuesta enviada, Entrevista programada, Entrevista realizada, Aceptada y Rechazada.
- **FOTO-ADJUNTA**: Tarjeta con insignias de estado diferentes.
- **Resultado esperado**: Usted reconoce rápidamente la etapa actual de la solicitud.

#### Mensajes del Sistema:
- ✅ **Éxito**: Visualización normal del listado con la leyenda “Mostrando X-Y de Z solicitudes”.
- ⏳ **Carga**: Pantalla “Cargando solicitudes…” mientras se obtienen los datos.
- ❌ **Error**: “No se pudieron cargar las solicitudes.” junto al botón “Reintentar”.
- ⚠️ **Advertencia**: “No hay solicitudes de admisión registradas.” cuando no existen registros.

#### Casos Especiales:
- Si no hay coincidencias según los filtros activos, aparece “No hay solicitudes que coincidan con los criterios actuales.”.

### 4.2 Buscar aspirantes por texto
**Descripción**: Filtra el listado en tiempo real utilizando coincidencias por nombre, curso, estado o DNI.
**Ubicación**: Barra superior del panel “Alumnos”, visible cuando tiene permisos de staff.

#### Procedimiento:
**Paso 1: Ingresar un término de búsqueda**
- **Acción**: Escriba parte del nombre, curso, estado o DNI en el campo “Buscar por nombre, curso o sección…”.
- **Ubicación**: Parte superior de la pantalla, sobre las pestañas del panel.
- **Datos requeridos**: Texto libre.
- **Validaciones**: Solo el personal habilitado ve el buscador; la búsqueda ignora mayúsculas/minúsculas.
- **FOTO-ADJUNTA**: Barra de búsqueda con un término ingresado y los resultados filtrados.
- **Resultado esperado**: El listado se actualiza automáticamente mostrando únicamente los aspirantes coincidentes y la paginación vuelve a la primera página.

#### Mensajes del Sistema:
- ✅ **Éxito**: Las tarjetas visibles corresponden al texto ingresado.
- ⚠️ **Advertencia**: Mensaje “No hay solicitudes que coincidan con los criterios actuales.” si no se hallan coincidencias.

#### Casos Especiales:
- El filtro también contempla el DNI registrado aunque no se muestre en la tarjeta.

### 4.3 Filtrar por estado de la solicitud
**Descripción**: Limita la vista a un estado específico del proceso de admisión.
**Ubicación**: Selector “Filtrar por estado” dentro de la pestaña “Aspirantes”.

#### Procedimiento:
**Paso 1: Seleccionar el estado deseado**
- **Acción**: Abra el desplegable “Filtrar por estado” y elija una opción (Todos los estados, Pendientes, Propuestas enviadas, Entrevistas programadas, Entrevistas realizadas, Aceptadas o Rechazadas).
- **Ubicación**: Encabezado del listado, encima de las tarjetas.
- **Datos requeridos**: Selección de una opción disponible.
- **Validaciones**: El sistema solo permite elegir los estados listados.
- **FOTO-ADJUNTA**: Selector desplegado mostrando todas las opciones.
- **Resultado esperado**: Se muestran únicamente las solicitudes que corresponden al estado elegido y la paginación se reinicia.

#### Mensajes del Sistema:
- ✅ **Éxito**: La cuadrícula refleja solo el estado seleccionado.
- ⚠️ **Advertencia**: “No hay solicitudes que coincidan con los criterios actuales.” si no existen registros en ese estado.

#### Casos Especiales:
- Si el cambio de filtro deja la página actual fuera de rango, el sistema vuelve automáticamente a la última página válida.

### 4.4 Navegar por páginas de resultados
**Descripción**: Permite avanzar o retroceder en lotes de seis solicitudes por página.
**Ubicación**: Barra de paginación al pie del listado de aspirantes.

#### Procedimiento:
**Paso 1: Consultar el resumen de resultados**
- **Acción**: Revise el texto “Mostrando X-Y de Z solicitudes” para conocer la cantidad visible.
- **Ubicación**: Sector inferior izquierdo del listado.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Los valores se recalculan según los filtros y la página seleccionada.
- **FOTO-ADJUNTA**: Paginador mostrando el resumen y los botones de navegación.
- **Resultado esperado**: Usted verifica cuántos registros está viendo actualmente.

**Paso 2: Cambiar de página**
- **Acción**: Utilice los botones “Anterior” o “Siguiente”.
- **Ubicación**: Parte inferior derecha del listado.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Los botones se deshabilitan automáticamente en la primera o última página.
- **FOTO-ADJUNTA**: Botones “Anterior” y “Siguiente”, con uno deshabilitado cuando no puede usarse.
- **Resultado esperado**: Se cargan las siguientes o anteriores seis solicitudes.

#### Mensajes del Sistema:
- ✅ **Éxito**: Transición de página inmediata.
- ⚠️ **Advertencia**: Botones inhabilitados cuando no existen más páginas disponibles.

#### Casos Especiales:
- Al aplicar nuevos filtros, el sistema ajusta la página actual para evitar que quede vacía.

### 4.5 Ver el detalle completo de una solicitud
**Descripción**: Abre la ficha extendida con toda la información del aspirante.
**Ubicación**: Botón “Ver detalle” en la parte inferior de cada tarjeta.

#### Procedimiento:
**Paso 1: Abrir la ficha de la solicitud**
- **Acción**: Haga clic en “Ver detalle”.
- **Ubicación**: Barra de acciones de la tarjeta.
- **Datos requeridos**: Ninguno.
- **Validaciones**: El enlace dirige a la ruta `/dashboard/alumnos/solicitudes/[id]`.
- **FOTO-ADJUNTA**: Tarjeta con el botón “Ver detalle” resaltado.
- **Resultado esperado**: Se abre una nueva vista con el detalle completo de la solicitud seleccionada.

#### Mensajes del Sistema:
- ✅ **Éxito**: Navegación hacia la ficha específica.
- ❌ **Error**: En caso de problemas de carga, Next.js muestra el mensaje de error correspondiente en la vista de destino.

#### Casos Especiales:
- El enlace no se precarga para optimizar la navegación; la información se consulta al abrir la ficha.

### 4.6 Dar de alta a un aspirante aceptado
**Descripción**: Transforma una solicitud aceptada en un alumno matriculado asignando período lectivo y sección destino.
**Ubicación**: Botón “Dar de alta” disponible únicamente en tarjetas de solicitudes aceptadas sin alta previa.

#### Procedimiento:
**Paso 1: Abrir el modal de alta**
- **Acción**: Presione “Dar de alta”.
- **Ubicación**: Barra inferior de la tarjeta del aspirante aceptado.
- **Datos requeridos**: Solicitud en estado Aceptada y sin alta registrada.
- **Validaciones**: Si la solicitud ya tiene alta, se muestra el mensaje “La solicitud ya fue dada de alta anteriormente.” y el modal no se abre.
- **FOTO-ADJUNTA**: Tarjeta con el botón “Dar de alta” activo.
- **Resultado esperado**: Se despliega el modal “Dar de alta — [Nombre del aspirante]”.

**Paso 2: Revisar la información resumida**
- **Acción**: Lea los datos de curso solicitado, disponibilidad informada y turno preferido (si existe).
- **Ubicación**: Recuadro informativo en la parte superior del modal.
- **Datos requeridos**: Ninguno (lectura).
- **Validaciones**: La información se carga automáticamente desde la solicitud.
- **FOTO-ADJUNTA**: Modal mostrando el recuadro de información resumida.
- **Resultado esperado**: Usted confirma los datos antes de elegir período y sección.

**Paso 3: Seleccionar el período lectivo**
- **Acción**: Abra el desplegable “Período lectivo” y elija una opción.
- **Ubicación**: Primer selector dentro del modal.
- **Datos requeridos**: Selección de un período disponible en el calendario escolar.
- **Validaciones**: El botón “Confirmar alta” permanece deshabilitado hasta elegir un período; si presiona confirmar sin selección, aparece el mensaje “Seleccioná el período lectivo para el alta”.
- **FOTO-ADJUNTA**: Selector de período con opciones visibles.
- **Resultado esperado**: El período elegido queda registrado y habilita el filtrado de secciones asociadas.

**Paso 4: Elegir la sección destino**
- **Acción**: Abra el desplegable “Sección destino” y seleccione la sección correspondiente.
- **Ubicación**: Segundo selector del modal.
- **Datos requeridos**: Sección activa vinculada al período seleccionado.
- **Validaciones**: Se muestra un indicador de carga “Cargando secciones…” mientras se obtienen las opciones. Si no hay coincidencias, verá “No hay secciones disponibles para el período seleccionado.”; si ocurre un error, aparecerá “No se pudieron obtener las secciones disponibles”. Intentar confirmar sin sección mostrará “Seleccioná una sección para el alta”.
- **FOTO-ADJUNTA**: Selector desplegado con las secciones disponibles o los mensajes mencionados.
- **Resultado esperado**: La sección queda seleccionada y el botón de confirmación se habilita.

**Paso 5: Confirmar el alta**
- **Acción**: Presione “Confirmar alta”.
- **Ubicación**: Parte inferior del modal.
- **Datos requeridos**: Período lectivo y sección destino seleccionados.
- **Validaciones**: El botón muestra un ícono animado mientras guarda y queda deshabilitado hasta finalizar la operación.
- **FOTO-ADJUNTA**: Pie del modal con el botón “Confirmar alta” mostrando el indicador de carga.
- **Resultado esperado**: Se guarda el alta, el modal se cierra, la lista se actualiza y la tarjeta deja de mostrar el botón de alta.

#### Mensajes del Sistema:
- ✅ **Éxito**: “Alumno dado de alta correctamente”.
- ❌ **Error**: “No se pudo completar el alta” cuando la operación falla o “La solicitud ya fue dada de alta anteriormente.” si se intenta un duplicado.
- ⚠️ **Advertencia**: “Seleccioná el período lectivo para el alta” y “Seleccioná una sección para el alta”, además de los mensajes informativos sobre ausencia de períodos o secciones.

#### Casos Especiales:
- Si el turno preferido del aspirante coincide con una sección existente, el modal la preselecciona automáticamente. Cuando solo existe una sección disponible, también se selecciona automáticamente.
- Los períodos visibles provienen del calendario escolar activo; si no hay períodos registrados, el selector muestra el aviso “Todavía no hay períodos creados en el calendario escolar.”

## 5. Preguntas Frecuentes
1. **¿Por qué no veo la pestaña “Aspirantes”?** Debe ingresar con alcance staff y tener los roles Director/a, Secretaría o Administración.
2. **¿Cuántas solicitudes se muestran por página?** Seis tarjetas por página. Use los botones “Anterior” y “Siguiente” para recorrer el resto.
3. **¿Qué campos considera el buscador?** Nombre completo, curso solicitado, estado de la solicitud y DNI asociado.
4. **¿Cuándo aparece el botón “Dar de alta”?** Solo en solicitudes aceptadas que aún no tienen alta generada ni matrícula vinculada.

## 6. Solución de Problemas
- **Mensaje “No se pudieron cargar las solicitudes.”**: Verifique su conexión y utilice el botón “Reintentar”. Si el inconveniente persiste, contacte al equipo técnico.
- **No hay períodos disponibles en el modal**: Cree períodos escolares desde la administración académica; el modal mostrará “Todavía no hay períodos creados en el calendario escolar.” mientras la lista esté vacía.
- **No aparecen secciones para el período elegido**: Revise que existan secciones activas para ese período. Si la carga falla, el sistema indica “No se pudieron obtener las secciones disponibles”.
- **No puedo confirmar el alta**: Compruebe que seleccionó período y sección. El sistema mostrará advertencias específicas hasta completar ambos datos.
