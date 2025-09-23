package edu.ecep.base_app.calendario.infrastructure.persistence;

import edu.ecep.base_app.calendario.domain.DiaNoHabil;
import org.springframework.data.jpa.repository.JpaRepository;


public interface DiaNoHabilRepository extends JpaRepository<DiaNoHabil, Long> {
}
