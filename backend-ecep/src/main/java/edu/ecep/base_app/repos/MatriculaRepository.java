package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Matricula;
import edu.ecep.base_app.domain.Seccion;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    boolean existsBySeccionId(Long id);

    boolean existsByAlumnoId(Long id);
}