package edu.ecep.base_app.gestionacademica.infrastructure.persistence;

import edu.ecep.base_app.gestionacademica.domain.Evaluacion;
import edu.ecep.base_app.gestionacademica.domain.Materia;
import edu.ecep.base_app.gestionacademica.domain.Seccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;


public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long>, JpaSpecificationExecutor<Evaluacion> {
    //List<Evaluacion> findBySeccionMateriaIdAndTrimestreId(Long seccionMateriaId, Long trimestreId);
}
