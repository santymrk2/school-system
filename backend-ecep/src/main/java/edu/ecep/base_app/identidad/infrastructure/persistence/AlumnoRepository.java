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
              and (
                    :seccionId is null
                    or exists (
                        select 1
                        from MatriculaSeccionHistorial msh
                        where msh.matricula.alumno = a
                          and msh.matricula.activo = true
                          and msh.activo = true
                          and msh.desde <= :fecha
                          and (msh.hasta is null or msh.hasta >= :fecha)
                          and msh.seccion.id = :seccionId
                    )
            )
            """)
    Page<Alumno> searchPaged(
            @Param("search") String search,
            @Param("seccionId") Long seccionId,
            @Param("fecha") LocalDate fecha,
            Pageable pageable);
}
