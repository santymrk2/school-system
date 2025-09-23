package edu.ecep.base_app.finanzas.infrastructure.persistence;

import edu.ecep.base_app.finanzas.domain.Cuota;
import edu.ecep.base_app.gestionacademica.domain.Seccion;
import java.util.List;
import java.util.Optional;

import edu.ecep.base_app.finanzas.domain.enums.ConceptoCuota;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CuotaRepository extends JpaRepository<Cuota, Long> {
    boolean existsByMatriculaIdAndAnioAndMesAndConcepto(Long matriculaId, Integer anio, Integer mes, ConceptoCuota concepto);
    boolean existsByMatriculaIdAndAnioAndConcepto(Long matriculaId, Integer anio, ConceptoCuota concepto);
    Optional<Cuota> findByCodigoPago(String codigoPago);
    boolean existsByCodigoPago(String codigoPago);
}
