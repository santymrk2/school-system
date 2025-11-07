# Reportes

## 1. Introducción
La sección **Reportes** centraliza toda la información analítica académica y administrativa, permitiéndole exportar los datos visibles a PDF y navegar por cinco reportes temáticos (Boletines, Aprobación, Asistencias, Licencias y Actas) mediante pestañas horizontales.

## 2. Roles y Permisos
- **Directores y Administradores**: ven la entrada “Reportes” en el menú principal y pueden acceder sin restricciones.

- **Secretarías**: aunque no aparece la opción en el menú, tienen acceso directo a la página; cualquier otro rol es redirigido al panel general.

## 3. Acceso a la Sección
### Paso 1: Abrir la sección
- **Acción**: Desde el panel principal, seleccione la opción **Reportes** del menú lateral o acceda directamente a `/dashboard/reportes`.
- **FOTO-ADJUNTA**: Captura del menú lateral con la opción “Reportes” resaltada.
- **Resultado esperado**: Se muestra la página de Reportes con el encabezado y las pestañas disponibles.

## 4. Funcionalidades

### 4.1 Exportar PDF General
**Descripción**: Genera un PDF con la información mostrada en la pestaña activa.
**Ubicación**: Botón “Exportar PDF” en la esquina superior derecha de la página.

#### Procedimiento:
**Paso 1: Verificar pestaña y datos**
- **Acción**: Confirme que la pestaña activa contiene la información que desea exportar.
- **Ubicación**: Barra de pestañas debajo del encabezado.
- **Datos requeridos**: N/A.
- **Validaciones**: Los datos deben estar cargados; si no hay información, la exportación mostrará un error.
- **FOTO-ADJUNTA**: Vista general de la pestaña seleccionada con datos visibles.
- **Resultado esperado**: Los datos deseados están visibles antes de exportar.

**Paso 2: Iniciar exportación**
- **Acción**: Haga clic en **Exportar PDF**.
- **Ubicación**: Botón con icono de descarga junto al título.
- **Datos requeridos**: N/A.
- **Validaciones**: El botón cambia a “Generando…” mientras se procesa.
- **FOTO-ADJUNTA**: Botón “Exportar PDF” mostrando el estado “Generando…”.
- **Resultado esperado**: Se descarga un archivo PDF o aparece un mensaje de error si no hay datos exportables.

#### Mensajes del Sistema:
- ✅ **Éxito**: “PDF generado correctamente.”
- ❌ **Error**: “No se pudo generar el documento PDF.” o mensaje específico del error.

#### Casos Especiales:
- Si la pestaña no tiene datos, se muestra “No encontramos datos para exportar” y la descarga se cancela.

---

### 4.2 Reporte de Boletines
**Descripción**: Consulta el rendimiento académico por sección y genera resúmenes individuales.
**Ubicación**: Pestaña **Boletines**.

#### Procedimiento:
**Paso 1: Elegir sección**
- **Acción**: Seleccione una sección en el listado desplegable.
- **Ubicación**: Selector “Sección” dentro de la tarjeta principal.
- **Datos requeridos**: N/A.
- **Validaciones**: El selector se deshabilita si la información está cargando o no hay secciones disponibles.
- **FOTO-ADJUNTA**: Tarjeta “Reporte de Boletines” con el selector abierto mostrando secciones.
- **Resultado esperado**: Se muestran tarjetas de alumnos o mensajes informativos si no hay datos.

**Paso 2: Abrir detalle de alumno**
- **Acción**: Haga clic sobre la tarjeta del alumno que desea revisar.
- **Ubicación**: Rejilla de tarjetas listada tras seleccionar la sección.
- **Datos requeridos**: N/A.
- **Validaciones**: Si no hay alumnos, aparece el mensaje correspondiente.
- **FOTO-ADJUNTA**: Tarjeta de alumno resaltada con el mensaje “Click para ver boletín completo”.
- **Resultado esperado**: Se abre un panel lateral con el detalle del alumno.

