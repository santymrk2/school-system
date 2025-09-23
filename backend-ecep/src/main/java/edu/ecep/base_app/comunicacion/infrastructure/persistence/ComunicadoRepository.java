package edu.ecep.base_app.comunicacion.infrastructure.persistence;

import edu.ecep.base_app.comunicacion.domain.Comunicado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface ComunicadoRepository extends JpaRepository<Comunicado, Long> {
    List<Comunicado> findByActivoTrueOrderByIdDesc();
    Optional<Comunicado> findByIdAndActivoTrue(Long id);
}
