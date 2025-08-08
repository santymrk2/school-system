package edu.ecep.base_app;
//⚡

import edu.ecep.base_app.domain.*;
import edu.ecep.base_app.domain.enums.EstadoMatricula;
import edu.ecep.base_app.domain.enums.UserRole;
import edu.ecep.base_app.domain.enums.Turno;
import edu.ecep.base_app.repos.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.RoundingMode;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

/**
 * DataLoader que rellena la base de datos con datos de prueba para todas las entidades.
 * Incluye la creación de los usuarios admin@example.com y user@example.com con sus perfiles,
 * y genera datos para todas las demás entidades sin depender de archivos externos.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PersonalRepository personalRepository;
    private final SeccionRepository seccionRepository;
    private final MateriaRepository materiaRepository;
    private final AlumnoRepository alumnoRepository;
    private final AspiranteRepository aspiranteRepository;
    private final FamiliarRepository familiarRepository;
    private final MatriculaRepository matriculaRepository;
    private final CuotaRepository cuotaRepository;
    private final PagoCuotaRepository pagoCuotaRepository;
    private final CalificacionRepository calificacionRepository;
    private final InformeInicialRepository informeInicialRepository;
    private final ActaAccidenteRepository actaAccidenteRepository;
    private final SolicitudAdmisionRepository solicitudAdmisionRepository;
    private final AspiranteFamiliarRepository aspiranteFamiliarRepository;
    private final AlumnoFamiliarRepository alumnoFamiliarRepository;
    private final AsignacionDocenteRepository asignacionDocenteRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final DiaNoHabilRepository diaNoHabilRepository;
    private final ComunicadoRepository comunicadoRepository;
    private final FormacionAcademicaRepository formacionAcademicaRepository;
    private final AsistenciaDiaRepository asistenciaDiaRepository;
    private final RegistroAsistenciaRepository registroAsistenciaRepository;
    private final AsistenciaPersonalRepository asistenciaPersonalRepository;
    private final LicenciaRepository licenciaRepository;
    private final ReciboSueldoRepository reciboSueldoRepository;
    private final PasswordEncoder encoder;

    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Iniciando carga de datos de prueba...");

        // 0) Aseguramos admin@example.com y user@example.com
        ensureAdminAndUser();

        // 1) Secciones y materias
        List<Seccion> secciones = createSecciones();
        List<Materia> materias  = createMaterias();

        // 2) Alumnos y matrículas
        List<Alumno> alumnos    = createAlumnos();
        List<Matricula> matriculas = createMatriculas(alumnos, secciones);

        // 3) Cuotas y pagos
        List<Cuota> cuotas = createCuotas(secciones);
        createPagos(cuotas, matriculas);

        // 4) Informes y actas
        createInformeIniciales(matriculas);
        createActaAccidentes(matriculas, alumnos);

        // 5) Aspirantes y admisiones
        List<Aspirante> aspirantes = createAspirantes();
        createSolicitudesAdmision(aspirantes);

        // 6) Familiares y vínculos
        List<Familiar> familiares = createFamiliares();
        createAlumnoFamiliar(alumnos, familiares);
        createAspiranteFamiliar(aspirantes, familiares);

        // 7) Personal y asignaciones docentes
        List<Personal> personalList = createStaff();
        createAsignacionDocentes(personalList, secciones, materias);

        // 8) Calificaciones y evaluaciones
        createCalificaciones(matriculas, materias);
        createEvaluaciones(secciones, materias);

        // 9) Días no hábiles y comunicados
        createDiasNoHabiles();
        createComunicados(secciones);

        // 10) Formación académica
        createFormacionesAcademicas();

        // 11) Asistencias y registros
        List<AsistenciaDia> asistenciasDias = createAsistenciaDias(secciones);
        createRegistroAsistencias(asistenciasDias, matriculas);
        createAsistenciaPersonal(personalList);

        // 12) Licencias y recibos de sueldo
        createLicencias(personalList);
        createRecibosSueldo(personalList);


        log.info("⚡ Carga de datos completada.");
    }

    private void ensureAdminAndUser() {
        // —— ADMIN
        if (!usuarioRepository.existsByEmail("admin@example.com")) {
            Usuario admin = new Usuario();
            admin.setEmail("admin@example.com");
            admin.setPassword(encoder.encode("admin123"));  // se encodea automáticamente
            admin.setUserRoles(Set.of(UserRole.ADMIN, UserRole.USER, UserRole.TEACHER, UserRole.ALTERNATE, UserRole.STUDENT, UserRole.FAMILY, UserRole.DIRECTOR));
            usuarioRepository.save(admin);
            log.info("Usuario ADMIN creado: admin@example.com");

            Personal directora = new Personal();
            directora.setNombre("Nancy");
            directora.setApellido("Carbone");
            directora.setDni("9999999");
            // completos los campos necesarios...
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
                directora.setUsuario(admin);
                personalRepository.save(directora);
                log.info("Personal ‘Nancy Carbone’ creado para admin@example.com");
            }
        }

        // —— USER
        if (!usuarioRepository.existsByEmail("user@example.com")) {
            Usuario user = new Usuario();
            user.setEmail("user@example.com");
            user.setPassword(encoder.encode("user123"));
            user.setUserRoles(Set.of(UserRole.ADMIN, UserRole.USER));
            usuarioRepository.save(user);
            log.info("Usuario USER creado: user@example.com");

            Personal p = new Personal();
            p.setNombre("Josefina");
            p.setApellido("Bacan");
            p.setDni("88888888");
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

    private List<Seccion> createSecciones() {
        List<Seccion> list = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            Seccion s = new Seccion();
            s.setAnioLectivo(2025);
            s.setNombre("Sección " + i);
            s.setNivelAcademico("Primaria");
            s.setGrado(i);
            s.setTurno(randomEnum(Turno.class));
            list.add(seccionRepository.save(s));
        }
        return list;
    }

    private List<Materia> createMaterias() {
        List<String> nombres = List.of("Matemáticas", "Ciencias", "Historia", "Lengua", "Arte");
        List<Materia> list = new ArrayList<>();
        for (String nombre : nombres) {
            Materia m = new Materia();
            m.setNombre(nombre);
            m.setNivelAcademico("Primaria");
            list.add(materiaRepository.save(m));
        }
        return list;
    }

    private List<Alumno> createAlumnos() {
        List<String> ejemplos = List.of("Juan Perez", "María Gómez", "Pedro Alvarez", "Lucía Fernández", "Carlos Ruiz");
        List<Alumno> list = new ArrayList<>();
        for (String full : ejemplos) {
            String[] parts = full.split(" ", 2);
            Alumno a = new Alumno();
            a.setNombre(parts[0]);
            a.setApellido(parts[1]);
            a.setDni(generateDni());
            a.setFechaNacimiento(randomLocalDateBetween(LocalDate.of(2008,1,1), LocalDate.of(2012,12,31)));
            a.setGenero(randomElement(List.of("M","F")));
            a.setFechaInscripcion(LocalDate.now());
            a.setObservacionesGenerales("Alumno de ejemplo");
            a.setMotivoRechazoBaja(null);
            list.add(alumnoRepository.save(a));
        }
        return list;
    }

    private List<Matricula> createMatriculas(List<Alumno> alumnos, List<Seccion> secciones) {
        List<Matricula> list = new ArrayList<>();
        for (Alumno a : alumnos) {
            Matricula m = new Matricula();
            m.setAlumno(a);
            m.setSeccion(randomElement(secciones));
            m.setAnioLectivo(2025);
            m.setEstado(randomEnum(EstadoMatricula.class));
            m.setFechaInicio(randomLocalDateBetween(LocalDate.of(2025,3,1), LocalDate.of(2025,4,1)));
            m.setFechaFin(randomLocalDateBetween(LocalDate.of(2025,11,1), LocalDate.of(2025,12,31)));
            list.add(matriculaRepository.save(m));
        }
        return list;
    }

    private List<Cuota> createCuotas(List<Seccion> secciones) {
        List<Cuota> list = new ArrayList<>();
        for (Seccion s : secciones) {
            for (int mes = 1; mes <= 3; mes++) {
                Cuota c = new Cuota();
                c.setNombre("Cuota " + mes + " " + s.getNombre());
                c.setMonto(randomPrecio());
                c.setFechaEmision(LocalDate.of(2025, mes, 5));
                c.setFechaVencimiento(LocalDate.of(2025, mes, 20));
                c.setNivelAcademico(s.getNivelAcademico());
                c.setSeccion(s);
                c.setTurno(s.getTurno());
                list.add(cuotaRepository.save(c));
            }
        }
        return list;
    }

    private void createInformeIniciales(List<Matricula> matriculas) {
        Usuario reportador = usuarioRepository.findByEmail("admin@example.com").orElseThrow();
        for (Matricula m : matriculas) {
            InformeInicial inf = new InformeInicial();
            inf.setMatricula(m);
            inf.setTrimestre(randomElement(List.of("I","II","III")));
            inf.setFecha(LocalDate.now());
            inf.setContenido("Informe del trimestre " + inf.getTrimestre());
            inf.setReportadoPor(reportador);
            informeInicialRepository.save(inf);
        }
    }

    private void createActaAccidentes(List<Matricula> matriculas, List<Alumno> alumnos) {
        Usuario creador = usuarioRepository.findByEmail("admin@example.com").orElseThrow();
        for (int i = 0; i < 3; i++) {
            ActaAccidente act = new ActaAccidente();
            act.setMatricula(randomElement(matriculas));
            act.setFechaAccidente(randomOffsetDateTimeBetween(
                    OffsetDateTime.now().minusMonths(6), OffsetDateTime.now()
            ));
            act.setLugar("Salón de clases");
            act.setDescripcion("Caída leve");
            act.setAccionesTomadas("Informe de tutor");
            act.setAlumnoInvolucrado(randomElement(alumnos));
            act.setCreadoPor(creador);
            actaAccidenteRepository.save(act);
        }
    }



    private void createPagos(List<Cuota> cuotas, List<Matricula> matriculas) {
        for (Cuota c : cuotas) {
            PagoCuota p = new PagoCuota();
            p.setCuota(c);
            p.setMatricula(randomElement(matriculas));
            p.setFechaPago(c.getFechaEmision().plusDays(random.nextInt(5) + 1));
            p.setMontoPagado(c.getMonto());
            p.setMedioPago(randomElement(List.of("Efectivo","Tarjeta","Transferencia")));
            pagoCuotaRepository.save(p);
        }
    }

    private void createSolicitudesAdmision(List<Aspirante> aspirantes) {
        for (Aspirante a : aspirantes) {
            SolicitudAdmision sol = new SolicitudAdmision();
            sol.setAspirante(a);
            sol.setEstado(randomElement(List.of("PENDIENTE","APROBADA","RECHAZADA")));
            sol.setMotivoRechazo(null);
            sol.setFechaEntrevista(LocalDate.now().minusDays(random.nextInt(10)));
            sol.setEmailConfirmacionEnviado(random.nextBoolean());
            sol.setEntrevistaRealizada(random.nextBoolean());
            sol.setAutorizadoComunicacionesEmail(random.nextBoolean());
            solicitudAdmisionRepository.save(sol);
        }
    }

    private List<Aspirante> createAspirantes() {
        List<Aspirante> list = new ArrayList<>();
        for (int i = 1; i <= 2; i++) {
            Aspirante asp = new Aspirante();
            asp.setNombre("Aspirante" + i);
            asp.setApellido("Apellido" + i);
            asp.setDni(generateDni());
            asp.setFechaNacimiento(randomLocalDateBetween(LocalDate.of(2009,1,1), LocalDate.of(2013,12,31)));
            asp.setGenero(randomElement(List.of("M","F")));
            asp.setTurnoPreferido(randomEnum(Turno.class));
            asp.setEscuelaActual("Escuela Local");
            asp.setConectividadInternet("Media");
            asp.setDispositivosDisponibles("PC");
            asp.setIdiomasHabladosHogar("Español");
            asp.setEnfermedadesAlergias(null);
            asp.setMedicacionHabitual(null);
            asp.setLimitacionesFisicas(null);
            asp.setTratamientosTerapeuticos(null);
            asp.setUsoAyudasMovilidad(false);
            asp.setCoberturaMedica("Obra Social");
            asp.setObservacionesSalud(null);
            list.add(aspiranteRepository.save(asp));
        }
        return list;
    }

    private List<Familiar> createFamiliares() {
        List<Familiar> list = new ArrayList<>();
        for (int i = 1; i <= 2; i++) {
            Familiar f = new Familiar();
            f.setNombre("Familiar" + i);
            f.setApellido("Apellido" + i);
            f.setDni(generateDni());
            f.setFechaNacimiento(randomLocalDateBetween(LocalDate.of(1970,1,1), LocalDate.of(1990,12,31)));
            f.setGenero(randomElement(List.of("M","F")));
            f.setEstadoCivil(randomElement(List.of("Soltero","Casado")));
            f.setNacionalidad("Argentina");
            f.setDomicilio("Calle Falsa 123");
            f.setTelefono("11-1234-5678");
            f.setCelular("15-1234-5678");
            f.setEmailContacto("familiar" + i + "@mail.com");
            list.add(familiarRepository.save(f));
        }
        return list;
    }

    private void createAlumnoFamiliar(List<Alumno> alumnos, List<Familiar> familiares) {
        for (Alumno a : alumnos) {
            AlumnoFamiliar af = new AlumnoFamiliar();
            af.setAlumno(a);
            af.setFamiliar(randomElement(familiares));
            af.setTipoRelacion(randomElement(List.of("Padre","Madre")));
            af.setViveConAlumno(true);
            alumnoFamiliarRepository.save(af);
        }
    }

    private void createAspiranteFamiliar(List<Aspirante> aspirantes, List<Familiar> familiares) {
        for (Aspirante a : aspirantes) {
            AspiranteFamiliar af = new AspiranteFamiliar();
            af.setAspirante(a);
            af.setFamiliar(randomElement(familiares));
            af.setTipoRelacion(randomElement(List.of("Padre","Madre")));
            af.setViveConAlumno(true);
            aspiranteFamiliarRepository.save(af);
        }
    }

    private List<Personal> createStaff() {
        // 1) Recogemos todos los usuarios menos admin/user y los que ya tienen Personal
        List<Usuario> candidatos = usuarioRepository.findAll().stream()
                .filter(u -> !u.getEmail().equals("admin@example.com"))
                .filter(u -> !u.getEmail().equals("user@example.com"))
                .filter(u -> !personalRepository.existsByUsuario(u))   // o .findByUsuario(u).isEmpty()
                .collect(Collectors.toList());

        List<Personal> list = new ArrayList<>();
        // Creamos hasta 2 nuevos staff (o menos, según candidatos disponibles)
        int toCreate = Math.min(candidatos.size(), 2);
        for (int i = 0; i < toCreate; i++) {
            Usuario usr = randomElement(candidatos);
            candidatos.remove(usr);

            Personal p = new Personal();
            p.setNombre("Staff" + (i+1));
            p.setApellido("Apellido" + (i+1));
            p.setDni(generateDni());
            p.setFechaNacimiento(randomLocalDateBetween(
                    LocalDate.of(1980,1,1),
                    LocalDate.of(1995,12,31)
            ));
            p.setGenero(randomElement(List.of("M","F")));
            p.setUsuario(usr);
            p.setFechaIngreso(LocalDate.now().minusYears(random.nextInt(5) + 1));
            p.setCondicionLaboral(randomElement(List.of("Full-time","Part-time")));
            p.setCargo(randomElement(List.of("Docente","Coordinador","Administrativo")));
            p.setSituacionActual("Activo");
            p.setAntecedentesLaborales("Ninguno");
            p.setObservacionesGenerales("Sin observaciones");

            list.add(personalRepository.save(p));
        }

        return list;
    }

    private void createAsignacionDocentes(List<Personal> personalList, List<Seccion> secciones, List<Materia> materias) {
        for (Personal p : personalList) {
            AsignacionDocente ad = new AsignacionDocente();
            ad.setDocente(p);
            ad.setSeccion(randomElement(secciones));
            ad.setMateria(randomElement(materias));
            ad.setEsTitular(true);
            ad.setFechaInicio(LocalDate.now().minusMonths(random.nextInt(12)));
            ad.setFechaFin(LocalDate.now().plusMonths(3));
            ad.setObservaciones("Asignación inicial");
            asignacionDocenteRepository.save(ad);
        }
    }

    private void createCalificaciones(List<Matricula> matriculas, List<Materia> materias) {
        for (Matricula m : matriculas) {
            Calificacion c = new Calificacion();
            c.setMatricula(m);
            c.setMateria(randomElement(materias));
            c.setValor(randomElement(List.of("A","B","C","D","E")));
            c.setFecha(randomLocalDateBetween(LocalDate.of(2025,1,1), LocalDate.of(2025,12,31)));
            c.setObservaciones("Sin observaciones");
            calificacionRepository.save(c);
        }
    }

    private void createEvaluaciones(List<Seccion> secciones, List<Materia> materias) {
        for (int i = 0; i < 5; i++) {
            Evaluacion e = new Evaluacion();
            e.setSeccion(randomElement(secciones));
            e.setMateria(randomElement(materias));
            e.setFecha(randomLocalDateBetween(LocalDate.of(2025,1,1), LocalDate.of(2025,12,31)));
            e.setTipo(randomElement(List.of("Oral","Escrita")));
            e.setDescripcion("Evaluación de ejemplo");
            evaluacionRepository.save(e);
        }
    }

    private void createDiasNoHabiles() {
        List<LocalDate> feriados = List.of(
                LocalDate.of(2025,1,1),
                LocalDate.of(2025,5,1),
                LocalDate.of(2025,12,25)
        );
        for (LocalDate d : feriados) {
            DiaNoHabil dh = new DiaNoHabil();
            dh.setFecha(d);
            dh.setDescripcion("Feriado");
            diaNoHabilRepository.save(dh);
        }
    }

    private void createComunicados(List<Seccion> secciones) {
        // Recuperamos al usuario admin@example.com para usarlo como publicador
        Usuario publicador = usuarioRepository
                .findByEmail("admin@example.com")
                .orElseThrow(() -> new IllegalStateException("No se encontró el usuario admin@example.com"));

        for (int i = 1; i <= 3; i++) {
            Comunicado c = new Comunicado();
            c.setTitulo("Comunicado " + i);
            c.setCuerpoMensaje("Cuerpo de comunicado " + i);
            c.setTipoComunicacion("General");
            c.setNivelDestino("Primaria");
            c.setSeccionDestino(randomElement(secciones));
            c.setPublicador(publicador);  // ← aquí asignamos el publicador
            comunicadoRepository.save(c);
        }
    }


    private void createFormacionesAcademicas() {
        FormacionAcademica fa = new FormacionAcademica();
        fa.setNivel("Universitario");
        fa.setInstitucion("Universidad de Buenos Aires");
        fa.setTituloObtenido("Ingeniería en Informática");
        fa.setFechaInicio(LocalDate.of(2020,3,1));
        fa.setFechaFin(LocalDate.of(2024,12,31));
        formacionAcademicaRepository.save(fa);
    }

    private List<AsistenciaDia> createAsistenciaDias(List<Seccion> secciones) {
        List<AsistenciaDia> list = new ArrayList<>();
        for (Seccion s : secciones) {
            AsistenciaDia ad = new AsistenciaDia();
            ad.setSeccion(s);
            ad.setFecha(LocalDate.now().minusDays(random.nextInt(30)));
            list.add(asistenciaDiaRepository.save(ad));
        }
        return list;
    }

    private void createRegistroAsistencias(List<AsistenciaDia> dias, List<Matricula> matriculas) {
        for (AsistenciaDia d : dias) {
            RegistroAsistencia ra = new RegistroAsistencia();
            ra.setAsistenciaDia(d);
            ra.setMatricula(randomElement(matriculas));
            ra.setPresente(random.nextBoolean());
            ra.setHoraIngreso(LocalTime.of(8, random.nextInt(60)));
            ra.setHoraSalida(LocalTime.of(15, random.nextInt(60)));
            registroAsistenciaRepository.save(ra);
        }
    }

    private void createAsistenciaPersonal(List<Personal> personalList) {
        for (Personal p : personalList) {
            AsistenciaPersonal ap = new AsistenciaPersonal();
            ap.setPersonal(p);
            ap.setFecha(LocalDate.now().minusDays(random.nextInt(10)));
            if (random.nextBoolean()) {
                ap.setHoraEntrada(LocalTime.of(8,0));
                ap.setHoraSalida(LocalTime.of(17,0));
            } else {
                ap.setFalta(true);
                ap.setJustificada(random.nextBoolean());
                ap.setMotivo("Motivo de falta");
            }
            asistenciaPersonalRepository.save(ap);
        }
    }

    private void createLicencias(List<Personal> personalList) {
        for (Personal p : personalList) {
            Licencia l = new Licencia();
            l.setPersonal(p);
            l.setTipoLicencia(randomElement(List.of("Enfermedad","Vacaciones")));
            l.setFechaInicio(LocalDate.now().minusDays(random.nextInt(30)));
            l.setFechaFin(l.getFechaInicio().plusDays(random.nextInt(14)));
            l.setMotivo("Motivo de licencia");
            licenciaRepository.save(l);
        }
    }

    private void createRecibosSueldo(List<Personal> personalList) {
        for (Personal p : personalList) {
            ReciboSueldo rs = new ReciboSueldo();
            rs.setPersonal(p);
            int mes = random.nextInt(12) + 1;
            rs.setPeriodo("2025-" + (mes < 10 ? "0" : "") + mes);
            rs.setFechaEmision(LocalDate.of(2025, mes, 25));
            BigDecimal bruto = randomPrecio();
            BigDecimal neto = bruto.multiply(BigDecimal.valueOf(0.7)).setScale(2, RoundingMode.HALF_UP);
            rs.setMontoBruto(bruto);
            rs.setMontoNeto(neto);
            rs.setDetalles("Detalle de sueldo");
            reciboSueldoRepository.save(rs);
        }
    }

    // Métodos utilitarios
    private <T> T randomElement(List<T> list) {
        return list.get(random.nextInt(list.size()));
    }

    private <E extends Enum<E>> E randomEnum(Class<E> clazz) {
        E[] vals = clazz.getEnumConstants();
        return vals[random.nextInt(vals.length)];
    }

    private LocalDate randomLocalDateBetween(LocalDate start, LocalDate end) {
        long days = ChronoUnit.DAYS.between(start, end);
        return start.plusDays(random.nextInt((int) days + 1));
    }

    private OffsetDateTime randomOffsetDateTimeBetween(OffsetDateTime start, OffsetDateTime end) {
        long startSec = start.toEpochSecond();
        long endSec = end.toEpochSecond();
        long rand = startSec + (long) (random.nextDouble() * (endSec - startSec));
        return OffsetDateTime.ofInstant(Instant.ofEpochSecond(rand), ZoneOffset.UTC);
    }

    private BigDecimal randomPrecio() {
        return BigDecimal.valueOf(random.nextDouble() * 1000).setScale(2, RoundingMode.HALF_UP);
    }

    private String generateDni() {
        int num = 10_000_000 + random.nextInt(90_000_000);
        return String.valueOf(num);
    }
}
