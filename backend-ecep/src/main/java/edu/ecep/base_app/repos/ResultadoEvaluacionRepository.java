package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.ResultadoEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResultadoEvaluacionRepository extends JpaRepository<ResultadoEvaluacion, Long> {
    boolean existsByEvaluacionIdAndMatriculaId(Long evaluacionId, Long matriculaId);
}
