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



