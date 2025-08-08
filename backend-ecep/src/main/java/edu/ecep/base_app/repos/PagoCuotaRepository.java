package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Alumno;
import edu.ecep.base_app.domain.Cuota;
import edu.ecep.base_app.domain.PagoCuota;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PagoCuotaRepository extends JpaRepository<PagoCuota, Long> {

}
