package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    boolean existsByUsuarioId(Long id);
}
