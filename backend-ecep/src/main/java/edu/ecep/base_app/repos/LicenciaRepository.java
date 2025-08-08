package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Licencia;
import edu.ecep.base_app.domain.Personal;
import org.springframework.data.jpa.repository.JpaRepository;


public interface LicenciaRepository extends JpaRepository<Licencia, Long> {
    boolean existsByPersonalId(Long id);
}
