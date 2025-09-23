package edu.ecep.base_app.identidad.infrastructure.persistence;

import edu.ecep.base_app.identidad.domain.Licencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LicenciaRepository extends JpaRepository<Licencia, Long> {
    boolean existsByEmpleadoId(Long id);
    List<Licencia> findByEmpleadoId(Long empleadoId);
}
