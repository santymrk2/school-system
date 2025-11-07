# Actas de Accidentes

## 1. Introducción
La sección **Actas de Accidentes** permite registrar, consultar y administrar los reportes institucionales relacionados con incidentes sufridos por alumnos. Desde este panel puede revisar estadísticas generales, filtrar registros históricos, exportar reportes y completar el circuito administrativo (carga inicial, cierre, firma y archivo).

## 2. Roles y Permisos
- **Dirección**: acceso completo. Puede crear actas, editar registros existentes, cerrar actas, asignar direcciones firmantes, marcarlas como firmadas, eliminar registros y exportar listados.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L100-L118】【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L737-L769】
- **Secretaría**: mismas capacidades que Dirección. Puede gestionar todo el ciclo de vida del acta y exportar información.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L100-L118】
- **Administración**: puede ingresar a la sección, registrar nuevas actas y generar exportaciones, pero no editar, cerrar, firmar ni eliminar actas existentes.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L100-L118】【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L960-L986】
- **Docentes/Preceptores (Teacher/Alternate)**: acceso para crear actas de sus secciones vigentes. No pueden editar ni eliminar registros previos, ni exportar información.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L118-L119】【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L148-L217】
- **Familias/Estudiantes**: visualización únicamente de las actas asociadas a sus hijos o a sí mismos mediante una vista simplificada.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L709-L724】【F:frontend-ecep/src/app/dashboard/actas/_components/FamilyActasView.tsx†L65-L200】
- **Otros perfiles**: reciben un mensaje de acceso denegado y no pueden interactuar con la sección.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L726-L735】

## 3. Acceso a la Sección
### Paso 1: Abrir el panel de Actas de Accidentes
- **Acción**: Ingrese al menú principal del panel administrativo y seleccione la opción **Actas de Accidentes** dentro del módulo de Vida Escolar.
- **FOTO-ADJUNTA**: Captura del menú lateral señalando la entrada “Actas de Accidentes”.
- **Resultado esperado**: Se muestra el encabezado “Actas de Accidentes” y, según su rol, aparecen los filtros, estadísticas y listado correspondiente.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L737-L889】

## 4. Funcionalidades

### 4.1 Consultar actas y estadísticas
**Descripción**: Permite visualizar métricas globales, el listado completo de actas y acceder a sus detalles.
**Ubicación**: Panel principal de la sección, debajo del encabezado “Actas de Accidentes”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L737-L999】

#### Procedimiento:
**Paso 1: Revisar métricas generales**
- **Acción**: Observe las tarjetas “Total de Actas”, “Actas firmadas” y “Pendientes de firma”.
- **Ubicación**: Bloque de tarjetas inmediatamente debajo de los filtros.
- **Datos requeridos**: No aplica; los indicadores se calculan automáticamente.
- **Validaciones**: Las cifras se actualizan en función del total filtrado (firmadas vs. pendientes).【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L840-L886】
- **FOTO-ADJUNTA**: Tarjetas mostrando los contadores principales.
- **Resultado esperado**: Visualiza el estado global de las actas para contextualizar la gestión.

**Paso 2: Examinar el listado de actas**
- **Acción**: Revise cada registro en la lista y utilice los botones disponibles (Ver, Editar, Eliminar según permisos).
- **Ubicación**: Tarjeta “Actas” dentro del listado principal.
- **Datos requeridos**: No se requiere ingreso de datos; sólo lectura o acciones directas.
- **Validaciones**: Las etiquetas de estado cambian de color según el estado (Borrador, Cerrada, Firmada) y se muestran badges adicionales para informante/firmante cuando corresponde.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L888-L987】
- **FOTO-ADJUNTA**: Listado con un acta resaltada y los botones de acción visibles.
- **Resultado esperado**: Puede identificar rápidamente el estado, sección, fecha, lugar y responsables de cada acta.

#### Mensajes del Sistema:
- ✅ **Éxito**: No aplica (visualización informativa).
- ❌ **Error**: “No hay actas para el criterio seleccionado.” cuando los filtros no devuelven resultados.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L991-L995】
- ⚠️ **Advertencia**: Ninguna específica en esta vista.

#### Casos Especiales:
- Si el perfil pertenece a familia/estudiante se carga una vista diferente (ver funcionalidad 4.9).【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L709-L724】

