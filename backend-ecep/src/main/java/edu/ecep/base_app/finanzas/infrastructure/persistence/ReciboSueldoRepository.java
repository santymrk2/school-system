package edu.ecep.base_app.finanzas.infrastructure.persistence;

import edu.ecep.base_app.finanzas.domain.ReciboSueldo;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ReciboSueldoRepository extends JpaRepository<ReciboSueldo, Long> {
    boolean existsByEmpleadoId(Long id);
}
