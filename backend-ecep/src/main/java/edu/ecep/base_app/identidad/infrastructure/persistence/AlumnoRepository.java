package edu.ecep.base_app.identidad.infrastructure.persistence;

import edu.ecep.base_app.identidad.domain.Alumno;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    boolean existsByPersonaId(Long id);

    @EntityGraph(attributePaths = "persona")
    Optional<Alumno> findByPersonaId(Long personaId);

    @EntityGraph(attributePaths = "persona")
    List<Alumno> findAllBy(Sort sort);

    @EntityGraph(attributePaths = "persona")
    Optional<Alumno> findWithPersonaById(Long id);

    @EntityGraph(attributePaths = "persona")
    @Query("""
            select a
            from Alumno a
            join a.persona p
            where (
                    :search is null
                    or lower(p.nombre) like :search
                    or lower(p.apellido) like :search
                    or lower(p.dni) like :search
            )
              and exists (
                    select 1
                    from Matricula m
                    join m.periodoEscolar pe
                    where m.alumno = a
                      and m.activo = true
                      and pe.activo = true
                      and pe.id in :periodoIds
                      and exists (
                            select 1
                            from MatriculaSeccionHistorial msh
                            join msh.seccion s
                            where msh.matricula = m
                              and msh.activo = true
                              and s.activo = true
                              and msh.desde <= :fecha
                              and (msh.hasta is null or msh.hasta >= :fecha)
                              and (:seccionId is null or s.id = :seccionId)
                      )
            )
            """)
    Page<Alumno> searchPaged(
            @Param("search") String search,
            @Param("seccionId") Long seccionId,
            @Param("fecha") LocalDate fecha,
            @Param("periodoIds") List<Long> periodoIds,
            Pageable pageable);
}