### 4.2 Aplicar filtros y búsqueda avanzada
**Descripción**: Ajusta el listado mediante filtros por alumno, estado, período y texto libre.
**Ubicación**: Barra de filtros inmediatamente debajo del encabezado de la sección.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L772-L838】

#### Procedimiento:
**Paso 1: Filtrar por alumno**
- **Acción**: Abra el selector “Todos los alumnos” y elija un estudiante.
- **Ubicación**: Primer desplegable de la barra de filtros.
- **Datos requeridos**: Selección de un alumno de la lista generada dinámicamente.
- **Validaciones**: La lista muestra únicamente alumnos presentes en las actas cargadas.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L419-L424】【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L772-L786】
- **FOTO-ADJUNTA**: Desplegable abierto con varias opciones de alumnos.
- **Resultado esperado**: El listado se acota a las actas del alumno elegido.

**Paso 2: Filtrar por estado del acta**
- **Acción**: Seleccione un estado (Firmadas, Cerradas, Pendientes) en el segundo desplegable.
- **Ubicación**: Segundo selector de la barra de filtros.
- **Datos requeridos**: Elección de un estado.
- **Validaciones**: El sistema distingue automáticamente estados y excluye combinaciones incompatibles (por ejemplo, “Pendientes” excluye firmadas).【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L442-L451】【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L788-L801】
- **FOTO-ADJUNTA**: Menú de estado mostrando las distintas opciones.
- **Resultado esperado**: Se muestran solo las actas con el estado seleccionado.

**Paso 3: Filtrar por rango de fechas**
- **Acción**: Seleccione fecha inicial y final utilizando los dos DatePicker.
- **Ubicación**: Segmento central de la barra de filtros.
- **Datos requeridos**: Fechas válidas (el selector ajusta automáticamente límites coherentes).
- **Validaciones**: Si se establece una fecha inicial posterior a la final (o viceversa) el sistema corrige el rango para mantener coherencia.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L803-L826】
- **FOTO-ADJUNTA**: Rango de fechas marcado en ambos selectores.
- **Resultado esperado**: El listado refleja sólo actas dentro del período indicado.

**Paso 4: Buscar por texto libre**
- **Acción**: Ingrese palabras clave (alumno, descripción, firmante, etc.) en el campo de búsqueda.
- **Ubicación**: Campo con ícono de lupa al final de la barra de filtros.
- **Datos requeridos**: Texto a buscar.
- **Validaciones**: El sistema realiza coincidencia parcial sobre múltiples campos (alumno, DNI, familiar, sección, descripción, firmante, lugar y acciones).【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L455-L463】【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L829-L837】
- **FOTO-ADJUNTA**: Campo de búsqueda con un término de ejemplo escrito.
- **Resultado esperado**: El listado muestra solo las actas que contienen el texto ingresado.

#### Mensajes del Sistema:
- ✅ **Éxito**: No aplica.
- ❌ **Error**: “No hay actas para el criterio seleccionado.” cuando la combinación no devuelve resultados.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L991-L995】
- ⚠️ **Advertencia**: Ninguna adicional.

#### Casos Especiales:
- Los filtros afectan también la exportación CSV (ver funcionalidad 4.3).【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L677-L688】

### 4.3 Exportar actas a CSV
**Descripción**: Genera un archivo CSV con los registros filtrados para análisis externo.
**Ubicación**: Botón “Exportar CSV” en la esquina superior derecha del encabezado, visible para Dirección, Secretaría y Administración.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L753-L768】

#### Procedimiento:
**Paso 1: Preparar filtros opcionales**
- **Acción**: Ajuste los filtros deseados antes de exportar (opcional).
- **Ubicación**: Barra de filtros.
- **Datos requeridos**: Ninguno adicional.
- **Validaciones**: El CSV respetará los filtros vigentes.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L663-L689】
- **FOTO-ADJUNTA**: Barra de filtros configurada antes de exportar.
- **Resultado esperado**: Se delimita la información incluida en el archivo.

