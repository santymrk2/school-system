package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.AsignacionDocenteMateria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface AsignacionDocenteMateriaRepository extends JpaRepository<AsignacionDocenteMateria, Long> {
    boolean existsByPersonalId(Long personalId); // +++
    @Query("""
      select (count(a) > 0) from AsignacionDocenteMateria a
      where a.seccionMateria.id = :smId and a.rol = edu.ecep.base_app.domain.enums.RolMateria.TITULAR
        and a.vigenciaDesde <= :hasta
        and (a.vigenciaHasta is null or a.vigenciaHasta >= :desde)
        and (:excludeId is null or a.id <> :excludeId)
    """)
    boolean hasTitularOverlap(@Param("smId") Long seccionMateriaId,
                              @Param("desde") LocalDate desde,
                              @Param("hasta") LocalDate hasta,
                              @Param("excludeId") Long excludeId);
}