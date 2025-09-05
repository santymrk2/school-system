package edu.ecep.base_app;
//⚡

import edu.ecep.base_app.domain.*;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.domain.enums.*;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    // Mantener: dependencias usadas en ensureAdminAndUser()
    private final UsuarioRepository usuarioRepository;
    private final PersonalRepository personalRepository;
    private final PasswordEncoder encoder;

    // Repos usados por el set de datos
    private final PeriodoEscolarRepository periodoEscolarRepository;
    private final TrimestreRepository trimestreRepository;
    private final SeccionRepository seccionRepository;
    private final MateriaRepository materiaRepository;
    private final SeccionMateriaRepository seccionMateriaRepository;

    private final AlumnoRepository alumnoRepository;
    private final FamiliarRepository familiarRepository;
    private final AlumnoFamiliarRepository alumnoFamiliarRepository;

    private final MatriculaRepository matriculaRepository;
    private final MatriculaSeccionHistorialRepository matSecHistRepository;

    private final AsignacionDocenteSeccionRepository asigSecRepo;
    private final AsignacionDocenteMateriaRepository asigMatRepo;

    private final JornadaAsistenciaRepository jornadaRepo;
    private final DetalleAsistenciaRepository detalleRepo;

    // Aspirantes (si forman parte de tu modelo)
    private final AspiranteRepository aspiranteRepository;
    private final AspiranteFamiliarRepository aspiranteFamiliarRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Iniciando carga de datos de prueba...");

        // 0) Usuarios base (NO TOCAR)
        ensureAdminAndUser();

        // 1) Período 2025 + trimestres
        PeriodoEscolar p2025 = ensurePeriodoEscolar(2025);
        Trimestre t1 = ensureTrimestre(p2025, 1, LocalDate.of(2025, 3, 1), LocalDate.of(2025, 5, 31));
        Trimestre t2 = ensureTrimestre(p2025, 2, LocalDate.of(2025, 6, 1), LocalDate.of(2025, 8, 31));
        Trimestre t3 = ensureTrimestre(p2025, 3, LocalDate.of(2025, 9, 1), LocalDate.of(2025, 11, 30));

        // 2) Secciones
        //Seccion inicialSala4A = ensureSeccion(p2025, NivelAcademico.INICIAL, "Sala 4", "A", Turno.MANANA);
        //Seccion inicialSala5A = ensureSeccion(p2025, NivelAcademico.INICIAL, "Sala 5", "A", Turno.TARDE);
        Seccion primario1A    = ensureSeccion(p2025, NivelAcademico.PRIMARIO, "1°", "A", Turno.MANANA);
        Seccion primario2A    = ensureSeccion(p2025, NivelAcademico.PRIMARIO, "2°", "A", Turno.TARDE);

        // 3) Materias base y plan (solo PRIMARIO)
        Materia lengua     = ensureMateria("Lengua");
        Materia matematica = ensureMateria("Matemática");
        ensureSeccionMateria(primario1A, lengua);
        ensureSeccionMateria(primario1A, matematica);
        ensureSeccionMateria(primario2A, lengua);
        ensureSeccionMateria(primario2A, matematica);

        // 4) Docente titular por sección y mismo titular en materias de esa sección
        LocalDate vigenciaTitularDesde = LocalDate.of(2025, 3, 1);
        Personal docInicial4A = ensureDocente("Carla", "Rivas", "30111222", "20111222336");
        Personal docInicial5A = ensureDocente("Diego", "Luna", "30111223", "20111222337");
        Personal docPrim1A    = ensureDocente("Mariana", "Suárez", "30111224", "20111222338");
        Personal docPrim2A    = ensureDocente("Federico", "Acosta", "30111225", "20111222339");

        //ensureTitularSeccion(docInicial4A, inicialSala4A, vigenciaTitularDesde);
        //ensureTitularSeccion(docInicial5A, inicialSala5A, vigenciaTitularDesde);
        ensureTitularSeccion(docPrim1A,    primario1A,    vigenciaTitularDesde);
        ensureTitularSeccion(docPrim2A,    primario2A,    vigenciaTitularDesde);

        ensureTitularMateriasDeSeccion(docPrim1A, primario1A, vigenciaTitularDesde);
        ensureTitularMateriasDeSeccion(docPrim2A, primario2A, vigenciaTitularDesde);
        // (Inicial no tiene plan de materias en este set, así que no asignamos materias allí)

        // 5) Alumnos + familiares (3 por sección) + matrículas + asignación vigente
        LocalDate desde = LocalDate.of(2025, 3, 3);

        /*
        // INICIAL - Sala 4 A
        crearAlumnoConFamiliaYMatricula(inicialSala4A, p2025, desde,
                new PersonaSeed("Sofía", "Gómez", "45000001", "María", "Gómez", "32000001"),
                new PersonaSeed("Mateo", "Fernández", "45000002", "Laura", "Fernández", "32000002"),
                new PersonaSeed("Valentina", "López", "45000003", "Carolina", "López", "32000003"));

        // INICIAL - Sala 5 A
        crearAlumnoConFamiliaYMatricula(inicialSala5A, p2025, desde,
                new PersonaSeed("Lucas", "Martínez", "45000004", "Paula", "Martínez", "32000004"),
                new PersonaSeed("Emma", "Rodríguez", "45000005", "Ana", "Rodríguez", "32000005"),
                new PersonaSeed("Benjamín", "Torres", "45000006", "Sabrina", "Torres", "32000006"));
*/
        // PRIMARIO - 1° A
        crearAlumnoConFamiliaYMatricula(primario1A, p2025, desde,
                new PersonaSeed("Tomás", "González", "43000001", "Nadia", "González", "31000001"),
                new PersonaSeed("Martina", "Sánchez", "43000002", "Rocío", "Sánchez", "31000002"),
                new PersonaSeed("Isabella", "Romero", "43000003", "Gabriela", "Romero", "31000003"));

        // PRIMARIO - 2° A
        crearAlumnoConFamiliaYMatricula(primario2A, p2025, desde,
                new PersonaSeed("Santiago", "Castro", "42000001", "Luciana", "Castro", "30000001"),
                new PersonaSeed("Juan Ignacio", "Álvarez", "42000002", "Daniela", "Álvarez", "30000002"),
                new PersonaSeed("Mía", "Herrera", "42000003", "Patricia", "Herrera", "30000003"));

        // 6) Aspirantes de ejemplo (con familiar)
        crearAspiranteConFamiliar(new PersonaSeed("Agustín", "Pereyra", "47000001", "Mónica", "Pereyra", "33000001"));
        crearAspiranteConFamiliar(new PersonaSeed("Camila", "Vega",     "47000002", "Eliana", "Vega",     "33000002"));

        // 7) Asistencias de los últimos 30 días hábiles, random
        //generarAsistenciasUltimos30Dias(Arrays.asList(inicialSala4A, inicialSala5A, primario1A, primario2A), t1, t2, t3);
