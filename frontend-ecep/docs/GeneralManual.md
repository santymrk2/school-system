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

# Autenticación y Acceso al Sistema

## 1. Introducción
La sección de Autenticación y Acceso permite ingresar al Sistema de Gestión Escolar ECEP con credenciales institucionales, validar que la cuenta exista, elegir el rol de trabajo cuando corresponda y acceder a las áreas protegidas del portal. También incluye los mensajes que el sistema muestra cuando no hay permisos suficientes o cuando una cuenta no tiene roles habilitados.

## 2. Roles y Permisos
- **Usuarios con credenciales válidas**: pueden iniciar sesión completando el formulario y acceder según el rol asignado. Todos deben contar con un correo institucional válido para superar la verificación inicial. 【F:frontend-ecep/src/app/page.tsx†L103-L139】
- **Roles habilitados en la plataforma**: Dirección, Administración, Secretaría, Coordinación, Docencia, Suplente, Familia, Alumno y Usuario. Estos roles determinan los menús y permisos una vez dentro del sistema. 【F:frontend-ecep/src/lib/auth-roles.ts†L3-L95】
- **Selección de rol**: cuando la cuenta posee más de un rol, la persona debe escoger cuál utilizar antes de ingresar al panel. El sistema recuerda el rol elegido para futuras sesiones. 【F:frontend-ecep/src/app/select-rol/page.tsx†L18-L77】【F:frontend-ecep/src/context/AuthContext.tsx†L133-L200】
- **Protección de áreas privadas**: las rutas `/dashboard` y `/select-rol` requieren tener la sesión abierta. En caso contrario, se redirige automáticamente a la pantalla de inicio de sesión. 【F:frontend-ecep/middleware.ts†L5-L20】
- **Falta de roles**: si la cuenta no tiene ningún rol disponible, se muestra una tarjeta informativa y sólo se ofrece cerrar la sesión. 【F:frontend-ecep/src/app/page.tsx†L147-L170】

## 3. Acceso a la Sección
### Paso 1: Abrir la pantalla de inicio de sesión
- **Acción**: Ingrese en su navegador la dirección institucional del sistema (por ejemplo, `https://sistema.ecep.edu.ar`).
- **FOTO-ADJUNTA**: Vista general de la pantalla de inicio con el logo de la escuela y la tarjeta "Iniciar Sesión" al centro.
- **Resultado esperado**: Se muestra la pantalla de autenticación con el formulario para completar su correo electrónico.

## 4. Funcionalidades

### 4.1 Validar correo institucional
**Descripción**: Comprueba que el correo pertenezca a la institución antes de solicitar la contraseña.
**Ubicación**: Tarjeta "Iniciar Sesión" en la pantalla principal (`/`).

#### Procedimiento:
**Paso 1: Escribir el correo electrónico**
- **Acción**: Escriba su correo institucional en el campo "Correo Electrónico".
- **Ubicación**: Dentro del formulario principal, debajo del título "Iniciar Sesión".
- **Datos requeridos**: Correo con formato `nombre@ecep.edu.ar`.
- **Validaciones**: Campo obligatorio, formato de correo electrónico válido. El sistema impide continuar si el campo queda vacío o con formato incorrecto. 【F:frontend-ecep/src/app/page.tsx†L224-L238】
- **FOTO-ADJUNTA**: Captura del formulario mostrando el campo de correo relleno y el botón "Continuar" habilitado.
- **Resultado esperado**: El botón principal cambia su texto a "Continuar" y queda listo para enviar la verificación.

**Paso 2: Solicitar la verificación**
- **Acción**: Presione el botón "Continuar" para que el sistema verifique la existencia del correo.
- **Ubicación**: Debajo del campo de correo, botón principal de la tarjeta.
- **Datos requeridos**: Ninguno adicional.
- **Validaciones**: Mientras la verificación está en curso, el botón se deshabilita y muestra el mensaje "Verificando..." para evitar envíos duplicados. 【F:frontend-ecep/src/app/page.tsx†L278-L293】
- **FOTO-ADJUNTA**: Botón "Verificando..." deshabilitado tras presionarlo.
- **Resultado esperado**: Si el correo es reconocido, aparece el campo de contraseña y un botón para volver atrás; si ocurre un error, aparece un mensaje emergente con la causa.

#### Mensajes del Sistema:
- ✅ **Éxito**: No se muestra mensaje, se habilita inmediatamente el campo de contraseña.
- ❌ **Error**: Notificación emergente "No pudimos verificar el correo electrónico" u otro mensaje enviado por el servidor (por ejemplo, si el correo no está registrado). 【F:frontend-ecep/src/app/page.tsx†L110-L119】
- ⚠️ **Advertencia**: El sistema impide nuevos envíos mientras la verificación anterior está pendiente.

#### Casos Especiales:
- Si la sesión ya está iniciada con un rol seleccionado, la pantalla redirige automáticamente al panel sin mostrar el formulario. 【F:frontend-ecep/src/app/page.tsx†L81-L101】

### 4.2 Ingresar contraseña y acceder al sistema
**Descripción**: Permite completar la autenticación una vez validado el correo.
**Ubicación**: Misma tarjeta "Iniciar Sesión", visible después de validar el correo.

#### Procedimiento:
**Paso 1: Completar la contraseña**
- **Acción**: Escriba su contraseña en el campo "Contraseña".
- **Ubicación**: Aparece debajo del campo de correo una vez validado.
- **Datos requeridos**: Contraseña vigente proporcionada por la institución.
- **Validaciones**: Campo obligatorio. El texto de ayuda recuerda que debe tener mínimo 8 caracteres, 2 números y 1 símbolo especial. 【F:frontend-ecep/src/app/page.tsx†L242-L272】
- **FOTO-ADJUNTA**: Campo de contraseña visible con el texto informativo debajo.
- **Resultado esperado**: El botón principal muestra "Ingresar" y queda habilitado.

**Paso 2: Confirmar el ingreso**
- **Acción**: Presione el botón "Ingresar".
- **Ubicación**: Parte inferior del formulario.
- **Datos requeridos**: Ninguno adicional.
- **Validaciones**: Durante el envío, el botón se deshabilita y muestra "Ingresando..." para evitar clics repetidos. 【F:frontend-ecep/src/app/page.tsx†L278-L293】
- **FOTO-ADJUNTA**: Botón con el texto "Ingresando...".
- **Resultado esperado**: El sistema valida credenciales, guarda la sesión y redirige al panel correspondiente según los roles disponibles.

#### Mensajes del Sistema:
- ✅ **Éxito**: No aparece mensaje; se produce la redirección automática al panel o a la selección de roles.
- ❌ **Error**: Notificación emergente "Error al iniciar sesión" o la respuesta de error enviada por el servidor (por ejemplo, contraseña incorrecta). 【F:frontend-ecep/src/app/page.tsx†L124-L136】
- ⚠️ **Advertencia**: Si la cuenta no tiene roles configurados, se muestra una tarjeta especial indicando que debe contactar a la administración. 【F:frontend-ecep/src/app/page.tsx†L150-L166】

#### Casos Especiales:
- Si la cuenta sólo posee un rol, el sistema lo selecciona automáticamente y abre el panel principal. 【F:frontend-ecep/src/app/page.tsx†L92-L96】【F:frontend-ecep/src/context/AuthContext.tsx†L242-L252】
- Si existen varios roles, se abre la pantalla "Elegí con qué rol entrar" para que el usuario elija antes de continuar. 【F:frontend-ecep/src/app/page.tsx†L96-L100】【F:frontend-ecep/src/context/AuthContext.tsx†L252-L255】

### 4.3 Mostrar u ocultar la contraseña
**Descripción**: Permite alternar la visibilidad de la contraseña mientras se escribe.
**Ubicación**: Ícono con forma de ojo dentro del campo de contraseña.

#### Procedimiento:
**Paso 1: Alternar visibilidad**
- **Acción**: Haga clic en el ícono de ojo para mostrar la contraseña; vuelva a hacer clic para ocultarla.
- **Ubicación**: Al lado derecho del campo "Contraseña".
- **Datos requeridos**: Ninguno.
- **Validaciones**: Disponible únicamente cuando el campo de contraseña está visible (es decir, tras validar el correo).
- **FOTO-ADJUNTA**: Campo de contraseña con el ícono resaltado.
- **Resultado esperado**: El texto del campo cambia entre modo oculto y visible. 【F:frontend-ecep/src/app/page.tsx†L242-L268】

#### Mensajes del Sistema:
- ✅ **Éxito**: No se muestran mensajes; el cambio es inmediato.
- ❌ **Error**: No aplica.
- ⚠️ **Advertencia**: No aplica.

#### Casos Especiales:
- Si cambia nuevamente el correo (ver funcionalidad 4.4), la contraseña se limpia y vuelve a ocultarse automáticamente. 【F:frontend-ecep/src/app/page.tsx†L141-L145】

### 4.4 Cambiar el correo verificado
**Descripción**: Permite regresar al primer paso para corregir el correo ingresado.
**Ubicación**: Botón redondo de retroceso que aparece en la esquina superior izquierda de la tarjeta al validar el correo.

#### Procedimiento:
**Paso 1: Volver a la edición del correo**
- **Acción**: Presione el botón de flecha hacia atrás.
- **Ubicación**: Dentro del encabezado de la tarjeta "Iniciar Sesión".
- **Datos requeridos**: Ninguno.
- **Validaciones**: Sólo disponible cuando ya se validó un correo; permanece deshabilitado mientras se envía la contraseña.
- **FOTO-ADJUNTA**: Vista de la tarjeta con el botón de retroceso activo.
- **Resultado esperado**: El campo de contraseña desaparece, la contraseña guardada se borra y el campo de correo vuelve a estar editable. 【F:frontend-ecep/src/app/page.tsx†L200-L208】【F:frontend-ecep/src/app/page.tsx†L141-L145】

#### Mensajes del Sistema:
- ✅ **Éxito**: No se muestra mensaje; el formulario vuelve al estado inicial.
- ❌ **Error**: No aplica.
- ⚠️ **Advertencia**: No aplica.

#### Casos Especiales:
- Mientras se envía la contraseña, el botón permanece deshabilitado para evitar inconsistencias. 【F:frontend-ecep/src/app/page.tsx†L201-L207】

### 4.5 Solicitar acceso como nuevo alumno
**Descripción**: Redirige a la página de solicitud de ingreso para familias o estudiantes que aún no tienen credenciales.
**Ubicación**: Botón secundario con el texto "¿Querés postularte como alumno? Ingresá acá" visible debajo del formulario cuando todavía no se verificó un correo.

#### Procedimiento:
**Paso 1: Abrir formulario de solicitud**
- **Acción**: Haga clic en el botón con icono de usuarios.
- **Ubicación**: Debajo del separador "o" en la pantalla de inicio.
- **Datos requeridos**: Ninguno en esta pantalla.
- **Validaciones**: Disponible únicamente antes de validar el correo institucional.
- **FOTO-ADJUNTA**: Botón secundario resaltado junto con el icono de usuarios.
- **Resultado esperado**: Se abre la página `/solicitud` para completar la postulación. 【F:frontend-ecep/src/app/page.tsx†L296-L313】

#### Mensajes del Sistema:
- ✅ **Éxito**: No se muestra mensaje; se produce la navegación a la página de solicitud.
- ❌ **Error**: No aplica.
- ⚠️ **Advertencia**: No aplica.

#### Casos Especiales:
- Si el correo ya fue validado, el botón desaparece para evitar confusiones. 【F:frontend-ecep/src/app/page.tsx†L296-L314】

### 4.6 Seleccionar rol de ingreso
**Descripción**: Permite a los usuarios con múltiples roles elegir cómo desean operar dentro del sistema.
**Ubicación**: Pantalla `/select-rol`, que aparece automáticamente después de iniciar sesión cuando hay más de un rol.

#### Procedimiento:
**Paso 1: Revisar los roles disponibles**
- **Acción**: Lea la lista de botones con cada rol asignado.
- **Ubicación**: Tarjeta central en la pantalla "Elegí con qué rol entrar".
- **Datos requeridos**: Ninguno.
- **Validaciones**: Sólo se muestra si la cuenta posee más de un rol y la sesión está activa. 【F:frontend-ecep/src/app/select-rol/page.tsx†L22-L49】
- **FOTO-ADJUNTA**: Tarjeta con los botones de roles visibles.
- **Resultado esperado**: Visualizar todos los roles disponibles ordenados por prioridad.

**Paso 2: Elegir un rol**
- **Acción**: Haga clic en el botón del rol con el que desea trabajar.
- **Ubicación**: Dentro de la tarjeta, cada botón corresponde a un rol.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Tras seleccionar un rol, el sistema lo guarda y redirige al panel principal.
- **FOTO-ADJUNTA**: Botón de rol seleccionado resaltado.
- **Resultado esperado**: Se ingresa a `/dashboard` con los permisos del rol elegido. 【F:frontend-ecep/src/app/select-rol/page.tsx†L62-L77】

#### Mensajes del Sistema:
- ✅ **Éxito**: No se muestra mensaje; la redirección es inmediata.
- ❌ **Error**: No aplica.
- ⚠️ **Advertencia**: Si el usuario intenta acceder sin haber iniciado sesión, es redirigido automáticamente a la pantalla de login. 【F:frontend-ecep/src/app/select-rol/page.tsx†L26-L45】

#### Casos Especiales:
- Si en un futuro sólo queda un rol disponible, la pantalla no se muestra y se ingresa directo al panel. 【F:frontend-ecep/src/app/select-rol/page.tsx†L35-L41】

### 4.7 Cerrar sesión desde la pantalla principal
**Descripción**: Permite salir de la cuenta cuando se detecta que no hay roles asignados o se necesita finalizar la sesión manualmente.
**Ubicación**: Botón "Cerrar sesión" dentro de la tarjeta informativa que aparece cuando la cuenta carece de roles.

#### Procedimiento:
**Paso 1: Confirmar el cierre de sesión**
- **Acción**: Presione el botón "Cerrar sesión".
- **Ubicación**: En la parte inferior derecha de la tarjeta "Sin roles asignados".
- **Datos requeridos**: Ninguno.
- **Validaciones**: No aplica.
- **FOTO-ADJUNTA**: Tarjeta de "Sin roles asignados" con el botón resaltado.
- **Resultado esperado**: Se finaliza la sesión, se borran las credenciales guardadas y se regresa a la pantalla de login. 【F:frontend-ecep/src/app/page.tsx†L150-L168】【F:frontend-ecep/src/context/AuthContext.tsx†L274-L289】

#### Mensajes del Sistema:
- ✅ **Éxito**: No se muestra mensaje; la pantalla vuelve al formulario de inicio de sesión.
- ❌ **Error**: No aplica.
- ⚠️ **Advertencia**: Si la red se interrumpe, el sistema igualmente limpia la sesión local y recarga la página de inicio. 【F:frontend-ecep/src/context/AuthContext.tsx†L274-L289】

#### Casos Especiales:
- El botón sólo aparece en el estado "Sin roles asignados". Para cerrar sesión desde otras pantallas utilice las opciones internas del panel.

### 4.8 Mensaje de acceso no autorizado
**Descripción**: Informa cuando intenta acceder a una sección sin permisos suficientes.
**Ubicación**: Ruta `/unauthorized`, que puede abrirse desde enlaces internos protegidos.

#### Procedimiento:
**Paso 1: Revisar el mensaje**
- **Acción**: Lea la advertencia mostrada.
- **Ubicación**: Pantalla completa con texto en rojo.
- **Datos requeridos**: Ninguno.
- **Validaciones**: No aplica.
- **FOTO-ADJUNTA**: Pantalla completa con el texto "No tenés permisos para acceder a esta sección".
- **Resultado esperado**: Comprender que la sección está restringida y volver a una ruta permitida.

#### Mensajes del Sistema:
- ⚠️ **Advertencia**: Texto en color rojo "No tenés permisos para acceder a esta sección." 【F:frontend-ecep/src/app/unauthorized/page.tsx†L2-L7】

#### Casos Especiales:
- Si llega a esta pantalla tras iniciar sesión, revise que haya seleccionado el rol correcto o solicite permisos adicionales.

## 5. Preguntas Frecuentes
- **¿Por qué el sistema me pide validar el correo antes de la contraseña?** Para confirmar que la cuenta existe y guiar a los usuarios sin acceso hacia el formulario de solicitud. 【F:frontend-ecep/src/app/page.tsx†L103-L139】
- **¿Qué sucede si tengo más de un rol?** Después de iniciar sesión se le mostrará la pantalla de selección de rol para elegir con cuál trabajar. El sistema recordará su última elección. 【F:frontend-ecep/src/app/select-rol/page.tsx†L18-L77】【F:frontend-ecep/src/context/AuthContext.tsx†L133-L200】
- **¿Por qué vuelvo al inicio cuando intento entrar al panel directo?** Las áreas `/dashboard` y `/select-rol` están protegidas. Si la sesión venció o no está autenticado, el sistema lo envía nuevamente al login. 【F:frontend-ecep/middleware.ts†L5-L20】

## 6. Solución de Problemas
- **El botón queda en "Verificando..." y no avanza**: Compruebe su conexión a internet. Si persiste, recargue la página e intente nuevamente. Mientras el botón muestre ese texto, espere a que finalice la solicitud. 【F:frontend-ecep/src/app/page.tsx†L278-L293】
- **Recibo el mensaje "No pudimos verificar el correo electrónico"**: Confirme que está usando su correo institucional. Si el problema continúa, comuníquese con el área administrativa para registrar su cuenta. 【F:frontend-ecep/src/app/page.tsx†L110-L119】
- **El sistema indica "Sin roles asignados"**: Contacte a la administración para que le asignen un rol. Por el momento sólo puede cerrar la sesión desde esa tarjeta. 【F:frontend-ecep/src/app/page.tsx†L150-L168】
- **Soy redirigido al inicio al intentar abrir `/select-rol`**: Esto ocurre si la sesión expiró o ingresó el enlace sin iniciar sesión. Vuelva a autenticarse y repita el proceso. 【F:frontend-ecep/src/app/select-rol/page.tsx†L26-L49】【F:frontend-ecep/middleware.ts†L5-L20】
- **Veo el mensaje de "No tenés permisos"**: Asegúrese de haber elegido el rol correcto o solicite permisos. Si el problema continúa, contacte al soporte técnico indicando la sección a la que quiso acceder. 【F:frontend-ecep/src/app/unauthorized/page.tsx†L2-L7】【F:frontend-ecep/src/context/AuthContext.tsx†L291-L298】
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
# Comunicados

## 1. Introducción
La sección **Comunicados** permite consultar y gestionar los avisos institucionales que la institución envía a personal, docentes, estudiantes y familias. Desde este módulo usted puede revisar los comunicados disponibles, filtrarlos según su alcance, abrir los detalles completos y, si su rol lo permite, publicar o eliminar avisos.

## 2. Roles y Permisos
- **Todos los usuarios autenticados** (personal, docentes, estudiantes y familias) pueden acceder a la sección y visualizar los comunicados visibles según su relación con la institución.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L91-L193】【F:frontend-ecep/src/lib/menu.ts†L29-L116】
- **Director, Administrador, Secretaria y Coordinador** pueden crear y eliminar cualquier comunicado institucional, por nivel o por sección.【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L64-L116】【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L94-L210】
- **Docentes (titulares o suplentes)** pueden crear comunicados únicamente dirigidos a sus secciones asignadas y eliminar aquellos que hayan sido publicados para ellas.【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L64-L116】【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L94-L210】
- **Estudiantes y familias** solo pueden visualizar los comunicados que les correspondan; no tienen acciones de creación ni eliminación.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L145-L193】

## 3. Acceso a la Sección
### Paso 1: Ingresar al panel de comunicaciones
- **Acción**: Seleccione la opción **“Comunicados”** en el menú principal del panel.
- **FOTO-ADJUNTA**: Captura del menú lateral con la opción “Comunicados” resaltada.
- **Resultado esperado**: Se abre la vista de comunicados con el listado, la barra de búsqueda y los filtros disponibles.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L229-L288】

## 4. Funcionalidades

### 4.1 Consultar comunicados disponibles
**Descripción**: Permite visualizar los comunicados institucionales y los dirigidos específicamente a niveles o secciones, con opciones para buscar y filtrar la información.
**Ubicación**: Parte central de la página de Comunicados.

#### Procedimiento:
**Paso 1: Revisar el listado inicial**
- **Acción**: Lea los comunicados que aparecen en las tarjetas del listado.
- **Ubicación**: Centro de la página, debajo del título “Comunicados”.
- **Datos requeridos**: No aplica.
- **Validaciones**: Si no existen comunicados visibles, se mostrará el mensaje “No hay comunicados para mostrar”.
- **FOTO-ADJUNTA**: Vista del listado con varias tarjetas de comunicados, mostrando título, alcance y fecha de publicación.
- **Resultado esperado**: Visualiza cada tarjeta con título, alcance, fecha y un resumen del cuerpo del comunicado.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L274-L447】

