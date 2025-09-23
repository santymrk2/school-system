package edu.ecep.base_app.vidaescolar.infrastructure.persistence;

import edu.ecep.base_app.vidaescolar.domain.ActaAccidente;
import edu.ecep.base_app.identidad.domain.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ActaAccidenteRepository extends JpaRepository<ActaAccidente, Long> {

}
