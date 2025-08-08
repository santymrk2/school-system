package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Aspirante;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AspiranteRepository extends JpaRepository<Aspirante, Long> {
    boolean existsByUsuarioId(Long id);

    boolean existsByDni(String dni);
}
