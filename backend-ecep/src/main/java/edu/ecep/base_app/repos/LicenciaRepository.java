package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Licencia;
import org.springframework.data.jpa.repository.JpaRepository;


public interface LicenciaRepository extends JpaRepository<Licencia, Long> {
    boolean existsByEmpleadoId(Long id);
}
