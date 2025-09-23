package edu.ecep.base_app.asistencias.infrastructure.persistence;

import edu.ecep.base_app.asistencias.domain.AsistenciaEmpleados;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsistenciaEmpleadoRepository extends JpaRepository<AsistenciaEmpleados, Long> {
    boolean existsByEmpleadoId(Long empleadoId);
}
