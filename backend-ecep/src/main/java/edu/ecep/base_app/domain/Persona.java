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

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name="personas")
@SQLDelete(sql = "UPDATE personas SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class Persona extends BaseEntity {
    @Column(nullable=false, unique=true, length=20) String dni;
    String nombre; String apellido;
    String email; String telefono; String domicilio;
    LocalDate fechaNacimiento; String genero;
    String estadoCivil; String nacionalidad; String celular;
    @Email String emailContacto;
    String fotoPerfilUrl;

    @OneToOne(fetch=LAZY, optional=true)
    @JoinColumn(name="usuario_id", unique=true, foreignKey=@ForeignKey(name="fk_persona_usuario"))
    Usuario usuario;
}


