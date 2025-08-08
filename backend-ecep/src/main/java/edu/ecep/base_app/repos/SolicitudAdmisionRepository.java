package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Aspirante;
import edu.ecep.base_app.domain.SolicitudAdmision;
import org.springframework.data.jpa.repository.JpaRepository;


public interface SolicitudAdmisionRepository extends JpaRepository<SolicitudAdmision, Long> {

    boolean existsByAspiranteId(Long id);
}
