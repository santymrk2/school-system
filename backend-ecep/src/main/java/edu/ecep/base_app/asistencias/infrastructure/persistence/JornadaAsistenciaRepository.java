package edu.ecep.base_app.asistencias.infrastructure.persistence;

import edu.ecep.base_app.asistencias.domain.JornadaAsistencia;
import edu.ecep.base_app.asistencias.presentation.dto.AsistenciaDiaDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JornadaAsistenciaRepository extends JpaRepository<JornadaAsistencia, Long> {
    boolean existsBySeccionIdAndFecha(Long seccionId, LocalDate fecha);
    Optional<JornadaAsistencia> findBySeccionIdAndFecha(Long seccionId, LocalDate fecha);

    List<JornadaAsistencia> findBySeccionIdAndFechaBetween(Long seccionId, LocalDate from, LocalDate to);
    List<JornadaAsistencia> findBySeccionId(Long seccionId);

    @Query("SELECT j FROM JornadaAsistencia j WHERE j.trimestre.id = :trimestreId")
    List<JornadaAsistencia> findByTrimestreId(@Param("trimestreId") Long trimestreId);

    @Query("""
        select new edu.ecep.base_app.asistencias.presentation.dto.AsistenciaDiaDTO(
            j.fecha,
            sum(case when d.estado = edu.ecep.base_app.asistencias.domain.enums.EstadoAsistencia.PRESENTE then 1 else 0 end),
            sum(case when d.estado = edu.ecep.base_app.asistencias.domain.enums.EstadoAsistencia.AUSENTE then 1 else 0 end),
            sum(case when d.estado = edu.ecep.base_app.asistencias.domain.enums.EstadoAsistencia.TARDE then 1 else 0 end),
            sum(case when d.estado = edu.ecep.base_app.asistencias.domain.enums.EstadoAsistencia.RETIRO_ANTICIPADO then 1 else 0 end),
            count(d.id)
        )
        from JornadaAsistencia j
             left join DetalleAsistencia d on d.jornada.id = j.id
        where j.seccion.id = :seccionId
          and j.fecha between :from and :to
        group by j.fecha
        order by j.fecha desc
    """)
    List<AsistenciaDiaDTO> resumenDiario(@Param("seccionId") Long seccionId,
                                         @Param("from") LocalDate from,
                                         @Param("to") LocalDate to);
}
