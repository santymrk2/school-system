package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.AsignacionDocente;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AsignacionDocenteRepository extends JpaRepository<AsignacionDocente, Long> {
    boolean existsBySeccionId(Long id);

    boolean existsByDocenteId(Long id);

    boolean existsByMateriaId(Long id);
}
