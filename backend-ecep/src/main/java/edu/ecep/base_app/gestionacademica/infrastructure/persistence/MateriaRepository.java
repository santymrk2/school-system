package edu.ecep.base_app.gestionacademica.infrastructure.persistence;

import edu.ecep.base_app.gestionacademica.domain.Materia;
import org.springframework.data.jpa.repository.JpaRepository;


public interface MateriaRepository extends JpaRepository<Materia, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
}