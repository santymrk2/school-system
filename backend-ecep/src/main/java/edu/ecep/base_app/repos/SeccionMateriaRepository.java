package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.SeccionMateria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeccionMateriaRepository extends JpaRepository<SeccionMateria, Long> {
    boolean existsBySeccionIdAndMateriaId(Long seccionId, Long materiaId);
    List<SeccionMateria> findBySeccionId(Long seccionId);
}
