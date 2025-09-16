package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Familiar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface FamiliarRepository extends JpaRepository<Familiar, Long> {
    List<Familiar> findByPersona_NombreContainingIgnoreCaseOrPersona_ApellidoContainingIgnoreCase(String q1, String q2);
    boolean existsByPersonaId(Long id);
    Optional<Familiar> findByPersonaId(Long personaId);
}
