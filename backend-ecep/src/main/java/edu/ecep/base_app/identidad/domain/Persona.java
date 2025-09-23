package edu.ecep.base_app.identidad.domain;

import edu.ecep.base_app.shared.domain.BaseEntity;
import edu.ecep.base_app.identidad.domain.enums.UserRole;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "personas")
@SQLDelete(sql = "UPDATE personas SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class Persona extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String dni;

    private String nombre;

    private String apellido;

    @Email
    @Column(unique = true)
    private String email;

    private String telefono;

    private String domicilio;

    private LocalDate fechaNacimiento;

    private String genero;

    private String estadoCivil;

    private String nacionalidad;

    private String celular;

    @Email
    private String emailContacto;

    private String fotoPerfilUrl;

    /** Contraseña codificada (BCrypt). */
    @Column(name = "password_hash")
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "persona_roles", joinColumns = @JoinColumn(name = "persona_id"))
    @Column(name = "rol")
    @Enumerated(EnumType.STRING)
    private Set<UserRole> roles = new HashSet<>();
}

