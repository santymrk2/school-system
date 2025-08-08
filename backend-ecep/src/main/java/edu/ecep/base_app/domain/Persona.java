package edu.ecep.base_app.domain;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity
@EntityListeners(AuditingEntityListener.class)
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo", discriminatorType = DiscriminatorType.STRING)
@Filter(name = "activoFilter", condition = "activo = :activo")
@SQLDelete(sql = "UPDATE persona SET activo = false, fecha_eliminacion = now() WHERE id = ?")

@Getter
@Setter
public abstract class Persona extends BaseEntity{

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(nullable = false, unique = true, length = 20)
    private String dni;

    @Column
    private LocalDate fechaNacimiento;

    @Column
    private String genero;

    @Column
    private String estadoCivil;

    @Column
    private String nacionalidad;

    @Column(length = 500)
    private String domicilio;

    @Column
    private String telefono;

    @Column
    private String celular;

    @Email
    @Column
    private String emailContacto;

    @Column
    private String fotoPerfilUrl;

    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

}
