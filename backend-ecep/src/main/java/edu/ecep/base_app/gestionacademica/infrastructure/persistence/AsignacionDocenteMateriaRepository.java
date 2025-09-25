package edu.ecep.base_app.gestionacademica.infrastructure.persistence;

import edu.ecep.base_app.gestionacademica.domain.AsignacionDocenteMateria;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AsignacionDocenteMateriaRepository extends JpaRepository<AsignacionDocenteMateria, Long> {

    @Override
    @EntityGraph(attributePaths = {"seccionMateria", "empleado"})
    List<AsignacionDocenteMateria> findAll();

    boolean existsByEmpleadoId(Long empleadoId); // +++
    @Query("""
      select (count(a) > 0) from AsignacionDocenteMateria a
      where a.seccionMateria.id = :smId and a.rol = edu.ecep.base_app.gestionacademica.domain.enums.RolMateria.TITULAR
        and a.vigenciaDesde <= :hasta
        and (a.vigenciaHasta is null or a.vigenciaHasta >= :desde)
        and (:excludeId is null or a.id <> :excludeId)
    """)
    boolean hasTitularOverlap(@Param("smId") Long seccionMateriaId,
                              @Param("desde") LocalDate desde,
                              @Param("hasta") LocalDate hasta,
                              @Param("excludeId") Long excludeId);

    @Query("""
      select a from AsignacionDocenteMateria a
      where a.seccionMateria.id = :smId and a.rol = edu.ecep.base_app.gestionacademica.domain.enums.RolMateria.TITULAR
        and a.vigenciaDesde <= :fecha
        and (a.vigenciaHasta is null or a.vigenciaHasta >= :fecha)
      order by a.vigenciaDesde desc
    """)
    List<AsignacionDocenteMateria> findTitularesVigentesEn(@Param("smId") Long seccionMateriaId,
                                                           @Param("fecha") LocalDate fecha);

    @EntityGraph(attributePaths = {
            "seccionMateria",
            "seccionMateria.seccion",
            "seccionMateria.materia",
            "empleado"
    })
    @Query("""
        select a
        from AsignacionDocenteMateria a
        where a.empleado.id = :empleadoId
          and a.vigenciaDesde <= :fecha
          and (a.vigenciaHasta is null or a.vigenciaHasta >= :fecha)
    """)
    List<AsignacionDocenteMateria> findVigentesByEmpleado(@Param("empleadoId") Long empleadoId,
                                                          @Param("fecha") LocalDate fecha);
}
