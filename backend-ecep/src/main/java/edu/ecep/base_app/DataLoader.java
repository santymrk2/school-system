package edu.ecep.base_app;
//⚡

import edu.ecep.base_app.domain.*;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.domain.enums.*;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

import java.time.DayOfWeek;
import java.util.function.Consumer;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements org.springframework.boot.CommandLineRunner {

    // === Auth / Personas ===
    private final PersonaRepository personaRepository;
    private final EmpleadoRepository empleadoRepository;

    private final PasswordEncoder encoder;

    // === Estructura / Académico ===
    private final PeriodoEscolarRepository periodoEscolarRepository;
    private final TrimestreRepository trimestreRepository;
    private final SeccionRepository seccionRepository;
    private final MateriaRepository materiaRepository;
    private final SeccionMateriaRepository seccionMateriaRepository;

    // === Alumnos / Familia ===
    private final AlumnoRepository alumnoRepository;
    private final FamiliarRepository familiarRepository;
    private final AlumnoFamiliarRepository alumnoFamiliarRepository;

    private final MatriculaRepository matriculaRepository;
    private final MatriculaSeccionHistorialRepository matSecHistRepository;

    // === Asignaciones docentes ===
    private final AsignacionDocenteSeccionRepository asigSecRepo;
    private final AsignacionDocenteMateriaRepository asigMatRepo;

    // === Asistencias ===
    private final JornadaAsistenciaRepository jornadaRepo;
    private final DetalleAsistenciaRepository detalleRepo;

    // === Aspirantes (si aplica) ===
    private final AspiranteRepository aspiranteRepository;
    private final AspiranteFamiliarRepository aspiranteFamiliarRepository;
    private final SolicitudAdmisionRepository solicitudAdmisionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Iniciando carga de datos de prueba...");

        // 0) Usuarios base + personas/perfiles imprescindibles
        ensureAdminAndUser();

        // 1) Período 2025 + trimestres
        PeriodoEscolar p2025 = ensurePeriodoEscolar(2025);
        Trimestre t1 = ensureTrimestre(p2025, 1, LocalDate.of(2025, 3, 1), LocalDate.of(2025, 5, 31));
        Trimestre t2 = ensureTrimestre(p2025, 2, LocalDate.of(2025, 6, 1), LocalDate.of(2025, 8, 31));
        Trimestre t3 = ensureTrimestre(p2025, 3, LocalDate.of(2025, 9, 1), LocalDate.of(2025, 11, 30));

        // 2) Secciones (solo PRIMARIO en este set)
        Seccion primario1A = ensureSeccion(p2025, NivelAcademico.PRIMARIO, "1°", "A", Turno.MANANA);
        Seccion primario2A = ensureSeccion(p2025, NivelAcademico.PRIMARIO, "2°", "A", Turno.TARDE);

        // 3) Materias base y plan
        Materia lengua = ensureMateria("Lengua");
        Materia matematica = ensureMateria("Matemática");
        ensureSeccionMateria(primario1A, lengua);
        ensureSeccionMateria(primario1A, matematica);
        ensureSeccionMateria(primario2A, lengua);
        ensureSeccionMateria(primario2A, matematica);

        // 4) Docentes titulares por sección y materias
        LocalDate vigenciaTitularDesde = LocalDate.of(2025, 3, 1);
        Empleado docPrim1A = ensureDocente("Mariana", "Suárez", "30111224", "20111222338");
        Empleado docPrim2A = ensureDocente("Federico", "Acosta", "30111225", "20111222339");

        ensureTitularSeccion(docPrim1A, primario1A, vigenciaTitularDesde);
        ensureTitularSeccion(docPrim2A, primario2A, vigenciaTitularDesde);

        ensureTitularMateriasDeSeccion(docPrim1A, primario1A, vigenciaTitularDesde);
        ensureTitularMateriasDeSeccion(docPrim2A, primario2A, vigenciaTitularDesde);


        // 5) Alumnos + familiares + matrículas (3 por sección)
        LocalDate desde = LocalDate.of(2025, 3, 3);

        crearAlumnoConFamiliaYMatricula(primario1A, p2025, desde,
                new PersonaSeed("Tomás", "González", "43000001", "Nadia", "González", "31000001"),
                new PersonaSeed("Martina", "Sánchez", "43000002", "Rocío", "Sánchez", "31000002"),
                new PersonaSeed("Isabella", "Romero", "43000003", "Gabriela", "Romero", "31000003"));

        crearAlumnoConFamiliaYMatricula(primario2A, p2025, desde,
                new PersonaSeed("Santiago", "Castro", "42000001", "Luciana", "Castro", "30000001"),
                new PersonaSeed("Juan Ignacio", "Álvarez", "42000002", "Daniela", "Álvarez", "30000002"),
                new PersonaSeed("Mía", "Herrera", "42000003", "Patricia", "Herrera", "30000003"));



        // 6) Aspirantes de ejemplo (con familiar)
        Aspirante aspirante1 = crearAspiranteConFamiliar(new PersonaSeed("Agustín", "Pereyra", "47000001", "Mónica", "Pereyra", "33000001"));
        Aspirante aspirante2 = crearAspiranteConFamiliar(new PersonaSeed("Camila", "Vega",     "47000002", "Eliana", "Vega",     "33000002"));
        crearSolicitudesDemostracion(aspirante1, aspirante2);

        // 7) Usuario docente demo + asignaciones + extra de datos/secciones
        ensureDocenteDemoUserYAsignacion(docPrim1A, primario1A);

        log.info("⚡ Carga de datos completada.");
    }

    // =========================================================================
    // AUTENTICACIÓN Y PERSONAS (nueva forma)
    // =========================================================================

    private void ensureAdminAndUser() {
        // ADMIN
        Persona directoraP = ensurePersona("Nancy", "Carbone", "9999999");
        directoraP = ensurePersonaCredentials(directoraP,
                "admin@example.com",
                "admin123",
                Set.of(UserRole.ADMIN, UserRole.TEACHER, UserRole.ALTERNATE, UserRole.FAMILY, UserRole.DIRECTOR));
        ensureEmpleado(directoraP, per -> {
            per.setCuil("20123456789");
            per.setCargo("Directora");
            per.setFechaIngreso(LocalDate.now());
            per.setRolEmpleado(RolEmpleado.DIRECCION);
        });

        // USER
        Persona josefinaP = ensurePersona("Josefina", "Bacan", "88888888");
        josefinaP.setFechaNacimiento(LocalDate.of(1920, 5, 15));
        josefinaP.setGenero("Masculino");
        josefinaP.setEstadoCivil("Casado");
        josefinaP.setNacionalidad("Bolivia");
        josefinaP.setDomicilio("Calle Falsa 3");
        josefinaP.setTelefono("12344321");
        josefinaP.setCelular("1231434321");
        josefinaP = ensurePersonaCredentials(josefinaP,
                "user@example.com",
                "user123",
                Set.of(UserRole.SECRETARY));

        ensureEmpleado(josefinaP, per -> {
            per.setCuil("2888888885");
            per.setCargo("Limpieza");
            per.setFechaIngreso(LocalDate.now());
            per.setObservacionesGenerales("");
            per.setRolEmpleado(RolEmpleado.SECRETARIA);
        });

        log.info("Personas con credenciales base cargadas correctamente.");
    }

    // =========================================================================
    // HELPERS NUEVOS (Persona + Perfiles 1:1 con @MapsId)
    // =========================================================================

    /** Crea o reutiliza Persona por DNI, y setea nombre/apellido si es nueva. */
    private Persona ensurePersona(String nombre, String apellido, String dni) {
        return personaRepository.findByDni(dni).orElseGet(() -> {
            Persona p = new Persona();
            p.setDni(dni);
            p.setNombre(nombre);
            p.setApellido(apellido);
            return personaRepository.save(p);
        });
    }

    private Persona ensurePersonaCredentials(Persona persona, String email, String rawPassword, Set<UserRole> roles) {
        if (email != null) {
            persona.setEmail(email);
        }
        if (rawPassword != null && !rawPassword.isBlank()) {
            if (persona.getPassword() == null || !encoder.matches(rawPassword, persona.getPassword())) {
                persona.setPassword(encoder.encode(rawPassword));
            }
        }
        if (roles != null && !roles.isEmpty()) {
            persona.setRoles(new HashSet<>(roles));
        } else if (persona.getRoles() == null) {
            persona.setRoles(new HashSet<>());
        }
        return personaRepository.save(persona);
    }

    /** Asegura Empleado 1:1 (PK compartida con Persona por @MapsId). */
    private Empleado ensureEmpleado(Persona persona, Consumer<Empleado> patch) {
        return empleadoRepository.findByPersonaId(persona.getId())
                .orElseGet(() -> {
                    Empleado per = new Empleado();
                    per.setPersona(persona);       // << NO setId()
                    if (patch != null) patch.accept(per);
                    return empleadoRepository.save(per);
                });
    }

    /** Asegura Alumno 1:1. */
    private Alumno ensureAlumnoByPersona(Persona persona, Consumer<Alumno> patch) {
        return alumnoRepository.findByPersonaId(persona.getId())
                .orElseGet(() -> {
                    Alumno a = new Alumno();
                    a.setPersona(persona);         // << NO setId()
                    if (patch != null) patch.accept(a);
                    return alumnoRepository.save(a);
                });
    }

    /** Asegura Familiar 1:1. */
    private Familiar ensureFamiliarByPersona(Persona persona, Consumer<Familiar> patch) {
        return familiarRepository.findByPersonaId(persona.getId())
                .orElseGet(() -> {
                    Familiar f = new Familiar();
                    f.setPersona(persona);         // << NO setId()
                    if (patch != null) patch.accept(f);
                    return familiarRepository.save(f);
                });
    }

    /** Asegura Aspirante 1:1. */
    private Aspirante ensureAspiranteByPersona(Persona persona, Consumer<Aspirante> patch) {
        return aspiranteRepository.findByPersonaId(persona.getId())
                .orElseGet(() -> {
                    Aspirante a = new Aspirante();
                    a.setPersona(persona);         // << NO setId()
                    if (patch != null) patch.accept(a);
                    return aspiranteRepository.save(a);
                });
    }


    // =========================================================================
    // ESTRUCTURA Y ACADÉMICO
    // =========================================================================

    private PeriodoEscolar ensurePeriodoEscolar(int anio) {
        return periodoEscolarRepository.existsByAnio(anio)
                ? periodoEscolarRepository.findAll().stream()
                .filter(p -> Objects.equals(p.getAnio(), anio))
                .findFirst()
                .orElseGet(() -> periodoEscolarRepository.save(nuevoPeriodo(anio)))
                : periodoEscolarRepository.save(nuevoPeriodo(anio));
    }

    private PeriodoEscolar nuevoPeriodo(int anio) {
        PeriodoEscolar p = new PeriodoEscolar();
        p.setAnio(anio);
        return periodoEscolarRepository.save(p);
    }

    private Trimestre ensureTrimestre(PeriodoEscolar p, int orden, LocalDate inicio, LocalDate fin) {
        boolean exists = trimestreRepository.existsByPeriodoEscolarIdAndOrden(p.getId(), orden);
        if (exists) {
            return trimestreRepository.findAll().stream()
                    .filter(t -> t.getPeriodoEscolar() != null
                            && t.getPeriodoEscolar().getId().equals(p.getId())
                            && Integer.valueOf(orden).equals(t.getOrden()))
                    .findFirst()
                    .orElseThrow();
        }
        Trimestre t = new Trimestre();
        t.setPeriodoEscolar(p);
        t.setOrden(orden);
        t.setInicio(inicio);
        t.setFin(fin);
        // Deja abierto solo el primer trimestre del período inicial. Los restantes
        // comienzan cerrados para respetar la secuencia (solo se habilita el
        // siguiente cuando el anterior finaliza).
        t.setCerrado(orden > 1);
        return trimestreRepository.save(t);
    }

    private Seccion ensureSeccion(PeriodoEscolar p, NivelAcademico nivel, String gradoSala, String division, Turno turno) {
        boolean exists = seccionRepository
                .existsByPeriodoEscolarIdAndNivelAndGradoSalaAndDivisionAndTurno(p.getId(), nivel, gradoSala, division, turno);
        if (exists) {
            return seccionRepository.findAll().stream()
                    .filter(s -> s.getPeriodoEscolar() != null
                            && s.getPeriodoEscolar().getId().equals(p.getId())
                            && s.getNivel() == nivel
                            && gradoSala.equals(s.getGradoSala())
                            && division.equals(s.getDivision())
                            && s.getTurno() == turno)
                    .findFirst()
                    .orElseThrow();
        }
        Seccion s = new Seccion();
        s.setPeriodoEscolar(p);
        s.setNivel(nivel);
        s.setGradoSala(gradoSala);
        s.setDivision(division);
        s.setTurno(turno);
        return seccionRepository.save(s);
    }

    private Materia ensureMateria(String nombre) {
        return materiaRepository.findAll().stream()
                .filter(m -> nombre.equalsIgnoreCase(m.getNombre()))
                .findFirst()
                .orElseGet(() -> {
                    Materia m = new Materia();
                    m.setNombre(nombre);
                    return materiaRepository.save(m);
                });
    }

    private void ensureSeccionMateria(Seccion s, Materia m) {
        boolean exists = seccionMateriaRepository.findAll().stream()
                .anyMatch(sm -> sm.getSeccion().getId().equals(s.getId()) && sm.getMateria().getId().equals(m.getId()));
        if (!exists) {
            SeccionMateria sm = new SeccionMateria();
            sm.setSeccion(s);
            sm.setMateria(m);
            seccionMateriaRepository.save(sm);
        }
    }

    // =========================================================================
    // DOCENTES / ASIGNACIONES
    // =========================================================================

    /** Docente = Persona + Empleado (cargo docente). */
    private Empleado ensureDocente(String nombre, String apellido, String dni, String cuil) {
        Persona p = ensurePersona(nombre, apellido, dni);
        return ensureEmpleado(p, per -> {
            per.setCuil(cuil);
            per.setCargo("Docente");
            per.setRolEmpleado(RolEmpleado.DOCENTE);
            per.setFechaIngreso(LocalDate.of(2025, 3, 1));
        });
    }

    private void ensureTitularSeccion(Empleado docente, Seccion seccion, LocalDate desde) {
        LocalDate hasta = null; // vigente
        boolean solapa = asigSecRepo.hasTitularOverlap(
                seccion.getId(),
                desde,
                (hasta == null ? LocalDate.of(9999, 12, 31) : hasta),
                null
        );
        if (!solapa) {
            AsignacionDocenteSeccion a = new AsignacionDocenteSeccion();
            a.setSeccion(seccion);
            a.setEmpleado(docente);
            a.setRol(RolSeccion.MAESTRO_TITULAR);
            a.setVigenciaDesde(desde);
            a.setVigenciaHasta(hasta);
            asigSecRepo.save(a);
        }
    }

    private void ensureTitularMateriasDeSeccion(Empleado docente, Seccion seccion, LocalDate desde) {
        List<SeccionMateria> plan = seccionMateriaRepository.findAll().stream()
                .filter(sm -> sm.getSeccion().getId().equals(seccion.getId()))
                .collect(Collectors.toList());

        for (SeccionMateria sm : plan) {
            boolean solapa = asigMatRepo.hasTitularOverlap(sm.getId(), desde, LocalDate.of(9999, 12, 31), null);
            if (!solapa) {
                AsignacionDocenteMateria a = new AsignacionDocenteMateria();
                a.setSeccionMateria(sm);
                a.setEmpleado(docente);
                a.setRol(RolMateria.TITULAR);
                a.setVigenciaDesde(desde);
                a.setVigenciaHasta(null);
                asigMatRepo.save(a);
            }
        }
    }

    // =========================================================================
    // ALUMNOS / FAMILIA / MATRÍCULAS
    // =========================================================================

    private void crearAlumnoConFamiliaYMatricula(Seccion seccion, PeriodoEscolar periodo, LocalDate asignacionDesde, PersonaSeed... seeds) {
        for (PersonaSeed ps : seeds) {
            Alumno a = ensureAlumno(ps.nombre(), ps.apellido(), ps.dni());
            Familiar f = ensureFamiliar(ps.famNombre(), ps.famApellido(), ps.famDni());
            ensureVinculoAlumnoFamiliar(a, f, RolVinculo.MADRE, true);
            Matricula m = ensureMatricula(a, periodo);
            ensureMatriculaSeccionVigente(m, seccion, asignacionDesde);
        }
    }

    private Alumno ensureAlumno(String nombre, String apellido, String dni) {
        Persona p = ensurePersona(nombre, apellido, dni);
        return ensureAlumnoByPersona(p, x -> {});
    }

    private Familiar ensureFamiliar(String nombre, String apellido, String dni) {
        Persona p = ensurePersona(nombre, apellido, dni);
        return ensureFamiliarByPersona(p, x -> {});
    }

    private void ensureVinculoAlumnoFamiliar(Alumno a, Familiar f, RolVinculo relacion, boolean viveCon) {
        if (!alumnoFamiliarRepository.existsByAlumnoIdAndFamiliarId(a.getId(), f.getId())) {
            AlumnoFamiliar af = new AlumnoFamiliar();
            af.setAlumno(a);
            af.setFamiliar(f);
            af.setRolVinculo(relacion);
            af.setConvive(viveCon);
            alumnoFamiliarRepository.save(af);
        }
    }

    private Matricula ensureMatricula(Alumno a, PeriodoEscolar p) {
        return matriculaRepository.findByAlumnoIdAndPeriodoEscolarId(a.getId(), p.getId())
                .orElseGet(() -> {
                    Matricula m = new Matricula();
                    m.setAlumno(a);
                    m.setPeriodoEscolar(p);
                    return matriculaRepository.save(m);
                });
    }

    private void ensureMatriculaSeccionVigente(Matricula m, Seccion s, LocalDate desde) {
        List<MatriculaSeccionHistorial> vigente = matSecHistRepository.findVigente(m.getId(), desde);
        boolean yaVigente = !vigente.isEmpty()
                && vigente.stream().anyMatch(h -> h.getSeccion() != null && s.getId().equals(h.getSeccion().getId()));
        if (!yaVigente) {
            MatriculaSeccionHistorial h = new MatriculaSeccionHistorial();
            h.setMatricula(m);
            h.setSeccion(s);
            h.setDesde(desde);
            matSecHistRepository.save(h);
        }
    }

    // =========================================================================
    // ASISTENCIAS (demo)
    // =========================================================================

    @SuppressWarnings("unused")
    private void generarAsistenciasUltimos30Dias(List<Seccion> secciones, Trimestre t1, Trimestre t2, Trimestre t3) {
        LocalDate hoy = LocalDate.now();
        LocalDate inicio = hoy.minusDays(30);
        Random rnd = new Random(12345);

        for (Seccion s : secciones) {
            for (LocalDate fecha = inicio; !fecha.isAfter(hoy); fecha = fecha.plusDays(1)) {
                if (fecha.getDayOfWeek() == DayOfWeek.SATURDAY || fecha.getDayOfWeek() == DayOfWeek.SUNDAY) continue;

                Trimestre tri = pickTrimestrePorFecha(fecha, t1, t2, t3);
                if (tri == null || Boolean.TRUE.equals(tri.isCerrado())) continue;

                JornadaAsistencia j = ensureJornada(s, tri, fecha);

                LocalDate finalFecha = fecha;
                List<Matricula> mats = matriculaRepository.findAll().stream()
                        .filter(m -> {
                            List<MatriculaSeccionHistorial> h = matSecHistRepository.findVigente(m.getId(), finalFecha);
                            return h.stream().anyMatch(x -> x.getSeccion() != null && s.getId().equals(x.getSeccion().getId()));
                        })
                        .toList();

                for (Matricula m : mats) {
                    if (detalleRepo.existsByJornadaIdAndMatriculaId(j.getId(), m.getId())) continue;
                    DetalleAsistencia d = new DetalleAsistencia();
                    d.setJornada(j);
                    d.setMatricula(m);
                    boolean presente = rnd.nextDouble() < 0.88;
                    d.setEstado(presente ? EstadoAsistencia.PRESENTE : EstadoAsistencia.AUSENTE);
                    detalleRepo.save(d);
                }
            }
        }
    }

    private Trimestre pickTrimestrePorFecha(LocalDate f, Trimestre t1, Trimestre t2, Trimestre t3) {
        if (!f.isBefore(t1.getInicio()) && !f.isAfter(t1.getFin())) return t1;
        if (!f.isBefore(t2.getInicio()) && !f.isAfter(t2.getFin())) return t2;
        if (!f.isBefore(t3.getInicio()) && !f.isAfter(t3.getFin())) return t3;
        return null;
    }

    private JornadaAsistencia ensureJornada(Seccion s, Trimestre t, LocalDate fecha) {
        return jornadaRepo.findAll().stream()
                .filter(j -> j.getSeccion().getId().equals(s.getId()) && j.getFecha().equals(fecha))
                .findFirst()
                .orElseGet(() -> {
                    JornadaAsistencia j = new JornadaAsistencia();
                    j.setSeccion(s);
                    j.setTrimestre(t);
                    j.setFecha(fecha);
                    return jornadaRepo.save(j);
                });
    }

    // =========================================================================
    // ASPIRANTES
    // =========================================================================

    private Aspirante crearAspiranteConFamiliar(PersonaSeed seed) {
        Aspirante a = ensureAspirante(seed.nombre(), seed.apellido(), seed.dni());
        Familiar f = ensureFamiliar(seed.famNombre(), seed.famApellido(), seed.famDni());
        ensureVinculoAspiranteFamiliar(a, f, RolVinculo.MADRE, false);
        return a;
    }
    private void crearSolicitudesDemostracion(Aspirante aspirantePendiente, Aspirante aspiranteProgramado) {
        if (aspirantePendiente != null) {
            crearSolicitudAdmision(aspirantePendiente, solicitud -> {
                LocalDate hoy = LocalDate.now();
                solicitud.setEstado("PROPUESTA_ENVIADA");
                solicitud.setPropuestaFecha1(hoy.plusDays(7));
                solicitud.setPropuestaFecha2(hoy.plusDays(9));
                solicitud.setPropuestaFecha3(hoy.plusDays(11));
                solicitud.setFechaLimiteRespuesta(hoy.plusDays(15));
                solicitud.setCupoDisponible(true);
                solicitud.setDisponibilidadCurso("Vacante disponible");
                solicitud.setDocumentosRequeridos("DNI del alumno y familia\nCertificado de nacimiento");
                solicitud.setAdjuntosInformativos("https://institucion.example/plan.pdf||https://institucion.example/normativa.pdf");
                solicitud.setEmailConfirmacionEnviado(true);
            });
        }

        if (aspiranteProgramado != null) {
            crearSolicitudAdmision(aspiranteProgramado, solicitud -> {
                LocalDate hoy = LocalDate.now();
                solicitud.setEstado("ENTREVISTA_PROGRAMADA");
                solicitud.setPropuestaFecha1(hoy.plusDays(-5));
                solicitud.setPropuestaFecha2(hoy.plusDays(-3));
                solicitud.setPropuestaFecha3(hoy.plusDays(-1));
                solicitud.setFechaLimiteRespuesta(hoy.minusDays(10));
                solicitud.setFechaRespuestaFamilia(hoy.minusDays(9));
                solicitud.setFechaEntrevista(hoy.plusDays(2));
                solicitud.setCupoDisponible(true);
                solicitud.setDisponibilidadCurso("Entrevista programada");
                solicitud.setDocumentosRequeridos("Carpeta médica\nBoletín escolar");
                solicitud.setAdjuntosInformativos("https://institucion.example/proyecto.pdf");
                solicitud.setNotasDireccion("Familia solicitó entrevista vespertina.");
                solicitud.setEmailConfirmacionEnviado(true);
            });
        }
    }

    private void crearSolicitudAdmision(Aspirante aspirante, java.util.function.Consumer<SolicitudAdmision> patch) {
        if (solicitudAdmisionRepository.existsByAspiranteId(aspirante.getId())) {
            return;
        }
        SolicitudAdmision solicitud = new SolicitudAdmision();
        solicitud.setAspirante(aspirante);
        solicitud.setEstado("PENDIENTE");
        solicitud.setCupoDisponible(Boolean.FALSE);
        patch.accept(solicitud);
        solicitudAdmisionRepository.save(solicitud);
    }

    private Aspirante ensureAspirante(String nombre, String apellido, String dni) {
        Persona p = ensurePersona(nombre, apellido, dni);
        return ensureAspiranteByPersona(p, x -> {});
    }

    private void ensureVinculoAspiranteFamiliar(Aspirante a, Familiar f, RolVinculo relacion, boolean viveCon) {
        if (!aspiranteFamiliarRepository.existsByAspiranteIdAndFamiliarId(a.getId(), f.getId())) {
            AspiranteFamiliar af = new AspiranteFamiliar();
            af.setAspirante(a);
            af.setFamiliar(f);
            af.setRolVinculo(relacion);
            af.setConvive(viveCon);
            aspiranteFamiliarRepository.save(af);
        }
    }

    // =========================================================================
    // USUARIO DOCENTE DEMO + ASIGNACIONES EXTRA
    // =========================================================================

    /**
     * Asocia el usuario docente@example.com al empleado recibido y lo asigna a la sección dada.
     * Además:
     *  - crea 4° B (Tarde) con plan y alumnos,
     *  - crea un docente de INICIAL con usuario y dos salas.
     */
    private void ensureDocenteDemoUserYAsignacion(Empleado docentePrimario, Seccion seccionPrimariaExistente) {
        final String emailPrim = "docente@example.com";
        Persona perDoc = docentePrimario.getPersona();
        ensurePersonaCredentials(perDoc, emailPrim, "docente123", Set.of(UserRole.USER, UserRole.TEACHER));

        // Asignación vigente a la sección pasada por parámetro
        LocalDate hoy = LocalDate.now();
        boolean yaAsignado = asigSecRepo.findAll().stream().anyMatch(a ->
                a.getSeccion() != null && seccionPrimariaExistente.getId().equals(a.getSeccion().getId()) &&
                        a.getEmpleado() != null && docentePrimario.getId().equals(a.getEmpleado().getId()) &&
                        vigente(a.getVigenciaDesde(), a.getVigenciaHasta(), hoy)
        );
        if (!yaAsignado) {
            boolean hayTitularVig = asigSecRepo.findAll().stream().anyMatch(a ->
                    a.getSeccion() != null && seccionPrimariaExistente.getId().equals(a.getSeccion().getId()) &&
                            a.getRol() == RolSeccion.MAESTRO_TITULAR && vigente(a.getVigenciaDesde(), a.getVigenciaHasta(), hoy)
            );
            AsignacionDocenteSeccion asig = new AsignacionDocenteSeccion();
            asig.setSeccion(seccionPrimariaExistente);
            asig.setEmpleado(docentePrimario);
            asig.setRol(hayTitularVig ? RolSeccion.PRECEPTOR : RolSeccion.MAESTRO_TITULAR);
            asig.setVigenciaDesde(hoy.withDayOfMonth(1));
            asig.setVigenciaHasta(null);
            asigSecRepo.save(asig);
        }

        // Extra: agregar 4° B (Tarde) al docente primario con plan y alumnos
        PeriodoEscolar periodo = seccionPrimariaExistente.getPeriodoEscolar() != null
                ? seccionPrimariaExistente.getPeriodoEscolar()
                : ensurePeriodoEscolar(LocalDate.now().getYear());

        Seccion sec4B = ensureSeccion(periodo, NivelAcademico.PRIMARIO, "4°", "B", Turno.TARDE);

        ensureTitularSeccion(docentePrimario, sec4B, hoy.withDayOfMonth(1));
        Materia lengua = ensureMateria("Lengua");
        Materia matematica = ensureMateria("Matemática");
        ensureSeccionMateria(sec4B, lengua);
        ensureSeccionMateria(sec4B, matematica);

        LocalDate asignacionDesde = LocalDate.of(
                periodo.getAnio() != null ? periodo.getAnio() : LocalDate.now().getYear(),
                3, 3);
        crearAlumnoConFamiliaYMatricula(
                sec4B, periodo, asignacionDesde,
                new PersonaSeed("Juan", "Pérez", "50010001", "Carlos", "Pérez", "30020001"),
                new PersonaSeed("María", "González", "50010002", "Laura", "González", "30020002"),
                new PersonaSeed("Lucas", "Benítez", "50010003", "Ana", "Benítez", "30020003")
        );

        // Docente de INICIAL con dos salas
        final String emailIni = "inicial@example.com";
        Empleado docenteInicial = ensureDocente("Ana", "López", "40222333", "20111222330");
        Persona perIni = docenteInicial.getPersona();
        ensurePersonaCredentials(perIni, emailIni, "inicial123", Set.of(UserRole.USER, UserRole.TEACHER));

        Seccion sala4_2A = ensureSeccion(periodo, NivelAcademico.INICIAL, "Sala 4", "A", Turno.MANANA);
        Seccion sala5_3B = ensureSeccion(periodo, NivelAcademico.INICIAL, "Sala 5", "B", Turno.TARDE);

        ensureTitularSeccion(docenteInicial, sala4_2A, hoy.withDayOfMonth(1));
        ensureTitularSeccion(docenteInicial, sala5_3B, hoy.withDayOfMonth(1));

        LocalDate asignacionDesdeIni = LocalDate.of(
                periodo.getAnio() != null ? periodo.getAnio() : LocalDate.now().getYear(),
                3, 3);

        crearAlumnoConFamiliaYMatricula(
                sala4_2A, periodo, asignacionDesdeIni,
                new PersonaSeed("Valentina", "Ortiz", "51010001", "María", "Ortiz", "31040001"),
                new PersonaSeed("Benjamín", "Luna",  "51010002", "Juan",  "Luna",  "31040002"),
                new PersonaSeed("Emma",      "Suarez","51010003", "Paula", "Suarez","31040003")
        );

        crearAlumnoConFamiliaYMatricula(
                sala5_3B, periodo, asignacionDesdeIni,
                new PersonaSeed("Thiago", "Molina", "51020001", "Laura", "Molina", "31050001"),
                new PersonaSeed("Mora",   "Rojas",  "51020002", "Carlos","Rojas",  "31050002"),
                new PersonaSeed("Sofia",  "Ibarra", "51020003", "Andrea","Ibarra", "31050003")
        );
        crearAspiranteConFamiliar(new PersonaSeed("Sofía", "Ramírez", "70030001", "Paula", "Ramírez", "31030001"));
    }

    // =========================================================================
    // UTILIDADES
    // =========================================================================

    private record PersonaSeed(String nombre, String apellido, String dni,
                               String famNombre, String famApellido, String famDni) {}

    private boolean vigente(LocalDate desde, LocalDate hasta, LocalDate f) {
        boolean okDesde = (desde == null) || !f.isBefore(desde);
        boolean okHasta = (hasta == null) || !f.isAfter(hasta);
        return okDesde && okHasta;
    }
}
