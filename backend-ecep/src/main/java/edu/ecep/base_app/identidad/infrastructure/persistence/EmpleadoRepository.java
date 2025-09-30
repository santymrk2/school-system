package edu.ecep.base_app.identidad.infrastructure.persistence;

import edu.ecep.base_app.identidad.domain.Empleado;
import edu.ecep.base_app.identidad.domain.enums.RolEmpleado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByPersonaId(Long personaId);
    boolean existsByPersonaId(Long id);
    Optional<Empleado> findByLegajoIgnoreCase(String legajo);
    Optional<Empleado> findByCuil(String cuil);
    List<Empleado> findByRolEmpleado(RolEmpleado rolEmpleado);

    @Query("""
        select e
        from Empleado e
        join e.persona p
        where (:search is null or :search = '' or (
            lower(coalesce(p.nombre, '')) like lower(concat('%', :search, '%')) or
            lower(coalesce(p.apellido, '')) like lower(concat('%', :search, '%')) or
            lower(concat(coalesce(p.apellido, ''), ' ', coalesce(p.nombre, ''))) like lower(concat('%', :search, '%')) or
            lower(coalesce(p.dni, '')) like lower(concat('%', :search, '%')) or
            lower(coalesce(p.email, '')) like lower(concat('%', :search, '%')) or
            lower(coalesce(e.cuil, '')) like lower(concat('%', :search, '%')) or
            lower(coalesce(e.legajo, '')) like lower(concat('%', :search, '%')) or
            lower(coalesce(e.cargo, '')) like lower(concat('%', :search, '%')) or
            lower(coalesce(e.condicionLaboral, '')) like lower(concat('%', :search, '%')) or
            lower(coalesce(e.situacionActual, '')) like lower(concat('%', :search, '%'))
        ))
          and (:rol is null or e.rolEmpleado = :rol)
    """)
    Page<Empleado> search(@Param("search") String search,
                          @Param("rol") RolEmpleado rolEmpleado,
                          Pageable pageable);
}