**Paso 2: Buscar un comunicado específico**
- **Acción**: Ingrese palabras clave en el campo “Buscar comunicado…” y presione Enter.
- **Ubicación**: Barra superior de filtros, a la izquierda.
- **Datos requeridos**: Texto relacionado con el título, cuerpo, alcance, número de sección o nivel.
- **Validaciones**: El sistema filtra automáticamente; no hay restricciones de formato.
- **FOTO-ADJUNTA**: Barra de búsqueda con un término ingresado y resultados filtrados.
- **Resultado esperado**: El listado se actualiza mostrando solo los comunicados cuyo título, cuerpo, alcance, nivel o sección coinciden con el término buscado.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L175-L193】【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L274-L288】

**Paso 3: Filtrar por alcance**
- **Acción**: Abra el selector “Filtrar por alcance” y elija entre “Todos los alcances”, “Institucional”, “Por nivel” o “Por sección”.
- **Ubicación**: Barra superior de filtros, a la derecha.
- **Datos requeridos**: Selección de una opción del menú desplegable.
- **Validaciones**: Solo se permite una opción a la vez.
- **FOTO-ADJUNTA**: Selector desplegado mostrando las cuatro opciones de alcance.
- **Resultado esperado**: El listado muestra únicamente los comunicados cuyo alcance coincide con la opción elegida.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L246-L288】

**Paso 4: Abrir el detalle completo**
- **Acción**: Haga clic en el botón **“Ver”** de la tarjeta deseada.
- **Ubicación**: Esquina superior derecha de cada tarjeta de comunicado.
- **Datos requeridos**: No aplica.
- **Validaciones**: No hay restricciones; cualquier usuario puede abrir los detalles.
- **FOTO-ADJUNTA**: Dialogo emergente mostrando título completo, alcance y cuerpo del comunicado.
- **Resultado esperado**: Se abre un diálogo con el comunicado completo, incluyendo título, alcance, fecha y texto íntegro. Si su rol lo permite, encontrará el botón para eliminarlo desde esta vista.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L291-L347】

#### Mensajes del Sistema:
- ✅ **Éxito**: Al cargar correctamente se muestran las tarjetas o el mensaje “No hay comunicados para mostrar”.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L370-L377】
- ❌ **Error**: No aplica en la consulta; los errores solo aparecen al intentar eliminar o no cargar datos (ver solución de problemas).
- ⚠️ **Advertencia**: Mensaje “Cargando comunicados…” mientras se recupera la información.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L274-L280】

#### Casos Especiales:
- Si no existen comunicados visibles para su rol o relación con la institución, verá el mensaje “No hay comunicados para mostrar”.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L370-L377】
- Los comunicados muestran el alcance como insignias: “Institucional”, “Nivel {nombre}” o el nombre de la sección asignada.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L380-L470】

### 4.2 Crear un nuevo comunicado
**Descripción**: Publica un comunicado institucional, por nivel o por sección según los permisos de su rol.
**Ubicación**: Botón **“Nuevo Comunicado”** en la parte superior derecha de la sección.

#### Procedimiento:
**Paso 1: Abrir el formulario de creación**
- **Acción**: Haga clic en el botón **“Nuevo Comunicado”**.
- **Ubicación**: Encabezado de la página, junto al título.
- **Datos requeridos**: No aplica.
- **Validaciones**: Solo visible para directivos, administrativos, coordinadores y docentes autorizados.
- **FOTO-ADJUNTA**: Encabezado con el botón “Nuevo Comunicado” resaltado.
- **Resultado esperado**: Se abre un diálogo con el formulario de publicación.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L231-L288】【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L170-L214】

**Paso 2: Completar la información general**
- **Acción**: Ingrese el título y el cuerpo del comunicado en los campos correspondientes.
- **Ubicación**: Parte superior del formulario dentro del diálogo.
- **Datos requeridos**: 
  - *Título*: texto libre descriptivo del aviso.
  - *Cuerpo del mensaje*: texto completo del comunicado.
- **Validaciones**: Ambos campos son obligatorios; el botón “Publicar” permanece deshabilitado hasta que estén completos (no se permiten solo espacios en blanco).
- **FOTO-ADJUNTA**: Formulario con los campos “Título” y “Cuerpo del mensaje” completados.
- **Resultado esperado**: Los campos quedan guardados en pantalla y habilitan la selección de alcance.【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L254-L299】【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L120-L209】

**Paso 3: Definir el alcance del comunicado**
- **Acción**: Elija una opción en el selector de alcance. Si selecciona “Por nivel”, indique el nivel; si selecciona “Por sección”, elija la sección específica.
- **Ubicación**: Bloque de selectores ubicado debajo de los campos de texto.
- **Datos requeridos**:
  - *Alcance*: “Institucional”, “Por nivel” o “Por sección”.
  - *Nivel*: requerido únicamente si el alcance es “Por nivel”. Opciones: “Inicial” o “Primario”.
  - *Sección*: requerido únicamente si el alcance es “Por sección”. La lista se restringe a las secciones habilitadas para su rol.
- **Validaciones**: 
  - No puede publicar sin definir un nivel cuando el alcance es “Por nivel”.
  - No puede publicar sin seleccionar una sección cuando el alcance es “Por sección”.
  - Los docentes solo verán la opción “Por sección” y las secciones asignadas.
- **FOTO-ADJUNTA**: Selector de alcance desplegado y, según el caso, el selector de nivel o de sección completado.
- **Resultado esperado**: El formulario queda completo y el botón “Publicar” se habilita.【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L276-L333】【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L91-L118】

**Paso 4: Confirmar y publicar**
- **Acción**: Presione el botón **“Publicar”** y, en la ventana de confirmación, elija **“Confirmar y publicar”**.
- **Ubicación**: Sección inferior derecha del diálogo.
- **Datos requeridos**: No aplica.
- **Validaciones**: El sistema valida nuevamente que los campos obligatorios estén completos. Mientras se envía, verá un ícono de carga.
- **FOTO-ADJUNTA**: Diálogo de confirmación de envío mostrando el mensaje “¿Publicar este comunicado?” y el botón “Confirmar y publicar” resaltado.
- **Resultado esperado**: El comunicado se publica, el formulario se cierra y el listado se actualiza automáticamente. Si ocurre un error, se muestra una notificación indicando que no se pudo crear el comunicado.【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L336-L370】【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L144-L214】

#### Mensajes del Sistema:
- ✅ **Éxito**: El diálogo se cierra y el nuevo comunicado aparece en el listado actualizado (no se muestra un mensaje, pero el resultado visible confirma la publicación).【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L144-L214】【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L194-L288】
- ❌ **Error**: “No se pudo crear el comunicado” cuando ocurre un problema en el envío; el sistema muestra detalles adicionales si están disponibles.【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L132-L143】
- ⚠️ **Advertencia**: El botón “Publicar” se deshabilita y muestra un ícono giratorio mientras se envía la información.【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L336-L344】

#### Casos Especiales:
- Al abrir el formulario, los campos se reinician para evitar que se publiquen datos anteriores por error.【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L120-L139】
- Si no posee permisos de creación, el botón “Nuevo Comunicado” no se muestra.【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L79-L116】【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L231-L243】

### 4.3 Eliminar un comunicado existente
**Descripción**: Permite quitar de la vista un comunicado previamente publicado mediante un borrado lógico.
**Ubicación**: Botón **“Eliminar”** disponible dentro del detalle o como ícono en cada tarjeta (según permisos).

#### Procedimiento:
**Paso 1: Identificar un comunicado eliminable**
- **Acción**: Verifique que el comunicado muestre el ícono de papelera en la tarjeta o el botón “Eliminar” dentro del detalle.
- **Ubicación**: Parte superior derecha de la tarjeta o en la esquina inferior del diálogo de detalle.
- **Datos requeridos**: No aplica.
- **Validaciones**: Solo visible para directivos, administrativos, coordinadores y docentes con secciones asignadas al comunicado (alcance “Por sección”).
- **FOTO-ADJUNTA**: Tarjeta de comunicado resaltando el ícono de papelera habilitado.
- **Resultado esperado**: Confirma que tiene permisos para eliminar ese comunicado.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L199-L347】

**Paso 2: Confirmar la eliminación**
- **Acción**: Haga clic en el botón de papelera o “Eliminar”, confirme la acción en el diálogo y seleccione **“Eliminar”**.
- **Ubicación**: Diálogo emergente con el mensaje “¿Eliminar comunicado?”
- **Datos requeridos**: No aplica.
- **Validaciones**: El sistema solicita confirmación antes de proceder.
- **FOTO-ADJUNTA**: Diálogo de confirmación mostrando el texto “Esta acción lo ocultará para todos (borrado lógico)” y el botón “Eliminar” resaltado.
- **Resultado esperado**: El comunicado desaparece del listado. Si ocurre un problema, se muestra una notificación de error.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L204-L347】

#### Mensajes del Sistema:
- ✅ **Éxito**: El comunicado deja de aparecer en la lista tras confirmar la eliminación.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L204-L347】
- ❌ **Error**: “No se pudo eliminar el comunicado” cuando la operación falla, mostrando detalles adicionales si están disponibles.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L212-L222】
- ⚠️ **Advertencia**: El cuadro de confirmación indica que la acción es un borrado lógico y no puede deshacerse visualmente.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L324-L344】

#### Casos Especiales:
- Los docentes solo pueden eliminar comunicados dirigidos a sus propias secciones con alcance “Por sección”. No podrán borrar comunicados institucionales ni de otras secciones.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L204-L210】

## 5. Preguntas Frecuentes
1. **¿Por qué no veo el botón “Nuevo Comunicado”?**  
   Su rol no tiene permisos de publicación (solo directivos, administrativos, coordinadores y docentes pueden crear comunicados).【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L79-L116】
2. **¿Por qué algunos comunicados dicen “Institucional” y otros muestran una sección?**  
   Indican el alcance definido por quien lo publicó: institucional para toda la comunidad, por nivel (Inicial/Primario) o por sección específica.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L380-L470】
3. **¿Qué sucede si la lista está vacía?**  
   Significa que no hay comunicados visibles para usted en este momento; aparecerá el mensaje correspondiente.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L370-L377】
4. **¿Puedo editar un comunicado?**  
   No, actualmente solo se permite crear y eliminar comunicados. Para actualizar la información, elimine el aviso y publique uno nuevo.

## 6. Solución de Problemas
- **No se cargan los comunicados y solo veo “Cargando comunicados…”**: Verifique su conexión. El sistema intenta recuperar la información automáticamente; si persiste, recargue la página.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L274-L280】
- **Aparece el mensaje “No se pudo crear el comunicado”**: Revise su conexión o vuelva a intentarlo más tarde. Si el problema continúa, contacte al área de sistemas con el detalle mostrado en la notificación.【F:frontend-ecep/src/app/dashboard/comunicados/_components/NewComunicadoDialog.tsx†L132-L143】
- **Aparece el mensaje “No se pudo eliminar el comunicado”**: Ocurre cuando la eliminación falla. Confirme que mantiene permisos sobre el comunicado e intente nuevamente; si persiste, solicite soporte técnico.【F:frontend-ecep/src/app/dashboard/comunicados/page.tsx†L212-L222】
# Dashboard - Configuración

## 1. Introducción
La ventana **Configuración** centraliza los ajustes personales y administrativos del panel. Desde aquí puede activar el modo oscuro, administrar trimestres y períodos escolares, y definir las credenciales del correo institucional según el rol con el que haya iniciado sesión.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L70-L195】

## 2. Roles y Permisos
- **Todos los roles**: acceden a la pestaña **Apariencia** para alternar el modo oscuro.
- **Rol Dirección**: habilita las pestañas **Trimestres**, **Período escolar** y **Correo Electrónico**. Si no selecciona este rol, verá un mensaje que le indica que cambie a “Dirección” para continuar.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L83-L195】
- Cuando no existe información adicional para su rol (por ejemplo, si no es Dirección) se muestra un aviso informativo.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L144-L153】

## 3. Acceso a la Sección
### Paso 1: Abrir el menú de usuario
- **Acción**: Haga clic sobre su nombre (o iniciales) en la parte superior de la barra lateral.
- **FOTO-ADJUNTA**: Captura del menú de usuario abierto mostrando la opción “Configuración”.
- **Resultado esperado**: Se despliega el menú de usuario con las opciones de cambio de rol y configuración.【F:frontend-ecep/src/app/dashboard/layout.tsx†L320-L371】

### Paso 2: Ingresar a Configuración
- **Acción**: Seleccione **Configuración** dentro del menú desplegable.
- **FOTO-ADJUNTA**: Pantalla con la opción “Configuración” resaltada dentro del menú.
- **Resultado esperado**: Se abre el diálogo de Configuración con la pestaña **Apariencia** activa.【F:frontend-ecep/src/app/dashboard/layout.tsx†L368-L425】【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L110-L195】

## 4. Funcionalidades

### 4.1 Ajustar la apariencia del panel (Modo oscuro)
**Descripción**: Alterna el modo oscuro del tablero para reducir el brillo de la pantalla.
**Ubicación**: Pestaña **Apariencia**, visible para todos los roles.

#### Procedimiento:
**Paso 1: Revisar el estado actual del modo**
- **Acción**: Observe la posición del interruptor **Modo oscuro**.
- **Ubicación**: Parte superior de la pestaña Apariencia.
- **Datos requeridos**: Ninguno.
- **Validaciones**: El interruptor permanece deshabilitado hasta que finaliza la carga inicial del tema.
- **FOTO-ADJUNTA**: Pestaña “Apariencia” con el interruptor del modo oscuro resaltado.
- **Resultado esperado**: Identifica si el modo oscuro está activado (interruptor a la derecha) o desactivado (a la izquierda).【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L204-L228】

**Paso 2: Activar o desactivar el modo oscuro**
- **Acción**: Cambie la posición del interruptor.
- **Ubicación**: Misma sección de Apariencia.
- **Datos requeridos**: Ninguno.
- **Validaciones**: No aplican reglas adicionales.
- **FOTO-ADJUNTA**: Comparativa del tablero antes y después del cambio de tema.
- **Resultado esperado**: La interfaz cambia al modo seleccionado inmediatamente.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L222-L228】

#### Mensajes del Sistema:
- No se muestran mensajes emergentes; el cambio es visual e inmediato.

#### Casos Especiales:
- El interruptor se deshabilita brevemente al abrir la ventana hasta que se determine el tema actual.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L204-L228】

### 4.2 Administrar trimestres escolares
**Descripción**: Permite definir fechas, reabrir o cerrar trimestres del período activo.
**Ubicación**: Pestaña **Trimestres**, visible solo con el rol Dirección seleccionado.

#### Procedimiento:
**Paso 1: Cambiar al rol Dirección (si corresponde)**
- **Acción**: En el menú de usuario, seleccione el rol **Dirección** antes de abrir la pestaña.
- **Ubicación**: Menú de usuario superior.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Si permanece con otro rol, el sistema mostrará un aviso indicando que debe elegir “Dirección”.
- **FOTO-ADJUNTA**: Menú desplegado con el rol Dirección resaltado.
- **Resultado esperado**: La pestaña “Trimestres” se habilita y muestra la gestión correspondiente.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L144-L195】

**Paso 2: Abrir la pestaña Trimestres**
- **Acción**: Haga clic en **Trimestres** dentro del menú lateral del diálogo.
- **Ubicación**: Navegación de la ventana de Configuración.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Al abrirse, se cargan los datos actuales del calendario.
- **FOTO-ADJUNTA**: Vista de la pestaña “Trimestres” con la lista de trimestres.
- **Resultado esperado**: Se muestran los trimestres del período seleccionado junto con su estado y botones de acción.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L912-L970】

**Paso 3: Actualizar fechas de un trimestre**
- **Acción**: Seleccione nuevas fechas en los campos **Desde** y **Hasta** usando los selectores de calendario.
- **Ubicación**: Tarjeta del trimestre correspondiente.
- **Datos requeridos**: Fecha de inicio y fin en formato calendario.
- **Validaciones**:
  - Ambos campos son obligatorios.
  - La fecha de inicio no puede ser posterior a la fecha de fin.
  - No se permite solapar fechas con el trimestre anterior o siguiente.
- **FOTO-ADJUNTA**: Tarjeta de un trimestre con los calendarios desplegados.
- **Resultado esperado**: Los campos muestran las fechas elegidas y el botón **Guardar cambios** se habilita.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L992-L1050】【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L722-L772】

**Paso 4: Guardar o restaurar los cambios**
- **Acción**: Presione **Guardar cambios** para confirmarlos o **Restaurar** para volver a las fechas originales.
- **Ubicación**: Pie de la tarjeta del trimestre.
- **Datos requeridos**: Fechas válidas (solo para guardar).
- **Validaciones**: Durante el guardado se bloquea el botón hasta finalizar el proceso.
- **FOTO-ADJUNTA**: Botones “Restaurar” y “Guardar cambios” con indicador de carga activo.
- **Resultado esperado**: Se muestra una notificación indicando el resultado y, si es correcto, la lista se actualiza automáticamente.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L731-L791】【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L1014-L1038】

**Paso 5: Cambiar el estado del trimestre**
- **Acción**: Utilice los botones **Activar/Reabrir** o **Cerrar** según corresponda.
- **Ubicación**: Encabezado de cada tarjeta de trimestre.
- **Datos requeridos**: Ninguno.
- **Validaciones**:
  - Solo puede activar un trimestre si el anterior está cerrado.
  - No es posible cerrar un trimestre que aún no está activo.
- **FOTO-ADJUNTA**: Tarjeta mostrando los botones de estado y un mensaje informativo si están deshabilitados.
- **Resultado esperado**: El estado cambia y aparece la insignia correspondiente (Activo, Inactivo o Cerrado).【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L912-L970】【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L794-L840】

#### Mensajes del Sistema:
- ✅ **Éxito**:
  - “Fechas del trimestre actualizadas”.
  - “Trimestre activado”.
  - “Trimestre cerrado”.
- ❌ **Error**:
  - “Completá las fechas desde y hasta del trimestre”.
  - “La fecha de inicio no puede ser posterior a la de fin”.
  - “La fecha desde debe ser igual o posterior al fin del trimestre …”.
  - “La fecha hasta debe ser igual o anterior al inicio del trimestre …”.
  - “No se pudo identificar el trimestre seleccionado”.
  - “Primero debés cerrar el trimestre …”.
  - “No se pudo actualizar el estado del trimestre”.
  - “No se pudieron guardar los cambios”.
- ⚠️ **Advertencia**:
  - Los botones muestran indicaciones al pasar el cursor (por ejemplo, “Este trimestre ya está activo”) cuando la acción no está disponible.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L731-L840】【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L912-L970】

#### Casos Especiales:
- Si no hay trimestres cargados, se informa con el mensaje “No hay trimestres cargados para el período seleccionado”.
- Al activar un trimestre posterior, debe cerrar previamente el anterior para mantener la secuencia correcta.
- Si la carga inicial falla, se mostrará “No se pudo cargar el calendario escolar”.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L912-L970】【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L608-L636】

### 4.3 Gestionar períodos escolares
**Descripción**: Permite activar o cerrar períodos existentes y crear nuevos períodos académicos.
**Ubicación**: Pestaña **Período escolar**, exclusiva del rol Dirección.

#### Procedimiento:
**Paso 1: Abrir la pestaña Período escolar**
- **Acción**: Seleccione **Período escolar** en el menú lateral del diálogo.
- **Ubicación**: Navegación de la ventana de Configuración.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Al ingresar se muestran el período activo y la lista de períodos registrados.
- **FOTO-ADJUNTA**: Pestaña “Período escolar” con la lista de períodos.
- **Resultado esperado**: Visualiza el período activo, su estado y botones de acción para cada registro.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L1067-L1139】

**Paso 2: Activar o cerrar un período existente**
- **Acción**: Presione el botón **Activar período** o **Cerrar período** según el estado actual.
- **Ubicación**: Pie de cada tarjeta de período.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Mientras se procesa la acción, el botón muestra un indicador de carga y el resto queda deshabilitado para evitar cambios simultáneos.
- **FOTO-ADJUNTA**: Tarjeta de período con el botón de acción y el indicador “Activando/Cerrando”.
- **Resultado esperado**: El estado del período se actualiza y se muestra un mensaje de confirmación.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L1083-L1128】【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L843-L872】

**Paso 3: Crear un nuevo período**
- **Acción**: Ingrese el año en el campo **Año** y pulse **Crear período**.
- **Ubicación**: Sección “Abrir nuevo período” al final de la pestaña.
- **Datos requeridos**: Año de cuatro dígitos (mínimo 2000).
- **Validaciones**: Solo se aceptan valores numéricos; el campo se limita a cuatro caracteres y muestra un error si el año es inválido.
- **FOTO-ADJUNTA**: Formulario de creación con el campo “Año” completado y el botón “Crear período”.
- **Resultado esperado**: Se crea el nuevo período y el formulario propone automáticamente el año siguiente.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L1143-L1170】【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L876-L900】

#### Mensajes del Sistema:
- ✅ **Éxito**:
  - “Período [año] activado como vigente”.
  - “Período [año] cerrado”.
  - “Nuevo período creado”.
