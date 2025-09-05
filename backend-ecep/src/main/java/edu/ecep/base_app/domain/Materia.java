package edu.ecep.base_app.domain;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;


@Entity
@Table(name = "materias")
@SQLDelete(sql = "UPDATE materias SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Materia extends BaseEntity{
    @Column(nullable = false)
    private String nombre;
}
