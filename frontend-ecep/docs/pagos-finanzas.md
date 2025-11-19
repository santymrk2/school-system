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