- ❌ **Error**:
  - “No se pudo activar el período seleccionado”.
  - “No se pudo cerrar el período seleccionado”.
  - “Ingresá un año válido para el período”.
  - “No se pudo crear el nuevo período”.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L843-L900】

#### Casos Especiales:
- Solo puede haber un período activo; al activar otro, el actual se cerrará automáticamente (mensaje informativo en pantalla).
- Si no existen períodos, se muestra el aviso “Aún no hay períodos creados”.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L1067-L1139】

### 4.4 Configurar correo saliente de notificaciones
**Descripción**: Define el servidor SMTP que utilizará la institución para enviar correos automáticos.
**Ubicación**: Pestaña **Correo Electrónico**, disponible únicamente con el rol Dirección.

#### Procedimiento:
**Paso 1: Cargar la configuración actual**
- **Acción**: Abra la pestaña **Correo Electrónico**; los datos se cargan automáticamente.
- **Ubicación**: Navegación lateral de Configuración.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Si ocurre un problema, se muestra el mensaje de error correspondiente.
- **FOTO-ADJUNTA**: Vista general del formulario de correo con un indicador de carga (si aplica).
- **Resultado esperado**: Los campos muestran los valores guardados y, si existe una contraseña registrada, el campo aparece oculto con puntos.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L232-L276】【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L390-L456】

**Paso 2: Completar los datos SMTP**
- **Acción**: Ingrese o modifique los campos requeridos:
  - **Servidor SMTP** (obligatorio si los envíos están habilitados).
  - **Puerto** (numérico entre 1 y 65.535).
  - **Usuario** y **Contraseña** (obligatorios solo si la autenticación está activada).
  - **Remitente** (dirección que verán las familias).
  - Active o desactive los interruptores **Autenticación SMTP**, **STARTTLS** y **Habilitar envíos** según corresponda.
- **Ubicación**: Formulario principal dentro de la tarjeta “Correo saliente”.
- **Datos requeridos**: Según los campos seleccionados.
- **Validaciones**:
  - El sistema limpia automáticamente cualquier carácter no numérico en el puerto.
  - Si habilita la autenticación, debe ingresar usuario (y opcionalmente contraseña; deje el campo vacío para conservar la existente).
  - Si los envíos están habilitados debe indicar servidor y puerto válidos.
- **FOTO-ADJUNTA**: Formulario con campos resaltados y los interruptores configurados.
- **Resultado esperado**: Todos los campos válidos quedan listos para guardar.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L308-L520】

**Paso 3: Guardar la configuración**
- **Acción**: Pulse **Guardar** para enviar los cambios o **Recargar** para recuperar los valores del servidor.
- **Ubicación**: Parte inferior de la tarjeta “Correo saliente”.
- **Datos requeridos**: Campos completados correctamente.
- **Validaciones**: Mientras se guardan los datos, los botones se desactivan y se muestra el texto “Guardando”.
- **FOTO-ADJUNTA**: Botones “Recargar” y “Guardar” con indicador de proceso.
- **Resultado esperado**: El sistema confirma la actualización y, si cambió la contraseña, esta se limpia del formulario tras guardar.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L308-L547】

#### Mensajes del Sistema:
- ✅ **Éxito**:
  - “Configuración de correo actualizada correctamente”.
- ❌ **Error**:
  - “Ingresá un puerto válido”.
  - “El puerto debe estar entre 1 y 65535”.
  - “Ingresá el servidor SMTP”.
  - “Ingresá el usuario SMTP cuando la autenticación está habilitada”.
  - “No se pudo cargar la configuración de correo”.
  - “No se pudo guardar la configuración”.
- ⚠️ **Advertencia**:
  - Si la autenticación está deshabilitada, los campos de usuario y contraseña quedan inactivos y se muestra una nota aclaratoria.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L308-L547】

#### Casos Especiales:
- El campo **Contraseña** muestra puntos cuando existe una clave guardada; deje el campo vacío para mantener la contraseña vigente.
- Puede desactivar temporalmente los envíos sin perder la configuración almacenada.
- STARTTLS está pensado para conexiones seguras (por ejemplo, puerto 587) según la descripción incluida en la interfaz.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L432-L520】

## 5. Preguntas Frecuentes
1. **¿Por qué no veo las pestañas de Trimestres, Período o Correo?** Debe elegir el rol **Dirección** en el menú de usuario para habilitarlas.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L83-L195】
2. **¿Qué ocurre si dejo el campo Contraseña vacío?** Se mantiene la contraseña actual siempre que no haya marcado un nuevo valor.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L438-L456】
3. **¿Puedo crear más de un período activo a la vez?** No, al activar un período el actual se cerrará automáticamente.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L1067-L1081】

## 6. Solución de Problemas
- **Error al cargar datos del calendario**: Revise su conexión y vuelva a abrir la pestaña; el sistema mostrará “No se pudo cargar el calendario escolar” si falla la descarga.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L608-L636】
- **Mensajes de fechas inválidas**: Ajuste las fechas asegurándose de no superponerlas y de respetar el orden cronológico requerido por el sistema.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L731-L772】
- **Validación de puerto SMTP**: Use solo números entre 1 y 65.535 para evitar los mensajes “Ingresá un puerto válido” o “El puerto debe estar entre 1 y 65535”.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L308-L337】【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L396-L418】
- **No se pudo guardar la configuración**: Utilice el botón **Recargar** para recuperar los datos previos y vuelva a intentar guardarlos.【F:frontend-ecep/src/app/dashboard/_components/ConfiguracionDialog.tsx†L308-L547】
# Gestión de Exámenes

## 1. Introducción
La sección **Gestión de Exámenes** permite consultar en detalle la información de un examen específico, revisar las calificaciones registradas para cada estudiante de la sección y, según el rol asignado, actualizar los datos del examen o cargar y editar notas. Esta pantalla se muestra dentro del panel de Evaluaciones del sistema escolar.

## 2. Roles y Permisos
- **Directivo (Director, Secretario, Coordinador)**: Puede visualizar el examen y editar su información, así como cargar, modificar o eliminar notas de los alumnos cuando el trimestre correspondiente está activo.
- **Docente (Titular o Suplente)**: Tiene los mismos permisos que el personal directivo: consulta completa y edición de datos y notas durante trimestres activos.
- **Otros roles autorizados (por ejemplo, preceptores o personal con acceso limitado)**: Solo pueden visualizar la información y las notas en modo lectura.
- **Administrador**: No tiene acceso a esta pantalla. Se muestra un aviso “403 — El perfil de Administración no tiene acceso a Exámenes.”

> **Importante:** Cuando el examen pertenece a un trimestre inactivo o cerrado, todas las acciones de edición quedan bloqueadas, incluso para roles con permiso de edición.

## 3. Acceso a la Sección
### Paso 1: Abrir el examen desde el panel de Evaluaciones
- **Acción**: Ingrese al menú lateral, seleccione **Evaluaciones** y elija la sección y el examen que desea revisar.
- **FOTO-ADJUNTA**: Captura del panel de Evaluaciones mostrando la lista de secciones y un examen seleccionado.
- **Resultado esperado**: Se despliega la pantalla con el detalle del examen y las notas registradas.

## 4. Funcionalidades

### 4.1 Consultar detalle de un examen
**Descripción**: Visualiza toda la información asociada al examen, incluyendo nombre, descripción, materia, fecha y estado del trimestre.
**Ubicación**: Sección superior de la página, dentro de la tarjeta **Detalle del examen**.

#### Procedimiento:
**Paso 1: Revisar encabezado del examen**
- **Acción**: Lea el título del examen, la sección asignada y el turno en las insignias superiores.
- **Ubicación**: Parte superior de la pantalla, junto al botón “Editar examen”.
- **Datos requeridos**: Ninguno.
- **Validaciones**: No aplica.
- **FOTO-ADJUNTA**: Encabezado del examen mostrando el nombre, las insignias de sección y turno, y el botón “Editar examen”.
- **Resultado esperado**: Puede identificar rápidamente a qué sección pertenece el examen y en qué turno se dicta.

**Paso 2: Revisar información detallada**
- **Acción**: Lea los campos de la tarjeta **Detalle del examen** (nombre, descripción, materia, fecha, trimestre, peso si aplica).
- **Ubicación**: Tarjeta “Detalle del examen” ubicada debajo del encabezado.
- **Datos requeridos**: Ninguno.
- **Validaciones**: No aplica.
- **FOTO-ADJUNTA**: Tarjeta “Detalle del examen” con todos los campos visibles.
- **Resultado esperado**: Comprende el contexto académico del examen antes de trabajar con las calificaciones.

#### Mensajes del Sistema:
- ❌ **Error**: “No pudimos cargar el examen solicitado.”, “No encontramos datos para el examen solicitado.” o el mensaje proveniente del servidor cuando falla la carga.
- ⚠️ **Advertencia**: “Este examen pertenece a un trimestre que no está activo. Solo lectura.” o “No podés editar este examen porque el trimestre no está activo/no está activo.” cuando el trimestre no permite edición.

#### Casos Especiales:
- Si el ID del examen es inválido, se muestra el mensaje “Identificador de examen inválido.”
- Si el usuario tiene rol de Administración, se muestra un mensaje 403 y no se permite continuar.

### 4.2 Editar datos del examen
**Descripción**: Permite modificar el nombre, la descripción y la fecha del examen.
**Ubicación**: Botón **Editar examen** en el encabezado. El formulario aparece en un diálogo emergente.

#### Procedimiento:
**Paso 1: Abrir el diálogo de edición**
- **Acción**: Haga clic en **Editar examen**.
- **Ubicación**: Botón ubicado en la esquina superior derecha del encabezado del examen.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Debe contar con rol Directivo o Docente y el trimestre debe estar activo.
- **FOTO-ADJUNTA**: Pantalla con el botón “Editar examen” resaltado.
- **Resultado esperado**: Se abre un diálogo con los campos para editar el examen.

**Paso 2: Completar los campos de edición**
- **Acción**: Actualice los campos **Nombre**, **Descripción** (opcional) y seleccione la **Fecha** en el selector.
- **Ubicación**: Dentro del diálogo “Editar examen”.
- **Datos requeridos**: Nombre del examen (si queda vacío se guarda como “Evaluación”), descripción opcional, fecha obligatoria.
- **Validaciones**: La fecha es obligatoria; el botón **Guardar** se habilita únicamente si hay una fecha seleccionada y el trimestre está activo. Los campos se deshabilitan si el trimestre no está activo.
- **FOTO-ADJUNTA**: Diálogo de edición mostrando los tres campos y el selector de fecha activo.
- **Resultado esperado**: Los campos muestran la información actual y usted ingresa los cambios deseados.

**Paso 3: Guardar o cancelar cambios**
- **Acción**: Seleccione **Guardar** para aplicar los cambios o **Cancelar** para cerrar el diálogo sin modificaciones.
- **Ubicación**: Botones al pie del diálogo “Editar examen”.
- **Datos requeridos**: Confirmar la fecha y el nombre.
- **Validaciones**: El botón **Guardar** se desactiva mientras se procesa la actualización o si el trimestre está inactivo.
- **FOTO-ADJUNTA**: Botones “Guardar” y “Cancelar” dentro del diálogo, con el mensaje “Guardando…” visible durante la acción.
- **Resultado esperado**: Al guardar, el diálogo se cierra y la tarjeta “Detalle del examen” refleja la nueva información.

#### Mensajes del Sistema:
- ❌ **Error**: “No podés editar este examen porque el trimestre no está activo.” o “No pudimos actualizar los datos del examen.”

#### Casos Especiales:
- Si el trimestre está cerrado o inactivo, todos los campos aparecen deshabilitados y el botón “Guardar” permanece bloqueado.

### 4.3 Registrar y actualizar notas de los alumnos
**Descripción**: Carga inicial y modificación de las notas numéricas y observaciones para cada matrícula asociada al examen.
**Ubicación**: Tarjeta **Notas registradas** debajo del detalle del examen.

#### Procedimiento:
**Paso 1: Identificar al alumno**
- **Acción**: Busque el recuadro correspondiente al estudiante cuya nota desea gestionar.
- **Ubicación**: Dentro de la tarjeta “Notas registradas”, cada alumno aparece en un recuadro con su nombre.
- **Datos requeridos**: Ninguno.
- **Validaciones**: No aplica.
- **FOTO-ADJUNTA**: Lista de alumnos dentro de la tarjeta “Notas registradas”.
- **Resultado esperado**: Localiza a la persona correcta antes de editar.

**Paso 2: Ingresar o modificar la nota**
- **Acción**: Escriba la calificación numérica en el campo **Nota**.
- **Ubicación**: Campo de entrada numérico dentro del recuadro del alumno.
- **Datos requeridos**: Número entero entre 1 y 10.
- **Validaciones**: Solo acepta valores numéricos entre 1 y 10; si ingresa un valor fuera de rango, el sistema ignora el cambio. Campo deshabilitado cuando el trimestre está inactivo o durante el guardado.
- **FOTO-ADJUNTA**: Recuadro del alumno con el campo de nota resaltado mostrando un valor válido.
- **Resultado esperado**: La nota queda registrada temporalmente en pantalla.

**Paso 3: Agregar observaciones**
- **Acción**: Escriba comentarios o aclaraciones en el campo **Observaciones**.
- **Ubicación**: Área de texto dentro del mismo recuadro del alumno.
- **Datos requeridos**: Texto libre (opcional); si se deja vacío, no se guardará.
- **Validaciones**: Campo deshabilitado cuando el trimestre está inactivo o durante el guardado.
- **FOTO-ADJUNTA**: Recuadro del alumno mostrando el campo de observaciones completado.
- **Resultado esperado**: Las observaciones quedan preparadas para su guardado.

**Paso 4: Guardar los cambios**
- **Acción**: Haga clic en **Guardar notas** para confirmar los cambios en todas las filas modificadas. Use **Cancelar** para descartar los cambios y volver al estado original.
- **Ubicación**: Botones en la parte inferior de la tarjeta “Notas registradas”.
- **Datos requeridos**: Ninguno adicional.
- **Validaciones**: Ambos botones se deshabilitan cuando el trimestre está inactivo o mientras se está guardando la información.
- **FOTO-ADJUNTA**: Botones “Cancelar” y “Guardar notas” visibles bajo la lista de alumnos.
- **Resultado esperado**: Las notas y observaciones se guardan en el sistema y los campos vuelven a mostrar la información confirmada.

#### Mensajes del Sistema:
- ✅ **Éxito**: “Notas guardadas.”
- ❌ **Error**: “No se pudieron guardar las notas.”
- ⚠️ **Advertencia**: “No podés editar las notas porque el trimestre no está activo.”

#### Casos Especiales:
- Si no hay alumnos asociados, no se muestran filas y la tarjeta indica “Todavía no hay notas cargadas para este examen.”
- Si se intenta guardar una nota vacía y sin observaciones en un alumno nuevo, no se crea registro para esa persona.

### 4.4 Revisar notas en modo lectura
**Descripción**: Permite a usuarios sin permisos de edición consultar las calificaciones y observaciones existentes.
**Ubicación**: Misma tarjeta **Notas registradas**, con los campos de lectura.

#### Procedimiento:
**Paso 1: Navegar por las notas existentes**
- **Acción**: Lea cada recuadro de alumno. Las notas se muestran como texto y las observaciones aparecen como “Observación: …”.
- **Ubicación**: Tarjeta “Notas registradas”.
- **Datos requeridos**: Ninguno.
- **Validaciones**: No aplica.
- **FOTO-ADJUNTA**: Recuadro de alumno mostrando nota y observación en modo lectura.
- **Resultado esperado**: Confirma la información cargada sin poder modificarla.

#### Mensajes del Sistema:
- ⚠️ **Advertencia**: Se mantiene el banner de trimestre inactivo cuando corresponde.

#### Casos Especiales:
- Si no existen notas, se muestra el mensaje informativo sin permitir acciones.

## 5. Preguntas Frecuentes
- **¿Por qué no veo el botón “Editar examen”?**
  - Verifique su rol: solo directivos y docentes pueden editar, y el trimestre debe estar activo.
- **¿Qué sucede si dejo el nombre vacío al guardar?**
  - El sistema guardará automáticamente “Evaluación” como nombre del examen.
- **¿Puedo registrar solo observaciones sin nota?**
  - Sí, se guardan siempre que haya texto en el campo de observaciones.

## 6. Solución de Problemas
- **Mensaje “No pudimos cargar el examen solicitado.”**: Revise su conexión y vuelva a intentar desde el listado de Evaluaciones. Si persiste, comuníquese con soporte.
- **Mensaje “No podés editar este examen porque el trimestre no está activo.”**: Confirme con la administración académica el estado del trimestre. Solo trimestres activos permiten edición.
- **Mensaje “No se pudieron guardar las notas.”**: Espere unos segundos y reintente. Si continúa el problema, capture la pantalla del mensaje y contacte a soporte técnico.
# Sección de Familiares

## 1. Introducción
La sección **Perfil del Familiar** del panel administrativo permite consultar, actualizar y gestionar el acceso de un familiar vinculado a estudiantes de la institución. Aquí encontrará los datos personales del familiar, información adicional como ocupación y lugar de trabajo, el listado de alumnos relacionados y las opciones para otorgar o modificar sus credenciales de ingreso al sistema.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L362-L783】

## 2. Roles y Permisos
- **Visualización general del perfil**: disponible para el personal con acceso al panel de gestión de familiares.
- **Edición de datos personales y complementarios**: disponible para el mismo personal que accede a la sección; no hay restricciones adicionales en la interfaz.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L371-L503】
- **Gestión de credenciales (crear/actualizar acceso)**: cualquier usuario autorizado puede abrir el cuadro de diálogo y actualizar email y contraseña. Sin embargo, solo los roles **Administrador** y **Director** pueden modificar la lista de roles del familiar dentro del sistema.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L77-L119】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L713-L758】

> **Nota:** Si su rol no permite editar los roles del familiar, la sección de selección de roles no aparecerá y el sistema conservará los roles actuales.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L311-L348】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L713-L758】

## 3. Acceso a la Sección
### Paso 1: Ingresar al perfil de un familiar
- **Acción**: Desde el panel principal, navegue al módulo de **Familiares** y seleccione el familiar que desea consultar.
- **FOTO-ADJUNTA**: Captura del menú de navegación resaltando la opción “Familiares” y la tarjeta/listado del familiar elegido.
- **Resultado esperado**: Se abre la vista “Perfil del Familiar” con el encabezado que muestra el ID del familiar y el botón «Volver» en la parte superior.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L362-L369】

## 4. Funcionalidades

### 4.1 Consultar información del familiar
**Descripción**: Permite revisar los datos personales, observaciones, ocupación, lugar de trabajo y la cantidad de alumnos vinculados.
**Ubicación**: Secciones “Datos personales” e “Información familiar” en la parte superior del perfil.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L512-L569】

#### Procedimiento:
**Paso 1: Revisar datos personales**
- **Acción**: Lea la tarjeta “Datos personales” para verificar nombre completo, DNI, email, teléfono, celular y observaciones.
- **Ubicación**: Columna izquierda dentro del panel, bajo el encabezado de la página.
- **Datos requeridos**: No requiere ingreso de datos; es solo visualización.
- **Validaciones**: Si algún dato no existe, el sistema mostrará un guion largo (—) en su lugar.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L519-L546】
- **FOTO-ADJUNTA**: Tarjeta “Datos personales” destacando los campos mencionados.
- **Resultado esperado**: Usted identifica rápidamente la información registrada para la persona vinculada al familiar.

**Paso 2: Revisar información complementaria**
- **Acción**: Consulte la tarjeta “Información familiar” para conocer ocupación, lugar de trabajo y cantidad de alumnos vinculados.
- **Ubicación**: Columna derecha del panel, junto a los datos personales.
- **Datos requeridos**: No requiere ingreso de datos.
- **Validaciones**: Si no se registró información, se mostrará un guion largo (—).【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L556-L568】
- **FOTO-ADJUNTA**: Tarjeta “Información familiar” con los campos resaltados.
- **Resultado esperado**: Usted conoce la situación laboral del familiar y cuántos alumnos están asociados.

#### Mensajes del Sistema:
- ⚠️ **Advertencia**: Cuando los datos no están disponibles, se muestran con el símbolo «—» para indicar ausencia de información.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L519-L546】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L556-L568】

#### Casos Especiales:
- Si el sistema aún está cargando la información, se mostrará el mensaje «Cargando información del familiar…».【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L507-L508】
- Si ocurre un problema al obtener los datos, verá un mensaje en rojo con la leyenda «No pudimos cargar la información del familiar» o el detalle del error devuelto por el sistema.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L192-L198】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L507-L509】

### 4.2 Consultar alumnos vinculados
**Descripción**: Muestra cada alumno relacionado con el familiar, indicando la sección, el vínculo y si conviven. También permite acceder al perfil del alumno.
**Ubicación**: Tarjeta “Alumnos vinculados” en la parte central/inferior del perfil.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L572-L615】

