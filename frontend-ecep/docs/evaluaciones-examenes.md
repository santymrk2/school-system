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
