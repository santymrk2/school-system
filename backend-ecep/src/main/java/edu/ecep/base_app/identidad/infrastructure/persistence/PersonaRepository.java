package edu.ecep.base_app.identidad.infrastructure.persistence;

import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.domain.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

public interface PersonaRepository extends JpaRepository<Persona, Long> {
    Optional<Persona> findByDni(String dni);
    boolean existsByDni(String dni);
    Optional<Persona> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("""
            select distinct p.id
            from Persona p
            join p.roles roles
            where roles = :role
              and p.activo = true
            """)
    Set<Long> findActiveIdsByRole(@Param("role") UserRole role);
}
