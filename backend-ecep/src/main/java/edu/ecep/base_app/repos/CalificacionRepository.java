package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Alumno;
import edu.ecep.base_app.domain.Calificacion;
import edu.ecep.base_app.domain.Materia;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {
}
