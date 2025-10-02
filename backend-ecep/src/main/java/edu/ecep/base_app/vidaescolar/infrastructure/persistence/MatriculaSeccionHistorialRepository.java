package edu.ecep.base_app.vidaescolar.infrastructure.persistence;

import edu.ecep.base_app.vidaescolar.domain.MatriculaSeccionHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import edu.ecep.base_app.shared.domain.enums.NivelAcademico;

public interface MatriculaSeccionHistorialRepository extends JpaRepository<MatriculaSeccionHistorial, Long> {
    boolean existsBySeccionId(Long seccionId);

    @Query("""
        select h from MatriculaSeccionHistorial h
        join fetch h.seccion s
        where h.matricula.id = :matriculaId
          and h.desde <= :fecha
          and (h.hasta is null or h.hasta >= :fecha)
    """)
    List<MatriculaSeccionHistorial> findVigente(@Param("matriculaId") Long matriculaId,
                                                @Param("fecha") java.time.LocalDate fecha);
    List<MatriculaSeccionHistorial> findByMatriculaIdOrderByDesdeDesc(Long matriculaId);

    @Query("""
         select msh 
         from MatriculaSeccionHistorial msh
         join fetch msh.seccion s
         where s.id = :seccionId
           and msh.desde <= :fecha
           and (msh.hasta is null or msh.hasta >= :fecha)
         """)
    List<MatriculaSeccionHistorial> findActivosBySeccionOnDate(@Param("seccionId") Long seccionId,
                                                               @Param("fecha") LocalDate fecha);

    @Query("""
            select distinct m.alumno.id
            from MatriculaSeccionHistorial msh
            join msh.matricula m
            join m.alumno a
            join a.persona persona
            join msh.seccion s
            where s.id = :seccionId
              and msh.desde <= :fecha
              and (msh.hasta is null or msh.hasta >= :fecha)
              and msh.activo = true
              and m.activo = true
              and s.activo = true
              and persona.activo = true
            """)
    Set<Long> findAlumnoIdsBySeccionOnDate(@Param("seccionId") Long seccionId,
                                           @Param("fecha") LocalDate fecha);

    @Query("""
            select distinct m.alumno.id
            from MatriculaSeccionHistorial msh
            join msh.matricula m
            join m.alumno a
            join a.persona persona
            join msh.seccion s
            where s.nivel = :nivel
              and msh.desde <= :fecha
              and (msh.hasta is null or msh.hasta >= :fecha)
              and msh.activo = true
              and m.activo = true
              and s.activo = true
              and persona.activo = true
            """)
    Set<Long> findAlumnoIdsByNivelOnDate(@Param("nivel") NivelAcademico nivel,
                                         @Param("fecha") LocalDate fecha);
}
