package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Aspirante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface AspiranteRepository extends JpaRepository<Aspirante, Long> {
    boolean existsByPersonaId(Long personaId);
    Optional<Aspirante> findByPersonaId(Long personaId);
}
