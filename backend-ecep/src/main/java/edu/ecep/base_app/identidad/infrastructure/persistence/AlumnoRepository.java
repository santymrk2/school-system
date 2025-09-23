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
            select distinct a
            from Alumno a
            join a.persona p
            left join a.matriculas m with m.activo = true
            left join MatriculaSeccionHistorial msh
                on msh.matricula = m
                and msh.activo = true
                and msh.desde <= :fecha
                and (msh.hasta is null or msh.hasta >= :fecha)
            where (:seccionId is null or msh.seccion.id = :seccionId)
              and (
                    :search is null
                    or lower(p.nombre) like :search
                    or lower(p.apellido) like :search
                    or lower(p.dni) like :search
              )
            order by lower(coalesce(p.apellido, '')),
                     lower(coalesce(p.nombre, '')),
                     a.id
            """)
    Page<Alumno> searchPaged(
            @Param("search") String search,
            @Param("seccionId") Long seccionId,
            @Param("fecha") LocalDate fecha,
            Pageable pageable);
}
