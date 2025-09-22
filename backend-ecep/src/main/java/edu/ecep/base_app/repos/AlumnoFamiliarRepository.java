package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Alumno;
import edu.ecep.base_app.domain.AlumnoFamiliar;
import edu.ecep.base_app.domain.Familiar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface AlumnoFamiliarRepository extends JpaRepository<AlumnoFamiliar, Long> {
    boolean existsByAlumnoIdAndFamiliarId(Long alumnoId, Long familiarId);
    boolean existsByFamiliarId(Long id);
    boolean existsByAlumnoId(Long id);

    @Query("""
         select distinct alumno
         from AlumnoFamiliar af
         join af.alumno alumno
         join fetch alumno.persona
         where af.familiar.id = :familiarId
         """)
    List<Alumno> findAlumnosByFamiliar(@Param("familiarId") Long familiarId);
}
