package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Alumno;
import edu.ecep.base_app.domain.AsistenciaDia;
import edu.ecep.base_app.domain.RegistroAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;


public interface RegistroAsistenciaRepository extends JpaRepository<RegistroAsistencia, Long> {

}
