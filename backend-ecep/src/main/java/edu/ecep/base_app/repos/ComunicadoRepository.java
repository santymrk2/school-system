package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Comunicado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface ComunicadoRepository extends JpaRepository<Comunicado, Long> {
    List<Comunicado> findByActivoTrueOrderByIdDesc();
    Optional<Comunicado> findByIdAndActivoTrue(Long id);
}
