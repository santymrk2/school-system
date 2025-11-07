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