**Paso 2: Descargar el archivo**
- **Acción**: Presione el botón **Exportar CSV**.
- **Ubicación**: Encabezado de la sección.
- **Datos requeridos**: No aplica.
- **Validaciones**: El sistema genera un archivo con encabezados fijos y datos sanitizados (comillas escapadas, reemplazo de saltos de línea) para evitar problemas de formato.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L663-L707】
- **FOTO-ADJUNTA**: Diálogo del navegador mostrando la descarga del archivo `actas-AAAA-MM-DD.csv`.
- **Resultado esperado**: Se inicia la descarga del CSV en el navegador.

#### Mensajes del Sistema:
- ✅ **Éxito**: Descarga automática (sin mensaje en pantalla).
- ❌ **Error**: No hay mensajes; en caso de bloqueo del navegador, revisar permisos de descarga.
- ⚠️ **Advertencia**: Ninguna.

#### Casos Especiales:
- El archivo contiene máximo 1.000 caracteres por columna en descripción y acciones para mantener la legibilidad.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L685-L687】

### 4.4 Registrar una nueva acta
**Descripción**: Crea un nuevo registro de incidente con datos completos del alumno, suceso y acciones tomadas.
**Ubicación**: Botón **Nueva Acta** en el encabezado; abre un diálogo modal con el formulario correspondiente.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L753-L768】【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L391-L578】

#### Procedimiento:
**Paso 1: Abrir el formulario**
- **Acción**: Pulse **Nueva Acta**.
- **Ubicación**: Encabezado de la sección, junto al botón de exportación.
- **Datos requeridos**: Ninguno en este paso.
- **Validaciones**: El sistema carga datos auxiliares (alumnos disponibles, personal, secciones) antes de mostrar el formulario. Mientras carga aparece “Cargando información…”.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L404-L407】
- **FOTO-ADJUNTA**: Modal abierto mostrando el título “Nueva Acta de Accidente”.
- **Resultado esperado**: Se despliega el formulario con campos editables.

**Paso 2: Seleccionar al alumno**
- **Acción**: Escriba al menos dos letras y elija al alumno en la lista de sugerencias.
- **Ubicación**: Primer campo del formulario (autocomplete de alumnos).
- **Datos requeridos**: Alumno válido.
- **Validaciones**: Si no se selecciona un alumno aparece mensaje “Seleccioná un alumno de la lista.” y no se permite enviar.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L408-L445】【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L314-L331】
- **FOTO-ADJUNTA**: Campo de alumno con la lista desplegada y un alumno resaltado.
- **Resultado esperado**: El campo queda completado con la selección elegida.

**Paso 3: Completar datos del suceso**
- **Acción**: Defina fecha (máximo 2 días anteriores), hora, descripción, lugar y acciones realizadas.
- **Ubicación**: Secciones “Fecha del suceso”, “Hora (24h)”, “Descripción”, “Lugar” y “Acciones realizadas”.
- **Datos requeridos**: Fecha válida, hora en formato 24h, texto descriptivo y acciones efectuadas.
- **Validaciones**: Se verifica que la fecha esté entre hoy y dos días atrás; los campos de hora, lugar, descripción y acciones no pueden quedar vacíos o con espacios únicamente.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L453-L503】【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L319-L330】
- **FOTO-ADJUNTA**: Bloque de campos completado, destacando el DatePicker y la hora.
- **Resultado esperado**: Todos los campos críticos quedan completos.

**Paso 4: Definir docentes responsables**
- **Acción**: Según su rol, seleccione el docente informante obligatorio y opcionalmente la dirección firmante.
- **Ubicación**: Selectores “Docente informante” y “Dirección firmante — opcional”.
- **Datos requeridos**: Informante (obligatorio en modo Dirección/Secretaría/Administración), firmante opcional.
- **Validaciones**: En modo docente se intenta asignar automáticamente al propio docente; si no es posible aparece mensaje “No se pudo determinar el docente informante.”. Dirección puede elegir cualquier docente registrado y un directivo firmante opcional.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L333-L373】【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L506-L562】
- **FOTO-ADJUNTA**: Selectores abiertos mostrando opciones de docentes y directivos.
- **Resultado esperado**: Informante asignado correctamente y, si corresponde, firmante preasignado.

