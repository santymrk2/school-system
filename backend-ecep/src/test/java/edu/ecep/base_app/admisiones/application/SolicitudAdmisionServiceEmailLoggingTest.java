package edu.ecep.base_app.admisiones.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import edu.ecep.base_app.admisiones.domain.Aspirante;
import edu.ecep.base_app.admisiones.domain.AspiranteFamiliar;
import edu.ecep.base_app.admisiones.domain.SolicitudAdmision;
import edu.ecep.base_app.admisiones.infrastructure.mapper.SolicitudAdmisionMapper;
import edu.ecep.base_app.admisiones.infrastructure.persistence.AspiranteRepository;
import edu.ecep.base_app.admisiones.infrastructure.persistence.SolicitudAdmisionRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.SeccionRepository;
import edu.ecep.base_app.identidad.application.AlumnoService;
import edu.ecep.base_app.identidad.domain.Familiar;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.infrastructure.persistence.AlumnoFamiliarRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.AlumnoRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.EmpleadoRepository;
import edu.ecep.base_app.shared.notification.EmailService;
import edu.ecep.base_app.vidaescolar.application.MatriculaSeccionHistorialService;
import edu.ecep.base_app.vidaescolar.application.MatriculaService;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.MatriculaRepository;
import java.time.OffsetDateTime;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith({MockitoExtension.class, OutputCaptureExtension.class})
class SolicitudAdmisionServiceEmailLoggingTest {

    @Mock private SolicitudAdmisionRepository repository;
    @Mock private SolicitudAdmisionMapper mapper;
    @Mock private AspiranteRepository aspiranteRepository;
    @Mock private AlumnoRepository alumnoRepository;
    @Mock private AlumnoFamiliarRepository alumnoFamiliarRepository;
    @Mock private AlumnoService alumnoService;
    @Mock private MatriculaRepository matriculaRepository;
    @Mock private MatriculaService matriculaService;
    @Mock private MatriculaSeccionHistorialService matriculaSeccionHistorialService;
    @Mock private edu.ecep.base_app.calendario.infrastructure.persistence.PeriodoEscolarRepository
            periodoEscolarRepository;
    @Mock private SeccionRepository seccionRepository;
    @Mock private EmpleadoRepository empleadoRepository;
    @Mock private EmailService emailService;

    @InjectMocks private SolicitudAdmisionService service;

    @BeforeEach
    void setUp() {
        when(emailService.isNotificationsEnabled()).thenReturn(false);
    }

    @Test
    void shouldLogEmailContentWhenNotificationsAreDisabled(CapturedOutput output) throws Exception {

        SolicitudAdmision solicitud = buildSolicitud();

        ReflectionTestUtils.invokeMethod(
                service,
                "enviarCorreo",
                solicitud,
                "Propuesta de entrevista",
                "<p>Hola familia</p>",
                true);

        verify(emailService).isNotificationsEnabled();
        verify(emailService, never()).sendHtml(any(), any(), any());
        assertThat(output.getOut())
                .contains(
                        "[ADMISION][EMAIL-DISABLED] Simulando envío de correo solicitud=42 to=familia@example.com subject=Propuesta de entrevista formato=HTML body=<p>Hola familia</p>");
    }

    private SolicitudAdmision buildSolicitud() {
        Persona persona = new Persona();
        persona.setEmail("familia@example.com");

        Familiar familiar = new Familiar();
        familiar.setPersona(persona);

        AspiranteFamiliar aspiranteFamiliar = new AspiranteFamiliar();
        aspiranteFamiliar.setActivo(true);
        aspiranteFamiliar.setDateCreated(OffsetDateTime.now());
        aspiranteFamiliar.setFamiliar(familiar);

        Aspirante aspirante = new Aspirante();
        aspirante.setFamiliares(Set.of(aspiranteFamiliar));
        aspiranteFamiliar.setAspirante(aspirante);

        SolicitudAdmision solicitud = new SolicitudAdmision();
        solicitud.setId(42L);
        solicitud.setAspirante(aspirante);

        return solicitud;
    }
}

