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
