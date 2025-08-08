package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Cuota;
import edu.ecep.base_app.domain.Seccion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CuotaRepository extends JpaRepository<Cuota, Long> {

    boolean existsBySeccionId(Long id);
}
