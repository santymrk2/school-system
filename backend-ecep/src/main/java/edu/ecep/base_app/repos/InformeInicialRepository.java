package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Alumno;
import edu.ecep.base_app.domain.InformeInicial;
import edu.ecep.base_app.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;


public interface InformeInicialRepository extends JpaRepository<InformeInicial, Long> {
}
