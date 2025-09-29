package edu.ecep.base_app.admisiones.infrastructure.persistence;

import edu.ecep.base_app.admisiones.domain.SolicitudAdmision;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolicitudAdmisionRepository extends JpaRepository<SolicitudAdmision, Long> {

    boolean existsByAspiranteId(Long id);

    Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "dateCreated");

    @Override
    @EntityGraph(attributePaths = {"aspirante", "aspirante.persona"})
    List<SolicitudAdmision> findAll(Sort sort);

    @EntityGraph(attributePaths = {"aspirante", "aspirante.persona"})
    List<SolicitudAdmision> findAllByAspiranteId(Long aspiranteId, Sort sort);

    @Override
    @EntityGraph(attributePaths = {"aspirante", "aspirante.persona"})
    Optional<SolicitudAdmision> findById(Long id);

    @EntityGraph(attributePaths = {"aspirante", "aspirante.persona", "aspirante.familiares", "aspirante.familiares.familiar", "aspirante.familiares.familiar.persona"})
    Optional<SolicitudAdmision> findByPortalTokenSeleccion(String portalTokenSeleccion);
}
