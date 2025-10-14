package edu.ecep.base_app.identidad.infrastructure.persistence;

import edu.ecep.base_app.identidad.domain.Licencia;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LicenciaRepository extends JpaRepository<Licencia, Long> {
    boolean existsByEmpleadoId(Long id);

    @EntityGraph(attributePaths = {"empleado", "empleado.persona"})
    @Query("select l from Licencia l")
    List<Licencia> findAllWithEmpleado();

    @EntityGraph(attributePaths = {"empleado", "empleado.persona"})
    List<Licencia> findByEmpleadoId(Long empleadoId);
}
