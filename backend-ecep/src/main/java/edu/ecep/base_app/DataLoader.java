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
import java.util.stream.Stream;

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

    // === Calificaciones y evaluaciones ===
    private final EvaluacionRepository evaluacionRepository;
    private final ResultadoEvaluacionRepository resultadoEvaluacionRepository;
    private final CalificacionTrimestralRepository calificacionTrimestralRepository;

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

        ensureAdminAndUser();

        PeriodoEscolar periodo2025 = ensurePeriodoEscolar(2025);
        Trimestre t1_2025 = ensureTrimestre(periodo2025, 1, LocalDate.of(2025, 3, 1), LocalDate.of(2025, 5, 31));
        Trimestre t2_2025 = ensureTrimestre(periodo2025, 2, LocalDate.of(2025, 6, 1), LocalDate.of(2025, 8, 31));
        Trimestre t3_2025 = ensureTrimestre(periodo2025, 3, LocalDate.of(2025, 9, 1), LocalDate.of(2025, 11, 30));

        PeriodoEscolar periodo2024 = ensurePeriodoEscolar(2024);
        Trimestre t1_2024 = ensureTrimestre(periodo2024, 1, LocalDate.of(2024, 3, 1), LocalDate.of(2024, 5, 31));
        Trimestre t2_2024 = ensureTrimestre(periodo2024, 2, LocalDate.of(2024, 6, 1), LocalDate.of(2024, 8, 31));
        Trimestre t3_2024 = ensureTrimestre(periodo2024, 3, LocalDate.of(2024, 9, 1), LocalDate.of(2024, 11, 30));

        List<DocenteSeed> docenteSeeds = List.of(
                docente("DOC_PRI_1A", "Lucía", "Medina", "30112001", "20112000101", null, null, null, LocalDate.of(2017, 3, 1)),
                docente("DOC_PRI_1B", "Gonzalo", "Rey", "30112002", "20112000102", null, null, null, LocalDate.of(2019, 3, 1)),
                docente("DOC_PRI_2A", "María", "Cardozo", "30112003", "20112000103", null, null, null, LocalDate.of(2016, 3, 1)),
                docente("DOC_PRI_2B", "Juan", "Barreiro", "30112004", "20112000104", null, null, null, LocalDate.of(2018, 3, 1)),
                docente("DOC_PRI_3A", "Paula", "Quiroga", "30112005", "20112000105", null, null, null, LocalDate.of(2015, 3, 1)),
                docente("DOC_PRI_3B", "Diego", "Benítez", "30112006", "20112000106", null, null, null, LocalDate.of(2014, 3, 1)),
                docente("DOC_PRI_4A", "Carolina", "Rossi", "30112007", "20112000107", "docente@example.com", "docente123", Set.of(UserRole.USER, UserRole.TEACHER), LocalDate.of(2012, 3, 1)),
                docente("DOC_PRI_4B", "Matías", "Funes", "30112008", "20112000108", null, null, null, LocalDate.of(2013, 3, 1)),
                docente("DOC_PRI_5A", "Soledad", "Lagos", "30112009", "20112000109", null, null, null, LocalDate.of(2011, 3, 1)),
                docente("DOC_PRI_5B", "Hernán", "Vidal", "30112010", "20112000110", null, null, null, LocalDate.of(2010, 3, 1)),
                docente("DOC_PRI_6A", "Eliana", "Maldonado", "30112011", "20112000111", null, null, null, LocalDate.of(2009, 3, 1)),
                docente("DOC_PRI_6B", "Roberto", "Salas", "30112012", "20112000112", null, null, null, LocalDate.of(2008, 3, 1)),
                docente("DOC_INI_2A", "Ana", "López", "40222333", "20111222330", "inicial@example.com", "inicial123", Set.of(UserRole.USER, UserRole.TEACHER), LocalDate.of(2016, 2, 15)),
                docente("DOC_INI_2B", "Gabriela", "Juarez", "40222334", "20111222331", null, null, null, LocalDate.of(2017, 2, 15)),
                docente("DOC_INI_3A", "Silvio", "Ortega", "40222335", "20111222332", null, null, null, LocalDate.of(2018, 2, 15)),
                docente("DOC_INI_3B", "Victoria", "Paz", "40222336", "20111222333", null, null, null, LocalDate.of(2015, 2, 15)),
                docente("DOC_INGLES", "Paula", "Lagos", "30113001", "20113000101", null, null, null, LocalDate.of(2013, 4, 1)),
                docente("DOC_EDFIS", "Adrián", "Domínguez", "30113002", "20113000102", null, null, null, LocalDate.of(2012, 4, 1)),
                docente("DOC_MUSICA", "Nora", "Franco", "30113003", "20113000103", null, null, null, LocalDate.of(2011, 4, 1)),
                docente("DOC_ARTES", "Miguel", "Oviedo", "30113004", "20113000104", null, null, null, LocalDate.of(2010, 4, 1)),
                docente("DOC_TECNO", "Laura", "Pacheco", "30113005", "20113000105", null, null, null, LocalDate.of(2014, 4, 1)),
                docente("DOC_APOYO_TIC", "Griselda", "Moya", "30113006", "20113000106", "tic@example.com", "tic123", Set.of(UserRole.USER, UserRole.TEACHER), LocalDate.of(2021, 3, 1)),
                docente("DOC_ROBOTICA", "Hugo", "Santillán", "30113007", "20113000107", null, null, null, LocalDate.of(2016, 4, 1)),
                docente("DOC_TEATRO", "Leonel", "Pereyra", "30113008", "20113000108", null, null, null, LocalDate.of(2018, 3, 1)),
                docente("DOC_PSICOMOTRICIDAD", "Irene", "Montoya", "30113009", "20113000109", null, null, null, LocalDate.of(2019, 2, 1)),
                docente("DOC_TUTOR", "Andrea", "Crespo", "30113010", "20113000110", null, null, null, LocalDate.of(2015, 2, 1))
        );

        Map<String, Empleado> docentes = ensureDocentes(docenteSeeds);

        List<PersonaSeed> primario1AStudents = List.of(
                alumno("Agustina", "Cabrera", "61010001", "Marcos", "Cabrera", "41010001", RolVinculo.PADRE, true),
                alumno("Bautista", "Torres", "61010002", "Daniela", "Torres", "41010002", RolVinculo.MADRE, true),
                alumno("Emma", "Navarro", "61010003", "Sonia", "Navarro", "41010003", RolVinculo.MADRE, true),
                alumno("Franco", "Paredes", "61010004", "Pablo", "Paredes", "41010004", RolVinculo.PADRE, false),
                alumno("Ignacio", "Vera", "61010005", "Lucía", "Vera", "41010005", RolVinculo.MADRE, true),
                alumno("Joaquín", "Medina", "61010006", "Lucía", "Medina", "30112001", RolVinculo.MADRE, true),
                alumno("Kiara", "Gómez", "61010007", "Hernán", "Gómez", "41010006", RolVinculo.PADRE, true),
                alumno("Lautaro", "Cabrera", "61010008", "Marcos", "Cabrera", "41010001", RolVinculo.PADRE, true),
                alumno("Milo", "Santillán", "61010009", "Hugo", "Santillán", "30113007", RolVinculo.PADRE, true),
                alumno("Renata", "Pardo", "61010010", "Silvana", "Pardo", "41010007", RolVinculo.MADRE, true)
        );
        List<PersonaSeed> primario1BStudents = List.of(
                alumno("Camila", "Soria", "61011001", "Romina", "Soria", "41011001", RolVinculo.MADRE, true),
                alumno("Delfina", "Bravo", "61011002", "Sergio", "Bravo", "41011002", RolVinculo.PADRE, true),
                alumno("Ezequiel", "Luna", "61011003", "Carolina", "Luna", "41011003", RolVinculo.MADRE, true),
                alumno("Juan Pedro", "Ledesma", "61011004", "Marcelo", "Ledesma", "41011004", RolVinculo.PADRE, true),
                alumno("Malena", "Coria", "61011005", "Lorena", "Coria", "41011005", RolVinculo.MADRE, true),
                alumno("Agustín", "Rey", "61011006", "Gonzalo", "Rey", "30112002", RolVinculo.PADRE, true),
                alumno("Bianca", "Paz", "61011007", "Marcela", "Paz", "41011006", RolVinculo.MADRE, true),
                alumno("Ciro", "Luna", "61011008", "Carolina", "Luna", "41011003", RolVinculo.MADRE, true),
                alumno("Dolores", "Vidal", "61011009", "Hernán", "Vidal", "30112010", RolVinculo.PADRE, true),
                alumno("Elio", "Domínguez", "61011010", "Adrián", "Domínguez", "30113002", RolVinculo.PADRE, true)
        );
        List<PersonaSeed> primario2AStudents = List.of(
                alumno("Abril", "Gallo", "62020001", "Hernán", "Gallo", "42020001", RolVinculo.PADRE, true),
                alumno("Bruno", "Díaz", "62020002", "Laura", "Díaz", "42020002", RolVinculo.MADRE, true),
                alumno("Candela", "Molina", "62020003", "Diego", "Molina", "42020003", RolVinculo.PADRE, true),
                alumno("Jeremías", "Ruiz", "62020004", "Patricia", "Ruiz", "42020004", RolVinculo.MADRE, true),
                alumno("Lola", "Quiroga", "62020005", "Paula", "Quiroga", "30112005", RolVinculo.MADRE, true),
                alumno("Gael", "Quiroga", "62020006", "Paula", "Quiroga", "30112005", RolVinculo.MADRE, true),
                alumno("Helena", "Díaz", "62020007", "Laura", "Díaz", "42020002", RolVinculo.MADRE, true),
                alumno("Ian", "Gallo", "62020008", "Hernán", "Gallo", "42020001", RolVinculo.PADRE, true),
                alumno("Julia", "Paredes", "62020009", "Rodolfo", "Paredes", "42020006", RolVinculo.PADRE, false),
                alumno("Luca", "Roldán", "62020010", "Mónica", "Roldán", "42020007", RolVinculo.MADRE, true)
        );
        List<PersonaSeed> primario2BStudents = List.of(
                alumno("Ámbar", "Gutiérrez", "62021001", "Valeria", "Gutiérrez", "42021001", RolVinculo.MADRE, true),
                alumno("Benicio", "Herrera", "62021002", "Emanuel", "Herrera", "42021002", RolVinculo.PADRE, true),
                alumno("Catalina", "Rivas", "62021003", "Silvia", "Rivas", "42021003", RolVinculo.MADRE, true),
                alumno("Ignacia", "Ferreyra", "62021004", "Gastón", "Ferreyra", "42021004", RolVinculo.PADRE, true),
                alumno("Mateo", "Salto", "62021005", "Juliana", "Salto", "42021005", RolVinculo.MADRE, true),
                alumno("Luna", "Herrera", "62021006", "Emanuel", "Herrera", "42021002", RolVinculo.PADRE, true),
                alumno("Nina", "Rivas", "62021007", "Silvia", "Rivas", "42021003", RolVinculo.MADRE, true),
                alumno("Oliver", "Salto", "62021008", "Juliana", "Salto", "42021005", RolVinculo.MADRE, true),
                alumno("Pilar", "Domínguez", "62021009", "Adrián", "Domínguez", "30113002", RolVinculo.PADRE, true),
                alumno("Thiago", "Ferreyra", "62021010", "Gimena", "Ferreyra", "42021006", RolVinculo.MADRE, true)
        );
        List<PersonaSeed> primario3AStudents = List.of(
                alumno("Álvaro", "Campos", "63030001", "Mariela", "Campos", "43030001", RolVinculo.MADRE, true),
                alumno("Belén", "Vivas", "63030002", "Oscar", "Vivas", "43030002", RolVinculo.PADRE, true),
                alumno("Facundo", "Cabrera", "63030003", "Natalia", "Cabrera", "43030003", RolVinculo.MADRE, true),
                alumno("Martina", "Ponce", "63030004", "Esteban", "Ponce", "43030004", RolVinculo.PADRE, true),
                alumno("Ramiro", "Núñez", "63030005", "Soledad", "Núñez", "43030005", RolVinculo.MADRE, true),
                alumno("Uma", "Vivas", "63030006", "Oscar", "Vivas", "43030002", RolVinculo.PADRE, true),
                alumno("Valentino", "Campos", "63030007", "Mariela", "Campos", "43030001", RolVinculo.MADRE, true),
                alumno("Wendy", "Giménez", "63030008", "Raquel", "Giménez", "43030006", RolVinculo.MADRE, true),
                alumno("Xavier", "Cabrera", "63030009", "Natalia", "Cabrera", "43030003", RolVinculo.MADRE, true),
                alumno("Yago", "Montoya", "63030010", "Irene", "Montoya", "30113009", RolVinculo.MADRE, true)
        );
        List<PersonaSeed> primario3BStudents = List.of(
                alumno("Bianca", "Flores", "63031001", "Claudia", "Flores", "43031001", RolVinculo.MADRE, true),
                alumno("Dante", "Pereyra", "63031002", "Rubén", "Pereyra", "43031002", RolVinculo.PADRE, true),
                alumno("Julieta", "Sosa", "63031003", "Liliana", "Sosa", "43031003", RolVinculo.MADRE, true),
                alumno("Valentino", "Medina", "63031004", "Lucía", "Medina", "30112001", RolVinculo.MADRE, true),
                alumno("Ximena", "Acuña", "63031005", "Federico", "Acuña", "43031005", RolVinculo.PADRE, true),
                alumno("Abril", "Flores", "63031006", "Claudia", "Flores", "43031001", RolVinculo.MADRE, true),
                alumno("Benjamín", "Pereyra", "63031007", "Rubén", "Pereyra", "43031002", RolVinculo.PADRE, true),
                alumno("Candela", "Paz", "63031008", "Victoria", "Paz", "40222336", RolVinculo.MADRE, true),
                alumno("Dylan", "Salas", "63031009", "Roberto", "Salas", "30112012", RolVinculo.PADRE, true),
                alumno("Elisa", "Godoy", "63031010", "Marcela", "Godoy", "43031006", RolVinculo.MADRE, true)
        );
        List<PersonaSeed> primario4AStudents = List.of(
                alumno("Antonella", "Suárez", "64040001", "Marcela", "Suárez", "44040001", RolVinculo.MADRE, true),
                alumno("Brisa", "Carrizo", "64040002", "Jorge", "Carrizo", "44040002", RolVinculo.PADRE, true),
                alumno("Esteban", "Giménez", "64040003", "Verónica", "Giménez", "44040003", RolVinculo.MADRE, true),
                alumno("Faustino", "Del Río", "64040004", "Santiago", "Del Río", "44040004", RolVinculo.PADRE, true),
                alumno("Brenda", "Rossi", "64040005", "Carolina", "Rossi", "30112007", RolVinculo.MADRE, true),
                alumno("Gonzalo", "Rossi", "64040006", "Carolina", "Rossi", "30112007", RolVinculo.MADRE, true),
                alumno("Helena", "Duarte", "64040007", "Nadia", "Duarte", "44040006", RolVinculo.MADRE, true),
                alumno("Isidro", "Carrizo", "64040008", "Jorge", "Carrizo", "44040002", RolVinculo.PADRE, true),
                alumno("Juliana", "Giménez", "64040009", "Verónica", "Giménez", "44040003", RolVinculo.MADRE, true),
                alumno("Kevin", "Tissera", "64040010", "Griselda", "Tissera", "44040007", RolVinculo.MADRE, true)
        );
        List<PersonaSeed> primario4BStudents = List.of(
                alumno("Ciro", "Palacios", "64041001", "Nicolás", "Palacios", "44041001", RolVinculo.PADRE, true),
                alumno("Elena", "Juarez", "64041002", "Gabriela", "Juarez", "40222334", RolVinculo.MADRE, true),
                alumno("Felipe", "Soria", "64041003", "Claudio", "Soria", "44041003", RolVinculo.PADRE, true),
                alumno("Maia", "Prado", "64041004", "Noelia", "Prado", "44041004", RolVinculo.MADRE, true),
                alumno("Nahiara", "Ledesma", "64041005", "Gabriel", "Ledesma", "44041005", RolVinculo.PADRE, true),
                alumno("Olivia", "Palacios", "64041006", "Nicolás", "Palacios", "44041001", RolVinculo.PADRE, true),
                alumno("Priscila", "Juarez", "64041007", "Gabriela", "Juarez", "40222334", RolVinculo.MADRE, true),
                alumno("Renzo", "Soria", "64041008", "Claudio", "Soria", "44041003", RolVinculo.PADRE, true),
                alumno("Santino", "Prado", "64041009", "Noelia", "Prado", "44041004", RolVinculo.MADRE, true),
                alumno("Tobías", "Funes", "64041010", "Matías", "Funes", "30112008", RolVinculo.PADRE, true)
        );
        List<PersonaSeed> primario5AStudents = List.of(
                alumno("Alma", "Cabrera", "65050001", "Mariano", "Cabrera", "45050001", RolVinculo.PADRE, true),
                alumno("Bruno", "Benítez", "65050002", "Diego", "Benítez", "30112006", RolVinculo.PADRE, true),
                alumno("Cecilia", "Vidal", "65050003", "Hernán", "Vidal", "30112010", RolVinculo.PADRE, true),
                alumno("Lisandro", "Paez", "65050004", "Rocío", "Paez", "45050004", RolVinculo.MADRE, true),
                alumno("Mora", "Roldán", "65050005", "Graciela", "Roldán", "45050005", RolVinculo.MADRE, true),
                alumno("Noah", "Cabrera", "65050006", "Mariano", "Cabrera", "45050001", RolVinculo.PADRE, true),
                alumno("Olivia", "Benítez", "65050007", "Diego", "Benítez", "30112006", RolVinculo.PADRE, true),
                alumno("Pilar", "Vidal", "65050008", "Hernán", "Vidal", "30112010", RolVinculo.PADRE, true),
                alumno("Quimey", "Roldán", "65050009", "Graciela", "Roldán", "45050005", RolVinculo.MADRE, true),
                alumno("Renzo", "Lagos", "65050010", "Soledad", "Lagos", "30112009", RolVinculo.MADRE, true)
        );
        List<PersonaSeed> primario5BStudents = List.of(
                alumno("Celeste", "Giménez", "65051001", "Patricio", "Giménez", "45051001", RolVinculo.PADRE, true),
                alumno("Dylan", "Espeche", "65051002", "Lucía", "Espeche", "45051002", RolVinculo.MADRE, true),
                alumno("Magalí", "Peralta", "65051003", "Elvio", "Peralta", "45051003", RolVinculo.PADRE, true),
                alumno("Santina", "Lugo", "65051004", "Adriana", "Lugo", "45051004", RolVinculo.MADRE, true),
                alumno("Ulises", "Rivarola", "65051005", "Silvina", "Rivarola", "45051005", RolVinculo.MADRE, true),
                alumno("Valen", "Moya", "65051006", "Griselda", "Moya", "30113006", RolVinculo.MADRE, true),
                alumno("Wanda", "Giménez", "65051007", "Patricio", "Giménez", "45051001", RolVinculo.PADRE, true),
                alumno("Xavier", "Espeche", "65051008", "Lucía", "Espeche", "45051002", RolVinculo.MADRE, true),
                alumno("Yago", "Peralta", "65051009", "Elvio", "Peralta", "45051003", RolVinculo.PADRE, true),
                alumno("Zoe", "Lugo", "65051010", "Adriana", "Lugo", "45051004", RolVinculo.MADRE, true)
        );
        List<PersonaSeed> primario6AStudents = List.of(
                alumno("Abram", "Montiel", "66060001", "Claudio", "Montiel", "46060001", RolVinculo.PADRE, true),
                alumno("Catalina", "Prieto", "66060002", "Carina", "Prieto", "46060002", RolVinculo.MADRE, true),
                alumno("Darío", "Campos", "66060003", "Marcelo", "Campos", "46060003", RolVinculo.PADRE, true),
                alumno("Lucila", "Herrera", "66060004", "Emilia", "Herrera", "46060004", RolVinculo.MADRE, true),
                alumno("Tomás", "Sarmiento", "66060005", "Sergio", "Sarmiento", "46060005", RolVinculo.PADRE, true),
                alumno("Uma", "Montiel", "66060006", "Claudio", "Montiel", "46060001", RolVinculo.PADRE, true),
                alumno("Valen", "Prieto", "66060007", "Carina", "Prieto", "46060002", RolVinculo.MADRE, true),
                alumno("Wenceslao", "Campos", "66060008", "Marcelo", "Campos", "46060003", RolVinculo.PADRE, true),
                alumno("Ximena", "Herrera", "66060009", "Emilia", "Herrera", "46060004", RolVinculo.MADRE, true),
                alumno("Yair", "Sarmiento", "66060010", "Sergio", "Sarmiento", "46060005", RolVinculo.PADRE, true)
        );
        List<PersonaSeed> primario6BStudents = List.of(
                alumno("Ariana", "Balbi", "66061001", "Lilian", "Balbi", "46061001", RolVinculo.MADRE, true),
                alumno("Emanuel", "Chávez", "66061002", "Mirta", "Chávez", "46061002", RolVinculo.MADRE, true),
                alumno("Kiara", "Ocampo", "66061003", "Mariano", "Ocampo", "46061003", RolVinculo.PADRE, true),
                alumno("Ramiro", "Paiva", "66061004", "Cecilia", "Paiva", "46061004", RolVinculo.MADRE, true),
                alumno("Zoe", "Salas", "66061005", "Roberto", "Salas", "30112012", RolVinculo.PADRE, true),
                alumno("Abril", "Balbi", "66061006", "Lilian", "Balbi", "46061001", RolVinculo.MADRE, true),
                alumno("Bruno", "Chávez", "66061007", "Mirta", "Chávez", "46061002", RolVinculo.MADRE, true),
                alumno("Catalina", "Ocampo", "66061008", "Mariano", "Ocampo", "46061003", RolVinculo.PADRE, true),
                alumno("Delfina", "Paiva", "66061009", "Cecilia", "Paiva", "46061004", RolVinculo.MADRE, true),
                alumno("Fiona", "Pereyra", "66061010", "Leonel", "Pereyra", "30113008", RolVinculo.PADRE, true)
        );
        List<PersonaSeed> inicial2AStudents = List.of(
                alumno("Aldana", "Lemos", "52020001", "Brenda", "Lemos", "32020001", RolVinculo.MADRE, true),
                alumno("Benicio", "Campos", "52020002", "Carlos", "Campos", "32020002", RolVinculo.PADRE, true),
                alumno("Cataleya", "Ibáñez", "52020003", "Julieta", "Ibáñez", "32020003", RolVinculo.MADRE, true),
                alumno("Danna", "Robles", "52020004", "Mariano", "Robles", "32020004", RolVinculo.PADRE, true),
                alumno("Gael", "Ortiz", "52020005", "Valeria", "Ortiz", "32020005", RolVinculo.MADRE, true),
                alumno("Helena", "Moya", "52020006", "Griselda", "Moya", "30113006", RolVinculo.MADRE, true),
                alumno("Ian", "Lemos", "52020007", "Brenda", "Lemos", "32020001", RolVinculo.MADRE, true),
                alumno("Julián", "Campos", "52020008", "Carlos", "Campos", "32020002", RolVinculo.PADRE, true),
                alumno("Kiara", "Ibáñez", "52020009", "Julieta", "Ibáñez", "32020003", RolVinculo.MADRE, true),
                alumno("Luca", "Robles", "52020010", "Mariano", "Robles", "32020004", RolVinculo.PADRE, true)
        );
        List<PersonaSeed> inicial2BStudents = List.of(
                alumno("Bautista", "Funes", "52021001", "Matías", "Funes", "30112008", RolVinculo.PADRE, true),
                alumno("Clara", "Borda", "52021002", "Noelia", "Borda", "32021002", RolVinculo.MADRE, true),
                alumno("Felipe", "Godoy", "52021003", "Rodolfo", "Godoy", "32021003", RolVinculo.PADRE, true),
                alumno("Martina", "Pereyra", "52021004", "Sabrina", "Pereyra", "32021004", RolVinculo.MADRE, true),
                alumno("Uma", "Cabrera", "52021005", "Luciano", "Cabrera", "32021005", RolVinculo.PADRE, true),
                alumno("Mateo", "Funes", "52021006", "Matías", "Funes", "30112008", RolVinculo.PADRE, true),
                alumno("Nina", "Borda", "52021007", "Noelia", "Borda", "32021002", RolVinculo.MADRE, true),
                alumno("Olivia", "Godoy", "52021008", "Rodolfo", "Godoy", "32021003", RolVinculo.PADRE, true),
                alumno("Paz", "Pereyra", "52021009", "Sabrina", "Pereyra", "32021004", RolVinculo.MADRE, true),
                alumno("Quimey", "Cabrera", "52021010", "Luciano", "Cabrera", "32021005", RolVinculo.PADRE, true)
        );
        List<PersonaSeed> inicial3AStudents = List.of(
                alumno("Amira", "Ledesma", "53030001", "Julián", "Ledesma", "33030001", RolVinculo.PADRE, true),
                alumno("Camilo", "Duarte", "53030002", "Pamela", "Duarte", "33030002", RolVinculo.MADRE, true),
                alumno("Isabella", "Ruiz", "53030003", "Marcos", "Ruiz", "33030003", RolVinculo.PADRE, true),
                alumno("Jazmín", "Acosta", "53030004", "Carla", "Acosta", "33030004", RolVinculo.MADRE, true),
                alumno("Mateo", "Vargas", "53030005", "Lorena", "Vargas", "33030005", RolVinculo.MADRE, true),
                alumno("Lola", "Ledesma", "53030006", "Julián", "Ledesma", "33030001", RolVinculo.PADRE, true),
                alumno("Mauro", "Duarte", "53030007", "Pamela", "Duarte", "33030002", RolVinculo.MADRE, true),
                alumno("Nina", "Ruiz", "53030008", "Marcos", "Ruiz", "33030003", RolVinculo.PADRE, true),
                alumno("Oriana", "Acosta", "53030009", "Carla", "Acosta", "33030004", RolVinculo.MADRE, true),
                alumno("Pablo", "Vargas", "53030010", "Lorena", "Vargas", "33030005", RolVinculo.MADRE, true)
        );
        List<PersonaSeed> inicial3BStudents = List.of(
                alumno("Belén", "Ríos", "53031001", "Patricia", "Ríos", "33031001", RolVinculo.MADRE, true),
                alumno("Dante", "Molina", "53031002", "Gisela", "Molina", "33031002", RolVinculo.MADRE, true),
                alumno("Lara", "Benítez", "53031003", "Diego", "Benítez", "30112006", RolVinculo.PADRE, true),
                alumno("Renata", "Paz", "53031004", "Victoria", "Paz", "40222336", RolVinculo.MADRE, true),
                alumno("Teo", "Correa", "53031005", "Ignacio", "Correa", "33031005", RolVinculo.PADRE, true),
                alumno("Quimey", "Ríos", "53031006", "Patricia", "Ríos", "33031001", RolVinculo.MADRE, true),
                alumno("Rafael", "Molina", "53031007", "Gisela", "Molina", "33031002", RolVinculo.MADRE, true),
                alumno("Sofía", "Benítez", "53031008", "Diego", "Benítez", "30112006", RolVinculo.PADRE, true),
                alumno("Tadeo", "Paz", "53031009", "Victoria", "Paz", "40222336", RolVinculo.MADRE, true),
                alumno("Uma", "Correa", "53031010", "Ignacio", "Correa", "33031005", RolVinculo.PADRE, true)
        );

        LocalDate titularDesde2025 = LocalDate.of(2025, 3, 1);
        LocalDate matriculaDesde2025 = LocalDate.of(2025, 3, 3);

        List<SeccionSetup> seccionesPrimario2025 = List.of(
                seccion("PRI-1A", NivelAcademico.PRIMARIO, "1°", "A", Turno.MANANA, "DOC_PRI_1A", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_1A"), primario1AStudents),
                seccion("PRI-1B", NivelAcademico.PRIMARIO, "1°", "B", Turno.TARDE, "DOC_PRI_1B", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_1B"), primario1BStudents),
                seccion("PRI-2A", NivelAcademico.PRIMARIO, "2°", "A", Turno.MANANA, "DOC_PRI_2A", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_2A"), primario2AStudents),
                seccion("PRI-2B", NivelAcademico.PRIMARIO, "2°", "B", Turno.TARDE, "DOC_PRI_2B", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_2B"), primario2BStudents),
                seccion("PRI-3A", NivelAcademico.PRIMARIO, "3°", "A", Turno.MANANA, "DOC_PRI_3A", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_3A"), primario3AStudents),
                seccion("PRI-3B", NivelAcademico.PRIMARIO, "3°", "B", Turno.TARDE, "DOC_PRI_3B", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_3B"), primario3BStudents),
                seccion("PRI-4A", NivelAcademico.PRIMARIO, "4°", "A", Turno.MANANA, "DOC_PRI_4A", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_4A"), primario4AStudents),
                seccion("PRI-4B", NivelAcademico.PRIMARIO, "4°", "B", Turno.TARDE, "DOC_PRI_4B", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_4B"), primario4BStudents),
                seccion("PRI-5A", NivelAcademico.PRIMARIO, "5°", "A", Turno.MANANA, "DOC_PRI_5A", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_5A"), primario5AStudents),
                seccion("PRI-5B", NivelAcademico.PRIMARIO, "5°", "B", Turno.TARDE, "DOC_PRI_5B", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_5B"), primario5BStudents),
                seccion("PRI-6A", NivelAcademico.PRIMARIO, "6°", "A", Turno.MANANA, "DOC_PRI_6A", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_6A"), primario6AStudents),
                seccion("PRI-6B", NivelAcademico.PRIMARIO, "6°", "B", Turno.TARDE, "DOC_PRI_6B", titularDesde2025, matriculaDesde2025, planPrimario("DOC_PRI_6B"), primario6BStudents)
        );
        List<SeccionSetup> seccionesInicial2025 = List.of(
                seccion("INI-2A", NivelAcademico.INICIAL, "2 Seccion", "A", Turno.MANANA, "DOC_INI_2A", titularDesde2025, matriculaDesde2025, planInicial("DOC_INI_2A"), inicial2AStudents),
                seccion("INI-2B", NivelAcademico.INICIAL, "2 Seccion", "B", Turno.TARDE, "DOC_INI_2B", titularDesde2025, matriculaDesde2025, planInicial("DOC_INI_2B"), inicial2BStudents),
                seccion("INI-3A", NivelAcademico.INICIAL, "3 Seccion", "A", Turno.MANANA, "DOC_INI_3A", titularDesde2025, matriculaDesde2025, planInicial("DOC_INI_3A"), inicial3AStudents),
                seccion("INI-3B", NivelAcademico.INICIAL, "3 Seccion", "B", Turno.TARDE, "DOC_INI_3B", titularDesde2025, matriculaDesde2025, planInicial("DOC_INI_3B"), inicial3BStudents)
        );

        List<SeccionSetup> todasSecciones2025 = Stream.concat(seccionesPrimario2025.stream(), seccionesInicial2025.stream()).toList();

        Set<String> materiasNombres = todasSecciones2025.stream()
                .flatMap(s -> s.materias().stream().map(MateriaAssignment::materia))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        Map<String, Materia> materiasCatalogo = ensureMateriasCatalogo(materiasNombres);

        List<SeccionData> datosSecciones2025 = new ArrayList<>();
        for (SeccionSetup setup : todasSecciones2025) {
            datosSecciones2025.add(ensureSeccionCompleta(periodo2025, setup, docentes, materiasCatalogo));
        }

        LocalDate titularDesde2024 = LocalDate.of(2024, 3, 1);
        LocalDate matriculaDesde2024 = LocalDate.of(2024, 3, 4);
        List<SeccionSetup> secciones2024 = List.of(
                seccion("PRI-2024-1A", NivelAcademico.PRIMARIO, "1°", "A", Turno.MANANA, "DOC_PRI_1A", titularDesde2024, matriculaDesde2024, planPrimario("DOC_PRI_1A"), primario2AStudents.stream().limit(3).toList()),
                seccion("PRI-2024-1B", NivelAcademico.PRIMARIO, "1°", "B", Turno.TARDE, "DOC_PRI_1B", titularDesde2024, matriculaDesde2024, planPrimario("DOC_PRI_1B"), primario2BStudents.stream().limit(3).toList()),
                seccion("INI-2024-3A", NivelAcademico.INICIAL, "3 Seccion", "A", Turno.MANANA, "DOC_INI_3A", titularDesde2024, matriculaDesde2024, planInicial("DOC_INI_3A"), inicial3AStudents.stream().limit(3).toList())
        );

        Set<String> materias2024 = secciones2024.stream()
                .flatMap(s -> s.materias().stream().map(MateriaAssignment::materia))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        materiasCatalogo.putAll(ensureMateriasCatalogo(materias2024));

        List<SeccionData> datosSecciones2024 = new ArrayList<>();
        for (SeccionSetup setup : secciones2024) {
            datosSecciones2024.add(ensureSeccionCompleta(periodo2024, setup, docentes, materiasCatalogo));
        }

        PeriodoEscolar periodo2023 = ensurePeriodoEscolar(2023);
        Trimestre t1_2023 = ensureTrimestre(periodo2023, 1, LocalDate.of(2023, 3, 1), LocalDate.of(2023, 5, 31));
        Trimestre t2_2023 = ensureTrimestre(periodo2023, 2, LocalDate.of(2023, 6, 1), LocalDate.of(2023, 8, 31));
        Trimestre t3_2023 = ensureTrimestre(periodo2023, 3, LocalDate.of(2023, 9, 1), LocalDate.of(2023, 11, 30));

        LocalDate titularDesde2023 = LocalDate.of(2023, 3, 1);
        LocalDate matriculaDesde2023 = LocalDate.of(2023, 3, 6);
        List<SeccionSetup> secciones2023 = List.of(
                seccion("PRI-2023-6A", NivelAcademico.PRIMARIO, "6°", "A", Turno.MANANA, "DOC_PRI_6A", titularDesde2023, matriculaDesde2023, planPrimario("DOC_PRI_6A"), primario6AStudents.stream().skip(3).limit(5).toList()),
                seccion("PRI-2023-6B", NivelAcademico.PRIMARIO, "6°", "B", Turno.TARDE, "DOC_PRI_6B", titularDesde2023, matriculaDesde2023, planPrimario("DOC_PRI_6B"), primario6BStudents.stream().skip(3).limit(5).toList()),
                seccion("INI-2023-2A", NivelAcademico.INICIAL, "2 Seccion", "A", Turno.MANANA, "DOC_INI_2A", titularDesde2023, matriculaDesde2023, planInicial("DOC_INI_2A"), inicial2AStudents.stream().limit(5).toList())
        );

        Set<String> materias2023 = secciones2023.stream()
                .flatMap(s -> s.materias().stream().map(MateriaAssignment::materia))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        materiasCatalogo.putAll(ensureMateriasCatalogo(materias2023));

        List<SeccionData> datosSecciones2023 = new ArrayList<>();
        for (SeccionSetup setup : secciones2023) {
            datosSecciones2023.add(ensureSeccionCompleta(periodo2023, setup, docentes, materiasCatalogo));
        }

        for (SeccionData data : datosSecciones2025) {
            if (data.seccion().getNivel() != NivelAcademico.PRIMARIO) {
                continue;
            }

            crearEvaluacionConResultados(data, t1_2025, "Lengua", LocalDate.of(2025, 4, 10), 0.35);
            crearEvaluacionConResultados(data, t1_2025, "Matemática", LocalDate.of(2025, 5, 8), 0.35);
            asignarCalificaciones(data, t1_2025, List.of(
                    calificacion("Lengua", 8.5, CalificacionConceptual.MUY_BUENO, "Lectura fluida y participación."),
                    calificacion("Matemática", 8.0, CalificacionConceptual.BUENO, "Resuelve situaciones problemáticas."),
                    calificacion("Ciencias Naturales", 8.7, CalificacionConceptual.MUY_BUENO, "Indaga y registra observaciones."),
                    calificacion("Ciencias Sociales", 7.8, CalificacionConceptual.BUENO, "Interpreta hechos históricos.")
            ));

            crearEvaluacionConResultados(data, t2_2025, "Ciencias Naturales", LocalDate.of(2025, 7, 4), 0.35);
            crearEvaluacionConResultados(data, t2_2025, "Inglés", LocalDate.of(2025, 7, 18), 0.25);
            crearEvaluacionConResultados(data, t2_2025, "Educación Física", LocalDate.of(2025, 7, 25), 0.20);
            asignarCalificaciones(data, t2_2025, List.of(
                    calificacion("Ciencias Naturales", 8.6, CalificacionConceptual.MUY_BUENO, "Aplica método científico en equipo."),
                    calificacion("Inglés", 8.1, CalificacionConceptual.BUENO, "Comprende consignas y dialoga."),
                    calificacion("Educación Física", 9.0, CalificacionConceptual.EXCELENTE, "Demuestra coordinación y respeto.")
            ));

            crearEvaluacionConResultados(data, t3_2025, "Lengua", LocalDate.of(2025, 10, 7), 0.30);
            crearEvaluacionConResultados(data, t3_2025, "Ciencias Sociales", LocalDate.of(2025, 10, 21), 0.30);
            crearEvaluacionConResultados(data, t3_2025, "Música", LocalDate.of(2025, 11, 5), 0.20);
            asignarCalificaciones(data, t3_2025, List.of(
                    calificacion("Lengua", 8.8, CalificacionConceptual.MUY_BUENO, "Produce textos narrativos."),
                    calificacion("Ciencias Sociales", 8.0, CalificacionConceptual.BUENO, "Analiza procesos comunitarios."),
                    calificacion("Música", 8.9, CalificacionConceptual.MUY_BUENO, "Interpreta ritmos y melodías.")
            ));
        }

        for (SeccionData data : datosSecciones2024) {
            if (data.seccion().getNivel() != NivelAcademico.PRIMARIO) {
                continue;
            }

            crearEvaluacionConResultados(data, t1_2024, "Lengua", LocalDate.of(2024, 4, 15), 0.30);
            asignarCalificaciones(data, t1_2024, List.of(
                    calificacion("Lengua", 7.5, CalificacionConceptual.BUENO, "Consolida procesos de lectoescritura.")
            ));

            crearEvaluacionConResultados(data, t2_2024, "Matemática", LocalDate.of(2024, 7, 4), 0.30);
            crearEvaluacionConResultados(data, t2_2024, "Inglés", LocalDate.of(2024, 7, 18), 0.20);
            asignarCalificaciones(data, t2_2024, List.of(
                    calificacion("Matemática", 7.8, CalificacionConceptual.BUENO, "Aplica estrategias de cálculo."),
                    calificacion("Inglés", 7.9, CalificacionConceptual.BUENO, "Comprende instrucciones simples."),
                    calificacion("Educación Física", 8.4, CalificacionConceptual.MUY_BUENO, "Participa activamente en los juegos.")
            ));

            crearEvaluacionConResultados(data, t3_2024, "Ciencias Naturales", LocalDate.of(2024, 10, 9), 0.30);
            crearEvaluacionConResultados(data, t3_2024, "Ciencias Sociales", LocalDate.of(2024, 10, 23), 0.25);
            crearEvaluacionConResultados(data, t3_2024, "Música", LocalDate.of(2024, 11, 6), 0.20);
            asignarCalificaciones(data, t3_2024, List.of(
                    calificacion("Ciencias Naturales", 8.2, CalificacionConceptual.MUY_BUENO, "Integra observaciones en informes."),
                    calificacion("Ciencias Sociales", 7.9, CalificacionConceptual.BUENO, "Relaciona hechos históricos con la comunidad."),
                    calificacion("Música", 8.1, CalificacionConceptual.BUENO, "Participa en ensambles vocales.")
            ));
        }

        for (SeccionData data : datosSecciones2023) {
            if (data.seccion().getNivel() != NivelAcademico.PRIMARIO) {
                continue;
            }

            crearEvaluacionConResultados(data, t2_2023, "Matemática", LocalDate.of(2023, 7, 6), 0.30);
            crearEvaluacionConResultados(data, t2_2023, "Ciencias Naturales", LocalDate.of(2023, 7, 20), 0.25);
            asignarCalificaciones(data, t2_2023, List.of(
                    calificacion("Matemática", 7.6, CalificacionConceptual.BUENO, "Refuerza procedimientos de cálculo."),
                    calificacion("Ciencias Naturales", 7.8, CalificacionConceptual.BUENO, "Integra observaciones científicas."),
                    calificacion("Educación Física", 8.3, CalificacionConceptual.MUY_BUENO, "Muestra compromiso en los entrenamientos.")
            ));

            crearEvaluacionConResultados(data, t3_2023, "Lengua", LocalDate.of(2023, 10, 11), 0.30);
            crearEvaluacionConResultados(data, t3_2023, "Ciencias Sociales", LocalDate.of(2023, 10, 24), 0.25);
            crearEvaluacionConResultados(data, t3_2023, "Música", LocalDate.of(2023, 11, 7), 0.20);
            asignarCalificaciones(data, t3_2023, List.of(
                    calificacion("Lengua", 8.1, CalificacionConceptual.MUY_BUENO, "Presenta producciones orales con claridad."),
                    calificacion("Ciencias Sociales", 8.0, CalificacionConceptual.BUENO, "Analiza procesos sociales relevantes."),
                    calificacion("Música", 8.4, CalificacionConceptual.MUY_BUENO, "Mantiene el pulso grupal.")
            ));
        }

        generarAsistenciasUltimos30Dias(datosSecciones2025.stream().map(SeccionData::seccion).toList(), t1_2025, t2_2025, t3_2025);
        generarAsistenciasRango(datosSecciones2024.stream().map(SeccionData::seccion).toList(),
                LocalDate.of(2024, 3, 4), LocalDate.of(2024, 11, 20), t1_2024, t2_2024, t3_2024);
        generarAsistenciasRango(datosSecciones2023.stream().map(SeccionData::seccion).toList(),
                LocalDate.of(2023, 3, 6), LocalDate.of(2023, 11, 15), t1_2023, t2_2023, t3_2023);

        Aspirante aspirante1 = crearAspiranteConFamiliar(new PersonaSeed("Agustín", "Pereyra", "47000001", "Mónica", "Pereyra", "33000001", RolVinculo.MADRE, false));
        Aspirante aspirante2 = crearAspiranteConFamiliar(new PersonaSeed("Camila", "Vega", "47000002", "Eliana", "Vega", "33000002", RolVinculo.MADRE, false));
        crearSolicitudesDemostracion(aspirante1, aspirante2);

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
        // Deja activo solo el primer trimestre del período inicial. Los
        // restantes quedan inactivos hasta que la dirección los habilite.
        t.setEstado(orden == 1 ? TrimestreEstado.ACTIVO : TrimestreEstado.INACTIVO);
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

    private Map<String, Materia> ensureMateriasCatalogo(Set<String> nombres) {
        Map<String, Materia> materias = new LinkedHashMap<>();
        for (String nombre : nombres) {
            materias.put(nombre, ensureMateria(nombre));
        }
        return materias;
    }

    private SeccionMateria ensureSeccionMateriaEntity(Seccion seccion, Materia materia) {
        return seccionMateriaRepository.findAll().stream()
                .filter(sm -> sm.getSeccion().getId().equals(seccion.getId())
                        && sm.getMateria().getId().equals(materia.getId()))
                .findFirst()
                .orElseGet(() -> {
                    SeccionMateria sm = new SeccionMateria();
                    sm.setSeccion(seccion);
                    sm.setMateria(materia);
                    return seccionMateriaRepository.save(sm);
                });
    }

    private void ensureSeccionMateria(Seccion s, Materia m) {
        ensureSeccionMateriaEntity(s, m);
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

    private Map<String, Empleado> ensureDocentes(List<DocenteSeed> seeds) {
        Map<String, Empleado> docentes = new LinkedHashMap<>();
        for (DocenteSeed seed : seeds) {
            Empleado docente = ensureDocente(seed.nombre(), seed.apellido(), seed.dni(), seed.cuil());
            if (seed.ingreso() != null && (docente.getFechaIngreso() == null || !docente.getFechaIngreso().equals(seed.ingreso()))) {
                docente.setFechaIngreso(seed.ingreso());
                empleadoRepository.save(docente);
            }
            if (seed.email() != null) {
                Set<UserRole> roles = (seed.roles() != null && !seed.roles().isEmpty())
                        ? seed.roles()
                        : Set.of(UserRole.TEACHER);
                ensurePersonaCredentials(docente.getPersona(), seed.email(), seed.password(), roles);
            }
            docentes.put(seed.key(), docente);
        }
        return docentes;
    }

    private List<MateriaAssignment> planPrimario(String titularKey) {
        return List.of(
                materia("Lengua", titularKey),
                materia("Matemática", titularKey),
                materia("Ciencias Naturales", titularKey),
                materia("Ciencias Sociales", titularKey),
                materia("Inglés", "DOC_INGLES"),
                materia("Educación Física", "DOC_EDFIS"),
                materia("Música", "DOC_MUSICA")
        );
    }

    private List<MateriaAssignment> planInicial(String titularKey) {
        return List.of();
    }

    private MateriaAssignment materia(String nombre, String docenteKey) {
        return new MateriaAssignment(nombre, docenteKey, RolMateria.TITULAR);
    }

    private SeccionData ensureSeccionCompleta(PeriodoEscolar periodo, SeccionSetup setup,
                                              Map<String, Empleado> docentes, Map<String, Materia> materiasCatalogo) {
        Empleado titular = Optional.ofNullable(docentes.get(setup.docenteTitularKey()))
                .orElseThrow(() -> new IllegalArgumentException("Docente no encontrado: " + setup.docenteTitularKey()));
        Seccion seccion = ensureSeccion(periodo, setup.nivel(), setup.gradoSala(), setup.division(), setup.turno());
        ensureTitularSeccion(titular, seccion, setup.vigenciaDesde());

        Map<String, SeccionMateria> materias = new LinkedHashMap<>();
        for (MateriaAssignment assignment : setup.materias()) {
            Materia materia = materiasCatalogo.computeIfAbsent(assignment.materia(), this::ensureMateria);
            SeccionMateria seccionMateria = ensureSeccionMateriaEntity(seccion, materia);
            materias.put(assignment.materia(), seccionMateria);

            Empleado docenteMateria = Optional.ofNullable(docentes.get(assignment.docenteKey()))
                    .orElseThrow(() -> new IllegalArgumentException("Docente no encontrado: " + assignment.docenteKey()));
            ensureTitularMateria(docenteMateria, seccionMateria, setup.vigenciaDesde(), assignment.rol());
        }

        List<Matricula> matriculas = crearAlumnoConFamiliaYMatricula(seccion, periodo, setup.matriculaDesde(),
                setup.alumnos().toArray(new PersonaSeed[0]));
        return new SeccionData(seccion, materias, matriculas);
    }

    private void ensureTitularMateria(Empleado docente, SeccionMateria seccionMateria, LocalDate desde, RolMateria rol) {
        List<AsignacionDocenteMateria> asignaciones = asigMatRepo.findAll().stream()
                .filter(a -> a.getSeccionMateria().getId().equals(seccionMateria.getId()))
                .toList();

        boolean yaAsignado = asignaciones.stream().anyMatch(a ->
                a.getEmpleado() != null
                        && docente.getId().equals(a.getEmpleado().getId())
                        && a.getRol() == rol
                        && Objects.equals(a.getVigenciaDesde(), desde)
                        && a.getVigenciaHasta() == null);
        if (yaAsignado) {
            return;
        }

        if (rol == RolMateria.TITULAR) {
            boolean overlap = asigMatRepo.hasTitularOverlap(seccionMateria.getId(), desde, LocalDate.of(9999, 12, 31), null);
            boolean mismoDocente = asignaciones.stream().anyMatch(a ->
                    a.getRol() == RolMateria.TITULAR
                            && docente.getId().equals(a.getEmpleado().getId())
                            && vigente(a.getVigenciaDesde(), a.getVigenciaHasta(), desde));
            if (overlap && !mismoDocente) {
                return;
            }
        }

        AsignacionDocenteMateria asignacion = new AsignacionDocenteMateria();
        asignacion.setSeccionMateria(seccionMateria);
        asignacion.setEmpleado(docente);
        asignacion.setRol(rol);
        asignacion.setVigenciaDesde(desde);
        asignacion.setVigenciaHasta(null);
        asigMatRepo.save(asignacion);
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

    private List<Matricula> crearAlumnoConFamiliaYMatricula(Seccion seccion, PeriodoEscolar periodo, LocalDate asignacionDesde, PersonaSeed... seeds) {
        List<Matricula> matriculas = new ArrayList<>();
        for (PersonaSeed ps : seeds) {
            Alumno alumno = ensureAlumno(ps.nombre(), ps.apellido(), ps.dni());
            Familiar familiar = ensureFamiliar(ps.famNombre(), ps.famApellido(), ps.famDni());
            RolVinculo vinculo = ps.rolVinculo() != null ? ps.rolVinculo() : RolVinculo.MADRE;
            ensureVinculoAlumnoFamiliar(alumno, familiar, vinculo, ps.convive());
            Matricula matricula = ensureMatricula(alumno, periodo);
            ensureMatriculaSeccionVigente(matricula, seccion, asignacionDesde);
            matriculas.add(matricula);
        }
        return matriculas;
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
    // EVALUACIONES Y CALIFICACIONES
    // =========================================================================

    private void crearEvaluacionConResultados(SeccionData data, Trimestre trimestre, String materiaNombre, LocalDate fecha, double peso) {
        SeccionMateria seccionMateria = data.materias().get(materiaNombre);
        if (seccionMateria == null) {
            return;
        }
        String tema = materiaNombre + " - Evaluación integradora";
        Evaluacion evaluacion = ensureEvaluacion(seccionMateria, trimestre, fecha, tema, peso);
        int index = 0;
        for (Matricula matricula : data.matriculas()) {
            double nota = 7.0 + (index % 4) * 0.8;
            String concepto = conceptoResultado(nota);
            ensureResultadoEvaluacion(evaluacion, matricula, nota, concepto, "Desempeño en " + materiaNombre.toLowerCase());
            index++;
        }
    }

    private Evaluacion ensureEvaluacion(SeccionMateria seccionMateria, Trimestre trimestre, LocalDate fecha, String tema, Double peso) {
        return evaluacionRepository.findAll().stream()
                .filter(e -> e.getSeccionMateria().getId().equals(seccionMateria.getId())
                        && e.getTrimestre().getId().equals(trimestre.getId())
                        && Objects.equals(e.getFecha(), fecha)
                        && Objects.equals(e.getTema(), tema))
                .findFirst()
                .orElseGet(() -> {
                    Evaluacion e = new Evaluacion();
                    e.setSeccionMateria(seccionMateria);
                    e.setTrimestre(trimestre);
                    e.setFecha(fecha);
                    e.setTema(tema);
                    e.setPeso(peso);
                    return evaluacionRepository.save(e);
                });
    }

    private void ensureResultadoEvaluacion(Evaluacion evaluacion, Matricula matricula, Double nota, String notaConceptual, String observaciones) {
        resultadoEvaluacionRepository.findByEvaluacionIdAndMatriculaId(evaluacion.getId(), matricula.getId())
                .ifPresentOrElse(existing -> {
                    boolean changed = !Objects.equals(existing.getNotaNumerica(), nota)
                            || !Objects.equals(existing.getNotaConceptual(), notaConceptual)
                            || !Objects.equals(existing.getObservaciones(), observaciones);
                    if (changed) {
                        existing.setNotaNumerica(nota);
                        existing.setNotaConceptual(notaConceptual);
                        existing.setObservaciones(observaciones);
                        resultadoEvaluacionRepository.save(existing);
                    }
                }, () -> {
                    ResultadoEvaluacion nuevo = new ResultadoEvaluacion();
                    nuevo.setEvaluacion(evaluacion);
                    nuevo.setMatricula(matricula);
                    nuevo.setNotaNumerica(nota);
                    nuevo.setNotaConceptual(notaConceptual);
                    nuevo.setObservaciones(observaciones);
                    resultadoEvaluacionRepository.save(nuevo);
                });
    }

    private String conceptoResultado(double nota) {
        if (nota >= 9.0) {
            return "Excelente";
        }
        if (nota >= 8.0) {
            return "Muy bueno";
        }
        if (nota >= 7.0) {
            return "Bueno";
        }
        return "En proceso";
    }

    private void asignarCalificaciones(SeccionData data, Trimestre trimestre, List<CalificacionSeed> seeds) {
        for (CalificacionSeed seed : seeds) {
            SeccionMateria seccionMateria = data.materias().get(seed.materia());
            if (seccionMateria == null) {
                continue;
            }
            for (int i = 0; i < data.matriculas().size(); i++) {
                Matricula matricula = data.matriculas().get(i);
                Double nota = ajustarNota(seed.nota(), i);
                ensureCalificacionTrimestral(trimestre, seccionMateria, matricula, nota, seed.conceptual(), seed.observaciones());
            }
        }
    }

    private void ensureCalificacionTrimestral(Trimestre trimestre, SeccionMateria seccionMateria, Matricula matricula,
                                              Double nota, CalificacionConceptual conceptual, String observaciones) {
        Optional<CalificacionTrimestral> existente = calificacionTrimestralRepository.findAll().stream()
                .filter(ct -> ct.getTrimestre().getId().equals(trimestre.getId())
                        && ct.getSeccionMateria().getId().equals(seccionMateria.getId())
                        && ct.getMatricula().getId().equals(matricula.getId()))
                .findFirst();
        if (existente.isPresent()) {
            CalificacionTrimestral ct = existente.get();
            boolean changed = !Objects.equals(ct.getNotaNumerica(), nota)
                    || ct.getNotaConceptual() != conceptual
                    || !Objects.equals(ct.getObservaciones(), observaciones);
            if (changed) {
                ct.setNotaNumerica(nota);
                ct.setNotaConceptual(conceptual);
                ct.setObservaciones(observaciones);
                calificacionTrimestralRepository.save(ct);
            }
        } else {
            CalificacionTrimestral ct = new CalificacionTrimestral();
            ct.setTrimestre(trimestre);
            ct.setSeccionMateria(seccionMateria);
            ct.setMatricula(matricula);
            ct.setNotaNumerica(nota);
            ct.setNotaConceptual(conceptual);
            ct.setObservaciones(observaciones);
            calificacionTrimestralRepository.save(ct);
        }
    }

    private Double ajustarNota(Double base, int index) {
        if (base == null) {
            return null;
        }
        double ajuste = (index % 3) * 0.3 - 0.3;
        double valor = Math.min(10d, Math.max(6d, base + ajuste));
        return Math.round(valor * 10d) / 10d;
    }

    private CalificacionSeed calificacion(String materia, Double nota, CalificacionConceptual conceptual, String observaciones) {
        return new CalificacionSeed(materia, nota, conceptual, observaciones);
    }

    // =========================================================================
    // ASISTENCIAS (demo)
    // =========================================================================

    private void generarAsistenciasUltimos30Dias(List<Seccion> secciones, Trimestre t1, Trimestre t2, Trimestre t3) {
        LocalDate hoy = LocalDate.now();
        generarAsistenciasRango(secciones, hoy.minusDays(30), hoy, t1, t2, t3);
    }

    private void generarAsistenciasRango(List<Seccion> secciones, LocalDate inicio, LocalDate fin, Trimestre... trimestres) {
        if (secciones == null || secciones.isEmpty() || trimestres == null || trimestres.length == 0) {
            return;
        }
        Random rnd = new Random(Objects.hash(inicio, fin));

        for (Seccion s : secciones) {
            for (LocalDate fecha = inicio; !fecha.isAfter(fin); fecha = fecha.plusDays(1)) {
                if (fecha.getDayOfWeek() == DayOfWeek.SATURDAY || fecha.getDayOfWeek() == DayOfWeek.SUNDAY) continue;

                Trimestre tri = pickTrimestrePorFecha(fecha, trimestres);
                if (tri == null) continue;

                JornadaAsistencia j = ensureJornada(s, tri, fecha);

                List<Matricula> mats = matSecHistRepository.findActivosBySeccionOnDate(s.getId(), fecha).stream()
                        .map(MatriculaSeccionHistorial::getMatricula)
                        .filter(Objects::nonNull)
                        .collect(Collectors.collectingAndThen(
                                Collectors.toCollection(LinkedHashSet::new),
                                ArrayList::new));

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

    private Trimestre pickTrimestrePorFecha(LocalDate f, Trimestre... trimestres) {
        if (trimestres == null) {
            return null;
        }
        for (Trimestre trimestre : trimestres) {
            if (trimestre == null) {
                continue;
            }
            if (!f.isBefore(trimestre.getInicio()) && !f.isAfter(trimestre.getFin())) {
                return trimestre;
            }
        }
        return null;
    }

    private JornadaAsistencia ensureJornada(Seccion s, Trimestre t, LocalDate fecha) {
        return jornadaRepo.findBySeccionIdAndFecha(s.getId(), fecha)
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
        RolVinculo rol = seed.rolVinculo() != null ? seed.rolVinculo() : RolVinculo.MADRE;
        ensureVinculoAspiranteFamiliar(a, f, rol, seed.convive());
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
    // UTILIDADES
    // =========================================================================

    private DocenteSeed docente(String key, String nombre, String apellido, String dni, String cuil,
                                String email, String password, Set<UserRole> roles, LocalDate ingreso) {
        return new DocenteSeed(key, nombre, apellido, dni, cuil, email, password, roles, ingreso);
    }

    private PersonaSeed alumno(String nombre, String apellido, String dni,
                               String famNombre, String famApellido, String famDni,
                               RolVinculo rol, boolean convive) {
        return new PersonaSeed(nombre, apellido, dni, famNombre, famApellido, famDni, rol, convive);
    }

    private SeccionSetup seccion(String key, NivelAcademico nivel, String gradoSala, String division, Turno turno,
                                 String docenteTitularKey, LocalDate vigenciaDesde, LocalDate matriculaDesde,
                                 List<MateriaAssignment> materias, List<PersonaSeed> alumnos) {
        return new SeccionSetup(key, nivel, gradoSala, division, turno, docenteTitularKey, vigenciaDesde, matriculaDesde, materias, alumnos);
    }

    private record DocenteSeed(String key, String nombre, String apellido, String dni, String cuil,
                               String email, String password, Set<UserRole> roles, LocalDate ingreso) {}

    private record PersonaSeed(String nombre, String apellido, String dni,
                               String famNombre, String famApellido, String famDni,
                               RolVinculo rolVinculo, boolean convive) {
        PersonaSeed(String nombre, String apellido, String dni,
                    String famNombre, String famApellido, String famDni) {
            this(nombre, apellido, dni, famNombre, famApellido, famDni, RolVinculo.MADRE, true);
        }
    }

    private record MateriaAssignment(String materia, String docenteKey, RolMateria rol) {}

    private record SeccionSetup(String key, NivelAcademico nivel, String gradoSala, String division, Turno turno,
                                String docenteTitularKey, LocalDate vigenciaDesde, LocalDate matriculaDesde,
                                List<MateriaAssignment> materias, List<PersonaSeed> alumnos) {}

    private record SeccionData(Seccion seccion, Map<String, SeccionMateria> materias, List<Matricula> matriculas) {}

    private record CalificacionSeed(String materia, Double nota, CalificacionConceptual conceptual, String observaciones) {}

    private boolean vigente(LocalDate desde, LocalDate hasta, LocalDate f) {
        boolean okDesde = (desde == null) || !f.isBefore(desde);
        boolean okHasta = (hasta == null) || !f.isAfter(hasta);
        return okDesde && okHasta;
    }
}
