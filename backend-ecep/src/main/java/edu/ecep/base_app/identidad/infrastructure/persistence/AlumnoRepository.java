package edu.ecep.base_app.identidad.infrastructure.persistence;

import edu.ecep.base_app.identidad.domain.Alumno;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    boolean existsByPersonaId(Long id);

    @EntityGraph(attributePaths = "persona")
    Optional<Alumno> findByPersonaId(Long personaId);

    @EntityGraph(attributePaths = "persona")
    List<Alumno> findAllBy(Sort sort);

    @EntityGraph(attributePaths = "persona")
    Optional<Alumno> findWithPersonaById(Long id);
}
