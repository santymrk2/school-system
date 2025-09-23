package edu.ecep.base_app.identidad.infrastructure.persistence;

import edu.ecep.base_app.identidad.domain.Familiar;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface FamiliarRepository extends JpaRepository<Familiar, Long> {

    @Override
    @EntityGraph(attributePaths = "persona")
    List<Familiar> findAll(Sort sort);

    @Override
    @EntityGraph(attributePaths = "persona")
    Optional<Familiar> findById(Long id);

    List<Familiar> findByPersona_NombreContainingIgnoreCaseOrPersona_ApellidoContainingIgnoreCase(String q1, String q2);
    boolean existsByPersonaId(Long id);
    Optional<Familiar> findByPersonaId(Long personaId);
}
