package edu.ecep.base_app.vidaescolar.infrastructure.persistence;

import edu.ecep.base_app.vidaescolar.domain.Matricula;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    boolean existsByAlumnoIdAndPeriodoEscolarId(Long alumnoId, Long periodoEscolarId);
    boolean existsByAlumnoId(Long id);
    Optional<Matricula> findByAlumnoIdAndPeriodoEscolarId(Long alumnoId, Long periodoEscolarId);

    List<Matricula> findByAlumnoId(@Param("alumnoId") Long alumnoId);

    @EntityGraph(attributePaths = "periodoEscolar")
    @org.springframework.data.jpa.repository.Query("""
            select m
            from Matricula m
            where m.alumno.id = :alumnoId
            """)
    List<Matricula> findByAlumnoIdWithPeriodo(@Param("alumnoId") Long alumnoId);
}
