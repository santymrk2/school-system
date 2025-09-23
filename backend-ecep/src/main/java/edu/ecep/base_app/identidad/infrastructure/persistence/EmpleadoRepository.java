package edu.ecep.base_app.identidad.infrastructure.persistence;

import edu.ecep.base_app.identidad.domain.Empleado;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByPersonaId(Long personaId);
    boolean existsByPersonaId(Long id);
}