// después de crear secciones/docentes/matrículas:
        ensureDocenteDemoUserYAsignacion(docPrim1A, primario1A);

        log.info("⚡ Carga de datos completada.");
    }

    // =========================
    // BLOQUE ORIGINAL: NO TOCAR
    // =========================
    private void ensureAdminAndUser() {
        if (!usuarioRepository.existsByEmail("admin@example.com")) {
            Usuario admin = new Usuario();
            admin.setEmail("admin@example.com");
            admin.setPassword(encoder.encode("admin123"));
            admin.setUserRoles(Set.of(UserRole.ADMIN, UserRole.TEACHER, UserRole.ALTERNATE, UserRole.FAMILY, UserRole.DIRECTOR));
            usuarioRepository.save(admin);
            log.info("Usuario ADMIN creado: admin@example.com");

            Personal directora = new Personal();
            directora.setNombre("Nancy");
            directora.setApellido("Carbone");
            directora.setDni("9999999");
            directora.setCuil("20123456789");
            directora.setUsuario(admin);
            personalRepository.save(directora);
            log.info("Personal ‘Nancy Carbone’ vinculado a admin@example.com");
        } else {
            Usuario admin = usuarioRepository.findByEmail("admin@example.com").orElseThrow();
            if (personalRepository.findByUsuario(admin).isEmpty()) {
                Personal directora = new Personal();
                directora.setNombre("Nancy");
                directora.setApellido("Carbone");
                directora.setDni("9999999");
                directora.setCuil("20123456789");
                directora.setUsuario(admin);
                personalRepository.save(directora);
                log.info("Personal ‘Nancy Carbone’ creado para admin@example.com");
            }
        }

        if (!usuarioRepository.existsByEmail("user@example.com")) {
            Usuario user = new Usuario();
            user.setEmail("user@example.com");
            user.setPassword(encoder.encode("user123"));
            user.setUserRoles(Set.of( UserRole.SECRETARY));
            usuarioRepository.save(user);
            log.info("Usuario USER creado: user@example.com");

            Personal p = new Personal();
            p.setNombre("Josefina");
            p.setApellido("Bacan");
            p.setDni("88888888");
            p.setCuil("2888888885");
            p.setFechaNacimiento(LocalDate.of(1920, 5, 15));
            p.setGenero("Masculino");
            p.setEstadoCivil("Casado");
            p.setNacionalidad("Bolivia");
            p.setDomicilio("Calle Falsa 3");
            p.setTelefono("12344321");
            p.setCargo("Limpieza");
            p.setFechaIngreso(LocalDate.now());
            p.setCelular("1231434321");
            p.setObservacionesGenerales("");
            p.setUsuario(user);
            personalRepository.save(p);
            log.info("Personal ‘Josefina Bacan’ vinculado a user@example.com");
        } else {
            Usuario user = usuarioRepository.findByEmail("user@example.com").orElseThrow();
            if (personalRepository.findByUsuario(user).isEmpty()) {
                Personal p = new Personal();
                p.setNombre("Josefina");
                p.setApellido("Bacan");
                p.setDni("88888888");
                p.setCuil("2888888885");
                p.setFechaNacimiento(LocalDate.of(1920, 5, 15));
                p.setGenero("Masculino");
                p.setEstadoCivil("Casado");
                p.setNacionalidad("Bolivia");
                p.setDomicilio("Calle Falsa 3");
                p.setTelefono("12344321");
                p.setCargo("Limpieza");
                p.setFechaIngreso(LocalDate.now());
                p.setCelular("1231434321");
                p.setObservacionesGenerales("");
                p.setUsuario(user);
                personalRepository.save(p);
                log.info("Personal ‘Josefina Bacan’ creado para user@example.com");
            }
        }
    }

    // ========================
    // MÉTODOS AUXILIARES
    // ========================

    private PeriodoEscolar ensurePeriodoEscolar(int anio) {
        return periodoEscolarRepository.existsByAnio(anio)
                ? periodoEscolarRepository.findAll().stream()
                .filter(p -> p.getAnio() != null && p.getAnio() == anio)
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
        t.setCerrado(false);
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

    private Personal ensureDocente(String nombre, String apellido, String dni, String cuil) {
        return personalRepository.findAll().stream()
                .filter(p -> p.getDni() != null && p.getDni().equals(dni))
                .findFirst()
                .orElseGet(() -> {
                    Personal p = new Personal();
                    p.setNombre(nombre);
                    p.setApellido(apellido);
                    p.setDni(dni);
                    p.setCuil(cuil); // ahora nullable, pero cargamos valor para evitar colisiones
                    p.setFechaIngreso(LocalDate.of(2025, 3, 1));
                    p.setCargo("Docente");
                    return personalRepository.save(p);
                });
    }

    private void ensureTitularSeccion(Personal docente, Seccion seccion, LocalDate desde) {
        LocalDate hasta = null; // vigente
        boolean solapa = asigSecRepo.hasTitularOverlap(seccion.getId(), desde, hasta == null ? LocalDate.of(9999, 12, 31) : hasta, null);
        if (!solapa) {
            AsignacionDocenteSeccion a = new AsignacionDocenteSeccion();
            a.setSeccion(seccion);
            a.setPersonal(docente);
            a.setRol(RolSeccion.MAESTRO_TITULAR);
            a.setVigenciaDesde(desde);
            a.setVigenciaHasta(hasta);
            asigSecRepo.save(a);
        }
    }

    private void ensureTitularMateriasDeSeccion(Personal docente, Seccion seccion, LocalDate desde) {
        List<SeccionMateria> plan = seccionMateriaRepository.findAll().stream()
                .filter(sm -> sm.getSeccion().getId().equals(seccion.getId()))
                .collect(Collectors.toList());

        for (SeccionMateria sm : plan) {
            boolean solapa = asigMatRepo.hasTitularOverlap(sm.getId(), desde, LocalDate.of(9999, 12, 31), null);
            if (!solapa) {
                AsignacionDocenteMateria a = new AsignacionDocenteMateria();
                a.setSeccionMateria(sm);
                a.setPersonal(docente);
                a.setRol(RolMateria.TITULAR);
                a.setVigenciaDesde(desde);
                a.setVigenciaHasta(null);
                asigMatRepo.save(a);
            }
        }
    }

    private void crearAlumnoConFamiliaYMatricula(Seccion seccion, PeriodoEscolar periodo, LocalDate asignacionDesde, PersonaSeed... seeds) {
        for (PersonaSeed ps : seeds) {
            Alumno a = ensureAlumno(ps.nombre, ps.apellido, ps.dni);
            Familiar f = ensureFamiliar(ps.famNombre, ps.famApellido, ps.famDni);
            ensureVinculoAlumnoFamiliar(a, f, "MADRE", true);
            Matricula m = ensureMatricula(a, periodo);
            ensureMatriculaSeccionVigente(m, seccion, asignacionDesde);
        }
    }

    private Alumno ensureAlumno(String nombre, String apellido, String dni) {
        return alumnoRepository.findAll().stream()
                .filter(a -> dni.equals(a.getDni()))
                .findFirst()
                .orElseGet(() -> {
                    Alumno a = new Alumno();
                    a.setNombre(nombre);
                    a.setApellido(apellido);
                    a.setDni(dni);
                    return alumnoRepository.save(a);
                });
    }

    private Familiar ensureFamiliar(String nombre, String apellido, String dni) {
        return familiarRepository.findAll().stream()
                .filter(f -> dni.equals(f.getDni()))
                .findFirst()
                .orElseGet(() -> {
                    Familiar f = new Familiar();
                    f.setNombre(nombre);
                    f.setApellido(apellido);
                    f.setDni(dni);
                    return familiarRepository.save(f);
                });
    }

    private void ensureVinculoAlumnoFamiliar(Alumno a, Familiar f, String relacion, boolean viveCon) {
        if (!alumnoFamiliarRepository.existsByAlumnoIdAndFamiliarId(a.getId(), f.getId())) {
            AlumnoFamiliar af = new AlumnoFamiliar();
            af.setAlumno(a);
            af.setFamiliar(f);
            af.setTipoRelacion(relacion);
            af.setViveConAlumno(viveCon);
            alumnoFamiliarRepository.save(af);
        }
    }
    private void ensureVinculoAspiranteFamiliar(Aspirante a, Familiar f, String relacion, boolean viveCon) {
        if (!aspiranteFamiliarRepository.existsByAspiranteIdAndFamiliarId(a.getId(), f.getId())) {
            AspiranteFamiliar af = new AspiranteFamiliar();
            af.setAspirante(a);
            af.setFamiliar(f);
            af.setTipoRelacion(relacion);
            af.setViveConAlumno(viveCon); // <<< evita NULL
            aspiranteFamiliarRepository.save(af);
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

    private void generarAsistenciasUltimos30Dias(List<Seccion> secciones, Trimestre t1, Trimestre t2, Trimestre t3) {
        LocalDate hoy = LocalDate.now();
        LocalDate inicio = hoy.minusDays(30);
        Random rnd = new Random(12345); // semilla fija para que sea reproducible

        for (Seccion s : secciones) {
            for (LocalDate fecha = inicio; !fecha.isAfter(hoy); fecha = fecha.plusDays(1)) {
                if (fecha.getDayOfWeek() == DayOfWeek.SATURDAY || fecha.getDayOfWeek() == DayOfWeek.SUNDAY) continue;

                Trimestre tri = pickTrimestrePorFecha(fecha, t1, t2, t3);
                if (tri == null || tri.isCerrado()) continue;

                JornadaAsistencia j = ensureJornada(s, tri, fecha);

                // buscar matrículas vigentes en esa fecha para la sección
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
                    boolean presente = rnd.nextDouble() < 0.88; // ~88% presente
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
        // (si corrés en meses fuera de [Mar-Nov], se omiten esas fechas)
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

    // Aspirantes
    private void crearAspiranteConFamiliar(PersonaSeed seed) {
        Aspirante a = ensureAspirante(seed.nombre, seed.apellido, seed.dni);
        Familiar f = ensureFamiliar(seed.famNombre, seed.famApellido, seed.famDni);
        ensureVinculoAspiranteFamiliar(a, f, "MADRE", false);
    }

    private Aspirante ensureAspirante(String nombre, String apellido, String dni) {
        return aspiranteRepository.findAll().stream()
                .filter(x -> dni.equals(x.getDni()))
                .findFirst()
                .orElseGet(() -> {
                    Aspirante a = new Aspirante();
                    a.setNombre(nombre);
                    a.setApellido(apellido);
                    a.setDni(dni);
                    return aspiranteRepository.save(a);
                });
    }

    // Helper simple para agrupar datos de persona + familiar
    private record PersonaSeed(String nombre, String apellido, String dni,
                               String famNombre, String famApellido, String famDni) {}



    /** Helper simple para evaluar vigencia con fechas inclusive. */
    private boolean vigente(LocalDate desde, LocalDate hasta, LocalDate f) {
        boolean okDesde = (desde == null) || !f.isBefore(desde);
        boolean okHasta = (hasta == null) || !f.isAfter(hasta);
        return okDesde && okHasta;
    }

    /**
     * Asocia el usuario docente@example.com al personal recibido y lo asigna a la sección dada.
     * Además:
     *  - le agrega como titular otra sección de PRIMARIO (4° B - Tarde),
     *  - crea 3 alumnos con sus familias en 4° B,
     *  - crea un nuevo docente de INICIAL (inicial@example.com) y lo asigna a:
     *      Sala 4 — "2da Sección A" (Mañana) y Sala 5 — "3ra Sección B" (Tarde).
     *
     * Usa únicamente helpers ya existentes en este DataLoader.
     */
    private void ensureDocenteDemoUserYAsignacion(Personal docentePrimario, Seccion seccionPrimariaExistente) {
        // ===== Usuario docente de PRIMARIO =====
        final String emailPrim = "docente@example.com";
        Usuario uPrim = usuarioRepository.findByEmail(emailPrim).orElseGet(() -> {
            Usuario nu = new Usuario();
            nu.setEmail(emailPrim);
            nu.setPassword(encoder.encode("docente123"));
            nu.setUserRoles(Set.of(UserRole.TEACHER));
            return usuarioRepository.save(nu);
        });
        // Asegurar rol TEACHER
        if (uPrim.getUserRoles() == null || !uPrim.getUserRoles().contains(UserRole.TEACHER)) {
            var roles = uPrim.getUserRoles() == null ? new java.util.HashSet<UserRole>() : new java.util.HashSet<>(uPrim.getUserRoles());
            roles.add(UserRole.USER);
            roles.add(UserRole.TEACHER);
            uPrim.setUserRoles(roles);
            usuarioRepository.save(uPrim);
        }
        // Vincular usuario ↔ personal (primario)
        if (docentePrimario.getUsuario() == null || !java.util.Objects.equals(docentePrimario.getUsuario().getId(), uPrim.getId())) {
            docentePrimario.setUsuario(uPrim);
            personalRepository.save(docentePrimario);
        }

        // Asignación vigente a la sección pasada por parámetro (si no la tenía)
        LocalDate hoy = LocalDate.now();
        boolean yaAsignado = asigSecRepo.findAll().stream().anyMatch(a ->
                a.getSeccion() != null && seccionPrimariaExistente.getId().equals(a.getSeccion().getId()) &&
                        a.getPersonal() != null && docentePrimario.getId().equals(a.getPersonal().getId()) &&
                        vigente(a.getVigenciaDesde(), a.getVigenciaHasta(), hoy)
        );
        if (!yaAsignado) {
            // si hay titular vigente, lo cargamos como PRECEPTOR; si no, como TITULAR
            boolean hayTitularVig = asigSecRepo.findAll().stream().anyMatch(a ->
                    a.getSeccion() != null && seccionPrimariaExistente.getId().equals(a.getSeccion().getId()) &&
                            a.getRol() == RolSeccion.MAESTRO_TITULAR && vigente(a.getVigenciaDesde(), a.getVigenciaHasta(), hoy)
            );
            AsignacionDocenteSeccion asig = new AsignacionDocenteSeccion();
            asig.setSeccion(seccionPrimariaExistente);
            asig.setPersonal(docentePrimario);
            asig.setRol(hayTitularVig ? RolSeccion.PRECEPTOR : RolSeccion.MAESTRO_TITULAR);
            asig.setVigenciaDesde(hoy.withDayOfMonth(1));
            asig.setVigenciaHasta(null);
            asigSecRepo.save(asig);
        }

        // =========================
        // Extra: agregar 4° B (Tarde) al docente primario y alumnos/familias
        // =========================
        // PeriodoEscolar base (toma el de la sección pasada o crea 2025)
        PeriodoEscolar periodo = seccionPrimariaExistente.getPeriodoEscolar() != null
                ? seccionPrimariaExistente.getPeriodoEscolar()
                : ensurePeriodoEscolar(LocalDate.now().getYear());

        // Asegurar sección 4° B (Tarde) en PRIMARIO
        Seccion sec4B = ensureSeccion(periodo, NivelAcademico.PRIMARIO, "4°", "B", Turno.TARDE);

        // Poner a la misma docente como titular en 4° B
        ensureTitularSeccion(docentePrimario, sec4B, hoy.withDayOfMonth(1));
        // Plan de materias para 4° B (Lengua y Matemática ya existen por helper)
        Materia lengua = ensureMateria("Lengua");
        Materia matematica = ensureMateria("Matemática");
        ensureSeccionMateria(sec4B, lengua);
        ensureSeccionMateria(sec4B, matematica);

        // 3 alumnos con sus familias en 4° B (para probar evaluaciones)
        LocalDate asignacionDesde = LocalDate.of(periodo.getAnio() != null ? periodo.getAnio() : LocalDate.now().getYear(), 3, 3);
        crearAlumnoConFamiliaYMatricula(
                sec4B, periodo, asignacionDesde,
                new PersonaSeed("Juan", "Pérez", "50010001", "Carlos", "Pérez", "30020001"),
                new PersonaSeed("María", "González", "50010002", "Laura", "González", "30020002"),
                new PersonaSeed("Lucas", "Benítez", "50010003", "Ana", "Benítez", "30020003")
        );

        // =========================
        // Docente de INICIAL con dos salas (2da Sección A / 3ra Sección B)
        // =========================
        final String emailIni = "inicial@example.com";
        Usuario uIni = usuarioRepository.findByEmail(emailIni).orElseGet(() -> {
            Usuario nu = new Usuario();
            nu.setEmail(emailIni);
            nu.setPassword(encoder.encode("inicial123"));
            nu.setUserRoles(Set.of(UserRole.TEACHER));
            return usuarioRepository.save(nu);
        });
        if (uIni.getUserRoles() == null || !uIni.getUserRoles().contains(UserRole.TEACHER)) {
            var roles = uIni.getUserRoles() == null ? new java.util.HashSet<UserRole>() : new java.util.HashSet<>(uIni.getUserRoles());
            roles.add(UserRole.USER);
            roles.add(UserRole.TEACHER);
            uIni.setUserRoles(roles);
            usuarioRepository.save(uIni);
        }

        // Personal para INICIAL
        Personal docenteInicial = personalRepository.findAll().stream()
                .filter(p -> "40222333".equals(p.getDni()))
                .findFirst()
                .orElseGet(() -> ensureDocente("Ana", "López", "40222333", "20111222330"));

        if (docenteInicial.getUsuario() == null || !java.util.Objects.equals(docenteInicial.getUsuario().getId(), uIni.getId())) {
            docenteInicial.setUsuario(uIni);
            personalRepository.save(docenteInicial);
        }

        // Salas solicitadas:
        Seccion sala4_2A = ensureSeccion(periodo, NivelAcademico.INICIAL, "Sala 4", "A", Turno.MANANA);
        Seccion sala5_3B = ensureSeccion(periodo, NivelAcademico.INICIAL, "Sala 5", "B", Turno.TARDE);

        ensureTitularSeccion(docenteInicial, sala4_2A, hoy.withDayOfMonth(1));
        ensureTitularSeccion(docenteInicial, sala5_3B, hoy.withDayOfMonth(1));

        // (Opcional) Un alumno de muestra en Sala 4 para probar pantallas
        crearAlumnoConFamiliaYMatricula(
                sala4_2A, periodo, asignacionDesde,
                new PersonaSeed("Sofía", "Ramírez", "70030001", "Paula", "Ramírez", "31030001")
        );
    }

}