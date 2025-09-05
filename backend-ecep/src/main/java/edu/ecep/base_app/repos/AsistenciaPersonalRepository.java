package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.AsistenciaPersonal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsistenciaPersonalRepository extends JpaRepository<AsistenciaPersonal, Long> {
    boolean existsByPersonalId(Long personalId);
}
