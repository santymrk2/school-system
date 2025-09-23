package edu.ecep.base_app.gestionacademica.infrastructure.persistence;

import edu.ecep.base_app.gestionacademica.domain.Trimestre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TrimestreRepository extends JpaRepository<Trimestre, Long> {
    boolean existsByPeriodoEscolarIdAndOrden(Long periodoEscolarId, Integer orden);
    // trimestre que contiene la fecha (el más “reciente” por inicio)
    Optional<Trimestre> findTopByInicioLessThanEqualAndFinGreaterThanEqualOrderByInicioDesc(
            LocalDate fecha1, LocalDate fecha2
    );

    List<Trimestre> findByPeriodoEscolarIdOrderByOrdenAsc(Long periodoEscolarId);
}
