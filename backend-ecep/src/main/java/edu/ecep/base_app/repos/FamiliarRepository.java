package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Familiar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface FamiliarRepository extends JpaRepository<Familiar, Long> {

    List<Familiar> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String n, String a);

    boolean existsByUsuarioId(Long id);
}
