package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Comunicado;
import edu.ecep.base_app.domain.Seccion;
import edu.ecep.base_app.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ComunicadoRepository extends JpaRepository<Comunicado, Long> {
}
