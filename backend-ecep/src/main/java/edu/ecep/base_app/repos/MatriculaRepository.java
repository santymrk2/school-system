package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    boolean existsByAlumnoIdAndPeriodoEscolarId(Long alumnoId, Long periodoEscolarId);
    boolean existsByAlumnoId(Long id);
    Optional<Matricula> findByAlumnoIdAndPeriodoEscolarId(Long alumnoId, Long periodoEscolarId);

    List<Matricula> findByAlumnoId(@Param("alumnoId") Long alumnoId);
}