#### Procedimiento:
**Paso 1: Identificar los alumnos listados**
- **Acción**: Revise cada tarjeta individual donde se presenta el nombre completo del alumno y su sección.
- **Ubicación**: Dentro de la tarjeta “Alumnos vinculados”, cada alumno aparece en un recuadro con borde.
- **Datos requeridos**: No requiere ingreso de datos.
- **Validaciones**: Si no hay alumnos, el sistema mostrará el mensaje «No hay alumnos asociados a este familiar.»【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L609-L612】
- **FOTO-ADJUNTA**: Captura de la tarjeta “Alumnos vinculados” con un alumno que muestre nombre, sección y etiquetas de vínculo.
- **Resultado esperado**: Usted conoce qué estudiantes están asociados y el tipo de relación.

**Paso 2: Ver detalles de un alumno**
- **Acción**: Haga clic en el botón «Ver alumno» del alumno deseado para abrir su perfil completo.
- **Ubicación**: Botón dentro de cada tarjeta individual de alumno.
- **Datos requeridos**: No requiere ingreso de datos.
- **Validaciones**: No aplica.
- **FOTO-ADJUNTA**: Tarjeta del alumno resaltando el botón «Ver alumno».
- **Resultado esperado**: Se abre la página del alumno seleccionado en una nueva vista del panel.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L598-L603】

#### Mensajes del Sistema:
- ✅ **Indicadores visuales**: Si el vínculo posee un rol, aparece una insignia (badge) con el tipo de relación; si está marcada la convivencia, se muestra la insignia “Convive”.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L594-L598】
- ⚠️ **Advertencia**: Mensaje «No hay alumnos asociados a este familiar.» cuando no existen registros vinculados.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L609-L612】

#### Casos Especiales:
- Si el sistema no encuentra vínculos, solo verá el mensaje informativo y no habrá botones disponibles para abrir perfiles de alumnos.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L609-L612】

### 4.3 Editar datos del familiar
**Descripción**: Permite actualizar información personal, de contacto y laboral del familiar a través de un cuadro de diálogo.
**Ubicación**: Botón «Editar datos» en la esquina superior derecha del perfil.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L370-L503】

#### Procedimiento:
**Paso 1: Abrir el cuadro de edición**
- **Acción**: Haga clic en el botón «Editar datos».
- **Ubicación**: Encabezado del perfil, junto al título “Perfil del Familiar”.
- **Datos requeridos**: No aplica en este paso.
- **Validaciones**: No aplica.
- **FOTO-ADJUNTA**: Vista del encabezado con el botón «Editar datos» resaltado.
- **Resultado esperado**: Se abre el cuadro modal “Editar datos del familiar” con los campos precargados.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L375-L487】

**Paso 2: Actualizar los campos necesarios**
- **Acción**: Complete o corrija Nombre, Apellido, DNI, Email, Teléfono, Celular, Ocupación, Lugar de trabajo y Observaciones según corresponda.
- **Ubicación**: Dentro del cuadro modal, organizado en un formulario de dos columnas.
- **Datos requeridos**:
  - Nombre y Apellido: obligatorios.
  - DNI: debe contener entre 7 y 10 dígitos.
  - Email, Teléfono, Celular, Ocupación, Lugar de trabajo y Observaciones: opcionales.
- **Validaciones**:
  - El sistema formatea el DNI permitiendo solo números y validará que cumpla la longitud indicada.
  - Teléfono y Celular aceptan únicamente dígitos.
  - Si omite Nombre o Apellido, el sistema mostrará el error correspondiente al intentar guardar.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L241-L260】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L405-L487】
- **FOTO-ADJUNTA**: Formulario del modal con todos los campos señalados.
- **Resultado esperado**: Los datos quedan listos para guardar.

**Paso 3: Guardar cambios**
- **Acción**: Presione «Guardar cambios» para confirmar la actualización.
- **Ubicación**: Parte inferior del cuadro modal.
- **Datos requeridos**: Se utilizan los valores ingresados en los campos.
- **Validaciones**: El sistema volverá a verificar los requisitos mínimos antes de enviar la información.
- **FOTO-ADJUNTA**: Pie del modal mostrando los botones «Cancelar» y «Guardar cambios» con el indicador de carga (si aplica).
- **Resultado esperado**: Si la información es correcta, el cuadro se cerrará y los datos se actualizarán en la pantalla.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L488-L503】

#### Mensajes del Sistema:
- ✅ **Éxito**: «Datos del familiar actualizados» cuando la actualización se realiza correctamente.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L271-L273】
- ❌ **Error**:
  - «No encontramos los datos del familiar para editar» si falta información base.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L235-L238】
  - «Completá nombre y apellido» cuando deja vacíos ambos campos.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L241-L243】
  - «Ingresá un DNI válido (7 a 10 dígitos).» si el documento no cumple el formato.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L246-L249】
  - Mensaje dinámico o «No pudimos actualizar los datos del familiar» si se produce un error del servidor.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L274-L281】

#### Casos Especiales:
- Si el familiar no tiene persona asociada completa, la interfaz rellena los campos con un identificador y permite completarlos manualmente al editar.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L142-L160】
- Tras guardar, la página se recarga automáticamente para reflejar los cambios más recientes.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L271-L273】

### 4.4 Gestionar el acceso al sistema
**Descripción**: Crea o actualiza las credenciales de ingreso del familiar, incluyendo email, contraseña y roles del sistema.
**Ubicación**: Tarjeta “Acceso al sistema” al final de la página.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L617-L783】

#### Procedimiento:
**Paso 1: Abrir el cuadro de acceso**
- **Acción**: Pulse el botón «Crear acceso» o «Actualizar acceso» según corresponda.
- **Ubicación**: Lado derecho de la tarjeta “Acceso al sistema”.
- **Datos requeridos**: No aplica en este paso.
- **Validaciones**: No aplica.
- **FOTO-ADJUNTA**: Tarjeta “Acceso al sistema” mostrando el botón mencionado.
- **Resultado esperado**: Se abre el cuadro modal con los campos de email, contraseña y confirmación.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L650-L712】

**Paso 2: Configurar email y contraseña**
- **Acción**: Ingrese el email de acceso y, si es necesario, defina la contraseña nueva e ingrese la confirmación.
- **Ubicación**: Campos dentro del modal.
- **Datos requeridos**:
  - Email: obligatorio.
  - Contraseña: obligatoria si el familiar aún no tiene credenciales; opcional al actualizar.
  - Confirmación de contraseña: debe coincidir con la contraseña ingresada.
- **Validaciones**:
  - El sistema exige que el email no esté vacío.
  - Cuando se crean credenciales nuevas, se debe definir una contraseña inicial.
  - La contraseña y su confirmación deben coincidir.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L292-L308】
- **FOTO-ADJUNTA**: Modal mostrando los campos de email, contraseña y confirmación completados.
- **Resultado esperado**: Los datos quedan listos para guardar.

**Paso 3: Ajustar roles del sistema (solo Administrador/Director)**
- **Acción**: Marque o desmarque los roles disponibles (por ejemplo, Familiar o Estudiante) para definir el alcance del acceso.
- **Ubicación**: Sección “Roles del sistema” dentro del modal. Solo visible si su usuario cuenta con permisos para editar roles.
- **Datos requeridos**: Seleccione al menos un rol válido.
- **Validaciones**:
  - Debe quedar al menos un rol seleccionado; de lo contrario, el sistema mostrará un error.
  - Los roles “Familiar” y “Estudiante” son excluyentes entre sí; al elegir uno, el otro se desmarca automáticamente.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L311-L348】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L713-L745】
- **FOTO-ADJUNTA**: Modal resaltando la sección de roles con las casillas de verificación.
- **Resultado esperado**: Roles configurados según la necesidad.

**Paso 4: Guardar el acceso**
- **Acción**: Haga clic en «Guardar acceso» para aplicar los cambios.
- **Ubicación**: Parte inferior del modal.
- **Datos requeridos**: Email obligatorio, contraseña según corresponda y roles (al menos uno).
- **Validaciones**: El sistema verificará nuevamente los requisitos antes de enviar la solicitud.
- **FOTO-ADJUNTA**: Pie del modal con el botón «Guardar acceso» y, si corresponde, el ícono de carga.
- **Resultado esperado**: El modal se cierra, se actualiza la información y se muestran los datos de acceso en la tarjeta principal.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L624-L643】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L760-L777】

#### Mensajes del Sistema:
- ✅ **Éxito**: «Acceso del familiar actualizado» cuando se guardan las credenciales con éxito.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L333-L349】
- ❌ **Error**:
  - «No encontramos la persona vinculada» si faltan datos esenciales.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L286-L289】
  - «Ingresá un email válido» si deja el correo vacío.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L292-L298】
  - «Definí una contraseña inicial» cuando intenta crear acceso sin contraseña.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L301-L303】
  - «Las contraseñas no coinciden» si la confirmación difiere.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L306-L308】
  - «Seleccioná al menos un rol para el acceso» cuando no hay roles elegidos.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L317-L321】
  - Mensaje dinámico o «No pudimos actualizar el acceso del familiar» si ocurre un error del servidor.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L350-L356】

#### Casos Especiales:
- Cuando el familiar ya posee credenciales activas, el campo contraseña es opcional y el botón se muestra como «Actualizar acceso».【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L626-L663】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L688-L691】
- Si no tiene credenciales, el sistema indica «El familiar todavía no tiene credenciales asignadas.» y el botón dice «Crear acceso».【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L626-L655】

## 5. Preguntas Frecuentes
1. **¿Qué significa el guion largo (—) en un campo?**
   - Indica que aún no se registró información para ese dato.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L519-L546】
2. **¿Por qué no veo la sección para elegir roles?**
   - Solo los usuarios con rol Administrador o Director pueden modificar los roles del familiar.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L77-L119】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L713-L758】
3. **¿Qué ocurre si no hay alumnos vinculados?**
   - La tarjeta lo indicará con el mensaje “No hay alumnos asociados a este familiar.” y no se mostrarán botones adicionales.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L609-L612】

## 6. Solución de Problemas
- **La página muestra un mensaje de error en rojo al cargar**: Revise la conexión e intente recargar. Si el problema persiste, contacte al área técnica indicando que «No pudimos cargar la información del familiar».【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L192-L198】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L507-L509】
- **No puedo guardar cambios porque falta el DNI**: Verifique que el DNI tenga entre 7 y 10 dígitos y solo incluya números.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L246-L249】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L405-L419】
- **El sistema pide definir una contraseña inicial**: Esto ocurre cuando el familiar no tenía credenciales activas. Ingrese una contraseña segura y vuelva a intentarlo.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L301-L303】
- **Las contraseñas no coinciden al guardar el acceso**: Asegúrese de escribir la misma contraseña en ambos campos antes de presionar «Guardar acceso».【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L306-L308】
- **Necesito asignar ambos roles Familiar y Estudiante**: No es posible; el sistema desmarca automáticamente el rol incompatible para evitar conflictos.【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L117-L120】【F:frontend-ecep/src/app/dashboard/familiares/[id]/page.tsx†L713-L745】
# Materias – Asignaciones por Sección

## 1. Introducción
Esta sección del sistema le permite al personal docente y administrativo gestionar las materias asociadas a cada sección y asignar docentes tanto a la sección completa como a cada materia específica. También muestra información contextual del curso (nivel, turno y período) y el estado vigente de las asignaciones.



## 2. Roles y Permisos
- **Perfil Administrativo (Admin)**: No puede acceder a la gestión de materias; verá un mensaje 403.



- **Personal (Staff)**: Tiene acceso completo a la gestión de materias y docentes de las secciones de nivel primario.



- **Docentes (Teacher)**: Solo acceden a las secciones en las que están asignados. Si la validación de acceso está en curso o no pertenecen a la sección, se muestran mensajes de estado o error 403.


- **Estudiantes y Familias**: Solo pueden consultar información; no acceden a esta vista de gestión y son redirigidos a un módulo de consulta sin edición.



## 3. Acceso a la Sección
### Paso 1: Abrir la tarjeta de la sección
- **Acción**: Desde el listado de secciones primarias, haga clic sobre la tarjeta de la sección que desea gestionar.
- **FOTO-ADJUNTA**: Tarjeta de sección con el botón “Gestioná materias y docentes” resaltado.
- **Resultado esperado**: El sistema navega a la página “Docentes y materias” correspondiente a la sección elegida.



## 4. Funcionalidades

### 4.1 Visualizar datos de la sección
**Descripción**: Muestra encabezados con el nombre de la sección, nivel, turno y período escolar para contextualizar la gestión.
**Ubicación**: Parte superior de la página “Docentes y materias”.



#### Procedimiento:
**Paso 1: Revisar encabezado de información**
- **Acción**: Lea las insignias (badges) que aparecen bajo el título “Docentes y materias”.
- **Ubicación**: Encabezado principal de la sección.
- **Datos requeridos**: Ninguno.
- **Validaciones**: La información se carga automáticamente a partir de la sección seleccionada.
- **FOTO-ADJUNTA**: Encabezado mostrando badges de sección, nivel, turno y período.
- **Resultado esperado**: Usted conoce el contexto (nivel, turno y período) antes de operar en la sección.



#### Mensajes del Sistema:
- ✅ **Éxito**: No aplica (visualización informativa).
- ❌ **Error**: Si la información no carga, se muestra “No se pudo cargar la información.”.


- ⚠️ **Advertencia**: Durante la carga se muestra “Cargando asignaciones…” o “Verificando acceso a la sección…”.



#### Casos Especiales:
- Si el nivel es inicial, se muestra un mensaje indicando que no se gestionan materias, solo docentes de sección.



### 4.2 Gestionar docentes de la sección (titular, suplente y otros roles)
**Descripción**: Permite asignar o actualizar docentes titulares, suplentes y otros roles vigentes en la sección completa.
**Ubicación**: Tarjeta “Docentes de la sección” dentro de la página.



#### Procedimiento:
**Paso 1: Abrir el diálogo de asignación**
- **Acción**: Haga clic en el botón “Asignar” del bloque Titular o Suplente.
- **Ubicación**: Botones dentro de la tarjeta “Docentes de la sección”.
- **Datos requeridos**: Ninguno en este paso.
- **Validaciones**: Debe tener rol Staff o Teacher con acceso a la sección.
- **FOTO-ADJUNTA**: Tarjeta de docentes de la sección con botón “Asignar” resaltado.
- **Resultado esperado**: Se abre la ventana modal “Asignar docente de sección”.




**Paso 2: Seleccionar docente y rol**
- **Acción**: Elija un docente del desplegable “Seleccioná docente” y defina si será Titular o Suplente.
- **Ubicación**: Campos dentro del diálogo.
- **Datos requeridos**: Docente disponible (no ocupado en el rol contrario).
- **Validaciones**: El sistema impide seleccionar docentes ya reservados para el rol opuesto (titular o suplente).


- **FOTO-ADJUNTA**: Modal mostrando los selectores de docente y rol.
- **Resultado esperado**: Los campos quedan completos y habilitan el guardado.

**Paso 3: Definir vigencia**
- **Acción**: 
  - Si es suplente, seleccione fechas “Desde” y “Hasta”.
  - Si es titular, la vigencia inicia automáticamente “desde hoy”.
- **Ubicación**: Sección inferior del diálogo.
- **Datos requeridos**: Fechas (solo para suplentes).
- **Validaciones**: El sistema obliga a completar ambas fechas y verifica que “Hasta” sea posterior o igual a “Desde”.



- **FOTO-ADJUNTA**: Modal con los campos de fecha resaltados.
- **Resultado esperado**: Los datos son válidos para guardar.

**Paso 4: Guardar la asignación**
- **Acción**: Haga clic en “Guardar”.
- **Ubicación**: Barra de botones del diálogo.
- **Datos requeridos**: Confirmación de los campos previos.
- **Validaciones**: El botón se deshabilita si falta información obligatoria.
- **FOTO-ADJUNTA**: Modal con botón “Guardar” resaltado.
- **Resultado esperado**: El diálogo se cierra y la tarjeta muestra el docente asignado junto con las fechas de vigencia.




#### Mensajes del Sistema:
- ✅ **Éxito**: No hay mensaje explícito; la lista se actualiza automáticamente.
- ❌ **Error**: “No se pudo asignar el docente a la sección.” u otros mensajes provenientes del servidor.


- ⚠️ **Advertencia**: Toasts solicitando completar fechas de suplencia o corrigiendo fechas invertidas.



#### Casos Especiales:
- Si ya existe un titular, se indica su nombre y vigencia actual.
- Otros roles distintos de titular y suplente se muestran automáticamente si están vigentes, sin acciones de edición en esta versión.




### 4.3 Agregar materias a la sección
**Descripción**: Permite incluir nuevas materias en secciones de nivel primario, ya sea seleccionando materias existentes o creando una nueva.
**Ubicación**: Botón “Agregar materia” en el encabezado cuando la sección es de nivel primario.




#### Procedimiento:
**Paso 1: Abrir diálogo de agregado**
- **Acción**: Haga clic en “Agregar materia”.
- **Ubicación**: Botón con ícono “+” en la esquina superior derecha del encabezado.
- **Datos requeridos**: Ninguno en este paso.
- **Validaciones**: Solo aparece para secciones primarias.
- **FOTO-ADJUNTA**: Encabezado con botón “Agregar materia” resaltado.
- **Resultado esperado**: Se abre el diálogo “Agregar materia”.



**Paso 2: Ingresar o seleccionar nombre**
- **Acción**: Escriba el nombre de la materia; si existe, selecciónela de las sugerencias.
- **Ubicación**: Campo de texto “Nombre de la materia”.
- **Datos requeridos**: Nombre con al menos 2 caracteres.
- **Validaciones**: Se filtran sugerencias para evitar duplicados en la sección; solo se habilita “Guardar” si se cumplen los requisitos de longitud.
- **FOTO-ADJUNTA**: Modal mostrando el campo de texto y la lista de sugerencias.
- **Resultado esperado**: El botón “Guardar” queda activo cuando el nombre es válido.



**Paso 3: Guardar**
- **Acción**: Presione “Guardar”.
- **Ubicación**: Barra de botones del diálogo.
- **Datos requeridos**: Nombre elegido o materia seleccionada.
- **Validaciones**: El sistema crea la materia (si es nueva) y luego la vincula con la sección.
- **FOTO-ADJUNTA**: Botón “Guardar” resaltado.
- **Resultado esperado**: El diálogo se cierra y la materia aparece en la lista de la sección.




#### Mensajes del Sistema:
- ✅ **Éxito**: No hay mensaje explícito; la lista se actualiza al cerrarse el diálogo.
- ❌ **Error**: “No se pudo agregar la materia a la sección.” cuando ocurre una falla en el servidor.


- ⚠️ **Advertencia**: Si no se encuentran coincidencias, se indica que se creará una materia nueva.



#### Casos Especiales:
- Las materias ya asignadas a la sección no aparecen en las sugerencias para evitar duplicados.




### 4.4 Asignar docentes a materias específicas
**Descripción**: Asocia docentes titulares o suplentes a cada materia de la sección y define vigencias.
**Ubicación**: Dentro de la tarjeta “Materias”, botón “Asignar docente” junto a cada materia listada.




#### Procedimiento:
**Paso 1: Abrir diálogo de asignación de materia**
- **Acción**: Haga clic en “Asignar docente” en la materia correspondiente.
- **Ubicación**: Botón en la esquina superior derecha del bloque de la materia.
- **Datos requeridos**: Ninguno en este paso.
- **Validaciones**: Requiere que existan docentes cargados en el sistema.
- **FOTO-ADJUNTA**: Bloque de materia con el botón “Asignar docente” resaltado.
- **Resultado esperado**: Se abre el diálogo “Asignar docente”.




**Paso 2: Elegir docente y rol**
- **Acción**: Seleccione un docente y luego el rol (Titular o Suplente).
- **Ubicación**: Desplegables dentro del diálogo.
- **Datos requeridos**: Docente y rol.
- **Validaciones**: El sistema bloquea la selección del docente que ya ocupa el rol opuesto.
- **FOTO-ADJUNTA**: Modal con ambos selectores visibles.
- **Resultado esperado**: Los campos válidos habilitan el botón “Guardar”.



**Paso 3: Definir vigencias (solo suplentes)**
- **Acción**: Complete las fechas “Desde” y “Hasta”.
- **Ubicación**: Sección de fechas en el diálogo.
- **Datos requeridos**: Fechas de inicio y fin.
- **Validaciones**: Ambas fechas son obligatorias y “Hasta” no puede ser anterior a “Desde”.
- **FOTO-ADJUNTA**: Modal con los DatePicker resaltados.
- **Resultado esperado**: El formulario está listo para guardar. Para titulares, el sistema muestra una nota indicando que la vigencia se actualizará automáticamente desde hoy.



**Paso 4: Guardar asignación**
- **Acción**: Pulse “Guardar”.
- **Ubicación**: Barra inferior del diálogo.
- **Datos requeridos**: Campos validados.
- **Validaciones**: El botón se desactiva mientras falta información o se guarda.
- **FOTO-ADJUNTA**: Botón “Guardar” activado.
- **Resultado esperado**: El diálogo se cierra y la tarjeta de la materia muestra el docente titular y suplente actualizados.




