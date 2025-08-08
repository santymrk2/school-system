package edu.ecep.base_app.repos;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AsistenciaPersonalRepository extends JpaRepository<edu.ecep.base_app.domain.AsistenciaPersonal, Long> {
    boolean existsByPersonalId(Long id);
}