**Paso 3: Revisar y/o imprimir resumen**
- **Acción**: Analice promedios, asistencia y materias; oprima “Imprimir resumen” si necesita descargar el PDF.
- **Ubicación**: Panel lateral (Sheet) del alumno.
- **Datos requeridos**: N/A.
- **Validaciones**: El botón se deshabilita mientras se genera el PDF.
- **FOTO-ADJUNTA**: Panel lateral mostrando datos del alumno y el botón “Imprimir resumen”.
- **Resultado esperado**: Visualiza la información organizada y, al imprimir, se genera el PDF individual.

#### Mensajes del Sistema:
- ✅ **Éxito**: “Resumen del boletín listo para imprimir.”
- ❌ **Error**: “No se pudo generar el resumen del boletín.” o mensaje del error real.
- ⚠️ **Advertencia**: Dentro del componente aparecen mensajes informativos como “No hay calificaciones registradas…” o “Elegí una sección…” cuando falta información.

#### Casos Especiales:
- Si la lista de secciones está vacía, se muestra “No hay secciones disponibles” y el selector queda inhabilitado.
- Los informes de nivel secundario (sin boletín) muestran bloques de texto en lugar de materias.

---

### 4.3 Reporte de Aprobación
**Descripción**: Resume la situación de aprobación de materias en nivel primario y permite analizar por sección y alumno.
**Ubicación**: Pestaña **Aprobación**.

#### Procedimiento:
**Paso 1: Revisar indicadores generales**
- **Acción**: Observe las tarjetas superiores (gráficos y cifras clave).
- **Ubicación**: Parte superior de la pestaña.
- **Datos requeridos**: N/A.
- **Validaciones**: Si no hay calificaciones cargadas, se muestra el mensaje “No hay calificaciones registradas…” en lugar del gráfico.
- **FOTO-ADJUNTA**: Tarjetas de indicadores con el gráfico circular y los contadores.
- **Resultado esperado**: Conocer materias aprobadas vs desaprobadas, materias conflictivas y alumnos con pendientes.

**Paso 2: Seleccionar sección**
- **Acción**: Haga clic en una tarjeta de sección para activar el análisis detallado.
- **Ubicación**: Rejilla “Selecciones”.
- **Datos requeridos**: N/A.
- **Validaciones**: Al hacer clic, la tarjeta queda resaltada.
- **FOTO-ADJUNTA**: Tarjetas de secciones mostrando aprobadas/desaprobadas con una seleccionada.
- **Resultado esperado**: Se habilita el panel con gráfico y tabla de alumnos para esa sección.

**Paso 3: Ordenar detalle por alumno**
- **Acción**: Use el selector “Ordenar por” para cambiar el criterio (Nombre, Promedio, Materias desaprobadas).
- **Ubicación**: Parte superior derecha de la tarjeta “Detalle por alumno”.
- **Datos requeridos**: N/A.
- **Validaciones**: El selector requiere que haya una sección activa.
- **FOTO-ADJUNTA**: Tabla detallada mostrando los encabezados y el selector desplegado.
- **Resultado esperado**: La tabla se reordena según el criterio elegido.

#### Mensajes del Sistema:
- ⚠️ **Advertencia**: “No encontramos secciones…” cuando no hay datos cargados.
- ⚠️ **Advertencia**: “Seleccioná una sección para ver el detalle específico.” cuando aún no se eligió ninguna.

#### Casos Especiales:
- El selector de nivel muestra “Inicial (no disponible)” deshabilitado, informando que solo se trabaja con Primario.

---

### 4.4 Reporte de Asistencias
**Descripción**: Analiza el presentismo de alumnos por período y secciones, con gráficos y tablas detalladas.
**Ubicación**: Pestaña **Asistencias**.

#### Procedimiento:
**Paso 1: Definir rango de fechas**
- **Acción**: Seleccione fechas “Desde” y “Hasta”.
- **Ubicación**: Primer fila de filtros.
- **Datos requeridos**: Fechas válidas.
- **Validaciones**: El sistema ajusta automáticamente el rango para evitar inconsistencias (si el inicio supera al fin y viceversa).
- **FOTO-ADJUNTA**: Campos de fecha mostrando calendario y validación.
- **Resultado esperado**: Se actualizan los datos al rango establecido.