#### Mensajes del Sistema:
- ✅ **Éxito**: No hay mensaje explícito; la interfaz refleja el cambio.
- ❌ **Error**: “No se pudo asignar el docente a la materia.” u otros mensajes del servidor.


- ⚠️ **Advertencia**: Toasts piden completar fechas de suplencia o corrigen fechas invertidas.



#### Casos Especiales:
- Si no hay materias registradas, se muestra “Sin materias aún.” y el botón para asignar no aparece.



## 5. Preguntas Frecuentes
1. **¿Por qué no veo el botón “Agregar materia”?**  
   Solo aparece en secciones del nivel primario; en nivel inicial se gestionan docentes de sección sin materias.



2. **¿Puedo eliminar una materia asignada?**  
   La interfaz actual no incluye el botón de eliminación; está comentado en el código como funcionalidad futura.


3. **¿Qué sucede si soy docente y no puedo acceder a una sección?**  
   Verá el mensaje “403 — Esta sección no pertenece a tus asignaciones.”. Debe solicitar acceso al administrador del sistema.



## 6. Solución de Problemas
- **No se carga la información de la sección**: Revise su conexión y vuelva a intentarlo; si persiste, aparecerá “No se pudo cargar la información.” y deberá contactar al soporte.


- **Error al asignar docentes o materias**: Los toasts muestran mensajes específicos (“No se pudo asignar el docente…” o “No se pudo agregar la materia…”). Verifique que los campos estén completos, que las fechas sean válidas y que el docente no esté ocupado en el rol opuesto antes de reintentar.



# Pagos y Finanzas

## 1. Introducción
La sección **Pagos y Finanzas** permite administrar todo el ciclo de cuotas, pagos y recibos de sueldo dentro del sistema escolar. Desde aquí usted puede consultar el estado de las cuotas de los estudiantes, registrar nuevos pagos, generar cuotas para las secciones y controlar los recibos emitidos al personal.

## 2. Roles y Permisos
- **Administración (ADMIN)**: Accede a todas las pestañas. Puede crear cuotas, registrar pagos, cargar recibos, consultar listados completos y actualizar estados.
- **Familia (FAMILY)**: Visualiza únicamente la pestaña *Cuotas y matrícula* de sus hijos asociados. No puede modificar información.
- **Docente/Tallerista (TEACHER o ALTERNATE)**: Accede a la pestaña *Mis recibos* para revisar y confirmar sus recibos de sueldo.
- **Sin rol asignado**: No visualiza ninguna pestaña y se muestra un mensaje sin acceso.

## 3. Acceso a la Sección
### Paso 1: Ingresar al panel "Pagos y cuotas"
- **Acción**: Desde el menú del panel, seleccione la opción **Pagos**.
- **FOTO-ADJUNTA**: Captura del dashboard con la opción "Pagos y cuotas" resaltada en el menú.
- **Resultado esperado**: Se abre la pantalla con las pestañas disponibles según su rol, mostrando un resumen introductorio.

## 4. Funcionalidades

### 4.1 Consultar cuotas y matrícula
**Descripción**: Permite revisar las cuotas vigentes, vencidas o pagadas y, si corresponde, ver el detalle completo o copiar el código de pago.
**Ubicación**: Pestaña **Cuotas** (usuarios ADMIN) o **Cuotas y matrícula** (usuarios FAMILY).

#### Procedimiento:
**Paso 1: Seleccionar la pestaña**
- **Acción**: Haga clic en la pestaña **Cuotas** / **Cuotas y matrícula**.
- **Ubicación**: Barra de pestañas superior.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Debe contar con el rol adecuado; de lo contrario, la pestaña no aparece.
- **FOTO-ADJUNTA**: Vista de la pestaña seleccionada con las tarjetas de cuotas.
- **Resultado esperado**: Se muestran las tarjetas con alumnos (familias) o el resumen financiero (administración).

**Paso 2: Revisar el listado de cuotas**
- **Acción**: Desplácese por la lista de cuotas o matrículas.
- **Ubicación**: Tarjetas de alumnos (familias) o listado tabular (administración).
- **Datos requeridos**: Ninguno.
- **Validaciones**: Se muestra mensaje de aviso si no existen cuotas cargadas.
- **FOTO-ADJUNTA**: Tarjeta de cuota destacando importe, vencimiento y estado.
- **Resultado esperado**: Visualiza monto, vencimiento, estado y código de pago.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L888-L959】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1101-L1147】

**Paso 3: Ver detalle de una cuota**
- **Acción**: Presione el botón **Ver detalle** o **Detalle** en la cuota deseada.
- **Ubicación**: Acciones dentro de cada tarjeta o fila.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Disponible solo cuando hay cuotas listadas.
- **FOTO-ADJUNTA**: Modal de detalle mostrando información completa.
- **Resultado esperado**: Se abre un diálogo con alumno, sección, vencimiento, importes, recargo y observaciones.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1605-L1675】

**Paso 4: Copiar el código de pago**
- **Acción**: Haga clic en **Copiar código** dentro del detalle o el listado.
- **Ubicación**: Botón en la tarjeta, listado o pie del diálogo.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Requiere que exista un código registrado.
- **FOTO-ADJUNTA**: Botón "Copiar código" resaltado.
- **Resultado esperado**: Se copia el código al portapapeles y aparece la notificación **"Código de pago copiado"**.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L615-L636】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1687-L1707】

#### Mensajes del Sistema:
- ✅ **Éxito**:
  - "Código de pago copiado" al copiar un código.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L615-L636】
- ❌ **Error**:
  - "No se pudo obtener la información" al fallar la carga de cuotas familiares.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L134-L160】
  - "No se pudo obtener los pagos registrados" cuando falla la carga administrativa.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L251-L267】
  - "No se pudo copiar el texto" si el portapapeles no está disponible.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L615-L636】
- ⚠️ **Advertencia**:
  - Tarjetas muestran estados "Vencida", "Pagada", "Pago parcial" o "Vigente" según la lógica de vencimiento.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L56-L102】

#### Casos Especiales:
- Si no hay alumnos asociados a la familia, se muestra el mensaje "Aún no hay alumnos asociados a tu cuenta".【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L854-L870】
- Si no hay cuotas cargadas, se informa "No hay cuotas registradas aún" o "Aún no se registraron cuotas" según la vista.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L900-L916】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1123-L1139】

### 4.2 Crear una nueva cuota
**Descripción**: Genera cuotas o matrículas para una o varias secciones en un período determinado.
**Ubicación**: Botón **Nueva cuota** dentro de la pestaña **Cuotas** (solo ADMIN).

#### Procedimiento:
**Paso 1: Abrir el formulario**
- **Acción**: Presione **Nueva cuota**.
- **Ubicación**: Barra de acciones en la parte superior de la pestaña.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Solo disponible para rol ADMIN.
- **FOTO-ADJUNTA**: Botón "Nueva cuota" y diálogo abierto.
- **Resultado esperado**: Se abre el diálogo "Nueva cuota" con el formulario dividido en secciones.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1072-L1098】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1714-L1746】

**Paso 2: Seleccionar secciones**
- **Acción**: Marque las secciones correspondientes con las casillas.
- **Ubicación**: Columna izquierda del formulario.
- **Datos requeridos**: Al menos una sección.
- **Validaciones**: El sistema impide enviar si no hay secciones seleccionadas y muestra "Seleccioná al menos una sección".
- **FOTO-ADJUNTA**: Lista de secciones con checkboxes.
- **Resultado esperado**: Las secciones elegidas aparecen marcadas.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1747-L1798】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L620-L676】

**Paso 3: Configurar concepto y período**
- **Acción**: Defina el concepto (Cuota mensual, Matrícula, Materiales u Otros), título, año y mes.
- **Ubicación**: Columna derecha del formulario.
- **Datos requeridos**: Concepto, título (opcional), año, mes (no requerido si se marca matrícula).
- **Validaciones**: Seleccionar "Marcar como matrícula" deshabilita la elección de mes y concepto fijo; el año se usa para generar la cuota.
- **FOTO-ADJUNTA**: Campos de concepto, título, año y mes.
- **Resultado esperado**: Los campos muestran la configuración del período.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1799-L1839】

**Paso 4: Definir importes y vencimiento**
- **Acción**: Ingrese el importe, fecha de vencimiento y porcentaje de recargo.
- **Ubicación**: Mismos campos del paso anterior.
- **Datos requeridos**: Importe (número mayor a 0), fecha de vencimiento, recargo (opcional, numérico >= 0).
- **Validaciones**: Si el importe no es numérico mayor a cero se muestra "Ingresá un monto válido"; si falta el vencimiento se muestra "La fecha de vencimiento es obligatoria".
- **FOTO-ADJUNTA**: Campos de importe, calendario y recargo.
- **Resultado esperado**: Los campos quedan completos listos para enviar.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1841-L1894】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L620-L676】

**Paso 5: Confirmar generación**
- **Acción**: Pulse **Crear cuota**.
- **Ubicación**: Pie del diálogo.
- **Datos requeridos**: Los ingresados en pasos previos.
- **Validaciones**: Se valida nuevamente la información antes de enviar.
- **FOTO-ADJUNTA**: Botón "Crear cuota" con indicador de carga.
- **Resultado esperado**: Se generan las cuotas y aparece la notificación "Se generaron X cuotas" o "No se generaron nuevas cuotas (posibles duplicados)". El formulario se cierra y el listado se actualiza.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L676-L707】

#### Mensajes del Sistema:
- ✅ **Éxito**:
  - "Se generaron X cuotas" cuando la operación crea nuevas cuotas.
  - "No se generaron nuevas cuotas (posibles duplicados)" si no se crean registros pero la solicitud fue válida.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L676-L707】
- ❌ **Error**:
  - "Seleccioná al menos una sección" si no se marca ninguna sección.
  - "Ingresá un monto válido" cuando el importe no es numérico o es cero.
  - "La fecha de vencimiento es obligatoria" si no se define fecha.
  - "No se pudo crear la cuota" con detalle del servidor si falla la solicitud.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L620-L707】
- ⚠️ **Advertencia**:
  - Información contextual: "Las cuotas de matrícula no requieren selección de mes…" en el formulario.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1774-L1795】

#### Casos Especiales:
- Si no existen secciones cargadas, se muestra "No hay secciones disponibles para generar cuotas" dentro del panel de selección.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1753-L1768】
- El porcentaje de recargo se aplica automáticamente para pagos fuera de término; el detalle se visualiza en el modal de cuota.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1858-L1894】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1648-L1675】

### 4.3 Registrar pago de cuota o matrícula
**Descripción**: Permite registrar pagos recibidos y asociarlos a una cuota o matrícula específica.
**Ubicación**: Botón **Registrar pago** (pestaña Cuotas) o **Nuevo pago** (pestaña Pagos), solo visible para ADMIN.

#### Procedimiento:
**Paso 1: Abrir el diálogo de pago**
- **Acción**: Elija **Registrar pago** o **Nuevo pago**.
- **Ubicación**: Barra de acciones en pestaña correspondiente.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Solo administradores.
- **FOTO-ADJUNTA**: Diálogo de registro con el selector de tipo.
- **Resultado esperado**: Se muestra el formulario con el campo *Tipo de registro* seleccionado en "Pago de cuota" por defecto.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1072-L1098】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1906-L1976】

**Paso 2: Elegir el tipo de registro**
- **Acción**: Seleccione "Pago de cuota" o "Pago de matrícula" según corresponda.
- **Ubicación**: Selector "Tipo de registro" en la parte superior del formulario.
- **Datos requeridos**: Tipo de operación.
- **Validaciones**: Cambia los campos mostrados según la elección.
- **FOTO-ADJUNTA**: Selector de tipo con opciones desplegadas.
- **Resultado esperado**: El formulario presenta los campos de cuotas disponibles para el tipo elegido.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1977-L2048】

**Paso 3: Seleccionar la cuota o matrícula**
- **Acción**: Abra el desplegable **Cuota** y elija la opción deseada.
- **Ubicación**: Primer campo de la grilla principal.
- **Datos requeridos**: Cuota vigente asociada.
- **Validaciones**: Si no hay cuotas disponibles se muestra opción deshabilitada; el envío sin selección provoca "Seleccioná una cuota".
- **FOTO-ADJUNTA**: Dropdown de cuotas con búsqueda por alumno/periodo.
- **Resultado esperado**: El campo queda poblado con la cuota seleccionada.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L2049-L2117】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L708-L748】

**Paso 4: Completar datos del pago**
- **Acción**: Ingrese fecha de pago, monto abonado, medio de pago, referencia externa e identificador de comprobante.
- **Ubicación**: Campos restantes del formulario.
- **Datos requeridos**: Fecha (opcional), monto (obligatorio y >0), medio de pago (obligatorio), referencias opcionales.
- **Validaciones**: El monto debe ser numérico mayor que cero; de lo contrario aparece "Ingresá un monto válido".
- **FOTO-ADJUNTA**: Campos de fecha, monto y medio de pago completados.
- **Resultado esperado**: Todos los campos quedan completos y listos para guardar.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L2118-L2199】

**Paso 5: Guardar el pago**
- **Acción**: Pulse **Guardar**.
- **Ubicación**: Pie del diálogo.
- **Datos requeridos**: Información ingresada.
- **Validaciones**: Se ejecutan las validaciones anteriores.
- **FOTO-ADJUNTA**: Botón "Guardar" con icono de carga cuando corresponde.
- **Resultado esperado**: Se registra el pago, el diálogo se cierra y aparece la notificación "Pago registrado correctamente". Se actualizan los listados de cuotas y pagos.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L748-L759】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L2199-L2266】

#### Mensajes del Sistema:
- ✅ **Éxito**:
  - "Pago registrado correctamente" al guardar un pago válido.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L748-L759】
- ❌ **Error**:
  - "Seleccioná una cuota" si no se elige registro asociado.
  - "Ingresá un monto válido" cuando el importe es incorrecto.
  - "No se pudo registrar el pago" si la solicitud al servidor falla, mostrando el detalle devuelto.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L708-L768】
- ⚠️ **Advertencia**:
  - Sin cuotas disponibles aparece "No hay cuotas disponibles" dentro del selector.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L2049-L2117】

#### Casos Especiales:
- Si se registra un pago sin cuota (por procesos especiales) el listado lo mostrará como "Pago sin cuota" sin detalles de alumno.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1234-L1264】
- La fecha puede quedar "Sin registrar" si no se carga en el formulario.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1251-L1261】

### 4.4 Actualizar el estado de pagos registrados
**Descripción**: Permite marcar un pago como acreditado, en revisión o rechazado.
**Ubicación**: Dentro de la pestaña **Pagos registrados** (solo ADMIN).

#### Procedimiento:
**Paso 1: Ingresar al historial de pagos**
- **Acción**: Seleccione la pestaña **Pagos registrados**.
- **Ubicación**: Barra de pestañas.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Solo administradores visualizan esta pestaña; otros roles ven mensaje sin acceso.
- **FOTO-ADJUNTA**: Historial de pagos con filtros.
- **Resultado esperado**: Aparece la lista de pagos ordenados por fecha.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1158-L1233】

**Paso 2: Elegir una acción de estado**
- **Acción**: Use los botones **Acreditar**, **Revisar** o **Rechazar**.
- **Ubicación**: Columna de acciones a la derecha de cada pago.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Debe existir un pago válido.
- **FOTO-ADJUNTA**: Botones de acción junto al estado actual.
- **Resultado esperado**: El estado se actualiza y aparece la notificación "Estado de pago actualizado".【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1263-L1313】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L772-L792】

#### Mensajes del Sistema:
- ✅ **Éxito**: "Estado de pago actualizado" tras cambiar el estado.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L772-L792】
- ❌ **Error**: "No se pudo actualizar el pago" si la operación falla.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L772-L792】
- ⚠️ **Advertencia**: Los estados visibles en las insignias (En revisión, Acreditado, Rechazado) indican la situación actual.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L38-L54】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1263-L1313】

#### Casos Especiales:
- La fecha de acreditación se guarda automáticamente al marcar **Acreditar** (no requiere ingreso manual).【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L772-L792】

### 4.5 Registrar y gestionar recibos de sueldo
**Descripción**: Permite cargar recibos del personal y administrar sus datos.
**Ubicación**: Botón **Nuevo recibo** dentro de la pestaña **Recibos de sueldo** (solo ADMIN).

#### Procedimiento:
**Paso 1: Abrir el formulario**
- **Acción**: Haga clic en **Nuevo recibo**.
- **Ubicación**: Barra de acciones en la pestaña **Recibos de sueldo**.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Solo rol ADMIN.
- **FOTO-ADJUNTA**: Diálogo de registro en modo "Recibo de sueldo".
- **Resultado esperado**: El formulario se abre con el tipo "Recibo de sueldo" seleccionado automáticamente.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1338-L1382】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1906-L2056】

**Paso 2: Completar información del recibo**
- **Acción**: Seleccione el empleado, año, mes, montos bruto y neto, e identifique el comprobante.
- **Ubicación**: Campos dentro del formulario.
- **Datos requeridos**: Empleado, año (numérico), mes (1-12), bruto, neto, comprobante (opcional).
- **Validaciones**: El sistema exige elegir empleado y período; los montos deben ser números válidos (>0).
- **FOTO-ADJUNTA**: Campos completados del recibo.
- **Resultado esperado**: La información queda lista para guardar.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L2057-L2149】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L704-L726】

**Paso 3: Guardar el recibo**
- **Acción**: Presione **Guardar**.
- **Ubicación**: Pie del diálogo.
- **Datos requeridos**: Datos completados.
- **Validaciones**: El sistema verifica las reglas anteriores.
- **FOTO-ADJUNTA**: Botón "Guardar" con indicador de carga.
- **Resultado esperado**: Se registra el recibo y se muestra la notificación "Recibo de sueldo registrado"; el listado se actualiza.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L726-L757】

#### Mensajes del Sistema:
- ✅ **Éxito**: "Recibo de sueldo registrado" al completar la operación.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L726-L757】
- ❌ **Error**:
  - "Seleccioná un empleado" si el campo queda vacío.
  - "Indicá el período del recibo" cuando faltan año o mes.
  - "Ingresá montos válidos para bruto y neto" si los importes no son numéricos positivos.
  - "No se pudo registrar el pago" si la solicitud falla (mensaje general para todo el formulario).【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L704-L768】
- ⚠️ **Advertencia**: El selector indica "No hay empleados disponibles" cuando no hay registros para elegir.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L2057-L2086】

#### Casos Especiales:
- Tras guardar, el tipo de formulario vuelve a "Pago de cuota"; si desea cargar otro recibo, seleccione nuevamente la opción correspondiente.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L560-L569】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1977-L2048】

### 4.6 Consultar y confirmar recibos emitidos
**Descripción**: Permite al personal revisar sus recibos y confirmar su recepción. Los administradores ven el listado completo y pueden gestionar los datos.
**Ubicación**: Pestaña **Recibos de sueldo** (ADMIN) o **Mis recibos** (TEACHER/ALTERNATE).

#### Procedimiento:
**Paso 1: Abrir la pestaña de recibos**
- **Acción**: Seleccione la pestaña de recibos correspondiente.
- **Ubicación**: Barra de pestañas.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Los roles sin permiso ven un mensaje "No tenés acceso a los recibos de sueldo".
- **FOTO-ADJUNTA**: Listado de recibos con columnas de periodo y estado.
- **Resultado esperado**: Se muestra el listado filtrado (todos los recibos para ADMIN, solo propios para docentes).【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1316-L1397】

**Paso 2: Descargar o copiar identificador**
- **Acción**: Si el recibo tiene comprobante, pulse el botón para copiar el identificador.
- **Ubicación**: Botón dentro de la columna de acciones.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Disponible solo cuando existe identificador.
- **FOTO-ADJUNTA**: Botón "Copiar identificador" resaltado.
- **Resultado esperado**: Se copia el identificador y aparece "Identificador de archivo copiado".【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1407-L1456】

**Paso 3: Confirmar recepción**
- **Acción**: Presione **Recibí conforme** o **Quitar confirmación** según corresponda.
- **Ubicación**: Botón a la derecha del recibo.
- **Datos requeridos**: Ninguno.
- **Validaciones**: El recibo debe contar con empleado, periodo y montos válidos; de lo contrario se informa "El recibo no tiene información suficiente para actualizarse".
- **FOTO-ADJUNTA**: Botón de confirmación resaltado.
- **Resultado esperado**: Cambia el estado y se muestra el mensaje "Recibo confirmado" o "Confirmación eliminada".【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L809-L832】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1398-L1456】

**Paso 4 (solo ADMIN): Gestionar recibo existente**
- **Acción**: Pulse **Gestionar** para cargar los datos del recibo en el formulario y editarlos.
- **Ubicación**: Botón adicional en la columna de acciones.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Solo visible para administradores.
- **FOTO-ADJUNTA**: Botón "Gestionar" resaltado.
- **Resultado esperado**: Se abre el diálogo de pagos con el tipo "Recibo de sueldo" precompletado con los datos del registro seleccionado.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1431-L1456】

