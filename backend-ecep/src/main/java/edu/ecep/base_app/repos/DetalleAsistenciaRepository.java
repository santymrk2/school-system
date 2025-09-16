package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.DetalleAsistencia;
import edu.ecep.base_app.dtos.asistencia.AsistenciaAcumuladoDTO;
import edu.ecep.base_app.dtos.asistencia.AsistenciaAlumnoResumenDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DetalleAsistenciaRepository extends JpaRepository<DetalleAsistencia, Long> {
    boolean existsByJornadaIdAndMatriculaId(Long jornadaId, Long matriculaId);

    List<DetalleAsistencia> findByJornadaId(Long jornadaId);

    @Query("SELECT d FROM DetalleAsistencia d " +
            "WHERE d.matricula.id = :matriculaId " +
            "AND d.jornada.fecha BETWEEN :from AND :to")
    List<DetalleAsistencia> findByMatriculaInRange(@Param("matriculaId") Long matriculaId,
                                                   @Param("from") LocalDate from,
                                                   @Param("to") LocalDate to);

    List<DetalleAsistencia> findByMatriculaIdAndJornada_FechaBetween(Long matriculaId, LocalDate from, LocalDate to);

    @Query("""
        select new edu.ecep.base_app.dtos.asistencia.AsistenciaAcumuladoDTO(
            sum(case when d.estado = edu.ecep.base_app.domain.enums.EstadoAsistencia.PRESENTE then 1 else 0 end),
            sum(case when d.estado = edu.ecep.base_app.domain.enums.EstadoAsistencia.AUSENTE then 1 else 0 end),
            sum(case when d.estado = edu.ecep.base_app.domain.enums.EstadoAsistencia.TARDE then 1 else 0 end),
            sum(case when d.estado = edu.ecep.base_app.domain.enums.EstadoAsistencia.RETIRO_ANTICIPADO then 1 else 0 end),
            count(d.id)
        )
        from DetalleAsistencia d
             join d.jornada j
        where j.seccion.id = :seccionId
          and j.fecha between :from and :to
    """)
    AsistenciaAcumuladoDTO acumuladoSeccion(@Param("seccionId") Long seccionId,
                                            @Param("from") LocalDate from,
                                            @Param("to") LocalDate to);

    @Query("""
    select new edu.ecep.base_app.dtos.asistencia.AsistenciaAlumnoResumenDTO(
        m.id,
        a.id,
        p.apellido,
        p.nombre,
        sum(case when d.estado = edu.ecep.base_app.domain.enums.EstadoAsistencia.PRESENTE then 1 else 0 end),
        sum(case when d.estado = edu.ecep.base_app.domain.enums.EstadoAsistencia.AUSENTE then 1 else 0 end),
        sum(case when d.estado = edu.ecep.base_app.domain.enums.EstadoAsistencia.TARDE then 1 else 0 end),
        sum(case when d.estado = edu.ecep.base_app.domain.enums.EstadoAsistencia.RETIRO_ANTICIPADO then 1 else 0 end),
        count(d.id)
    )
    from DetalleAsistencia d
      join d.matricula m
      join m.alumno a
      join a.persona p
      join d.jornada j
    where j.seccion.id = :seccionId
      and j.fecha between :from and :to
    group by m.id, a.id, p.nombre, p.apellido
    order by p.apellido, p.nombre
  """)
    List<AsistenciaAlumnoResumenDTO> resumenPorAlumno(
            @Param("seccionId") Long seccionId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );}
