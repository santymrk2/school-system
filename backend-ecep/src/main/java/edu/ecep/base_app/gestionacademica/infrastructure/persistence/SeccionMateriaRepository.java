package edu.ecep.base_app.gestionacademica.infrastructure.persistence;

import edu.ecep.base_app.gestionacademica.domain.SeccionMateria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeccionMateriaRepository extends JpaRepository<SeccionMateria, Long> {
    boolean existsBySeccionIdAndMateriaId(Long seccionId, Long materiaId);
    List<SeccionMateria> findBySeccionId(Long seccionId);
}
