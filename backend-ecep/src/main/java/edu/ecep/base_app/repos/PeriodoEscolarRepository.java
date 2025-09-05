package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.PeriodoEscolar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeriodoEscolarRepository extends JpaRepository<PeriodoEscolar, Long> {
    boolean existsByAnio(Integer anio);
}
