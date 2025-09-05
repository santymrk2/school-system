package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Personal;
import edu.ecep.base_app.domain.ReciboSueldo;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ReciboSueldoRepository extends JpaRepository<ReciboSueldo, Long> {
    boolean existsByPersonalId(Long id);
}