#### Mensajes del Sistema:
- ✅ **Éxito**:
  - "Identificador de archivo copiado" al copiar un comprobante.
  - "Recibo confirmado" o "Confirmación eliminada" según la acción realizada.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L809-L832】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1407-L1456】
- ❌ **Error**:
  - "El recibo no tiene información suficiente para actualizarse" si faltan datos clave.
  - "No se pudo actualizar el recibo" cuando la operación falla.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L809-L832】
- ⚠️ **Advertencia**:
  - Si no hay recibos disponibles se informa "Todavía no tenés recibos disponibles" o "Aún no se registraron recibos" según el rol.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1376-L1395】

#### Casos Especiales:
- Los docentes solo ven sus propios recibos gracias al filtrado automático; no necesitan realizar búsquedas adicionales.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L372-L415】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L1316-L1397】

## 5. Preguntas Frecuentes
1. **¿Por qué no veo la pestaña de Pagos?**
   - Su rol no cuenta con permisos para gestionarla. Solicite a un administrador que revise su perfil.
2. **¿Puedo registrar pagos parciales?**
   - Sí, ingrese el monto abonado en el formulario. El estado de la cuota reflejará "Pago parcial" si el importe no cubre el total.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L56-L102】
3. **¿Dónde encuentro el código para pagar?**
   - En cada cuota aparece el código; utilice el botón **Copiar código** para guardarlo en el portapapeles.
4. **¿Qué medios de pago admite el sistema?**
   - El campo **Medio de pago** lista todas las opciones configuradas (efectivo, transferencia, etc.) según la enumeración del sistema.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L2213-L2231】

## 6. Solución de Problemas
- **Los listados no cargan y veo un mensaje de error**: Refresque la página. Si persiste, contacte al administrador para revisar el servicio indicado en el mensaje (cuotas, pagos o recibos).【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L251-L286】【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L297-L337】
- **No puedo copiar el código de pago**: Verifique que el navegador permita acceso al portapapeles. El sistema mostrará "No se pudo copiar el texto" si la acción es bloqueada.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L615-L636】
- **No aparecen cuotas para seleccionar al registrar un pago**: Confirme que existan cuotas vigentes del tipo elegido (cuota o matrícula). Si no hay registros verá el aviso dentro del desplegable.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L2049-L2117】
- **No puedo confirmar mi recibo**: Asegúrese de que el recibo contenga todos los datos (empleado, período, montos). Si falta información, avise a administración para completarla antes de confirmar.【F:frontend-ecep/src/app/dashboard/pagos/page.tsx†L809-L832】
# Gestión de Licencias del Personal

## 1. Introducción
Esta sección del sistema permite consultar y registrar las licencias del personal docente y no docente. Desde aquí usted puede filtrar los registros existentes, revisar los detalles de cada licencia y cargar nuevas ausencias para mantener actualizado el legajo institucional.

## 2. Roles y Permisos
- **Director/a y Administrador/a**: pueden ver la información, aplicar filtros y registrar nuevas licencias. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4162-L4168】
- **Secretaría**: puede ver la información y registrar nuevas licencias. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4162-L4168】
- **Otros roles con acceso al panel**: solo pueden consultar la información disponible y utilizar los filtros.

## 3. Acceso a la Sección
### Paso 1: Abrir el módulo de Gestión de personal
- **Acción**: Ingrese al panel y abra la opción **Gestión de personal**.
- **FOTO-ADJUNTA**: Captura del panel principal mostrando el acceso a “Gestión de personal”.
- **Resultado esperado**: Se muestra la página con las pestañas **Personal** y **Licencias**. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4173-L4205】

### Paso 2: Cambiar a la pestaña Licencias
- **Acción**: Haga clic en la pestaña **Licencias**.
- **FOTO-ADJUNTA**: Vista de la pestaña “Licencias” activa con los filtros visibles.
- **Resultado esperado**: Se despliegan los filtros y el listado de licencias (o el mensaje correspondiente si no hay datos). 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4191-L5236】

## 4. Funcionalidades

### 4.1 Buscar y filtrar licencias del personal
**Descripción**: Permite localizar licencias según nombre, cargo, tipo, nivel, sección, asignatura o situación del personal.
**Ubicación**: En la parte superior de la pestaña **Licencias**, dentro del panel de filtros.

#### Información de la Funcionalidad
- **Nombre de la funcionalidad**: Búsqueda y filtrado de licencias
- **Ubicación**: Pestaña **Licencias** → panel “Filtros de licencias”
- **Rol requerido**: Todos los roles con acceso a la sección
- **Descripción**: Ajusta la búsqueda mediante un campo de texto y selectores para nivel, sección, asignatura, cargo y situación, además de botones para limpiar filtros o actualizar los datos. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4007-L4055】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4057-L4155】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L2903-L2936】

#### Procedimiento:
**Paso 1: Ingresar criterios de búsqueda**
- **Acción**: Escriba el término deseado en el campo de búsqueda (nombre, tipo de licencia, motivo, cargo, etc.).
- **Ubicación**: Campo con ícono de lupa dentro del panel de filtros.
- **Datos requeridos**: Texto libre.
- **Validaciones**: No aplica; el sistema ignora espacios al inicio y final. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4024-L4033】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L2781-L2808】
- **FOTO-ADJUNTA**: Campo de búsqueda resaltado con un término ingresado.
- **Resultado esperado**: El listado se actualizará automáticamente según el término ingresado después de un breve lapso.

**Paso 2: Aplicar filtros por listas desplegables**
- **Acción**: Seleccione los valores deseados en los filtros de **Nivel**, **Sección**, **Asignatura**, **Cargo** y **Situación**.
- **Ubicación**: Lista de selectores debajo del campo de búsqueda.
- **Datos requeridos**: Selección de una opción o “Todos …”.
- **Validaciones**: Cada selector muestra únicamente valores presentes en los datos cargados. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4057-L4151】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L2733-L2855】
- **FOTO-ADJUNTA**: Panel de filtros con varias listas desplegables abiertas.
- **Resultado esperado**: El listado refleja únicamente las licencias que cumplan con los criterios elegidos.

**Paso 3: Limpiar o actualizar los filtros**
- **Acción**: Presione **Limpiar filtros** para reiniciar los selectores o **Actualizar datos** para solicitar nuevamente la información al servidor.
- **Ubicación**: Botones a la derecha del campo de búsqueda.
- **Validaciones**: El botón “Limpiar filtros” solo se habilita cuando hay criterios activos. “Actualizar datos” se deshabilita durante la carga. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4036-L4054】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L2903-L2936】
- **FOTO-ADJUNTA**: Botones “Limpiar filtros” y “Actualizar datos” resaltados.
- **Resultado esperado**: Se restauran los filtros a su valor inicial o se recargan los datos, según el botón utilizado.

#### Mensajes del Sistema:
- ✅ **Éxito**: Actualización silenciosa del listado con los nuevos criterios.
- ❌ **Error**: Si ocurre un problema al cargar los datos se muestra el mensaje “Error al cargar la información” con el botón **Reintentar**. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3995-L4005】
- ⚠️ **Advertencia**: Cuando no se encuentran resultados, se muestran los mensajes “No se encontraron licencias con los criterios seleccionados.” o “Aún no se registraron licencias.” según corresponda. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5229-L5234】

#### Casos Especiales:
- Durante la carga se muestra el estado “Cargando información…”. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3991-L3993】
- Si la búsqueda no coincide con ningún registro y existen filtros activos, el botón **Limpiar filtros** permite restablecer rápidamente la vista. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4036-L4044】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5231-L5234】

### 4.2 Revisar el detalle de una licencia registrada
**Descripción**: Presenta la información completa de cada licencia en tarjetas individuales.
**Ubicación**: Listado de la pestaña **Licencias**.

#### Información de la Funcionalidad
- **Nombre de la funcionalidad**: Consulta detallada de licencias
- **Ubicación**: Pestaña **Licencias** → Tarjetas del listado
- **Rol requerido**: Todos los roles con acceso a la sección
- **Descripción**: Cada tarjeta muestra datos del personal, tipo y justificación de la licencia, fechas, horas de ausencia, motivo, observaciones, secciones y materias afectadas, además de la situación laboral visible. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5080-L5221】

#### Procedimiento:
**Paso 1: Identificar la tarjeta de la licencia**
- **Acción**: Desplácese por el listado hasta ubicar la tarjeta correspondiente.
- **Ubicación**: Sección central de la pestaña **Licencias**.
- **Datos requeridos**: No aplica.
- **Validaciones**: Las tarjetas se muestran ordenadas por las fechas guardadas (más recientes primero). 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5100-L5107】
- **FOTO-ADJUNTA**: Tarjeta de licencia resaltando el encabezado con el nombre del personal.
- **Resultado esperado**: Se visualiza el nombre del personal, el tipo de licencia y su justificación.

**Paso 2: Revisar fechas y horas de ausencia**
- **Acción**: Observe el bloque superior derecho de la tarjeta.
- **Ubicación**: Encabezado de la tarjeta, junto al nombre del personal.
- **Datos requeridos**: No aplica.
- **Validaciones**: Si no se registró fecha de finalización se mostrará únicamente la fecha de inicio; las horas de ausencia solo aparecen cuando se cargaron valores numéricos. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5134-L5150】
- **FOTO-ADJUNTA**: Encabezado de tarjeta con el rango de fechas y las horas de ausencia visibles.
- **Resultado esperado**: Se confirma la duración de la licencia y, si aplica, la cantidad de horas informadas.

**Paso 3: Consultar motivo, observaciones y asignaciones**
- **Acción**: Lea el contenido del cuerpo de la tarjeta.
- **Ubicación**: Parte inferior de la tarjeta.
- **Datos requeridos**: No aplica.
- **Validaciones**: El motivo siempre está presente; las observaciones se muestran solo si fueron cargadas. Las secciones y materias se listan con etiquetas diferenciadas. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5154-L5205】
- **FOTO-ADJUNTA**: Cuerpo de la tarjeta con el motivo y las etiquetas de secciones/materias.
- **Resultado esperado**: Se visualiza la información complementaria para dar contexto a la licencia.

**Paso 4: Verificar la situación laboral visible**
- **Acción**: Revise el bloque final de la tarjeta.
- **Ubicación**: Parte inferior de cada tarjeta, después de las materias asignadas.
- **Validaciones**: Si la situación visible difiere de la situación original del legajo, se muestra entre paréntesis el valor registrado. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5206-L5221】
- **FOTO-ADJUNTA**: Sección inferior de la tarjeta resaltando la situación actual.
- **Resultado esperado**: Conocer si la persona figura como “En licencia” u otra situación.

#### Mensajes del Sistema:
- ✅ **Éxito**: Visualización inmediata de la información almacenada.
- ⚠️ **Advertencia**: Si no hay licencias registradas se muestra el mensaje “Aún no se registraron licencias.” 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5229-L5234】
- ❌ **Error**: Si la página no puede cargar los datos se presenta el mensaje general de error descrito en la funcionalidad 4.1. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3995-L4005】

#### Casos Especiales:
- Las tarjetas incluyen insignias que identifican si la licencia está justificada (gris) o sin justificar (rojo). 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5115-L5128】
- Se muestran etiquetas con el nivel y la sección afectada, así como las materias donde aplica la licencia. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5170-L5204】

### 4.3 Registrar una nueva licencia
**Descripción**: Permite cargar un nuevo registro de licencia para un miembro del personal.
**Ubicación**: Botón **Nueva licencia** en la pestaña **Licencias** o botón **Registrar licencia** dentro de cada ficha de personal.

#### Información de la Funcionalidad
- **Nombre de la funcionalidad**: Registro de nueva licencia
- **Ubicación**: Pestaña **Licencias** → Botón “Nueva licencia” / Pestaña **Personal** → Botón “Registrar licencia” en cada ficha
- **Rol requerido**: Director/a, Administrador/a o Secretaría
- **Descripción**: Abre un diálogo con formulario para seleccionar al personal, definir el tipo de licencia, fechas, motivo, justificación, horas de ausencia y observaciones adicionales. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4191-L4205】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4334-L4353】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6788-L6992】

#### Procedimiento:
**Paso 1: Abrir el formulario**
- **Acción**: Haga clic en **Nueva licencia** (pestaña Licencias) o en **Registrar licencia** dentro de la ficha del personal correspondiente.
- **Ubicación**: Barra superior de la pestaña Licencias o sección de acciones en cada tarjeta del personal.
- **Validaciones**: El botón solo está disponible para roles autorizados.
- **FOTO-ADJUNTA**: Vista del botón “Nueva licencia” activo.
- **Resultado esperado**: Se abre el diálogo “Nueva licencia”. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4191-L4205】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4334-L4353】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6788-L6797】

**Paso 2: Seleccionar al personal**
- **Acción**: En el campo **Personal**, elija la persona destinataria de la licencia.
- **Ubicación**: Primer selector del formulario.
- **Datos requeridos**: Selección de un integrante de la lista.
- **Validaciones**: Campo obligatorio. Si se ingresa desde la ficha del personal, el sistema preselecciona automáticamente al integrante correspondiente. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3897-L3903】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6800-L6825】
- **FOTO-ADJUNTA**: Selector de personal mostrando la lista desplegada.
- **Resultado esperado**: El campo muestra el nombre del personal elegido.

**Paso 3: Definir el tipo de licencia**
- **Acción**: Seleccione una opción en el campo **Tipo de licencia**.
- **Ubicación**: Segundo selector del formulario.
- **Datos requeridos**: Una de las opciones predeterminadas (Enfermedad, Cuidado familiar, Formación, Motivo personal, Maternidad/Paternidad, Otra).
- **Validaciones**: Campo obligatorio. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L148-L155】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6827-L6845】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3833-L3837】
- **FOTO-ADJUNTA**: Selector de tipo abierto mostrando las opciones.
- **Resultado esperado**: Se asigna el tipo elegido a la licencia.

**Paso 4: Ingresar las fechas de la licencia**
- **Acción**: Seleccione la **Fecha de inicio** (obligatoria) y, si corresponde, la **Fecha de finalización**.
- **Ubicación**: Dos calendarios ubicados en la misma fila.
- **Validaciones**: La fecha de inicio no puede quedar vacía. El sistema evita que la fecha de fin sea anterior a la de inicio ajustando automáticamente los valores y mostrando un error si se intenta guardar un rango inválido. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6847-L6894】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3839-L3860】
- **FOTO-ADJUNTA**: Calendarios mostrando el rango seleccionado.
- **Resultado esperado**: Las fechas aparecen registradas en los campos correspondientes.

**Paso 5: Indicar justificación y motivo**
- **Acción**: Elija si la licencia está justificada y describa el motivo en el área de texto.
- **Ubicación**: Selector “¿La licencia está justificada?” y campo de texto “Motivo”.
- **Datos requeridos**: Seleccionar “Sí” o “No”; completar el motivo con texto.
- **Validaciones**: El motivo es obligatorio; el selector está predefinido en “Sí”. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6898-L6932】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3845-L3849】
- **FOTO-ADJUNTA**: Selector de justificación y campo de motivo completados.
- **Resultado esperado**: Se guardan la condición de justificación y el motivo ingresado.

**Paso 6: Completar información adicional (opcional)**
- **Acción**: Ingrese las horas de ausencia y cualquier observación pertinente.
- **Ubicación**: Campo numérico “Horas de ausencia (opcional)” y área de texto “Observaciones”.
- **Datos requeridos**: Número mayor o igual a cero para las horas; texto libre para observaciones.
- **Validaciones**: El campo de horas solo acepta números iguales o superiores a cero; ambos campos son opcionales. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6934-L6966】
- **FOTO-ADJUNTA**: Campos opcionales resaltados con información de ejemplo.
- **Resultado esperado**: Se añade información complementaria a la licencia.

**Paso 7: Guardar la licencia**
- **Acción**: Presione **Registrar licencia**.
- **Ubicación**: Botón al pie del formulario.
- **Validaciones**: El botón permanece deshabilitado durante el guardado; se muestra el indicador “Guardando…” mientras se procesa.
- **FOTO-ADJUNTA**: Botón “Registrar licencia” con el estado de carga.
- **Resultado esperado**: El diálogo se cierra y la nueva licencia aparece en el listado actualizado. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6970-L6988】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3863-L3882】

#### Mensajes del Sistema:
- ✅ **Éxito**: “Licencia registrada” con la descripción “La licencia se registró correctamente.” 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3877-L3880】
- ❌ **Error**: Mensajes de validación preventiva: “Seleccione personal”, “Tipo requerido”, “Fecha requerida”, “Motivo requerido”, “Fechas de licencia inválidas”. Mensaje de error general: “Error al registrar licencia” con detalle de la causa. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3827-L3889】
- ⚠️ **Advertencia**: Si no hay personal disponible para asignar, el selector muestra la opción deshabilitada “No hay personal disponible”. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6811-L6816】

#### Casos Especiales:
- Al abrir el formulario desde una ficha específica, el campo **Personal** ya aparece completado con ese integrante. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3897-L3903】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4334-L4353】
- Al cerrar el diálogo sin guardar, el formulario se restablece automáticamente y elimina cualquier dato parcial. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L1285-L1289】
- Si la fecha de fin se elimina, el sistema registra la licencia como de duración abierta hasta nuevo aviso. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6880-L6895】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3869-L3875】

## 5. Preguntas Frecuentes
1. **¿Por qué no veo el botón “Nueva licencia”?**
   - Verifique que su usuario tenga rol de Dirección, Administración o Secretaría. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4162-L4168】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4191-L4205】
2. **¿Qué sucede si no cargo la fecha de finalización?**
   - La licencia quedará abierta; el sistema mostrará solo la fecha de inicio hasta que se actualice. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L5134-L5141】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L6880-L6895】
3. **¿Cómo vuelvo a ver todo el listado tras filtrar?**
   - Use el botón **Limpiar filtros** para restablecer los criterios. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4036-L4044】

## 6. Solución de Problemas
- **No se cargan los datos de licencias**: Use el botón **Reintentar** del mensaje de error o **Actualizar datos** en el panel de filtros para volver a solicitar la información. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3995-L4005】【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L4036-L4054】
- **No puedo guardar una licencia**: Revise que el formulario cumpla las validaciones (personal seleccionado, tipo, fecha de inicio y motivo obligatorios; fechas en orden). Corrija los campos resaltados y vuelva a intentar. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L3827-L3889】
- **El formulario muestra valores anteriores al reabrirlo**: Cierre completamente el diálogo; al volver a abrirlo los datos se reinician automáticamente. 【F:frontend-ecep/src/app/dashboard/personal/page.tsx†L1285-L1289】
# Portal de Admisiones

## 1. Introducción
El Portal de Admisiones permite a las familias iniciar y completar la postulación de un aspirante en cinco pasos guiados, con validaciones en cada etapa, guardado automático de borradores y seguimiento posterior mediante la confirmación de entrevistas enviadas por la institución.【F:frontend-ecep/src/app/postulacion/page.tsx†L198-L229】【F:frontend-ecep/src/app/entrevista/page.tsx†L118-L274】

## 2. Roles y Permisos
- **Familias postulantes (sin autenticación previa):** pueden crear postulaciones, agregar familiares y enviar la solicitud siempre que autoricen el envío de comunicaciones por correo electrónico.【F:frontend-ecep/src/app/postulacion/page.tsx†L213-L224】【F:frontend-ecep/src/app/postulacion/Step5.tsx†L84-L101】
- **Familias con enlace de entrevista:** quienes reciben un correo con token y correo asociado pueden seleccionar o rechazar horarios de entrevista sin iniciar sesión.【F:frontend-ecep/src/app/entrevista/page.tsx†L35-L95】【F:frontend-ecep/src/app/entrevista/page.tsx†L171-L213】

## 3. Acceso a la Sección
### Paso 1: Ingresar al Portal
- **Acción**: Abra el enlace público `https://<dominio>/postulacion` desde un navegador actualizado.
- **FOTO-ADJUNTA**: Pantalla inicial del portal mostrando el título “Postulación de Alumno” y el botón “Continuar” deshabilitado hasta completar la verificación de DNI.
- **Resultado esperado**: Se muestra un cuadro de diálogo solicitando el DNI del aspirante antes de iniciar el formulario.【F:frontend-ecep/src/app/postulacion/page.tsx†L1381-L1509】

## 4. Funcionalidades

### 4.1 Verificación de DNI del Aspirante
**Descripción**: Evita postulaciones duplicadas validando el DNI antes de permitir el acceso al formulario.【F:frontend-ecep/src/app/postulacion/page.tsx†L1230-L1267】
**Ubicación**: Diálogo emergente que aparece al entrar al portal.