**Paso 5: Guardar el acta**
- **Acción**: Pulse **Registrar acta**.
- **Ubicación**: Barra inferior del diálogo.
- **Datos requeridos**: Todos los campos obligatorios completos.
- **Validaciones**: Si falta información se muestran toasts específicos (por ejemplo, “Completá hora, lugar, descripción y acciones.”). Si todo es correcto el diálogo se cierra automáticamente tras crear el registro.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L314-L386】
- **FOTO-ADJUNTA**: Botón “Registrar acta” resaltado.
- **Resultado esperado**: Se crea el acta y el listado principal se actualiza (en caso de roles con permisos de lectura).

#### Mensajes del Sistema:
- ✅ **Éxito**: Cierre automático del modal (se asume creación satisfactoria) y el listado se refresca si se proporcionó `onCreated`.
- ❌ **Error**: Toasts como “Seleccioná un alumno de la lista.”, “Fecha inválida: solo hoy o 2 días previos.”, “Completá hora, lugar, descripción y acciones.”, “Seleccioná un docente informante.” o “No se pudo crear el acta.” según la validación fallida.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L314-L385】
- ⚠️ **Advertencia**: Mensajes informativos cuando no hay docentes disponibles para seleccionar.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L531-L535】

#### Casos Especiales:
- Si el catálogo de alumnos/docentes no carga correctamente se muestra el formulario vacío; revise la conexión y vuelva a abrir el diálogo.
- Docentes sólo ven alumnos de sus secciones vigentes; en caso de no existir asignaciones se incluye un fallback con todos los alumnos para no bloquear la carga.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L173-L217】

### 4.5 Editar un acta existente
**Descripción**: Actualiza datos de un acta aún no firmada (Dirección/Secretaría).
**Ubicación**: Botón **Editar** en cada fila del listado y opción **Editar** en el diálogo de visualización.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L960-L1015】

#### Procedimiento:
**Paso 1: Abrir el diálogo de edición**
- **Acción**: Pulse **Editar** en la fila deseada o abra la vista y seleccione **Editar**.
- **Ubicación**: Botones de acción del listado o del diálogo de visualización.
- **Datos requeridos**: Ninguno inicial.
- **Validaciones**: Las actas firmadas no pueden editarse; aparece advertencia “El acta ya está firmada y no puede editarse.”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L475-L486】
- **FOTO-ADJUNTA**: Modal “Editar acta #ID” abierto.
- **Resultado esperado**: Se carga el formulario con los datos actuales.

**Paso 2: Ajustar información necesaria**
- **Acción**: Modifique alumno, fecha, hora, lugar, estado, descripción, acciones y (si está permitido) dirección firmante.
- **Ubicación**: Campos dentro del diálogo de edición.
- **Datos requeridos**: Igual que en la creación; estado y firmante disponibles según permisos.
- **Validaciones**: Debe existir informante asignado. Campos obligatorios validan presencia de datos. Para seleccionar firmante, el acta no puede estar en estado “Borrador”.【F:frontend-ecep/src/app/dashboard/actas/_components/EditActaDialog.tsx†L177-L365】
- **FOTO-ADJUNTA**: Formulario con campos editados y selector de estado desplegado.
- **Resultado esperado**: Datos modificados listos para guardar.

**Paso 3: Guardar cambios**
- **Acción**: Pulse **Guardar cambios**.
- **Ubicación**: Parte inferior del diálogo.
- **Datos requeridos**: Todos los campos obligatorios completos.
- **Validaciones**: Muestra toasts específicos si falta información (“Seleccioná un alumno válido.”, “El acta no tiene un docente informante asignado.”, etc.).【F:frontend-ecep/src/app/dashboard/actas/_components/EditActaDialog.tsx†L181-L210】
- **FOTO-ADJUNTA**: Botón “Guardar cambios” resaltado.
- **Resultado esperado**: El diálogo se cierra y el listado se actualiza con los cambios guardados.【F:frontend-ecep/src/app/dashboard/actas/_components/EditActaDialog.tsx†L213-L229】

#### Mensajes del Sistema:
- ✅ **Éxito**: Cambios guardados sin notificación adicional (se refresca la lista principal al cerrarse el diálogo).
- ❌ **Error**: Toasts mencionados en las validaciones; errores de red muestran “No se pudo actualizar el acta”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L546-L600】
- ⚠️ **Advertencia**: Mensaje indicando que debe cerrar el acta antes de elegir dirección firmante cuando el estado es Borrador.【F:frontend-ecep/src/app/dashboard/actas/_components/EditActaDialog.tsx†L332-L365】

