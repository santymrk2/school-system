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