#### Procedimiento:
**Paso 1: Registrar DNI**
- **Acción**: Ingrese el DNI sin puntos y presione “Continuar”.
- **Ubicación**: Cuadro de diálogo inicial “Verificá el DNI del aspirante”.
- **Datos requeridos**: DNI (7 a 10 dígitos numéricos).
- **Validaciones**: Se rechazan DNIs vacíos, con longitud inválida o duplicados; los duplicados muestran el mensaje “El DNI ingresado es incorrecto o ya fue registrado previamente”.【F:frontend-ecep/src/app/postulacion/page.tsx†L1234-L1257】
- **FOTO-ADJUNTA**: Modal con el campo “DNI del aspirante”, el botón “Continuar” y el mensaje de ayuda.
- **Resultado esperado**: Si es válido, se habilita el formulario; si está repetido o es inválido, aparece un mensaje de error y no se avanza.【F:frontend-ecep/src/app/postulacion/page.tsx†L1230-L1267】

#### Mensajes del Sistema:
- ✅ **Éxito**: No aplica (el modal simplemente se cierra al validar).
- ❌ **Error**: “Ingresá un DNI válido de 7 a 10 dígitos.”; “El DNI ingresado es incorrecto o ya fue registrado previamente.”; “No se pudo verificar el DNI. Intentá nuevamente.”【F:frontend-ecep/src/app/postulacion/page.tsx†L1234-L1265】
- ⚠️ **Advertencia**: No hay advertencias específicas.

#### Casos Especiales:
- Si el usuario solicita cambiar el DNI luego de iniciada la carga, debe confirmar que reiniciará toda la postulación y se borrarán los datos guardados.【F:frontend-ecep/src/app/postulacion/Step1.tsx†L101-L129】【F:frontend-ecep/src/app/postulacion/page.tsx†L1270-L1275】

### 4.2 Paso 1 – Datos del Aspirante
**Descripción**: Recolecta información personal, académica y de contacto del aspirante.【F:frontend-ecep/src/app/postulacion/Step1.tsx†L65-L260】
**Ubicación**: Primera tarjeta dentro del formulario.

#### Procedimiento:
**Paso 1: Completar datos personales**
- **Acción**: Ingrese nombre, apellido, DNI (prellenado tras la verificación) y fecha de nacimiento.
- **Ubicación**: Sección “Datos del Aspirante”.
- **Datos requeridos**: Nombre, apellido, DNI, fecha de nacimiento.
- **Validaciones**: El DNI queda en solo lectura tras la verificación; la fecha debe ser al menos dos años anterior a la fecha actual.【F:frontend-ecep/src/app/postulacion/Step1.tsx†L72-L173】【F:frontend-ecep/src/app/postulacion/page.tsx†L1093-L1099】
- **FOTO-ADJUNTA**: Formulario con los campos “Nombre”, “Apellido”, “DNI” y el selector de fecha resaltados.
- **Resultado esperado**: Los campos obligatorios se registran sin resaltar en rojo.

**Paso 2: Seleccionar curso y turno**
- **Acción**: Escoja el curso solicitado y el turno preferido en las listas desplegables.
- **Ubicación**: Bloque de selects al final de la columna izquierda.
- **Datos requeridos**: Curso, turno.
- **Validaciones**: Deben elegirse opciones válidas de la lista.【F:frontend-ecep/src/app/postulacion/Step1.tsx†L175-L221】
- **FOTO-ADJUNTA**: Selectores “Curso Solicitado” y “Turno Preferido” desplegados.
- **Resultado esperado**: Se muestran las etiquetas de la opción elegida.

**Paso 3: Completar domicilio y antecedentes**
- **Acción**: Indique escuela actual, domicilio completo y nacionalidad.
- **Ubicación**: Campos finales del paso 1.
- **Datos requeridos**: Escuela actual, domicilio, nacionalidad (aceptan texto libre).
- **Validaciones**: Si se omiten datos obligatorios se muestra un mensaje general al intentar avanzar.【F:frontend-ecep/src/app/postulacion/page.tsx†L891-L949】
- **FOTO-ADJUNTA**: Campos de texto “Escuela Actual”, “Domicilio Completo” y “Nacionalidad” completos.
- **Resultado esperado**: Puede avanzar al siguiente paso sin alertas.

#### Mensajes del Sistema:
- ✅ **Éxito**: No aplica; el avance confirma la validación.
- ❌ **Error**: Toast “Revisá los datos del aspirante.” con detalle de campos faltantes, formato de DNI o fecha inválida.【F:frontend-ecep/src/app/postulacion/page.tsx†L930-L947】
- ⚠️ **Advertencia**: Indicador textual “Verificando DNI…” mientras se consulta información previa.【F:frontend-ecep/src/app/postulacion/Step1.tsx†L147-L154】

#### Casos Especiales:
- Si el aspirante ya existe en la base, se autocompletan nombre, apellido, fecha, domicilio y nacionalidad luego de validar el DNI.【F:frontend-ecep/src/app/postulacion/page.tsx†L435-L468】

### 4.3 Paso 2 – Gestión de Familiares
**Descripción**: Permite agregar, editar o eliminar familiares responsables con sus datos de contacto y convivencia.【F:frontend-ecep/src/app/postulacion/Step2.tsx†L151-L520】
**Ubicación**: Segundo paso del asistente.

#### Procedimiento:
**Paso 1: Agregar familiar por DNI**
- **Acción**: Presione “Agregar Familiar”, ingrese el DNI y confirme.
- **Ubicación**: Botón en la cabecera “Datos Familiares”.
- **Datos requeridos**: DNI de 7 a 10 dígitos.
- **Validaciones**: Se impide agregar DNIs repetidos en la postulación; se muestran mensajes de error si es inválido o hubo un problema al consultar datos previos.【F:frontend-ecep/src/app/postulacion/Step2.tsx†L152-L208】
- **FOTO-ADJUNTA**: Diálogo “Agregar familiar” con campo DNI y alerta de error.
- **Resultado esperado**: Se crea una tarjeta “Familiar 1” con el DNI bloqueado para edición.【F:frontend-ecep/src/app/postulacion/Step2.tsx†L236-L282】

**Paso 2: Completar datos del familiar**
- **Acción**: Llene relación, nombre, apellido, fecha de nacimiento, contactos, ocupación, lugar de trabajo y domicilio.
- **Ubicación**: Tarjeta individual del familiar.
- **Datos requeridos**: Todos los campos mostrados y la casilla “Vive con el alumno” según corresponda.
- **Validaciones**: Cada campo obligatorio se marca en rojo si queda vacío; el formulario exige fecha válida (≥2 años atrás), emails y teléfonos con formato numérico para DNI/teléfonos.【F:frontend-ecep/src/app/postulacion/Step2.tsx†L284-L520】【F:frontend-ecep/src/app/postulacion/page.tsx†L963-L1017】
- **FOTO-ADJUNTA**: Tarjeta de familiar completada con casilla “Vive con el alumno” activa.
- **Resultado esperado**: Al completar correctamente, los indicadores de error desaparecen.

**Paso 3: Administrar lista de familiares**
- **Acción**: Use “Eliminar” para quitar un familiar o marque la casilla de convivencia.
- **Ubicación**: Barra superior de cada tarjeta.
- **Datos requeridos**: Confirmación tácita al pulsar “Eliminar”.
- **Validaciones**: Se exige al menos un familiar antes de avanzar; se muestra alerta si la lista queda vacía.【F:frontend-ecep/src/app/postulacion/Step2.tsx†L236-L249】【F:frontend-ecep/src/app/postulacion/page.tsx†L958-L1039】
- **FOTO-ADJUNTA**: Lista con múltiples tarjetas y botón “Eliminar”.
- **Resultado esperado**: Se actualiza la numeración y desaparecen los errores si hay al menos un familiar completo.

#### Mensajes del Sistema:
- ✅ **Éxito**: Toast “Datos básicos del familiar cargados…” o “Datos del familiar completados automáticamente.” al reutilizar registros existentes.【F:frontend-ecep/src/app/postulacion/page.tsx†L663-L699】
- ❌ **Error**: Toast “Completá los datos de al menos un familiar.” con detalle; alertas en el diálogo al ingresar un DNI inválido o repetido.【F:frontend-ecep/src/app/postulacion/page.tsx†L1036-L1038】【F:frontend-ecep/src/app/postulacion/Step2.tsx†L203-L208】
- ⚠️ **Advertencia**: Mensaje “No hay familiares agregados…” cuando la lista está vacía.【F:frontend-ecep/src/app/postulacion/Step2.tsx†L236-L240】

#### Casos Especiales:
- Si el familiar existe en el sistema con credenciales, se solicita usuario y contraseña para autocompletar datos; si no tiene credenciales, sólo se rellenan nombre y apellido y se informa que debe completar el resto manualmente.【F:frontend-ecep/src/app/postulacion/page.tsx†L650-L705】【F:frontend-ecep/src/app/postulacion/ExistingFamiliarDialog.tsx†L68-L175】

### 4.4 Paso 3 – Condiciones del Hogar
**Descripción**: Registra la conectividad y los recursos tecnológicos del hogar del aspirante.【F:frontend-ecep/src/app/postulacion/Step3.tsx†L39-L115】
**Ubicación**: Tercer paso.

#### Procedimiento:
**Paso 1: Seleccionar conectividad**
- **Acción**: Abra el selector y elija el tipo de conexión a Internet disponible.
- **Ubicación**: Primer campo del paso 3.
- **Datos requeridos**: Una opción de la lista (Satelital, Wifi, Datos móviles o Sin conexión).
- **Validaciones**: Campo obligatorio; muestra borde rojo si se deja vacío.【F:frontend-ecep/src/app/postulacion/Step3.tsx†L48-L71】【F:frontend-ecep/src/app/postulacion/page.tsx†L1043-L1066】
- **FOTO-ADJUNTA**: Selector desplegado con las cuatro opciones.
- **Resultado esperado**: El valor seleccionado se muestra en el cuadro.

**Paso 2: Describir recursos e idiomas**
- **Acción**: Indique dispositivos disponibles y los idiomas hablados en el hogar.
- **Ubicación**: Campos de texto del paso.
- **Datos requeridos**: Descripción de dispositivos e idiomas.
- **Validaciones**: Ambos campos son obligatorios y requieren texto no vacío.【F:frontend-ecep/src/app/postulacion/Step3.tsx†L74-L113】【F:frontend-ecep/src/app/postulacion/page.tsx†L1043-L1066】
- **FOTO-ADJUNTA**: Área de texto “Dispositivos Disponibles” y campo “Idiomas Hablados en el Hogar” con contenido.
- **Resultado esperado**: Se habilita el botón “Siguiente”.

#### Mensajes del Sistema:
- ❌ **Error**: Toast “Completá la información del hogar.” si falta algún campo.【F:frontend-ecep/src/app/postulacion/page.tsx†L1058-L1064】

#### Casos Especiales:
- No aplica.

### 4.5 Paso 4 – Información de Salud
**Descripción**: Recoge antecedentes médicos y necesidades especiales del aspirante.【F:frontend-ecep/src/app/postulacion/Step4.tsx†L21-L121】
**Ubicación**: Cuarto paso.

#### Procedimiento:
**Paso 1: Registrar antecedentes de salud**
- **Acción**: Complete los campos de enfermedades, medicación, limitaciones, tratamientos y observaciones.
- **Ubicación**: Campos de texto del paso 4.
- **Datos requeridos**: Información relevante (texto libre).
- **Validaciones**: No hay campos obligatorios, pero conviene completar los datos para el informe automático.【F:frontend-ecep/src/app/postulacion/Step4.tsx†L29-L118】【F:frontend-ecep/src/app/postulacion/page.tsx†L136-L180】
- **FOTO-ADJUNTA**: Textarea “Enfermedades o Alergias” con texto de ejemplo.
- **Resultado esperado**: La información se incorporará al resumen de observaciones de la solicitud.【F:frontend-ecep/src/app/postulacion/page.tsx†L136-L180】

**Paso 2: Indicar ayudas y cobertura**
- **Acción**: Marque “Usa ayudas de movilidad” si corresponde y complete “Cobertura Médica”.
- **Ubicación**: Parte inferior del paso.
- **Datos requeridos**: Casilla de verificación (opcional) y texto de cobertura.
- **Validaciones**: Sin restricciones adicionales.【F:frontend-ecep/src/app/postulacion/Step4.tsx†L84-L118】
- **FOTO-ADJUNTA**: Casilla “Usa ayudas de movilidad” marcada y campo “Cobertura Médica” completo.
- **Resultado esperado**: La casilla refleja la selección y el texto queda registrado.

#### Mensajes del Sistema:
- No se muestran mensajes específicos en este paso; los datos se validan al enviar la solicitud.【F:frontend-ecep/src/app/postulacion/page.tsx†L1101-L1110】

#### Casos Especiales:
- Si se ingresa información, se incluirá automáticamente en las observaciones enviadas al equipo de admisiones.【F:frontend-ecep/src/app/postulacion/page.tsx†L136-L180】

### 4.6 Paso 5 – Confirmación y Envío
**Descripción**: Resume los datos principales y solicita autorización para comunicaciones antes de enviar la postulación.【F:frontend-ecep/src/app/postulacion/Step5.tsx†L55-L101】
**Ubicación**: Quinto y último paso.

#### Procedimiento:
**Paso 1: Revisar resumen**
- **Acción**: Verifique el nombre del aspirante, DNI, curso, turno y cantidad de familiares.
- **Ubicación**: Tarjeta de resumen dentro del paso 5.
- **Datos requeridos**: Ninguno; se muestran los datos ingresados.
- **Validaciones**: Revise que toda la información sea correcta antes de continuar.【F:frontend-ecep/src/app/postulacion/Step5.tsx†L61-L82】
- **FOTO-ADJUNTA**: Tarjeta de resumen con valores ficticios.
- **Resultado esperado**: El resumen refleja los datos cargados.

**Paso 2: Autorizar comunicaciones**
- **Acción**: Marque la casilla “Autorizo a recibir comunicaciones por correo electrónico”.
- **Ubicación**: Debajo del resumen.
- **Datos requeridos**: Confirmación mediante casilla.
- **Validaciones**: La casilla debe estar marcada para habilitar el botón “Enviar Postulación”.【F:frontend-ecep/src/app/postulacion/Step5.tsx†L84-L101】【F:frontend-ecep/src/app/postulacion/page.tsx†L1444-L1449】
- **FOTO-ADJUNTA**: Casilla marcada y botón “Enviar Postulación” habilitado.
- **Resultado esperado**: El botón cambia a estado activo.

**Paso 3: Enviar solicitud**
- **Acción**: Presione “Enviar Postulación”.
- **Ubicación**: Barra inferior de navegación.
- **Datos requeridos**: Ninguno adicional.
- **Validaciones**: El sistema vuelve a comprobar fechas válidas y que exista al menos un familiar completo antes de enviar.【F:frontend-ecep/src/app/postulacion/page.tsx†L1087-L1182】
- **FOTO-ADJUNTA**: Barra con el botón “Enviar Postulación” resaltado.
- **Resultado esperado**: Se muestra una pantalla de agradecimiento con opciones para volver al inicio o iniciar una nueva postulación.【F:frontend-ecep/src/app/postulacion/page.tsx†L1200-L1226】

#### Mensajes del Sistema:
- ✅ **Éxito**: “Postulación enviada con éxito.” seguido del mensaje final en pantalla.【F:frontend-ecep/src/app/postulacion/page.tsx†L1182-L1221】
- ❌ **Error**: “Debes autorizar comunicaciones por email.”; “Fecha de nacimiento inválida” (aspirante o familiares); “Error al enviar: …” si ocurre un fallo en el guardado.【F:frontend-ecep/src/app/postulacion/page.tsx†L1087-L1194】

#### Casos Especiales:
- Tras enviar, se limpian los datos locales y el usuario puede iniciar una nueva postulación sin recargar la página.【F:frontend-ecep/src/app/postulacion/page.tsx†L1184-L1281】

### 4.7 Gestión de Borradores y Continuidad
**Descripción**: Guarda automáticamente el progreso y permite retomarlo o descartarlo.【F:frontend-ecep/src/app/postulacion/page.tsx†L275-L388】【F:frontend-ecep/src/app/postulacion/page.tsx†L1329-L1379】
**Ubicación**: Barra superior del formulario (alerta de borrador) y almacenamiento local del navegador.

#### Procedimiento:
**Paso 1: Guardado automático**
- **Acción**: Complete cualquier campo; el portal guarda automáticamente un borrador en el navegador.
- **Ubicación**: Función interna (sin controles visibles).
- **Datos requeridos**: Información ingresada.
- **Validaciones**: El borrador se actualiza sólo si hay datos relevantes o si el usuario avanza de paso.【F:frontend-ecep/src/app/postulacion/page.tsx†L331-L383】
- **FOTO-ADJUNTA**: No aplica (se sugiere resaltar el formulario con indicador de borrador en la consola de navegador).
- **Resultado esperado**: Al recargar, aparece una alerta ofreciendo recuperar el borrador.【F:frontend-ecep/src/app/postulacion/page.tsx†L1396-L1413】

**Paso 2: Recuperar o descartar**
- **Acción**: Elija “Recuperar borrador” o “Descartar” cuando se muestre la alerta.
- **Ubicación**: Alerta “Continuá donde lo dejaste”.
- **Datos requeridos**: Ninguno; basta con pulsar el botón deseado.
- **Validaciones**: Al recuperar, se restaura el paso y los datos; al descartar, se limpian y se reabre la verificación de DNI si corresponde.【F:frontend-ecep/src/app/postulacion/page.tsx†L1330-L1358】【F:frontend-ecep/src/app/postulacion/page.tsx†L1360-L1365】
- **FOTO-ADJUNTA**: Alerta mostrando ambos botones.
- **Resultado esperado**: El formulario se restaura o se reinicia según la opción.

#### Mensajes del Sistema:
- ✅ **Éxito**: “Borrador recuperado correctamente.” al restaurar.【F:frontend-ecep/src/app/postulacion/page.tsx†L1357-L1358】
- ⚠️ **Advertencia**: “Se descartó el borrador almacenado.” al optar por descartar.【F:frontend-ecep/src/app/postulacion/page.tsx†L1360-L1365】

#### Casos Especiales:
- Si se recupera un borrador con DNI registrado, el sistema mantiene el DNI bloqueado y salta el diálogo inicial; si no había DNI, el diálogo vuelve a mostrarse.【F:frontend-ecep/src/app/postulacion/page.tsx†L1345-L1356】

### 4.8 Cancelar o Reiniciar la Postulación
**Descripción**: Permite abandonar el proceso y borrar los datos locales en cualquier momento.【F:frontend-ecep/src/app/postulacion/page.tsx†L1367-L1379】【F:frontend-ecep/src/app/postulacion/Step1.tsx†L101-L129】
**Ubicación**: Botón “Cancelar postulación” al pie del formulario y opción “Cambiar DNI” en el Paso 1.

#### Procedimiento:
**Paso 1: Cancelar postulación**
- **Acción**: Presione “Cancelar postulación” y confirme en la ventana emergente del navegador.
- **Ubicación**: Barra inferior del formulario.
- **Datos requeridos**: Confirmación del navegador.
- **Validaciones**: El sistema pregunta antes de borrar datos locales.
- **FOTO-ADJUNTA**: Botón “Cancelar postulación” resaltado.
- **Resultado esperado**: Se limpia el borrador, se reinicia el asistente y aparece el diálogo de verificación de DNI.【F:frontend-ecep/src/app/postulacion/page.tsx†L1367-L1379】

#### Mensajes del Sistema:
- ⚠️ **Advertencia**: “Se canceló la postulación. Podés comenzar una nueva cuando quieras.”【F:frontend-ecep/src/app/postulacion/page.tsx†L1375-L1378】

#### Casos Especiales:
- Al cambiar el DNI desde el Paso 1, se aplica la misma lógica de reinicio que al cancelar.【F:frontend-ecep/src/app/postulacion/Step1.tsx†L101-L129】【F:frontend-ecep/src/app/postulacion/page.tsx†L1270-L1281】

### 4.9 Confirmación de Entrevistas (Portal de Seguimiento)
**Descripción**: Los postulantes con un enlace recibido por correo pueden confirmar o rechazar opciones de entrevista y consultar material adicional.【F:frontend-ecep/src/app/entrevista/page.tsx†L35-L213】
**Ubicación**: Ruta pública `/entrevista?token=<valor>&email=<correo>`.

#### Procedimiento:
**Paso 1: Abrir enlace del correo**
- **Acción**: Haga clic en el enlace recibido; incluye un token único y, opcionalmente, el correo.
- **Ubicación**: En el correo emitido por la escuela.
- **Datos requeridos**: Token válido (se completa automáticamente desde el enlace).
- **Validaciones**: Si el token es inválido o expiró, se muestra un error y no se cargan datos.【F:frontend-ecep/src/app/entrevista/page.tsx†L46-L66】
- **FOTO-ADJUNTA**: Pantalla con título “Confirmá tu entrevista de admisión” y mensaje de error.
- **Resultado esperado**: Se muestra la solicitud con el nombre del aspirante y la fecha límite si corresponde.