#### Casos Especiales:
- El campo “Dirección firmante” se bloquea si el acta sigue en borrador; primero debe cerrarse para habilitarlo.【F:frontend-ecep/src/app/dashboard/actas/_components/EditActaDialog.tsx†L332-L365】

### 4.6 Visualizar acta y generar PDF
**Descripción**: Presenta la información completa del acta, permite descargar un PDF, editar, cerrar, firmar o eliminar según permisos.
**Ubicación**: Botón **Ver** en cada fila del listado. Abre el diálogo de detalle con pestañas informativas.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L969-L1027】【F:frontend-ecep/src/app/dashboard/actas/_components/ViewActaDialog.tsx†L57-L352】

#### Procedimiento:
**Paso 1: Abrir la vista detallada**
- **Acción**: Pulse **Ver** en la fila deseada.
- **Ubicación**: Botón con ícono de ojo en el listado.
- **Datos requeridos**: Ninguno.
- **Validaciones**: No aplica.
- **FOTO-ADJUNTA**: Diálogo “Acta de Accidente #ID” mostrando las tarjetas de información.
- **Resultado esperado**: Se despliega el detalle del acta con información del alumno, suceso y seguimiento.【F:frontend-ecep/src/app/dashboard/actas/_components/ViewActaDialog.tsx†L167-L308】

**Paso 2: Descargar/Imprimir**
- **Acción**: Pulse el botón **Imprimir** para generar el PDF.
- **Ubicación**: Barra de acciones al pie del diálogo.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Si ocurre un error al generar el PDF aparece toast “No se pudo generar el PDF del acta.”.【F:frontend-ecep/src/app/dashboard/actas/_components/ViewActaDialog.tsx†L132-L160】【F:frontend-ecep/src/app/dashboard/actas/_components/ViewActaDialog.tsx†L311-L345】
- **FOTO-ADJUNTA**: Barra inferior del diálogo con el botón “Imprimir” resaltado.
- **Resultado esperado**: Se descarga o abre el PDF con el formato oficial del acta.

#### Mensajes del Sistema:
- ✅ **Éxito**: Generación exitosa del PDF (sin toast adicional).
- ❌ **Error**: Toast con mensaje descriptivo ante fallos de generación.【F:frontend-ecep/src/app/dashboard/actas/_components/ViewActaDialog.tsx†L152-L158】
- ⚠️ **Advertencia**: Mensajes informativos dentro del diálogo (por ejemplo, recordatorios sobre cerrar el acta para asignar firmante).【F:frontend-ecep/src/app/dashboard/actas/_components/ViewActaDialog.tsx†L269-L275】

#### Casos Especiales:
- Desde este diálogo puede ejecutar acciones adicionales (cerrar, firmar, asignar firmante, editar, eliminar) según su rol; ver funcionalidades 4.7 y 4.8.

### 4.7 Gestionar estado y firma del acta
**Descripción**: Permite cerrar un acta, marcarla como firmada y asignar/cambiar la dirección firmante.
**Ubicación**: Botones dentro del diálogo de visualización y selectores correspondientes.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L1001-L1026】【F:frontend-ecep/src/app/dashboard/actas/_components/ViewActaDialog.tsx†L311-L332】

#### Procedimiento:
**Paso 1: Cerrar acta**
- **Acción**: En la vista detallada, pulse **Cerrar acta** (visible solo si el acta está en borrador).
- **Ubicación**: Barra de acciones del diálogo.
- **Datos requeridos**: Acta con hora, lugar, acciones, alumno e informante completos.
- **Validaciones**: Si falta información aparece “El acta no tiene información completa. Editá sus datos antes de cerrar el acta.” o “El acta no tiene asignado un alumno o docente responsable.”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L504-L517】
- **FOTO-ADJUNTA**: Botón “Cerrar acta” habilitado.
- **Resultado esperado**: Cambio de estado a “Cerrada” y toast “Acta cerrada”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L517-L545】

