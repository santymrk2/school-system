package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Materia;
import edu.ecep.base_app.domain.Seccion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;


public interface SeccionRepository extends JpaRepository<Seccion, Long> {

}
