package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.AsistenciaDia;
import edu.ecep.base_app.domain.Seccion;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AsistenciaDiaRepository extends JpaRepository<AsistenciaDia, Long> {

    boolean existsBySeccionId(Long id);
}
