package edu.ecep.base_app.admisiones.infrastructure.persistence;

import edu.ecep.base_app.admisiones.domain.SolicitudAdmision;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

public interface SolicitudAdmisionRepository extends JpaRepository<SolicitudAdmision, Long> {

    boolean existsByAspiranteId(Long id);

    @Override
    @EntityGraph(attributePaths = {"aspirante", "aspirante.persona"})
    List<SolicitudAdmision> findAll(Sort sort);

    @Override
    @EntityGraph(attributePaths = {"aspirante", "aspirante.persona"})
    Optional<SolicitudAdmision> findById(Long id);
}
