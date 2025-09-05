package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Evaluacion;
import edu.ecep.base_app.domain.Materia;
import edu.ecep.base_app.domain.Seccion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {
    //List<Evaluacion> findBySeccionMateriaIdAndTrimestreId(Long seccionMateriaId, Long trimestreId);
}

