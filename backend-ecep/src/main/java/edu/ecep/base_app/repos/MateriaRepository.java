package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Materia;
import org.springframework.data.jpa.repository.JpaRepository;


public interface MateriaRepository extends JpaRepository<Materia, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
}