package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.AsistenciaEmpleados;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsistenciaEmpleadoRepository extends JpaRepository<AsistenciaEmpleados, Long> {
    boolean existsByEmpleadoId(Long empleadoId);
}
