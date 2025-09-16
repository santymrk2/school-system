package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    boolean existsByPersonaId(Long id);
    Optional<Alumno> findByPersonaId(Long personaId);
}
