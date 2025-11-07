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
