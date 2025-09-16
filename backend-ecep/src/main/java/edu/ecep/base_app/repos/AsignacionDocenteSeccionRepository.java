package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.AsignacionDocenteSeccion;
import edu.ecep.base_app.domain.Seccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;


public interface AsignacionDocenteSeccionRepository extends JpaRepository<AsignacionDocenteSeccion, Long> {
    boolean existsByEmpleadoId(Long empleadoId);

    List<AsignacionDocenteSeccion> findByEmpleado_Id(Long empleadoId);
    @Query("""
      select (count(a) > 0) from AsignacionDocenteSeccion a
      where a.seccion.id = :seccionId and a.rol = edu.ecep.base_app.domain.enums.RolSeccion.MAESTRO_TITULAR
        and a.vigenciaDesde <= :hasta
        and (a.vigenciaHasta is null or a.vigenciaHasta >= :desde)
        and (:excludeId is null or a.id <> :excludeId)
    """)
    boolean hasTitularOverlap(@Param("seccionId") Long seccionId,
                              @Param("desde") LocalDate desde,
                              @Param("hasta") LocalDate hasta,
                              @Param("excludeId") Long excludeId);
    @Query("""
        select a
        from AsignacionDocenteSeccion a
        where a.empleado.id = :empleadoId
          and a.vigenciaDesde <= :fecha
          and (a.vigenciaHasta is null or a.vigenciaHasta >= :fecha)
    """)
    List<AsignacionDocenteSeccion> findVigentesByEmpleado(@Param("empleadoId") Long empleadoId,
                                                          @Param("fecha") LocalDate fecha);

    @Query("""
           select a.seccion
           from AsignacionDocenteSeccion a
           where a.empleado.id = :empleadoId
             and a.vigenciaDesde <= :fecha
             and (a.vigenciaHasta is null or a.vigenciaHasta >= :fecha)
           order by a.seccion.nivel, a.seccion.gradoSala, a.seccion.division
           """)
    List<Seccion> findSeccionesVigentesByEmpleado(@Param("empleadoId") Long empleadoId,
                                                  @Param("fecha") LocalDate fecha);
}

