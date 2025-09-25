package edu.ecep.base_app.gestionacademica.infrastructure.persistence;

import edu.ecep.base_app.gestionacademica.domain.CalificacionTrimestral;
import edu.ecep.base_app.gestionacademica.domain.TrimestreEstado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalificacionTrimestralRepository extends JpaRepository<CalificacionTrimestral, Long> {
    boolean existsByTrimestreIdAndSeccionMateriaIdAndMatriculaId(Long trimestreId, Long seccionMateriaId, Long matriculaId);

    List<CalificacionTrimestral> findByTrimestreEstado(TrimestreEstado estado);
}
