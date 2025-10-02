package edu.ecep.base_app.comunicacion.infrastructure.persistence;

import edu.ecep.base_app.comunicacion.domain.ComunicadoLectura;
import edu.ecep.base_app.comunicacion.domain.enums.EstadoLecturaComunicado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ComunicadoLecturaRepository extends JpaRepository<ComunicadoLectura, Long> {

    Optional<ComunicadoLectura> findTopByComunicadoIdAndPersonaIdAndActivoTrueOrderByFechaLecturaDesc(Long comunicadoId, Long personaId);

    @Query("""
            select l.estado as estado, count(l) as total
            from ComunicadoLectura l
            where l.comunicado.id = :comunicadoId
              and l.activo = true
            group by l.estado
            """)
    List<LecturaEstadoCount> countByEstado(@Param("comunicadoId") Long comunicadoId);

    @Query("""
            select max(l.fechaLectura)
            from ComunicadoLectura l
            where l.comunicado.id = :comunicadoId
              and l.estado = :estado
              and l.activo = true
            """)
    OffsetDateTime findUltimaLectura(@Param("comunicadoId") Long comunicadoId,
                                     @Param("estado") EstadoLecturaComunicado estado);

    interface LecturaEstadoCount {
        EstadoLecturaComunicado getEstado();
        long getTotal();
    }
}
