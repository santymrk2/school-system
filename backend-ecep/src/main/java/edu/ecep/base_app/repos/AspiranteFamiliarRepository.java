package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Aspirante;
import edu.ecep.base_app.domain.AspiranteFamiliar;
import edu.ecep.base_app.domain.Familiar;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AspiranteFamiliarRepository extends JpaRepository<AspiranteFamiliar, Long> {


    boolean existsByAspiranteId(Long id);

    boolean existsByFamiliarId(Long id);

    boolean existsByAspiranteIdAndFamiliarId(Long id, Long id1);
}