**Paso 2: Asignar dirección firmante**
- **Acción**: Seleccione un directivo en el desplegable “Dirección firmante”.
- **Ubicación**: Tarjeta “Seguimiento institucional” del diálogo.
- **Datos requeridos**: Directivo válido o la opción “Sin asignar”.
- **Validaciones**: No se permite asignar firmante si el acta sigue en borrador; muestra “Cerrá el acta antes de asignar una dirección firmante.”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L606-L657】【F:frontend-ecep/src/app/dashboard/actas/_components/ViewActaDialog.tsx†L234-L279】
- **FOTO-ADJUNTA**: Selector abierto con la lista de direcciones disponibles.
- **Resultado esperado**: Toast “Dirección firmante actualizada” y actualización inmediata de la información del acta.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L632-L655】

**Paso 3: Marcar como firmada**
- **Acción**: Pulse **Firmar acta** cuando el estado sea “Cerrada” y tenga firmante asignado.
- **Ubicación**: Barra de acciones del diálogo.
- **Datos requeridos**: Acta cerrada con alumno, informante y firmante definidos.
- **Validaciones**: Si faltan requisitos se muestran toasts como “Primero cerrá el acta antes de marcarla como firmada.”, “Asigná una dirección firmante antes de marcar el acta como firmada.” o “El acta no tiene asignado un alumno o docente responsable.”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L553-L569】
- **FOTO-ADJUNTA**: Botón “Firmar acta” habilitado.
- **Resultado esperado**: Toast “Acta marcada como firmada” y actualización del estado a “Firmada”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L570-L599】

#### Mensajes del Sistema:
- ✅ **Éxito**: “Acta cerrada”, “Dirección firmante actualizada”, “Acta marcada como firmada”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L531-L655】
- ❌ **Error**: “No se pudo actualizar el acta” ante fallas de red o servidor.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L546-L657】
- ⚠️ **Advertencia**: Toasts que indican pasos previos faltantes (cerrar acta, asignar firmante, completar datos).【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L507-L568】

#### Casos Especiales:
- El botón “Firmar acta” queda deshabilitado hasta que exista un firmante asignado y el estado sea “Cerrada”.【F:frontend-ecep/src/app/dashboard/actas/_components/ViewActaDialog.tsx†L319-L324】

### 4.8 Eliminar un acta
**Descripción**: Quita un acta del sistema de forma permanente (Dirección/Secretaría).
**Ubicación**: Botón **Eliminar** en la fila del listado y en la barra de acciones del diálogo de visualización.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L969-L1026】

#### Procedimiento:
**Paso 1: Confirmar eliminación**
- **Acción**: Pulse **Eliminar** y confirme la alerta emergente del navegador.
- **Ubicación**: Botón rojo con ícono de papelera en el listado o el diálogo.
- **Datos requeridos**: Confirmación manual.
- **Validaciones**: Ventana de confirmación con la pregunta “¿Eliminar el acta seleccionada?”; si cancela, no se realiza ninguna acción.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L488-L500】
- **FOTO-ADJUNTA**: Alerta de confirmación del navegador y botón “Eliminar” resaltado.
- **Resultado esperado**: Una vez confirmada, se envía la solicitud de eliminación.

**Paso 2: Verificar resultado**
- **Acción**: Espere a que el sistema procese la eliminación.
- **Ubicación**: Listado principal.
- **Datos requeridos**: No aplica.
- **Validaciones**: Mientras se procesa, el botón muestra “Eliminando…”. Al finalizar, se muestra toast “Acta eliminada” y el registro desaparece del listado.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L491-L545】【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L976-L985】
- **FOTO-ADJUNTA**: Listado actualizado sin el acta eliminada.
- **Resultado esperado**: El registro ya no figura en la lista.

#### Mensajes del Sistema:
- ✅ **Éxito**: “Acta eliminada”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L491-L495】
- ❌ **Error**: “No se pudo eliminar el acta” si ocurre un problema durante la operación.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L497-L500】
- ⚠️ **Advertencia**: Ninguna adicional.

#### Casos Especiales:
- Si el acta estaba abierta en el diálogo de visualización, se cierra automáticamente tras la eliminación.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L493-L495】

### 4.9 Consulta familiar de actas
**Descripción**: Vista simplificada para familias o estudiantes que muestra únicamente las actas vinculadas a sus hijos o a su usuario.
**Ubicación**: Se carga automáticamente cuando accede un usuario con alcance “family” o “student”.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L709-L724】

