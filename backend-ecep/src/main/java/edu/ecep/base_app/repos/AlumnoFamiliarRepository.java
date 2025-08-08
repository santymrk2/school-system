package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Alumno;
import edu.ecep.base_app.domain.AlumnoFamiliar;
import edu.ecep.base_app.domain.Familiar;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AlumnoFamiliarRepository extends JpaRepository<AlumnoFamiliar, Long> {


    boolean existsByFamiliarId(Long id);

    boolean existsByAlumnoId(Long id);
}
