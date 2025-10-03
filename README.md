Propuesta Tecnica:

[**1\. Introducción 5**](#introducción)

[**2\. Alcance 5**](#alcance)

[**3\. Desarrollo 6**](#desarrollo)

[Módulo 1: Gestión de Alumnos 7](#módulo-1:-gestión-de-alumnos)

[Ingreso de aspirantes 7](#ingreso-de-aspirantes)

[1\. Formulario de Postulación 7](#1.-formulario-de-postulación)

[Información a completar: 7](#información-a-completar:)

[2\. Revisión desde Dirección 8](#2.-revisión-desde-dirección)

[3\. Entrevista 9](#3.-entrevista)

[Alta de alumnos manual: 10](#alta-de-alumnos-manual:)

[Gestión del familia del alumno 11](#gestión-del-familia-del-alumno)

[Bajas de alumnos: 12](#bajas-de-alumnos:)

[Accesos por Perfil 13](#accesos-por-perfil)

[Módulo 2: Comunicación 16](#módulo-2:-comunicación)

[Chats Privados 16](#chats-privados)

[Comunicaciones Generales (Inicio) 17](<#comunicaciones-generales-(inicio)>)

[Creación de Comunicaciones 17](#creación-de-comunicaciones)

[Accesos por perfil 18](#accesos-por-perfil-1)

[Módulo 3: Evaluaciones 20](#módulo-3:-evaluaciones)

[Nivel Primario – Funcionalidades para Docentes 20](#nivel-primario-–-funcionalidades-para-docentes)

[Nivel Primario – Funcionalidades para Alumnos y Familias 21](#nivel-primario-–-funcionalidades-para-alumnos-y-familias)

[Nivel Inicial – Funcionalidades para Docentes 22](#nivel-inicial-–-funcionalidades-para-docentes)

[Nivel Inicial – Funcionalidades para Familias 22](#nivel-inicial-–-funcionalidades-para-familias)

[Accesos por perfil 22](#accesos-por-perfil-2)

[Módulo 4: Asistencia 24](#módulo-4:-asistencia)

[Funcionalidades para Docentes 24](#funcionalidades-para-docentes)

[Funcionalidades para Familias y Alumnos 25](#funcionalidades-para-familias-y-alumnos)

[Funcionalidades para Dirección 25](#funcionalidades-para-dirección)

[Accesos por Perfil 27](#accesos-por-perfil-3)

[Módulo 5: Gestión de Personal 28](#módulo-5:-gestión-de-personal)

[Acceso y Estructura General 28](#acceso-y-estructura-general)

[Alta de Personal 28](#alta-de-personal)

[Datos Personales: 28](#datos-personales:)

[Información de Contacto: 29](#información-de-contacto:)

[Datos Laborales: 29](#datos-laborales:)

[Formación Académica: 29](#formación-académica:)

[Otros campos relevantes: 30](#otros-campos-relevantes:)

[Listado y Consulta de Personal 30](#listado-y-consulta-de-personal)

[Gestión de Licencias 30](#gestión-de-licencias)

[Accesos por Perfil 31](#accesos-por-perfil-4)

[Módulo 6: Actas de Accidentes 32](#módulo-6:-actas-de-accidentes)

[Acceso y Visibilidad 32](#acceso-y-visibilidad)

[Creación y Registro de Actas 33](#creación-y-registro-de-actas)

[Restricciones y Edición 34](#restricciones-y-edición)

[Asociación y Reportes 34](#asociación-y-reportes)

[Accesos por Perfil 35](#accesos-por-perfil-5)

[Módulo 7: Matrícula, Cuotas y Pagos 36](#módulo-7:-matrícula,-cuotas-y-pagos)

[Funcionalidades para Familias 36](#funcionalidades-para-familias)

[Funcionalidades para Administración 37](#funcionalidades-para-administración)

[Funcionalidades para Docentes (Personal) 38](<#funcionalidades-para-docentes-(personal)>)

[Accesos por Perfil 38](#accesos-por-perfil-6)

[Módulo 8: Login 39](#módulo-8:-login)

[Flujo del formulario 39](#flujo-del-formulario)

[1\. Ingreso y validación del correo electrónico 39](#ingreso-y-validación-del-correo-electrónico)

[2\. Ingreso de contraseña 40](#ingreso-de-contraseña)

[Validaciones de la contraseña 40](#validaciones-de-la-contraseña)

[Módulo 9: Reportes 41](#módulo-9:-reportes)

[Reporte de boletines 41](#reporte-de-boletines)

[Reporte de alumnos aprobados y desaprobados 43](#reporte-de-alumnos-aprobados-y-desaprobados)

[Reporte de asistencias de alumnos 44](#reporte-de-asistencias-de-alumnos)

[Reporte de inasistencias de profesores 46](#reporte-de-inasistencias-de-profesores)

[Reporte de actas 46](#reporte-de-actas)

[**4\. Entregables 49**](#entregables)

1. # Introducción {#introducción}

Contexto y objetivos. El informe basa gran parte de su interés en la comunicación entre los distintos implicados del sistema, por lo que habrá un fuerte interés en facilitar información a las partes de manera automática y de manera clara, eliminando algunos “pasamanos” que se encuentran en el mismo sistema.

2. # Alcance {#alcance}

   El proyecto incluye la gestión general de los alumnos, desde la asistencia, hasta las notas, las cuotas y la comunicación entre familias. Por otro lado, no entran algunos casos específicos por temas legales, por ejemplo la comunicación no puede ser hecha completamente vía este sistema, porque es necesario un cuaderno de comunicaciones. Además el boletín debe ser escrito a mano y otras firmas que no serán realizadas por este sistema, sino que el sistema se encargará de imprimir, para luego ser firmada y guardada.

Por otro lado, actualmente el sistema no contempla una automatización del pago de los sueldos de los docentes, pero si se realiza el conteo de las horas y de las licencias realizadas para una mayor velocidad de esto para la administración.

3. # Desarrollo {#desarrollo}

   El enfoque se basará sobre todo en la mejor comunicación de información y eliminar las tareas duplicadas que existen como así también la veracidad de los datos guardados.

   Las tecnologías a utilizar son un backend con PostgreSQL, Spring Boot con Java que permitirá tener un acceso API Rest a ciertos datos y a otros datos se accede vía WebHooks por ejemplo para poder comunicar distintas notificaciones de la misma.

Por el lado del frontend se utilizara Astro con algunos componentes en React y todo estilizado con Tailwind CSS. Esto se realizará gracias a los servicios REST de Spring Boot y a los WebHooks.

    Los módulos a desarrollar serán los siguientes:

- Módulo 1: Gestión de Alumnos
- Módulo 2: Comunicación
- Módulo 3: Evaluaciones
- Módulo 4: Asistencia
- Módulo 5: Gestión de Personal
- Módulo 6: Actas de Accidentes
- Módulo 7: Matrícula, Cuotas y Pagos
- Módulo 8: Login
- Módulo 9: Reportes

## Módulo 1: Gestión de Alumnos {#módulo-1:-gestión-de-alumnos}

### Ingreso de aspirantes {#ingreso-de-aspirantes}

#### 1\. Formulario de Postulación {#1.-formulario-de-postulación}

La postulación se realiza a través de un formulario digital que deberá ser completado por el aspirante o su familia. Este formulario se compone de distintos campos que se completan uno por uno y cuyos datos se almacenan localmente, permitiendo continuar el trámite en otro momento.

##### Información a completar: {#información-a-completar:}

Datos del Aspirante

- Nombre y apellido
- DNI
- Fecha de nacimiento
- Curso solicitado (Primario o Sala Inicial)
- Turno preferido
- Escuela actual
- Domicilio completo
- Nacionalidad

Datos Familiares

- Información completa del padre, madre o tutor: nombre y apellido, DNI, teléfono, email, domicilio, profesión y lugar de trabajo
- Posibilidad de agregar un segundo tutor
- Relación con el aspirante (vive o no con el alumno)

Condiciones del Hogar

- Tipo de conectividad a Internet
- Dispositivos disponibles para la escolaridad
- Idiomas hablados en el hogar

Salud

- Enfermedades o alergias
- Medicación habitual
- Limitaciones físicas o neurológicas
- Tratamientos terapéuticos en curso
- Uso de ayudantes de movilidad
- Cobertura médica
- Observaciones adicionales

Una vez completado el formulario, se presenta una pantalla de confirmación donde se solicita validar que los datos ingresados son correctos y se solicita autorización para recibir comunicaciones por correo electrónico. Luego, se envía un email con un resumen de la información proporcionada y se informa que el resultado de la postulación será comunicado en los próximos días.

#### 2\. Revisión desde Dirección {#2.-revisión-desde-dirección}

Desde el área de Dirección, se accede a la sección "Aspirantes" del menú, donde se lista cada solicitud recibida. En la lista figuran:

- Nombre y apellido del aspirante
- Curso al que se postula
- Estado de la solicitud
- Disponibilidad en el curso

Al seleccionar una solicitud, se despliega la información completa del aspirante, y al final se presentan dos opciones:

- Rechazar  
   Al hacer clic, se abre un modal para escribir el motivo del rechazo. Luego, se envía un correo electrónico al aspirante informando que no fue aceptado. Existe también la posibilidad de que las solicitudes se rechacen automáticamente tras un tiempo determinado.
- Programar una cita  
   Al seleccionar esta opción, se abre un calendario para elegir dos fechas tentativas para que la familia asista a una entrevista. Una vez confirmadas, se envía un email con:
  - Documentación requerida para presentar
  - Archivos PDF con información institucional

La familia tiene un plazo de 15 días para responder indicando qué fecha le resulta conveniente. Si ninguna opción es viable, la Dirección podrá reprogramar la cita. El estado de la solicitud se actualizará según corresponda.

#### 3\. Entrevista {#3.-entrevista}

Una vez seleccionada la fecha, se actualiza la vista de los directivos mostrando el horario y fecha aceptados, y se procede con la entrevista.

Después de la fecha agendada, al ingresar a la solicitud, se mostrará un modal preguntando si la entrevista se realizó:

- Si no se realizó, se podrá reprogramar o rechazar la solicitud.
- Si se realizó, se habilita el acceso a la solicitud con normalidad, y antes de los datos se muestran dos botones:
  - Aceptar
  - Rechazar

Al seleccionar una opción, se pide confirmación y se envía el correspondiente correo electrónico notificando la aceptación o rechazo de la postulación.

### Alta de alumnos manual: {#alta-de-alumnos-manual:}

El sistema permitirá a los usuarios con perfil directivo realizar el alta manual de alumnos, facilitando así la incorporación directa de estudiantes al sistema por parte de la institución. Esta funcionalidad está pensada para casos en los que, por diversos motivos, el aspirante no pueda completar el proceso de inscripción de forma autónoma.

Durante el alta manual, los directivos podrán ingresar toda la información requerida para registrar a un alumno. Los campos a completar serán los mismos que se solicitan en el proceso de alta realizado por los aspirantes a través del sistema. No obstante, la interfaz para los directivos mostrará los datos organizados y segmentados por secciones, replicando la estructura que se presenta en el formulario destinado a los aspirantes. Esta segmentación tiene como objetivo facilitar la carga ordenada y completa de los datos del alumno.

### Gestión del familia del alumno {#gestión-del-familia-del-alumno}

Dentro del sistema, los usuarios con perfil directivo podrán acceder a una lista completa de los alumnos registrados. Al seleccionar un alumno específico, se desplegará una vista detallada que incluirá no solo sus datos personales y académicos, sino también un apartado específico denominado “Familia”.

En esta sección se visualizarán los tutores o familiares registrados que estén vinculados al alumno. En caso de que no se haya asociado ningún familiar, se ofrecerá la posibilidad de hacerlo mediante un botón identificado como “Nuevo Familiar”.

Al seleccionar dicho botón, se abrirá una ventana modal en la cual el directivo podrá ingresar la información correspondiente al nuevo familiar. Los datos requeridos en este formulario serán los siguientes:

- Nombre y apellido
- Documento Nacional de Identidad (DNI)
- Correo electrónico
- Teléfono de contacto
- Domicilio
- Lugar de trabajo
- Ocupación
- Relación con el alumno

La incorporación de esta funcionalidad permite mantener actualizada y centralizada la información familiar de cada alumno, lo cual resulta esencial para establecer vías de contacto formales y seguras entre la institución educativa y el entorno familiar del estudiante.

### Bajas de alumnos: {#bajas-de-alumnos:}

El sistema contemplará un procedimiento formal para la baja de alumnos, disponible exclusivamente para los usuarios con perfil directivo. Dentro del perfil de cada alumno, existirá una pestaña denominada “Avanzado”, accesible solo por directivos autorizados. En esta sección, se encontrará un botón identificado como “Eliminar Alumno”.

Al seleccionar este botón, el estado del mismo cambiará a “En espera de respuesta”, lo que activará automáticamente el envío de una notificación al área de administración. Esta notificación solicitará una verificación del estado del alumno respecto a posibles deudas u obligaciones pendientes con la institución.

El área de administración contará con una pestaña específica llamada “Bajas”, donde se listarán todos los pedidos de baja pendientes. Cada solicitud mostrará el nombre del alumno involucrado y ofrecerá dos opciones de acción: Aceptar o Rechazar.

- En caso de rechazo, el sistema requerirá que se ingrese un motivo obligatorio por parte del personal administrativo.

- En ambos casos (aceptación o rechazo), se generará una notificación automática al área directiva, y la decisión será reflejada visiblemente en la parte superior del perfil del alumno correspondiente.

Cuando una solicitud de baja sea aceptada, el sistema permitirá la descarga de un resumen con los datos completos del alumno, en un formato apto para impresión y archivo físico o digital. A su vez, el sistema procederá con la baja efectiva del alumno en todas las secciones correspondientes, desactivando su disponibilidad para procesos administrativos y académicos futuros.

Finalmente, el sistema contará con una pestaña general denominada “Historial”, accesible para usuarios administrativos y directivos, donde se almacenará un registro completo de todos los alumnos que hayan egresado (por finalización del nivel primario) o que hayan sido dados de baja formalmente. Este historial funcionará como archivo institucional y servirá de respaldo ante eventuales consultas o auditorías.

### Accesos por Perfil {#accesos-por-perfil}

**Dirección:**

- Acceso completo a la sección Aspirantes para visualizar y gestionar todas las postulaciones recibidas.
- Revisión detallada de cada solicitud, con acceso a todos los datos del aspirante y su familia.
- Capacidad para rechazar solicitudes, incluyendo la posibilidad de enviar motivos y notificaciones automáticas por correo electrónico.
- Programación y gestión de citas para entrevistas, con envío automático de correos con documentación requerida y opciones de reprogramación.
- Registro del resultado de la entrevista, con opciones para aceptar o rechazar la postulación y notificación automática a las familias.
- Alta manual de alumnos con ingreso completo y segmentado de datos, replicando el formulario de postulación para facilitar la carga.
- Gestión completa de la información familiar vinculada a cada alumno, con posibilidad de agregar, editar o eliminar familiares.
- Acceso a la pestaña Avanzado para realizar la baja formal de alumnos, con notificaciones automáticas a administración y seguimiento del estado de la baja.
- Visualización y gestión del historial completo de bajas y egresos dentro del sistema.

**Administración:**

- Acceso a la pestaña Bajas para recibir y gestionar solicitudes de baja enviadas por Dirección.
- Capacidad para aceptar o rechazar solicitudes, debiendo ingresar motivos obligatorios en caso de rechazo.
- Recepción automática de notificaciones sobre cambios en el estado de solicitudes y actualización visible en el perfil del alumno.
- Acceso a la pestaña Historial para consultar registros de alumnos dados de baja o egresados como archivo institucional.

**Familias:**

- Acceso exclusivo al formulario digital de postulación para completar la inscripción inicial del aspirante.
- Posibilidad de guardar el avance del formulario localmente y continuar la postulación en otro momento.
- Recepción de correos electrónicos con resumen de la postulación y notificaciones del estado de la solicitud.
- Participación en la confirmación de citas para entrevistas mediante respuesta a fechas propuestas.

**Docentes:**

- Sin acceso al módulo de ingreso de aspirantes ni a la gestión de postulaciones, altas o bajas.
- (Se podría considerar acceso limitado a reportes específicos si el diseño futuro lo requiere, pero actualmente no tienen interacción directa con este módulo).

## Módulo 2: Comunicación {#módulo-2:-comunicación}

El sistema incorporará un módulo de comunicación interno que permitirá mantener un canal directo y ordenado entre los distintos actores de la comunidad educativa (alumnos, docentes, directivos y personal administrativo). Este módulo estará dividido en dos secciones principales: Chats e Inicio.

### Chats Privados {#chats-privados}

La sección “Chats” funcionará como un sistema de mensajería individual. Tendrá una interfaz dividida en dos columnas principales:

- Columna izquierda: mostrará una lista de conversaciones activas, identificadas por el nombre de la persona con quien se ha intercambiado mensajes. En la parte superior de esta columna habrá un botón con el ícono “+”, que permitirá iniciar un nuevo chat. Al presionarlo, se desplegará una lista de usuarios habilitados para contactar, junto con un campo de búsqueda para facilitar su localización.
- Columna derecha: será el área de conversación. Los mensajes enviados por el usuario actual se mostrarán alineados a la derecha, mientras que los mensajes recibidos se ubicarán alineados a la izquierda, diferenciados visualmente para facilitar su lectura.

El sistema gestionará los permisos de mensajería según el perfil del usuario:

- Alumnos: podrán iniciar conversaciones únicamente con directivos, profesores o maestros que estén asignados a sus materias actuales.
- Personal docente y directivo: podrán comunicarse con otros miembros de la institución según las reglas de jerarquía y asignación establecidas por la institución.

### Comunicaciones Generales (Inicio) {#comunicaciones-generales-(inicio)}

Dentro del menú principal, existirá un apartado denominado “Inicio”. Esta sección tendrá un doble propósito:

- Mostrar publicaciones generales en formato de posteos institucionales dirigidos a toda la comunidad educativa.
- Presentar notificaciones específicas según el nivel o sección correspondiente del usuario logueado.

### Creación de Comunicaciones {#creación-de-comunicaciones}

Los perfiles de directivo y administración contarán con la posibilidad de crear nuevas comunicaciones generales desde esta misma sección (Inicio). Para ello, tendrán acceso a un botón exclusivo identificado como “Nuevo Comunicado”.

Al hacer clic en dicho botón, se abrirá un modal de creación, en el cual deberán completarse los siguientes campos:

- Título del comunicado
- Descripción o cuerpo del mensaje
- Tipo de comunicación, con tres opciones:
  - Institucional (dirigida a toda la comunidad educativa)
  - Por nivel (por ejemplo, nivel inicial o primario)
  - Por sección específica (una sala o grado en particular)

Según el tipo seleccionado, se desplegarán campos dinámicos para especificar el nivel o sección correspondiente.

Una vez completado el formulario, se presentarán dos botones: “Enviar” y “Cancelar”. Al presionar “Enviar”, aparecerá un modal de confirmación solicitando validación final del usuario para asegurar que desea proceder con la publicación. Si se confirma, el comunicado se hará visible de inmediato en la sección correspondiente de los usuarios destinatarios.

Este módulo tiene como objetivo mejorar la fluidez de la comunicación institucional, brindar canales privados organizados y ofrecer una vía formal y accesible para la difusión de información relevante en el ámbito escolar.

### Accesos por perfil {#accesos-por-perfil-1}

- **Directivos**
  - Envío de comunicaciones institucionales, por nivel o por sección.
  - Seguimiento de la lectura y recepción de los comunicados.
  - Acceso completo a la mensajería privada con cualquier miembro de la comunidad educativa.
- **Docentes**
  - Recepción de comunicaciones generales.
  - Acceso a la mensajería privada con directivos, otros docentes y estudiantes asignados a sus cursos.
- **Alumnos**
  - Recepción de comunicaciones generales o específicas según su nivel o sección.
  - Acceso a la mensajería privada exclusivamente con directivos, profesores o maestros asignados.
- **Familias / Tutores**
  - Recepción de comunicaciones generales y específicas relacionadas con sus hijos.
  - Confirmación de lectura de comunicados cuando sea requerido.
  - Acceso a la mensajería privada con directivos y docentes responsables del curso del alumno.

**Administración**

- Envío de comunicaciones administrativas generales o dirigidas a niveles/secciones específicas.
  - Seguimiento de estado de lectura.
  - Acceso a la mensajería privada con otros perfiles institucionales según su función.

## Módulo 3: Evaluaciones {#módulo-3:-evaluaciones}

El sistema incluirá un módulo específico para la gestión de evaluaciones académicas, adaptado tanto a los niveles inicial como primario. Este módulo permitirá la carga, edición, visualización y seguimiento de evaluaciones de los estudiantes, con funcionalidades diferenciadas según el perfil del usuario.

### Nivel Primario – Funcionalidades para Docentes {#nivel-primario-–-funcionalidades-para-docentes}

Los docentes del nivel primario (ya sean maestros de grado o profesores de materias específicas) tendrán acceso a una grilla organizada por secciones, donde visualizarán únicamente aquellas asignadas a su cargo.

Al seleccionar una sección, se desplegará un listado de exámenes asociados, cada uno con los siguientes datos:

- Fecha del examen
- Título
- Período o trimestre al que pertenece

Al ingresar a un examen específico, se mostrará el listado completo de alumnos de la sección con los siguientes campos:

- Nombre y apellido del alumno
- Nota obtenida
- Observación del docente

Estos campos podrán ser editados libremente por el docente, excepto en los casos en los que el examen corresponda a un trimestre ya cerrado, en cuyo caso la edición quedará bloqueada, aunque la información seguirá siendo visible.

Asimismo, dentro de cada materia se ofrecerá la posibilidad de crear un nuevo examen, mediante un botón identificado como “Nuevo Examen”. Al seleccionarlo, se abrirá un modal de carga, donde el docente deberá:

- Ingresar la fecha del examen
- Describir brevemente los temas evaluados

Cada examen será asociado automáticamente al trimestre correspondiente según la fecha. Los docentes también podrán asignar una nota final por trimestre seleccionando el nombre del período (por ejemplo, “Trimestre 1”) desde la misma interfaz.

### Nivel Primario – Funcionalidades para Alumnos y Familias {#nivel-primario-–-funcionalidades-para-alumnos-y-familias}

Tanto los alumnos como sus familias podrán acceder a esta sección del sistema.

- En el caso de los alumnos, al ingresar visualizarán una lista de materias en las que están inscriptos. Al seleccionar una materia, se desplegará:
  - Nombre del docente responsable
  - Lista de exámenes realizados y por realizar
  - Calificaciones y observaciones asociadas
- Las familias, por su parte, deberán primero seleccionar al hijo/a que deseen consultar (en caso de tener más de uno). Una vez hecho esto, accederán a la misma visualización de materias, exámenes y calificaciones, con la posibilidad de hacer seguimiento académico en tiempo real.

### Nivel Inicial – Funcionalidades para Docentes {#nivel-inicial-–-funcionalidades-para-docentes}

Los docentes del nivel inicial accederán a una interfaz distinta, más orientada al seguimiento pedagógico integral. Al ingresar, podrán seleccionar la sala o grado a su cargo y, dentro de ella, elegir un alumno. Una vez seleccionado, se desplegarán tres recuadros, uno por trimestre, correspondientes a los informes de desarrollo del alumno.

Al hacer clic en un recuadro correspondiente a un trimestre activo, se abrirá un modal de edición donde la docente podrá redactar una descripción del desarrollo observado del alumno en ese período.

- Una vez finalizado el trimestre, el informe correspondiente quedará bloqueado para su edición, pasando a un estado de solo lectura.
- Estos informes no serán visibles para las familias hasta que se haya alcanzado la fecha oficial de cierre del trimestre.

### Nivel Inicial – Funcionalidades para Familias {#nivel-inicial-–-funcionalidades-para-familias}

Las familias con hijos en el nivel inicial también podrán acceder a esta sección. Una vez dentro, y tras seleccionar al hijo correspondiente, se mostrará el informe del trimestre si este ya ha sido publicado por la docente tras el cierre del período.

### Accesos por perfil {#accesos-por-perfil-2}

- **Docentes / Profesores (Primario)**
  - Acceso a las materias y secciones asignadas
  - Creación, edición y carga de exámenes y calificaciones
  - Asignación de notas finales por trimestre
  - Edición de observaciones individuales por alumno
  - Bloqueo automático de edición al cierre del trimestre
- **Docentes (Inicial)**
  - Acceso por sala y alumnos asignados
  - Redacción de informes descriptivos por trimestre
  - Edición habilitada hasta la fecha de cierre del período
  - Visualización posterior en modo solo lectura
- **Alumnos**
  - Consulta de materias y docentes asignados
  - Visualización de exámenes realizados y programados
  - Acceso a calificaciones y observaciones
- **Familias / Tutores**
  - Visualización del rendimiento académico por cada hijo/a
  - Acceso a materias, notas, observaciones (primario)
  - Consulta de informes descriptivos trimestrales (inicial)
- **Directivos**
  - Acceso global a todos los exámenes e informes
  - Supervisión de la carga de evaluaciones por parte de los docentes
  - Validación y revisión general de los datos académicos

## Módulo 4: Asistencia {#módulo-4:-asistencia}

Este módulo permite la gestión integral del control de asistencias de los estudiantes, con herramientas adaptadas a los diferentes perfiles: docentes, directivos, alumnos y familias. La funcionalidad contempla la carga diaria, consulta histórica, consolidación mensual y cierre trimestral, además de la gestión de días no hábiles.

### Funcionalidades para Docentes {#funcionalidades-para-docentes}

Al acceder al módulo, los docentes visualizarán una lista de las secciones asignadas. Luego de seleccionar una de ellas, se despliega el historial de asistencias ya registradas, organizado por fecha. Cada asistencia diaria se representa como un recuadro con la fecha correspondiente, y al hacer clic sobre él, se podrá acceder al detalle del día para consultar o editar los registros, siempre que el trimestre no haya finalizado.

Para cargar una nueva asistencia, se deberá hacer clic en el botón “Nueva Asistencia”, lo que abrirá un modal tipo calendario. Por defecto, se seleccionará la fecha actual, aunque también será posible elegir una fecha distinta (siempre dentro del trimestre en curso).

Luego se solicita el tipo de visualización para la toma de asistencia, pudiendo elegir entre:

- Modo paso a paso:  
   Se muestra un alumno por vez, con su nombre en grande y dos botones debajo: “Presente” y “Ausente”. Al seleccionar una opción, se avanza al siguiente alumno. En la parte inferior se incluyen controles para avanzar o retroceder entre alumnos.
- Modo tabla:  
   Se presenta una lista con todos los alumnos de la sección. En cada fila aparece el nombre completo del alumno y, a la derecha, botones para marcar si estuvo presente o ausente.

Dentro del apartado de cada sección, se incluirá también:

- Un promedio general de asistencias y ausencias del grupo
- Un subapartado llamado “Alumnos”, donde se mostrará una lista de alumnos con su porcentaje individual de asistencia. Cada uno será representado gráficamente mediante una barra horizontal que ilustra el porcentaje total acumulado en el trimestre.

Una vez cerrado el trimestre por parte de la Dirección, los docentes ya no podrán editar ni cargar nuevas asistencias en ese período.

### Funcionalidades para Familias y Alumnos {#funcionalidades-para-familias-y-alumnos}

Tanto los alumnos como sus responsables podrán ingresar a este módulo con fines consultivos. Al acceder:

- Se mostrará un gráfico circular que representa el porcentaje total de asistencias e inasistencias del alumno.
- Debajo del gráfico, se listarán todas las fechas de asistencias e inasistencias registradas, brindando un seguimiento claro y transparente del historial.

En el caso de familias con más de un hijo, se requerirá previamente la selección del estudiante deseado.

### Funcionalidades para Dirección {#funcionalidades-para-dirección}

Los usuarios con perfil directivo contarán con herramientas adicionales para el control y gestión global de las asistencias. Dentro de su acceso se incluirán los siguientes apartados:

- Períodos:  
   Permite definir los trimestres escolares mediante un modal donde se cargan las fechas de inicio y fin de cada trimestre. Estas fechas determinarán el rango válido para la carga de asistencias. Una vez configurado, se deberá hacer clic en “Aceptar” para guardar los datos.
- Cierres mensuales:  
   En este apartado se listan todas las secciones de la institución. Al seleccionar una sección, se accede a un listado con:
  - Nombre y apellido de cada alumno
  - Porcentaje individual de asistencias e inasistencias
  - Promedio general de asistencia del grupo (calculado automáticamente dividiendo el total de asistencias por la cantidad de días hábiles del mes)
- Se destacarán también los casos en que se hayan registrado altas de nuevos alumnos durante el período.  
   Además, se incluye un botón “Crear PDF” que permite generar un informe descargable e imprimible con todos los datos mencionados.
- Cierres trimestrales:  
   Este apartado consolida la información acumulada de cada uno de los tres meses que componen el trimestre, brindando un resumen por alumno y por sección. Al igual que en los cierres mensuales, se podrá descargar un PDF con la información consolidada para archivo o distribución.
- Gestión de días no hábiles:  
   Desde este submódulo, la Dirección podrá declarar fechas como no hábiles (feriados, suspensión de clases, etc.) haciendo clic en el botón “Nuevo día no hábil”. Al seleccionar la fecha y confirmar, el sistema generará automáticamente una notificación institucional dirigida a todos los alumnos y familias afectadas, asegurando la comunicación efectiva de dicha modificación.

### Accesos por Perfil {#accesos-por-perfil-3}

- **Docentes:**
  - Carga y edición diaria de asistencias
  - Visualización de historial por sección
  - Acceso a porcentajes individuales y grupales
  - Bloqueo de edición al cierre del trimestre
- **Dirección:**
  - Definición de períodos (trimestres escolares)
  - Cierre mensual y trimestral de asistencias
  - Visualización de promedios por sección
  - Gestión de altas de nuevos alumnos
  - Generación de reportes en PDF
  - Declaración de días no hábiles y emisión de notificaciones institucionales
- **Familias:**
  - Consulta del porcentaje de asistencia de cada hijo
  - Visualización de cada fecha de asistencia o inasistencia
  - Acceso a gráficas resumidas y listados detallados
- **Alumnos:**
  - Consulta personal de su propio historial de asistencia
  - Visualización de gráficos y listado diario

## Módulo 5: Gestión de Personal {#módulo-5:-gestión-de-personal}

El módulo de Gestión de Personal permite a la Dirección y a la Administración gestionar de forma centralizada toda la información relativa al personal docente y no docente de la institución. Este apartado estará accesible únicamente para usuarios con perfiles autorizados y tiene como objetivo principal registrar, mantener y consultar información detallada del personal, así como gestionar sus licencias.

### Acceso y Estructura General {#acceso-y-estructura-general}

Dentro del menú principal, se encontrará el apartado “Gestión de Personal”. Al hacer clic en el mismo, se desplegará una interfaz específica que brinda acceso a:

- Alta de nuevos profesores o integrantes del personal
- Consulta y visualización del personal existente
- Registro y seguimiento de licencias
- Organización y filtrado del personal según distintos criterios

### Alta de Personal {#alta-de-personal}

La Dirección tendrá acceso a un botón denominado “Añadir profesor”, el cual abrirá un formulario dividido en secciones, para la carga ordenada y completa de la información de cada persona. El formulario incluirá los siguientes campos:

##### **Datos Personales:** {#datos-personales:}

- Nombres y Apellidos
- DNI
- CUIL
- Fecha de nacimiento
- Género
- Estado civil
- Nacionalidad
- Foto de perfil

##### **Información de Contacto:** {#información-de-contacto:}

- Domicilio completo
- Teléfono
- Celular
- Correo electrónico

##### **Datos Laborales:** {#datos-laborales:}

- Legajo
- Fecha de ingreso
- Condición laboral _(principal, suplente, interino)_
- Cargo actual _(maestro, profesor, maestranza, etc.)_
- Asignaturas (si corresponde, en caso de ser profesor o maestro)
- Grado (en caso de ser maestro de nivel inicial o primario)
- Situación actual _(activo, en licencia, de baja)_

##### **Formación Académica:** {#formación-académica:}

- Título principal
- Institución en la que se recibió
- Otros títulos (mismo esquema: título e institución)
- Fechas de obtención (opcionales)
- Especializaciones
- Cursos realizados

##### **Otros campos relevantes:** {#otros-campos-relevantes:}

- Antecedentes laborales
- Observaciones adicionales

### Listado y Consulta de Personal {#listado-y-consulta-de-personal}

La interfaz incluye un listado general del personal, con posibilidad de ordenar y filtrar por:

- Nivel: inicial, primario, secundario (si aplica)
- Sección correspondiente
- Asignatura
- Cargo

Cada ítem del listado es seleccionable, permitiendo explorar en detalle todos los datos cargados anteriormente del personal correspondiente.

### Gestión de Licencias {#gestión-de-licencias}

Cada perfil de personal incluirá una pestaña o subapartado de Licencias, donde se registrarán todas las licencias solicitadas o concedidas, incluyendo:

- Fecha de inicio y fin
- Motivo de la licencia
- Si fue justificada o no
- Cantidad de horas de ausencia acumuladas

Además, se incluye el botón “Nueva Licencia”, el cual abre un modal que permite registrar una nueva licencia para un miembro del personal. Este formulario incluirá los siguientes campos:

- Selección del profesor
- Fecha de inicio de la licencia
- Fecha de finalización
- Justificación (sí / no)
- Tipo de licencia (enfermedad, cuidado familiar, formación, etc.)

Una vez confirmada, la licencia será visible tanto desde el perfil del docente como desde listados generales para su seguimiento.

### Accesos por Perfil {#accesos-por-perfil-4}

- **Dirección:**
  - Alta y edición completa del personal
  - Registro y gestión de licencias
  - Consulta de datos individuales y masivos
  - Organización por sección, nivel y cargo
  - Supervisión y actualización de estados laborales
- **Administración:**
  - Consulta del listado de personal
  - Acceso a la información laboral, de contacto y licencias
  - Colaboración en la carga o validación de datos no académicos (por ejemplo, documentación, estado civil, CUIL, etc.)

## Módulo 6: Actas de Accidentes {#módulo-6:-actas-de-accidentes}

El módulo Acta de Accidentes estará disponible como una sección específica dentro del menú principal del sistema. Este módulo tiene como objetivo principal registrar, gestionar y consultar los incidentes o accidentes que ocurran dentro del ámbito escolar, vinculados a un alumno determinado, garantizando un registro formal, confiable y con controles de acceso adecuados.

### Acceso y Visibilidad {#acceso-y-visibilidad}

En el menú principal del sistema, existirá un apartado denominado Actas de Accidentes.  
 La visibilidad y acceso a este apartado estarán restringidos según perfil:

- Perfiles con acceso total (visualización y edición): Dirección y Administración.
- Perfiles con acceso restringido (visualización y edición limitada): Docentes.
- Perfiles sin acceso: Familias y Alumnos no visualizarán ni podrán acceder a esta sección.

La visualización para los perfiles Dirección, Administración y Docentes permitirá consultar todas las actas registradas, con filtros por alumno, fecha y estado.

### Creación y Registro de Actas {#creación-y-registro-de-actas}

Cuando ocurra un accidente o incidente, el docente responsable tendrá la posibilidad de registrar el evento hasta un máximo de 2 días posteriores a la fecha del suceso.  
 Para registrar un nuevo incidente, el docente deberá seleccionar el botón “Nueva Acta”, que abrirá un formulario modal con los siguientes campos:

1. Alumno: Campo de texto con búsqueda predictiva (autocompletado) que despliega hasta 5 resultados coincidentes. Los resultados mostrarán el apellido y nombre separados por coma (Ej.: “Pérez, Juan”) y al lado la sección o curso actual del alumno.  
   2. Fecha del suceso: Selector de fecha (calendario) con restricción para seleccionar solo la fecha actual o hasta 2 días previos (Ej.: si hoy es día 17, se podrán seleccionar los días 15, 16 y 17).  
   3. Hora del suceso: Selector horario en formato 24 horas, permitiendo seleccionar cualquier hora del día.  
   4. Descripción del suceso: Campo de texto obligatorio para detallar lo ocurrido.  
   5. Lugar del suceso: Campo de texto para indicar el espacio físico donde se produjo el accidente.  
   6. Acciones realizadas: Campo para describir las medidas o intervenciones tomadas por la escuela tras el incidente.

Todos los campos mencionados son obligatorios para poder guardar el acta.

###

### Restricciones y Edición {#restricciones-y-edición}

Una vez guardada, el acta queda registrada bajo el perfil del docente que la ingresó, quedando asociada como historial del alumno involucrado.  
 Los docentes podrán editar la acta únicamente durante un plazo máximo de 2 días a partir de la fecha de creación, contados desde la fecha del suceso, para realizar correcciones o agregados.

Pasado ese período, sólo el perfil Dirección tendrá permiso para editar cualquier acta, sin limitación temporal.

Los demás perfiles, incluyendo Administración y Docentes (fuera del periodo de edición permitido), tendrán acceso únicamente de lectura.

El sistema garantizará que ninguna acta pueda ser modificada o eliminada sin los permisos correspondientes, asegurando la integridad y trazabilidad del registro.

### Asociación y Reportes {#asociación-y-reportes}

Cada acta de accidente quedará vinculada directamente al expediente histórico del alumno dentro del sistema, permitiendo consultas rápidas y reportes por alumno, fecha, tipo de incidente y estado de resolución.

Se podrán generar listados de actas para la revisión por parte de Dirección y Administración, facilitando la gestión institucional y seguimiento de incidentes.

### Accesos por Perfil {#accesos-por-perfil-5}

**Dirección:**

- Visualización completa de todas las actas de accidentes.
- Alta, edición y eliminación sin restricciones temporales.
- Supervisión y control de registros históricos vinculados a cada alumno.
- Generación de reportes y exportación de información para gestión institucional.

**Administración:**

- Visualización completa de todas las actas de accidentes.
- Consulta y seguimiento de incidentes sin posibilidad de edición o creación.
- Colaboración en la revisión y gestión documental relacionada con los incidentes.

**Docentes:**

- Visualización de todas las actas de accidentes registradas.
- Creación de nuevas actas para los incidentes ocurridos en sus grupos o asignaturas.
- Edición limitada a un máximo de 2 días desde la fecha del suceso para corregir o completar la información.
- Acceso restringido a la edición únicamente sobre las actas que ellos mismos hayan creado.

**Familias:**

- Sin acceso al módulo ni visualización de actas de accidentes.

**Alumnos:**

- Sin acceso al módulo ni visualización de actas de accidentes.

## Módulo 7: Matrícula, Cuotas y Pagos {#módulo-7:-matrícula,-cuotas-y-pagos}

El módulo Matricula, Cuotas y Pagos estará disponible en el menú principal bajo la sección denominada Pagos, destinada a facilitar el acceso transparente y ordenado a la información financiera relacionada con los alumnos, tanto para las familias como para el personal administrativo y docente.

### Funcionalidades para Familias {#funcionalidades-para-familias}

Al ingresar a la sección Pagos, las familias podrán visualizar un listado completo de sus hijos, en caso de tener más de un alumno matriculado.

Al seleccionar cada alumno, se desplegará un listado detallado de las cuotas correspondientes, mostrando:

- Nombre del mes y año de la cuota.
- Sección o curso al que pertenece el alumno.
- Monto a cobrar.
- Estado de la cuota (vigente o vencida).

La familia podrá seleccionar cualquier cuota para visualizar información ampliada, que incluirá además un código único para facilitar el pago electrónico o presencial.

En este mismo apartado, se mostrarán también los pagos realizados por la matrícula, diferenciados claramente de las cuotas periódicas.

La interfaz está diseñada para ser intuitiva y responsiva, facilitando la navegación y el acceso rápido a la información financiera de cada alumno.

### Funcionalidades para Administración {#funcionalidades-para-administración}

La administración tendrá acceso a un botón llamado Nueva Cuota, mediante el cual podrá:

- Seleccionar una o varias secciones o cursos a los que se aplicará la nueva cuota.
- Definir el título o concepto de la cuota.
- Establecer el monto a pagar.
- Indicar la fecha de vencimiento.
- Configurar el recargo por pago fuera de término, con un valor por defecto que podrá ajustarse según necesidad.

Para la gestión de la matrícula, se podrá habilitar una opción marcada con un check “Matrícula”, diferenciando así la matrícula de las cuotas periódicas.

La administración podrá también ingresar pagos manuales a través del botón Nuevo Pago, donde se podrá:

- Seleccionar el personal o alumno al que se le registra el pago.
- Registrar la fecha efectiva del pago.
- Adjuntar archivo digital del recibo de sueldo o comprobante correspondiente, para mantener un respaldo documental.

### Funcionalidades para Docentes (Personal) {#funcionalidades-para-docentes-(personal)}

Los docentes podrán acceder a un apartado específico donde visualizarán su recibo de sueldo.

Contarán con un check para marcar si recibieron conforme el pago, permitiendo así confirmar la recepción del mismo de forma sencilla y trazable.

### Accesos por Perfil {#accesos-por-perfil-6}

**Administración:**

- Gestión completa de cuotas y matrículas, incluyendo alta, edición, eliminación y configuración de recargos.
- Registro y validación de pagos realizados, con adjunción de recibos y comprobantes.
- Visualización integral de estado de pagos y cuotas por alumno y sección.

**Personal (Docentes):**

- Acceso a visualización de recibos de sueldo.
- Confirmación de recepción de pagos mediante marcado “Recibí conforme”.
- Sin acceso para gestionar cuotas ni pagos de alumnos.

**Familias:**

- Visualización clara y detallada del estado de cuotas y matrículas por cada hijo.
- Acceso al código para realizar pagos de manera sencilla y segura.
- Sin posibilidad de modificar datos financieros, solo consulta.

## Módulo 8: Login {#módulo-8:-login}

El módulo de inicio de sesión constituye el punto de acceso principal al sistema para todos los perfiles habilitados (alumnos, docentes, personal administrativo y directivos). Su diseño está orientado a garantizar tanto la seguridad del ingreso como una experiencia de usuario guiada, clara y progresiva.

### Flujo del formulario {#flujo-del-formulario}

El formulario de login se dividirá en dos etapas principales:

1. #### Ingreso y validación del correo electrónico {#ingreso-y-validación-del-correo-electrónico}

Inicialmente, el formulario solicitará únicamente la dirección de correo electrónico institucional. Este campo será de tipo email e incluirá validaciones en tiempo real o al momento de enviar el dato.

Debajo del campo de email, se mostrará una sección separadora con una línea horizontal seguida por un botón con el texto:

**“¿Querés postularte como alumno? Ingresá acá”**

Este botón servirá como alternativa para quienes aún no tengan cuenta en el sistema y deseen iniciar el proceso de postulación como estudiante, redirigiéndolos a un formulario específico.

Al completar el campo de email y hacer clic en "Continuar", se validará:

- Que el formato del email sea válido.
- Que finalice con el dominio institucional @ecep.edu.ar.
- Que el correo exista en la base de datos del sistema.

2. #### Ingreso de contraseña {#ingreso-de-contraseña}

En caso de que el email ingresado sea válido y esté registrado, el sistema:

- Ocultará el botón de postulación y la línea divisoria.
- Mostrará dinámicamente el campo de contraseña (tipo password).
- Desplegará el botón principal de acceso con la etiqueta "Ingresar".

A partir de aquí, el usuario podrá continuar con la autenticación ingresando su contraseña.

#### **Validaciones de la contraseña** {#validaciones-de-la-contraseña}

La contraseña deberá cumplir con los siguientes requisitos de seguridad:

- Mínimo de 8 caracteres.
- Al menos 2 números.
- Al menos 1 símbolo especial (como \!, @, \#, etc.).

Además, se verificará que coincida con la registrada para el correo proporcionado. Todos los mensajes de error se mostrarán de forma clara y específica debajo del formulario, evitando ambigüedades y facilitando la corrección por parte del usuario.

## Módulo 9: Reportes {#módulo-9:-reportes}

El módulo de reportes tiene como objetivo centralizar y visualizar la información relevante para el análisis académico y administrativo del establecimiento. Este módulo estará accesible únicamente para usuarios con permisos administrativos y directivos, y permitirá generar informes detallados, exportables y visualmente claros. Cada reporte incluirá filtros personalizados para adaptar la búsqueda a las necesidades de consulta, y en los casos pertinentes, se mostrarán gráficos estadísticos para facilitar la interpretación de los datos.

Abra un menú superior donde se podrá seleccionar uno de los siguientes reportes:

- Reporte de boletines
- Reporte de alumnos aprobados y desaprobados
- Reporte de asistencias de alumnos
- Reporte de inasistencias de profesores
- Reporte de actas

Dentro de los reportes existirá un botón para poder exportar como pdf y luego ser impreso en caso de ser necesario.

### Reporte de boletines {#reporte-de-boletines}

El reporte de boletines permite generar un resumen académico y conductual individualizado de cada estudiante, incluyendo sus calificaciones, asistencia y pertenencia a una sección determinada. Está pensado como una herramienta de consulta para docentes, directivos y personal administrativo, con posibilidad de exportación y visualización detallada.

Al ingresar al módulo, el usuario encontrará en la parte superior una lista desplegable de secciones disponibles (por ejemplo: “3° A”, “4° B”, etc.). Este desplegable tendrá como texto inicial: “Seleccione una sección”. Al seleccionar una sección, el sistema cargará automáticamente el listado de alumnos que pertenecen a ella.

Cada alumno aparecerá representado por una tarjeta resumen o fila en una tabla, que incluirá la siguiente información visible de forma directa:

- Nombre y Apellido del alumno
- Nombre de la sección
- Promedio general de calificaciones
- Promedio de asistencias
- Promedio de inasistencias

Para los campos de asistencia e inasistencia, el sistema mostrará de forma predeterminada un único valor resumen (por ejemplo, “92% asistencia”). Sin embargo, al pasar el cursor por encima (hover), se desplegará un pequeño cuadro flotante (tooltip) con información adicional, que detallará:

- Total de días hábiles del período
- Días asistidos
- Inasistencias justificadas
- Inasistencias injustificadas

Asimismo, el promedio de nota será calculado sobre la base de todas las materias evaluadas en el período, permitiendo tener un indicador académico directo para cada estudiante.

Al hacer clic sobre cualquier alumno del listado, se abrirá un panel lateral o una vista expandida que mostrará el boletín completo del alumno, incluyendo:

- Listado de todas las materias cursadas
- Docente responsable de cada materia
- Nota final obtenida por materia
- Observaciones (si las hubiera)
- Comentarios de convivencia (opcional)
- Estado general: Promociona / No Promociona

### Reporte de alumnos aprobados y desaprobados {#reporte-de-alumnos-aprobados-y-desaprobados}

Este reporte tiene como objetivo ofrecer una visión detallada del rendimiento académico de los alumnos del nivel primario, permitiendo identificar tendencias de aprobación y desaprobación tanto a nivel general como por sección.

Al ingresar al módulo, el sistema presentará una vista general del nivel primario, ya que en el nivel inicial no se aplica la evaluación por asignaturas. Por este motivo, en la parte izquierda de la pantalla se visualizará un selector de nivel donde la opción “Inicial” aparecerá desactivada, y “Primario” estará activa por defecto.

En la parte central de la interfaz se mostrará un panel de estadísticas generales que incluirá:

- Un gráfico circular (de torta) que representará el porcentaje total de materias aprobadas y desaprobadas por los alumnos de todo el nivel primario.
- Un indicador que mostrará cuál es la materia con mayor cantidad de desaprobaciones, permitiendo detectar contenidos con mayor dificultad general.
- Un contador con el número total de alumnos que adeudan materias (es decir, que tienen al menos una materia desaprobada).

Debajo de estas métricas generales, se encontrará un listado con todas las secciones disponibles dentro del nivel (por ejemplo: “1° A”, “2° B”, etc.). Al hacer clic sobre una de estas secciones, el sistema desplegará un reporte detallado específico de esa sección.

En esta vista por sección se incluirán:

- Un promedio de materias aprobadas por alumno en la sección
- Un nuevo gráfico circular con el porcentaje de materias aprobadas y desaprobadas dentro de esa sección específica.
- Un listado detallado con la siguiente información por alumno:
  - Nombre y Apellido
  - Materia
  - Nota obtenida
  - Estado de aprobación (Aprobado/Desaprobado)

Este listado podrá ordenarse por nombre, por promedio general o por cantidad de materias desaprobadas, y permitirá realizar un análisis pormenorizado del desempeño de cada estudiante.

### Reporte de asistencias de alumnos {#reporte-de-asistencias-de-alumnos}

Este reporte permite visualizar y analizar la asistencia de los estudiantes a lo largo de un período determinado. Al ingresar a esta sección, el sistema ofrecerá al usuario la posibilidad de filtrar por rango de fechas, mediante un selector de “Desde” y “Hasta”. En caso de no especificarse una franja temporal, el sistema considerará por defecto el año lectivo completo.

Una vez definido el período, se presentarán dos paneles resumen en la parte superior del reporte:

- El primero mostrará la cantidad total de días hábiles en ese intervalo de tiempo.
- El segundo y tercer panel mostrarán, respectivamente, el promedio de asistencia del nivel primario y el promedio de asistencia del nivel secundario, cada uno acompañado por un gráfico circular (gráfico de torta) que ilustre visualmente el porcentaje de asistencia e inasistencia correspondiente.

Debajo de estos indicadores, se incluirá un desplegable de selección de secciones, que permitirá elegir una o varias secciones disponibles del sistema (por ejemplo, "1° A", "2° B", etc.). Al seleccionar una sección, el sistema cargará automáticamente una tabla con los datos detallados por estudiante, incluyendo las siguientes columnas:

- Nombre y Apellido del alumno
- Total de días asistidos
- Total de inasistencias
- Cantidad de inasistencias justificadas
- Cantidad de inasistencias injustificadas
- Porcentaje de asistencia

Para facilitar el análisis comparativo, el sistema generará además un gráfico de barras que representará visualmente el porcentaje de asistencia de cada alumno dentro de la sección seleccionada.

### Reporte de inasistencias de profesores {#reporte-de-inasistencias-de-profesores}

Este reporte se orienta al seguimiento de la presencia docente. El primer componente será un buscador donde se seleccionará el profesor, con autocompletado.

En la parte izquierda la sección de filtros existirá un selector de fechas (desde/hasta) permitirá definir el período a analizar. También, un filtro por estado de la falta dará la opción de seleccionar: Todas, Justificadas, No justificadas.

Al aplicar los filtros, se mostrará una tabla con columnas: Nombre del docente, Fecha de inasistencia, Horas, Estado, Motivo (si fue informado), y si fue cubierta por otro docente o no.

SE DEBE CAMBIAR POR LICENCIAS POR DOCENTE

### Reporte de actas {#reporte-de-actas}

El reporte de actas permite visualizar, filtrar y consultar en detalle los registros de actas generadas por situaciones de accidente relacionadas con los alumnos. Este módulo está orientado a brindar trazabilidad y acceso rápido a cada acta, con opciones de búsqueda, visualización y exportación.

Al ingresar al módulo, el usuario encontrará un panel de filtros en la parte izquierda de la pantalla que le permitirá configurar la búsqueda según distintos criterios. Los filtros disponibles serán:

- Selector de fechas “Desde / Hasta”: permite establecer un rango temporal para acotar las actas generadas en ese período.
- Filtro por sección: lista desplegable con todas las secciones disponibles del sistema, por ejemplo “2° A”, “3° B”, etc.
- Filtro por nivel: opciones como “Inicial”, “Primario” y “Secundario”.
- Buscador por nombre de alumno: campo de texto con autocompletado que permite localizar rápidamente a un estudiante específico por su nombre o apellido.

Una vez aplicados los filtros, en la parte derecha de la interfaz aparecerá un recuadro informativo que muestra la cantidad total de actas encontradas según los criterios seleccionados. Este dato ofrece un panorama rápido de la cantidad de incidencias o registros asociados.

Debajo del recuadro informativo se desplegará una lista de actas coincidentes, presentadas en formato de tabla o tarjetas. Cada entrada incluirá los siguientes datos:

- Nombre del alumno involucrado
- Nombre del docente o profesor responsable
- Fecha del acta
- Horario en que ocurrió la situación registrada

Al seleccionar una acta (ya sea haciendo clic o tocando en dispositivos móviles), se abrirá un modal (ventana emergente) que mostrará la información completa del registro. En esta vista detallada se incluirán:

- Nombre del alumno
- Profesor con el que se encontraba
- Fecha y hora exacta del evento
- Descripción textual de la situación o hecho registrado
- Estado del acta: Firmada / No firmada
- Firma digital o imagen de la firma (si aplica)

Dentro del modal también se incluirá un botón para “Imprimir Acta”, que generará una versión en formato PDF optimizada para impresión o archivo digital, con todos los datos relevantes del caso.

Este módulo facilitará la gestión documental de actas, permitiendo un seguimiento ordenado y seguro, con posibilidad de compartir información formalmente cuando sea necesario.
