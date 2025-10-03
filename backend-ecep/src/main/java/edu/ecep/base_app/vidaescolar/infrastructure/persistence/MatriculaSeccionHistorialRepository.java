package edu.ecep.base_app.vidaescolar.infrastructure.persistence;

import edu.ecep.base_app.shared.domain.enums.NivelAcademico;
import edu.ecep.base_app.vidaescolar.domain.MatriculaSeccionHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MatriculaSeccionHistorialRepository extends JpaRepository<MatriculaSeccionHistorial, Long> {
    boolean existsBySeccionId(Long seccionId);

    @Query("""
        select h from MatriculaSeccionHistorial h
        join fetch h.seccion s
        left join fetch s.periodoEscolar
        where h.matricula.id = :matriculaId
          and h.activo = true
          and h.matricula.activo = true
          and s.activo = true
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
            select h
            from MatriculaSeccionHistorial h
            join fetch h.matricula m
            join fetch m.alumno a
            join fetch a.persona p
            join fetch h.seccion s
            where h.activo = true
              and m.activo = true
              and s.nivel = :nivel
              and s.gradoSala = :gradoSala
              and h.hasta is not null
            """)
    List<MatriculaSeccionHistorial> findByNivelAndGradoFinalizados(
            @Param("nivel") NivelAcademico nivel,
            @Param("gradoSala") String gradoSala);
}
