package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.ResultadoEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResultadoEvaluacionRepository extends JpaRepository<ResultadoEvaluacion, Long> {
    boolean existsByEvaluacionIdAndMatriculaId(Long evaluacionId, Long matriculaId);
    List<ResultadoEvaluacion> findByEvaluacionId(Long evaluacionId);
    Optional<ResultadoEvaluacion> findByEvaluacionIdAndMatriculaId(Long evaluacionId, Long matriculaId);
}
