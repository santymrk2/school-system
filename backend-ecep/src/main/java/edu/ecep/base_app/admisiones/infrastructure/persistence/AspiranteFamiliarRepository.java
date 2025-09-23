package edu.ecep.base_app.admisiones.infrastructure.persistence;

import edu.ecep.base_app.admisiones.domain.Aspirante;
import edu.ecep.base_app.admisiones.domain.AspiranteFamiliar;
import edu.ecep.base_app.identidad.domain.Familiar;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AspiranteFamiliarRepository extends JpaRepository<AspiranteFamiliar, Long> {


    boolean existsByAspiranteId(Long id);

    boolean existsByFamiliarId(Long id);

    boolean existsByAspiranteIdAndFamiliarId(Long id, Long id1);
}