#### Procedimiento:
**Paso 1: Acceder a la vista**
- **Acción**: Ingrese a la sección desde una cuenta familiar o estudiantil.
- **Ubicación**: Misma ruta del panel principal.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Si hay alumnos asociados, se listan automáticamente; en caso contrario se muestra un mensaje informativo.【F:frontend-ecep/src/app/dashboard/actas/_components/FamilyActasView.tsx†L123-L137】
- **FOTO-ADJUNTA**: Vista con el encabezado “Actas de Accidentes” y tarjetas por alumno.
- **Resultado esperado**: Se muestran tarjetas por alumno con el detalle de cada acta registrada.

**Paso 2: Revisar actas por alumno**
- **Acción**: Expanda cada tarjeta para ver fecha, hora, lugar, descripción y acciones realizadas.
- **Ubicación**: Dentro de cada tarjeta de alumno.
- **Datos requeridos**: No aplica.
- **Validaciones**: Estados mostrados mediante insignias de color (Firmada, Cerrada, Borrador). Si no hay actas se muestra el texto “No se registraron actas para este alumno.”.【F:frontend-ecep/src/app/dashboard/actas/_components/FamilyActasView.tsx†L158-L195】
- **FOTO-ADJUNTA**: Tarjeta de alumno con una acta listada.
- **Resultado esperado**: Familiares pueden leer la información más reciente del incidente.

#### Mensajes del Sistema:
- ✅ **Éxito**: Visualización normal sin toasts.
- ❌ **Error**: Texto en rojo “No se pudo obtener el listado de actas.” si la consulta falla.【F:frontend-ecep/src/app/dashboard/actas/_components/FamilyActasView.tsx†L82-L99】【F:frontend-ecep/src/app/dashboard/actas/_components/FamilyActasView.tsx†L141-L144】
- ⚠️ **Advertencia**: Mensaje “No hay alumnos asociados a esta cuenta.” cuando el perfil no tiene alumnos vinculados.【F:frontend-ecep/src/app/dashboard/actas/_components/FamilyActasView.tsx†L131-L137】

#### Casos Especiales:
- Mientras se cargan los datos se muestra el indicador “Cargando actas…”. Si ocurre un error se mantiene el mensaje hasta que se recargue la vista.【F:frontend-ecep/src/app/dashboard/actas/_components/FamilyActasView.tsx†L74-L144】

## 5. Preguntas Frecuentes
1. **¿Por qué no puedo editar un acta?** — Solo Dirección y Secretaría pueden editar. Además, las actas firmadas quedan bloqueadas para edición.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L475-L486】
2. **¿Qué debo hacer si no veo alumnos en el formulario?** — Verifique que su rol tenga secciones asignadas. El sistema intentará cargar alumnos del período activo; si no hay asignaciones, contacte a la administración para actualizar los datos.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L173-L217】
3. **¿Se puede registrar un acta con fecha anterior a dos días?** — No. Por seguridad solo se aceptan incidentes ocurridos hoy o en los dos días previos.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L319-L321】
4. **¿Cómo identifico el estado del acta?** — Cada registro muestra una insignia: Borrador (rojo), Cerrada (gris) o Firmada (verde).【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L902-L957】

## 6. Solución de Problemas
- **Mensaje “No se pudo crear el acta.”**: Revise que todos los campos obligatorios estén completos y que el docente informante esté seleccionado. Si persiste, puede deberse a un error de conexión con el servicio de Vida Escolar.【F:frontend-ecep/src/app/dashboard/actas/_components/NewActaDialog.tsx†L314-L385】
- **Mensaje “No se pudo actualizar el acta.”** al cerrar/firmar: Compruebe que el acta tenga alumno, docente informante, hora, lugar, acciones y dirección firmante (para firmar).【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L504-L600】
- **No aparece el botón Nueva Acta**: Su rol no tiene permiso de creación (por ejemplo, perfiles administrativos sin rol autorizado o familias). Verifique con Dirección para que actualicen sus permisos.【F:frontend-ecep/src/app/dashboard/actas/page.tsx†L737-L769】
- **Vista familiar vacía**: Confirme que el alumno esté asociado al usuario. Si no hay vínculo, contacte a la institución para actualizar los datos familiares.【F:frontend-ecep/src/app/dashboard/actas/_components/FamilyActasView.tsx†L131-L195】
