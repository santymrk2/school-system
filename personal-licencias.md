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