**Paso 2: Elegir secciones**
- **Acción**: Abra el selector “Seleccionar secciones”, busque si es necesario y marque las secciones.
- **Ubicación**: Botón con ícono de lupa en los filtros.
- **Datos requeridos**: N/A.
- **Validaciones**: No permite quedar sin secciones seleccionadas mediante la interacción principal.
- **FOTO-ADJUNTA**: Popover de secciones con el buscador y checkboxes.
- **Resultado esperado**: Se actualizan los gráficos y tablas con las secciones elegidas.

**Paso 3: Interpretar resultados**
- **Acción**: Revise los gráficos por nivel y las tablas detalladas por sección y alumno.
- **Ubicación**: Tarjetas debajo de los filtros.
- **Datos requeridos**: N/A.
- **Validaciones**: Los gráficos muestran porcentajes y las tablas incluyen cálculo del % de asistencia.
- **FOTO-ADJUNTA**: Tarjeta de sección con tabla y gráfico de barras.
- **Resultado esperado**: Comprender la asistencia promedio por nivel y sección, con comparativas por alumno.

#### Mensajes del Sistema:
- ✅ **Éxito**: Visualización de gráficos y tablas según filtros.
- ❌ **Error**: Mensaje en recuadro rojo si la consulta falla (“{attendanceError}”).
- ⚠️ **Advertencia**: 
  - “Cargando asistencia…” mientras se recuperan datos.
  - “No encontramos registros de asistencia…” si no hay resultados.

#### Casos Especiales:
- El selector de secciones incluye buscador y muestra nivel asociado para diferenciar cursos con nombres similares.
- Los gráficos de pastel muestran ausentismo vs asistencia calculados dinámicamente.

---

### 4.5 Reporte de Licencias
**Descripción**: Resume el estado de licencias del personal y ofrece un filtrado detallado por docente, tipo, justificación y período.
**Ubicación**: Pestaña **Licencias**.

#### Procedimiento:
**Paso 1: Revisar resumen general**
- **Acción**: Observe las tarjetas superiores con totales de personal, activos y licencias.
- **Ubicación**: Parte superior de la pestaña.
- **Datos requeridos**: N/A.
- **Validaciones**: El indicador “Licencias registradas” muestra “—” si los datos aún cargan.
- **FOTO-ADJUNTA**: Cuatro tarjetas del resumen con iconos representativos.
- **Resultado esperado**: Tener una visión general inmediata del estado del personal.

**Paso 2: Analizar distribución de licencias**
- **Acción**: Revise el gráfico circular, contadores de licencias activas y próximas a vencer, y la lista de tipos frecuentes.
- **Ubicación**: Tarjeta “Resumen de licencias”.
- **Datos requeridos**: N/A.
- **Validaciones**: Muestra mensajes específicos cuando no hay datos o ocurre un error.
- **FOTO-ADJUNTA**: Gráfico circular y recuadros de totales.
- **Resultado esperado**: Identificar tendencias por tipo de licencia y fechas próximas.

**Paso 3: Filtrar detalle por docente**
- **Acción**: Complete los filtros (búsqueda, docente, tipo, justificación y rango de fechas) y observe la tabla resultante.
- **Ubicación**: Tarjeta “Detalle de licencias por docente”.
- **Datos requeridos**: Palabras clave y/o selecciones de lista; fechas opcionales.
- **Validaciones**: Los selectores se deshabilitan si no hay opciones; las fechas se ajustan para mantener coherencia.
- **FOTO-ADJUNTA**: Filtros desplegados y tabla con resultados.
- **Resultado esperado**: Visualizar las licencias filtradas, incluyendo estado, duración y justificación.

#### Mensajes del Sistema:
- ✅ **Éxito**: Tabla poblada con las licencias filtradas.
- ❌ **Error**: Mensaje rojo “{licenseError}” cuando ocurre un fallo de carga.
- ⚠️ **Advertencia**:
  - “Cargando licencias…” mientras se procesan los datos.
  - “No encontramos licencias…” o “No se encontraron licencias con los criterios seleccionados.” según corresponda.

#### Casos Especiales:
- El filtro de “Docente” se deshabilita si aún no se recuperaron las opciones disponibles.
- Las columnas “Estado” combinan dos etiquetas: situación temporal (Activa, Próxima a vencer, Finalizada) y justificación (Justificada/Sin justificar).

---

