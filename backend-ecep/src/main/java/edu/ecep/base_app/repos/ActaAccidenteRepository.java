package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.ActaAccidente;
import edu.ecep.base_app.domain.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ActaAccidenteRepository extends JpaRepository<ActaAccidente, Long> {

}
