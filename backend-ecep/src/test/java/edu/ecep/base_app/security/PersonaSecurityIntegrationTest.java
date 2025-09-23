package edu.ecep.base_app.security;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.ecep.base_app.identidad.domain.*;
import edu.ecep.base_app.identidad.domain.enums.*;
import edu.ecep.base_app.identidad.application.*;

import edu.ecep.base_app.identidad.infrastructure.persistence.*;
import edu.ecep.base_app.identidad.presentation.dto.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PersonaSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private final AtomicInteger sequence = new AtomicInteger(0);

    private Persona persistPersona(UserRole... roles) {
        int index = sequence.incrementAndGet();
        Persona persona = new Persona();
        persona.setNombre("Persona" + index);
        persona.setApellido("Test" + index);
        persona.setDni(String.format("%08d", 10000000 + index));
        persona.setEmail("persona" + index + "@example.com");
        persona.setPassword(passwordEncoder.encode("Password" + index));
        if (roles != null && roles.length > 0) {
            persona.setRoles(EnumSet.copyOf(Arrays.asList(roles)));
        } else {
            persona.setRoles(new HashSet<>());
        }
        return personaRepository.save(persona);
    }

    private String issueToken(UserRole... roles) {
        Persona persona = persistPersona(roles);
        return jwtService.generateToken(persona);
    }

    private PersonaCreateDTO buildCreateDto() {
        int index = sequence.incrementAndGet();
        PersonaCreateDTO dto = new PersonaCreateDTO();
        dto.setNombre("Nombre" + index);
        dto.setApellido("Apellido" + index);
        dto.setDni(String.format("%08d", 20000000 + index));
        dto.setEmail("nueva" + index + "@example.com");
        dto.setPassword("Passw0rd!" + index);
        dto.setRoles(EnumSet.of(UserRole.STUDENT));
        return dto;
    }

    private PersonaUpdateDTO buildUpdateDto() {
        int index = sequence.incrementAndGet();
        PersonaUpdateDTO dto = new PersonaUpdateDTO();
        dto.setEmail("actualizado" + index + "@example.com");
        dto.setPassword("NuevaPass!" + index);
        dto.setRoles(EnumSet.of(UserRole.STUDENT));
        return dto;
    }

    @Test
    void shouldRejectPersonaCreationWhenAnonymous() throws Exception {
        PersonaCreateDTO dto = buildCreateDto();

        mockMvc.perform(post("/api/personas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectPersonaCreationForUnauthorizedRole() throws Exception {
        PersonaCreateDTO dto = buildCreateDto();
        String familyToken = issueToken(UserRole.FAMILY);

        mockMvc.perform(post("/api/personas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + familyToken)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowPersonaCreationForAdmin() throws Exception {
        PersonaCreateDTO dto = buildCreateDto();
        String adminToken = issueToken(UserRole.ADMIN);

        mockMvc.perform(post("/api/personas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());

        assertThat(personaRepository.findByEmail(dto.getEmail())).isPresent();
    }

    @Test
    void shouldRejectPersonaUpdateWhenAnonymous() throws Exception {
        Persona persona = persistPersona(UserRole.STUDENT);
        PersonaUpdateDTO updateDto = buildUpdateDto();

        mockMvc.perform(put("/api/personas/" + persona.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectPersonaUpdateForUnauthorizedRole() throws Exception {
        Persona persona = persistPersona(UserRole.STUDENT);
        PersonaUpdateDTO updateDto = buildUpdateDto();
        String familyToken = issueToken(UserRole.FAMILY);

        mockMvc.perform(put("/api/personas/" + persona.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + familyToken)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowPersonaUpdateForAdmin() throws Exception {
        Persona persona = persistPersona(UserRole.STUDENT);
        PersonaUpdateDTO updateDto = buildUpdateDto();
        String adminToken = issueToken(UserRole.ADMIN);

        mockMvc.perform(put("/api/personas/" + persona.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isNoContent());

        Persona updated = personaRepository.findById(persona.getId()).orElseThrow();
        assertThat(updated.getEmail()).isEqualTo(updateDto.getEmail());
    }

    @Test
    void shouldRejectPersonaSearchWhenAnonymous() throws Exception {
        mockMvc.perform(get("/api/personas/credenciales/search"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectPersonaSearchForUnauthorizedRole() throws Exception {
        String familyToken = issueToken(UserRole.FAMILY);

        mockMvc.perform(get("/api/personas/credenciales/search")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + familyToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowPersonaSearchForAdmin() throws Exception {
        Persona persona = persistPersona(UserRole.STUDENT);
        String adminToken = issueToken(UserRole.ADMIN);

        mockMvc.perform(get("/api/personas/credenciales/search")
                        .param("q", persona.getEmail())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].email").value(persona.getEmail()));
    }
}