### 4.6 Reporte de Actas
**Descripción**: Permite filtrar, consultar y exportar actas de accidentes escolares.
**Ubicación**: Pestaña **Actas**.

#### Procedimiento:
**Paso 1: Configurar filtros**
- **Acción**: Defina rango de fechas, nivel, sección y/o alumno desde el panel de filtros.
- **Ubicación**: Columna izquierda dentro de la tarjeta principal.
- **Datos requeridos**: Fechas válidas, selección de nivel y sección opcional, texto de búsqueda.
- **Validaciones**: Las fechas se reajustan para mantener un rango válido; la sección solo se habilita si hay actas.
- **FOTO-ADJUNTA**: Panel de filtros con selectores y campos completados.
- **Resultado esperado**: Se actualiza el conteo de actas encontradas y la lista de resultados.

**Paso 2: Revisar listado**
- **Acción**: Explore las tarjetas de actas que coinciden con los filtros.
- **Ubicación**: Columna derecha de la tarjeta principal.
- **Datos requeridos**: N/A.
- **Validaciones**: El contador muestra “—” mientras cargan los datos; si no hay coincidencias, aparece un mensaje informativo.
- **FOTO-ADJUNTA**: Lista de actas con fecha, hora y estado de firma.
- **Resultado esperado**: Identificar rápidamente la información clave de cada acta.

**Paso 3: Abrir y exportar acta**
- **Acción**: Haga clic en una tarjeta para abrir el detalle; use “Imprimir Acta” para descargar el PDF.
- **Ubicación**: Diálogo emergente (modal) tras seleccionar una acta.
- **Datos requeridos**: N/A.
- **Validaciones**: El botón de impresión se deshabilita mientras se genera el PDF.
- **FOTO-ADJUNTA**: Modal con los datos completos del acta y el botón “Imprimir Acta”.
- **Resultado esperado**: Visualizar todos los campos registrados y obtener el PDF individual.

#### Mensajes del Sistema:
- ✅ **Éxito**: “Acta exportada en PDF.” al generar el documento.
- ❌ **Error**: “No se pudo generar el PDF del acta.” u otro mensaje derivado del error.
- ⚠️ **Advertencia**:
  - “Cargando actas…” durante la carga.
  - “No encontramos actas con los criterios seleccionados.” cuando no hay resultados.

#### Casos Especiales:
- El panel de filtros incluye selector dinámico de secciones basado en las actas disponibles; si se eliminan actas de una sección, ésta se desactiva automáticamente en el filtro.
- El diálogo presenta información adicional (DNI, familiar responsable, descripción y acciones realizadas) para facilitar la revisión completa antes de imprimir.

## 5. Preguntas Frecuentes
1. **¿Por qué no veo la opción “Reportes” en el menú?**  
   Solo Directores y Administradores la tienen visible; Secretarías deben acceder mediante enlace directo.

2. **¿Qué periodo se muestra en los reportes?**  
   Todos los datos se basan en el período escolar activo seleccionado en el sistema.

3. **¿Puedo exportar varios reportes a la vez?**  
   No. El botón “Exportar PDF” genera únicamente el reporte de la pestaña activa.

4. **¿Qué hacer si un gráfico muestra “Sin datos”?**  
   Revise filtros y asegúrese de que existan registros cargados; el mensaje indica ausencia de información disponible en esa combinación.

## 6. Solución de Problemas
- **La exportación genera un error**: Verifique que la pestaña activa tenga datos y vuelva a intentar; si persiste, contacte al área técnica con el mensaje mostrado en pantalla.

- **No aparecen secciones/alumnos**: Espere a que finalice la carga (mensaje “Cargando…”). Si el mensaje permanece, puede deberse a falta de registros en el período activo.

- **Los filtros de fechas se invierten**: El sistema ajusta automáticamente el rango; revise y vuelva a seleccionar si necesita un período diferente.

- **No se listan docentes en Licencias**: Espere a que carguen los datos del personal; si el selector continúa deshabilitado, puede no haber licencias asociadas a docentes en el período consultado.

- **No se muestran actas tras filtrar**: Amplíe el rango de fechas, borre el texto de búsqueda o seleccione “Todas” las secciones; el mensaje informativo confirma que no hay resultados con los criterios actuales.
