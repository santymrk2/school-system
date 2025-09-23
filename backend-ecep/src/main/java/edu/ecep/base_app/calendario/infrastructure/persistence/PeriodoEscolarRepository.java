package edu.ecep.base_app.calendario.infrastructure.persistence;

import edu.ecep.base_app.calendario.domain.PeriodoEscolar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PeriodoEscolarRepository extends JpaRepository<PeriodoEscolar, Long> {
    boolean existsByAnio(Integer anio);
    List<PeriodoEscolar> findByActivoTrue();
}
