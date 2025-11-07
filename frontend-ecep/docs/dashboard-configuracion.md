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