**Paso 2: Elegir una opción de entrevista**
- **Acción**: Presione el botón correspondiente a la fecha y horario deseado o seleccione “No puedo asistir en estas fechas”.
- **Ubicación**: Lista de botones dentro del card principal.
- **Datos requeridos**: Selección de una opción.
- **Validaciones**: Las opciones se deshabilitan mientras se envía la respuesta; si ya se registró una respuesta, se ocultan las acciones.【F:frontend-ecep/src/app/entrevista/page.tsx†L171-L213】【F:frontend-ecep/src/app/entrevista/page.tsx†L194-L205】
- **FOTO-ADJUNTA**: Botones con icono de calendario y texto “Elegir esta opción”.
- **Resultado esperado**: Se muestra una alerta de agradecimiento con la información confirmada o aviso de reprogramación.【F:frontend-ecep/src/app/entrevista/page.tsx†L163-L210】

**Paso 3: Revisar información complementaria**
- **Acción**: Lea los textos de “Documentación para preparar”, “Material adicional” y “Notas de la dirección”; abra los enlaces informativos si es necesario.
- **Ubicación**: Secciones inferiores de la tarjeta.
- **Datos requeridos**: Ninguno.
- **Validaciones**: Los enlaces se abren en una pestaña nueva para su consulta.【F:frontend-ecep/src/app/entrevista/page.tsx†L215-L255】
- **FOTO-ADJUNTA**: Lista de links bajo “Material adicional”.
- **Resultado esperado**: El usuario conoce los próximos pasos y materiales solicitados.

#### Mensajes del Sistema:
- ✅ **Éxito**: Alertas dentro de la tarjeta con mensajes de agradecimiento y la fecha confirmada.【F:frontend-ecep/src/app/entrevista/page.tsx†L163-L210】
- ❌ **Error**: “El enlace es inválido o está incompleto.”; “No pudimos registrar tu respuesta. Intentá nuevamente.”; “No se pudo cargar la solicitud”.【F:frontend-ecep/src/app/entrevista/page.tsx†L46-L94】【F:frontend-ecep/src/app/entrevista/page.tsx†L139-L144】
- ⚠️ **Advertencia**: “Si necesitás modificar tu respuesta, comunicate con la escuela…” una vez registrada la asistencia.【F:frontend-ecep/src/app/entrevista/page.tsx†L259-L266】

#### Casos Especiales:
- Si el usuario indica que no puede asistir, el sistema registra una solicitud de reprogramación y la institución enviará nuevas fechas; el mensaje lo informa explícitamente.【F:frontend-ecep/src/app/entrevista/page.tsx†L97-L108】

## 5. Preguntas Frecuentes
1. **¿Puedo completar la postulación en varios días?** Sí, el sistema guarda automáticamente un borrador en el navegador y permite retomarlo más tarde.【F:frontend-ecep/src/app/postulacion/page.tsx†L331-L383】【F:frontend-ecep/src/app/postulacion/page.tsx†L1396-L1413】
2. **¿Qué pasa si el DNI del aspirante ya se postuló?** No podrá continuar; aparecerá el mensaje de DNI duplicado y deberá contactar a la escuela para continuar el proceso.【F:frontend-ecep/src/app/postulacion/page.tsx†L1234-L1257】
3. **¿Es obligatorio autorizar comunicaciones?** Sí, sin esa confirmación el botón “Enviar Postulación” permanece deshabilitado.【F:frontend-ecep/src/app/postulacion/Step5.tsx†L84-L101】【F:frontend-ecep/src/app/postulacion/page.tsx†L1444-L1449】
4. **¿Cómo confirmo la entrevista si pierdo el correo?** Solicite a la escuela un nuevo enlace; sin el token el portal de entrevistas no puede cargar la solicitud.【F:frontend-ecep/src/app/entrevista/page.tsx†L46-L95】

## 6. Solución de Problemas
- **No puedo pasar del Paso 1**: Verifique que todos los campos obligatorios estén completos, que el DNI tenga entre 7 y 10 dígitos y que la fecha de nacimiento sea válida.【F:frontend-ecep/src/app/postulacion/page.tsx†L891-L949】
- **El botón “Siguiente” sigue deshabilitado en el Paso 2**: Asegúrese de tener al menos un familiar completo y que ninguna tarjeta muestre campos resaltados en rojo.【F:frontend-ecep/src/app/postulacion/page.tsx†L963-L1039】
- **Recibo un error al enviar la postulación**: Revise las fechas de nacimiento cargadas y la autorización de comunicaciones; el sistema detiene el envío si encuentra inconsistencias.【F:frontend-ecep/src/app/postulacion/page.tsx†L1087-L1194】
- **El portal de entrevistas indica enlace inválido**: Confirme que está usando el último correo enviado por la escuela; los enlaces caducados o incompletos generan ese mensaje y debe solicitar uno nuevo.【F:frontend-ecep/src/app/entrevista/page.tsx†L46-L66】
# Reportes

## 1. Introducción
La sección **Reportes** centraliza toda la información analítica académica y administrativa, permitiéndole exportar los datos visibles a PDF y navegar por cinco reportes temáticos (Boletines, Aprobación, Asistencias, Licencias y Actas) mediante pestañas horizontales.

## 2. Roles y Permisos
- **Directores y Administradores**: ven la entrada “Reportes” en el menú principal y pueden acceder sin restricciones.

- **Secretarías**: aunque no aparece la opción en el menú, tienen acceso directo a la página; cualquier otro rol es redirigido al panel general.

## 3. Acceso a la Sección
### Paso 1: Abrir la sección
- **Acción**: Desde el panel principal, seleccione la opción **Reportes** del menú lateral o acceda directamente a `/dashboard/reportes`.
- **FOTO-ADJUNTA**: Captura del menú lateral con la opción “Reportes” resaltada.
- **Resultado esperado**: Se muestra la página de Reportes con el encabezado y las pestañas disponibles.

## 4. Funcionalidades

### 4.1 Exportar PDF General
**Descripción**: Genera un PDF con la información mostrada en la pestaña activa.
**Ubicación**: Botón “Exportar PDF” en la esquina superior derecha de la página.

#### Procedimiento:
**Paso 1: Verificar pestaña y datos**
- **Acción**: Confirme que la pestaña activa contiene la información que desea exportar.
- **Ubicación**: Barra de pestañas debajo del encabezado.
- **Datos requeridos**: N/A.
- **Validaciones**: Los datos deben estar cargados; si no hay información, la exportación mostrará un error.
- **FOTO-ADJUNTA**: Vista general de la pestaña seleccionada con datos visibles.
- **Resultado esperado**: Los datos deseados están visibles antes de exportar.

**Paso 2: Iniciar exportación**
- **Acción**: Haga clic en **Exportar PDF**.
- **Ubicación**: Botón con icono de descarga junto al título.
- **Datos requeridos**: N/A.
- **Validaciones**: El botón cambia a “Generando…” mientras se procesa.
- **FOTO-ADJUNTA**: Botón “Exportar PDF” mostrando el estado “Generando…”.
- **Resultado esperado**: Se descarga un archivo PDF o aparece un mensaje de error si no hay datos exportables.

#### Mensajes del Sistema:
- ✅ **Éxito**: “PDF generado correctamente.”
- ❌ **Error**: “No se pudo generar el documento PDF.” o mensaje específico del error.

#### Casos Especiales:
- Si la pestaña no tiene datos, se muestra “No encontramos datos para exportar” y la descarga se cancela.

---

### 4.2 Reporte de Boletines
**Descripción**: Consulta el rendimiento académico por sección y genera resúmenes individuales.
**Ubicación**: Pestaña **Boletines**.

#### Procedimiento:
**Paso 1: Elegir sección**
- **Acción**: Seleccione una sección en el listado desplegable.
- **Ubicación**: Selector “Sección” dentro de la tarjeta principal.
- **Datos requeridos**: N/A.
- **Validaciones**: El selector se deshabilita si la información está cargando o no hay secciones disponibles.
- **FOTO-ADJUNTA**: Tarjeta “Reporte de Boletines” con el selector abierto mostrando secciones.
- **Resultado esperado**: Se muestran tarjetas de alumnos o mensajes informativos si no hay datos.

**Paso 2: Abrir detalle de alumno**
- **Acción**: Haga clic sobre la tarjeta del alumno que desea revisar.
- **Ubicación**: Rejilla de tarjetas listada tras seleccionar la sección.
- **Datos requeridos**: N/A.
- **Validaciones**: Si no hay alumnos, aparece el mensaje correspondiente.
- **FOTO-ADJUNTA**: Tarjeta de alumno resaltada con el mensaje “Click para ver boletín completo”.
- **Resultado esperado**: Se abre un panel lateral con el detalle del alumno.

**Paso 3: Revisar y/o imprimir resumen**
- **Acción**: Analice promedios, asistencia y materias; oprima “Imprimir resumen” si necesita descargar el PDF.
- **Ubicación**: Panel lateral (Sheet) del alumno.
- **Datos requeridos**: N/A.
- **Validaciones**: El botón se deshabilita mientras se genera el PDF.
- **FOTO-ADJUNTA**: Panel lateral mostrando datos del alumno y el botón “Imprimir resumen”.
- **Resultado esperado**: Visualiza la información organizada y, al imprimir, se genera el PDF individual.

#### Mensajes del Sistema:
- ✅ **Éxito**: “Resumen del boletín listo para imprimir.”
- ❌ **Error**: “No se pudo generar el resumen del boletín.” o mensaje del error real.
- ⚠️ **Advertencia**: Dentro del componente aparecen mensajes informativos como “No hay calificaciones registradas…” o “Elegí una sección…” cuando falta información.

#### Casos Especiales:
- Si la lista de secciones está vacía, se muestra “No hay secciones disponibles” y el selector queda inhabilitado.
- Los informes de nivel secundario (sin boletín) muestran bloques de texto en lugar de materias.

---

### 4.3 Reporte de Aprobación
**Descripción**: Resume la situación de aprobación de materias en nivel primario y permite analizar por sección y alumno.
**Ubicación**: Pestaña **Aprobación**.

#### Procedimiento:
**Paso 1: Revisar indicadores generales**
- **Acción**: Observe las tarjetas superiores (gráficos y cifras clave).
- **Ubicación**: Parte superior de la pestaña.
- **Datos requeridos**: N/A.
- **Validaciones**: Si no hay calificaciones cargadas, se muestra el mensaje “No hay calificaciones registradas…” en lugar del gráfico.
- **FOTO-ADJUNTA**: Tarjetas de indicadores con el gráfico circular y los contadores.
- **Resultado esperado**: Conocer materias aprobadas vs desaprobadas, materias conflictivas y alumnos con pendientes.

**Paso 2: Seleccionar sección**
- **Acción**: Haga clic en una tarjeta de sección para activar el análisis detallado.
- **Ubicación**: Rejilla “Selecciones”.
- **Datos requeridos**: N/A.
- **Validaciones**: Al hacer clic, la tarjeta queda resaltada.
- **FOTO-ADJUNTA**: Tarjetas de secciones mostrando aprobadas/desaprobadas con una seleccionada.
- **Resultado esperado**: Se habilita el panel con gráfico y tabla de alumnos para esa sección.

**Paso 3: Ordenar detalle por alumno**
- **Acción**: Use el selector “Ordenar por” para cambiar el criterio (Nombre, Promedio, Materias desaprobadas).
- **Ubicación**: Parte superior derecha de la tarjeta “Detalle por alumno”.
- **Datos requeridos**: N/A.
- **Validaciones**: El selector requiere que haya una sección activa.
- **FOTO-ADJUNTA**: Tabla detallada mostrando los encabezados y el selector desplegado.
- **Resultado esperado**: La tabla se reordena según el criterio elegido.

#### Mensajes del Sistema:
- ⚠️ **Advertencia**: “No encontramos secciones…” cuando no hay datos cargados.
- ⚠️ **Advertencia**: “Seleccioná una sección para ver el detalle específico.” cuando aún no se eligió ninguna.

#### Casos Especiales:
- El selector de nivel muestra “Inicial (no disponible)” deshabilitado, informando que solo se trabaja con Primario.

---

### 4.4 Reporte de Asistencias
**Descripción**: Analiza el presentismo de alumnos por período y secciones, con gráficos y tablas detalladas.
**Ubicación**: Pestaña **Asistencias**.

#### Procedimiento:
**Paso 1: Definir rango de fechas**
- **Acción**: Seleccione fechas “Desde” y “Hasta”.
- **Ubicación**: Primer fila de filtros.
- **Datos requeridos**: Fechas válidas.
- **Validaciones**: El sistema ajusta automáticamente el rango para evitar inconsistencias (si el inicio supera al fin y viceversa).
- **FOTO-ADJUNTA**: Campos de fecha mostrando calendario y validación.
- **Resultado esperado**: Se actualizan los datos al rango establecido.

**Paso 2: Elegir secciones**
- **Acción**: Abra el selector “Seleccionar secciones”, busque si es necesario y marque las secciones.
- **Ubicación**: Botón con ícono de lupa en los filtros.
- **Datos requeridos**: N/A.
- **Validaciones**: No permite quedar sin secciones seleccionadas mediante la interacción principal.
- **FOTO-ADJUNTA**: Popover de secciones con el buscador y checkboxes.
- **Resultado esperado**: Se actualizan los gráficos y tablas con las secciones elegidas.

**Paso 3: Interpretar resultados**
- **Acción**: Revise los gráficos por nivel y las tablas detalladas por sección y alumno.
- **Ubicación**: Tarjetas debajo de los filtros.
- **Datos requeridos**: N/A.
- **Validaciones**: Los gráficos muestran porcentajes y las tablas incluyen cálculo del % de asistencia.
- **FOTO-ADJUNTA**: Tarjeta de sección con tabla y gráfico de barras.
- **Resultado esperado**: Comprender la asistencia promedio por nivel y sección, con comparativas por alumno.

#### Mensajes del Sistema:
- ✅ **Éxito**: Visualización de gráficos y tablas según filtros.
- ❌ **Error**: Mensaje en recuadro rojo si la consulta falla (“{attendanceError}”).
- ⚠️ **Advertencia**: 
  - “Cargando asistencia…” mientras se recuperan datos.
  - “No encontramos registros de asistencia…” si no hay resultados.

#### Casos Especiales:
- El selector de secciones incluye buscador y muestra nivel asociado para diferenciar cursos con nombres similares.
- Los gráficos de pastel muestran ausentismo vs asistencia calculados dinámicamente.

---

### 4.5 Reporte de Licencias
**Descripción**: Resume el estado de licencias del personal y ofrece un filtrado detallado por docente, tipo, justificación y período.
**Ubicación**: Pestaña **Licencias**.

#### Procedimiento:
**Paso 1: Revisar resumen general**
- **Acción**: Observe las tarjetas superiores con totales de personal, activos y licencias.
- **Ubicación**: Parte superior de la pestaña.
- **Datos requeridos**: N/A.
- **Validaciones**: El indicador “Licencias registradas” muestra “—” si los datos aún cargan.
- **FOTO-ADJUNTA**: Cuatro tarjetas del resumen con iconos representativos.
- **Resultado esperado**: Tener una visión general inmediata del estado del personal.

**Paso 2: Analizar distribución de licencias**
- **Acción**: Revise el gráfico circular, contadores de licencias activas y próximas a vencer, y la lista de tipos frecuentes.
- **Ubicación**: Tarjeta “Resumen de licencias”.
- **Datos requeridos**: N/A.
- **Validaciones**: Muestra mensajes específicos cuando no hay datos o ocurre un error.
- **FOTO-ADJUNTA**: Gráfico circular y recuadros de totales.
- **Resultado esperado**: Identificar tendencias por tipo de licencia y fechas próximas.

**Paso 3: Filtrar detalle por docente**
- **Acción**: Complete los filtros (búsqueda, docente, tipo, justificación y rango de fechas) y observe la tabla resultante.
- **Ubicación**: Tarjeta “Detalle de licencias por docente”.
- **Datos requeridos**: Palabras clave y/o selecciones de lista; fechas opcionales.
- **Validaciones**: Los selectores se deshabilitan si no hay opciones; las fechas se ajustan para mantener coherencia.
- **FOTO-ADJUNTA**: Filtros desplegados y tabla con resultados.
- **Resultado esperado**: Visualizar las licencias filtradas, incluyendo estado, duración y justificación.

#### Mensajes del Sistema:
- ✅ **Éxito**: Tabla poblada con las licencias filtradas.
- ❌ **Error**: Mensaje rojo “{licenseError}” cuando ocurre un fallo de carga.
- ⚠️ **Advertencia**:
  - “Cargando licencias…” mientras se procesan los datos.
  - “No encontramos licencias…” o “No se encontraron licencias con los criterios seleccionados.” según corresponda.

#### Casos Especiales:
- El filtro de “Docente” se deshabilita si aún no se recuperaron las opciones disponibles.
- Las columnas “Estado” combinan dos etiquetas: situación temporal (Activa, Próxima a vencer, Finalizada) y justificación (Justificada/Sin justificar).

---

### 4.6 Reporte de Actas
**Descripción**: Permite filtrar, consultar y exportar actas de accidentes escolares.
**Ubicación**: Pestaña **Actas**.

#### Procedimiento:
**Paso 1: Configurar filtros**
- **Acción**: Defina rango de fechas, nivel, sección y/o alumno desde el panel de filtros.
- **Ubicación**: Columna izquierda dentro de la tarjeta principal.
- **Datos requeridos**: Fechas válidas, selección de nivel y sección opcional, texto de búsqueda.
- **Validaciones**: Las fechas se reajustan para mantener un rango válido; la sección solo se habilita si hay actas.
- **FOTO-ADJUNTA**: Panel de filtros con selectores y campos completados.
- **Resultado esperado**: Se actualiza el conteo de actas encontradas y la lista de resultados.

**Paso 2: Revisar listado**
- **Acción**: Explore las tarjetas de actas que coinciden con los filtros.
- **Ubicación**: Columna derecha de la tarjeta principal.
- **Datos requeridos**: N/A.
- **Validaciones**: El contador muestra “—” mientras cargan los datos; si no hay coincidencias, aparece un mensaje informativo.
- **FOTO-ADJUNTA**: Lista de actas con fecha, hora y estado de firma.
- **Resultado esperado**: Identificar rápidamente la información clave de cada acta.

**Paso 3: Abrir y exportar acta**
- **Acción**: Haga clic en una tarjeta para abrir el detalle; use “Imprimir Acta” para descargar el PDF.
- **Ubicación**: Diálogo emergente (modal) tras seleccionar una acta.
- **Datos requeridos**: N/A.
- **Validaciones**: El botón de impresión se deshabilita mientras se genera el PDF.
- **FOTO-ADJUNTA**: Modal con los datos completos del acta y el botón “Imprimir Acta”.
- **Resultado esperado**: Visualizar todos los campos registrados y obtener el PDF individual.

#### Mensajes del Sistema:
- ✅ **Éxito**: “Acta exportada en PDF.” al generar el documento.
- ❌ **Error**: “No se pudo generar el PDF del acta.” u otro mensaje derivado del error.
- ⚠️ **Advertencia**:
  - “Cargando actas…” durante la carga.
  - “No encontramos actas con los criterios seleccionados.” cuando no hay resultados.

#### Casos Especiales:
- El panel de filtros incluye selector dinámico de secciones basado en las actas disponibles; si se eliminan actas de una sección, ésta se desactiva automáticamente en el filtro.
- El diálogo presenta información adicional (DNI, familiar responsable, descripción y acciones realizadas) para facilitar la revisión completa antes de imprimir.

## 5. Preguntas Frecuentes
1. **¿Por qué no veo la opción “Reportes” en el menú?**  
   Solo Directores y Administradores la tienen visible; Secretarías deben acceder mediante enlace directo.

2. **¿Qué periodo se muestra en los reportes?**  
   Todos los datos se basan en el período escolar activo seleccionado en el sistema.

3. **¿Puedo exportar varios reportes a la vez?**  
   No. El botón “Exportar PDF” genera únicamente el reporte de la pestaña activa.

4. **¿Qué hacer si un gráfico muestra “Sin datos”?**  
   Revise filtros y asegúrese de que existan registros cargados; el mensaje indica ausencia de información disponible en esa combinación.

## 6. Solución de Problemas
- **La exportación genera un error**: Verifique que la pestaña activa tenga datos y vuelva a intentar; si persiste, contacte al área técnica con el mensaje mostrado en pantalla.

- **No aparecen secciones/alumnos**: Espere a que finalice la carga (mensaje “Cargando…”). Si el mensaje permanece, puede deberse a falta de registros en el período activo.

- **Los filtros de fechas se invierten**: El sistema ajusta automáticamente el rango; revise y vuelva a seleccionar si necesita un período diferente.

- **No se listan docentes en Licencias**: Espere a que carguen los datos del personal; si el selector continúa deshabilitado, puede no haber licencias asociadas a docentes en el período consultado.

- **No se muestran actas tras filtrar**: Amplíe el rango de fechas, borre el texto de búsqueda o seleccione “Todas” las secciones; el mensaje informativo confirma que no hay resultados con los criterios actuales.
