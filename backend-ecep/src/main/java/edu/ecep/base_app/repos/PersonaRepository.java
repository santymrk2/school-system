package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Persona;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonaRepository extends JpaRepository<Persona, Long> {
    Optional<Persona> findByDni(String dni);
    boolean existsByDni(String dni);
}
