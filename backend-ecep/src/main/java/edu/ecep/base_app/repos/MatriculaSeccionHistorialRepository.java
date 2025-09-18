package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.MatriculaSeccionHistorial;
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
}
